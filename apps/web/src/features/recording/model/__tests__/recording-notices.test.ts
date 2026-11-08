/**
 * `S4-H3` — 업로드 · 보관 안내 상태 (`RecordingNoticeCenter` — 런타임 조립 경로).
 *
 * AC-4-149 ① · AC-4-150 ①③④ · AC-4-151 ①②③④ · AC-4-152(로직) · AC-4-153 ①②④ · 4b Spec §18.3 우선순위 표 ·
 * §18.10 ④(구독 전 신호). 시간은 주입 scheduler, 저장소는 메모리, 서버는 실제 Mock 번들(요청 로그가 증거).
 */
import { describe, expect, it } from 'vitest';

import {
  seedCrashedRecording,
  seedStaleRecording,
  seedStalledUpload,
} from '../../../../mocks/fixtures/local-recordings';
import { sha256Hex } from '../../../../shared/lib/sha256';
import {
  LOCAL_RECORDING_NOTICE_MS,
  LOCAL_RECORDING_RETENTION_MS,
  type LocalRetentionEvent,
} from '../local-retention';
import { createRecordingNoticeCenter } from '../recording-notices';
import { createRecordingRuntime, type RecordingRuntime } from '../recording-runtime';
import { UPLOAD_STALLED_AFTER_MS, type UploadQueueEvent } from '../upload-queue';

import {
  COMPLETE_OP,
  createRuntimeHarness,
  DAY_MS,
  HOUR_MS,
  INIT_OP,
  PATCH_OP,
} from './runtime-support';

type Harness = ReturnType<typeof createRuntimeHarness>;

/** 센터의 사건 처리 줄이 비워질 때까지 기다린다 (refresh 는 같은 줄 뒤에 선다). */
async function settled(runtime: RecordingRuntime): Promise<void> {
  await runtime.notices.refresh();
  await runtime.notices.refresh();
}

/** 같은 기기(저장소 · 서버)에서 앱을 다시 연다 — 메모리는 새로 시작한다. */
function reopen(h: Harness): RecordingRuntime {
  let key = 0;
  return createRecordingRuntime({
    bytes: h.storage.bytes,
    kv: h.storage.kv,
    persistence: h.storage.persistence,
    decoder: h.storage.decoder,
    appState: h.appState,
    sessionApi: h.mock.clients.sessions,
    recordingApi: h.mock.clients.recordings,
    uploadTransport: h.mock.clients.uploadTransport,
    clock: h.scheduler,
    scheduler: h.scheduler,
    createKey: () => `ik-reopen-${String((key += 1))}`,
    hasher: sha256Hex,
  });
}

/** 녹음 1건을 끝내고 큐에 넣는다 (Controller 의 Submit 과 같은 경로). */
async function recordedAndSubmitted(h: Harness, name = 'a'): Promise<string> {
  const sessionId = await h.serverSession(name);
  await h.recordLocally(sessionId, 3);
  await h.submit(sessionId).catch(() => null);
  return sessionId;
}

describe('AC-4-149 ① · AC-4-153 ① — 48h 미확정 안내: 경계 양쪽 · 녹음당 1회 · 재시작 후 0', () => {
  it('48h −1ms 에는 0, 48h 에 `upload_stalled` 1건 · 꺼내면 끝 · 다시 열어도 0', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:upload-stalled-48h' });
    await h.runtime.start();
    const sessionId = await recordedAndSubmitted(h);
    await h.runtime.queue.drain();
    const enqueuedAt = (await h.runtime.queue.get(sessionId))?.enqueuedAtMs ?? 0;

    h.scheduler.advance(enqueuedAt + UPLOAD_STALLED_AFTER_MS - 1 - h.scheduler.now());
    await h.runtime.queue.drain({ force: true });
    await settled(h.runtime);
    expect(h.runtime.notices.peek()).toBeNull();

    h.scheduler.advance(1);
    await h.runtime.queue.drain();
    await settled(h.runtime);
    expect(h.runtime.notices.peek()).toBe('upload_stalled');
    expect(h.runtime.notices.take()).toBe('upload_stalled');
    expect(h.runtime.notices.peek()).toBeNull();

    // 재시도가 계속돼도 다시 나오지 않는다
    for (let index = 0; index < 3; index += 1) {
      h.scheduler.advance(HOUR_MS);
      await h.runtime.queue.drain({ force: true });
    }
    await settled(h.runtime);
    expect(h.runtime.notices.peek()).toBeNull();

    // 재시작 — 신호가 저장돼 있어(`stalledNoticeAtMs`) 다시 나오지 않는다
    h.runtime.dispose();
    const again = reopen(h);
    await again.start();
    await settled(again);
    expect(again.notices.peek()).toBeNull();
    again.dispose();
  });

  it('앱 시작 시 이미 48h 를 넘은 항목 → 시작 보고 안에 들어온다 (구독 전에 끝나도 잃지 않는다)', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:upload-stalled-48h' });
    const sessionId = await h.serverSession();
    await seedStalledUpload(h.runtime.store, h.storage.kv, sessionId, h.scheduler);
    // 시작 전에는 꺼낼 것이 없다 — 순서는 시작 정리가 끝나야 정해진다
    expect(h.runtime.notices.peek()).toBeNull();
    await h.runtime.start();
    expect(h.runtime.notices.peek()).toBe('upload_stalled');
  });

  it('여러 녹음이 48h 를 넘어도 Toast 안내는 1건 (건수와 무관한 한 문장)', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:upload-stalled-48h' });
    const a = await h.serverSession('a');
    const b = await h.serverSession('b').catch(() => null);
    await seedStalledUpload(h.runtime.store, h.storage.kv, a, h.scheduler);
    await seedStalledUpload(h.runtime.store, h.storage.kv, b ?? 'other-session', h.scheduler);
    await h.runtime.start();
    expect(h.runtime.notices.take()).toBe('upload_stalled');
    expect(h.runtime.notices.take()).toBeNull();
  });

  it('보류 중 업로드가 확정되면 늦게라도 내지 않는다', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const sessionId = await h.serverSession();
    await seedStalledUpload(h.runtime.store, h.storage.kv, sessionId, h.scheduler);
    await h.runtime.start();
    expect(h.runtime.notices.peek()).toBe('upload_stalled');

    h.appState.setConnectivity('online');
    await h.runtime.queue.drain({ force: true });
    await settled(h.runtime);
    expect(h.count(COMPLETE_OP)).toBe(1);
    expect(h.runtime.notices.peek()).toBeNull();
  });
});

describe('AC-4-150 — 7일 보관 배너: 레코드에서 파생 · 닫기 기록 · 업로드 시 사라짐', () => {
  async function noticeAt7Days(h: Harness): Promise<{ sessionId: string; createdAt: number }> {
    const sessionId = await recordedAndSubmitted(h);
    const createdAt = (await h.runtime.store.get(sessionId))?.createdAtMs ?? 0;
    await h.runtime.start();
    h.scheduler.advance(createdAt + LOCAL_RECORDING_NOTICE_MS - h.scheduler.now());
    await h.runtime.retention.sweep();
    await settled(h.runtime);
    return { sessionId, createdAt };
  }

  it('① 7일 −1분 0 / 7일 표시 · ③ 삭제 예정 = 첫 part + 14일', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const sessionId = await recordedAndSubmitted(h);
    const createdAt = (await h.runtime.store.get(sessionId))?.createdAtMs ?? 0;
    await h.runtime.start();

    h.scheduler.advance(createdAt + LOCAL_RECORDING_NOTICE_MS - 60_000 - h.scheduler.now());
    await h.runtime.retention.sweep();
    await settled(h.runtime);
    expect(h.runtime.notices.retention()).toBeNull();

    h.scheduler.advance(60_000);
    await h.runtime.retention.sweep();
    await settled(h.runtime);
    expect(h.runtime.notices.retention()).toStrictEqual({
      deleteAtMs: createdAt + LOCAL_RECORDING_RETENTION_MS,
      asOfMs: h.scheduler.now(),
    });
    // 같은 값이면 같은 객체 (구독 snapshot 안정성)
    const first = h.runtime.notices.retention();
    await settled(h.runtime);
    expect(h.runtime.notices.retention()).toBe(first);
    // 배너는 Toast 큐에 들어가지 않는다 (그 사이 48h 경계는 이미 지나 48h 안내만 남아 있다)
    expect(h.runtime.notices.take()).toBe('upload_stalled');
    expect(h.runtime.notices.take()).toBeNull();
  });

  it('닫기 → 0 · 레코드에 닫기 시각 · 다시 열어도 0 (NB-14)', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const { sessionId } = await noticeAt7Days(h);
    expect(h.runtime.notices.retention()).not.toBeNull();

    await h.runtime.notices.dismissRetention();
    expect(h.runtime.notices.retention()).toBeNull();
    expect((await h.runtime.store.get(sessionId))?.retentionDismissedAtMs).toBe(h.scheduler.now());

    h.runtime.dispose();
    const again = reopen(h);
    await again.start();
    await settled(again);
    expect(again.notices.retention()).toBeNull();
    again.dispose();
  });

  it('닫은 뒤 **새 녹음**이 7일에 들어오면 다시 뜬다 (§18.3 닫기 범위)', async () => {
    // 전이는 서버에 닿고 업로드만 계속 실패한다 — 두 번째 세션을 만들 수 있다
    const h = createRuntimeHarness({ scenario: 'recordings:recording-upload-failure' });
    await noticeAt7Days(h);
    await h.runtime.notices.dismissRetention();
    expect(h.runtime.notices.retention()).toBeNull();
    const second = await recordedAndSubmitted(h, 'b');
    const createdAt = (await h.runtime.store.get(second))?.createdAtMs ?? 0;
    h.scheduler.advance(createdAt + LOCAL_RECORDING_NOTICE_MS - h.scheduler.now());
    await h.runtime.retention.sweep();
    await settled(h.runtime);
    expect(h.runtime.notices.retention()?.deleteAtMs).toBe(
      createdAt + LOCAL_RECORDING_RETENTION_MS,
    );
  });

  it('④ 업로드가 확정되면 사라진다', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    await noticeAt7Days(h);
    expect(h.runtime.notices.retention()).not.toBeNull();

    h.appState.setConnectivity('online');
    await h.runtime.queue.drain({ force: true });
    await settled(h.runtime);
    expect(h.count(COMPLETE_OP)).toBe(1);
    expect(h.runtime.notices.retention()).toBeNull();
  });

  it('여러 녹음이 7일 구간이면 배너 1개 · 날짜 = 가장 이른 삭제 예정', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:recording-upload-failure' });
    await h.runtime.start();
    const a = await recordedAndSubmitted(h, 'a');
    const createdA = (await h.runtime.store.get(a))?.createdAtMs ?? 0;
    h.scheduler.advance(DAY_MS);
    await recordedAndSubmitted(h, 'b');
    h.scheduler.advance(createdA + LOCAL_RECORDING_NOTICE_MS + DAY_MS - h.scheduler.now());
    await h.runtime.retention.sweep();
    await settled(h.runtime);
    expect(h.runtime.notices.retention()?.deleteAtMs).toBe(createdA + LOCAL_RECORDING_RETENTION_MS);
  });
});

describe('AC-4-151 — 14일 삭제 통지', () => {
  it('① 통지 1건 · ② 로컬 파일 0 · ③ 서버 요청 0 · ④ 다시 열어도 0', async () => {
    const h = createRuntimeHarness();
    await seedStaleRecording(h.runtime.store, 'stale-session', h.scheduler);
    await h.runtime.start();

    expect(h.runtime.notices.take()).toBe('retention_expired');
    expect(h.runtime.notices.take()).toBeNull();
    expect(await h.runtime.store.countChunkFiles()).toBe(0);
    expect(h.operations()).toStrictEqual([]);

    h.runtime.dispose();
    const again = reopen(h);
    await again.start();
    expect(again.notices.peek()).toBeNull();
    again.dispose();
  });
});

describe('AC-4-153 ② ③ — 우선순위 · 순차 (4b Spec §18.3 · `D4-120` Q14)', () => {
  it('앱 시작에 셋이 모두 있으면 14일 → 48h → 크래시 복구 순서로 하나씩', async () => {
    const h = createRuntimeHarness({ scenario: 'recordings:upload-stalled-48h' });
    const crashed = await h.serverSession('a');
    await seedCrashedRecording(h.runtime.store, crashed, h.scheduler);
    await seedStaleRecording(h.runtime.store, 'stale-session', h.scheduler);
    const stalled = await h.serverSession('b').catch(() => 'stalled-session');
    await seedStalledUpload(h.runtime.store, h.storage.kv, stalled, h.scheduler);

    const report = await h.runtime.start();
    expect(report.recovered).toHaveLength(1);

    expect(h.runtime.notices.take()).toBe('retention_expired');
    expect(h.runtime.notices.take()).toBe('upload_stalled');
    expect(h.runtime.notices.take()).toBe('recovered');
    expect(h.runtime.notices.take()).toBeNull();
  });

  it('같은 녹음에 7일과 48h 가 함께 해당하면 가장 심한 것만 (배너) — 48h Toast 0', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const sessionId = await recordedAndSubmitted(h);
    // 앱을 닫고(타이머 0) 8일 뒤 다시 연다
    h.runtime.dispose();
    h.scheduler.advance(8 * DAY_MS);
    const again = reopen(h);
    await again.start();
    await settled(again);
    expect(again.notices.retention()).not.toBeNull();
    expect(again.notices.peek()).toBeNull();
    // 48h 는 판정됐다 — 표시하지 않았을 뿐 다시 나오지 않는다
    expect((await again.queue.get(sessionId))?.stalledNoticeAtMs).not.toBeNull();
    again.dispose();
  });

  it('48h 안내가 꺼내지기 전에 그 녹음이 14일에 지워지면 14일만 남는다', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    const sessionId = await recordedAndSubmitted(h);
    await h.runtime.start();
    h.scheduler.advance(UPLOAD_STALLED_AFTER_MS + 1000);
    await h.runtime.queue.drain();
    await settled(h.runtime);
    expect(h.runtime.notices.peek()).toBe('upload_stalled');

    const createdAt = (await h.runtime.store.get(sessionId))?.createdAtMs ?? 0;
    h.scheduler.advance(createdAt + LOCAL_RECORDING_RETENTION_MS - h.scheduler.now());
    // 진행 중이던(7일 경계) 정리가 끝난 뒤 지금 시각으로 한 번 더
    await h.runtime.retention.sweep();
    await h.runtime.retention.sweep();
    await settled(h.runtime);
    expect(h.runtime.notices.take()).toBe('retention_expired');
    expect(h.runtime.notices.take()).toBeNull();
  });
});

describe('AC-4-152 (로직) · `N4B-32` ⓐ — 업로드 진행·성공·자동 재시도 중 안내 0', () => {
  it.each(['recordings:recording-upload-success', 'recordings:recording-incomplete'])(
    '%s → Toast 안내 0 · 배너 0',
    async (scenario) => {
      const h = createRuntimeHarness({ scenario });
      await h.runtime.start();
      await recordedAndSubmitted(h);
      for (let index = 0; index < 4; index += 1) {
        h.scheduler.advance(10 * 60_000);
        await h.runtime.queue.drain({ force: true });
      }
      await settled(h.runtime);
      expect(h.count(INIT_OP)).toBeGreaterThan(0);
      expect(h.count(PATCH_OP)).toBeGreaterThan(0);
      expect(h.runtime.notices.peek()).toBeNull();
      expect(h.runtime.notices.retention()).toBeNull();
    },
  );
});

describe('AC-4-153 ④ — 로그아웃 정리 후 안내 기록 0', () => {
  it('clearAll → 보관한 Toast 안내 0 · 배너 0 · 레코드 0', async () => {
    const h = createRuntimeHarness({ connectivity: 'offline' });
    await seedStaleRecording(h.runtime.store, 'stale-session', h.scheduler);
    const sessionId = await recordedAndSubmitted(h);
    await h.runtime.start();
    h.scheduler.advance(8 * DAY_MS);
    await h.runtime.retention.sweep();
    await settled(h.runtime);
    expect(h.runtime.notices.peek()).toBe('retention_expired');
    expect(h.runtime.notices.retention()).not.toBeNull();

    await h.runtime.clearAll();
    expect(h.runtime.notices.peek()).toBeNull();
    expect(h.runtime.notices.retention()).toBeNull();
    expect(await h.runtime.store.get(sessionId)).toBeNull();
    expect(await h.runtime.queue.list()).toStrictEqual([]);
  });
});

describe('시작 정리 전에는 꺼내지 않는다 — 순서는 시작 보고에서 정한다 (`D4-120` Q14)', () => {
  it('48h 가 14일보다 먼저 들어와도 시작 전 peek 0 · 시작 뒤 14일 → 48h', async () => {
    const h = createRuntimeHarness();
    const queueListeners: ((event: UploadQueueEvent) => void)[] = [];
    const retentionListeners: ((event: LocalRetentionEvent) => void)[] = [];
    await h.recordLocally('session-48h', 2);
    const center = createRecordingNoticeCenter({
      store: h.runtime.store,
      clock: h.scheduler,
      queue: { onEvent: (listener) => (queueListeners.push(listener), () => undefined) },
      retention: { onEvent: (listener) => (retentionListeners.push(listener), () => undefined) },
    });
    queueListeners.forEach((emit) => {
      emit({ type: 'stalled_48h', sessionId: 'session-48h' });
    });
    retentionListeners.forEach((emit) => {
      emit({ type: 'retention_expired', sessionId: 'session-14d' });
    });
    await center.refresh();
    expect(center.peek()).toBeNull();

    await center.started(0);
    expect(center.take()).toBe('retention_expired');
    expect(center.take()).toBe('upload_stalled');
    expect(center.take()).toBeNull();
    center.dispose();
  });
});
