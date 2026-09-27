/** `book` query key factory — `.claude/rules/frontend.md` §4. */
export const bookKeys = {
  all: ['book'] as const,
  /** `GET /v1/books/search?q=` — 검색어별로 캐시한다. */
  search: (query: string) => [...bookKeys.all, 'search', query] as const,
} as const;

export type BookSearchQueryKey = ReturnType<typeof bookKeys.search>;
