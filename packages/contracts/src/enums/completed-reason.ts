import { z } from 'zod';

/**
 * 세션이 `completed` 로 끝난 이유 — **CONFIRMED (#16)**.
 * 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-09 · NFR 안정성.
 *
 * `auto_timeout` = 녹음 상한(`MAX_RECORDED_SECONDS`) 도달로 자동 종료.
 * `recovered_after_crash` = 앱 강제 종료 후 로컬 녹음으로 복구해 종료.
 */
export const CompletedReasonSchema = z.enum(['user_done', 'auto_timeout', 'recovered_after_crash']);

export type CompletedReason = z.infer<typeof CompletedReasonSchema>;
