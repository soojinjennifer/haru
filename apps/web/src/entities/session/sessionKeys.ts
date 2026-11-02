/** `sessions` query key factory — `.claude/rules/frontend.md` §4 (Stage 4 Plan §9.3). */
export const sessionKeys = {
  all: ['sessions'] as const,
  /** `GET /v1/sessions/:sessionId` */
  detail: (sessionId: string) => [...sessionKeys.all, 'detail', sessionId] as const,
  /**
   * 완료 화면이 읽는 `GET /v1/sessions/:sessionId`. `detail` 과 **키를 나눈다** — `detail` 은 세션 화면이
   * ready 시점 값을 재조회 없이 들고 있어(`staleTime: Infinity`) `sticker` 가 비어 있다.
   */
  completionDetail: (sessionId: string) =>
    [...sessionKeys.all, 'completion-detail', sessionId] as const,
  /** `completed` 전이 응답 — `completionBubble` 은 이 응답에만 있다 (`SessionDetail` 에 없다). */
  completionResult: (sessionId: string) =>
    [...sessionKeys.all, 'completion-result', sessionId] as const,
} as const;

export type SessionDetailQueryKey = ReturnType<typeof sessionKeys.detail>;
