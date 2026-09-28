import { describe, expect, it } from 'vitest';

import {
  CapabilitySchema,
  ChoiceQuestionSchema,
  GROWTH_GOAL_CODES,
  ONBOARDING_CHOICE_QUESTIONS,
  OnboardingDraftAnswersSchema,
  TOPIC_TAG_NOT_SURE,
  applyChoiceAnswer,
  choiceQuestionValueSchema,
  stepsMissingRequiredAnswers,
  unansweredRequiredQuestions,
  instrumentRefOf,
  pruneUnknownChoiceAnswers,
  readChoiceAnswer,
  toggleChoiceSelection,
  type ChoiceQuestion,
  type OnboardingInstrument,
} from '../index.js';

/**
 * 온보딩 instrument — 결정 **D-A** (`docs/decisions/stage-2-approvals.md` §8) 구조 제약 검증.
 * 근거 문서: `docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md`.
 */

const questionById = (id: string): ChoiceQuestion => {
  const found = ONBOARDING_CHOICE_QUESTIONS.find((question) => question.questionId === id);
  if (found === undefined) throw new Error(`missing question ${id}`);
  return found;
};

describe('기본 문항 구조 — 질문지 v1.1', () => {
  it('Step 2·3·4 문항이 질문지 Q1 · Q4 · Q3 · Q2 에 대응한다', () => {
    expect(ONBOARDING_CHOICE_QUESTIONS.map((question) => question.questionId)).toStrictEqual([
      'temperament.story_comfort',
      'temperament.read_aloud_behavior',
      'books.topic_tags',
      'goals.growth_goals',
    ]);
  });

  it('모든 문항이 schema 를 통과하고 선택지 코드가 유일하다', () => {
    for (const question of ONBOARDING_CHOICE_QUESTIONS) {
      expect(ChoiceQuestionSchema.parse(question).options.length).toBeGreaterThan(1);
    }
  });

  it('선택지 코드가 중복되면 거부한다', () => {
    const question = questionById('goals.growth_goals');
    expect(
      ChoiceQuestionSchema.safeParse({
        ...question,
        options: [{ code: 'a' }, { code: 'a' }],
      }).success,
    ).toBe(false);
  });

  it('구조 정의에는 표시 문구가 없다 (구조 제약 ① — 문구는 apps/web copy 소유)', () => {
    const labels = ONBOARDING_CHOICE_QUESTIONS.flatMap((question) =>
      question.options.map((option) => option.label),
    );
    expect(labels.every((label) => label === undefined)).toBe(true);
  });

  it('질문지가 Required 로 규정한 Q1 · Q4 · Q2 만 필수다 (`S2-ONB-1`)', () => {
    expect(
      Object.fromEntries(
        ONBOARDING_CHOICE_QUESTIONS.map((question) => [question.questionId, question.required]),
      ),
    ).toStrictEqual({
      'temperament.story_comfort': true,
      'temperament.read_aloud_behavior': true,
      'books.topic_tags': false,
      'goals.growth_goals': true,
    });
  });

  it('필수 단일 선택 문항(Q1)에는 회피 선택지가 있다 (approvals §9.1)', () => {
    expect(
      questionById('temperament.story_comfort').options.map((option) => option.code),
    ).toContain('depends_on_the_day');
  });

  it('질문지가 정한 복수 선택 상한은 2 다 (Q2 · Q3)', () => {
    expect(questionById('books.topic_tags').maxSelections).toBe(2);
    expect(questionById('goals.growth_goals').maxSelections).toBe(2);
  });
});

describe('D-B — 성장 목표는 4대 역량과 같은 목록이다', () => {
  it('선택지 코드가 Capability enum 과 정확히 같다', () => {
    expect([...GROWTH_GOAL_CODES]).toStrictEqual([...CapabilitySchema.options]);
    expect(questionById('goals.growth_goals').options.map((option) => option.code)).toStrictEqual([
      ...CapabilitySchema.options,
    ]);
  });
});

describe('응답 읽기·쓰기 — 저장 위치 매핑이 한 곳이다', () => {
  it('단일 선택은 길이 0 또는 1 배열로 읽힌다', () => {
    expect(readChoiceAnswer({}, 'temperament.story_comfort')).toStrictEqual([]);

    const next = applyChoiceAnswer({}, 'temperament.story_comfort', ['wild_ride']);
    expect(next.temperament?.storyComfort).toBe('wild_ride');
    expect(readChoiceAnswer(next, 'temperament.story_comfort')).toStrictEqual(['wild_ride']);
  });

  it('빈 배열을 쓰면 응답이 해제된다', () => {
    const answered = applyChoiceAnswer({}, 'temperament.read_aloud_behavior', ['acts_it_out']);
    const cleared = applyChoiceAnswer(answered, 'temperament.read_aloud_behavior', []);
    expect(cleared.temperament?.readAloudBehavior).toBeUndefined();
  });

  it('복수 선택은 배열 그대로 저장된다', () => {
    const next = applyChoiceAnswer({}, 'goals.growth_goals', [
      'emotion_regulation',
      'cognitive_flexibility',
    ]);
    expect(next.goals?.growthGoals).toStrictEqual(['emotion_regulation', 'cognitive_flexibility']);
    expect(OnboardingDraftAnswersSchema.safeParse(next).success).toBe(true);
  });

  it('instrument 가 모르는 코드는 저장되지 않는다', () => {
    expect(() => applyChoiceAnswer({}, 'goals.growth_goals', ['reading_habit'])).toThrow();
    expect(choiceQuestionValueSchema('books.topic_tags').safeParse('animals').success).toBe(false);
    expect(choiceQuestionValueSchema('books.topic_tags').safeParse('narrative').success).toBe(true);
  });

  it('다른 단계의 응답을 덮어쓰지 않는다', () => {
    const withChild = { child_info: { firstName: 'Emma' } };
    const next = applyChoiceAnswer(withChild, 'books.topic_tags', ['inquiry']);
    expect(next.child_info?.firstName).toBe('Emma');
  });
});

describe('선택 토글 규칙', () => {
  const topics = questionById('books.topic_tags');
  const goals = questionById('goals.growth_goals');
  const comfort = questionById('temperament.story_comfort');

  it('단일 선택은 같은 값을 다시 누르면 해제된다', () => {
    expect(toggleChoiceSelection(comfort, [], 'quiet_gentle')).toStrictEqual(['quiet_gentle']);
    expect(toggleChoiceSelection(comfort, ['quiet_gentle'], 'quiet_gentle')).toStrictEqual([]);
    expect(toggleChoiceSelection(comfort, ['quiet_gentle'], 'wild_ride')).toStrictEqual([
      'wild_ride',
    ]);
  });

  it('배타 선택지를 고르면 나머지가 해제된다 (질문지 Q3 "not sure yet")', () => {
    expect(
      toggleChoiceSelection(topics, ['narrative', 'social'], TOPIC_TAG_NOT_SURE),
    ).toStrictEqual([TOPIC_TAG_NOT_SURE]);
  });

  it('배타 선택지가 켜진 상태에서 일반 선택지를 고르면 배타 선택이 해제된다', () => {
    expect(toggleChoiceSelection(topics, [TOPIC_TAG_NOT_SURE], 'inquiry')).toStrictEqual([
      'inquiry',
    ]);
  });

  it('상한에 도달하면 가장 오래된 선택이 밀려난다', () => {
    expect(
      toggleChoiceSelection(
        goals,
        ['emotion_regulation', 'cognitive_flexibility'],
        'intrinsic_motivation',
      ),
    ).toStrictEqual(['cognitive_flexibility', 'intrinsic_motivation']);
  });
});

/** 구조 검증용 최소 survey — 이 파일의 관심사는 선택형 문항이라 문구는 자리표시자다. */
const survey = {
  code: 'baseline_v1' as const,
  version: '1.0.0',
  stem: 'In the past two weeks…',
  scaleLabels: [
    { value: 1 as const, label: 'Never' },
    { value: 2 as const, label: 'Rarely' },
    { value: 3 as const, label: 'Sometimes' },
    { value: 4 as const, label: 'Often' },
    { value: 5 as const, label: 'Almost always' },
    { value: 'not_observed' as const, label: 'Not yet' },
  ],
  items: ['ER1', 'ER2', 'AG1', 'AG2', 'AG3', 'CF1', 'CF2', 'IM1', 'IM2', 'IM3'].map(
    (itemCode, index) => ({
      itemCode,
      capability: CapabilitySchema.options[Math.floor(index / 3)] ?? 'intrinsic_motivation',
      order: index + 1,
      prompt: `prompt ${String(index + 1)}`,
    }),
  ),
};

describe('instrument 교체 — 화면 코드를 고치지 않고 문항이 바뀐다', () => {
  const reduced: OnboardingInstrument = {
    code: 'onboarding_v2',
    version: '2.0.0',
    questions: [
      {
        questionId: 'goals.growth_goals',
        step: 'goals',
        order: 1,
        selection: 'multi',
        maxSelections: 1,
        required: false,
        options: [
          { code: 'emotion_regulation', label: 'Big feelings' },
          { code: 'intrinsic_motivation' },
        ],
      },
    ],
    survey,
  };

  it('문항이 줄어든 instrument 도 그대로 받아들인다', () => {
    expect(reduced.questions).toHaveLength(1);
    expect(instrumentRefOf(reduced)).toStrictEqual({ code: 'onboarding_v2', version: '2.0.0' });
  });

  it('서버가 문구를 함께 내려줄 수 있다 (copy 모듈보다 우선)', () => {
    expect(reduced.questions[0]?.options[0]?.label).toBe('Big feelings');
  });

  it('새 instrument 에 없는 기존 응답은 정리된다', () => {
    const answers = {
      goals: { growthGoals: ['emotion_regulation' as const, 'cognitive_flexibility' as const] },
      temperament: { storyComfort: 'wild_ride' as const },
    };
    const pruned = pruneUnknownChoiceAnswers(reduced, answers);
    expect(pruned.goals?.growthGoals).toStrictEqual(['emotion_regulation']);
    // instrument 에서 사라진 문항의 응답은 건드리지 않는다 — 서버가 호환을 판단한다.
    expect(pruned.temperament?.storyComfort).toBe('wild_ride');
  });
});

describe('필수 응답 판정 — instrument 가 소유한다 (`S2-ONB-1`)', () => {
  const instrument: OnboardingInstrument = {
    code: 'onboarding_v1_1',
    version: '1.1.0',
    questions: [...ONBOARDING_CHOICE_QUESTIONS],
    survey,
  };

  it('아무것도 응답하지 않으면 필수 문항 3개가 남는다', () => {
    expect(unansweredRequiredQuestions(instrument, {})).toStrictEqual([
      'temperament.story_comfort',
      'goals.growth_goals',
      'temperament.read_aloud_behavior',
    ]);
  });

  it('단계를 주면 그 단계만 본다 (CTA 판정)', () => {
    expect(unansweredRequiredQuestions(instrument, {}, 'temperament')).toStrictEqual([
      'temperament.story_comfort',
      'temperament.read_aloud_behavior',
    ]);
    // Q3 는 선택이므로 Step 3 은 언제나 비어 있다.
    expect(unansweredRequiredQuestions(instrument, {}, 'books')).toStrictEqual([]);
  });

  it('회피 선택지를 고른 것도 응답이다 (approvals §9.1)', () => {
    const answers = applyChoiceAnswer({}, 'temperament.story_comfort', ['depends_on_the_day']);

    expect(unansweredRequiredQuestions(instrument, answers, 'temperament')).toStrictEqual([
      'temperament.read_aloud_behavior',
    ]);
  });

  it('필수가 빈 단계를 `OnboardingStep` 순서로 돌려준다', () => {
    expect(stepsMissingRequiredAnswers(instrument, {})).toStrictEqual(['temperament', 'goals']);
  });

  it('필수를 모두 채우면 남는 단계가 없다', () => {
    let answers = applyChoiceAnswer({}, 'temperament.story_comfort', ['quiet_gentle']);
    answers = applyChoiceAnswer(answers, 'temperament.read_aloud_behavior', ['sits_and_listens']);
    answers = applyChoiceAnswer(answers, 'goals.growth_goals', ['emotion_regulation']);

    expect(stepsMissingRequiredAnswers(instrument, answers)).toStrictEqual([]);
    expect(unansweredRequiredQuestions(instrument, answers)).toStrictEqual([]);
  });

  it('필수 여부는 instrument 응답이 정한다 — 전부 선택인 instrument 는 아무것도 막지 않는다', () => {
    const optional: OnboardingInstrument = {
      ...instrument,
      questions: ONBOARDING_CHOICE_QUESTIONS.map((question) => ({ ...question, required: false })),
    };

    expect(stepsMissingRequiredAnswers(optional, {})).toStrictEqual([]);
  });
});
