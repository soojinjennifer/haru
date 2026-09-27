import { z } from 'zod';

import { OnboardingStepSchema } from '../enums/onboarding-step.js';
import { OnboardingDraftAnswersSchema, type OnboardingDraftAnswers } from './answers.js';
import { TOPIC_TAG_NOT_SURE, TopicTagSchema, GrowthGoalSchema } from './options.js';
import { SurveyInstrumentSchema } from './survey.js';
import { ReadAloudBehaviorSchema, StoryComfortSchema } from './temperament.js';

/**
 * 온보딩 **instrument** — "어떤 문항이 어떤 단계에 몇 개, 어떤 선택 규칙으로 있는가".
 *
 * 근거: `docs/decisions/stage-2-approvals.md` §8 **D-A** 구조 제약 ②·③·④.
 *
 * ── 왜 이 개념이 필요한가 ──
 * ② 문항 목록·순서·개수를 **화면 코드에 흩지 않는다.** 화면은 instrument 를 순회해 렌더하므로
 *    문항이 늘거나 줄어도 화면 코드를 고치지 않는다.
 * ③ 설문 문항은 **Mock 이 `instrument` 형태로 내려준다** (`GET /v1/onboarding` →
 *    `OnboardingState.instrument`). 향후 Backend 가 같은 계약으로 문항을 교체할 수 있다.
 * ④ 제출 시 instrument **버전**을 함께 보낸다 (`SubmitOnboardingRequest.instrument`).
 *    문항이 바뀌었을 때 기존 응답과의 호환은 **Backend 요구사항**이다 (`P2-BIP-06`).
 *
 * ── 코드와 문구의 분리 (구조 제약 ①) ──
 * 선택지는 **코드**만 필수다. 표시 문구는 `apps/web` feature copy 모듈이 코드로 조회한다.
 * `ChoiceOption.label` 은 **서버가 문구까지 내려줄 때만** 채우는 선택 필드이며, 채워져 있으면
 * copy 모듈보다 우선한다 — 클라이언트 릴리스 없이 새 선택지를 추가하기 위한 경로다.
 * (Step 5 설문 문항은 처음부터 문구가 응답 값이다 — `SurveyInstrument.items[].prompt`, AC-2-24.)
 *
 * ── 확장 시 바뀌는 곳 ──
 * | 변경 | 고쳐야 하는 곳 |
 * |---|---|
 * | 선택지 추가·삭제·순서 변경 | 없음 (instrument 응답만) |
 * | 문항 삭제 | 없음 (instrument 응답만) |
 * | 문항 **추가** | 이 파일의 `ChoiceQuestionId` + 저장 위치 매핑. **화면 코드는 그대로** |
 * | 표시 문구 변경 | `apps/web` copy 모듈. 저장된 코드는 그대로 유효 |
 */

/** 온보딩 instrument 식별자 — 질문지 문서 v1.1 기준 (결정 D-A). */
export const ONBOARDING_INSTRUMENT_CODE = 'onboarding_v1_1';

/** 현재 배포 버전. 문항·선택지가 바뀌면 올린다. */
export const ONBOARDING_INSTRUMENT_VERSION = '1.1.0';

/**
 * instrument 참조 — 응답이 **어떤 문항 집합으로** 수집되었는지 남긴다 (구조 제약 ④).
 * `code` 를 literal 로 고정하지 않는다: Backend 가 새 instrument 로 교체할 수 있어야 한다.
 */
export const InstrumentRefSchema = z.object({
  code: z.string().min(1),
  version: z.string().min(1),
});

export type InstrumentRef = z.infer<typeof InstrumentRefSchema>;

/**
 * 선택형 문항 식별자.
 *
 * 닫힌 enum 인 이유: 각 문항의 **저장 위치와 값 schema** 가 타입으로 고정되어야
 * 응답이 `ChildInfoAnswers`/`TemperamentAnswers`/… 로 그대로 흘러간다. 새 문항을 추가하려면
 * 여기와 아래 매핑에 한 줄씩 추가하면 되고, **화면 코드는 바뀌지 않는다.**
 */
export const ChoiceQuestionIdSchema = z.enum([
  'temperament.story_comfort',
  'temperament.read_aloud_behavior',
  'books.topic_tags',
  'goals.growth_goals',
]);

export type ChoiceQuestionId = z.infer<typeof ChoiceQuestionIdSchema>;

/** 단일 선택 / 복수 선택. */
export const ChoiceSelectionSchema = z.enum(['single', 'multi']);

export type ChoiceSelection = z.infer<typeof ChoiceSelectionSchema>;

export const ChoiceOptionSchema = z.object({
  /** 저장되는 값. 문구가 바뀌어도 이 값은 바뀌지 않는다. */
  code: z.string().min(1),
  /** 서버가 함께 내려주는 표시 문구 (선택). 없으면 클라이언트 copy 모듈이 코드로 조회한다. */
  label: z.string().min(1).optional(),
  /**
   * 다른 선택지와 함께 고를 수 없는 선택지 ("아직 모르겠다" 류).
   * 질문지 Q3 `not sure yet` 이 여기에 해당한다.
   */
  exclusive: z.boolean().optional(),
});

export type ChoiceOption = z.infer<typeof ChoiceOptionSchema>;

export const ChoiceQuestionSchema = z
  .object({
    questionId: ChoiceQuestionIdSchema,
    step: OnboardingStepSchema,
    /** 같은 단계 안에서의 표시 순서. */
    order: z.int().min(1),
    selection: ChoiceSelectionSchema,
    /** `multi` 일 때의 선택 상한. 질문지 Q2·Q3 는 2 다. */
    maxSelections: z.int().min(1).optional(),
    /** 응답이 필수인지 — Stage 2 는 전부 `false` 다 (결정 D-C). */
    required: z.boolean(),
    /** 서버가 함께 내려주는 질문 문구 (선택). 없으면 클라이언트 copy 모듈이 id 로 조회한다. */
    prompt: z.string().min(1).optional(),
    /** 질문 아래 보조 설명 (선택). */
    description: z.string().min(1).optional(),
    options: z.array(ChoiceOptionSchema).min(2),
  })
  .refine(
    (question) =>
      new Set(question.options.map((option) => option.code)).size === question.options.length,
    { message: 'choice question options must have unique codes' },
  );

export type ChoiceQuestion = z.infer<typeof ChoiceQuestionSchema>;

/**
 * `GET /v1/onboarding` 이 내려주는 문항 집합 전체.
 * Step 1 은 문항이 아니라 **프로필 입력**이라 여기에 없다 (질문지 "Inputs From Profile Setup").
 */
export const OnboardingInstrumentSchema = z.object({
  code: z.string().min(1),
  version: z.string().min(1),
  /** Step 2~4 의 선택형 문항. 순서는 `step` → `order` 다. */
  questions: z.array(ChoiceQuestionSchema),
  /** Step 5 역량 문항 (Baseline v1) — 문구까지 응답 값이다. */
  survey: SurveyInstrumentSchema,
});

export type OnboardingInstrument = z.infer<typeof OnboardingInstrumentSchema>;

/** instrument 참조만 뽑아낸다 (제출 payload 용). */
export function instrumentRefOf(instrument: OnboardingInstrument): InstrumentRef {
  return { code: instrument.code, version: instrument.version };
}

/* ── 문항 구조의 기본 정의 (문구 없음) ─────────────────────────────────────── */

/** 값 schema — 선택지 코드가 저장 가능한 값인지 검증한다. */
const QUESTION_VALUE_SCHEMAS = {
  'temperament.story_comfort': StoryComfortSchema,
  'temperament.read_aloud_behavior': ReadAloudBehaviorSchema,
  'books.topic_tags': TopicTagSchema,
  'goals.growth_goals': GrowthGoalSchema,
} as const satisfies Record<ChoiceQuestionId, z.ZodType<string>>;

export function choiceQuestionValueSchema(questionId: ChoiceQuestionId): z.ZodType<string> {
  return QUESTION_VALUE_SCHEMAS[questionId];
}

/**
 * 기본 문항 구조 — 질문지 v1.1 Q1 · Q4 · Q3 · Q2 를 온보딩 단계에 배치한 것이다.
 *
 * 표시 문구가 없다는 점이 핵심이다. 이 배열은 Trial(서버 요청 0건) 구간의 기본 instrument 와
 * Mock 응답이 **같은 구조**를 쓰도록 하는 단일 출처다.
 */
export const ONBOARDING_CHOICE_QUESTIONS: readonly ChoiceQuestion[] = [
  {
    questionId: 'temperament.story_comfort',
    step: 'temperament',
    order: 1,
    selection: 'single',
    required: false,
    options: StoryComfortSchema.options.map((code) => ({ code })),
  },
  {
    questionId: 'temperament.read_aloud_behavior',
    step: 'temperament',
    order: 2,
    selection: 'single',
    required: false,
    options: ReadAloudBehaviorSchema.options.map((code) => ({ code })),
  },
  {
    questionId: 'books.topic_tags',
    step: 'books',
    order: 1,
    selection: 'multi',
    maxSelections: 2,
    required: false,
    options: TopicTagSchema.options.map((code) =>
      code === TOPIC_TAG_NOT_SURE ? { code, exclusive: true } : { code },
    ),
  },
  {
    questionId: 'goals.growth_goals',
    step: 'goals',
    order: 1,
    selection: 'multi',
    maxSelections: 2,
    required: false,
    options: GrowthGoalSchema.options.map((code) => ({ code })),
  },
];

/* ── 응답 읽기 / 쓰기 (저장 위치 매핑) ──────────────────────────────────────── */

/** 문항 하나의 현재 응답을 **코드 배열**로 읽는다 (단일 선택도 길이 0 또는 1 배열). */
export function readChoiceAnswer(
  answers: OnboardingDraftAnswers,
  questionId: ChoiceQuestionId,
): readonly string[] {
  switch (questionId) {
    case 'temperament.story_comfort': {
      const value = answers.temperament?.storyComfort;
      return value === undefined ? [] : [value];
    }
    case 'temperament.read_aloud_behavior': {
      const value = answers.temperament?.readAloudBehavior;
      return value === undefined ? [] : [value];
    }
    case 'books.topic_tags':
      return answers.books?.topicTags ?? [];
    case 'goals.growth_goals':
      return answers.goals?.growthGoals ?? [];
  }
}

function single<TSchema extends z.ZodType<string>>(
  schema: TSchema,
  codes: readonly string[],
): z.infer<TSchema> | undefined {
  const [first] = codes;
  return first === undefined ? undefined : schema.parse(first);
}

function multi<TSchema extends z.ZodType<string>>(
  schema: TSchema,
  codes: readonly string[],
): z.infer<TSchema>[] {
  return codes.map((code) => schema.parse(code));
}

/**
 * 문항 하나의 응답을 draft 응답 묶음에 반영한다 — **부수효과 없는 순수 함수**다.
 *
 * 코드는 문항별 schema 로 parse 하므로, instrument 가 모르는 값이 저장되지 않는다.
 * 저장 위치를 아는 곳이 여기 하나이므로 화면·Mock·향후 Backend 가 같은 규칙을 공유한다.
 */
export function applyChoiceAnswer(
  answers: OnboardingDraftAnswers,
  questionId: ChoiceQuestionId,
  codes: readonly string[],
): OnboardingDraftAnswers {
  switch (questionId) {
    case 'temperament.story_comfort':
      return {
        ...answers,
        temperament: { ...answers.temperament, storyComfort: single(StoryComfortSchema, codes) },
      };
    case 'temperament.read_aloud_behavior':
      return {
        ...answers,
        temperament: {
          ...answers.temperament,
          readAloudBehavior: single(ReadAloudBehaviorSchema, codes),
        },
      };
    case 'books.topic_tags':
      return { ...answers, books: { ...answers.books, topicTags: multi(TopicTagSchema, codes) } };
    case 'goals.growth_goals':
      return { ...answers, goals: { growthGoals: multi(GrowthGoalSchema, codes) } };
  }
}

/**
 * 복수 선택 문항에서 선택지 하나를 토글한 결과를 계산한다 — 순수 함수.
 *
 * 규칙
 * 1. `exclusive` 선택지를 고르면 나머지가 해제된다 (질문지 Q3 "not sure yet").
 * 2. `exclusive` 가 아닌 선택지를 고르면 `exclusive` 선택지가 해제된다.
 * 3. `maxSelections` 에 도달한 상태에서 새로 고르면 **가장 오래된 선택이 밀려난다**.
 *    (무시하면 탭이 먹통이 된 것처럼 보이고, 에러를 띄우면 선택지 2개짜리 문항에 과하다.)
 */
export function toggleChoiceSelection(
  question: ChoiceQuestion,
  current: readonly string[],
  code: string,
): readonly string[] {
  if (question.selection === 'single') return current.includes(code) ? [] : [code];

  if (current.includes(code)) return current.filter((value) => value !== code);

  const option = question.options.find((candidate) => candidate.code === code);
  if (option?.exclusive === true) return [code];

  const exclusiveCodes = new Set(
    question.options.filter((candidate) => candidate.exclusive === true).map((c) => c.code),
  );
  const kept = current.filter((value) => !exclusiveCodes.has(value));
  const next = [...kept, code];
  const max = question.maxSelections;

  return max === undefined || next.length <= max ? next : next.slice(next.length - max);
}

/** instrument 응답이 draft 응답 묶음과 어긋나지 않는지 확인용 — 알 수 없는 코드는 버린다. */
export function pruneUnknownChoiceAnswers(
  instrument: OnboardingInstrument,
  answers: OnboardingDraftAnswers,
): OnboardingDraftAnswers {
  let next = answers;

  for (const question of instrument.questions) {
    const allowed = new Set(question.options.map((option) => option.code));
    const current = readChoiceAnswer(next, question.questionId);
    const kept = current.filter((code) => allowed.has(code));

    if (kept.length !== current.length) {
      next = applyChoiceAnswer(next, question.questionId, kept);
    }
  }

  return OnboardingDraftAnswersSchema.parse(next);
}
