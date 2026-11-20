/**
 * 파일 저장·공유 포트 — interface + Web 구현 (Stage 7 `S7-A`, `N7-19`). Native 구현은 후속 `S4N-A` 가
 * **추가만** 한다. 구현 선택은 `app/providers` 한 곳에서 한다.
 */
export {
  FileShareRejectedError,
  isFileShareRejectedError,
  type FileShareOutcome,
  type FileSharePort,
} from './file-share-port';
export {
  createBrowserFileShareEnvironment,
  createWebFileSharePort,
  type WebFileShareEnvironment,
} from './web-file-share';
export { FileShareProvider, useFileSharePort } from './context';
export type { FileShareProviderProps } from './context';
