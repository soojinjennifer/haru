/** `features/recording-deletion` 공개 진입점 — pages 만 소비한다 (rules/architecture §3). Stage 8 `C13-S8-3`. */
export { recordingDeletionCopy } from './copy';
export { RecordingList } from './ui/RecordingList';
export type { RecordingListProps } from './ui/RecordingList';
export { useDeleteSessionRecording } from './model/useDeleteSessionRecording';
export type {
  DeleteSessionRecordingMutation,
  RecordingDeletionResult,
  UseDeleteSessionRecordingOptions,
} from './model/useDeleteSessionRecording';
export { recordedMinutes, statusMeta, toRecordingRowView } from './model/recordingRowView';
export type { RecordingRowView } from './model/recordingRowView';
