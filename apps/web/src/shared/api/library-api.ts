/**
 * `libraryApi` — 서재 (`docs/API_CONTRACTS.md` §3.7 + Library Plan §7.5).
 *
 * | 호출 | endpoint | 멱등 | Idempotency-Key |
 * |---|---|---|---|
 * | `getOverview` | `GET /v1/children/:childId/library/overview` | ✓ | — |
 * | `getList` | `GET /v1/children/:childId/library?filter=&limit=&cursor=` | ✓ | — |
 * | `addOwnBook` | `POST /v1/children/:childId/library/books` | ✗ | **필수** |
 * | `getGiftRequests` | `GET /v1/children/:childId/gift-requests` | ✓ | — |
 * | `createGiftRequest` | `POST /v1/children/:childId/gift-requests` | ✗ | **필수** |
 * | `saveBook` | `PUT /v1/children/:childId/saved-books` | ✓ | 보내지 않는다 |
 * | `unsaveBook` | `DELETE /v1/children/:childId/saved-books/:bookId` | ✓ | — |
 *
 * 호출 경로: `Component → use*(query/mutation) → libraryApi.* → MockLibraryApi | HttpLibraryApi`.
 * Component 는 이 interface 도 Adapter 도 직접 호출하지 않는다 (`rules/frontend.md` §4).
 *
 * ── `getOverview` 가 섹션별 조회를 대신한다 ──
 * 서재 섹션 4개가 한 화면에 동시에 뜨므로 **1회 조회**다 (`P3-BIP-18`). 섹션별 호출은
 * 4-way 로딩이 되어 체감 지연을 악화시킨다.
 *
 * ── 저장/해제 응답은 `SavedBook` 을 **유지**한다 (`L-OPEN-20`) ──
 * `API_CONTRACTS.md` §3.7.3 과 Plan §7.5 는 `LibraryBook` 전환을 검토했으나 사용자가
 * **현행 유지**를 택했다 (`stage-3-approvals.md` §18.4) — Home 의 `useToggleSavedBook` 회귀
 * 위험을 피한다. 그 대가로 저장/해제 후에는 `libraryKeys.overview` 를 **무효화하고 재조회**한다.
 *
 * - 인증 필요. 오류: `CHILD_NOT_FOUND` · `RESOURCE_NOT_FOUND` · `VALIDATION_FAILED` ·
 *   `GIFT_REQUEST_DUPLICATE` · `BOOK_ALREADY_OWNED` · `IDEMPOTENCY_KEY_REUSED` · `INTERNAL_ERROR`
 */
import type {
  AddOwnBookRequest,
  CreateGiftRequestRequest,
  GiftRequest,
  GiftRequestListResponse,
  LibraryBook,
  LibraryListRequestInput,
  LibraryListResponse,
  LibraryOverview,
  SaveBookRequest,
  SavedBook,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';
import type { ApiMutationOptions } from './options';

export interface LibraryApi {
  getOverview(request: { childId: string }, options?: ApiRequestOptions): Promise<LibraryOverview>;
  getList(
    request: { childId: string; query: LibraryListRequestInput },
    options?: ApiRequestOptions,
  ): Promise<LibraryListResponse>;
  /** `Idempotency-Key` **필수** — 호출자(Mutation hook)가 만들어 넘긴다 (재시도 중복 방지). */
  addOwnBook(
    request: { childId: string; body: AddOwnBookRequest },
    options: ApiMutationOptions,
  ): Promise<LibraryBook>;
  getGiftRequests(
    request: { childId: string },
    options?: ApiRequestOptions,
  ): Promise<GiftRequestListResponse>;
  /** `Idempotency-Key` **필수**. */
  createGiftRequest(
    request: { childId: string; body: CreateGiftRequestRequest },
    options: ApiMutationOptions,
  ): Promise<GiftRequest>;
  saveBook(
    request: { childId: string; body: SaveBookRequest },
    options?: ApiRequestOptions,
  ): Promise<SavedBook>;
  unsaveBook(
    request: { childId: string; bookId: string },
    options?: ApiRequestOptions,
  ): Promise<SavedBook>;
}
