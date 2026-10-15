/**
 * `UploadQueue` × 실제 Mock 번들 (`MockRecordingApi` · `MockUploadTransport`) — Stage 4 `S4-E`.
 *
 * AC-4-26 · 27 · 28 · 29 · 30 · 31 · 32 · 33 · 67 · 71 의 **큐·저장소 부분**. 증거는 ① Mock 요청 로그
 * ② 저장소에 **실제로 남은 파일 수** ③ 큐 이벤트.
 */
import { describe, expect, it } from 'vitest';

import type { RecordingApi } from '../../../../shared/api';
import {
  createUploadQueue,
  partDurations,
  UPLOAD_BACKOFF_MS,
  type UploadQueueEvent,
} from '../upload-queue';

import {
  COMPLETE_OP,
  HEAD_OP,
  HOUR_MS,
  INIT_OP,
  PATCH_OP,
  REFRESH_OP,
  createRuntimeHarness,
} from './runtime-support';

const RECORDING_OPS = new Set([INIT_OP, REFRESH_OP, COMPLETE_OP, PATCH_OP, HEAD_OP]);

function collect(h: ReturnType<typeof createRuntimeHarness>): UploadQueueEvent[] {
  const events: UploadQueueEvent[] = [];
  h.runtime.queue.onEvent((event) => events.push(event));
  return events;
}

function waitFor(
  h: ReturnType<typeof createRuntimeHarness>,
  type: UploadQueueEvent['type'],
): Promise<UploadQueueEvent> {
  return new Promise((resolve) => {
    const off = h.runtime.queue.onEvent((event) => {
      if (event.type !== type) return;
      off();
      resolve(event);
    });
  });
}

/** 세션 준비 → 로컬 녹음 5청크 → Submit(로컬 완료 + 큐 적재 + 전이). */
async function recordAndSubmit(h: ReturnType<typeof createRuntimeHarness>) {
  const sessionId = await h.serverSession();
  await h.recordLocally(sessionId, 5);
  await h.submit(sessionId).catch(() => null);
  return sessionId;
}

const recordingOps = (h: ReturnType<typeof createRuntimeHarness>) =>
  h.operations().filter((op) => RECORDING_OPS.has(op));

describe('AC-4-26 · AC-4-71 — 업로드 성공, 확정 응답 **뒤에만** 로컬 삭제 (2시점 측정)', () => {
  it('complete 응답 직전 파일 > 0, 직후 = 0 · 세션 analyzing', async () => {
    let filesJustBeforeResponse = -1;
    let sessionId = '';
    let key = 0;
    const h = createRuntimeHarness();
    // 서버가 확정한 뒤 · 큐가 응답을 받기 직전 시점에 저장소를 잰다.
    const inner = h.mock.clients.recordings;
    const measured: RecordingApi = {
      ...inner,
      async complete(request, options) {
        const response = await inner.complete(request, options);
        filesJustBeforeResponse = await h.storage.bytes.countFiles(sessionId);
        return response;
      },
    };
    const queue = createUploadQueue({
      kv: h.storage.kv,
      store: h.runtime.store,
      recordingApi: measured,
      uploadTransport: h.mock.clients.uploadTransport,
      appState: h.appState,
      clock: h.scheduler,
      scheduler: h.scheduler,
      createKey: () => `ik-measured-${String((key += 1))}`,
      hasher: (bytes) => Promise.resolve(String(bytes.byteLength % 10).repeat(64)),
    });
    const events: UploadQueueEvent[] = [];
    queue.onEvent((event) => events.push(event));

    sessionId = await h.serverSession();
    await h.recordLocally(sessionId, 5);
    await h.runtime.store.markCompleted(sessionId, {
      completedReason: 'user_done',
      recordedSeconds: 5,
      completedAtMs: h.scheduler.now(),
    });
    const filesBeforeUpload = await h.runtime.store.countChunkFiles(sessionId);
    await queue.enqueue(sessionId);
    await queue.drain();

    expect(filesBeforeUpload).toBe(6); // 청크 5 + 헤더 복제 1
    expect(filesJustBeforeResponse).toBe(6); // ⭐ 직전 > 0
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(0); // ⭐ 직후 = 0
    expect(await h.runtime.store.get(sessionId)).toBeNull();
    expect(await queue.list()).toStrictEqual([]);
    const uploaded = events.find((event) => event.type === 'uploaded');
    expect(uploaded?.type === 'uploaded' && uploaded.response.uploadStatus).toBe('uploaded');
  });

  it('런타임 Submit 경로 — init → PATCH → complete, 서버 녹음 uploaded, 세션 analyzing', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:recording-upload-success' });
    const sessionId = await recordAndSubmit(h);
    await h.runtime.queue.drain();

    expect(recordingOps(h)).toStrictEqual([INIT_OP, PATCH_OP, COMPLETE_OP]);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(0);
    const detail = await h.mock.clients.sessions.getDetail({ sessionId });
    expect(detail.status).toBe('analyzing');
    // init 이 선언한 part 크기 = 로컬에서 읽은 바이트 (5 × 256)
    const init = h.mock.requestLog.entries().find((entry) => entry.operation === INIT_OP);
    expect(init?.payload).toMatchObject({
      parts: [{ partNo: 1, bytes: 1280, container: 'webm', mimeType: 'audio/webm;codecs=opus' }],
      totalDurationSeconds: 5,
    });
  });

  it('complete 본문의 sha256 은 로컬 바이트의 실제 해시다 (Web Crypto)', async () => {
    const h = createRuntimeHarness();
    await recordAndSubmit(h);
    await h.runtime.queue.drain();
    const complete = h.mock.requestLog.entries().find((entry) => entry.operation === COMPLETE_OP);
    const parts = (complete?.payload as { parts: { sha256: string; durationSeconds: number }[] })
      .parts;
    expect(parts[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(parts[0]?.sha256).not.toBe('a'.repeat(64));
    expect(parts[0]?.durationSeconds).toBe(5);
  });
});

describe('AC-4-27 — 지속 실패 시 로컬 파일이 남는다 (파일 수 측정)', () => {
  it('recording-upload-failure — 시도마다 실패, 파일 6개 그대로, failed_retrying', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:recording-upload-failure' });
    const sessionId = await recordAndSubmit(h);
    await h.runtime.queue.drain();

    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(6);
    const first = await h.runtime.queue.get(sessionId);
    expect(first).toMatchObject({ state: 'failed_retrying', attempts: 1, lastFailure: 'network' });

    // 백오프 후 다시 — 여전히 실패, 여전히 보존
    h.scheduler.advance(UPLOAD_BACKOFF_MS.high[0] ?? 0);
    await h.runtime.queue.drain();
    expect((await h.runtime.queue.get(sessionId))?.attempts).toBe(2);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(6);
    expect(await h.runtime.queue.statusOf(sessionId)).toBe('failed_retrying');
    expect(h.count(COMPLETE_OP)).toBe(0); // 전송이 실패해 확정까지 가지 않는다
  });
});

describe('AC-4-28 — n회 실패 후 성공, part 재전송이 중복 업로드를 만들지 않는다', () => {
  it('upload-retry — 절반 수신 후 끊김 → 다음 시도는 409 → resume 으로 나머지만', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:upload-retry' });
    const sessionId = await recordAndSubmit(h);
    await h.runtime.queue.drain();
    expect(await h.runtime.queue.statusOf(sessionId)).toBe('failed_retrying');

    h.scheduler.advance(UPLOAD_BACKOFF_MS.high[0] ?? 0);
    await h.runtime.queue.drain();

    const patches = h.mock.requestLog
      .entries()
      .filter((entry) => entry.operation === PATCH_OP)
      .map((entry) => entry.payload as { offset: number; bytes: number });
    // 서버가 받은 바이트 합 = part 크기 (중복 0)
    expect(patches.reduce((sum, patch) => sum + patch.bytes, 0)).toBe(1280);
    expect(patches.map((patch) => patch.offset)).toStrictEqual([0, 0, 640]);
    expect(h.count(HEAD_OP)).toBe(1);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(0);
  });
});

describe('AC-4-29 — UPLOAD_TOKEN_EXPIRED → refreshTokens → 성공 (호출 순서)', () => {
  it('init → PATCH(거절) → upload-tokens → PATCH → complete', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:upload-token-expired' });
    const sessionId = await recordAndSubmit(h);
    await h.runtime.queue.drain();

    expect(recordingOps(h)).toStrictEqual([INIT_OP, PATCH_OP, REFRESH_OP, PATCH_OP, COMPLETE_OP]);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(0);
    // 토큰 문자열은 기기에 저장되지 않는다
    expect(JSON.stringify(await h.storage.kv.list('uploads'))).not.toMatch(/token/i);
  });
});

describe('AC-4-30 — RECORDING_INCOMPLETE 는 로컬 보존 + 재시도', () => {
  it('recording-incomplete — 확정 실패 동안 파일 보존, 다음 시도는 HEAD 로 서버 offset 을 확인한다', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:recording-incomplete' });
    const sessionId = await recordAndSubmit(h);
    await h.runtime.queue.drain();

    expect((await h.runtime.queue.get(sessionId))?.lastFailure).toBe('RECORDING_INCOMPLETE');
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(6);

    h.scheduler.advance(UPLOAD_BACKOFF_MS.high[0] ?? 0);
    await h.runtime.queue.drain();
    // 서버가 말한 part 를 다시 보낸다 → 이미 다 받았으므로 409 → resume(HEAD) 0 바이트
    expect(h.count(HEAD_OP)).toBe(1);
    expect(h.count(COMPLETE_OP)).toBe(2);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(6);
  });
});

describe('AC-4-31 — 오프라인 완료 → 큐 대기 → 연결 복구 시 **자동** 재개 (폴링·수동 호출 없음)', () => {
  it('offline-queued — 끊긴 동안 업로드 요청 0, online 신호 하나로 업로드 완료', async () => {
    const h = createRuntimeHarness({
      scenario: 'recordings:offline-queued',
      connectivity: 'offline',
    });
    h.runtime.queue.start();
    const sessionId = await h.serverSession();
    await h.recordLocally(sessionId, 5);
    await h.submit(sessionId).catch(() => null);
    await h.runtime.queue.drain();

    expect(recordingOps(h)).toStrictEqual([]);
    expect(await h.runtime.queue.statusOf(sessionId)).toBe('queued');
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(6);

    const uploaded = waitFor(h, 'uploaded');
    const clockBefore = h.scheduler.now();
    // 브라우저 online 이벤트 = Mock 연결 복구 + 앱 신호 (createBrowserMockApiClients 와 같은 연결)
    h.mock.connectivity.goOnline();
    h.appState.setConnectivity('online');
    await uploaded; // ← drain() 을 부르지 않는다. 시간도 흘리지 않는다.

    expect(h.scheduler.now()).toBe(clockBefore); // 시계 불변 — 백오프 대기·폴링으로 된 것이 아니다
    expect(recordingOps(h)).toStrictEqual([INIT_OP, PATCH_OP, COMPLETE_OP]);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(0);
  });
});

describe('AC-4-32 · AC-4-67 — 48h 경과 안내: 경계 양쪽 측정 · 1회만', () => {
  it('upload-stalled-48h — 48h − 1ms 에는 없고 48h 에 정확히 1회', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:upload-stalled-48h' });
    const events = collect(h);
    h.runtime.queue.start();
    const sessionId = await recordAndSubmit(h);
    await h.runtime.queue.drain();
    const enqueuedAt = (await h.runtime.queue.get(sessionId))?.enqueuedAtMs ?? 0;
    const stalled = () => events.filter((event) => event.type === 'stalled_48h').length;

    h.scheduler.advance(enqueuedAt + 48 * HOUR_MS - 1 - h.scheduler.now());
    await h.runtime.queue.drain({ force: true });
    expect(stalled()).toBe(0);
    expect(await h.runtime.queue.statusOf(sessionId)).toBe('failed_retrying');

    h.scheduler.advance(1); // 48h 경계에 예약된 깨어남
    await h.runtime.queue.drain();
    expect(stalled()).toBe(1);
    expect(await h.runtime.queue.statusOf(sessionId)).toBe('stalled_48h');

    // 이후 재시도가 계속돼도 안내는 다시 나오지 않는다
    for (let index = 0; index < 5; index += 1) {
      h.scheduler.advance(HOUR_MS);
      await h.runtime.queue.drain({ force: true });
    }
    expect(stalled()).toBe(1);
    expect(await h.runtime.queue.statusOf(sessionId)).toBe('stalled_48h');
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(6); // 48h 는 삭제가 아니다
  });

  it('오프라인으로 시도조차 못 해도 48h 는 적재 시각부터 잰다', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const events = collect(h);
    h.runtime.queue.start();
    const sessionId = await recordAndSubmit(h);
    await h.runtime.queue.drain();

    h.scheduler.advance(48 * HOUR_MS);
    await h.runtime.queue.drain();
    expect(events.filter((event) => event.type === 'stalled_48h')).toHaveLength(1);
    expect(recordingOps(h)).toStrictEqual([]);
    expect(await h.runtime.queue.statusOf(sessionId)).toBe('stalled_48h');
  });
});

describe('AC-4-33 — RECORDING_DELETED 면 큐가 포기하고 로컬을 정리한다', () => {
  it('recording-deleted — 토큰 재발급이 RECORDING_DELETED → 항목 제거 · 파일 0', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:recording-deleted' });
    const events = collect(h);
    const sessionId = await recordAndSubmit(h);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(6);
    await h.runtime.queue.drain();

    expect(recordingOps(h)).toStrictEqual([INIT_OP, PATCH_OP, REFRESH_OP]);
    expect(events.some((event) => event.type === 'recording_deleted')).toBe(true);
    expect(await h.runtime.queue.list()).toStrictEqual([]);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(0);
    // 다시 시도하지 않는다
    h.scheduler.advance(HOUR_MS);
    await h.runtime.queue.drain({ force: true });
    expect(h.count(REFRESH_OP)).toBe(1);
  });
});

describe('D4-30 — 비영속 저장소의 녹음을 먼저 · 더 촘촘히', () => {
  it('best_effort 녹음이 persisted 녹음보다 먼저 init 된다 (적재 순서와 무관)', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    h.runtime.queue.start();
    const first = await h.serverSession('a');
    await h.recordLocally(first, 2);
    await h.runtime.store.update(first, (record) => ({
      ...record,
      storagePersistence: 'persisted',
    }));
    await h.submit(first).catch(() => null);
    // 첫 세션을 서버에서 끝내야 다음 세션을 만들 수 있다 (진행 중 세션 1개 — RU-4)
    await h.mock.clients.sessions.transition(
      {
        sessionId: first,
        body: { to: 'completed', occurredAt: h.scheduler.nowIso(), completedReason: 'user_done' },
      },
      { idempotencyKey: 'ik-first-done' },
    );
    const second = await h.serverSession('b');
    await h.recordLocally(second, 2);
    await h.runtime.store.update(second, (record) => ({
      ...record,
      storagePersistence: 'best_effort',
    }));
    await h.submit(second).catch(() => null);

    expect((await h.runtime.queue.get(first))?.priority).toBe('normal');
    expect((await h.runtime.queue.get(second))?.priority).toBe('high');

    h.appState.setConnectivity('online');
    await h.runtime.queue.drain();
    const inits = h.mock.requestLog
      .entries()
      .filter((entry) => entry.operation === INIT_OP)
      .map((entry) => (entry.payload as { sessionId: string }).sessionId);
    expect(inits).toStrictEqual([second, first]);
  });

  it('재시도 간격 — high 는 normal 보다 짧다', async () => {
    expect(UPLOAD_BACKOFF_MS.high[0]).toBeLessThan(UPLOAD_BACKOFF_MS.normal[0] ?? 0);
    const h = createRuntimeHarness({
      scenario: 'recordings:recording-upload-failure',
      storage: { persistence: 'persisted' },
    });
    await h.runtime.store.ensurePersistence();
    const sessionId = await recordAndSubmit(h);
    await h.runtime.queue.drain();
    const entry = await h.runtime.queue.get(sessionId);
    expect(entry?.priority).toBe('normal');
    expect((entry?.nextAttemptAtMs ?? 0) - h.scheduler.now()).toBe(UPLOAD_BACKOFF_MS.normal[0]);
  });
});

describe('업로드 대상 판단', () => {
  it('contract 밖 컨테이너만 있으면 올리지 않고 로컬을 남긴다 (nothing_to_upload)', async () => {
    const h = createRuntimeHarness();
    const events = collect(h);
    const sessionId = await h.serverSession();
    await h.recordLocally(sessionId, 2, { container: null });
    // MIME 도 contract 밖으로 바꿔 둔다
    await h.runtime.store.update(sessionId, (record) => ({
      ...record,
      parts: record.parts.map((part) => ({ ...part, mimeType: 'audio/ogg' })),
    }));
    await h.submit(sessionId).catch(() => null);
    await h.runtime.queue.drain();

    expect(events.some((event) => event.type === 'nothing_to_upload')).toBe(true);
    expect(h.count(INIT_OP)).toBe(0);
    expect(await h.runtime.store.countChunkFiles(sessionId)).toBe(3);
  });

  it('partDurations — 보고된 녹음 시간을 바이트 비율로 나눈다 / 없으면 디코드 길이 → 청크 수', () => {
    const base = {
      version: 1,
      sessionId: 's',
      createdAtMs: 0,
      state: 'completed',
      completedAtMs: 0,
      completedReason: 'user_done',
      storagePersistence: null,
      retentionNoticeAtMs: null,
      parts: [],
    } as const;
    const parts = [
      { partNo: 1, bytes: new Uint8Array(300), chunkCount: 3, decodedSeconds: null },
      { partNo: 2, bytes: new Uint8Array(100), chunkCount: 1, decodedSeconds: 1.5 },
    ];
    expect([...partDurations({ ...base, recordedSeconds: 8 }, parts)]).toStrictEqual([
      [1, 6],
      [2, 2],
    ]);
    expect([...partDurations({ ...base, recordedSeconds: null }, parts)]).toStrictEqual([
      [1, 3],
      [2, 1.5],
    ]);
  });
});
