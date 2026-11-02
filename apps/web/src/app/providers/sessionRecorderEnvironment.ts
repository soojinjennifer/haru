/**
 * 녹음 상태 머신 **조립** — Stage 4 `S4-F1` (Plan §5.2-2 · `S4-D` handoff D-8 ① · `S4-E` E-8 ②).
 *
 * ```
 * app/providers (여기)
 *  ├ RecordingRuntime  = LocalRecordingStore + SessionOutbox + UploadQueue + 보관 + 크래시 복구 (1개, 지연 생성)
 *  └ create(session)   → createRecordingController({ recorder, permissions, consentGate,
 *                                                    transitions/sink = runtime.portsFor(id), … })
 *                        = entities/session 의 `SessionRecorder` 를 **구조적으로** 만족한다
 * ```
 *
 * - **플랫폼 선택은 여기서 하지 않는다** — `apiClients.ts`(선택 지점 1곳)가 `RecordingPlatform` 을 넘긴다
 *   (Mock | Web). 이 파일은 어느 쪽인지 모른다.
 * - 런타임은 **처음 필요할 때** 만든다 — 세션 화면이 없는 테스트 트리(jsdom)에서 IndexedDB 연결을 열지
 *   않기 위해서다. 실제 앱은 `warmUp()` 으로 시작 시 1회 연다(복구 → 보관 정리 → outbox·큐 시작).
 * - ready 리마인드 = 5분(`D4-46`) · 방치 = 10분(contracts `READY_ABANDON_SECONDS`).
 * - 로그아웃 정리 = 런타임 `clearAll()`(메모리 큐·outbox 까지) + 플랫폼 저장소 삭제 (AC-4-72).
 */
import type { SessionRecorder, SessionRecorderEnvironment } from '../../entities/session';
import {
  createConsentGate,
  createPermissionService,
  createRecordingController,
  createRecordingRuntime,
  READY_REMINDER_AFTER_SECONDS,
  type RecordingRuntime,
} from '../../features/recording';
import type { ApiClients } from '../../shared/api/types';
import type { Clock } from '../../shared/lib/clock';
import { createIdempotencyKey } from '../../shared/lib/idempotency';
import { errorName, logger } from '../../shared/lib/logger';
import type { Scheduler } from '../../shared/lib/scheduler';
import { sha256Hex } from '../../shared/lib/sha256';
import type { AppStatePort } from '../../shared/platform/app-state';
import type { RecorderAdapter } from '../../shared/platform/recorder';
import type {
  AudioDecodeProbe,
  ChunkByteStore,
  LocalKeyValueStore,
  StoragePersistencePort,
} from '../../shared/platform/recording-storage';

/** 플랫폼 한 벌 — Web | Mock (후속 Native 는 `apiClients.ts` 에 한 줄 추가). */
export interface RecordingPlatform {
  createRecorder(): RecorderAdapter;
  readonly storage: {
    readonly bytes: ChunkByteStore;
    readonly kv: LocalKeyValueStore;
    readonly persistence: StoragePersistencePort;
    readonly decoder: AudioDecodeProbe;
  };
  readonly appState: AppStatePort;
}

export interface SessionRecorderEnvironmentHandle extends SessionRecorderEnvironment {
  /** 앱 시작 시 1회 — 런타임을 열고 복구·보관 정리·outbox·큐를 시작한다. */
  warmUp(): void;
}

export interface SessionRecorderEnvironmentOptions {
  clients: Pick<ApiClients, 'sessions' | 'recordings' | 'uploadTransport'>;
  /** 처음 쓸 때 한 번만 부른다. */
  platform: () => RecordingPlatform;
  /**
   * 이 기기의 녹음 저장소를 통째로 지운다 (로그아웃 — AC-4-72). 플랫폼을 **열지 않고** 부를 수 있어야
   * 한다 — 세션을 한 번도 열지 않은 채 로그아웃해도 저장소 연결을 새로 만들지 않는다.
   */
  wipeDevice: () => Promise<void>;
  clock: Clock;
  scheduler: Scheduler;
}

export function createSessionRecorderEnvironment(
  options: SessionRecorderEnvironmentOptions,
): SessionRecorderEnvironmentHandle {
  const { clients, clock, scheduler } = options;
  let platform: RecordingPlatform | null = null;
  let runtime: RecordingRuntime | null = null;
  let started = false;

  const ensurePlatform = (): RecordingPlatform => {
    platform ??= options.platform();
    return platform;
  };

  const ensureRuntime = (): RecordingRuntime => {
    if (runtime !== null) return runtime;
    const current = ensurePlatform();
    runtime = createRecordingRuntime({
      ...current.storage,
      appState: current.appState,
      sessionApi: clients.sessions,
      recordingApi: clients.recordings,
      uploadTransport: clients.uploadTransport,
      clock,
      scheduler,
      createKey: createIdempotencyKey,
      hasher: sha256Hex,
    });
    return runtime;
  };

  const start = (): void => {
    if (started) return;
    started = true;
    // 이 시점에는 이 탭에서 녹음 중인 세션이 없다 — 재진입(이어 녹음) 정책은 다음 단위가 정한다.
    ensureRuntime()
      .start()
      .catch((error: unknown) => {
        logger.error('recording_runtime_start_failed', { errorName: errorName(error) });
      });
  };

  return {
    warmUp: start,

    create(input): SessionRecorder {
      start();
      const current = ensurePlatform();
      const recorder = current.createRecorder();
      const ports = ensureRuntime().portsFor(input.sessionId);
      const readySinceMs = Date.parse(input.readyAt);
      const controller = createRecordingController({
        sessionId: input.sessionId,
        mode: input.mode,
        recorder,
        permissions: createPermissionService(recorder),
        consentGate: createConsentGate(input.readConsentStatus),
        transitions: ports.transitions,
        sink: ports.sink,
        clock,
        scheduler,
        readyReminderAfterSeconds: READY_REMINDER_AFTER_SECONDS,
        ...(Number.isNaN(readySinceMs) ? {} : { readySinceMs }),
      });
      return {
        getSnapshot: () => controller.getSnapshot(),
        subscribe: (listener) => controller.subscribe(listener),
        start: () => controller.start(),
        pause: () => controller.pause(),
        resume: () => controller.resume(),
        submit: () => controller.submit(),
        discard: () => controller.discard(),
        async dispose() {
          await controller.dispose();
          recorder.dispose();
        },
      };
    },

    async clearLocalRecordings() {
      if (runtime !== null) await runtime.clearAll();
      await options.wipeDevice();
    },
  };
}
