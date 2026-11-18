/**
 * dev Scenario Panel 이 전환할 수 있는 그룹 목록.
 *
 * key 는 `docs/API_CONTRACTS.md` §5.4 Catalogue 의 machine key 만 쓴다 (AC-1-40).
 * deprecated alias(`default` · `slow` …) 는 쓰지 않는다.
 *
 * `__states` 는 API 그룹이 아니라 **gallery 의 공통 상태 데모** 그룹이다
 * (Design Spec §5.7 — `?scenario=__states:empty`). health 에는 `empty` 가 없으므로
 * EmptyState 는 이 그룹으로 확인한다 (Plan §8.1 · §8.2).
 */
import { activityScenarioGroup } from '../../mocks/activities/MockActivityApi';
import { analysisScenarioGroup } from '../../mocks/analysis/analysisScenarios';
import { booksScenarioGroup } from '../../mocks/books/MockBooksApi';
import { childrenScenarioGroup } from '../../mocks/children/childProfileRecords';
import { healthScenarioGroup } from '../../mocks/health/MockHealthApi';
import { homeScenarioGroup } from '../../mocks/home/MockHomeApi';
import { libraryScenarioGroup } from '../../mocks/library/MockLibraryApi';
import { reflectionScenarioGroup } from '../../mocks/reflections/MockReflectionApi';
import { sessionCompletionScenarioGroup } from '../../mocks/sessions/sessionFixtureScenarios';
import type { ScenarioGroupDefinition } from '../../mocks/scenarios';

export const STATES_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
] as const;

export type StatesScenarioKey = (typeof STATES_SCENARIO_KEYS)[number];

export const statesScenarioGroup: ScenarioGroupDefinition<StatesScenarioKey> = {
  group: '__states',
  keys: STATES_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** 패널이 보여 주는 순서 그대로 (결정적). */
export const DEV_SCENARIO_GROUPS: readonly ScenarioGroupDefinition<string>[] = [
  healthScenarioGroup,
  // Stage 3 — Home 집계 · Activity Card (Plan §8.1 그룹)
  homeScenarioGroup,
  activityScenarioGroup,
  // Stage 3 Home 재구현 — `★ Save` 저장/해제 (API_CONTRACTS §3.7)
  libraryScenarioGroup,
  // Library 2라운드-3 — 책 상세 prompts (`no-reason` 포함, API_CONTRACTS §5.4)
  booksScenarioGroup,
  // Stage 5 (AC-5-16, Plan §5.4 R-8) — 회고 제출 · 재진입(`reflection-submitted`) · 분석 상태 (API_CONTRACTS §5.4)
  sessionCompletionScenarioGroup,
  reflectionScenarioGroup,
  analysisScenarioGroup,
  // Stage 6 (AC-6-14, Plan §8) — 프로필 · 아이 정보 · 발전 역량 · 설문 재응답 (API_CONTRACTS §5.4)
  childrenScenarioGroup,
  statesScenarioGroup,
];
