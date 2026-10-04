import { z } from 'zod';

import { GrowthGoalSchema } from './options.js';

/**
 * 온보딩 `growing_together` 단계 — 성장 목표 (Q2).
 * 근거: PRD §7.2 Step 4, `docs/plans/stage-2-plan.md` §7.1.
 *
 * schema 자체는 선택 0개를 허용한다 — 중도 저장(draft) 형태를 같은 schema 로 담기 때문이다.
 * "최소 1개" 필수성은 문항 정의(`instrument.ts` `required`)가 소유한다 (`S2-ONB-1`).
 *
 * 필드명 `growthGoals` 는 `docs/DATA_MODEL.md` §5 `children.growth_goals` 와 1:1 이라
 * 단계 rename 과 무관하게 유지한다 (Plan §7.2).
 */

/** 성장 목표 선택 최대 개수 — 질문지 Q2 "Multi-select, up to 2" (결정 D-A). */
export const GROWTH_GOALS_MAX = 2;

export const GrowingTogetherAnswersSchema = z.object({
  growthGoals: z.array(GrowthGoalSchema).max(GROWTH_GOALS_MAX),
});

export type GrowingTogetherAnswers = z.infer<typeof GrowingTogetherAnswersSchema>;
