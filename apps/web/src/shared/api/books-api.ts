/**
 * `booksApi` — `GET /v1/books/search` (`docs/API_CONTRACTS.md` §4 Stage 2, 결정 **D-17**).
 *
 * Stage 2 는 **검색 최소 범위**만 쓴다. 서재·소유·증정·프롬프트는 Stage 3 다.
 * 결과가 없을 때 **제목 직접 입력** 경로를 제공하는 것이 이 endpoint 의 존재 이유다
 * (PRD §7.2 "자체 DB에 없으면 제목 텍스트로 저장", AC-2-23).
 *
 * - 인증 필요 · 부작용 없음 → `Idempotency-Key` 불필요
 * - 오류: `VALIDATION_FAILED`(빈 검색어) · `INTERNAL_ERROR`
 */
import type { SearchBooksRequestInput, SearchBooksResponse } from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface BooksApi {
  search(
    request: SearchBooksRequestInput,
    options?: ApiRequestOptions,
  ): Promise<SearchBooksResponse>;
}
