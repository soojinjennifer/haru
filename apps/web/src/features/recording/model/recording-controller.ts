/**
 * `RecordingController` — 녹음 세션의 **순수 TS 상태 머신** (Stage 4 `S4-D`, `docs/ARCHITECTURE.md` §10.4).
 *
 * React 를 import 하지 않는다 (AC-4-47). 화면은 `getSnapshot` / `subscribe` 로 **구독만** 한다
 * (`useSyncExternalStore` 호환 — 스냅샷은 바뀔 때만 새 객체다).
 *
 * ```
 * RecordingController
 *  ├─ ConsentGate           동의 없음 → 녹음기 호출·전이 요청 0건 (AC-4-62)
 *  ├─ PermissionService     마이크 권한 (거부 → permission_denied, 요청 0건)
 *  ├─ RecorderAdapter       Web | Mock (후속 Native) — 청크 · 인터럽션
 *  ├─ RecordingSink         로컬 저장 포트 (S4-E LocalRecordingStore)
 *  └─ SessionTransitionPort 전이 요청 포트 (S4-E SessionOutbox 가 감싼다)
 * ```
 *
 * ── 규칙 ──
 * - **전이 판정은 contracts `canTransition(from, to, 'caregiver', mode)` 하나**다. 표에 없는 전이는
 *   **요청 전에** `invalid_transition` 으로 거절한다 (AC-4-49 — 1차 방어). 서버(Mock)가 그래도
 *   `SESSION_INVALID_TRANSITION` 을 돌려주면 **서버 상태를 조회해 맞춘다** (AC-4-34 — 2차 방어).
 * - **캡처 상태는 클라이언트가 먼저 바꾼다** (`ARCHITECTURE` §10.1-6) — 로컬 전이 후 요청을 순서대로 보낸다.
 * - `recordedSeconds` = **`recording` 구간만** 누적 (일시정지 제외, #17-② — AC-4-43). 상한 도달 시
 *   `completed(auto_timeout)` (AC-4-44), 녹음은 지우지 않는다 (AC-4-45).
 * - `ready` 방치: 리마인드 **1회** → 600초에 `abandoned` (AC-4-46). 시각은 주입 `Clock` 으로 계산하므로
 *   백그라운드에서 타이머가 늦게 깨어도 경계가 밀리지 않는다.
 * - 로컬 삭제는 **사용자 `Discard` 가 서버에서 확정된 뒤** 한 곳뿐이다 (`D4-13` 삭제 순서).
 * - 캡처가 끊기면(`captureStopped`) `paused` 로 내리고 알린다. 재개는 **새 part** 다 (`D4-24`).
 */
import {
  MAX_RECORDED_SECONDS,
  READY_ABANDON_SECONDS,
  RECORDING_PART_NO_MAX,
  canTransition,
  recordingContainerForMimeType,
  type ClientSessionTransitionTarget,
  type CompletedReason,
  type ConsentType,
  type ErrorCode,
  type RecordingContainer,
  type SessionMode,
  type SessionStatus,
  type SessionTransitionRequest,
  type SessionTransitionResult,
} from '@haru/contracts';

import { isHaruApiError, isNetworkError } from '../../../shared/api';
import type { Clock } from '../../../shared/lib/clock';
import type { ScheduledTask, Scheduler } from '../../../shared/lib/scheduler';
import {
  RECORDER_TIMESLICE_MS,
  isRecorderStartError,
  type MicPermissionResult,
  type RecorderAdapter,
  type RecorderChunk,
  type RecorderInterruption,
} from '../../../shared/platform/recorder';

import type { ConsentGate } from './consent-gate';
import type { PermissionService } from './permission-service';
import type { RecordingSink, SessionServerState, SessionTransitionPort } from './ports';

/* ===== 공개 타입 ========================================================== */

/**
 * 클라이언트 전용 단계 — contracts `SessionStatus` 가 아니다 (영속하지 않는다, `ARCHITECTURE` §10.3 끝).
 * - `idle`                 ready, 사용자 입력 대기
 * - `requesting_permission` 마이크 권한 확인·요청 중
 * - `permission_denied`    권한 거부 (화면: 안내 · 설정 딥링크 · 대화만 하기 — S4-F)
 * - `mic_unavailable`      녹음 수단 없음 (장치·브라우저)
 * - `consent_blocked`      동의 없음 (AC-4-62)
 * - `starting`             캡처 시작 중
 * - `capturing`            녹음 중
 * - `paused`               사용자 일시정지
 * - `interrupted`          캡처가 끊겨 일시정지됨 (재개 = 새 part)
 * - `stopping`             캡처 종료·로컬 flush 중
 * - `closed`               종착 (completed · abandoned · 서버가 넘긴 상태)
 */
export type RecordingPhase =
  | 'idle'
  | 'requesting_permission'
  | 'permission_denied'
  | 'mic_unavailable'
  | 'consent_blocked'
  | 'starting'
  | 'capturing'
  | 'paused'
  | 'interrupted'
  | 'stopping'
  | 'closed';

export type RecordingSyncError =
  | { readonly kind: 'api'; readonly code: ErrorCode }
  | { readonly kind: 'network' }
  | { readonly kind: 'unknown' };

export interface RecordingControllerSnapshot {
  readonly sessionId: string;
  readonly mode: SessionMode;
  /** 클라이언트가 보는 세션 상태 — 녹음 중에는 서버보다 앞설 수 있다. */
  readonly status: SessionStatus;
  readonly phase: RecordingPhase;
  /** 실제 녹음 시간 (초, 일시정지 제외, 상한 `MAX_RECORDED_SECONDS`). */
  readonly recordedSeconds: number;
  /** 현재(또는 마지막) part 번호. 녹음 전 0. */
  readonly partNo: number;
  readonly chunkCount: number;
  readonly byteLength: number;
  /** `ready` 리마인드를 이미 냈는가 — 한 세션에 한 번만 `true` 가 된다. */
  readonly readyReminderShown: boolean;
  readonly completedReason: CompletedReason | null;
  /** 마지막 인터럽션 (재개하면 `null`). */
  readonly interruption: RecorderInterruption | null;
  /** `consent_blocked` 일 때 누락 동의. */
  readonly missingConsents: readonly ConsentType[];
  readonly micPermission: MicPermissionResult | null;
  /** 응답을 기다리는 전이 요청 수. */
  readonly pendingTransitions: number;
  readonly syncError: RecordingSyncError | null;
  /** 로컬 저장 실패가 있었는가 (`S4-E` 저장소 오류). */
  readonly localWriteFailed: boolean;
}

export type RecordingControllerEvent =
  | { readonly type: 'ready_reminder' }
  | { readonly type: 'ready_abandoned' }
  | { readonly type: 'auto_timeout' }
  /** 캡처가 끊겨 일시정지됨 — 일시정지·재개 안내 (AC-4-68). */
  | { readonly type: 'interrupted'; readonly interruption: RecorderInterruption }
  /** 캡처는 계속되는 알림 — 예: 탭이 숨겨짐 (`D4-26` web-background-warning). */
  | { readonly type: 'notice'; readonly interruption: RecorderInterruption }
  | {
      readonly type: 'transition_confirmed';
      readonly request: SessionTransitionRequest;
      readonly result: SessionTransitionResult;
    }
  | {
      readonly type: 'transition_failed';
      readonly request: SessionTransitionRequest;
      readonly error: RecordingSyncError;
    }
  | { readonly type: 'resynced'; readonly server: SessionServerState };

export type RecordingCommandRejection =
  | 'invalid_transition'
  | 'consent_required'
  | 'permission_denied'
  | 'mic_unavailable'
  | 'max_duration'
  | 'part_limit'
  | 'start_failed'
  | 'busy'
  | 'disposed';

export type RecordingCommandOutcome =
  | {
      readonly ok: true;
      /** 서버 확정 응답. 전송이 실패했으면 `null` (로컬 전이는 이미 일어났다 — `syncError` 참조). */
      readonly result: SessionTransitionResult | null;
    }
  | { readonly ok: false; readonly reason: RecordingCommandRejection };

export interface RecordingControllerOptions {
  readonly sessionId: string;
  readonly mode: SessionMode;
  /**
   * 시작 상태 — `ready`(기본) 또는 `paused`(재진입: 캡처는 없고 재개 = 새 part).
   * `recording` 재진입은 크래시 복구(`S4-E`, AC-4-65) 소관이라 받지 않는다.
   */
  readonly initial?: { readonly status: 'ready' | 'paused'; readonly recordedSeconds: number };
  readonly recorder: RecorderAdapter;
  readonly permissions: PermissionService;
  readonly consentGate: ConsentGate;
  readonly transitions: SessionTransitionPort;
  readonly sink: RecordingSink;
  readonly clock: Clock;
  readonly scheduler: Scheduler;
  /**
   * ready 리마인드 시점 (초) — ⚠️ **PRD·Figma 에 값이 없다** (PRD §13 "리마인드 버블 1회").
   * 기본값을 두지 않는다: 조립 지점(`S4-F`)이 사용자 결정값을 넘긴다. `READY_ABANDON_SECONDS` 미만이어야 한다.
   */
  readonly readyReminderAfterSeconds: number;
  /** ready 시작 시각 (epoch ms). 기본 = 생성 시각. 서버 `readyAt` 을 넘길 수 있다. */
  readonly readySinceMs?: number;
  /**
   * ready 방치 타이머를 쓸지. 기본 = `mode === 'recorded'` — 대화 전용 세션은 녹음 없이 대화가
   * 진행되므로 10분에 정리하면 대화 도중 세션이 사라진다 (handoff `S4-D` 발견 문제 참조).
   */
  readonly readyTimers?: boolean;
  readonly timesliceMs?: number;
  readonly maxRecordedSeconds?: number;
  readonly readyAbandonSeconds?: number;
}

export interface RecordingController {
  getSnapshot(): RecordingControllerSnapshot;
  subscribe(listener: () => void): () => void;
  onEvent(listener: (event: RecordingControllerEvent) => void): () => void;
  /** ready → recording. 동의 → 권한 → 캡처 → 전이 요청 순서. */
  start(): Promise<RecordingCommandOutcome>;
  pause(): Promise<RecordingCommandOutcome>;
  resume(): Promise<RecordingCommandOutcome>;
  /** `Submit` — recording|paused → completed(user_done). 대화 전용은 ready → completed(user_done). */
  submit(): Promise<RecordingCommandOutcome>;
  /** `Discard` — → abandoned. 서버 확정 후에만 로컬 녹음을 지운다. */
  discard(): Promise<RecordingCommandOutcome>;
  /** 타이머·구독을 놓는다. 진행 중 캡처는 **멈추고 로컬에 보존**한다 (전이 요청 없음). */
  dispose(): Promise<void>;
}

/* ===== 구현 =============================================================== */

const TERMINAL_FOR_CONTROLLER: ReadonlySet<SessionStatus> = new Set<SessionStatus>([
  'completed',
  'analyzing',
  'analyzed',
  'failed',
  'abandoned',
]);

/** 서버 거절 중 재동기화가 필요한 코드. */
const RESYNC_CODES: ReadonlySet<ErrorCode> = new Set<ErrorCode>([
  'SESSION_INVALID_TRANSITION',
  'CONSENT_REQUIRED',
  'SESSION_MAX_DURATION_EXCEEDED',
]);

const TICK_MS = 1000;

function classifySyncError(error: unknown): RecordingSyncError {
  if (isHaruApiError(error)) return { kind: 'api', code: error.code };
  if (isNetworkError(error)) return { kind: 'network' };
  return { kind: 'unknown' };
}

export function createRecordingController(
  options: RecordingControllerOptions,
): RecordingController {
  const { sessionId, mode, recorder, permissions, consentGate, transitions, sink } = options;
  const { clock, scheduler } = options;
  const timesliceMs = options.timesliceMs ?? RECORDER_TIMESLICE_MS;
  const maxMs = (options.maxRecordedSeconds ?? MAX_RECORDED_SECONDS) * 1000;
  const abandonMs = (options.readyAbandonSeconds ?? READY_ABANDON_SECONDS) * 1000;
  const reminderMs = options.readyReminderAfterSeconds * 1000;
  const readyTimersEnabled = options.readyTimers ?? mode === 'recorded';
  if (readyTimersEnabled && !(reminderMs >= 0 && reminderMs < abandonMs)) {
    throw new RangeError('readyReminderAfterSeconds must be within [0, readyAbandonSeconds)');
  }

  /* --- 상태 --- */
  const initial = options.initial ?? { status: 'ready', recordedSeconds: 0 };
  let status: SessionStatus = initial.status;
  let phase: RecordingPhase = initial.status === 'paused' ? 'interrupted' : 'idle';
  let accumulatedMs = Math.min(maxMs, initial.recordedSeconds * 1000);
  let segmentStartMs: number | null = null;
  let partNo = 0;
  let captureLive = false;
  let partChunks = 0;
  let partBytes = 0;
  let partMime = '';
  let partContainer: RecordingContainer | null = null;
  let chunkCount = 0;
  let byteLength = 0;
  let readyReminderShown = false;
  let completedReason: CompletedReason | null = null;
  let interruption: RecorderInterruption | null = null;
  let missingConsents: readonly ConsentType[] = [];
  let micPermission: MicPermissionResult | null = null;
  let pendingTransitions = 0;
  let syncError: RecordingSyncError | null = null;
  let localWriteFailed = false;
  let busy = false;
  let disposed = false;

  let sinkChain: Promise<void> = Promise.resolve();
  let syncChain: Promise<unknown> = Promise.resolve();
  let tickTask: ScheduledTask | null = null;
  let reminderTask: ScheduledTask | null = null;
  let abandonTask: ScheduledTask | null = null;

  const listeners = new Set<() => void>();
  const eventListeners = new Set<(event: RecordingControllerEvent) => void>();

  /* --- 시간 --- */
  const recordedMs = (): number =>
    Math.min(maxMs, accumulatedMs + (segmentStartMs === null ? 0 : clock.now() - segmentStartMs));
  const recordedSeconds = (): number => Math.floor(recordedMs() / 1000);

  const freezeSegment = (): void => {
    accumulatedMs = recordedMs();
    segmentStartMs = null;
  };

  /* --- 스냅샷 --- */
  const buildSnapshot = (): RecordingControllerSnapshot => ({
    sessionId,
    mode,
    status,
    phase,
    recordedSeconds: recordedSeconds(),
    partNo,
    chunkCount,
    byteLength,
    readyReminderShown,
    completedReason,
    interruption,
    missingConsents,
    micPermission,
    pendingTransitions,
    syncError,
    localWriteFailed,
  });

  let snapshot = buildSnapshot();

  const changed = (a: RecordingControllerSnapshot, b: RecordingControllerSnapshot): boolean =>
    (Object.keys(a) as (keyof RecordingControllerSnapshot)[]).some((key) => a[key] !== b[key]);

  const publish = (): void => {
    const next = buildSnapshot();
    if (!changed(snapshot, next)) return;
    snapshot = next;
    for (const listener of listeners) listener();
  };

  const emitEvent = (event: RecordingControllerEvent): void => {
    for (const listener of eventListeners) listener(event);
  };

  /* --- 로컬 저장 (순서 보장) --- */
  const queueSink = (write: () => Promise<void>): Promise<void> => {
    sinkChain = sinkChain.then(write).catch(() => {
      localWriteFailed = true;
      publish();
    });
    return sinkChain;
  };

  /* --- 전이 요청 (순서 보장) --- */
  const allowed = (to: ClientSessionTransitionTarget): boolean =>
    canTransition(status, to, 'caregiver', mode);

  const stopTick = (): void => {
    tickTask?.cancel();
    tickTask = null;
  };

  const cancelReadyTimers = (): void => {
    reminderTask?.cancel();
    abandonTask?.cancel();
    reminderTask = null;
    abandonTask = null;
  };

  const endCapture = async (): Promise<void> => {
    if (!captureLive) return;
    const result = await recorder.stop();
    captureLive = false;
    const endedPart = partNo;
    const mimeType = partMime !== '' ? partMime : result.mimeType;
    const container = partContainer;
    const chunks = partChunks;
    const bytes = partBytes;
    await queueSink(() =>
      sink.endPart({
        sessionId,
        partNo: endedPart,
        endedAtMs: clock.now(),
        chunkCount: chunks,
        byteLength: bytes,
        mimeType,
        container,
      }),
    );
  };

  /** 서버 상태로 맞춘다 — 2차 방어 (AC-4-34 · AC-4-49). */
  const adoptServerState = async (server: SessionServerState, code: ErrorCode): Promise<void> => {
    if (TERMINAL_FOR_CONTROLLER.has(server.status)) {
      freezeSegment();
      stopTick();
      cancelReadyTimers();
      await endCapture();
      status = server.status;
      phase = 'closed';
    } else if (server.status === 'ready' && (status === 'recording' || status === 'paused')) {
      // 서버가 녹음 시작을 받지 않았다 (예: 서버 측 동의 거절). 캡처를 멈추고 로컬은 보존한다.
      freezeSegment();
      stopTick();
      await endCapture();
      status = 'ready';
      phase = 'idle';
    } else if (server.status === 'paused' && status === 'recording') {
      freezeSegment();
      stopTick();
      if (captureLive) await recorder.pause();
      status = 'paused';
      phase = 'paused';
    }
    // server `recording` ↔ local `paused` 는 맞추지 않는다 — 캡처를 자동으로 다시 켜지 않는다.
    if (code === 'CONSENT_REQUIRED' && phase !== 'closed') phase = 'consent_blocked';
    publish();
  };

  const resync = async (code: ErrorCode): Promise<void> => {
    let server: SessionServerState;
    try {
      server = await transitions.fetchState();
    } catch {
      return;
    }
    emitEvent({ type: 'resynced', server });
    await adoptServerState(server, code);
  };

  const sendTransition = (
    request: SessionTransitionRequest,
  ): Promise<SessionTransitionResult | null> => {
    const run = async (): Promise<SessionTransitionResult | null> => {
      pendingTransitions += 1;
      publish();
      try {
        const result = await transitions.send(request);
        syncError = null;
        emitEvent({ type: 'transition_confirmed', request, result });
        return result;
      } catch (error) {
        const classified = classifySyncError(error);
        syncError = classified;
        emitEvent({ type: 'transition_failed', request, error: classified });
        if (classified.kind === 'api' && RESYNC_CODES.has(classified.code)) {
          await resync(classified.code);
        }
        return null;
      } finally {
        pendingTransitions -= 1;
        publish();
      }
    };
    const next = syncChain.then(run, run);
    syncChain = next;
    return next;
  };

  /* --- 녹음 시간 tick / 자동 종료 --- */
  const scheduleTick = (): void => {
    stopTick();
    const remaining = maxMs - recordedMs();
    tickTask = scheduler.schedule(Math.min(TICK_MS, Math.max(0, remaining)), () => {
      tickTask = null;
      if (status !== 'recording' || segmentStartMs === null) return;
      if (recordedMs() >= maxMs) {
        emitEvent({ type: 'auto_timeout' });
        void complete('auto_timeout', clock.nowIso());
        return;
      }
      publish();
      scheduleTick();
    });
  };

  /* --- ready 방치 타이머 --- */
  const readySinceMs = options.readySinceMs ?? clock.now();

  const fireAbandon = (): void => {
    abandonTask = null;
    if (disposed || status !== 'ready') return;
    if (busy) {
      // 권한 프롬프트가 떠 있는 사이 — 사용자가 시작하려는 중이다. 잠시 뒤 다시 본다.
      abandonTask = scheduler.schedule(TICK_MS, fireAbandon);
      return;
    }
    if (!allowed('abandoned')) return;
    if (!readyReminderShown) fireReminder();
    cancelReadyTimers();
    status = 'abandoned';
    phase = 'closed';
    publish();
    emitEvent({ type: 'ready_abandoned' });
    void sendTransition({ to: 'abandoned', occurredAt: clock.nowIso() });
  };

  function fireReminder(): void {
    reminderTask = null;
    if (disposed || status !== 'ready' || readyReminderShown) return;
    readyReminderShown = true;
    publish();
    emitEvent({ type: 'ready_reminder' });
  }

  if (readyTimersEnabled && status === 'ready') {
    const elapsed = clock.now() - readySinceMs;
    reminderTask = scheduler.schedule(reminderMs - elapsed, fireReminder);
    abandonTask = scheduler.schedule(abandonMs - elapsed, fireAbandon);
  }

  /* --- 녹음기 이벤트 --- */
  const handleChunk = (chunk: RecorderChunk): void => {
    if (partNo === 0) return;
    // M-3: 컨테이너는 이 part 의 **첫 (MIME 이 있는) 청크**에서 확정한다.
    if (partContainer === null && partMime === '' && chunk.mimeType !== '') {
      partContainer = recordingContainerForMimeType(chunk.mimeType);
    }
    if (chunk.mimeType !== '') partMime = chunk.mimeType;
    partChunks += 1;
    partBytes += chunk.bytes.byteLength;
    chunkCount += 1;
    byteLength += chunk.bytes.byteLength;
    const write = {
      sessionId,
      partNo,
      seq: chunk.seq,
      bytes: chunk.bytes,
      mimeType: chunk.mimeType,
      container: partContainer,
      final: chunk.final,
    };
    void queueSink(() => sink.appendChunk(write));
    publish();
  };

  const handleInterruption = (event: RecorderInterruption): void => {
    if (disposed) return;
    if (!event.captureStopped) {
      emitEvent({ type: 'notice', interruption: event });
      return;
    }
    if (!captureLive) return;
    if (busy && phase === 'stopping') return; // 사용자가 이미 끝내는 중 — 같은 캡처다.
    // 어댑터는 남은 청크를 모두 전달한 뒤 이 이벤트를 낸다 → 지금 part 를 닫는다.
    captureLive = false;
    const endedPart = partNo;
    const ended = {
      sessionId,
      partNo: endedPart,
      endedAtMs: clock.now(),
      chunkCount: partChunks,
      byteLength: partBytes,
      mimeType: partMime,
      container: partContainer,
    };
    void queueSink(() => sink.endPart(ended));
    interruption = event;
    if (status === 'recording') {
      freezeSegment();
      stopTick();
      status = 'paused';
      phase = 'interrupted';
      publish();
      emitEvent({ type: 'interrupted', interruption: event });
      void sendTransition({
        to: 'paused',
        occurredAt: clock.nowIso(),
        recordedSeconds: recordedSeconds(),
      });
      return;
    }
    phase = 'interrupted';
    publish();
    emitEvent({ type: 'interrupted', interruption: event });
  };

  const unsubscribeChunk = recorder.onChunk(handleChunk);
  const unsubscribeInterruption = recorder.onInterruption(handleInterruption);

  /** 새 part 캡처를 시작한다. 실패 시 거절 사유를 돌려준다. */
  const beginCapture = async (): Promise<RecordingCommandRejection | null> => {
    if (partNo + 1 > RECORDING_PART_NO_MAX) return 'part_limit';
    try {
      await recorder.start({ timesliceMs });
    } catch (error) {
      if (isRecorderStartError(error)) {
        if (error.reason === 'permission_denied') return 'permission_denied';
        if (error.reason === 'unavailable') return 'mic_unavailable';
        if (error.reason === 'busy') return 'busy';
      }
      return 'start_failed';
    }
    partNo += 1;
    captureLive = true;
    partChunks = 0;
    partBytes = 0;
    partMime = '';
    partContainer = null;
    const started = { sessionId, partNo, startedAtMs: clock.now() };
    void queueSink(() => sink.beginPart(started));
    return null;
  };

  const phaseForRejection = (
    reason: RecordingCommandRejection,
    fallback: RecordingPhase,
  ): RecordingPhase => {
    if (reason === 'permission_denied') return 'permission_denied';
    if (reason === 'mic_unavailable') return 'mic_unavailable';
    return fallback;
  };

  const reject = (reason: RecordingCommandRejection): RecordingCommandOutcome => ({
    ok: false,
    reason,
  });

  const checkConsent = (): boolean => {
    const verdict = consentGate.evaluate();
    if (verdict.allowed) {
      missingConsents = [];
      return true;
    }
    missingConsents = verdict.missing;
    return false;
  };

  /* --- 명령 --- */
  async function complete(
    reason: CompletedReason,
    occurredAt: string,
  ): Promise<RecordingCommandOutcome> {
    if (disposed) return reject('disposed');
    if (busy) return reject('busy');
    if (!allowed('completed')) return reject('invalid_transition');
    busy = true;
    cancelReadyTimers();
    freezeSegment();
    stopTick();
    if (status === 'ready') {
      // 대화 전용: ready → completed (녹음 없음)
      status = 'completed';
      completedReason = reason;
      phase = 'closed';
      busy = false;
      publish();
      return {
        ok: true,
        result: await sendTransition({ to: 'completed', occurredAt, completedReason: reason }),
      };
    }
    phase = 'stopping';
    publish();
    // 녹음을 먼저 로컬에 안전하게 둔 뒤 완료를 알린다. 자동 종료도 아무것도 지우지 않는다 (AC-4-45).
    await endCapture();
    await sinkChain;
    status = 'completed';
    completedReason = reason;
    interruption = null;
    phase = 'closed';
    busy = false;
    publish();
    return {
      ok: true,
      result: await sendTransition({
        to: 'completed',
        occurredAt,
        completedReason: reason,
        recordedSeconds: recordedSeconds(),
      }),
    };
  }

  return {
    getSnapshot: () => snapshot,

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    onEvent(listener) {
      eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },

    async start() {
      if (disposed) return reject('disposed');
      if (busy) return reject('busy');
      if (status !== 'ready' || !allowed('recording')) return reject('invalid_transition');
      const occurredAt = clock.nowIso();
      // ① 동의 — 막히면 녹음기도 요청도 부르지 않는다 (AC-4-62).
      if (!checkConsent()) {
        phase = 'consent_blocked';
        publish();
        return reject('consent_required');
      }
      busy = true;
      phase = 'requesting_permission';
      publish();
      // ② 권한
      const permission = await permissions.ensure();
      micPermission = permission;
      if (disposed) {
        busy = false;
        return reject('disposed');
      }
      if (permission !== 'granted') {
        busy = false;
        phase = permission === 'unavailable' ? 'mic_unavailable' : 'permission_denied';
        publish();
        return reject(permission === 'unavailable' ? 'mic_unavailable' : 'permission_denied');
      }
      if (status !== 'ready') {
        // 권한을 묻는 사이 방치 타이머가 세션을 정리했다.
        busy = false;
        return reject('invalid_transition');
      }
      // ③ 캡처
      phase = 'starting';
      publish();
      const failure = await beginCapture();
      if (failure !== null) {
        busy = false;
        phase = phaseForRejection(failure, 'idle');
        publish();
        return reject(failure);
      }
      cancelReadyTimers();
      status = 'recording';
      phase = 'capturing';
      segmentStartMs = clock.now();
      busy = false;
      scheduleTick();
      publish();
      // ④ 전이 요청 1건 (AC-4-41)
      return { ok: true, result: await sendTransition({ to: 'recording', occurredAt }) };
    },

    async pause() {
      if (disposed) return reject('disposed');
      if (busy) return reject('busy');
      if (status !== 'recording' || !allowed('paused')) return reject('invalid_transition');
      const occurredAt = clock.nowIso();
      if (captureLive) await recorder.pause();
      freezeSegment();
      stopTick();
      status = 'paused';
      phase = 'paused';
      publish();
      return {
        ok: true,
        result: await sendTransition({
          to: 'paused',
          occurredAt,
          recordedSeconds: recordedSeconds(),
        }),
      };
    },

    async resume() {
      if (disposed) return reject('disposed');
      if (busy) return reject('busy');
      if (status !== 'paused' || !allowed('recording')) return reject('invalid_transition');
      if (recordedMs() >= maxMs) return reject('max_duration');
      if (!checkConsent()) {
        phase = 'consent_blocked';
        publish();
        return reject('consent_required');
      }
      const occurredAt = clock.nowIso();
      busy = true;
      let resumed = false;
      if (captureLive) {
        try {
          await recorder.resume();
          resumed = true;
        } catch {
          // 캡처가 이미 끊겼다 — 아래에서 새 part 로 시작한다.
          await endCapture().catch(() => undefined);
          captureLive = false;
        }
      }
      if (!resumed) {
        phase = 'starting';
        publish();
        const failure = await beginCapture();
        if (failure !== null) {
          busy = false;
          phase = phaseForRejection(failure, 'interrupted');
          publish();
          return reject(failure);
        }
      }
      status = 'recording';
      phase = 'capturing';
      interruption = null;
      segmentStartMs = clock.now();
      busy = false;
      scheduleTick();
      publish();
      return { ok: true, result: await sendTransition({ to: 'recording', occurredAt }) };
    },

    submit: () => complete('user_done', clock.nowIso()),

    async discard() {
      if (disposed) return reject('disposed');
      if (busy) return reject('busy');
      if (!allowed('abandoned')) return reject('invalid_transition');
      const occurredAt = clock.nowIso();
      busy = true;
      cancelReadyTimers();
      freezeSegment();
      stopTick();
      phase = 'stopping';
      publish();
      await endCapture();
      await sinkChain;
      status = 'abandoned';
      phase = 'closed';
      busy = false;
      publish();
      const result = await sendTransition({ to: 'abandoned', occurredAt });
      // D4-13 삭제 순서: 서버 확정 응답을 받은 뒤에만 로컬을 지운다. 실패하면 보존한다.
      if (result !== null && partNo > 0) await queueSink(() => sink.discardSession(sessionId));
      return { ok: true, result };
    },

    async dispose() {
      if (disposed) return;
      disposed = true;
      cancelReadyTimers();
      stopTick();
      freezeSegment();
      // 진행 중 캡처는 멈추고 로컬에 남긴다 — 세션 상태는 바꾸지 않는다 (복구는 S4-E).
      await endCapture().catch(() => undefined);
      await sinkChain;
      unsubscribeChunk();
      unsubscribeInterruption();
      listeners.clear();
      eventListeners.clear();
    },
  };
}
