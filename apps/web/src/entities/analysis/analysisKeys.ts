/** `analysis` query key factory — `.claude/rules/frontend.md` §4 (Stage 5 Plan §5.2). */
export const analysisKeys = {
  all: ['analysis'] as const,
  /** `GET /v1/sessions/:sessionId/analysis` */
  status: (sessionId: string) => [...analysisKeys.all, 'status', sessionId] as const,
} as const;
