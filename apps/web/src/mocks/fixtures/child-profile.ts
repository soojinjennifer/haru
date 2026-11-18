/**
 * Child Profile fixture — Stage 6 Plan §8 `children` 그룹 · Spec §7 · §15 `S6-A`.
 *
 * **가상 데이터만** 있다 (실제 아동 데이터 금지). 아이 이름은 `Emma`(`D5-14` — `GET /v1/me` 와 같은 값).
 * 시각은 주입된 Mock 서버 시계에서만 나온다 — 같은 scenario 는 항상 같은 응답 바이트다.
 *
 * - **점수는 contracts 산식**(`scoreCapabilities`)으로 계산한다 — 응답(설문 답)에서 파생한다. Mock 이 별도 산식을
 *   갖지 않는다 (Stage 2 `profile-result.ts` 와 같은 원칙).
 * - 세션 분석 스냅샷(`session_analysis`)은 설문 답이 아니라 **서버가 정한 값**이다 — 산출 규칙은
 *   Backend(`P6-BIP-01`)이므로 Mock 은 고정 점수표를 쓴다.
 * - 페르소나 문구는 응답 값으로만 표시된다(Frontend 가공 금지). 긍정형 · 진단·판정·비교 표현 0 (§8.4).
 * - 페르소나 description 은 **110~220자**(Spec §3.3 "말줄임 0" 검증용) — 기본 121자 · 변경 171자.
 *   fallback 문구는 Stage 2 에서 정한 값을 재사용한다(R-9 이중 정의 금지) — 94자로 범위 밖이다(handoff 기록).
 */
import {
  BASELINE_ITEM_BLUEPRINT,
  CapabilitySnapshotPageSchema,
  CAPABILITY_SCORING_VERSION,
  PersonaPageSchema,
  SURVEY_ANSWER_NOT_OBSERVED,
  scoreCapabilities,
  type Capability,
  type CapabilityScore,
  type CapabilitySnapshot,
  type CapabilitySnapshotPage,
  type CapabilitySnapshotSource,
  type ChildInfoAnswers,
  type CompleteSurveyUpdateAnswers,
  type OnboardingInstrument,
  type Persona,
  type PersonaPage,
  type SurveyAnswerValue,
  type SurveyUpdateDraftAnswers,
  type SurveyUpdateStep,
} from '@haru/contracts';

import { shiftedIso, type Clock } from '../../shared/lib/clock';

import { MOCK_CHILD_FIRST_NAME } from './me';
import { MOCK_FALLBACK_PERSONA_COPY, MOCK_PERSONA_COPY } from './profile-result';

const DAY_MS = 24 * 60 * 60 * 1000;

/** 온보딩 제출 시각 = Mock 기준 시각 14일 전. */
export const MOCK_ONBOARDED_AGO_MS = 14 * DAY_MS;
/** 세션 분석 갱신 · 재응답 seed 시각 = 1일 전 (재방문 화면의 *"Updated {Mon D}"* 날짜). */
export const MOCK_PROFILE_UPDATED_AGO_MS = 1 * DAY_MS;

/**
 * 이름 **40자** (`CHILD_NAME_MAX_LENGTH`) — 줄바꿈 검증용 (Spec §11.2 · §15 `S6-A`).
 * scenario key 가 아니다 — 아이 정보 수정(`PATCH`)으로 넣거나 컴포넌트 테스트가 쓴다.
 */
export const MOCK_LONG_CHILD_FIRST_NAME = 'Alexandria Josephine Montgomery-Whitford';

/** `persona-changed` — PRD §5.2 예시 이름 계열. 기본 페르소나와 name·description 이 다르다. */
export const MOCK_CHANGED_PERSONA_COPY = {
  name: 'Brave Little Maker',
  description:
    'Lately they reach for the next page on their own and try a new idea when a plan wobbles. Building, guessing and starting again keep showing up in your storytimes together.',
} as const;

/** 고정 uuid — scenario 간에도 같은 행이 같은 id 를 갖는다. */
export const MOCK_PROFILE_ROW_IDS = {
  onboardingSnapshot: 'c6c6c6c6-0000-4000-8000-000000000001',
  surveyUpdateSnapshot: 'c6c6c6c6-0000-4000-8000-000000000002',
  sessionSnapshot: 'c6c6c6c6-0000-4000-8000-000000000003',
  persona: 'c6c6c6c6-1111-4111-8111-000000000001',
  changedPersona: 'c6c6c6c6-1111-4111-8111-000000000002',
} as const;

/** 아이 정보 (Step 1) 기본값 — `GET /v1/me` 의 `Emma` 와 같은 아이다. */
export function createDefaultChildInfo(): ChildInfoAnswers {
  return {
    firstName: MOCK_CHILD_FIRST_NAME,
    birthYearMonth: '2021-04',
    gender: 'girl',
    languageEnvironment: ['english'],
    readingRoutine: 'few_times_a_week',
  };
}

/** 역량 문항 응답표 (itemCode → 값). 순서는 `BASELINE_ITEM_BLUEPRINT`. */
type ItemValues = Readonly<Record<string, SurveyAnswerValue>>;

/** 기본 응답 — ER 3.5 · SD 4.3 · CF 2.5 · IM 3.7 → 강점 SD·IM · growing edge CF·ER · 제안 CF. */
const DEFAULT_ITEM_VALUES: ItemValues = {
  ER1: 4,
  ER2: 3,
  AG1: 4,
  AG2: 4,
  AG3: 5,
  CF1: 2,
  CF2: 3,
  IM1: 3,
  IM2: 4,
  IM3: 4,
};

/** `survey-update-submitted` seed — CF 문항 응답이 바뀐다 (CF 2.5 → 3.5). */
const UPDATED_ITEM_VALUES: ItemValues = { ...DEFAULT_ITEM_VALUES, CF1: 3, CF2: 4 };

function capabilityItems(
  instrument: OnboardingInstrument,
  values: ItemValues,
  notObserved: readonly Capability[] = [],
): CompleteSurveyUpdateAnswers['capability_items'] {
  return {
    instrumentCode: instrument.survey.code,
    answers: BASELINE_ITEM_BLUEPRINT.map((item) => ({
      itemCode: item.itemCode,
      value: notObserved.includes(item.capability)
        ? SURVEY_ANSWER_NOT_OBSERVED
        : (values[item.itemCode] ?? 3),
    })),
  };
}

/**
 * 기본 설문 응답 (Step 2~5) — 온보딩에서 제출된 값. 재응답 진입 시 **프리필**의 출처다.
 * `notObserved` 에 든 역량은 문항 전부 `not_observed` → 그 역량 `score: null` (D-2 ①).
 */
export function createDefaultSurveyAnswers(
  instrument: OnboardingInstrument,
  notObserved: readonly Capability[] = [],
): CompleteSurveyUpdateAnswers {
  return {
    reading_together: { storyComfort: 'some_adventure', readAloudBehavior: 'points_and_touches' },
    books_and_interests: {
      favoriteBooks: [],
      ownedBooks: [],
      topicTags: ['narrative', 'artistic'],
    },
    growing_together: { growthGoals: ['emotion_regulation'] },
    capability_items: capabilityItems(instrument, DEFAULT_ITEM_VALUES, notObserved),
  };
}

/** `survey-update-submitted` — 이미 한 번 재응답한 상태의 응답 (관심사·CF 문항이 바뀌었다). */
export function createSurveyUpdateSeedAnswers(
  instrument: OnboardingInstrument,
): CompleteSurveyUpdateAnswers {
  return {
    ...createDefaultSurveyAnswers(instrument),
    books_and_interests: { favoriteBooks: [], ownedBooks: [], topicTags: ['narrative', 'inquiry'] },
    capability_items: capabilityItems(instrument, UPDATED_ITEM_VALUES),
  };
}

/**
 * `survey-update-draft` — 재응답 도중 이탈한 서버 draft (PLANNING Exit "설정 수정 중도 이탈 복귀").
 * `reading_together` 를 프리필과 **다른 값**으로 저장했고 다음 단계(`books_and_interests`)에서 멈췄다.
 * 복귀 화면이 **바꾼 답을 보존**하는지 이 값으로 확인한다.
 */
export const MOCK_SURVEY_UPDATE_DRAFT_STEP: SurveyUpdateStep = 'books_and_interests';

export function createSurveyUpdateDraftSeed(
  prefill: CompleteSurveyUpdateAnswers,
): SurveyUpdateDraftAnswers {
  return {
    ...prefill,
    reading_together: { storyComfort: 'wild_ride', readAloudBehavior: 'acts_it_out' },
  };
}

/**
 * 세션 분석 스냅샷의 점수표 (`profile-updated` · `persona-changed`). 서버 갱신 규칙은 `P6-BIP-01`.
 * 기본(ER 3.5 · SD 4.3 · CF 2.5 · IM 3.7)과 4축 모두 다르다 — 화면 반영(AC-6-34)을 눈으로 확인할 수 있게.
 */
export const MOCK_SESSION_ANALYSIS_SCORES: Readonly<Record<Capability, number>> = {
  emotion_regulation: 3.8,
  self_directed_agency: 4.4,
  cognitive_flexibility: 3.1,
  intrinsic_motivation: 4,
};

function itemCountOf(capability: Capability): number {
  return BASELINE_ITEM_BLUEPRINT.filter((item) => item.capability === capability).length;
}

/** 설문 응답에서 스냅샷 점수를 만든다 — contracts 산식 그대로. */
export function scoreSurveyAnswers(
  instrument: OnboardingInstrument,
  answers: CompleteSurveyUpdateAnswers,
): CapabilityScore[] {
  return scoreCapabilities(instrument.survey.items, answers.capability_items.answers);
}

/** 세션 분석 스냅샷 점수 — 4축 전부 관찰됨. */
export function createSessionAnalysisScores(): CapabilityScore[] {
  return BASELINE_ITEM_BLUEPRINT.map((item) => item.capability)
    .filter((capability, index, all) => all.indexOf(capability) === index)
    .map((capability) => ({
      capability,
      score: MOCK_SESSION_ANALYSIS_SCORES[capability],
      itemCount: itemCountOf(capability),
      missingCount: 0,
    }));
}

export function createSnapshot(options: {
  id: string;
  source: CapabilitySnapshotSource;
  createdAt: string;
  scores: readonly CapabilityScore[];
}): CapabilitySnapshot {
  return {
    id: options.id,
    source: options.source,
    scoringVersion: CAPABILITY_SCORING_VERSION,
    createdAt: options.createdAt,
    scores: [...options.scores],
  };
}

export type PersonaVariant = 'default' | 'changed' | 'fallback';

const PERSONA_COPY: Readonly<Record<PersonaVariant, { name: string; description: string }>> = {
  default: MOCK_PERSONA_COPY,
  changed: MOCK_CHANGED_PERSONA_COPY,
  fallback: MOCK_FALLBACK_PERSONA_COPY,
};

export function createPersona(options: {
  id: string;
  variant: PersonaVariant;
  createdAt: string;
}): Persona {
  const copy = PERSONA_COPY[options.variant];
  return {
    id: options.id,
    name: copy.name,
    description: copy.description,
    isFallback: options.variant === 'fallback',
    createdAt: options.createdAt,
  };
}

/** 온보딩 시각 (14일 전). */
export function onboardedAt(clock: Clock): string {
  return shiftedIso(clock, -MOCK_ONBOARDED_AGO_MS);
}

/** 갱신 seed 시각 (1일 전). */
export function profileUpdatedAt(clock: Clock): string {
  return shiftedIso(clock, -MOCK_PROFILE_UPDATED_AGO_MS);
}

/**
 * 히스토리 목록 fixture (C-8 — schema + parse 테스트만, 호출자 Stage 7). 최신 먼저.
 * 세션 분석 갱신 1건 + 온보딩 1건.
 */
export function createCapabilitySnapshotPageFixture(
  instrument: OnboardingInstrument,
  clock: Clock,
): CapabilitySnapshotPage {
  return CapabilitySnapshotPageSchema.parse({
    items: [
      createSnapshot({
        id: MOCK_PROFILE_ROW_IDS.sessionSnapshot,
        source: 'session_analysis',
        createdAt: profileUpdatedAt(clock),
        scores: createSessionAnalysisScores(),
      }),
      createSnapshot({
        id: MOCK_PROFILE_ROW_IDS.onboardingSnapshot,
        source: 'onboarding_survey',
        createdAt: onboardedAt(clock),
        scores: scoreSurveyAnswers(instrument, createDefaultSurveyAnswers(instrument)),
      }),
    ],
    nextCursor: null,
  });
}

export function createPersonaPageFixture(clock: Clock): PersonaPage {
  return PersonaPageSchema.parse({
    items: [
      createPersona({
        id: MOCK_PROFILE_ROW_IDS.changedPersona,
        variant: 'changed',
        createdAt: profileUpdatedAt(clock),
      }),
      createPersona({
        id: MOCK_PROFILE_ROW_IDS.persona,
        variant: 'default',
        createdAt: onboardedAt(clock),
      }),
    ],
    nextCursor: null,
  });
}
