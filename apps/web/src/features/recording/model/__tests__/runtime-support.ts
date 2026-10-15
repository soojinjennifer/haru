/**
 * `S4-E` 테스트 준비물 — 로컬 저장 · outbox · 업로드 큐 · 런타임. 테스트 전용 — 앱 코드가 import 하지 않는다.
 *
 * - 시간: `createManualScheduler` (실시간 대기 없음 — 48h · 7일 · 14일 경계를 결정적으로 넘긴다)
 * - 저장소: `MockRecordingStorage` (메모리 — **파일 수 = 저장된 바이트 단위 수**)
 * - 앱 신호: `MockAppStatePort`
 * - 서버: 실제 Mock 번들 (`MockSessionApi` · `MockRecordingApi` · `MockUploadTransport`) — 요청 로그가 증거다
 */
import type { RecordingContainer } from '@haru/contracts';

import { createMockAppStatePort } from '../../../../mocks/platform/MockAppStatePort';
import {
  createMockRecordingStorage,
  type MockRecordingStorageOptions,
} from '../../../../mocks/platform/MockRecordingStorage';
import { mockChunkBytes } from '../../../../mocks/fixtures/local-recordings';
import { MOCK_RECORDER_MIME_TYPE } from '../../../../mocks/platform/MockRecorderAdapter';
import { bundle, ik, sessionBody, to } from '../../../../mocks/__tests__/stage4-support';
import type { MockApiClientsOptions } from '../../../../mocks';
import { sha256Hex } from '../../../../shared/lib/sha256';
import { createManualScheduler } from '../../../../test/manual-scheduler';
import { createLocalRecordingStore } from '../local-recording-store';
import { createRecordingRuntime } from '../recording-runtime';

import { START_MS } from './controller-support';

export { START_MS };

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

export const TRANSITION_OP = 'POST /v1/sessions/:sessionId/transitions';
export const INIT_OP = 'POST /v1/sessions/:sessionId/recordings';
export const REFRESH_OP = 'POST /v1/recordings/:recordingId/upload-tokens';
export const COMPLETE_OP = 'POST /v1/recordings/:recordingId/complete';
export const PATCH_OP = 'TUS PATCH';
export const HEAD_OP = 'TUS HEAD';

export interface RuntimeHarnessOptions {
  readonly scenario?: string;
  readonly storage?: MockRecordingStorageOptions;
  readonly bundle?: MockApiClientsOptions;
  readonly connectivity?: 'online' | 'offline';
}

export function createRuntimeHarness(options: RuntimeHarnessOptions = {}) {
  const mock = bundle(options.scenario ?? '', options.bundle ?? {});
  const scheduler = createManualScheduler(START_MS);
  const storage = createMockRecordingStorage(options.storage);
  const appState = createMockAppStatePort({ connectivity: options.connectivity ?? 'online' });
  let key = 0;
  const createKey = (): string => `ik-runtime-${String((key += 1))}`;
  const runtime = createRecordingRuntime({
    bytes: storage.bytes,
    kv: storage.kv,
    persistence: storage.persistence,
    decoder: storage.decoder,
    appState,
    sessionApi: mock.clients.sessions,
    recordingApi: mock.clients.recordings,
    uploadTransport: mock.clients.uploadTransport,
    clock: scheduler,
    scheduler,
    createKey,
    hasher: sha256Hex,
  });

  const operations = (): string[] => mock.requestLog.entries().map((entry) => entry.operation);
  const count = (operation: string): number =>
    operations().filter((name) => name === operation).length;
  const transitionTargets = (): string[] =>
    mock.requestLog
      .entries()
      .filter((entry) => entry.operation === TRANSITION_OP)
      .map((entry) => (entry.payload as { to: string }).to);

  /** Mock 서버에 `ready` 세션을 만든다 (Controller 가 녹음을 시작할 세션). */
  async function serverSessionReady(name = 'a'): Promise<string> {
    const { session } = await mock.clients.sessions.create(
      { body: sessionBody({ clientSessionKey: `client-session-key-${name.padEnd(4, '0')}` }) },
      ik(`create-${name}`),
    );
    return session.id;
  }

  /** Mock 서버에 세션을 만들고 `recording` 까지 진행한다 (서버 상태 준비). */
  async function serverSession(name = 'a'): Promise<string> {
    const sessionId = await serverSessionReady(name);
    await mock.clients.sessions.transition({ sessionId, body: to('recording') }, ik(`rec-${name}`));
    return sessionId;
  }

  /** 로컬에 part 1개를 녹음해 둔다 (Controller 없이 sink 경로만). */
  async function recordLocally(
    sessionId: string,
    chunks = 5,
    options: { partNo?: number; end?: boolean; container?: RecordingContainer | null } = {},
  ): Promise<void> {
    const partNo = options.partNo ?? 1;
    const { sink } = runtime.portsFor(sessionId);
    await sink.beginPart({ sessionId, partNo, startedAtMs: scheduler.now() });
    for (let seq = 1; seq <= chunks; seq += 1) {
      await sink.appendChunk({
        sessionId,
        partNo,
        seq,
        bytes: mockChunkBytes(seq),
        mimeType: MOCK_RECORDER_MIME_TYPE,
        container: options.container === undefined ? 'webm' : options.container,
        final: seq === chunks,
      });
    }
    if (options.end !== false) {
      await sink.endPart({
        sessionId,
        partNo,
        endedAtMs: scheduler.now(),
        chunkCount: chunks,
        byteLength: chunks * 256,
        mimeType: MOCK_RECORDER_MIME_TYPE,
        container: options.container === undefined ? 'webm' : options.container,
      });
    }
  }

  /** 로컬 완료 표시 + 업로드 적재 — Controller 의 Submit 이 하는 일 (전이 전송 포함). */
  async function submit(sessionId: string, recordedSeconds = 5) {
    const { transitions } = runtime.portsFor(sessionId);
    return transitions.send({
      to: 'completed',
      occurredAt: scheduler.nowIso(),
      completedReason: 'user_done',
      recordedSeconds,
    });
  }

  return {
    mock,
    scheduler,
    storage,
    appState,
    runtime,
    operations,
    count,
    transitionTargets,
    serverSessionReady,
    serverSession,
    recordLocally,
    submit,
  };
}

/** 메모리 저장소 위의 단독 `LocalRecordingStore` (런타임 없이 저장 규칙만 볼 때). */
export function createStoreHarness(options: MockRecordingStorageOptions = {}) {
  const scheduler = createManualScheduler(START_MS);
  const storage = createMockRecordingStorage(options);
  const store = createLocalRecordingStore({
    bytes: storage.bytes,
    kv: storage.kv,
    persistence: storage.persistence,
    clock: scheduler,
  });
  return { scheduler, storage, store };
}

export const SESSION_A = '00000000-0000-4000-8000-0000000000e1';
export const SESSION_B = '00000000-0000-4000-8000-0000000000e2';
