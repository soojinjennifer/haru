/**
 * 단계 순서·경로 변환 — **순서의 출처는 contracts `OnboardingStep` 하나다** (C-9).
 *
 * slug 배열(`ONBOARDING_STEP_SLUGS`)과 enum 배열은 같은 순서이고, 이 파일은 그 사실을
 * index 로만 연결한다. 두 곳에 매핑 표를 쓰지 않는다 — 표가 두 개면 반드시 갈라진다.
 */
import { OnboardingStepSchema, type OnboardingStep } from '@haru/contracts';

import {
  ONBOARDING_STEP_SLUGS,
  onboardingStepPath,
  type OnboardingStepSlug,
} from '../../../shared/config/routes';

/** 진행 순서. 배열 순서가 곧 단계 순서다. */
export const ONBOARDING_STEPS: readonly OnboardingStep[] = OnboardingStepSchema.options;

export const ONBOARDING_STEP_COUNT = ONBOARDING_STEPS.length;

export function stepFromSlug(slug: string): OnboardingStep | null {
  const index = ONBOARDING_STEP_SLUGS.indexOf(slug as OnboardingStepSlug);
  return index === -1 ? null : (ONBOARDING_STEPS[index] ?? null);
}

export function slugFromStep(step: OnboardingStep): OnboardingStepSlug {
  const index = ONBOARDING_STEPS.indexOf(step);
  // enum 과 slug 배열은 같은 길이·순서다. 벗어나면 첫 단계로 떨어뜨린다.
  return ONBOARDING_STEP_SLUGS[index] ?? ONBOARDING_STEP_SLUGS[0];
}

export function pathForStep(step: OnboardingStep): string {
  return onboardingStepPath(slugFromStep(step));
}

/** 1부터 세는 진행 번호. */
export function stepNumber(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step) + 1;
}

/**
 * **카드 단계** — 한 카드 = 한 문항으로 덱을 그리는 단계들 (재구성 Design Spec §3).
 * `child_info` 는 프로필 입력 화면이라 카드 단계가 아니다 (`R-06`).
 */
export const CARD_STEPS: readonly OnboardingStep[] = ONBOARDING_STEPS.filter(
  (step) => step !== 'child_info',
);

export function isCardStep(step: OnboardingStep): boolean {
  return CARD_STEPS.includes(step);
}

/** 첫 카드 단계 — 설문 소개(`/onboarding`) CTA 가 여는 화면이다. */
export const FIRST_CARD_STEP: OnboardingStep = CARD_STEPS[0] ?? 'reading_together';

export function nextStep(step: OnboardingStep): OnboardingStep | null {
  return ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) + 1] ?? null;
}

export function previousStep(step: OnboardingStep): OnboardingStep | null {
  const index = ONBOARDING_STEPS.indexOf(step);
  return index <= 0 ? null : (ONBOARDING_STEPS[index - 1] ?? null);
}

export const FIRST_STEP: OnboardingStep = ONBOARDING_STEPS[0] ?? 'child_info';
export const LAST_STEP: OnboardingStep =
  ONBOARDING_STEPS[ONBOARDING_STEP_COUNT - 1] ?? 'capability_items';
