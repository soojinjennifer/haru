import { z } from 'zod';

/**
 * 요금제 — PRD §7.1 "가입 완료 시 Free 플랜 자동 부여".
 * 근거: `docs/plans/stage-2-plan.md` §7.1.
 *
 * `RECOMMENDED` — Stage 1 enum 표(§2.2)에 없던 값이며 Stage 2 Plan §18-④ 보고로 문서에 반영했다.
 * 유료 플랜(FR-26)은 P2 이므로 MVP enum 값은 `free` 하나다.
 */
export const PlanSchema = z.enum(['free']);

export type Plan = z.infer<typeof PlanSchema>;
