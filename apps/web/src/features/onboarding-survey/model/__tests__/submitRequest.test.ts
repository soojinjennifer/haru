/**
 * 제출 payload — AC-2-26 · C-12 · 결정 **D-A** 구조 제약 ④ · **D-C**.
 */
import { describe, expect, it } from 'vitest';
import {
  ONBOARDING_INSTRUMENT_CODE,
  ONBOARDING_INSTRUMENT_VERSION,
  type OnboardingDraftAnswers,
} from '@haru/contracts';

import { DEFAULT_ONBOARDING_INSTRUMENT } from '../defaultInstrument';
import { buildSubmitRequest } from '../submitRequest';
import { setSurveyAnswer } from '../surveyAnswers';

const instrument = DEFAULT_ONBOARDING_INSTRUMENT;
const NOW = new Date('2026-09-26T12:00:00Z');

const CHILD_INFO: NonNullable<OnboardingDraftAnswers['child_info']> = {
  firstName: 'Nova',
  birthYearMonth: '2021-04',
  gender: null,
  languageEnvironment: ['english'],
};

function completeAnswers(
  value: 1 | 2 | 3 | 4 | 5 | 'not_observed' = 3,
  overrides: OnboardingDraftAnswers = {},
): OnboardingDraftAnswers {
  const withSurvey = instrument.survey.items.reduce<OnboardingDraftAnswers>(
    (answers, item) => setSurveyAnswer(answers, instrument, item.itemCode, value),
    { child_info: { ...CHILD_INFO } },
  );

  return { ...withSurvey, ...overrides };
}

describe('선택 단계는 비어 있어도 제출된다 (결정 D-C)', () => {
  it('Step 2~4 응답이 없으면 빈 배열·빈 객체로 채운다', () => {
    const built = buildSubmitRequest(instrument, completeAnswers(), NOW);

    expect(built.ok).toBe(true);
    if (!built.ok) return;

    expect(built.request.answers.temperament).toStrictEqual({});
    expect(built.request.answers.books).toStrictEqual({
      favoriteBooks: [],
      homeBooks: [],
      topicTags: [],
    });
    expect(built.request.answers.goals).toStrictEqual({ growthGoals: [] });
  });
});

describe('instrument 참조 (구조 제약 ④)', () => {
  it('제출에 instrument code · version 이 담긴다', () => {
    const built = buildSubmitRequest(instrument, completeAnswers(), NOW);

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.request.instrument).toStrictEqual({
      code: ONBOARDING_INSTRUMENT_CODE,
      version: ONBOARDING_INSTRUMENT_VERSION,
    });
  });
});

describe('완결성 (AC-2-26)', () => {
  it('10문항 전부가 있어야 제출할 수 있다', () => {
    const partial = setSurveyAnswer({ child_info: { ...CHILD_INFO } }, instrument, 'ER1', 3);
    const built = buildSubmitRequest(instrument, partial, NOW);

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.missing).toContain('capability_items');
  });

  it('Step 1 이 비어 있으면 그 단계를 지목한다', () => {
    const built = buildSubmitRequest(instrument, completeAnswers(3, { child_info: {} }), NOW);

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.missing).toContain('child_info');
  });

  it('나이 범위를 벗어나면 Step 1 로 돌려보낸다 (C-10)', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, { child_info: { ...CHILD_INFO, birthYearMonth: '2025-01' } }),
      NOW,
    );

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.missing).toStrictEqual(['child_info']);
  });

  it('`not_observed` 만으로도 제출할 수 있다 (결측은 유효한 응답이다 — C-8)', () => {
    expect(buildSubmitRequest(instrument, completeAnswers('not_observed'), NOW).ok).toBe(true);
  });
});
