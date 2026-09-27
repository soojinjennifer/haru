/**
 * Mock 온보딩 상태 — `MockOnboardingApi`(쓰기)와 `MockMeApi`(읽기)가 공유하는 하나의 진실.
 *
 * `MockConsentState` 와 같은 이유로 존재한다: 제출이 성공했는데 `GET /v1/me` 가 계속
 * "온보딩 미완료" 를 말하면 Route Guard 가 온보딩으로 되돌려 보내 흐름을 end-to-end 로
 * 검증할 수 없다. 실제 Backend 는 `caregiver_profiles.onboarding_status` 로 같은 일을 한다.
 *
 * 결정성: 시간·난수를 쓰지 않는다. 상태는 명시적 호출로만 바뀐다 (AC-2-52).
 */
import type { OnboardingDraftAnswers, OnboardingStep } from '@haru/contracts';

export interface MockOnboardingState {
  /** 서버에 저장된 단계별 응답 (`PUT /v1/onboarding/steps/:step` 누적). */
  answers(): OnboardingDraftAnswers;
  /** 서버가 기억하는 진행 단계. */
  currentStep(): OnboardingStep;
  /** 응답이 저장된 단계 목록. */
  completedSteps(): readonly OnboardingStep[];
  saveStep(step: OnboardingStep, answers: OnboardingDraftAnswers): void;
  /** 제출 완료 표시 — `GET /v1/me` 의 `onboardingStatus` 가 여기를 본다. */
  markSubmitted(): void;
  submitted(): boolean;
  reset(): void;
}

export function createMockOnboardingState(
  initial: OnboardingDraftAnswers = {},
  initialStep: OnboardingStep = 'child_info',
): MockOnboardingState {
  let answers: OnboardingDraftAnswers = initial;
  let step: OnboardingStep = initialStep;
  let done = false;
  const completed = new Set<OnboardingStep>();

  return {
    answers: () => answers,
    currentStep: () => step,
    completedSteps: () => [...completed],

    saveStep(nextStep, nextAnswers) {
      answers = { ...answers, ...nextAnswers };
      step = nextStep;
      completed.add(nextStep);
    },

    markSubmitted() {
      done = true;
    },

    submitted: () => done,

    reset() {
      answers = initial;
      step = initialStep;
      done = false;
      completed.clear();
    },
  };
}
