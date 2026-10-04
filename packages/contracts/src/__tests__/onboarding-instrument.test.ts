import { describe, expect, it } from 'vitest';

import {
  CapabilitySchema,
  ChoiceQuestionSchema,
  GROWTH_GOAL_CODES,
  ONBOARDING_CHOICE_QUESTIONS,
  OnboardingDraftAnswersSchema,
  TOPIC_TAG_NOT_SURE,
  applyChoiceAnswer,
  buildOnboardingQuestions,
  choiceQuestionValueSchema,
  createOwnedBooksQuestion,
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
  it('고정 문항이 질문지 Q1 · Q4 · Q3 · Q2 에 대응한다 (Q5 는 카탈로그 기반)', () => {
    expect(ONBOARDING_CHOICE_QUESTIONS.map((question) => question.questionId)).toStrictEqual([
      'reading_together.story_comfort',
      'reading_together.read_aloud_behavior',
      'books_and_interests.topic_tags',
      'growing_together.growth_goals',
    ]);
  });

  it('모든 문항이 schema 를 통과하고 선택지 코드가 유일하다', () => {
    for (const question of ONBOARDING_CHOICE_QUESTIONS) {
      expect(ChoiceQuestionSchema.parse(question).options.length).toBeGreaterThan(1);
    }
  });

  it('선택지 코드가 중복되면 거부한다', () => {
    const question = questionById('growing_together.growth_goals');
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
      'reading_together.story_comfort': true,
      'reading_together.read_aloud_behavior': true,
      'books_and_interests.topic_tags': false,
      'growing_together.growth_goals': true,
    });
  });

  it('필수 단일 선택 문항(Q1)에는 회피 선택지가 있다 (approvals §9.1)', () => {
    expect(
      questionById('reading_together.story_comfort').options.map((option) => option.code),
    ).toContain('depends_on_the_day');
  });

  it('질문지가 정한 복수 선택 상한은 2 다 (Q2 · Q3)', () => {
    expect(questionById('books_and_interests.topic_tags').maxSelections).toBe(2);
    expect(questionById('growing_together.growth_goals').maxSelections).toBe(2);
  });
});

describe('Q5 `owned_books` — 선택지가 카탈로그 데이터다 (`§11.11`)', () => {
  const catalogue = [
    { code: '22222222-2222-4222-8222-000000000001', label: 'Book one' },
    { code: '22222222-2222-4222-8222-000000000002', label: 'Book two' },
  ];

  it('고정 문항 배열에는 들어 있지 않다 (제목이 contracts 에 없다)', () => {
    expect(
      ONBOARDING_CHOICE_QUESTIONS.some(
        (question) => question.questionId === 'books_and_interests.owned_books',
      ),
    ).toBe(false);
  });

  it('카탈로그를 주면 `books_and_interests` 2번 문항으로 붙는다', () => {
    const questions = buildOnboardingQuestions(catalogue);
    const owned = questions.at(-1);

    expect(questions).toHaveLength(ONBOARDING_CHOICE_QUESTIONS.length + 1);
    expect(owned?.questionId).toBe('books_and_interests.owned_books');
    expect(owned?.step).toBe('books_and_interests');
    expect(owned?.order).toBe(2);
    // 복수·무제한·선택 (`§11.11`).
    expect(owned?.selection).toBe('multi');
    expect(owned?.maxSelections).toBeUndefined();
    expect(owned?.required).toBe(false);
    expect(owned?.options.some((option) => option.exclusive === true)).toBe(false);
    expect(ChoiceQuestionSchema.safeParse(owned).success).toBe(true);
  });

  it('카탈로그가 비면 문항이 사라진다 — 카드 수는 파생값이다 (`owned-books-empty`)', () => {
    expect(createOwnedBooksQuestion([])).toBeNull();
    expect(createOwnedBooksQuestion([{ code: catalogue[0]?.code ?? '' }])).toBeNull();
    expect(buildOnboardingQuestions()).toStrictEqual(ONBOARDING_CHOICE_QUESTIONS);
  });

  it('응답은 `books_and_interests.ownedBooks` 에 book id 로 저장된다', () => {
    const codes = catalogue.map((option) => option.code);
    const next = applyChoiceAnswer({}, 'books_and_interests.owned_books', codes);

    expect(next.books_and_interests?.ownedBooks).toStrictEqual(codes);
    expect(readChoiceAnswer(next, 'books_and_interests.owned_books')).toStrictEqual(codes);
    expect(OnboardingDraftAnswersSchema.safeParse(next).success).toBe(true);
  });

  it('book id 가 아니면 저장되지 않는다', () => {
    expect(() =>
      applyChoiceAnswer({}, 'books_and_interests.owned_books', ['Goodnight Moon']),
    ).toThrow();
  });

  it('Q3 응답과 서로 덮어쓰지 않는다 (같은 단계 두 문항)', () => {
    let answers = applyChoiceAnswer({}, 'books_and_interests.topic_tags', ['inquiry']);
    answers = applyChoiceAnswer(answers, 'books_and_interests.owned_books', [
      catalogue[0]?.code ?? '',
    ]);

    expect(answers.books_and_interests?.topicTags).toStrictEqual(['inquiry']);
    expect(answers.books_and_interests?.ownedBooks).toHaveLength(1);
  });
});

describe('D-B — 성장 목표는 4대 역량과 같은 목록이다', () => {
  it('선택지 코드가 Capability enum 과 정확히 같다', () => {
    expect([...GROWTH_GOAL_CODES]).toStrictEqual([...CapabilitySchema.options]);
    expect(
      questionById('growing_together.growth_goals').options.map((option) => option.code),
    ).toStrictEqual([...CapabilitySchema.options]);
  });
});

describe('응답 읽기·쓰기 — 저장 위치 매핑이 한 곳이다', () => {
  it('단일 선택은 길이 0 또는 1 배열로 읽힌다', () => {
    expect(readChoiceAnswer({}, 'reading_together.story_comfort')).toStrictEqual([]);

    const next = applyChoiceAnswer({}, 'reading_together.story_comfort', ['wild_ride']);
    expect(next.reading_together?.storyComfort).toBe('wild_ride');
    expect(readChoiceAnswer(next, 'reading_together.story_comfort')).toStrictEqual(['wild_ride']);
  });

  it('빈 배열을 쓰면 응답이 해제된다', () => {
    const answered = applyChoiceAnswer({}, 'reading_together.read_aloud_behavior', ['acts_it_out']);
    const cleared = applyChoiceAnswer(answered, 'reading_together.read_aloud_behavior', []);
    expect(cleared.reading_together?.readAloudBehavior).toBeUndefined();
  });

  it('복수 선택은 배열 그대로 저장된다', () => {
    const next = applyChoiceAnswer({}, 'growing_together.growth_goals', [
      'emotion_regulation',
      'cognitive_flexibility',
    ]);
    expect(next.growing_together?.growthGoals).toStrictEqual([
      'emotion_regulation',
      'cognitive_flexibility',
    ]);
    expect(OnboardingDraftAnswersSchema.safeParse(next).success).toBe(true);
  });

  it('instrument 가 모르는 코드는 저장되지 않는다', () => {
    expect(() =>
      applyChoiceAnswer({}, 'growing_together.growth_goals', ['reading_habit']),
    ).toThrow();
    expect(
      choiceQuestionValueSchema('books_and_interests.topic_tags').safeParse('animals').success,
    ).toBe(false);
    expect(
      choiceQuestionValueSchema('books_and_interests.topic_tags').safeParse('narrative').success,
    ).toBe(true);
  });

  it('다른 단계의 응답을 덮어쓰지 않는다', () => {
    const withChild = { child_info: { firstName: 'Emma' } };
    const next = applyChoiceAnswer(withChild, 'books_and_interests.topic_tags', ['inquiry']);
    expect(next.child_info?.firstName).toBe('Emma');
  });
});

describe('선택 토글 규칙', () => {
  const topics = questionById('books_and_interests.topic_tags');
  const goals = questionById('growing_together.growth_goals');
  const comfort = questionById('reading_together.story_comfort');

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
        questionId: 'growing_together.growth_goals',
        step: 'growing_together',
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
    estimates: { profileMinutes: 1, surveyMinutes: 3 },
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
      growing_together: {
        growthGoals: ['emotion_regulation' as const, 'cognitive_flexibility' as const],
      },
      reading_together: { storyComfort: 'wild_ride' as const },
    };
    const pruned = pruneUnknownChoiceAnswers(reduced, answers);
    expect(pruned.growing_together?.growthGoals).toStrictEqual(['emotion_regulation']);
    // instrument 에서 사라진 문항의 응답은 건드리지 않는다 — 서버가 호환을 판단한다.
    expect(pruned.reading_together?.storyComfort).toBe('wild_ride');
  });
});

describe('필수 응답 판정 — instrument 가 소유한다 (`S2-ONB-1`)', () => {
  const instrument: OnboardingInstrument = {
    code: 'onboarding_v1_1',
    version: '1.1.0',
    questions: [...ONBOARDING_CHOICE_QUESTIONS],
    survey,
    estimates: { profileMinutes: 1, surveyMinutes: 3 },
  };

  it('아무것도 응답하지 않으면 필수 문항 3개가 남는다', () => {
    expect(unansweredRequiredQuestions(instrument, {})).toStrictEqual([
      'reading_together.story_comfort',
      'growing_together.growth_goals',
      'reading_together.read_aloud_behavior',
    ]);
  });

  it('단계를 주면 그 단계만 본다 (CTA 판정)', () => {
    expect(unansweredRequiredQuestions(instrument, {}, 'reading_together')).toStrictEqual([
      'reading_together.story_comfort',
      'reading_together.read_aloud_behavior',
    ]);
    // Q3 는 선택이므로 Step 3 은 언제나 비어 있다.
    expect(unansweredRequiredQuestions(instrument, {}, 'books_and_interests')).toStrictEqual([]);
  });

  it('회피 선택지를 고른 것도 응답이다 (approvals §9.1)', () => {
    const answers = applyChoiceAnswer({}, 'reading_together.story_comfort', ['depends_on_the_day']);

    expect(unansweredRequiredQuestions(instrument, answers, 'reading_together')).toStrictEqual([
      'reading_together.read_aloud_behavior',
    ]);
  });

  it('필수가 빈 단계를 `OnboardingStep` 순서로 돌려준다', () => {
    expect(stepsMissingRequiredAnswers(instrument, {})).toStrictEqual([
      'reading_together',
      'growing_together',
    ]);
  });

  it('필수를 모두 채우면 남는 단계가 없다', () => {
    let answers = applyChoiceAnswer({}, 'reading_together.story_comfort', ['quiet_gentle']);
    answers = applyChoiceAnswer(answers, 'reading_together.read_aloud_behavior', [
      'sits_and_listens',
    ]);
    answers = applyChoiceAnswer(answers, 'growing_together.growth_goals', ['emotion_regulation']);

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
