/** `sessions` query key factory — `.claude/rules/frontend.md` §4 (Stage 4 Plan §9.3). */
export const sessionKeys = {
  all: ['sessions'] as const,
  /** `GET /v1/sessions/:sessionId` */
  detail: (sessionId: string) => [...sessionKeys.all, 'detail', sessionId] as const,
} as const;

export type SessionDetailQueryKey = ReturnType<typeof sessionKeys.detail>;
