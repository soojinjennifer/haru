/** `library` query key factory — `.claude/rules/frontend.md` §4. */
import type { LibraryFilter } from '@haru/contracts';

export const libraryKeys = {
  all: ['library'] as const,
  /**
   * 저장한 책 목록 (`LibraryFilter=saved`).
   * Home 의 `★ Save` 성공이 이 캐시를 무효화한다 (audit §16.5).
   */
  saved: (childId: string) => [...libraryKeys.all, 'saved', childId] as const,
  /**
   * 서재 화면 **1회 조회** (`GET /v1/children/:childId/library/overview`, `P3-BIP-18`).
   * 섹션별로 key 를 쪼개지 않는다 — 4섹션이 한 응답으로 오고 4-way 로딩을 만들지 않기 위해서다.
   */
  overview: (childId: string) => [...libraryKeys.all, 'overview', childId] as const,
  /**
   * "See all" 시트의 커서 목록 (`GET /v1/children/:childId/library?filter=`).
   * 필터가 캐시 축이다 — `saved` 와 `history` 는 서로 다른 목록이다 (`L-OPEN-14`).
   */
  list: (childId: string, filter: LibraryFilter) =>
    [...libraryKeys.all, 'list', childId, filter] as const,
  /**
   * 증정 요청 상태 목록 (`GET /v1/children/:childId/gift-requests`, FR-22).
   * `/library/gift-requests` 화면과 `BookDetailSheet` 의 신청 성공이 공유한다 —
   * 신청 직후 이 key 를 무효화하면 상태 화면이 최신 목록을 받는다.
   */
  giftRequests: (childId: string) => [...libraryKeys.all, 'gift-requests', childId] as const,
} as const;

export type SavedBooksQueryKey = ReturnType<typeof libraryKeys.saved>;
export type LibraryOverviewQueryKey = ReturnType<typeof libraryKeys.overview>;
export type LibraryListQueryKey = ReturnType<typeof libraryKeys.list>;
export type GiftRequestsQueryKey = ReturnType<typeof libraryKeys.giftRequests>;
