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
  reading_together: { storyComfort: 'quiet_gentle', readAloudBehavior: 'sits_and_listens' },
  growing_together: { growthGoals: ['emotion_regulation'] },
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

describe('선택 문항은 비어 있어도 제출된다 (Q3 · Q5 · 좋아하는 책)', () => {
  it('`books_and_interests` 응답이 없으면 세 필드를 빈 배열로 채운다', () => {
    const built = buildSubmitRequest(instrument, completeAnswers(), NOW);

    expect(built.ok).toBe(true);
    if (!built.ok) return;

    expect(built.request.answers.books_and_interests).toStrictEqual({
      favoriteBooks: [],
      ownedBooks: [],
      topicTags: [],
    });
  });
});

describe('필수 문항 (`S2-ONB-1`)', () => {
  it('Q1 이 비어 있으면 Step 2 를 지목한다', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, { reading_together: { readAloudBehavior: 'sits_and_listens' } }),
      NOW,
    );

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.missing).toContain('reading_together');
  });

  it('Q4 가 비어 있으면 Step 2 를 지목한다', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, { reading_together: { storyComfort: 'quiet_gentle' } }),
      NOW,
    );

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.missing).toContain('reading_together');
  });

  it('Q2 가 비어 있으면 Step 4 를 지목한다', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, { growing_together: { growthGoals: [] } }),
      NOW,
    );

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.missing).toContain('growing_together');
  });

  it('회피 선택지(`depends_on_the_day`)도 응답으로 인정한다 (approvals §9.1)', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, {
        reading_together: {
          storyComfort: 'depends_on_the_day',
          readAloudBehavior: 'asks_questions',
        },
      }),
      NOW,
    );

    expect(built.ok).toBe(true);
  });

  it('필수 응답이 있으면 그대로 payload 에 담긴다', () => {
    const built = buildSubmitRequest(instrument, completeAnswers(), NOW);

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.request.answers.reading_together).toStrictEqual(REQUIRED_CHOICES.reading_together);
    expect(built.request.answers.growing_together).toStrictEqual({
      growthGoals: ['emotion_regulation'],
    });
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

/**
 * 언어 환경 — **선택 항목 + 기본값 영어** (사용자 결정 2026-10-04).
 * 기본값은 **제출 경계에서만** 채운다 (draft 는 해제 상태를 보존한다 — `childDraft` / `ChildInfoStep`).
 */
describe('언어 환경 기본값 (사용자 결정 2026-10-04)', () => {
  it('전부 해제한 채 제출해도 막히지 않고 `["english"]` 로 채워 보낸다', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, { child_info: { ...CHILD_INFO, languageEnvironment: [] } }),
      NOW,
    );

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.request.answers.child_info.languageEnvironment).toStrictEqual(['english']);
  });

  it('키 자체가 없어도 누락이 아니다 — 같은 기본값으로 채운다', () => {
    const { languageEnvironment: _omitted, ...withoutLanguage } = CHILD_INFO;
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, { child_info: withoutLanguage }),
      NOW,
    );

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.request.answers.child_info.languageEnvironment).toStrictEqual(['english']);
  });

  it('고른 언어는 기본값이 덮어쓰지 않는다', () => {
    const built = buildSubmitRequest(
      instrument,
      completeAnswers(3, {
        child_info: { ...CHILD_INFO, languageEnvironment: ['korean', 'spanish'] },
      }),
      NOW,
    );

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.request.answers.child_info.languageEnvironment).toStrictEqual([
      'korean',
      'spanish',
    ]);
  });
});
