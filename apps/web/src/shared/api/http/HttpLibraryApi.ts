/**
 * `HttpLibraryApi` — `★ Save` 의 Http Adapter 골격 (Stage 1 `D-7`).
 *
 * 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` 이다 (`P3-BIP-15` — `saved`·`saved_at`
 * 서버 소유 · 멱등 보장 · `LibraryFilter=saved` 조회 · `source=card_save` 기록).
 *
 * **`Idempotency-Key` 를 붙이지 않는다** — `PUT` 은 자원 상태 설정이라 그 자체로 멱등이다
 * (`docs/API_CONTRACTS.md` §3.7.3, `POST …/library/books` · `POST …/gift-requests` 와 다른 점).
 */
import { SaveBookRequestSchema, SavedBookSchema, type SaveBookRequest } from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { LibraryApi } from '../library-api';

import type { HttpClient } from './httpClient';

export function savedBooksPath(childId: string): string {
  return `/children/${encodeURIComponent(childId)}/saved-books`;
}

export function savedBookPath(childId: string, bookId: string): string {
  return `${savedBooksPath(childId)}/${encodeURIComponent(bookId)}`;
}

export function createHttpLibraryApi(client: HttpClient): LibraryApi {
  return {
    saveBook: (
      request: { childId: string; body: SaveBookRequest },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'PUT',
        path: savedBooksPath(request.childId),
        body: SaveBookRequestSchema.parse(request.body),
        schema: SavedBookSchema,
        signal: options.signal,
      }),

    unsaveBook: (request: { childId: string; bookId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'DELETE',
        path: savedBookPath(request.childId, request.bookId),
        schema: SavedBookSchema,
        signal: options.signal,
      }),
  };
}
