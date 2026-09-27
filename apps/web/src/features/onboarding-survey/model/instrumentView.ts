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
 */
import type {
  ChoiceQuestion,
  ChoiceQuestionId,
  OnboardingInstrument,
  OnboardingStep,
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

/** 한 단계에 속한 문항을 `order` 순으로 돌려준다. 없으면 빈 배열이다. */
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
