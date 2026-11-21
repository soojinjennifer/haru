/** `features/onboarding-survey` 공개 진입점 — pages 만 소비한다 (rules/architecture §3). */
export { onboardingCopy } from './copy';
export type { QuestionCopy } from './copy';
export { OnboardingWizard } from './ui/OnboardingWizard';
export type { OnboardingWizardProps } from './ui/OnboardingWizard';
export { OnboardingIntro } from './ui/OnboardingIntro';
export type { OnboardingIntroProps, OnboardingIntroVariant } from './ui/OnboardingIntro';
export { OnboardingSaved } from './ui/OnboardingSaved';
export type { TrialDraftInfo, TrialNoticeFooter } from './ui/OnboardingNotices';
/*
 * Stage 6 `R-5`(`N6-06` ⓐ): 카드 렌더러 · instrument 해석 · 카드 세션은 `entities/survey` 로 **이동**했다.
 * 기존 소비자(pages · app · 테스트)가 바뀌지 않도록 같은 이름으로 다시 노출한다.
 */
export {
  SurveyDeckSessionProvider as OnboardingSessionProvider,
  useSurveyDeckSession as useOnboardingSession,
  SurveyCardDeck,
  AUTO_ADVANCE_DELAY_MS,
  ChoiceQuestionCard,
  FavoriteBooksCard,
  CapabilityItemCard,
} from '../../entities/survey';
export type {
  SurveyDeckSession as OnboardingSession,
  SurveyCardDeckProps,
  ChoiceQuestionCardProps,
  FavoriteBooksCardProps,
  CapabilityItemCardProps,
} from '../../entities/survey';
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
} from '../../entities/survey';
export type {
  CapabilityItemSurveyCard,
  ChoiceSurveyCard,
  FavoriteBooksSurveyCard,
  ResolvedChoiceOption,
  ResolvedChoiceQuestion,
  SurveyCard,
} from '../../entities/survey';
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
} from '../../entities/survey';
export { buildSubmitRequest } from './model/submitRequest';
export type { SubmitBuildResult } from './model/submitRequest';
export { hasAnyAnswers, useOnboardingDraft, DRAFT_DEBOUNCE_MS } from './model/useOnboardingDraft';
export type { OnboardingDraftController } from './model/useOnboardingDraft';
