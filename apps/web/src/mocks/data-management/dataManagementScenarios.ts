/**
 * `data-management` · `account` scenario 그룹 — Stage 8 Plan §8 · `API_CONTRACTS.md` §5.3 · §5.4 (Rev 12).
 *
 * key 는 Catalogue §5.4 machine key 만 쓴다. 동의 이력 그룹(`consent:history`)은 만들지 않는다 (`N8-06` ⓑ).
 */
import type { ScenarioGroupDefinition } from '../scenarios';

export const DATA_MANAGEMENT_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
  'deletion-processing',
  'deletion-failed',
  'deletion-retry',
  'deletion-already-requested',
  // `N8-31` ⓐ (Plan rev 2.2 §8) — 화면 밖에서 이미 끝난 전체 삭제 + 이 기기의 요청 id 표시 (로컬 주입)
  'deletion-completed-offscreen',
  'recording-deleted',
  'recording-delete-local-pending',
] as const;

export type DataManagementScenarioKey = (typeof DATA_MANAGEMENT_SCENARIO_KEYS)[number];

export const dataManagementScenarioGroup: ScenarioGroupDefinition<DataManagementScenarioKey> = {
  group: 'data-management',
  keys: DATA_MANAGEMENT_SCENARIO_KEYS,
  defaultKey: 'success',
};

/**
 * `account` — `DELETE /v1/me` (탈퇴). Plan §8 은 `success` · `error` · `offline` · `deletion-pending-write-blocked` 를 정하고,
 * Catalogue §5.4 의 "전체" 공통 key(`loading` · `retry`)를 함께 받는다 (버튼 loading · 재시도 UX).
 */
export const ACCOUNT_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
  'deletion-pending-write-blocked',
] as const;

export type AccountScenarioKey = (typeof ACCOUNT_SCENARIO_KEYS)[number];

export const accountScenarioGroup: ScenarioGroupDefinition<AccountScenarioKey> = {
  group: 'account',
  keys: ACCOUNT_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 `loading` "1.5–3s". 실제 대기는 주입 timer 가 정한다. */
export const DATA_MANAGEMENT_LOADING_DELAY_MS = 1_500;
export const ACCOUNT_LOADING_DELAY_MS = 1_500;

/**
 * 진행 중 삭제 요청의 폴링 진행 — `GET /v1/data-deletion-requests/:id` **조회 횟수**로 정한다 (시간 기반 전이 금지 · 결정적).
 * 생성 응답 = `received` → 조회 1회 `received` · 2회 `processing` · 3회부터 최종(`completed` | `failed`) = "폴링 3회" (Plan §8).
 */
export const MOCK_DELETION_FINAL_READ = 3;
