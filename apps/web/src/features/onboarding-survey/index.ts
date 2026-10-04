/** `features/onboarding-survey` 공개 진입점 — pages 만 소비한다 (rules/architecture §3). */
export { onboardingCopy } from './copy';
export type { QuestionCopy } from './copy';
export { OnboardingWizard } from './ui/OnboardingWizard';
export type { OnboardingWizardProps } from './ui/OnboardingWizard';
export { OnboardingIntro } from './ui/OnboardingIntro';
export type { OnboardingIntroProps, OnboardingIntroVariant } from './ui/OnboardingIntro';
export { OnboardingSaved } from './ui/OnboardingSaved';
export { SurveyCardDeck, AUTO_ADVANCE_DELAY_MS } from './ui/SurveyCardDeck';
export type { SurveyCardDeckProps } from './ui/SurveyCardDeck';
export { ChoiceQuestionCard } from './ui/ChoiceQuestionCard';
export type { ChoiceQuestionCardProps } from './ui/ChoiceQuestionCard';
export { FavoriteBooksCard } from './ui/FavoriteBooksCard';
export type { FavoriteBooksCardProps } from './ui/FavoriteBooksCard';
export { CapabilityItemCard } from './ui/CapabilityItemCard';
export type { CapabilityItemCardProps } from './ui/CapabilityItemCard';
export {
  DEFAULT_ONBOARDING_INSTRUMENT,
  DEFAULT_ONBOARDING_ESTIMATES,
} from './model/defaultInstrument';
export {
  CARD_STEPS,
  FIRST_CARD_STEP,
  FIRST_STEP,
  isCardStep,
  LAST_STEP,
  nextStep,
  ONBOARDING_STEPS,
  ONBOARDING_STEP_COUNT,
  pathForStep,
  previousStep,
  slugFromStep,
  stepFromSlug,
  stepNumber,
} from './model/steps';
export {
  cardCountsByStep,
  cardPosition,
  cardsForStep,
  questionsForStep,
  resolveQuestion,
  surveyCards,
} from './model/instrumentView';
export type {
  CapabilityItemSurveyCard,
  ChoiceSurveyCard,
  FavoriteBooksSurveyCard,
  ResolvedChoiceOption,
  ResolvedChoiceQuestion,
  SurveyCard,
} from './model/instrumentView';
export {
  ageAccessibleLabel,
  ageTagLabel,
  birthYearMonthOf,
  birthYearOptions,
  childInfoFormFrom,
  partialChildInfoAnswers,
  validateChildDraftFields,
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
