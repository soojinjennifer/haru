/**
 * `children` 그룹 scenario → Mock 서버 상태 (Stage 6 Plan §8 · Spec §7).
 *
 * scenario 는 **응답을 덮어쓰는 표시 override 가 아니라 서버 상태 seed** 다 — 한 번 넣은 뒤에는 상태 저장형
 * 동작(수정 → 조회 반영)이 그대로 이어진다. 그래서 `all-scores-missing` 에서 발전 역량을 고르면
 * 응답의 `growthCapability` 가 실제로 바뀐다 (AC-6-11 · AC-6-32).
 *
 * | key | seed |
 * |---|---|
 * | `success` · `empty` · 공통 4종 | 기본 레코드 — 온보딩 스냅샷 1개 · 페르소나 1개 · `profileUpdatedAt: null` |
 * | `all-scores-missing` | 4역량 문항 전부 `not_observed` → 4축 `score: null` · 강점/edge `[]` · `growthCapability: null` (D-2 변형 C) |
 * | `scores-partially-missing` | `cognitive_flexibility` 만 `not_observed` → 1축 null (D-2 변형 B) |
 * | `persona-fallback` | 페르소나 `isFallback: true` (Stage 2 fallback 문구 재사용 — R-9) |
 * | `profile-updated` | **세션 분석 스냅샷 행 추가**(`session_analysis`, 4축 점수 변화) · `profileUpdatedAt` = 1일 전 |
 * | `persona-changed` | `profile-updated` + **새 페르소나 행** (`Brave Little Maker`) |
 * | `survey-update-submitted` | 재응답 1회 제출된 상태 — 응답 v2 행 · `survey_update` 스냅샷 행 · `profileUpdatedAt` = 1일 전 |
 * | `survey-update-draft` | 진행 중 draft — `reading_together` 를 바꿔 저장하고 `books_and_interests` 에서 이탈 |
 * | `validation-failed` | 기본 레코드 (동작 차이는 `update` 만 — `MockChildrenApi`) |
 */
import {
  suggestGrowthCapability,
  type CompleteOnboardingAnswers,
  type InstrumentRef,
  type OnboardingInstrument,
  type ProfileResult,
} from '@haru/contracts';

import type { Clock } from '../../shared/lib/clock';
import {
  createDefaultChildInfo,
  createDefaultSurveyAnswers,
  createPersona,
  createSessionAnalysisScores,
  createSnapshot,
  createSurveyUpdateDraftSeed,
  createSurveyUpdateSeedAnswers,
  MOCK_PROFILE_ROW_IDS,
  MOCK_SURVEY_UPDATE_DRAFT_STEP,
  onboardedAt,
  profileUpdatedAt,
  scoreSurveyAnswers,
  type PersonaVariant,
} from '../fixtures/child-profile';
import { MOCK_CHILD_ID } from '../fixtures/me';
import type { ScenarioGroupDefinition } from '../scenarios';

import {
  freezeRow,
  latestResponse,
  type MockChildProfileRecord,
  type MockChildProfileState,
} from './childProfileState';

export const CHILDREN_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
  'profile-updated',
  'persona-changed',
  'persona-fallback',
  'all-scores-missing',
  'scores-partially-missing',
  'validation-failed',
  'survey-update-draft',
  'survey-update-submitted',
] as const;

export type ChildrenScenarioKey = (typeof CHILDREN_SCENARIO_KEYS)[number];

export const childrenScenarioGroup: ScenarioGroupDefinition<ChildrenScenarioKey> = {
  group: 'children',
  keys: CHILDREN_SCENARIO_KEYS,
  defaultKey: 'success',
};

function instrumentRef(instrument: OnboardingInstrument): InstrumentRef {
  return { code: instrument.code, version: instrument.version };
}

interface BaseVariant {
  notObserved: Parameters<typeof createDefaultSurveyAnswers>[1];
  persona: PersonaVariant;
}

function baseVariantOf(scenario: ChildrenScenarioKey): BaseVariant {
  switch (scenario) {
    case 'all-scores-missing':
      return {
        notObserved: [
          'emotion_regulation',
          'self_directed_agency',
          'cognitive_flexibility',
          'intrinsic_motivation',
        ],
        persona: 'default',
      };
    case 'scores-partially-missing':
      return { notObserved: ['cognitive_flexibility'], persona: 'default' };
    case 'persona-fallback':
      return { notObserved: [], persona: 'fallback' };
    default:
      return { notObserved: [], persona: 'default' };
  }
}

/** 온보딩만 끝난 기본 레코드 (스냅샷 1 · 페르소나 1 · 응답 v1 · 갱신 없음). */
export function createBaseChildProfileRecord(
  instrument: OnboardingInstrument,
  clock: Clock,
  scenario: ChildrenScenarioKey = 'success',
): MockChildProfileRecord {
  const variant = baseVariantOf(scenario);
  const at = onboardedAt(clock);
  const answers = createDefaultSurveyAnswers(instrument, variant.notObserved);
  const snapshot = createSnapshot({
    id: MOCK_PROFILE_ROW_IDS.onboardingSnapshot,
    source: 'onboarding_survey',
    createdAt: at,
    scores: scoreSurveyAnswers(instrument, answers),
  });
  const suggested = suggestGrowthCapability(snapshot.scores);
  const info = createDefaultChildInfo();

  return {
    child: {
      id: MOCK_CHILD_ID,
      ...info,
      topicTags: answers.books_and_interests.topicTags,
      growthGoals: answers.growing_together.growthGoals,
      ownedBooks: answers.books_and_interests.ownedBooks,
      createdAt: at,
    },
    snapshots: [freezeRow(snapshot)],
    personas: [
      freezeRow(
        createPersona({
          id: MOCK_PROFILE_ROW_IDS.persona,
          variant: variant.persona,
          createdAt: at,
        }),
      ),
    ],
    growthCapability: suggested,
    growthSelections:
      suggested === null
        ? []
        : [freezeRow({ capability: suggested, actor: 'system_suggested', at })],
    profileUpdatedAt: null,
    responses: [
      freezeRow({
        version: 1,
        origin: 'onboarding' as const,
        instrument: instrumentRef(instrument),
        answers: freezeRow(answers),
        submittedAt: at,
      }),
    ],
    draft: null,
  };
}

/**
 * 온보딩 제출 결과로 레코드를 다시 만든다 (`MockOnboardingApi` 가 부른다).
 * 아이 id 는 `GET /v1/me` 가 내려주는 `MOCK_CHILD_ID` 로 맞춘다 — 프로필 화면이 그 id 로 조회한다.
 */
export function createChildProfileRecordFromOnboarding(
  result: ProfileResult,
  answers: CompleteOnboardingAnswers,
  instrument: InstrumentRef,
): MockChildProfileRecord {
  const at = result.snapshot.createdAt;
  const { child_info: _childInfo, ...survey } = answers;
  void _childInfo;

  return {
    child: { ...result.child, id: MOCK_CHILD_ID },
    snapshots: [freezeRow(result.snapshot)],
    personas: [freezeRow(result.persona)],
    growthCapability: result.suggestedCapability,
    growthSelections:
      result.suggestedCapability === null
        ? []
        : [freezeRow({ capability: result.suggestedCapability, actor: 'system_suggested', at })],
    profileUpdatedAt: null,
    responses: [
      freezeRow({
        version: 1,
        origin: 'onboarding' as const,
        instrument,
        answers: freezeRow(survey),
        submittedAt: at,
      }),
    ],
    draft: null,
  };
}

/** 세션 분석 갱신 (`P6-BIP-01` 의 결과를 흉내 낸다) — 새 스냅샷 행 + 선택적으로 새 페르소나 행. */
function applySessionAnalysis(
  record: MockChildProfileRecord,
  clock: Clock,
  withNewPersona: boolean,
): void {
  const at = profileUpdatedAt(clock);
  record.snapshots.push(
    freezeRow(
      createSnapshot({
        id: MOCK_PROFILE_ROW_IDS.sessionSnapshot,
        source: 'session_analysis',
        createdAt: at,
        scores: createSessionAnalysisScores(),
      }),
    ),
  );
  if (withNewPersona) {
    record.personas.push(
      freezeRow(
        createPersona({
          id: MOCK_PROFILE_ROW_IDS.changedPersona,
          variant: 'changed',
          createdAt: at,
        }),
      ),
    );
  }
  record.profileUpdatedAt = at;
}

/** 재응답 제출을 서버에 반영한다 — 응답 버전 행 + `survey_update` 스냅샷 행. 기존 행은 건드리지 않는다. */
export function commitSurveyUpdate(
  record: MockChildProfileRecord,
  options: {
    instrument: OnboardingInstrument;
    answers: Parameters<typeof scoreSurveyAnswers>[1];
    snapshotId: string;
    at: string;
  },
) {
  const snapshot = freezeRow(
    createSnapshot({
      id: options.snapshotId,
      source: 'survey_update',
      createdAt: options.at,
      scores: scoreSurveyAnswers(options.instrument, options.answers),
    }),
  );
  record.responses.push(
    freezeRow({
      version: latestResponse(record).version + 1,
      origin: 'survey_update' as const,
      instrument: instrumentRef(options.instrument),
      answers: freezeRow(structuredClone(options.answers)),
      submittedAt: options.at,
    }),
  );
  record.snapshots.push(snapshot);
  record.profileUpdatedAt = options.at;
  record.draft = null;
  return snapshot;
}

/**
 * scenario 에 맞춰 상태를 준비한다 — 레코드가 없으면 만들고, seed 는 **key 당 1회**만 적용한다.
 * 기본 레코드를 바꾸는 key(`all-scores-missing` · `scores-partially-missing` · `persona-fallback`)는
 * 레코드를 다시 만든다(아이 정보는 유지).
 */
export function ensureChildProfileRecord(
  state: MockChildProfileState,
  scenario: ChildrenScenarioKey,
  instrument: OnboardingInstrument,
  clock: Clock,
): MockChildProfileRecord {
  const existing = state.current();
  const seeded = state.appliedSeeds.has(scenario);
  state.appliedSeeds.add(scenario);

  if (existing === null) {
    state.replace(createBaseChildProfileRecord(instrument, clock, scenario));
  } else if (
    !seeded &&
    (scenario === 'all-scores-missing' ||
      scenario === 'scores-partially-missing' ||
      scenario === 'persona-fallback')
  ) {
    const rebuilt = createBaseChildProfileRecord(instrument, clock, scenario);
    rebuilt.child = existing.child;
    state.replace(rebuilt);
  }

  const record = state.current();
  if (record === null) throw new Error('Mock child profile record was not created.');
  if (seeded) return record;

  switch (scenario) {
    case 'profile-updated':
      applySessionAnalysis(record, clock, false);
      break;
    case 'persona-changed':
      applySessionAnalysis(record, clock, true);
      break;
    case 'survey-update-submitted':
      commitSurveyUpdate(record, {
        instrument,
        answers: createSurveyUpdateSeedAnswers(instrument),
        snapshotId: MOCK_PROFILE_ROW_IDS.surveyUpdateSnapshot,
        at: profileUpdatedAt(clock),
      });
      break;
    case 'survey-update-draft':
      record.draft = {
        answers: createSurveyUpdateDraftSeed(latestResponse(record).answers),
        currentStep: MOCK_SURVEY_UPDATE_DRAFT_STEP,
        completed: new Set(['reading_together']),
      };
      break;
    default:
      break;
  }

  return record;
}
