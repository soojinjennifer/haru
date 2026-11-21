/**
 * `D4-123` — 브라우저 Mock 기기 seed (`mocks/recorder/deviceSeed.ts`). scenario 별로 로컬 녹음 · 업로드 큐 항목 ·
 * Mock 서버 세션이 어떻게 채워지는지 본다. 기본 scenario 는 아무것도 넣지 않는다.
 */
import { SessionSummarySchema } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { createLocalRecordingStore } from '../../features/recording';
import { createFixedClock } from '../../shared/lib/clock';
import { MOCK_EPOCH_MS, createMockSessionState } from '../index';
import { MOCK_DEVICE_SEED_SESSION_IDS as IDS } from '../fixtures/sessions';
import { MOCK_RECORDING_SESSION_IDS } from '../fixtures/data-management';
import {
  MOCK_LOCAL_PENDING_AGE_MS,
  MOCK_LOCAL_PENDING_RETRY_IN_MS,
  MOCK_NOTICE_AGE_MS,
  MOCK_STALE_AGE_MS,
  MOCK_STALLED_AGE_MS,
} from '../fixtures/local-recordings';
import { createMockRecordingStorage } from '../platform/MockRecordingStorage';
import { applyRecordingDeviceSeed, resolveDeviceSeedSessionIds } from '../recorder/deviceSeed';
import { createScenarioStoreFrom } from '../scenarios';

const DEVICE_NOW = Date.UTC(2026, 10, 4, 12, 0, 0);

async function seed(search: string) {
  const scenarios = createScenarioStoreFrom({ search });
  const storage = createMockRecordingStorage();
  const deviceClock = createFixedClock(DEVICE_NOW);
  const store = createLocalRecordingStore({
    bytes: storage.bytes,
    kv: storage.kv,
    persistence: storage.persistence,
    clock: deviceClock,
  });
  const sessionState = createMockSessionState();
  await applyRecordingDeviceSeed({
    scenarios,
    sessionState,
    serverClock: createFixedClock(MOCK_EPOCH_MS),
    deviceClock,
    target: store,
    kv: storage.kv,
  });
  return { scenarios, storage, store, sessionState };
}

describe('applyRecordingDeviceSeed', () => {
  it('기본 scenario → 아무것도 넣지 않는다', async () => {
    const { store, storage, sessionState } = await seed('');
    expect(await store.list()).toStrictEqual([]);
    expect(await storage.kv.list('uploads')).toStrictEqual([]);
    expect(sessionState.sessions.size).toBe(0);
  });

  it('recorder:crash-recovered → 끝나지 못한 part + 서버 세션 `recording`', async () => {
    const { store, sessionState } = await seed('?scenario=recorder:crash-recovered');
    const unfinished = await store.listUnfinished();
    expect(unfinished.map((record) => record.sessionId)).toStrictEqual([IDS.crashed]);
    const server = sessionState.sessions.get(IDS.crashed);
    expect(server?.summary.status).toBe('recording');
    expect(SessionSummarySchema.safeParse(server?.summary).success).toBe(true);
  });

  it('recordings:upload-stalled-48h → 완료 녹음 + 48h 넘게 묵은 큐 항목 + 서버 세션 `completed`', async () => {
    const { store, storage, sessionState } = await seed('?scenario=recordings:upload-stalled-48h');
    const record = await store.get(IDS.stalled);
    expect(record?.state).toBe('completed');
    expect(record?.createdAtMs).toBe(DEVICE_NOW - MOCK_STALLED_AGE_MS);
    const [entry] = (await storage.kv.list('uploads')) as { enqueuedAtMs: number }[];
    expect(DEVICE_NOW - (entry?.enqueuedAtMs ?? DEVICE_NOW)).toBeGreaterThan(48 * 60 * 60 * 1000);
    expect(sessionState.sessions.get(IDS.stalled)?.summary.status).toBe('completed');
  });

  it('recorder:local-retention-notice → 7일 넘은 미업로드 녹음 · 서버 세션·큐 항목 없음', async () => {
    const { store, storage, sessionState } = await seed(
      '?scenario=recorder:local-retention-notice',
    );
    expect((await store.get(IDS.notice))?.createdAtMs).toBe(DEVICE_NOW - MOCK_NOTICE_AGE_MS);
    expect(await storage.kv.list('uploads')).toStrictEqual([]);
    expect(sessionState.sessions.size).toBe(0);
  });

  it('recorder:local-retention-exceeded → 14일 넘은 미업로드 녹음 · 서버 세션 없음 (RU-16 서버 요청 0)', async () => {
    const { store, sessionState } = await seed('?scenario=recorder:local-retention-exceeded');
    expect((await store.get(IDS.expired))?.createdAtMs).toBe(DEVICE_NOW - MOCK_STALE_AGE_MS);
    expect(sessionState.sessions.size).toBe(0);
  });

  it('두 그룹을 함께 고르면 둘 다 넣는다 (14일 + 48h)', async () => {
    const search = '?scenario=recorder:local-retention-exceeded,recordings:upload-stalled-48h';
    const { store, scenarios } = await seed(search);
    expect((await store.list()).map((record) => record.sessionId).sort()).toStrictEqual(
      [IDS.expired, IDS.stalled].sort(),
    );
    expect(resolveDeviceSeedSessionIds(scenarios).sort()).toStrictEqual(
      [IDS.expired, IDS.stalled].sort(),
    );
  });

  it('⭐ data-management:recording-delete-local-pending → `pending` 행 세션에 미업로드 녹음 + 1시간 뒤 재시도 큐 항목 · 서버 녹음 `pending` (Stage 8)', async () => {
    const { store, storage, sessionState, scenarios } = await seed(
      '?scenario=data-management:recording-delete-local-pending',
    );
    const sessionId = MOCK_RECORDING_SESSION_IDS.pending;
    const record = await store.get(sessionId);
    expect(record?.state).toBe('completed');
    expect(record?.createdAtMs).toBe(DEVICE_NOW - MOCK_LOCAL_PENDING_AGE_MS);

    const entries = (await storage.kv.list('uploads')) as {
      sessionId: string;
      nextAttemptAtMs: number;
    }[];
    expect(entries.map((entry) => entry.sessionId)).toStrictEqual([sessionId]);
    expect(entries[0]?.nextAttemptAtMs).toBe(DEVICE_NOW + MOCK_LOCAL_PENDING_RETRY_IN_MS);

    const server = sessionState.sessions.get(sessionId);
    expect(server?.summary.status).toBe('completed');
    expect(sessionState.recordings.get(server?.recordingId ?? '')?.uploadStatus).toBe('pending');
    expect(resolveDeviceSeedSessionIds(scenarios)).toStrictEqual([sessionId]);
  });
});
