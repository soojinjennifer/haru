/**
 * 온보딩 fixture — `.claude/rules/frontend.md` §5 "fixture 는 `mocks/` 에만 둔다".
 *
 * **가상 데이터만** 있다. 실제 아동 데이터를 넣지 않는다.
 * 값은 주입된 `clock`·`idFactory` 에서만 나온다 — 같은 scenario 는 항상 같은 응답 바이트다.
 *
 * ── 결정 **D-A** ③ ──
 * Mock 이 `instrument` 를 내려준다. 화면은 문항을 하드코딩하지 않으며, 향후 Backend 가 같은
 * 계약으로 문항을 교체할 수 있다. 구조(코드·순서·선택 규칙)는 contracts 가 소유하고
 * (`ONBOARDING_CHOICE_QUESTIONS` · `BASELINE_ITEM_BLUEPRINT`), 여기에서는 **문구만** 붙인다.
 * 문구 원문: `docs/source/HARU_Developmental_Baseline_Survey_v1.docx.md`.
 */
import {
  BASELINE_INSTRUMENT_CODE,
  BASELINE_ITEM_BLUEPRINT,
  buildOnboardingQuestions,
  ONBOARDING_INSTRUMENT_CODE,
  ONBOARDING_INSTRUMENT_VERSION,
  OnboardingInstrumentSchema,
  OnboardingStateSchema,
  OnboardingStepSchema,
  SURVEY_ANSWER_VALUES,
  type ChoiceOption,
  type OnboardingDraftAnswers,
  type OnboardingInstrument,
  type OnboardingState,
  type OnboardingStep,
  type SurveyAnswerValue,
} from '@haru/contracts';

import { MOCK_BOOKS } from './books';

/** Baseline v1 문항 문구 — 서버가 소유하는 값이다 (AC-2-24: 화면은 응답 값만 표시한다). */
const BASELINE_PROMPTS: Record<string, string> = {
  ER1: 'When your child got upset, how often were they able to calm down within a few minutes, with your help or comfort?',
  ER2: 'After getting upset, how often was your child able to name or show you what they were feeling — through words, pointing, or gestures?',
  AG1: 'When there was something your child could do themselves, how often did they take it on and do it, rather than needing you to do it for them?',
  AG2: 'When your child hit a small difficulty, how often did they keep trying for a bit before giving up or asking for help?',
  AG3: 'How often did your child start and keep going their own pretend play, without you setting it up for them?',
  CF1: 'When plans changed unexpectedly, how often did your child adjust without getting badly stuck on it?',
  CF2: "When your child couldn't have or do the exact thing they wanted, how often could they accept a substitute or a “later”?",
  IM1: 'How often did your child bring something from a book back up later — a character, an idea, a question — outside of reading time?',
  IM2: 'How often did your child ask “why” or “what if” questions about the world around them?',
  IM3: 'During reading together, how often did your child seem genuinely absorbed or delighted?',
};

const SCALE_LABELS: Record<string, string> = {
  '1': 'Never',
  '2': 'Rarely',
  '3': 'Sometimes',
  '4': 'Often',
  '5': 'Almost always',
  not_observed: "Haven't had the chance to see this yet",
};

/** Mock instrument 문구 버전. */
export const MOCK_BASELINE_VERSION = '1.0.0';

/**
 * 소개 화면 소요 시간 (`R-03`) — Figma `243:1147` "About 1 minutes"(오타) · `179:1748`
 * "About 3 minutes". 화면은 이 값을 읽기만 한다 (`AC-2R-09`).
 */
export const MOCK_ONBOARDING_ESTIMATES = { profileMinutes: 1, surveyMinutes: 3 } as const;

/**
 * Q5 선택지 — **인벤토리 8권의 id + 제목**이다 (`§11.11`).
 * 제목은 `label` 로 함께 내려가므로 contracts·화면·copy 모듈에 책 제목이 없다.
 */
export function createOwnedBookOptions(): readonly ChoiceOption[] {
  return MOCK_BOOKS.map((book) => ({ code: book.id, label: book.title }));
}

export interface OnboardingInstrumentFixtureOptions {
  /** Q5 선택지. 비우면 Q5 카드가 사라진다 (`owned-books-empty`). */
  ownedBookOptions?: readonly ChoiceOption[];
  /** `instrument-v2` — 문항 수가 다른 instrument 를 내려줄 때 쓴다. */
  questionIds?: readonly string[];
  version?: string;
}

export function createOnboardingInstrumentFixture(
  options: OnboardingInstrumentFixtureOptions = {},
): OnboardingInstrument {
  const questions = buildOnboardingQuestions(
    options.ownedBookOptions ?? createOwnedBookOptions(),
  ).filter(
    (question) =>
      options.questionIds === undefined || options.questionIds.includes(question.questionId),
  );

  return OnboardingInstrumentSchema.parse({
    code: ONBOARDING_INSTRUMENT_CODE,
    version: options.version ?? ONBOARDING_INSTRUMENT_VERSION,
    questions,
    estimates: MOCK_ONBOARDING_ESTIMATES,
    survey: {
      code: BASELINE_INSTRUMENT_CODE,
      version: MOCK_BASELINE_VERSION,
      stem: 'IN THE PAST TWO WEEKS',
      scaleLabels: SURVEY_ANSWER_VALUES.map((value: SurveyAnswerValue) => ({
        value,
        label: SCALE_LABELS[String(value)],
      })),
      items: BASELINE_ITEM_BLUEPRINT.map((item) => ({
        ...item,
        prompt: BASELINE_PROMPTS[item.itemCode],
      })),
    },
  });
}

/**
 * `draft-resume` scenario 가 쓰는 **서버에 저장된** 중도 응답.
 * 가상 아이 이름만 담는다 — 실제 아동 데이터가 아니다.
 */
export const MOCK_RESUME_STEP: OnboardingStep = 'books_and_interests';

export function createResumeDraftAnswers(): OnboardingDraftAnswers {
  return {
    child_info: createChildInfoDraftAnswers(),
    // `reading_together` 는 필수 문항 2개(Q1 · Q4)를 모두 갖는다 (`S2-ONB-1`).
    reading_together: { storyComfort: 'some_adventure', readAloudBehavior: 'asks_questions' },
  };
}

/**
 * `prefilled-child-info` — 가입 화면에서 받아 둔 아이 정보가 있는 상태 (`R-01` · `R-08`).
 * 가상 데이터이며 실제 아동 데이터가 아니다.
 */
export function createChildInfoDraftAnswers(): NonNullable<OnboardingDraftAnswers['child_info']> {
  return {
    firstName: 'Nova',
    birthYearMonth: '2021-04',
    gender: null,
    languageEnvironment: ['english'],
    readingRoutine: 'few_times_a_week',
  };
}

export interface OnboardingStateFixtureOptions {
  answers?: OnboardingDraftAnswers;
  currentStep?: OnboardingStep;
  /** 서버에 저장된 단계 (진행바·"이어서 진행" 판정). */
  completedSteps?: readonly OnboardingStep[];
  /** instrument 변형 (`owned-books-empty` · `instrument-v2`). */
  instrument?: OnboardingInstrumentFixtureOptions;
}

export function createOnboardingStateFixture(
  options: OnboardingStateFixtureOptions = {},
): OnboardingState {
  const answers = options.answers ?? {};
  const completed = new Set(options.completedSteps ?? []);

  return OnboardingStateSchema.parse({
    instrument: createOnboardingInstrumentFixture(options.instrument),
    // 단계 목록은 contracts 가 소유한다 — fixture 가 목록을 다시 쓰지 않는다.
    steps: OnboardingStepSchema.options.map((step) => ({
      step,
      completed: completed.has(step),
    })),
    draftAnswers: answers,
    currentStep: options.currentStep ?? 'child_info',
  });
}
