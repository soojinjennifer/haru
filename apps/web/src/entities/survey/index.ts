/**
 * `entities/survey` 공개 진입점 — 설문 카드 렌더러 · instrument 해석 · 카드 세션 · 소개 골격 · 카드 문구.
 *
 * Stage 6 `R-5`(`N6-06` ⓐ → `D6-3`): 온보딩 설문(`features/onboarding-survey`)과 설문 재응답(`features/survey-update`)이
 * 함께 쓰는 코드를 `features/onboarding-survey` 에서 이 레이어로 **이동만** 했다 (feature 간 import 금지 — 동작·DOM 변경 0).
 */
export { surveyCardCopy } from './copy';
export type { QuestionCopy } from './copy';
export {
  cardCountsByStep,
  cardPosition,
  cardsForStep,
  questionsForStep,
  resolveQuestion,
  surveyCards,
} from './instrumentView';
export type {
  CapabilityItemSurveyCard,
  ChoiceSurveyCard,
  FavoriteBooksSurveyCard,
  ResolvedChoiceOption,
  ResolvedChoiceQuestion,
  SurveyCard,
} from './instrumentView';
export {
  clearSurveyAnswer,
  firstUnansweredIndex,
  setSurveyAnswer,
  surveyAnswerFor,
  unansweredCount,
} from './surveyAnswers';
export { SurveyDeckSessionProvider, useSurveyDeckSession } from './deckSession';
export type { SurveyDeckSession, SurveyDeckSessionProviderProps } from './deckSession';
export { SurveyCardDeck, AUTO_ADVANCE_DELAY_MS } from './ui/SurveyCardDeck';
export type { SurveyCardDeckProps } from './ui/SurveyCardDeck';
export { ChoiceQuestionCard } from './ui/ChoiceQuestionCard';
export type { ChoiceQuestionCardProps } from './ui/ChoiceQuestionCard';
export { FavoriteBooksCard } from './ui/FavoriteBooksCard';
export type { FavoriteBooksCardProps } from './ui/FavoriteBooksCard';
export { CapabilityItemCard } from './ui/CapabilityItemCard';
export type { CapabilityItemCardProps } from './ui/CapabilityItemCard';
export { SurveyIntroLayout } from './ui/SurveyIntroLayout';
export type { SurveyIntroLayoutProps } from './ui/SurveyIntroLayout';
