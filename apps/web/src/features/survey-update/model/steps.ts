/**
 * 설문 재응답 단계 ↔ 경로 — **순서의 출처는 contracts `SurveyUpdateStep` 하나다** (C-7: 온보딩 Step 2~5).
 *
 * slug 는 온보딩과 **같은 배열**(`ONBOARDING_STEP_SLUGS`)을 쓴다 — 온보딩 단계 enum 과 index 로만 연결한다
 * (`features/onboarding-survey/model/steps.ts` 와 같은 규칙, 매핑 표를 새로 쓰지 않는다).
 */
import {
  OnboardingStepSchema,
  SurveyUpdateStepSchema,
  type SurveyUpdateStep,
} from '@haru/contracts';

import {
  ONBOARDING_STEP_SLUGS,
  settingsChildSurveyStepPath,
  type OnboardingStepSlug,
} from '../../../shared/config/routes';

/** 진행 순서. 배열 순서가 곧 단계 순서다. */
export const SURVEY_UPDATE_STEPS: readonly SurveyUpdateStep[] = SurveyUpdateStepSchema.options;

export const FIRST_SURVEY_UPDATE_STEP: SurveyUpdateStep =
  SURVEY_UPDATE_STEPS[0] ?? 'reading_together';

export const LAST_SURVEY_UPDATE_STEP: SurveyUpdateStep =
  SURVEY_UPDATE_STEPS[SURVEY_UPDATE_STEPS.length - 1] ?? 'capability_items';

/** slug → 재응답 단계. 재응답 단계가 아니면(`child-info` 포함) `null`. */
export function surveyUpdateStepFromSlug(slug: string): SurveyUpdateStep | null {
  const index = ONBOARDING_STEP_SLUGS.indexOf(slug as OnboardingStepSlug);
  const parsed = SurveyUpdateStepSchema.safeParse(OnboardingStepSchema.options[index]);
  return parsed.success ? parsed.data : null;
}

export function surveyUpdateStepPath(step: SurveyUpdateStep): string {
  const slug = ONBOARDING_STEP_SLUGS[OnboardingStepSchema.options.indexOf(step)];
  return settingsChildSurveyStepPath(slug ?? ONBOARDING_STEP_SLUGS[1]);
}

export function nextSurveyUpdateStep(step: SurveyUpdateStep): SurveyUpdateStep | null {
  return SURVEY_UPDATE_STEPS[SURVEY_UPDATE_STEPS.indexOf(step) + 1] ?? null;
}

export function previousSurveyUpdateStep(step: SurveyUpdateStep): SurveyUpdateStep | null {
  const index = SURVEY_UPDATE_STEPS.indexOf(step);
  return index <= 0 ? null : (SURVEY_UPDATE_STEPS[index - 1] ?? null);
}
