/**
 * 녹음 관련 상한 상수 — **CONFIRMED (사용자 결정 2026-09-14, #17-②)**.
 *
 * 배치 근거: `docs/API_CONTRACTS.md` §3.1 코드 스케치는 두 상수를
 * `rules/session-transitions.ts` 에 두었으나, `PLANNING.md` §5 Stage 1 과
 * `docs/ARCHITECTURE.md` §1.2 는 `rules/recording-limits` 를 별도 파일로 나열한다.
 * Stage 1 Plan §7.1 · §18-① 이 **이 파일**을 정본으로 확정했고,
 * `rules/index.ts` 가 두 파일을 함께 re-export 한다.
 *
 * 이 상수들은 `zod` 에도 의존하지 않는 순수 값이다.
 */

/**
 * 세션 1건의 녹음 시간 상한 (초) — 30분.
 *
 * **실제 녹음 시간 기준이며 일시정지(`paused`) 구간은 포함하지 않는다** (#17-②).
 * 도달 시 세션은 `completed` (`CompletedReason = 'auto_timeout'`) 로 자동 종료되고,
 * 그때까지의 녹음은 보존한다 (PRD FR-09).
 * 서버는 상한을 초과한 길이 보고를 `SESSION_MAX_DURATION_EXCEEDED` 로 거부한다.
 */
export const MAX_RECORDED_SECONDS = 30 * 60;

/**
 * `ready` 상태로 방치된 세션을 `abandoned` 로 보내기까지의 시간 (초) — 10분.
 * 근거: PRD §13, `docs/ARCHITECTURE.md` §10.2.
 *
 * 클라이언트 타이머와 서버 sweeper 가 같은 값을 사용한다
 * (`SESSION_TRANSITIONS` 의 `ready → abandoned` 2행).
 */
export const READY_ABANDON_SECONDS = 10 * 60;
