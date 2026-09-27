import { describe, expect, it } from 'vitest';

import {
  BASELINE_INSTRUMENT_CODE,
  BooksAnswersSchema,
  CapabilityItemsAnswersSchema,
  CompleteCapabilityItemsAnswersSchema,
  FAVORITE_BOOKS_MAX,
  GoalsAnswersSchema,
  ONBOARDING_DRAFT_MAX_AGE_DAYS,
  ONBOARDING_DRAFT_SCHEMA_VERSION,
  OnboardingDraftSchema,
  OnboardingStateSchema,
  OnboardingStepSchema,
  SURVEY_ITEM_COUNT,
  SURVEY_SCALE_LABEL_COUNT,
  SaveOnboardingStepRequestSchema,
  SubmitOnboardingRequestSchema,
  ONBOARDING_CHOICE_QUESTIONS,
  ONBOARDING_INSTRUMENT_CODE,
  ONBOARDING_INSTRUMENT_VERSION,
  SurveyInstrumentSchema,
  TemperamentAnswersSchema,
  createSubmitOnboardingRequestSchema,
  isOnboardingDraftExpired,
} from '../index.js';

/** 온보딩 5단계 contracts — `docs/API_CONTRACTS.md` §3.4 · §4 Stage 2 (C-8 · C-9 · C-12). */
const NOW = new Date('2026-09-25T12:00:00Z');

const ITEM_CODES = ['ER1', 'ER2', 'AG1', 'AG2', 'AG3', 'CF1', 'CF2', 'IM1', 'IM2', 'IM3'] as const;
const CAPABILITY_BY_PREFIX = {
  ER: 'emotion_regulation',
  AG: 'self_directed_agency',
  CF: 'cognitive_flexibility',
  IM: 'intrinsic_motivation',
} as const;

const instrument = {
  code: BASELINE_INSTRUMENT_CODE,
  version: '1.0.0',
  stem: 'In the past two weeks…',
  scaleLabels: [
    { value: 1, label: 'Never' },
    { value: 2, label: 'Rarely' },
    { value: 3, label: 'Sometimes' },
    { value: 4, label: 'Often' },
    { value: 5, label: 'Almost always' },
    { value: 'not_observed', label: "Haven't had the chance to see this yet" },
  ],
  items: ITEM_CODES.map((itemCode, index) => ({
    itemCode,
    capability: CAPABILITY_BY_PREFIX[itemCode.slice(0, 2) as keyof typeof CAPABILITY_BY_PREFIX],
    order: index + 1,
    prompt: `prompt ${String(index + 1)}`,
  })),
};

const instrumentRef = {
  code: ONBOARDING_INSTRUMENT_CODE,
  version: ONBOARDING_INSTRUMENT_VERSION,
};

/** `GET /v1/onboarding` 이 내려주는 형태 — 선택형 문항 + Step 5 설문. */
const onboardingInstrument = {
  ...instrumentRef,
  questions: ONBOARDING_CHOICE_QUESTIONS,
  survey: instrument,
};

const completeAnswers = {
  child_info: {
    firstName: 'Emma',
    birthYearMonth: '2021-04',
    gender: null,
    languageEnvironment: ['english'],
    readingRoutine: 'daily',
  },
  temperament: {
    storyComfort: 'some_adventure',
    readAloudBehavior: 'asks_questions',
  },
  books: {
    favoriteBooks: [{ title: 'The Very Hungry Caterpillar' }],
    homeBooks: [{ title: 'Goodnight Moon' }],
    topicTags: ['narrative'],
  },
  goals: { growthGoals: ['emotion_regulation'] },
  capability_items: {
    instrumentCode: BASELINE_INSTRUMENT_CODE,
    answers: ITEM_CODES.map((itemCode) => ({ itemCode, value: 3 as const })),
  },
};

describe('SurveyInstrument — C-8 · D-04', () => {
  it('문항 10개 · 척도 라벨 6개를 요구한다', () => {
    expect(SURVEY_ITEM_COUNT).toBe(10);
    expect(SURVEY_SCALE_LABEL_COUNT).toBe(6);
    expect(SurveyInstrumentSchema.parse(instrument).items).toHaveLength(10);
  });

  it('문항 수가 다르면 거부한다', () => {
    expect(
      SurveyInstrumentSchema.safeParse({ ...instrument, items: instrument.items.slice(0, 9) })
        .success,
    ).toBe(false);
  });

  it('문항 코드는 역량 약어 + 숫자여야 한다', () => {
    const items = instrument.items.map((item, index) =>
      index === 0 ? { ...item, itemCode: 'XX1' } : item,
    );
    expect(SurveyInstrumentSchema.safeParse({ ...instrument, items }).success).toBe(false);
  });

  it('instrument code 는 baseline_v1 하나다', () => {
    expect(SurveyInstrumentSchema.safeParse({ ...instrument, code: 'baseline_v2' }).success).toBe(
      false,
    );
  });
});

describe('CapabilityItemsAnswers — draft vs submit', () => {
  it('draft 는 일부 응답을 허용한다', () => {
    expect(
      CapabilityItemsAnswersSchema.safeParse({
        instrumentCode: BASELINE_INSTRUMENT_CODE,
        answers: [{ itemCode: 'ER1', value: 4 }],
      }).success,
    ).toBe(true);
  });

  it('submit 은 10문항 전부를 요구한다', () => {
    expect(
      CompleteCapabilityItemsAnswersSchema.safeParse({
        instrumentCode: BASELINE_INSTRUMENT_CODE,
        answers: [{ itemCode: 'ER1', value: 4 }],
      }).success,
    ).toBe(false);
    expect(
      CompleteCapabilityItemsAnswersSchema.safeParse(completeAnswers.capability_items).success,
    ).toBe(true);
  });

  it("'not_observed' 도 유효한 응답이다", () => {
    expect(
      CompleteCapabilityItemsAnswersSchema.safeParse({
        instrumentCode: BASELINE_INSTRUMENT_CODE,
        answers: ITEM_CODES.map((itemCode) => ({ itemCode, value: 'not_observed' })),
      }).success,
    ).toBe(true);
  });
});

describe('Step 2 · 3 · 4 응답', () => {
  it('기질 2문항은 모두 선택이다 (미응답 허용 — D-C)', () => {
    expect(TemperamentAnswersSchema.parse({})).toEqual({});
    expect(TemperamentAnswersSchema.safeParse({ storyComfort: 'very_calm' }).success).toBe(false);
    expect(TemperamentAnswersSchema.parse({ storyComfort: 'quiet_gentle' }).storyComfort).toBe(
      'quiet_gentle',
    );
  });

  it('좋아하는 책은 최대 5권이며 bookId 또는 title 중 하나가 필요하다 (PRD §7.2)', () => {
    expect(FAVORITE_BOOKS_MAX).toBe(5);
    expect(
      BooksAnswersSchema.safeParse({
        favoriteBooks: Array.from({ length: 6 }, () => ({ title: 'x' })),
        homeBooks: [],
        topicTags: [],
      }).success,
    ).toBe(false);
    expect(
      BooksAnswersSchema.safeParse({ favoriteBooks: [{}], homeBooks: [], topicTags: [] }).success,
    ).toBe(false);
    expect(
      BooksAnswersSchema.safeParse({
        favoriteBooks: [{ bookId: '2a8b6f7e-9d51-4a0c-8f2e-7c5b1d3e4a90' }],
        homeBooks: [],
        topicTags: [],
      }).success,
    ).toBe(true);
  });

  it('성장 목표는 0개 선택을 허용한다', () => {
    expect(GoalsAnswersSchema.parse({ growthGoals: [] }).growthGoals).toEqual([]);
  });
});

describe('SaveOnboardingStepRequest — 단계별 discriminated union', () => {
  it('단계에 맞는 응답 schema 로 검증한다', () => {
    expect(
      SaveOnboardingStepRequestSchema.safeParse({
        step: 'child_info',
        answers: { firstName: 'Emma' },
      }).success,
    ).toBe(true);
    expect(
      SaveOnboardingStepRequestSchema.safeParse({
        step: 'goals',
        answers: { growthGoals: ['not_a_goal'] },
      }).success,
    ).toBe(false);
  });

  it('다른 단계의 필드는 parse 결과에서 제거된다 (응답 schema 는 strip — Plan §7.3)', () => {
    const parsed = SaveOnboardingStepRequestSchema.parse({
      step: 'goals',
      answers: { growthGoals: ['emotion_regulation'], firstName: 'Emma' },
    });
    expect(parsed.answers).toEqual({ growthGoals: ['emotion_regulation'] });
  });

  it('중도 저장이므로 부분 응답을 허용한다 (FR-03)', () => {
    expect(SaveOnboardingStepRequestSchema.safeParse({ step: 'books', answers: {} }).success).toBe(
      true,
    );
  });

  it('정의되지 않은 단계는 거부한다', () => {
    expect(
      SaveOnboardingStepRequestSchema.safeParse({ step: 'profile', answers: {} }).success,
    ).toBe(false);
  });
});

describe('OnboardingState', () => {
  it('5단계 상태와 instrument 를 함께 내려준다', () => {
    const state = {
      instrument: onboardingInstrument,
      steps: OnboardingStepSchema.options.map((step) => ({ step, completed: false })),
      draftAnswers: {},
      currentStep: 'child_info',
    };
    expect(OnboardingStateSchema.parse(state).steps).toHaveLength(5);
  });

  it('단계 수가 5가 아니면 거부한다', () => {
    expect(
      OnboardingStateSchema.safeParse({
        instrument: onboardingInstrument,
        steps: [{ step: 'child_info', completed: true }],
        draftAnswers: {},
        currentStep: 'child_info',
      }).success,
    ).toBe(false);
  });
});

describe('SubmitOnboardingRequest — C-12', () => {
  it('5단계 전체가 있어야 통과한다', () => {
    expect(
      SubmitOnboardingRequestSchema.safeParse({
        instrument: instrumentRef,
        answers: completeAnswers,
      }).success,
    ).toBe(true);

    const { goals: _goals, ...withoutGoals } = completeAnswers;
    expect(
      SubmitOnboardingRequestSchema.safeParse({ instrument: instrumentRef, answers: withoutGoals })
        .success,
    ).toBe(false);
  });

  it('instrument 참조(code·version)가 없으면 거부한다 (D-A 구조 제약 ④)', () => {
    expect(SubmitOnboardingRequestSchema.safeParse({ answers: completeAnswers }).success).toBe(
      false,
    );
  });

  it('clock 주입 팩토리는 나이 범위까지 본다 (D-10)', () => {
    const schema = createSubmitOnboardingRequestSchema(NOW);
    expect(schema.safeParse({ instrument: instrumentRef, answers: completeAnswers }).success).toBe(
      true,
    );
    expect(
      schema.safeParse({
        instrument: instrumentRef,
        answers: {
          ...completeAnswers,
          child_info: { ...completeAnswers.child_info, birthYearMonth: '2025-01' },
        },
      }).success,
    ).toBe(false);
  });
});

describe('OnboardingDraft — 로컬 전용 (D-3)', () => {
  const draft = {
    schemaVersion: ONBOARDING_DRAFT_SCHEMA_VERSION,
    instrument: instrumentRef,
    currentStep: 'books',
    answers: { child_info: { firstName: 'Emma' } },
    updatedAt: '2026-09-20T00:00:00Z',
  };

  it('부분 응답을 담을 수 있다', () => {
    expect(OnboardingDraftSchema.parse(draft).answers.child_info?.firstName).toBe('Emma');
  });

  it('schemaVersion 이 다르면 거부한다 (폐기 대상)', () => {
    expect(OnboardingDraftSchema.safeParse({ ...draft, schemaVersion: 2 }).success).toBe(false);
  });

  it('보관 상한 30일 경계 — 기준 시각을 주입한다', () => {
    expect(ONBOARDING_DRAFT_MAX_AGE_DAYS).toBe(30);
    expect(isOnboardingDraftExpired('2026-09-25T00:00:00Z', NOW)).toBe(false);
    expect(isOnboardingDraftExpired('2026-08-26T12:00:00Z', NOW)).toBe(false);
    expect(isOnboardingDraftExpired('2026-08-26T11:59:59Z', NOW)).toBe(true);
  });

  it('해석할 수 없는 updatedAt 은 만료로 본다', () => {
    expect(isOnboardingDraftExpired('not-a-date', NOW)).toBe(true);
  });
});
