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
 * - 세션 녹음 삭제 (Stage 8 AC-8-23) = `deleteLocalRecording(id)` — 서버 확정 뒤 그 세션의 업로드 큐 취소 + 로컬 청크 삭제.
 * - 앱 수준 안내 (`S4-H3`) = 런타임 안내 센터(`RecordingNoticeCenter` — 14일 · 48h · 크래시 복구 Toast, 7일 배너)를
 *   그대로 넘기고, **녹음 중인 세션 화면이 있는지**(`capturing` — Toast 보류, `D4-120` Q13)를 여기서 센다.
 *   보류는 녹음(recording · paused)에 들어간 세션 화면이 **떠날 때(컨트롤러 dispose)** 풀린다 (`D4-134`).
 *   런타임이 아직 없으면(세션 화면 없는 테스트 트리) 안내 0 이다.
 * - Mock 기기 seed (`D4-123`) = `seedDevice` — 런타임 시작 **전에** 한 번 저장소를 채운다. `mock` 조립만 넘긴다.
 * - Start Session 권한 판정 (`S4-H2R`) = 판정 전용 녹음기 1개 → `PermissionService.ensure()` → **즉시 `dispose()`**.
 *   Web 어댑터는 `dispose()` 에서 프롬프트가 연 스트림(`primed`)을 닫는다 (AC-4-146). 런타임은 열지 않는다.
 * - 대화 전용 진입 안내 기록 = 세션 id 집합 (앱 실행당 — `D4-120` Q15).
 */
import type { SessionMode } from '@haru/contracts';

import type {
  SessionRecorder,
  SessionRecorderEnvironment,
  SessionRecorderNotices,
} from '../../entities/session';
import {
  createConsentGate,
  createPermissionService,
  createRecordingController,
  createRecordingRuntime,
  READY_REMINDER_AFTER_SECONDS,
  type LocalRecordingStore,
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
  /**
   * Mock 데모 전용 (`D4-123`) — 런타임 시작 **전에** 한 번 이 기기 저장소를 채운다 (크래시 복구 · 48h · 7일 ·
   * 14일 안내를 브라우저에서 재현). `http` 조립은 넘기지 않는다. 실패해도 런타임은 시작한다.
   */
  seedDevice?: (target: DeviceSeedTarget) => Promise<void>;
}

/** `seedDevice` 가 쓰는 저장소 — 녹음 레코드는 공개 쓰기 경로(`store`), 업로드 큐 항목은 `kv`. */
export interface DeviceSeedTarget {
  readonly store: LocalRecordingStore;
  readonly kv: LocalKeyValueStore;
}

/** 녹음 중으로 보는 세션 상태 — 이 동안 앱 수준 Toast 를 보류한다 (`D4-120` Q13, PRD §7.5 녹음 중 개입 0). */
const CAPTURING_STATUSES: ReadonlySet<string> = new Set(['recording', 'paused']);

export function createSessionRecorderEnvironment(
  options: SessionRecorderEnvironmentOptions,
): SessionRecorderEnvironmentHandle {
  const { clients, clock, scheduler } = options;
  let platform: RecordingPlatform | null = null;
  let runtime: RecordingRuntime | null = null;
  let started = false;
  // 대화 전용 진입 안내를 이미 낸 세션 (`D4-120` Q15 — 앱 실행당 세션별 1회, 메모리).
  const conversationNoticed = new Set<string>();
  // 앱 수준 안내 구독자 (`S4-H3`) — 런타임이 생기기 전에 구독해도 된다. 런타임이 생기면 센터 변화를 옮긴다.
  const noticeListeners = new Set<() => void>();
  // 녹음 중(recording · paused)인 컨트롤러 — 앱 Toast 보류 판정 (`D4-120` Q13).
  const capturing = new Set<string>();

  const emitNotices = (): void => {
    for (const listener of [...noticeListeners]) listener();
  };

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
    runtime.notices.subscribe(emitNotices);
    return runtime;
  };

  const start = (): void => {
    if (started) return;
    started = true;
    const current = ensureRuntime();
    const seeded =
      options.seedDevice === undefined
        ? Promise.resolve()
        : options
            .seedDevice({ store: current.store, kv: ensurePlatform().storage.kv })
            .catch((error: unknown) => {
              logger.error('recording_device_seed_failed', { errorName: errorName(error) });
            });
    // 이 시점에는 이 탭에서 녹음 중인 세션이 없다 — 재진입(이어 녹음) 정책은 다음 단위가 정한다.
    void seeded
      .then(() => current.start())
      .catch((error: unknown) => {
        logger.error('recording_runtime_start_failed', { errorName: errorName(error) });
      });
  };

  const setCapturing = (sessionId: string, value: boolean): void => {
    if (capturing.has(sessionId) === value) return;
    if (value) capturing.add(sessionId);
    else capturing.delete(sessionId);
    emitNotices();
  };

  const notices: SessionRecorderNotices = {
    peek: () => runtime?.notices.peek() ?? null,
    take: () => runtime?.notices.take() ?? null,
    retention: () => runtime?.notices.retention() ?? null,
    async dismissRetention() {
      await runtime?.notices.dismissRetention();
    },
    capturing: () => capturing.size > 0,
    retryUploads() {
      // 오프라인이면 요청 0 — 화면이 오프라인 안내를 낸다 (AC-4-149 ④).
      if (platform === null || runtime === null) return 'started';
      if (platform.appState.connectivity() === 'offline') return 'offline';
      void runtime.queue.drain({ force: true });
      return 'started';
    },
    subscribe(listener) {
      noticeListeners.add(listener);
      return () => {
        noticeListeners.delete(listener);
      };
    },
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
      const { appState } = current;
      // 녹음 중 여부를 센다 — 앱 Toast 보류 (`D4-120` Q13). ⭐ `D4-134` (`VG-H3-02`): 한 번 녹음에 들어가면
      // **컨트롤러를 놓을 때(= 세션 화면을 떠날 때)까지** 풀지 않는다. `completed` 에서 풀면 `Submit` 의 같은 순간
      // 보류 안내가 꺼내지고, 4~8ms 뒤 세션 화면의 `Recording submitted` 가 그것을 교체해 안내가 유실됐다
      // (런타임 실측 — handoff `S4-H3R`). 놓는 시점에는 완료 Toast 가 이미 떠 있으므로 `RecordingNoticeToasts` 가
      // `useToastPresent` 로 그 Toast 가 사라질 때까지 기다린다.
      const offCapturing = controller.subscribe(() => {
        if (CAPTURING_STATUSES.has(controller.getSnapshot().status)) {
          setCapturing(input.sessionId, true);
        }
      });
      return {
        getSnapshot: () => controller.getSnapshot(),
        subscribe: (listener) => controller.subscribe(listener),
        start: () => controller.start(),
        pause: () => controller.pause(),
        resume: () => controller.resume(),
        submit: () => controller.submit(),
        discard: () => controller.discard(),
        // 컨트롤러 이벤트 중 화면 안내에 쓰는 것만 옮긴다 (`S4-H2`). 30분 자동 종료는 완료 전이의
        // 결과(확정 응답 · 전송 실패)가 나온 시점에 한 번 알린다 — 화면이 그 응답으로 완료 화면을 연다.
        onNotice: (listener) =>
          controller.onEvent((event) => {
            if (event.type === 'notice' && event.interruption.cause === 'background') {
              listener({ type: 'background' });
              return;
            }
            const autoTimeout =
              (event.type === 'transition_confirmed' || event.type === 'transition_failed') &&
              event.request.to === 'completed' &&
              event.request.completedReason === 'auto_timeout';
            if (!autoTimeout) return;
            listener({
              type: 'auto_timeout',
              result: event.type === 'transition_confirmed' ? event.result : null,
            });
          }),
        connectivity: () => appState.connectivity(),
        onConnectivity: (listener) =>
          appState.subscribe((event) => {
            if (event.type === 'connectivity') listener(event.value);
          }),
        async dispose() {
          offCapturing();
          setCapturing(input.sessionId, false);
          await controller.dispose();
          recorder.dispose();
        },
      };
    },

    notices,

    async resolveSessionMode(): Promise<SessionMode> {
      const probe = ensurePlatform().createRecorder();
      try {
        const result = await createPermissionService(probe).ensure();
        return result === 'granted' ? 'recorded' : 'conversation_only';
      } catch (error: unknown) {
        // 판정 자체가 실패했다 — 녹음 세션으로 만든다. 세션 화면의 녹음 시작이 권한을 다시 확인한다
        // (거부되면 마이크 시트 · 닫고 다시 시작하면 대화 전용 — `D4-119` CP-11).
        logger.error('session_mode_resolve_failed', { errorName: errorName(error) });
        return 'recorded';
      } finally {
        probe.dispose();
      }
    },

    takeConversationNotice(sessionId) {
      if (conversationNoticed.has(sessionId)) return false;
      conversationNoticed.add(sessionId);
      return true;
    },

    async deleteLocalRecording(sessionId) {
      // 큐를 먼저 취소한다 — 진행 중 전송을 끊고 항목을 지운 뒤 청크를 지워야 큐가 지워진 청크를 읽지 않는다.
      const current = ensureRuntime();
      await current.queue.cancel(sessionId);
      await current.store.delete(sessionId);
    },

    async clearLocalRecordings() {
      if (runtime !== null) await runtime.clearAll();
      await options.wipeDevice();
    },
  };
}
