/**
 * `HttpLibraryApi` — 서재 endpoint 의 Http Adapter 골격 (Stage 1 `D-7`).
 *
 * 실제 Backend 연동 검증은 전부 `BACKEND_INTEGRATION_PENDING` 이다
 * (`P3-BIP-15` `saved`·`saved_at` 서버 소유 · 멱등 · `source=card_save` 기록 /
 *  `P3-BIP-16` 평점 집계(해당 Child 세션 평점 한정) / `P3-BIP-17` `progressRatio` 산식 ·
 *  `plannedNights` 출처 · "Reading now" 선정 규칙 / `P3-BIP-18` 섹션 1회 조회).
 *
 * 여기에서 코드로 고정하는 규약
 *   ① `PUT …/saved-books` 에는 **`Idempotency-Key` 를 붙이지 않는다** — 자원 상태 설정이라
 *      그 자체로 멱등이다 (`docs/API_CONTRACTS.md` §3.7.3)
 *   ② `POST …/library/books` · `POST …/gift-requests` 는 **`Idempotency-Key` 필수**
 *   ③ 응답은 전부 contracts schema 로 parse 한다
 *   ④ 저장/해제 응답은 `SavedBook` **유지** (`L-OPEN-20` — 전환하지 않는다)
 */
import {
  AddOwnBookRequestSchema,
  CreateGiftRequestRequestSchema,
  GiftRequestListResponseSchema,
  GiftRequestSchema,
  LibraryBookSchema,
  LibraryListRequestSchema,
  LibraryListResponseSchema,
  LibraryOverviewSchema,
  SaveBookRequestSchema,
  SavedBookSchema,
  type AddOwnBookRequest,
  type CreateGiftRequestRequest,
  type LibraryListRequestInput,
  type SaveBookRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { LibraryApi } from '../library-api';
import type { ApiMutationOptions } from '../options';

import type { HttpClient } from './httpClient';

export function savedBooksPath(childId: string): string {
  return `/children/${encodeURIComponent(childId)}/saved-books`;
}

export function savedBookPath(childId: string, bookId: string): string {
  return `${savedBooksPath(childId)}/${encodeURIComponent(bookId)}`;
}

export function libraryOverviewPath(childId: string): string {
  return `/children/${encodeURIComponent(childId)}/library/overview`;
}

export function libraryBooksPath(childId: string): string {
  return `/children/${encodeURIComponent(childId)}/library/books`;
}

export function giftRequestsPath(childId: string): string {
  return `/children/${encodeURIComponent(childId)}/gift-requests`;
}

/** 목록 query 는 `httpClient` 가 경로만 받으므로 여기에서 만든다 (`booksSearchPath` 선례). */
export function libraryListPath(childId: string, query: LibraryListRequestInput): string {
  const parsed = LibraryListRequestSchema.parse(query);
  const params = new URLSearchParams({ filter: parsed.filter, limit: String(parsed.limit) });

  if (parsed.cursor !== undefined) params.set('cursor', parsed.cursor);

  return `/children/${encodeURIComponent(childId)}/library?${params.toString()}`;
}

export function createHttpLibraryApi(client: HttpClient): LibraryApi {
  return {
    getOverview: (request: { childId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: libraryOverviewPath(request.childId),
        schema: LibraryOverviewSchema,
        signal: options.signal,
      }),

    getList: (
      request: { childId: string; query: LibraryListRequestInput },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'GET',
        path: libraryListPath(request.childId, request.query),
        schema: LibraryListResponseSchema,
        signal: options.signal,
      }),

    addOwnBook: (
      request: { childId: string; body: AddOwnBookRequest },
      options: ApiMutationOptions,
    ) =>
      client.request({
        method: 'POST',
        path: libraryBooksPath(request.childId),
        body: AddOwnBookRequestSchema.parse(request.body),
        schema: LibraryBookSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),

    getGiftRequests: (request: { childId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: giftRequestsPath(request.childId),
        schema: GiftRequestListResponseSchema,
        signal: options.signal,
      }),

    createGiftRequest: (
      request: { childId: string; body: CreateGiftRequestRequest },
      options: ApiMutationOptions,
    ) =>
      client.request({
        method: 'POST',
        path: giftRequestsPath(request.childId),
        body: CreateGiftRequestRequestSchema.parse(request.body),
        schema: GiftRequestSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),

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
