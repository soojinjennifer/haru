/**
 * Mock **아이 프로필 서버 상태** — `MockChildrenApi`(읽기·쓰기) · `MockOnboardingApi`(온보딩 제출) ·
 * `MockMeApi`(`child.firstName`)가 공유하는 하나의 진실 (Stage 6 Plan §8 "상태 저장형").
 *
 * 실제 Backend 의 `children` · `capability_snapshots` · `personas` · `growth_capability_selections` ·
 * `survey_responses`(버전 행) 에 해당한다 (`docs/plans/stage-6-plan.md` §6). 그래서
 *  - 아이 정보 수정 → `GET /profile` 과 `GET /v1/me` 가 새 이름을 쓴다 (AC-6-11 · AC-6-22)
 *  - 재응답 제출 → **새** 스냅샷 행(`survey_update`) + **새** 응답 버전 행. 이전 행은 그대로다 (`P6-BIP-07`)
 *  - 온보딩 제출 → 이 상태가 그 결과로 다시 만들어진다 (프로필 화면의 데이터 출처 = `GET /profile`, `D6-5`)
 *
 * 행(스냅샷 · 페르소나 · 응답)은 **불변**이다 — 넣을 때 `Object.freeze` 한다. 갱신은 새 행이다.
 * 번들마다 새로 만든다 — 테스트 간 상태가 새지 않는다. 시간·ID 는 호출자가 넣는다(결정성).
 */
import {
  selectGrowingEdges,
  selectStrengths,
  type Capability,
  type CapabilitySnapshot,
  type Child,
  type ChildProfile,
  type CompleteSurveyUpdateAnswers,
  type InstrumentRef,
  type Persona,
  type SurveyUpdateDraftAnswers,
  type SurveyUpdateStep,
} from '@haru/contracts';

/** 설문 응답 **버전 행** — 온보딩 = 1, 재응답마다 +1. 제출된 행은 수정하지 않는다. */
export interface MockSurveyResponseRow {
  readonly version: number;
  readonly origin: 'onboarding' | 'survey_update';
  readonly instrument: InstrumentRef;
  readonly answers: Readonly<CompleteSurveyUpdateAnswers>;
  readonly submittedAt: string;
}

/** 발전 역량 선택 기록 (`growth_capability_selections` — 선택 주체는 서버가 기록한다, FR-06). */
export interface MockGrowthSelectionRow {
  readonly capability: Capability;
  readonly actor: 'system_suggested' | 'caregiver_changed';
  readonly at: string;
}

/** 진행 중인 재응답 draft — 서버가 정본이다 (`N6-07`: 기기 로컬 저장 없음). */
export interface MockSurveyUpdateDraft {
  answers: SurveyUpdateDraftAnswers;
  currentStep: SurveyUpdateStep;
  /** 이번 draft 에서 저장된 단계. */
  completed: Set<SurveyUpdateStep>;
}

export interface MockChildProfileRecord {
  child: Child;
  /** 오래된 것 → 최신. 마지막 행이 `latestSnapshot`. */
  readonly snapshots: CapabilitySnapshot[];
  /** 오래된 것 → 최신. 마지막 행이 현재 페르소나. */
  readonly personas: Persona[];
  growthCapability: Capability | null;
  readonly growthSelections: MockGrowthSelectionRow[];
  /** 온보딩 이후 스냅샷·페르소나가 마지막으로 갱신된 시각. 갱신 없으면 `null`. */
  profileUpdatedAt: string | null;
  readonly responses: MockSurveyResponseRow[];
  draft: MockSurveyUpdateDraft | null;
}

export interface MockChildProfileState {
  /** 아직 만들어지지 않았으면 `null` — `MockChildrenApi` 가 첫 호출 때 scenario 에 맞춰 만든다. */
  current(): MockChildProfileRecord | null;
  replace(record: MockChildProfileRecord): void;
  /** 이 번들에서 이미 적용한 scenario seed (seed 는 key 당 1회 — 결정성). */
  readonly appliedSeeds: Set<string>;
  reset(): void;
}

export function createMockChildProfileState(): MockChildProfileState {
  let record: MockChildProfileRecord | null = null;
  const appliedSeeds = new Set<string>();

  return {
    current: () => record,
    replace(next) {
      record = next;
    },
    appliedSeeds,
    reset() {
      record = null;
      appliedSeeds.clear();
    },
  };
}

/** 행을 불변으로 넣는다 — "제출된 응답·스냅샷은 수정하지 않는다" 를 Mock 이 스스로 지킨다. */
export function freezeRow<T extends object>(row: T): Readonly<T> {
  return Object.freeze(row);
}

export function latestOf<T>(rows: readonly T[]): T {
  const last = rows.at(-1);
  if (last === undefined) throw new Error('Mock child profile has no rows.');
  return last;
}

/** 가장 최근 **제출된** 설문 응답 — 재응답 프리필의 출처. */
export function latestResponse(record: MockChildProfileRecord): MockSurveyResponseRow {
  return latestOf(record.responses);
}

/**
 * 레코드 → `ChildProfile`. 강점 · growing edge 는 **서버(Mock) 쪽에서** contracts 규칙으로 고른다
 * (`selectStrengths` · `selectGrowingEdges` — D-2 ③). Frontend 는 응답 값만 그린다 (AC-6-59).
 */
export function toChildProfile(record: MockChildProfileRecord): ChildProfile {
  const latestSnapshot = latestOf(record.snapshots);
  return {
    child: record.child,
    latestSnapshot,
    strengths: selectStrengths(latestSnapshot.scores),
    growingEdges: selectGrowingEdges(latestSnapshot.scores),
    persona: latestOf(record.personas),
    growthCapability: record.growthCapability,
    profileUpdatedAt: record.profileUpdatedAt,
  };
}
