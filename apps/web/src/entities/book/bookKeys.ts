/** `book` query key factory — `.claude/rules/frontend.md` §4. */
export const bookKeys = {
  all: ['book'] as const,
  /** `GET /v1/books/search?q=` — 검색어별로 캐시한다. */
  search: (query: string) => [...bookKeys.all, 'search', query] as const,
  /**
   * `GET /v1/books/:bookId/prompts?childId=` — `BookDetailSheet` 의 Prompt 목록 (FR-20).
   * **`childId` 도 캐시 축이다** — 같은 책의 Prompt 가 아이의 연령대·역량에 따라 달라진다
   * (`PromptSet.ageBand` · `capability`).
   */
  prompts: (bookId: string, childId: string) =>
    [...bookKeys.all, 'prompts', bookId, childId] as const,
} as const;

export type BookSearchQueryKey = ReturnType<typeof bookKeys.search>;
export type BookPromptsQueryKey = ReturnType<typeof bookKeys.prompts>;
