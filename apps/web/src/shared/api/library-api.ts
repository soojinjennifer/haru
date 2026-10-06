/**
 * `libraryApi` — 서재 (`docs/API_CONTRACTS.md` §3.7). Stage 3 Home 재구현 범위는 **`★ Save` 뿐**이다.
 *
 * | 호출 | endpoint | 멱등 |
 * |---|---|---|
 * | `saveBook` | `PUT /v1/children/:childId/saved-books` | ✓ (`Idempotency-Key` 를 보내지 않는다) |
 * | `unsaveBook` | `DELETE /v1/children/:childId/saved-books/:bookId` | ✓ |
 *
 * 호출 경로: `Component → useToggleSavedBook → libraryApi.* → MockLibraryApi | HttpLibraryApi`.
 * Component 는 이 interface 도 Adapter 도 직접 호출하지 않는다 (`rules/frontend.md` §4).
 *
 * - 인증 필요. 오류: `RESOURCE_NOT_FOUND` · `VALIDATION_FAILED` · `FORBIDDEN` · `INTERNAL_ERROR`
 *   (**신규 Error Code 0건** — API_CONTRACTS §3.7.3)
 * - 서재 **목록 조회**(`LibraryFilter=saved` 등)는 Library 라운드에서 이 interface 에 추가한다.
 */
import type { SaveBookRequest, SavedBook } from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface LibraryApi {
  saveBook(
    request: { childId: string; body: SaveBookRequest },
    options?: ApiRequestOptions,
  ): Promise<SavedBook>;
  unsaveBook(
    request: { childId: string; bookId: string },
    options?: ApiRequestOptions,
  ): Promise<SavedBook>;
}
