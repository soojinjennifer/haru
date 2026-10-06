/** `home` query key factory — `.claude/rules/frontend.md` §4. */
export const homeKeys = {
  all: ['home'] as const,
  /** `GET /v1/children/:childId/home` — 아이별로 캐시한다. */
  summary: (childId: string) => [...homeKeys.all, 'summary', childId] as const,
} as const;

export type HomeSummaryQueryKey = ReturnType<typeof homeKeys.summary>;
