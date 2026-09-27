import { z } from 'zod';

import { BooksAnswersSchema } from './books.js';
import { ChildInfoAnswersSchema } from './child-info.js';
import { GoalsAnswersSchema } from './goals.js';
import { CapabilityItemsAnswersSchema } from './survey.js';
import { TemperamentAnswersSchema } from './temperament.js';

/**
 * `PUT /v1/onboarding/steps/:step` 요청 — 단계 기준 discriminated union.
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2, `docs/plans/stage-2-plan.md` §7.1.
 *
 * **중도 저장**이므로 각 단계의 응답은 부분(partial) 을 허용한다 (FR-03).
 * 완결성은 제출(`SubmitOnboardingRequest`) 시점에 검증한다.
 *
 * 단계 이동 시 **1회**만 호출한다 (D-11 — 키 입력마다 아동 데이터를 전송하지 않는다).
 */
export const SaveOnboardingStepRequestSchema = z.discriminatedUnion('step', [
  z.object({ step: z.literal('child_info'), answers: ChildInfoAnswersSchema.partial() }),
  z.object({ step: z.literal('temperament'), answers: TemperamentAnswersSchema.partial() }),
  z.object({ step: z.literal('books'), answers: BooksAnswersSchema.partial() }),
  z.object({ step: z.literal('goals'), answers: GoalsAnswersSchema.partial() }),
  z.object({ step: z.literal('capability_items'), answers: CapabilityItemsAnswersSchema }),
]);

export type SaveOnboardingStepRequest = z.infer<typeof SaveOnboardingStepRequestSchema>;
