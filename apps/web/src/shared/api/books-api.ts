/**
 * `booksApi` — `GET /v1/books/search` (`docs/API_CONTRACTS.md` §4 Stage 2, 결정 **D-17**)
 * + `GET /v1/books/:bookId/prompts?childId=` (Library Plan §7.5, FR-20 "책별 Prompt 보기").
 *
 * 검색 결과가 없을 때 **제목 직접 입력** 경로를 제공하는 것이 `search` 의 존재 이유다
 * (PRD §7.2 "자체 DB에 없으면 제목 텍스트로 저장", AC-2-23).
 *
 * `getPrompts` 는 서재 `BookDetailSheet` 의 Prompt 뷰가 쓴다. `childId` 를 query 로 보내는
 * 이유는 같은 책의 Prompt 가 아이의 연령대·역량에 따라 달라지기 때문이다
 * (`PromptSet.ageBand` · `capability`).
 *
 * - 인증 필요 · 부작용 없음 → `Idempotency-Key` 불필요
 * - 오류: `VALIDATION_FAILED`(빈 검색어) · `RESOURCE_NOT_FOUND`(없는 책) · `INTERNAL_ERROR`
 */
import type {
  BookPromptsResponse,
  SearchBooksRequestInput,
  SearchBooksResponse,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface BooksApi {
  search(
    request: SearchBooksRequestInput,
    options?: ApiRequestOptions,
  ): Promise<SearchBooksResponse>;
  getPrompts(
    request: { bookId: string; childId: string },
    options?: ApiRequestOptions,
  ): Promise<BookPromptsResponse>;
}
