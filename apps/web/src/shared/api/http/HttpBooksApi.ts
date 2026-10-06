/**
 * `HttpBooksApi` — `GET /v1/books/search` 의 Http Adapter 골격 (Plan §16 D-7, 결정 D-17).
 *
 * 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` (**P2-BIP-13** — 책 검색 코퍼스·정렬·페이지네이션) 이다.
 * 검색어·cursor 는 query string 으로 나간다 — `httpClient` 는 경로만 받으므로 여기에서 만든다.
 */
import {
  BookPromptsResponseSchema,
  SearchBooksRequestSchema,
  SearchBooksResponseSchema,
} from '@haru/contracts';
import type { SearchBooksRequestInput } from '@haru/contracts';

import type { BooksApi } from '../books-api';
import type { ApiRequestOptions } from '../health-api';

import type { HttpClient } from './httpClient';

export const BOOKS_SEARCH_PATH = '/books/search';

export function booksSearchPath(request: SearchBooksRequestInput): string {
  const parsed = SearchBooksRequestSchema.parse(request);
  const params = new URLSearchParams({ q: parsed.q, limit: String(parsed.limit) });

  if (parsed.cursor !== undefined) params.set('cursor', parsed.cursor);

  return `${BOOKS_SEARCH_PATH}?${params.toString()}`;
}

/**
 * 책별 Prompt — `childId` 는 query 다 (같은 책의 Prompt 가 아이에 따라 달라진다).
 * Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` (`P3-BIP-03` Prompt 생성 정책 ·
 * `P3-BIP-14` 책별 페이지 앵커).
 */
export function bookPromptsPath(bookId: string, childId: string): string {
  const params = new URLSearchParams({ childId });

  return `/books/${encodeURIComponent(bookId)}/prompts?${params.toString()}`;
}

export function createHttpBooksApi(client: HttpClient): BooksApi {
  return {
    search: (request: SearchBooksRequestInput, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: booksSearchPath(request),
        schema: SearchBooksResponseSchema,
        signal: options.signal,
      }),

    getPrompts: (request: { bookId: string; childId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: bookPromptsPath(request.bookId, request.childId),
        schema: BookPromptsResponseSchema,
        signal: options.signal,
      }),
  };
}
