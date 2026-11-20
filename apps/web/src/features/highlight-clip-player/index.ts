/**
 * `features/highlight-clip-player` 공개 진입점 — Stage 7 `S7-E` (FR-18, `C13-S7-3`).
 * 리포트 상세 ⑥ slot 으로 page 가 꽂는다 (`report-detail` 은 이 feature 를 import 하지 않는다 — Plan §5.1).
 */
export { highlightClipCopy } from './copy';
export { HighlightClipList, clipRowView } from './ui/HighlightClipList';
export type { HighlightClipListProps } from './ui/HighlightClipList';
export {
  clipPlayerReducer,
  clipRowOf,
  createClipPlayerState,
  formatClipTime,
} from './model/clipPlayerState';
export type {
  ClipErrorKind,
  ClipPlayerEvent,
  ClipPlayerState,
  ClipRowState,
  ClipRowStatus,
} from './model/clipPlayerState';
