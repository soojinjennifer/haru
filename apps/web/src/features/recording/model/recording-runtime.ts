/**
 * 녹음 로컬 파이프라인 조립 — `LocalRecordingStore` · `SessionOutbox` · `UploadQueue` · 보관 상한 · 크래시 복구
 * 를 **한 객체로 묶어** `RecordingController` 의 두 포트(`RecordingSink` · `SessionTransitionPort`)에 연결한다
 * (Stage 4 `S4-E`, `ARCHITECTURE` §10.4).
 *
 * ```
 * RecordingController
 *  ├ sink        = LocalRecordingStore            (discardSession → 큐 취소 + 로컬 삭제)
 *  └ transitions = SessionOutbox.portFor(session) (to=completed 면 먼저 로컬 완료 표시 + 업로드 큐 적재)
 *
 * SessionOutbox `confirmed(to=abandoned)` → 큐 취소 + 로컬 삭제   ← 오프라인 Discard 가 나중에 확정된 경우 (D4-13)
 * LocalRetentionMonitor 14일          → 큐 취소 + 로컬 삭제 (D4-29). 미전송 전이는 그대로 보낸다 (세션 상태는 유효)
 * ```
 *
 * 어떤 Adapter(Mock|Http · Web|Mock 저장소)를 쓸지는 **여기서 고르지 않는다** — 조립 지점(`app/providers`,
 * `S4-F`)이 넘긴다. 이 파일은 React 를 쓰지 않는다 (AC-4-47).
 */
import type { SessionTransitionRequest } from '@haru/contracts';

import type { RecordingApi, SessionApi, UploadTransport } from '../../../shared/api';
import type { Clock } from '../../../shared/lib/clock';
import type { Scheduler } from '../../../shared/lib/scheduler';
import type { Sha256Hasher } from '../../../shared/lib/sha256';
import type { AppStatePort } from '../../../shared/platform/app-state';
import type {
  AudioDecodeProbe,
  ChunkByteStore,
  LocalKeyValueStore,
  StoragePersistencePort,
} from '../../../shared/platform/recording-storage';

import { createLocalRecordingStore, type LocalRecordingStore } from './local-recording-store';
import {
  createLocalRetentionMonitor,
  type LocalRetentionMonitor,
  type LocalRetentionSweepResult,
} from './local-retention';
import type { RecordingSink, SessionTransitionPort } from './ports';
import { createRecordingNoticeCenter, type RecordingNoticeCenter } from './recording-notices';
import { recoverUnfinishedRecordings, type RecoveredRecording } from './recording-recovery';
import { createSessionOutbox, type SessionOutbox } from './session-outbox';
import { createUploadQueue, type UploadQueue } from './upload-queue';

export interface RecordingRuntimeOptions {
  readonly bytes: ChunkByteStore;
  readonly kv: LocalKeyValueStore;
  readonly persistence: StoragePersistencePort;
  readonly decoder: AudioDecodeProbe;
  readonly appState: AppStatePort;
  readonly sessionApi: Pick<SessionApi, 'transition' | 'getDetail'>;
  readonly recordingApi: RecordingApi;
  readonly uploadTransport: UploadTransport;
  readonly clock: Clock;
  readonly scheduler: Scheduler;
  readonly createKey: () => string;
  readonly hasher: Sha256Hasher;
}

export interface RecordingRuntimeStartReport {
  readonly recovered: readonly RecoveredRecording[];
  readonly retention: LocalRetentionSweepResult;
}

export interface RecordingRuntime {
  readonly store: LocalRecordingStore;
  readonly outbox: SessionOutbox;
  readonly queue: UploadQueue;
  readonly retention: LocalRetentionMonitor;
  /** 업로드 · 보관 안내 상태 (`S4-H3`) — 시작 전부터 큐·보관 신호를 듣는다. */
  readonly notices: RecordingNoticeCenter;
  /** `RecordingController` 에 넘길 포트 2개. */
  portsFor(sessionId: string): { sink: RecordingSink; transitions: SessionTransitionPort };
  /**
   * 앱 시작 시 1회 — ① 크래시 복구(→ outbox·큐 적재) ② 보관 상한 정리 ③ 48h 경계 점검(전송 없음)
   * ④ outbox·큐·보관 감시 시작 ⑤ 안내 센터에 시작 보고 (`S4-H3` — 앱 시작 Toast 순서가 여기서 정해진다).
   * `activeSessionIds` = 이 탭에서 지금 녹음 중인 세션 (복구 대상 아님).
   */
  start(options?: { activeSessionIds?: ReadonlySet<string> }): Promise<RecordingRuntimeStartReport>;
  /** 로그아웃 — 이 기기의 로컬 녹음 · 업로드 큐 · 미전송 전이를 **전부** 지운다 (AC-4-72). */
  clearAll(): Promise<void>;
  dispose(): void;
}

export function createRecordingRuntime(options: RecordingRuntimeOptions): RecordingRuntime {
  const { kv, appState, clock, scheduler, createKey } = options;

  const store = createLocalRecordingStore({
    bytes: options.bytes,
    kv,
    persistence: options.persistence,
    clock,
  });
  const outbox = createSessionOutbox({
    kv,
    sessionApi: options.sessionApi,
    appState,
    clock,
    scheduler,
    createKey,
  });
  const queue = createUploadQueue({
    kv,
    store,
    recordingApi: options.recordingApi,
    uploadTransport: options.uploadTransport,
    appState,
    clock,
    scheduler,
    createKey,
    hasher: options.hasher,
  });

  /** 로컬 녹음 폐기 — 큐를 먼저 끊고 지운다 (지운 파일을 큐가 다시 읽지 않게). */
  const discardLocal = async (sessionId: string): Promise<void> => {
    await queue.cancel(sessionId);
    await store.delete(sessionId);
  };

  const retention = createLocalRetentionMonitor({
    store,
    clock,
    scheduler,
    onExpired: async (sessionId) => {
      await discardLocal(sessionId);
    },
  });

  // 큐·보관 감시보다 **먼저** 듣는다 — 시작 정리 중에 나는 신호(14일 · 48h)를 잃지 않는다 (§18.10 ④).
  const notices = createRecordingNoticeCenter({ store, queue, retention, clock });

  const offOutbox = outbox.onEvent((event) => {
    // D4-13 — 서버가 폐기를 확정한 뒤에만 로컬을 지운다 (오프라인 Discard 가 나중에 전달된 경우 포함).
    if (event.type === 'confirmed' && event.entry.request.to === 'abandoned') {
      void discardLocal(event.entry.sessionId).then(() => notices.refresh());
    }
  });

  /** 세션이 로컬에서 completed 가 된 순간 — 전송 성패와 무관하게 업로드를 적재한다 (오프라인 완료 — AC-4-31). */
  const onCompleting = async (
    sessionId: string,
    request: SessionTransitionRequest,
  ): Promise<void> => {
    if (request.to !== 'completed' || request.completedReason === undefined) return;
    const record = await store.get(sessionId);
    if (record === null) return; // 대화 전용 — 녹음이 없다
    await store.markCompleted(sessionId, {
      completedReason: request.completedReason,
      recordedSeconds: request.recordedSeconds ?? null,
      completedAtMs: Date.parse(request.occurredAt),
    });
    await queue.enqueue(sessionId);
  };

  return {
    store,
    outbox,
    queue,
    retention,
    notices,

    portsFor(sessionId) {
      const port = outbox.portFor(sessionId);
      return {
        sink: {
          beginPart: (part) => store.beginPart(part),
          appendChunk: (chunk) => store.appendChunk(chunk),
          endPart: (part) => store.endPart(part),
          // Controller 는 서버가 abandoned 를 확정한 뒤에만 부른다 (D4-13).
          discardSession: (id) => discardLocal(id),
        },
        transitions: {
          async send(request) {
            await onCompleting(sessionId, request);
            return port.send(request);
          },
          fetchState: () => port.fetchState(),
        },
      };
    },

    async start(startOptions = {}) {
      const recovered = await recoverUnfinishedRecordings({
        store,
        decoder: options.decoder,
        clock,
        ...(startOptions.activeSessionIds === undefined
          ? {}
          : { activeSessionIds: startOptions.activeSessionIds }),
      });
      for (const item of recovered) {
        // 전이는 outbox 가 순서대로 보낸다 (실패해도 적재돼 있다). 업로드는 전이와 독립이다 (RU-5).
        void outbox.send(item.sessionId, item.transition).catch(() => undefined);
        await queue.enqueue(item.sessionId);
      }
      const retentionResult = await retention.sweep();
      await queue.markStalled();
      outbox.start();
      queue.start();
      retention.start();
      await notices.started(recovered.length);
      return { recovered, retention: retentionResult };
    },

    async clearAll() {
      await queue.clear();
      await outbox.clear();
      await store.clear();
      await notices.reset();
    },

    dispose() {
      offOutbox();
      outbox.dispose();
      queue.dispose();
      retention.dispose();
      notices.dispose();
    },
  };
}
