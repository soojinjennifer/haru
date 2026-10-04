import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { OnboardingStepSchema, type OnboardingStep } from '../enums/onboarding-step.js';
import { OnboardingDraftAnswersSchema, type OnboardingDraftAnswers } from './answers.js';
import { TOPIC_TAGS_MAX } from './books-and-interests.js';
import { GROWTH_GOALS_MAX } from './growing-together.js';
import { TOPIC_TAG_NOT_SURE, TopicTagSchema, GrowthGoalSchema } from './options.js';
import { SurveyInstrumentSchema } from './survey.js';
import { ReadAloudBehaviorSchema, StoryComfortSchema } from './reading-together.js';

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

/**
 * 현재 배포 버전. 문항·선택지가 바뀌면 올린다.
 *
 * `2.0.0` — 설문 4단계 재구성(2026-10-03). 단계 체계가 바뀌었으므로 major 다.
 * `code` 는 `onboarding_v1_1` 을 유지한다: 질문지 **문서** 버전은 그대로 v1.1 이고
 * 단계 재배치는 배치 변경이지 문항 변경이 아니다 (Plan §7.3).
 * 과거 응답(`1.1.0`)의 step 키 대응은 Backend 요구사항이다 (`P2-BIP-12`).
 */
export const ONBOARDING_INSTRUMENT_VERSION = '2.0.0';

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
  'reading_together.story_comfort',
  'reading_together.read_aloud_behavior',
  'books_and_interests.topic_tags',
  'books_and_interests.owned_books',
  'growing_together.growth_goals',
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
    /**
     * 응답이 필수인지.
     *
     * **화면이 아니라 이 문항 정의가 필수 여부를 소유한다** — `S2-ONB-1`
     * (`docs/decisions/stage-2-approvals.md` §9.1) 로 Q1·Q4·Q2 가 필수가 되었지만,
     * 화면 코드는 그 사실을 모른 채 `required` 만 읽는다. 나중에 필수/선택이 다시 바뀌면
     * instrument 응답만 바꾸면 된다.
     */
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
 * 소개 화면이 안내하는 **소요 시간** — 숫자를 화면·copy 에 박지 않기 위한 슬롯 (`R-03`).
 * 문항이 바뀌면 서버만 바꾼다 (`P2-BIP-16`).
 */
export const OnboardingEstimatesSchema = z.object({
  /** `About your child` 프로필 입력 (`243:1147` InfoRow). */
  profileMinutes: z.int().min(1),
  /** 설문 카드 전체 (`179:1748` InfoRow). */
  surveyMinutes: z.int().min(1),
});

export type OnboardingEstimates = z.infer<typeof OnboardingEstimatesSchema>;

/**
 * `GET /v1/onboarding` 이 내려주는 문항 집합 전체.
 * `child_info` 는 문항이 아니라 **프로필 입력**이라 여기에 없다
 * (질문지 "Inputs From Profile Setup").
 */
export const OnboardingInstrumentSchema = z.object({
  code: z.string().min(1),
  version: z.string().min(1),
  /** 선택형 문항. 순서는 `step` → `order` 다. */
  questions: z.array(ChoiceQuestionSchema),
  /** 역량 문항 (Baseline v1) — 문구까지 응답 값이다. */
  survey: SurveyInstrumentSchema,
  /** 소개 화면 소요 시간 안내 값 (`R-03`). */
  estimates: OnboardingEstimatesSchema,
});

export type OnboardingInstrument = z.infer<typeof OnboardingInstrumentSchema>;

/** instrument 참조만 뽑아낸다 (제출 payload 용). */
export function instrumentRefOf(instrument: OnboardingInstrument): InstrumentRef {
  return { code: instrument.code, version: instrument.version };
}

/* ── 문항 구조의 기본 정의 (문구 없음) ─────────────────────────────────────── */

/** 값 schema — 선택지 코드가 저장 가능한 값인지 검증한다. */
const QUESTION_VALUE_SCHEMAS = {
  'reading_together.story_comfort': StoryComfortSchema,
  'reading_together.read_aloud_behavior': ReadAloudBehaviorSchema,
  'books_and_interests.topic_tags': TopicTagSchema,
  /** Q5 는 선택지가 **책 id** 다 — 목록은 카탈로그에서 오고 enum 이 아니다. */
  'books_and_interests.owned_books': IdSchema,
  'growing_together.growth_goals': GrowthGoalSchema,
} as const satisfies Record<ChoiceQuestionId, z.ZodType<string>>;

export function choiceQuestionValueSchema(questionId: ChoiceQuestionId): z.ZodType<string> {
  return QUESTION_VALUE_SCHEMAS[questionId];
}

/**
 * 기본 문항 구조 — 질문지 v1.1 Q1 · Q4 · Q3 · Q2 를 재구성된 4단계에 배치한 것이다
 * (`§11.12` · `§11.16`). Q5 는 선택지가 카탈로그 데이터라 여기에 없다 —
 * `buildOnboardingQuestions()` 가 붙인다.
 *
 * 표시 문구가 없다는 점이 핵심이다. 이 배열은 Trial(서버 요청 0건) 구간의 기본 instrument 와
 * Mock 응답이 **같은 구조**를 쓰도록 하는 단일 출처다.
 *
 * ── 필수 여부 (`S2-ONB-1`, approvals §9.1 — 결정 `D-C` 를 일부 뒤집는다) ──
 * 질문지 문서의 규정을 그대로 옮긴다.
 *
 * | 문항 | 질문지 | `required` |
 * |---|---|---|
 * | Q1 `reading_together.story_comfort` | "Single-select. **Required.**" | `true` |
 * | Q4 `reading_together.read_aloud_behavior` | "Single-select. **Required.**" | `true` |
 * | Q3 `books_and_interests.topic_tags` | "Optional — 'not sure yet' is a valid answer." | `false` |
 * | Q2 `growing_together.growth_goals` | "**Required** — at least one option must be picked." | `true` |
 * | Q5 `books_and_interests.owned_books` | 선택지가 카탈로그 데이터 → `buildOnboardingQuestions` | `false` |
 *
 * 필수화가 "없는 답"을 강요하지 않는지는 선택지 구성이 보장한다: Q1 은 회피 선택지
 * `depends_on_the_day` 를 갖는다. Q4·Q2 에는 회피 선택지가 없으나, Q4 는 관찰 가능한 행동
 * 5종을 모두 열거하고 Q2 는 **보호자 자신의 바람**을 묻는 문항이라 아이에 대한 관찰을
 * 요구하지 않는다 (approvals §9.1 의 "없는 답 강요 금지" 취지와 충돌하지 않는다).
 */
export const ONBOARDING_CHOICE_QUESTIONS: readonly ChoiceQuestion[] = [
  {
    questionId: 'reading_together.story_comfort',
    step: 'reading_together',
    order: 1,
    selection: 'single',
    // 질문지 Q1 Required — 회피 선택지 `depends_on_the_day` 가 있다.
    required: true,
    options: StoryComfortSchema.options.map((code) => ({ code })),
  },
  {
    questionId: 'reading_together.read_aloud_behavior',
    step: 'reading_together',
    order: 2,
    selection: 'single',
    // 질문지 Q4 Required.
    required: true,
    options: ReadAloudBehaviorSchema.options.map((code) => ({ code })),
  },
  {
    questionId: 'books_and_interests.topic_tags',
    step: 'books_and_interests',
    order: 1,
    selection: 'multi',
    maxSelections: TOPIC_TAGS_MAX,
    // 질문지 Q3 Optional — `not_sure_yet` 자체가 유효한 응답이다.
    required: false,
    options: TopicTagSchema.options.map((code) =>
      code === TOPIC_TAG_NOT_SURE ? { code, exclusive: true } : { code },
    ),
  },
  {
    questionId: 'growing_together.growth_goals',
    step: 'growing_together',
    order: 1,
    selection: 'multi',
    maxSelections: GROWTH_GOALS_MAX,
    // 질문지 Q2 Required — 최소 1개.
    required: true,
    options: GrowthGoalSchema.options.map((code) => ({ code })),
  },
];

/**
 * Q5 — "이미 잘 아는 책" 문항 (질문지 v1.1 Q5, `§11.11`).
 *
 * **선택지가 enum 이 아니라 카탈로그 데이터**(책 id + 제목)이므로 고정 배열로 둘 수 없다.
 * 호출부(Mock·향후 Backend)가 인벤토리를 넘겨 문항을 만든다. 제목은 `label` 로 함께 내려가며
 * — contracts·화면·copy 모듈 어디에도 책 제목이 없다 (`AC-2R-09`).
 *
 * 선택 규칙: **복수·무제한**(`maxSelections` 없음) · **배타 옵션 없음** · **선택 문항**.
 * 선택지가 2개 미만이면 `null` 을 돌려준다 — 문항이 성립하지 않으므로 카드가 사라지고,
 * 카드 수는 파생값이라 자동으로 줄어든다 (`owned-books-empty` 상태).
 */
export function createOwnedBooksQuestion(options: readonly ChoiceOption[]): ChoiceQuestion | null {
  if (options.length < 2) return null;

  return {
    questionId: 'books_and_interests.owned_books',
    step: 'books_and_interests',
    order: 2,
    selection: 'multi',
    required: false,
    options: [...options],
  };
}

/**
 * instrument 의 선택형 문항 전체 — 고정 문항 + 카탈로그 기반 Q5.
 *
 * 문항 목록을 조립하는 곳을 하나로 둔다. Mock 과 Trial 기본 instrument 가 같은 함수를 쓰므로
 * 두 경로의 문항 구성이 갈라지지 않는다.
 */
export function buildOnboardingQuestions(
  ownedBookOptions: readonly ChoiceOption[] = [],
): readonly ChoiceQuestion[] {
  const ownedBooks = createOwnedBooksQuestion(ownedBookOptions);

  return ownedBooks === null
    ? ONBOARDING_CHOICE_QUESTIONS
    : [...ONBOARDING_CHOICE_QUESTIONS, ownedBooks];
}

/* ── 필수 응답 판정 (instrument 가 소유한다) ────────────────────────────────── */

/**
 * 아직 응답하지 않은 **필수** 문항 (`S2-ONB-1`).
 *
 * 화면·Mock·향후 Backend 가 같은 함수를 쓴다 — 필수 목록을 세 곳에 옮겨 적지 않는다.
 * `step` 을 주면 그 단계만 본다 (단계 CTA 판정), 생략하면 전체를 본다 (제출 판정).
 *
 * 응답 여부의 기준은 **선택된 코드가 1개 이상 있는가** 다. "관찰한 적 없음" · "아직
 * 모르겠다" 류의 회피 선택지도 코드가 저장되므로 **응답으로 인정된다** (approvals §9.1).
 */
export function unansweredRequiredQuestions(
  instrument: OnboardingInstrument,
  answers: OnboardingDraftAnswers,
  step?: OnboardingStep,
): readonly ChoiceQuestionId[] {
  return instrument.questions
    .filter((question) => question.required && (step === undefined || question.step === step))
    .sort((left, right) => left.order - right.order)
    .filter((question) => readChoiceAnswer(answers, question.questionId).length === 0)
    .map((question) => question.questionId);
}

/**
 * 필수 응답이 비어 있는 단계 목록 — `OnboardingStep` 선언 순서로 중복 없이 돌려준다.
 * 제출을 막고 해당 단계로 되돌릴 때 쓴다.
 */
export function stepsMissingRequiredAnswers(
  instrument: OnboardingInstrument,
  answers: OnboardingDraftAnswers,
): readonly OnboardingStep[] {
  const blocked = new Set(
    instrument.questions
      .filter(
        (question) =>
          question.required && readChoiceAnswer(answers, question.questionId).length === 0,
      )
      .map((question) => question.step),
  );

  return OnboardingStepSchema.options.filter((step) => blocked.has(step));
}

/* ── 응답 읽기 / 쓰기 (저장 위치 매핑) ──────────────────────────────────────── */

/** 문항 하나의 현재 응답을 **코드 배열**로 읽는다 (단일 선택도 길이 0 또는 1 배열). */
export function readChoiceAnswer(
  answers: OnboardingDraftAnswers,
  questionId: ChoiceQuestionId,
): readonly string[] {
  switch (questionId) {
    case 'reading_together.story_comfort': {
      const value = answers.reading_together?.storyComfort;
      return value === undefined ? [] : [value];
    }
    case 'reading_together.read_aloud_behavior': {
      const value = answers.reading_together?.readAloudBehavior;
      return value === undefined ? [] : [value];
    }
    case 'books_and_interests.topic_tags':
      return answers.books_and_interests?.topicTags ?? [];
    case 'books_and_interests.owned_books':
      return answers.books_and_interests?.ownedBooks ?? [];
    case 'growing_together.growth_goals':
      return answers.growing_together?.growthGoals ?? [];
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
    case 'reading_together.story_comfort':
      return {
        ...answers,
        reading_together: {
          ...answers.reading_together,
          storyComfort: single(StoryComfortSchema, codes),
        },
      };
    case 'reading_together.read_aloud_behavior':
      return {
        ...answers,
        reading_together: {
          ...answers.reading_together,
          readAloudBehavior: single(ReadAloudBehaviorSchema, codes),
        },
      };
    case 'books_and_interests.topic_tags':
      return {
        ...answers,
        books_and_interests: {
          ...answers.books_and_interests,
          topicTags: multi(TopicTagSchema, codes),
        },
      };
    case 'books_and_interests.owned_books':
      return {
        ...answers,
        books_and_interests: {
          ...answers.books_and_interests,
          ownedBooks: multi(IdSchema, codes),
        },
      };
    case 'growing_together.growth_goals':
      return {
        ...answers,
        growing_together: { growthGoals: multi(GrowthGoalSchema, codes) },
      };
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
