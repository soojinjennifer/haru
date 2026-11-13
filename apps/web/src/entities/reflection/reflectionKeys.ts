/**
 * `reflections` mutation key factory — `.claude/rules/frontend.md` §4 (Stage 5 Plan §5.2).
 *
 * 회고는 별도 조회 endpoint 가 없다 — 재진입 표시는 `SessionDetail.reflection` (`sessionKeys`) 으로 읽는다.
 * 이 key 는 mutation 식별(진행 중 여부 조회)에만 쓴다.
 */
export const reflectionKeys = {
  all: ['reflections'] as const,
  /** `POST /v1/sessions/:sessionId/reflection` */
  submit: (sessionId: string) => [...reflectionKeys.all, 'submit', sessionId] as const,
} as const;
