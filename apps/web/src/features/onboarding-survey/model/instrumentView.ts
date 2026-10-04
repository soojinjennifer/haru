/**
 * instrument → 화면이 그릴 수 있는 형태로 옮기는 **순수 함수** 모음 (결정 **D-A**).
 *
 * 화면은 문항 목록·순서·개수를 모른다. 이 함수들이 instrument 를 읽어 돌려줄 뿐이다.
 *
 * 문구 해석 순서 (구조 제약 ①)
 * ```
 * instrument 값 (서버가 내려준 label / prompt)   ← 우선
 * → copy 모듈 (코드 → 문구)
 * → 없으면 렌더하지 않는다                       ← 사용자에게 machine key 를 보여주지 않는다
 * ```
 * 마지막 규칙 때문에 "Backend 가 새 선택지를 추가할 때는 `label` 을 함께 내려야 한다" 가
 * Backend 요구사항이 된다 (`P2-BIP-06`).
 *
 * ── 카드 평탄화 (재구성 Design Spec §3.3 · §6.3) ──
 * 네 단계가 모두 **한 카드 = 한 문항**이므로 "덱에 들어가는 카드"를 하나의 목록으로 만든다.
 * 카드 종류는 세 가지다: 선택형 문항 · 좋아하는 책(자유 입력) · 역량 문항(Baseline).
 * 통산 카운터 `n / N` 의 `N` 은 **이 목록 길이**이며 숫자를 코드에 적지 않는다 (`AC-2R-09`).
 */
import type {
  ChoiceQuestion,
  ChoiceQuestionId,
  OnboardingInstrument,
  OnboardingStep,
  SurveyItem,
} from '@haru/contracts';

import { onboardingCopy, type QuestionCopy } from '../copy';

/** 화면이 실제로 그리는 선택지 — 문구가 해석된 것만 남는다. */
export interface ResolvedChoiceOption {
  code: string;
  label: string;
  exclusive: boolean;
}

export interface ResolvedChoiceQuestion {
  questionId: ChoiceQuestionId;
  prompt: string;
  description: string | undefined;
  selection: ChoiceQuestion['selection'];
  maxSelections: number | undefined;
  required: boolean;
  options: readonly ResolvedChoiceOption[];
  /** 원본 — 토글 규칙(`toggleChoiceSelection`)에 그대로 넘긴다. */
  question: ChoiceQuestion;
}

function copyFor(questionId: ChoiceQuestionId): QuestionCopy | undefined {
  return onboardingCopy.questions[questionId];
}

function labelFor(questionId: ChoiceQuestionId, code: string): string | undefined {
  const table: Record<string, string> = onboardingCopy.choiceOptions[questionId];
  return table[code];
}

export function resolveQuestion(question: ChoiceQuestion): ResolvedChoiceQuestion | null {
  const fallback = copyFor(question.questionId);
  const prompt = question.prompt ?? fallback?.prompt;

  // 질문 문구를 해석할 수 없으면 그리지 않는다.
  if (prompt === undefined) return null;

  const options = question.options.flatMap<ResolvedChoiceOption>((option) => {
    const label = option.label ?? labelFor(question.questionId, option.code);
    if (label === undefined) return [];

    return [{ code: option.code, label, exclusive: option.exclusive === true }];
  });

  if (options.length === 0) return null;

  return {
    questionId: question.questionId,
    prompt,
    description: question.description ?? fallback?.description,
    selection: question.selection,
    maxSelections: question.maxSelections,
    required: question.required,
    options,
    question,
  };
}

/** 한 단계에 속한 선택형 문항을 `order` 순으로 돌려준다. 없으면 빈 배열이다. */
export function questionsForStep(
  instrument: OnboardingInstrument,
  step: OnboardingStep,
): readonly ResolvedChoiceQuestion[] {
  return instrument.questions
    .filter((question) => question.step === step)
    .sort((left, right) => left.order - right.order)
    .flatMap((question) => {
      const resolved = resolveQuestion(question);
      return resolved === null ? [] : [resolved];
    });
}

/* ── 카드 평탄화 ──────────────────────────────────────────────────────────── */

/** 선택형 문항 카드 (단일·복수 선택). */
export interface ChoiceSurveyCard {
  kind: 'choice';
  /** 전체 통산 식별자 — route 가 바뀌어도 같은 카드는 같은 key 를 갖는다. */
  key: string;
  step: OnboardingStep;
  question: ResolvedChoiceQuestion;
}

/**
 * 좋아하는 책 카드 — 질문지 문항이 아니라 **별도 카드 타입**이다 (`§11.14`).
 * instrument 의 선택형 문항 목록에 없으므로 여기에서 끼운다.
 */
export interface FavoriteBooksSurveyCard {
  kind: 'favorite-books';
  key: string;
  step: OnboardingStep;
}

/** 역량 문항 카드 (Baseline) — 문구가 전부 응답 값이다. */
export interface CapabilityItemSurveyCard {
  kind: 'capability-item';
  key: string;
  step: OnboardingStep;
  item: SurveyItem;
  /** 공통 도입 문장 (`instrument.survey.stem`). */
  stem: string;
}

export type SurveyCard = ChoiceSurveyCard | FavoriteBooksSurveyCard | CapabilityItemSurveyCard;

/** 좋아하는 책 카드가 들어가는 단계·순서 (Q3 · Q5 다음). */
const FAVORITE_BOOKS_STEP: OnboardingStep = 'books_and_interests';
const FAVORITE_BOOKS_KEY = 'books_and_interests.favorite_books';

/**
 * 덱에 들어가는 **모든 카드**를 단계 순서 → 문항 순서대로 평탄화한다.
 *
 * `child_info` 는 카드가 아니다 (프로필 입력 화면 — `R-06`). 카드 수가 instrument 에 따라
 * 달라지므로(`instrument-v2` · `owned-books-empty`) 화면은 이 목록의 길이만 읽는다.
 */
export function surveyCards(
  instrument: OnboardingInstrument,
  steps: readonly OnboardingStep[],
): readonly SurveyCard[] {
  return steps.flatMap<SurveyCard>((step) => {
    const choices = questionsForStep(instrument, step).map<SurveyCard>((question) => ({
      kind: 'choice',
      key: question.questionId,
      step,
      question,
    }));

    const favorites: readonly SurveyCard[] =
      step === FAVORITE_BOOKS_STEP
        ? [{ kind: 'favorite-books', key: FAVORITE_BOOKS_KEY, step }]
        : [];

    const capabilityItems: readonly SurveyCard[] = instrument.survey.items
      .filter(() => step === 'capability_items')
      .sort((left, right) => left.order - right.order)
      .map((item) => ({
        kind: 'capability-item',
        key: `capability_items.${item.itemCode}`,
        step,
        item,
        stem: instrument.survey.stem,
      }));

    return [...choices, ...favorites, ...capabilityItems];
  });
}

/** 한 단계의 카드만 돌려준다 (route 단위 렌더). */
export function cardsForStep(
  cards: readonly SurveyCard[],
  step: OnboardingStep,
): readonly SurveyCard[] {
  return cards.filter((card) => card.step === step);
}

/**
 * 단계별 카드 수 — ProgressBar 구간 비율이다 (`R-02`). 카드가 0장인 단계는 빼고 돌려준다
 * (`child_info` 처럼 카드가 없는 단계가 빈 구간으로 남지 않도록).
 */
export function cardCountsByStep(
  cards: readonly SurveyCard[],
  steps: readonly OnboardingStep[],
): readonly number[] {
  return steps.map((step) => cardsForStep(cards, step).length).filter((count) => count > 0);
}

/** 전체 카드 목록에서 어떤 카드가 몇 번째인지 (통산 카운터 — 1부터 센다). */
export function cardPosition(cards: readonly SurveyCard[], key: string): number {
  return cards.findIndex((card) => card.key === key) + 1;
}
