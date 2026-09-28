/**
 * 제출 payload — AC-2-26 · C-12 · 결정 **D-A** 구조 제약 ④ · **D-C** + `S2-ONB-1`.
 *
 * `S2-ONB-1` (approvals §9.1): 질문지 Q1 · Q4(Step 2) · Q2(Step 4)가 필수가 되었다.
 * Q3(Step 3)는 선택으로 남는다.
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

/** 필수 문항(Q1 · Q4 · Q2) 응답 — `S2-ONB-1`. */
const REQUIRED_CHOICES: OnboardingDraftAnswers = {
  temperament: { storyComfort: 'quiet_gentle', readAloudBehavior: 'sits_and_listens' },
  goals: { growthGoals: ['emotion_regulation'] },
};

function completeAnswers(
  value: 1 | 2 | 3 | 4 | 5 | 'not_observed' = 3,
  overrides: OnboardingDraftAnswers = {},
): OnboardingDraftAnswers {
  const withSurvey = instrument.survey.items.reduce<OnboardingDraftAnswers>(
    (answers, item) => setSurveyAnswer(answers, instrument, item.itemCode, value),
    { child_info: { ...CHILD_INFO }, ...REQUIRED_CHOICES },
  );

  return { ...withSurvey, ...overrides };
}

describe('선택 문항은 비어 있어도 제출된다 (Q3 — `S2-ONB-1` 선택 유지)', () => {
  it('Step 3 응답이 없으면 빈 배열로 채운다', () => {
    const built = buildSubmitRequest(instrument, completeAnswers(), NOW);

    expect(built.ok).toBe(true);
    if (!built.ok) return;

    expect(built.request.answers.books).toStrictEqual({
      favoriteBooks: [],
      homeBooks: [],
      topicTags: [],
    });
  });
});

describe('필수 문항 (`S2-ONB-1`)', () => {
  it('Q1 이 비어 있으면 Step 2 를 지목한다', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, { temperament: { readAloudBehavior: 'sits_and_listens' } }),
      NOW,
    );

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.missing).toContain('temperament');
  });

  it('Q4 가 비어 있으면 Step 2 를 지목한다', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, { temperament: { storyComfort: 'quiet_gentle' } }),
      NOW,
    );

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.missing).toContain('temperament');
  });

  it('Q2 가 비어 있으면 Step 4 를 지목한다', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, { goals: { growthGoals: [] } }),
      NOW,
    );

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.missing).toContain('goals');
  });

  it('회피 선택지(`depends_on_the_day`)도 응답으로 인정한다 (approvals §9.1)', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, {
        temperament: { storyComfort: 'depends_on_the_day', readAloudBehavior: 'asks_questions' },
      }),
      NOW,
    );

    expect(built.ok).toBe(true);
  });

  it('필수 응답이 있으면 그대로 payload 에 담긴다', () => {
    const built = buildSubmitRequest(instrument, completeAnswers(), NOW);

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.request.answers.temperament).toStrictEqual(REQUIRED_CHOICES.temperament);
    expect(built.request.answers.goals).toStrictEqual({ growthGoals: ['emotion_regulation'] });
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
