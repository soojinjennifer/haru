/** `activity-card` query key factory — `.claude/rules/frontend.md` §4. */
export const activityCardKeys = {
  all: ['activity-card'] as const,
  /** `GET /v1/children/:childId/activity-cards/today`. */
  today: (childId: string) => [...activityCardKeys.all, 'today', childId] as const,
} as const;

export type TodayActivityCardQueryKey = ReturnType<typeof activityCardKeys.today>;
