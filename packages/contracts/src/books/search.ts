import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { CursorPageRequestSchema, paginated } from '../common/pagination.js';

/**
 * 온보딩 Step 3 책 검색 — `GET /v1/books/search`.
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2, `docs/decisions/stage-2-approvals.md` §4 **D-17**.
 *
 * **최소 범위다.** 소유·증정 상태(`LibraryBook`), 프롬프트(`BookPrompts`), 서재 화면은
 * Stage 3 다. `BookSummary` 는 그 부분집합이므로 확장이 비파괴적이다.
 *
 * 검색 결과가 없으면 화면은 **제목 직접 입력** 경로를 제공한다
 * (PRD §7.2 "자체 DB에 없으면 제목 텍스트로 저장" — 필수 예외 UX).
 */

/** 검색어 최대 길이 (RECOMMENDED). */
export const BOOK_SEARCH_QUERY_MAX_LENGTH = 100;

export const BookSummarySchema = z.object({
  id: IdSchema,
  title: z.string().min(1),
  author: z.string().min(1),
  /** 표지 이미지. Stage 2 화면은 표지를 그리지 않는다 (Stage 3). */
  coverUrl: z.url().optional(),
});

export type BookSummary = z.infer<typeof BookSummarySchema>;

export const SearchBooksRequestSchema = CursorPageRequestSchema.extend({
  q: z.string().trim().min(1).max(BOOK_SEARCH_QUERY_MAX_LENGTH),
});

/** parse **입력** 타입 — `limit`·`cursor` 는 생략 가능하다. */
export type SearchBooksRequestInput = z.input<typeof SearchBooksRequestSchema>;
export type SearchBooksRequest = z.infer<typeof SearchBooksRequestSchema>;

export const SearchBooksResponseSchema = paginated(BookSummarySchema);

export type SearchBooksResponse = z.infer<typeof SearchBooksResponseSchema>;
