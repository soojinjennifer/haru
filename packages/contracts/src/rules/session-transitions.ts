import { z } from 'zod';

import { type SessionMode } from '../enums/session-mode.js';
import { type SessionStatus } from '../enums/session-status.js';

/**
 * 전이를 일으키는 주체 — `docs/API_CONTRACTS.md` §3.1 `type Actor`.
 *
 * - `caregiver` : 사용자 조작 (Frontend 가 요청)
 * - `server`    : API 서버가 스스로 수행 (업로드 확정, 방치 세션 sweeper)
 * - `worker`    : 분석 Worker
 */
export const SessionTransitionActorSchema = z.enum(['caregiver', 'server', 'worker']);

export type SessionTransitionActor = z.infer<typeof SessionTransitionActorSchema>;

export interface SessionTransition {
  readonly from: SessionStatus;
  readonly to: SessionStatus;
  readonly actor: SessionTransitionActor;
  readonly modes: readonly SessionMode[];
}

/**
 * 허용된 세션 상태 전이 표 — **CONFIRMED (사용자 결정 2026-09-14, #16)**.
 * 근거: `docs/API_CONTRACTS.md` §3.1, PRD §12.2, `docs/ARCHITECTURE.md` §10.2.
 *
 * **이 표에 없는 전이는 전부 금지**이며, 서버(및 Mock Adapter)는
 * `SESSION_INVALID_TRANSITION` (`details: { from, to }`) 으로 거부한다.
 *
 * `retry` 는 상태가 아니라 행위다 — 재시도는 `failed → analyzing` 전이로 표현한다
 * (`.claude/rules/architecture.md` §6).
 */
export const SESSION_TRANSITIONS: readonly SessionTransition[] = [
  { from: 'ready', to: 'recording', actor: 'caregiver', modes: ['recorded'] },
  { from: 'ready', to: 'completed', actor: 'caregiver', modes: ['conversation_only'] },
  // 클라이언트 10분(READY_ABANDON_SECONDS) 타이머
  { from: 'ready', to: 'abandoned', actor: 'caregiver', modes: ['recorded', 'conversation_only'] },
  // 서버 sweeper
  { from: 'ready', to: 'abandoned', actor: 'server', modes: ['recorded', 'conversation_only'] },
  { from: 'recording', to: 'paused', actor: 'caregiver', modes: ['recorded'] },
  { from: 'paused', to: 'recording', actor: 'caregiver', modes: ['recorded'] },
  { from: 'recording', to: 'completed', actor: 'caregiver', modes: ['recorded'] },
  { from: 'paused', to: 'completed', actor: 'caregiver', modes: ['recorded'] },
  // 업로드 확정 시
  { from: 'completed', to: 'analyzing', actor: 'server', modes: ['recorded'] },
  { from: 'analyzing', to: 'analyzed', actor: 'worker', modes: ['recorded'] },
  { from: 'analyzing', to: 'failed', actor: 'worker', modes: ['recorded'] },
  // 재시도 = 행위, 상태 아님
  { from: 'failed', to: 'analyzing', actor: 'worker', modes: ['recorded'] },
];

/**
 * `from → to` 전이가 주어진 actor·mode 조합에서 허용되는지 판정한다.
 * 부수효과 없는 순수 함수이며, Frontend · Mock Adapter · 향후 Backend 가 **같은 함수**를 쓴다.
 */
export function canTransition(
  from: SessionStatus,
  to: SessionStatus,
  actor: SessionTransitionActor,
  mode: SessionMode,
): boolean {
  return SESSION_TRANSITIONS.some(
    (transition) =>
      transition.from === from &&
      transition.to === to &&
      transition.actor === actor &&
      transition.modes.includes(mode),
  );
}
