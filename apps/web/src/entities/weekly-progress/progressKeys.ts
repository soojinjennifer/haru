/** `progress` query key factory — `.claude/rules/frontend.md` §4 · Stage 7 Plan §5.2. */
export const progressKeys = {
  all: ['progress'] as const,
  /**
   * `GET /v1/children/:childId/progress/weekly?weekStart=` — 아이 · 주별로 캐시한다.
   * `weekStart` 생략(= 이번 주, 서버 계산)은 `'current'` 로 둔다 — 서버만 아는 날짜를 Frontend 가 추정하지 않는다.
   */
  week: (childId: string, weekStart: string | undefined) =>
    [...progressKeys.all, 'week', childId, weekStart ?? 'current'] as const,
} as const;

export type WeeklyProgressQueryKey = ReturnType<typeof progressKeys.week>;
