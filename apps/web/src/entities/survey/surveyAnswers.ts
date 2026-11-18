/**
 * Step 5 응답 조작 — **순수 함수**. 문항 목록은 instrument 가 가지고 있고 여기에는 없다.
 *
 * `not_observed` 는 **유효한 응답**이다 (C-8). "아직 응답하지 않음" 과 구분된다 —
 * 전자는 결측으로 집계에서 빠지고, 후자는 제출 자체를 막는다.
 */
import type {
  CapabilityItemAnswer,
  OnboardingDraftAnswers,
  OnboardingInstrument,
  SurveyAnswerValue,
} from '@haru/contracts';

export function surveyAnswerFor(
  answers: OnboardingDraftAnswers,
  itemCode: string,
): SurveyAnswerValue | undefined {
  return answers.capability_items?.answers.find((answer) => answer.itemCode === itemCode)?.value;
}

/** 응답 1건을 기록한다. 같은 문항을 다시 답하면 덮어쓴다. */
export function setSurveyAnswer(
  answers: OnboardingDraftAnswers,
  instrument: OnboardingInstrument,
  itemCode: string,
  value: SurveyAnswerValue,
): OnboardingDraftAnswers {
  const current = answers.capability_items?.answers ?? [];
  const next: CapabilityItemAnswer[] = current.some((answer) => answer.itemCode === itemCode)
    ? current.map((answer) => (answer.itemCode === itemCode ? { itemCode, value } : answer))
    : [...current, { itemCode, value }];

  return {
    ...answers,
    capability_items: { instrumentCode: instrument.survey.code, answers: next },
  };
}

/** 응답 1건을 지운다 (카드 우상단 "Clear this answer" — Design Spec §2.10 Step 5). */
export function clearSurveyAnswer(
  answers: OnboardingDraftAnswers,
  instrument: OnboardingInstrument,
  itemCode: string,
): OnboardingDraftAnswers {
  const current = answers.capability_items?.answers ?? [];

  return {
    ...answers,
    capability_items: {
      instrumentCode: instrument.survey.code,
      answers: current.filter((answer) => answer.itemCode !== itemCode),
    },
  };
}

/** 아직 응답하지 않은 문항 수. 0 이면 제출할 수 있다. */
export function unansweredCount(
  instrument: OnboardingInstrument,
  answers: OnboardingDraftAnswers,
): number {
  return instrument.survey.items.filter(
    (item) => surveyAnswerFor(answers, item.itemCode) === undefined,
  ).length;
}

/** 첫 미응답 문항의 index. 전부 응답했으면 `null`. */
export function firstUnansweredIndex(
  instrument: OnboardingInstrument,
  answers: OnboardingDraftAnswers,
): number | null {
  const index = instrument.survey.items.findIndex(
    (item) => surveyAnswerFor(answers, item.itemCode) === undefined,
  );

  return index === -1 ? null : index;
}
