/**
 * 녹음 플랫폼 포트 — interface + Web 구현 (`D4-1`). Native 구현은 후속 단계 `S4N-B` 가 **추가만** 한다.
 *
 * 구현 선택은 `app/providers` 한 곳에서 한다 (Plan §5.2-2). Feature 는 `RecorderAdapter` 타입만 본다.
 */
export {
  RECORDER_TIMESLICE_MS,
  RECORDER_WATCHDOG_FACTOR,
  RecorderStartError,
  isRecorderStartError,
  type MicPermissionResult,
  type MicPermissionState,
  type RecorderAdapter,
  type RecorderCapabilities,
  type RecorderChunk,
  type RecorderInterruption,
  type RecorderInterruptionCause,
  type RecorderPlatform,
  type RecorderStartFailure,
  type RecorderStartOptions,
  type RecorderStopResult,
  type RecorderUnsubscribe,
} from './recorder-adapter';
export { createWebRecorderAdapter, type WebRecorderAdapterOptions } from './web-recorder-adapter';
export type {
  WebChunkData,
  WebMediaEnvironment,
  WebPermissionQueryResult,
  WebRecorderHandle,
  WebRecorderState,
  WebStreamHandle,
} from './web-media-environment';
