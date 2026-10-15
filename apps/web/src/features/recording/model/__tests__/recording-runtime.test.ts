/**
 * `RecordingRuntime` × `RecordingController` × Mock 번들 — Stage 4 `S4-E` 통합 (S4-D 포트 연결).
 *
 * 경로: Controller → (sink = LocalRecordingStore, transitions = SessionOutbox) → Mock API · 메모리 저장소.
 * 증거: 저장소 **파일 수** · 업로드 큐 **항목 수** · Mock 요청 로그.
 */
import { describe, expect, it } from 'vitest';

import {
  seedCrashedRecording,
  seedStaleRecording,
  MOCK_CRASH_CHUNKS,
} from '../../../../mocks/fixtures/local-recordings';
import { createMockRecorderAdapter } from '../../../../mocks/platform/MockRecorderAdapter';
import { createConsentGate } from '../consent-gate';
import {
  LOCAL_RECORDING_NOTICE_MS,
  LOCAL_RECORDING_RETENTION_MS,
  type LocalRetentionEvent,
} from '../local-retention';
import { createPermissionService } from '../permission-service';
import { createRecordingController } from '../recording-controller';

import { CONSENTED, PLAN_SUCCESS, TEST_REMINDER_SECONDS, flush } from './controller-support';
import {
  COMPLETE_OP,
  DAY_MS,
  INIT_OP,
  TRANSITION_OP,
  createRuntimeHarness,
  type RuntimeHarnessOptions,
} from './runtime-support';

async function withController(options: RuntimeHarnessOptions = {}) {
  const h = createRuntimeHarness(options);
  const sessionId = await h.serverSessionReady();
  const recorder = createMockRecorderAdapter({
    plan: PLAN_SUCCESS,
    clock: h.scheduler,
    scheduler: h.scheduler,
  });
  const { sink, transitions } = h.runtime.portsFor(sessionId);
  const controller = createRecordingController({
    sessionId,
    mode: 'recorded',
    recorder,
    permissions: createPermissionService(recorder),
    consentGate: createConsentGate(() => CONSENTED),
    transitions,
    sink,
    clock: h.scheduler,
    scheduler: h.scheduler,
    readyReminderAfterSeconds: TEST_REMINDER_SECONDS,
  });
  /** 녹음 `seconds` 초 (Mock 녹음기는 1초에 청크 1개). */
  const recordFor = async (seconds: number) => {
    for (let index = 0; index < seconds; index += 1) {
      h.scheduler.advance(1000);
      await flush();
    }
  };
  const files = () => h.runtime.store.countChunkFiles(sessionId);
  const queued = async () => (await h.runtime.queue.list()).length;
  return { ...h, sessionId, controller, recordFor, files, queued };
}

describe('Submit → 업로드 → 확정 후 로컬 삭제 (Controller 경로)', () => {
  it('start → 5초 → submit: 전이 recording·completed, 업로드 확정, 파일 0', async () => {
    const t = await withController();
    await t.controller.start();
    await t.recordFor(5);
    const outcome = await t.controller.submit();
    expect(outcome.ok).toBe(true);

    // Submit 직후: 로컬 completed + 큐 적재 (업로드는 기다리지 않는다)
    expect((await t.runtime.store.get(t.sessionId))?.state).toBe('completed');
    await t.runtime.queue.drain();

    expect(t.transitionTargets()).toStrictEqual(['recording', 'completed']);
    expect(t.count(INIT_OP)).toBe(1);
    expect(t.count(COMPLETE_OP)).toBe(1);
    expect(await t.files()).toBe(0);
    expect(await t.queued()).toBe(0);
    const detail = await t.mock.clients.sessions.getDetail({ sessionId: t.sessionId });
    expect(detail.status).toBe('analyzing');
  });
});

describe('AC-4-113 ②③⑤ (저장소·Outbox 로직) — Discard 는 서버 확정 뒤에만 로컬을 지운다', () => {
  it('② 온라인: 폐기 전 파일>0 · 큐 0 → 확정 후 파일 0 · 큐 0 (2시점)', async () => {
    const t = await withController();
    await t.controller.start();
    await t.recordFor(3);

    const before = { files: await t.files(), queued: await t.queued() };
    const outcome = await t.controller.discard();
    await flush();
    const after = { files: await t.files(), queued: await t.queued() };

    expect(outcome).toMatchObject({ ok: true });
    expect(before.files).toBeGreaterThan(0);
    expect(after).toStrictEqual({ files: 0, queued: 0 });
    expect(t.transitionTargets()).toStrictEqual(['recording', 'abandoned']);
    expect(t.count(INIT_OP)).toBe(0); // 서버 업로드 없음
  });

  it('⑤ 오프라인: 폐기 전이가 outbox 에 적재되고 로컬은 보존 → online 확정 후에 삭제', async () => {
    const t = await withController();
    t.runtime.outbox.start();
    await t.controller.start();
    await t.recordFor(3);
    t.appState.setConnectivity('offline');

    const outcome = await t.controller.discard();
    expect(outcome).toMatchObject({ ok: true, result: null });
    const filesWhileQueued = await t.files();
    expect(filesWhileQueued).toBeGreaterThan(0); // ③ 확정 전 — 보존
    expect((await t.runtime.outbox.pending(t.sessionId)).map((e) => e.request.to)).toStrictEqual([
      'abandoned',
    ]);

    t.appState.setConnectivity('online');
    await t.runtime.outbox.flush();
    await flush();
    expect(await t.files()).toBe(0);
    expect(t.transitionTargets()).toStrictEqual(['recording', 'abandoned']);
  });

  it('③ 서버가 폐기를 거절하면 로컬을 그대로 둔다', async () => {
    const t = await withController({
      bundle: { errorCodes: { 'sessions.transition': 'VALIDATION_FAILED' } },
    });
    await t.controller.start(); // 이 시점은 success
    await t.recordFor(2);
    const filesBefore = await t.files();
    // 이후 전이만 실패시킨다 — 메서드 단위 override 를 런타임에 바꿀 수 없으므로 서버 상태로 거절을 만든다:
    // 이미 폐기된 세션에 다시 폐기를 보내면 SESSION_INVALID_TRANSITION 이다.
    await t.mock.clients.sessions.transition(
      { sessionId: t.sessionId, body: { to: 'abandoned', occurredAt: t.scheduler.nowIso() } },
      { idempotencyKey: 'ik-server-side' },
    );
    const outcome = await t.controller.discard();
    await flush();

    expect(outcome).toMatchObject({ ok: true, result: null });
    // 지우지 않았다 — 캡처 종료 조각까지 더해져 오히려 늘었다
    expect(await t.files()).toBeGreaterThanOrEqual(filesBefore);
    expect(await t.runtime.store.get(t.sessionId)).not.toBeNull();
  });
});

describe('AC-4-66 — 오프라인 녹음: 전이가 outbox 에 적재되고 online 에서 순서대로 재전송', () => {
  it('start · pause · resume · submit 을 끊긴 채로 → 요청 0 → online → 순서 그대로 + 업로드', async () => {
    const t = await withController({ connectivity: 'offline' });
    t.runtime.outbox.start();
    t.runtime.queue.start();
    await t.controller.start();
    await t.recordFor(2);
    await t.controller.pause();
    await t.controller.resume();
    await t.recordFor(2);
    await t.controller.submit();
    await flush();

    expect(t.transitionTargets()).toStrictEqual([]);
    expect(t.count(INIT_OP)).toBe(0);
    expect((await t.runtime.outbox.pending()).map((e) => e.request.to)).toStrictEqual([
      'recording',
      'paused',
      'recording',
      'completed',
    ]);
    expect(await t.files()).toBeGreaterThan(0);
    expect(await t.runtime.queue.statusOf(t.sessionId)).toBe('queued');

    t.appState.setConnectivity('online');
    await t.runtime.outbox.flush();
    await t.runtime.queue.drain();

    expect(t.transitionTargets()).toStrictEqual(['recording', 'paused', 'recording', 'completed']);
    expect(t.count(COMPLETE_OP)).toBe(1);
    expect(await t.files()).toBe(0);
  });
});

describe('AC-4-65 (로직) — 크래시 복구: 미완료 로컬 녹음 → completed(recovered_after_crash) → 업로드', () => {
  it('start() 가 찾아서 디코드로 판정하고(M-6) 전이·업로드까지 보낸다', async () => {
    const h = createRuntimeHarness();
    const sessionId = await h.serverSession();
    await seedCrashedRecording(h.runtime.store, sessionId, h.scheduler);
    expect(await h.runtime.store.listUnfinished()).toHaveLength(1);

    const report = await h.runtime.start();
    await h.runtime.outbox.flush();
    await h.runtime.queue.drain();

    expect(report.recovered).toHaveLength(1);
    expect(report.recovered[0]).toMatchObject({
      sessionId,
      recordedSeconds: MOCK_CRASH_CHUNKS,
      parts: [{ partNo: 1, chunkCount: MOCK_CRASH_CHUNKS, decodable: true }],
      transition: { to: 'completed', completedReason: 'recovered_after_crash' },
    });
    const sent = h.mock.requestLog.entries().filter((entry) => entry.operation === TRANSITION_OP);
    // 첫 건은 서버 준비(recording), 복구가 보낸 것은 마지막 1건
    expect(sent).toHaveLength(2);
    expect(sent.at(-1)?.payload).toMatchObject({
      to: 'completed',
      completedReason: 'recovered_after_crash',
      recordedSeconds: MOCK_CRASH_CHUNKS,
    });
    expect(h.count(COMPLETE_OP)).toBe(1);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(0);
  });

  it('M-4 — 첫 청크 원본을 잃어도 헤더 복제본 덕에 디코드된다', async () => {
    const h = createRuntimeHarness();
    const sessionId = await h.serverSession();
    await seedCrashedRecording(h.runtime.store, sessionId, h.scheduler);
    h.storage.controls.removeFile({ sessionId, partNo: 1, seq: 1, slot: 'primary' });

    const report = await h.runtime.start();
    expect(report.recovered[0]?.parts[0]?.decodable).toBe(true);
  });

  it('M-4 · M-6 — 헤더가 둘 다 없으면 디코드 실패로 판정하되, 복구 단계는 지우지 않는다', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const sessionId = await h.serverSession();
    await seedCrashedRecording(h.runtime.store, sessionId, h.scheduler);
    h.storage.controls.removeFile({ sessionId, partNo: 1, seq: 1, slot: 'primary' });
    h.storage.controls.removeFile({ sessionId, partNo: 1, seq: 1, slot: 'header_copy' });

    const report = await h.runtime.start();
    expect(report.recovered[0]?.parts[0]).toMatchObject({ decodable: false, decodedSeconds: null });
    // 디코드 길이가 없으면 색인의 청크 수 × 1초 (D4-28) — 녹음된 시간은 8초였다
    expect(report.recovered[0]?.recordedSeconds).toBe(MOCK_CRASH_CHUNKS);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(MOCK_CRASH_CHUNKS - 1);
  });

  it('M-5 — 잘린 마지막 청크도 복구 바이트에 들어간다', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const sessionId = await h.serverSession();
    await seedCrashedRecording(h.runtime.store, sessionId, h.scheduler);
    h.storage.controls.truncate(
      { sessionId, partNo: 1, seq: MOCK_CRASH_CHUNKS, slot: 'primary' },
      64,
    );

    const report = await h.runtime.start();
    expect(report.recovered[0]?.parts[0]?.byteLength).toBe((MOCK_CRASH_CHUNKS - 1) * 256 + 64);
  });

  it('이 탭에서 녹음 중인 세션은 복구하지 않는다', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const sessionId = await h.serverSession();
    await seedCrashedRecording(h.runtime.store, sessionId, h.scheduler);
    const report = await h.runtime.start({ activeSessionIds: new Set([sessionId]) });
    expect(report.recovered).toStrictEqual([]);
  });
});

describe('D4-29 — 보관 상한 7일 안내 · 14일 삭제', () => {
  it('local-retention-exceeded seed — start() 에서 로컬 삭제 + 이벤트', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const events: LocalRetentionEvent[] = [];
    h.runtime.retention.onEvent((event) => events.push(event));
    const sessionId = await h.serverSession();
    await seedStaleRecording(h.runtime.store, sessionId, h.scheduler);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBeGreaterThan(0);

    const report = await h.runtime.start();

    expect(report.retention.expired).toStrictEqual([sessionId]);
    expect(events).toStrictEqual([{ type: 'retention_expired', sessionId }]);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(0);
    expect(await h.runtime.queue.list()).toStrictEqual([]);
  });

  it('경계 양쪽 — 7일 −1ms 안내 없음 · 7일 안내 1회 · 14일 −1ms 보존 · 14일 삭제 (예약된 깨어남으로)', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const events: LocalRetentionEvent[] = [];
    h.runtime.retention.onEvent((event) => events.push(event));
    const sessionId = await h.serverSession();
    await h.recordLocally(sessionId, 3);
    await h.submit(sessionId).catch(() => null);
    const createdAt = (await h.runtime.store.get(sessionId))?.createdAtMs ?? 0;
    await h.runtime.start();
    const settle = async () => {
      await h.runtime.retention.sweep();
    };

    h.scheduler.advance(createdAt + LOCAL_RECORDING_NOTICE_MS - 1 - h.scheduler.now());
    await settle();
    expect(events).toStrictEqual([]);

    h.scheduler.advance(1);
    await settle();
    expect(events).toStrictEqual([
      {
        type: 'retention_notice',
        sessionId,
        deleteAtMs: createdAt + LOCAL_RECORDING_RETENTION_MS,
      },
    ]);
    expect((await h.runtime.store.get(sessionId))?.retentionNoticeAtMs).toBe(h.scheduler.now());

    h.scheduler.advance(3 * DAY_MS);
    await settle();
    expect(events).toHaveLength(1); // 안내는 1회

    h.scheduler.advance(createdAt + LOCAL_RECORDING_RETENTION_MS - 1 - h.scheduler.now());
    await settle();
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBeGreaterThan(0);

    h.scheduler.advance(1);
    await settle();
    expect(events.at(-1)).toStrictEqual({ type: 'retention_expired', sessionId });
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(0);
    expect(await h.runtime.queue.list()).toStrictEqual([]); // 큐 항목도 정리
  });
});

describe('AC-4-72 — 로그아웃 정리: 로컬 녹음 · 업로드 큐 · 미전송 전이 전부', () => {
  it('clearAll 후 저장소 파일 0 · 모든 이름 공간 0', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const sessionId = await h.serverSession();
    await h.recordLocally(sessionId, 4);
    await h.submit(sessionId).catch(() => null);
    expect(await h.runtime.store.countChunkFiles()).toBeGreaterThan(0);
    expect(await h.runtime.queue.list()).toHaveLength(1);
    expect(await h.runtime.outbox.pending()).toHaveLength(1);

    await h.runtime.clearAll();

    expect(await h.runtime.store.countChunkFiles()).toBe(0);
    for (const namespace of ['recordings', 'chunks', 'outbox', 'uploads'] as const) {
      expect(h.storage.controls.keys(namespace)).toStrictEqual([]);
    }
  });
});

describe('dispose', () => {
  it('outbox · 큐 · 보관 감시가 신호 구독과 예약을 놓는다', async () => {
    const h = createRuntimeHarness();
    await h.runtime.start();
    expect(h.appState.listenerCount()).toBeGreaterThan(0);
    h.runtime.dispose();
    expect(h.appState.listenerCount()).toBe(0);
  });
});
