/** `library` query key factory — `.claude/rules/frontend.md` §4. */
export const libraryKeys = {
  all: ['library'] as const,
  /**
   * 저장한 책 목록 (`LibraryFilter=saved` — Figma `145:1157` "My Saved").
   * 화면은 **Library 라운드**에 생기지만, Home 의 저장 성공이 그 캐시를 무효화해야 하므로
   * key 는 지금 정의한다 (audit §16.5 — "성공 시 `libraryKeys` 무효화").
   */
  saved: (childId: string) => [...libraryKeys.all, 'saved', childId] as const,
} as const;

export type SavedBooksQueryKey = ReturnType<typeof libraryKeys.saved>;
