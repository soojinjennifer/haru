/** `features/data-management` 공개 진입점 — pages 만 소비한다 (rules/architecture §3). Stage 8 `C13-S8-2` · `C13-S8-5`. */
export { dataManagementCopy } from './copy';
export { DataManagement } from './ui/DataManagement';
export type { DataManagementProps } from './ui/DataManagement';
export { DeletionStatusAlert } from './ui/DeletionStatusAlert';
// `N8-31` ⓐ (`D8-2` ①) — 완료 감지 · 로컬 정리 단일 소유자. `app/providers` 감시자만 쓴다.
export { useDataDeletionWatch } from './model/useDataDeletionWatch';
export type {
  DataDeletionWatchState,
  UseDataDeletionWatchOptions,
} from './model/useDataDeletionWatch';
