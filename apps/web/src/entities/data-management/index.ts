/**
 * `entities/data-management` 공개 진입점 — Stage 8 데이터 관리 · 삭제 (FR-21 · §7.8, Rev 12 `C8-1` · `C8-2` · `C8-3`).
 * `S8-A` = query key · `S8-B` = 요약 · 녹음 목록 query hook · `S8-C` = 삭제 요청 진행 상태 폴링.
 */
export { dataManagementKeys } from './dataManagementKeys';
export type { DataManagementSummaryQueryKey, DeletionRequestQueryKey } from './dataManagementKeys';
export { useDataManagementSummary } from './useDataManagementSummary';
export type { UseDataManagementSummaryResult } from './useDataManagementSummary';
export { recordingSessionsKey, useRecordingSessions } from './useRecordingSessions';
export type { UseRecordingSessionsResult } from './useRecordingSessions';
// `S8-C` — 전체 삭제 진행 상태 폴링 (Plan §5.2 · AC-8-27)
export {
  DELETION_POLL_INTERVAL_MS,
  DELETION_POLL_MAX_READS,
  selectDeletionRefetchInterval,
} from './deletionPolling';
export { useDeletionRequest } from './useDeletionRequest';
export type {
  DeletionRequestQueryMode,
  UseDeletionRequestOptions,
  UseDeletionRequestResult,
} from './useDeletionRequest';
