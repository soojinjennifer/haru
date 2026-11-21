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
  /**
   * `GET /v1/children/:childId/sessions` — 목록 필터별 key (Stage 8 Plan §5.2 `sessionKeys.list({ hasRecording: true })`).
   * 세션별 녹음 목록(FR-21)은 `{ hasRecording: true }` 를 쓴다. 녹음 삭제 성공 시 `lists()` 로 한꺼번에 무효화한다.
   */
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (childId: string, filter: { readonly hasRecording?: boolean } = {}) =>
    [...sessionKeys.lists(), childId, filter] as const,
} as const;

export type SessionDetailQueryKey = ReturnType<typeof sessionKeys.detail>;
export type SessionListQueryKey = ReturnType<typeof sessionKeys.list>;
