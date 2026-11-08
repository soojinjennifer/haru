/**
 * `features/recording` 공개 진입점 — Stage 4 `S4-D` (RecordingController 코어).
 *
 * 순수 TS 다 — React 를 import 하지 않는다 (AC-4-47). 화면(`S4-F`)은 이 모듈을 직접 쓰지 않고
 * `pages/session` 에서 조합한다 (Plan §5.2-4 — feature 간 직접 import 금지).
 * `S4-E`: `LocalRecordingStore` · `SessionOutbox` · `UploadQueue` · 보관 상한 · 크래시 복구가 아래 포트를
 * 구현하며, `createRecordingRuntime` 이 그것들을 묶어 Controller 에 연결한다 (`portsFor`).
 */
export {
  createRecordingController,
  READY_REMINDER_AFTER_SECONDS,
  type RecordingCommandOutcome,
  type RecordingCommandRejection,
  type RecordingController,
  type RecordingControllerEvent,
  type RecordingControllerOptions,
  type RecordingControllerSnapshot,
  type RecordingPhase,
  type RecordingSyncError,
} from './model/recording-controller';
export {
  createConsentGate,
  RECORDING_CONSENT_TYPE,
  type ConsentGate,
  type ConsentGateResult,
} from './model/consent-gate';
export { createPermissionService, type PermissionService } from './model/permission-service';
export {
  createSessionApiTransitionPort,
  type SessionApiTransitionPortOptions,
} from './model/session-transition-port';
export type {
  RecordingChunkWrite,
  RecordingPartEnd,
  RecordingPartStart,
  RecordingSink,
  SessionServerState,
  SessionTransitionPort,
} from './model/ports';
export {
  createLocalRecordingStore,
  type LocalRecordingStore,
  type LocalRecordingStoreOptions,
  type MarkCompletedInput,
} from './model/local-recording-store';
export type {
  LocalChunkIndexEntry,
  LocalPartRecord,
  LocalRecordingRecord,
  LocalRecordingState,
} from './model/local-records';
export {
  createSessionOutbox,
  OUTBOX_BACKOFF_MS,
  type OutboxEntry,
  type OutboxEvent,
  type SessionOutbox,
  type SessionOutboxOptions,
} from './model/session-outbox';
export {
  createUploadQueue,
  partDurations,
  UPLOAD_BACKOFF_MS,
  UPLOAD_STALLED_AFTER_MS,
  type UploadClientStatus,
  type UploadFailureKind,
  type UploadPriority,
  type UploadQueue,
  type UploadQueueEntry,
  type UploadQueueEvent,
  type UploadQueueOptions,
  type UploadQueueState,
} from './model/upload-queue';
export {
  createLocalRetentionMonitor,
  evaluateLocalRetention,
  LOCAL_RECORDING_NOTICE_MS,
  LOCAL_RECORDING_RETENTION_MS,
  type LocalRetentionEvent,
  type LocalRetentionMonitor,
  type LocalRetentionSweepResult,
  type LocalRetentionVerdict,
} from './model/local-retention';
export {
  recoverUnfinishedRecordings,
  type RecoveredPart,
  type RecoveredRecording,
} from './model/recording-recovery';
export {
  APP_RECORDING_NOTICE_ORDER,
  createRecordingNoticeCenter,
  type AppRecordingNotice,
  type RecordingNoticeCenter,
  type RecordingNoticeCenterOptions,
  type RetentionNoticeState,
} from './model/recording-notices';
export {
  createRecordingRuntime,
  type RecordingRuntime,
  type RecordingRuntimeOptions,
  type RecordingRuntimeStartReport,
} from './model/recording-runtime';
export {
  createCaptureTimeline,
  summarizeCaptureTimeline,
  type CaptureTimeline,
  type CaptureTimelineEntry,
  type CaptureTimelineSummary,
  type HiddenInterval,
} from './model/capture-timeline';
