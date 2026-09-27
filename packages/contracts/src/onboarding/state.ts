import { z } from 'zod';

import { OnboardingStepSchema } from '../enums/onboarding-step.js';
import { OnboardingDraftAnswersSchema } from './answers.js';
import { OnboardingInstrumentSchema } from './instrument.js';

/**
 * `GET /v1/onboarding` · `PUT /v1/onboarding/steps/:step` 응답.
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2, `docs/plans/stage-2-plan.md` §7.1, PRD FR-03.
 *
 * 동의 기록 전에는 이 endpoint 가 `CONSENT_REQUIRED` 로 거부된다
 * (Trial 구간은 서버 호출 없이 로컬 draft 만 쓴다 — C-12).
 */

/** 단계별 진행 상태. 배열 순서 = 진행 순서 (C-9). */
export const OnboardingStepStateSchema = z.object({
  step: OnboardingStepSchema,
  /** 서버에 저장된 응답이 있는지. 진행바·"이어서 진행" 판정에 쓴다 (FR-03). */
  completed: z.boolean(),
});

export type OnboardingStepState = z.infer<typeof OnboardingStepStateSchema>;

export const OnboardingStateSchema = z.object({
  instrument: OnboardingInstrumentSchema,
  steps: z.array(OnboardingStepStateSchema).length(OnboardingStepSchema.options.length),
  draftAnswers: OnboardingDraftAnswersSchema,
  /** 중도 이탈 후 복귀했을 때 열어야 할 단계 (FR-03). */
  currentStep: OnboardingStepSchema,
});

export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
