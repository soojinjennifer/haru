/**
 * Step 5 응답 조작 — C-8 (`not_observed` 는 결측이지 낮은 점수가 아니다).
 */
import { describe, expect, it } from 'vitest';
import type { OnboardingDraftAnswers } from '@haru/contracts';

import { DEFAULT_ONBOARDING_INSTRUMENT } from '../defaultInstrument';
import {
  clearSurveyAnswer,
  firstUnansweredIndex,
  setSurveyAnswer,
  surveyAnswerFor,
  unansweredCount,
} from '../surveyAnswers';

const instrument = DEFAULT_ONBOARDING_INSTRUMENT;
const codes = instrument.survey.items.map((item) => item.itemCode);

function answerAll(value: 1 | 2 | 3 | 4 | 5 | 'not_observed'): OnboardingDraftAnswers {
  return codes.reduce<OnboardingDraftAnswers>(
    (answers, code) => setSurveyAnswer(answers, instrument, code, value),
    {},
  );
}

describe('응답 기록', () => {
  it('문항별로 값을 저장하고 되읽는다', () => {
    const next = setSurveyAnswer({}, instrument, 'ER1', 4);

    expect(surveyAnswerFor(next, 'ER1')).toBe(4);
    expect(next.capability_items?.instrumentCode).toBe(instrument.survey.code);
  });

  it('같은 문항을 다시 답하면 덮어쓴다 (중복 행이 생기지 않는다)', () => {
    const next = setSurveyAnswer(setSurveyAnswer({}, instrument, 'ER1', 4), instrument, 'ER1', 2);

    expect(next.capability_items?.answers).toHaveLength(1);
    expect(surveyAnswerFor(next, 'ER1')).toBe(2);
  });

  it('`not_observed` 도 유효한 응답이다 — 미응답으로 세지 않는다', () => {
    const next = setSurveyAnswer({}, instrument, 'ER1', 'not_observed');

    expect(surveyAnswerFor(next, 'ER1')).toBe('not_observed');
    expect(unansweredCount(instrument, next)).toBe(codes.length - 1);
  });

  it('응답을 해제하면 다시 미응답이 된다', () => {
    const answered = setSurveyAnswer({}, instrument, 'ER1', 5);
    const cleared = clearSurveyAnswer(answered, instrument, 'ER1');

    expect(surveyAnswerFor(cleared, 'ER1')).toBeUndefined();
    expect(unansweredCount(instrument, cleared)).toBe(codes.length);
  });
});

describe('진행 판정', () => {
  it('10문항을 전부 답하면 남은 수가 0 이다', () => {
    expect(unansweredCount(instrument, answerAll(3))).toBe(0);
    expect(firstUnansweredIndex(instrument, answerAll(3))).toBeNull();
  });

  it('첫 미응답 문항의 위치를 돌려준다', () => {
    const partial = setSurveyAnswer({}, instrument, codes[0] ?? 'ER1', 3);

    expect(firstUnansweredIndex(instrument, partial)).toBe(1);
  });
});
