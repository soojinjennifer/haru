/**
 * `HttpBooksApi` — `GET /v1/books/search` 의 Http Adapter 골격 (Plan §16 D-7, 결정 D-17).
 *
 * 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` (**P2-BIP-13** — 책 검색 코퍼스·정렬·페이지네이션) 이다.
 * 검색어·cursor 는 query string 으로 나간다 — `httpClient` 는 경로만 받으므로 여기에서 만든다.
 */
import { SearchBooksRequestSchema, SearchBooksResponseSchema } from '@haru/contracts';
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

export function createHttpBooksApi(client: HttpClient): BooksApi {
  return {
    search: (request: SearchBooksRequestInput, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: booksSearchPath(request),
        schema: SearchBooksResponseSchema,
        signal: options.signal,
      }),
  };
}
