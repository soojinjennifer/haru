import { z } from 'zod';

/**
 * 세션 생명주기 상태 — **CONFIRMED (사용자 결정 2026-09-14, #16)**.
 * 근거: `docs/API_CONTRACTS.md` §2.2 · §3.1, PRD §12.2 + `abandoned`(PRD §13, ARCHITECTURE §10.2).
 *
 * `retry` 는 **상태가 아니라 행위**다 (`failed → analyzing` 전이로 표현한다 —
 * `.claude/rules/architecture.md` §6).
 * 허용 전이는 `rules/session-transitions.ts` 의 `SESSION_TRANSITIONS` 가 유일한 기준이다.
 */
export const SessionStatusSchema = z.enum([
  'ready',
  'recording',
  'paused',
  'completed',
  'analyzing',
  'analyzed',
  'failed',
  'abandoned',
]);

export type SessionStatus = z.infer<typeof SessionStatusSchema>;
