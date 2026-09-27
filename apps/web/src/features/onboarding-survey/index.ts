/** `features/onboarding-survey` 공개 진입점 — pages 만 소비한다 (rules/architecture §3). */
export { onboardingCopy } from './copy';
export type { QuestionCopy } from './copy';
export { OnboardingWizard } from './ui/OnboardingWizard';
export type { OnboardingWizardProps } from './ui/OnboardingWizard';
export { OnboardingIntro } from './ui/OnboardingIntro';
export type { OnboardingIntroProps } from './ui/OnboardingIntro';
export { OnboardingSaved } from './ui/OnboardingSaved';
export { ChoiceQuestionList } from './ui/ChoiceQuestionList';
export type { ChoiceQuestionListProps } from './ui/ChoiceQuestionList';
export { DEFAULT_ONBOARDING_INSTRUMENT } from './model/defaultInstrument';
export {
  ONBOARDING_STEPS,
  ONBOARDING_STEP_COUNT,
  FIRST_STEP,
  LAST_STEP,
  nextStep,
  pathForStep,
  previousStep,
  slugFromStep,
  stepFromSlug,
  stepNumber,
} from './model/steps';
export { questionsForStep, resolveQuestion } from './model/instrumentView';
export type { ResolvedChoiceOption, ResolvedChoiceQuestion } from './model/instrumentView';
export {
  ageTagLabel,
  birthYearMonthOf,
  birthYearOptions,
  childInfoFormFrom,
  partialChildInfoAnswers,
  validateChildInfo,
  BIRTH_MONTH_VALUES,
  EMPTY_CHILD_INFO_FORM,
} from './model/childInfo';
export type { ChildInfoFormState, ChildInfoValidation } from './model/childInfo';
export {
  clearSurveyAnswer,
  firstUnansweredIndex,
  setSurveyAnswer,
  surveyAnswerFor,
  unansweredCount,
} from './model/surveyAnswers';
export { buildSubmitRequest } from './model/submitRequest';
export type { SubmitBuildResult } from './model/submitRequest';
export { hasAnyAnswers, useOnboardingDraft, DRAFT_DEBOUNCE_MS } from './model/useOnboardingDraft';
export type { OnboardingDraftController } from './model/useOnboardingDraft';
