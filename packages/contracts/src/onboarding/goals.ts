import { z } from 'zod';

import { GrowthGoalSchema } from './options.js';

/**
 * 온보딩 Step 4 — 성장 목표.
 * 근거: PRD §7.2 Step 4, `docs/plans/stage-2-plan.md` §7.1.
 *
 * 선택 0개를 허용한다 — PRD 가 최소 개수를 요구하지 않고, 강제하면 "부담 없게 수집"
 * (PRD §7.2) 과 충돌한다.
 */

/** 성장 목표 선택 최대 개수 — 질문지 Q2 "Multi-select, up to 2" (결정 D-A). */
export const GROWTH_GOALS_MAX = 2;

export const GoalsAnswersSchema = z.object({
  growthGoals: z.array(GrowthGoalSchema).max(GROWTH_GOALS_MAX),
});

export type GoalsAnswers = z.infer<typeof GoalsAnswersSchema>;
