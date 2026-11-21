/**
 * 삭제 요청 서버 상태 (Mock) — `MockDataManagementApi` · `MockAccountApi` · 쓰기 차단 guard(`ACCOUNT_DELETION_PENDING`)가
 * **같은 인스턴스**를 공유한다. 실제 서버의 `data_deletion_requests` + 계정 `deletion_pending` 상태에 해당한다 (Plan §6).
 *
 * 번들마다 새로 만든다 — 테스트 간 상태가 새지 않는다. 시간·ID 는 만들지 않는다(호출자가 주입 값을 넣는다).
 */
import {
  isDeletionInProgress,
  type DeletionRequest,
  type DeletionRequestStatus,
  type DeletionScope,
} from '@haru/contracts';

import { MOCK_SEEDED_DELETION_REQUEST_ID } from '../fixtures/data-management';
import type { ScenarioStore } from '../scenarios';

import {
  accountScenarioGroup,
  dataManagementScenarioGroup,
  MOCK_DELETION_FINAL_READ,
} from './dataManagementScenarios';

/** 요청이 폴링 끝에 도달하는 결과. `stuck` = 계속 `processing` (이미 요청됨 · 쓰기 차단 재현). */
export type MockDeletionOutcome = 'completed' | 'failed' | 'stuck';

export interface MockDeletionRecord {
  request: DeletionRequest;
  outcome: MockDeletionOutcome;
  /** `GET /v1/data-deletion-requests/:id` 조회 횟수. */
  reads: number;
  /** 완료 효과(서버 데이터 삭제)를 적용했는지 — 1회만. */
  applied: boolean;
}

export interface MockDeletionState {
  readonly records: Map<string, MockDeletionRecord>;
  /** scenario seed 를 적용했는지 (번들당 1회). */
  seeded: boolean;
  /** 전체 데이터 삭제가 완료돼 아동 데이터가 서버에 없다 — `GET /v1/me` 가 온보딩 전 상태를 말한다. */
  childDataDeleted: boolean;
  /** 탈퇴가 완료됐다. */
  accountDeleted: boolean;
}

export function createMockDeletionState(): MockDeletionState {
  return { records: new Map(), seeded: false, childDataDeleted: false, accountDeleted: false };
}

/** 진행 중(`received` · `processing`)인 `all_data` · `account` 요청 — caregiver 당 1건. */
export function activeDeletionRequest(state: MockDeletionState): DeletionRequest | null {
  for (const record of state.records.values()) {
    if (record.request.scope === 'session_recording') continue;
    if (isDeletionInProgress(record.request)) return record.request;
  }
  return null;
}

/** 계정이 `deletion_pending` 인지 — 쓰기 endpoint 가 `ACCOUNT_DELETION_PENDING` 을 낸다 (`C8-5`). */
export function isAccountDeletionPending(state: MockDeletionState): boolean {
  return activeDeletionRequest(state) !== null;
}

export function addDeletionRequest(
  state: MockDeletionState,
  request: DeletionRequest,
  outcome: MockDeletionOutcome,
): void {
  state.records.set(request.id, { request, outcome, reads: 0, applied: false });
}

function statusAtRead(record: MockDeletionRecord): DeletionRequestStatus {
  if (record.outcome === 'stuck') return 'processing';
  if (record.reads <= 1) return 'received';
  if (record.reads < MOCK_DELETION_FINAL_READ) return 'processing';
  return record.outcome;
}

/**
 * 조회 1회를 반영해 다음 상태로 옮긴다. 최종 상태에 처음 닿으면 `onCompleted` 를 1회 부른다 (`completed` 만).
 * 이미 최종이면 그대로다.
 */
export function readDeletionRequest(
  state: MockDeletionState,
  record: MockDeletionRecord,
  nowIso: string,
  onCompleted: (scope: DeletionScope) => void,
): DeletionRequest {
  if (!isDeletionInProgress(record.request)) return record.request;

  record.reads += 1;
  const status = statusAtRead(record);
  if (status === record.request.status) return record.request;

  const final = status === 'completed' || status === 'failed';
  record.request = { ...record.request, status, completedAt: final ? nowIso : null };

  if (status === 'completed' && !record.applied) {
    record.applied = true;
    if (record.request.scope === 'account') state.accountDeleted = true;
    state.childDataDeleted = true;
    onCompleted(record.request.scope);
  }
  return record.request;
}

/**
 * scenario 가 요구하는 "이미 진행 중인 삭제" 를 1회 넣는다.
 *
 * | scenario | seed |
 * |---|---|
 * | `data-management:deletion-processing` | `all_data` `received` → 폴링 3회로 `completed` |
 * | `data-management:deletion-already-requested` | `all_data` `processing` 고정 — `POST` → `DELETION_ALREADY_REQUESTED` |
 * | `account:deletion-pending-write-blocked` | `all_data` `processing` 고정 — 다른 쓰기 → `ACCOUNT_DELETION_PENDING` |
 * | `data-management:deletion-completed-offscreen` | `all_data` **이미 `completed`**(완료 효과 적용됨 — 서버 아동 데이터 0) — 요약 `activeDeletionRequest = null` · 요청 `GET` 첫 조회 = `completed` · `me` = 온보딩 전 (`N8-31` ⓐ). 기기 표시는 `applyDataDeletionMarkerSeed` 가 넣는다 |
 *
 * `deletion-completed-offscreen` 의 완료 효과(서버 데이터 삭제)는 `onCompleted` 로 1회 적용한다 — 호출부(번들)가 번들 생성 시
 * 바로 부른다(`me` 가 첫 조회부터 삭제 후 상태여야 하므로 lazy seed 를 기다리지 않는다).
 */
export function ensureDeletionSeed(
  state: MockDeletionState,
  store: ScenarioStore,
  nowIso: string,
  onCompleted?: (scope: DeletionScope) => void,
): void {
  if (state.seeded) return;
  state.seeded = true;

  const dataManagement = store.resolve(dataManagementScenarioGroup);
  const account = store.resolve(accountScenarioGroup);

  const seed = (status: 'received' | 'processing', outcome: MockDeletionOutcome): void => {
    addDeletionRequest(
      state,
      {
        id: MOCK_SEEDED_DELETION_REQUEST_ID,
        scope: 'all_data',
        sessionId: null,
        status,
        requestedAt: nowIso,
        completedAt: null,
      },
      outcome,
    );
  };

  if (dataManagement === 'deletion-processing') seed('received', 'completed');
  else if (dataManagement === 'deletion-already-requested') seed('processing', 'stuck');
  else if (account === 'deletion-pending-write-blocked') seed('processing', 'stuck');
  else if (dataManagement === 'deletion-completed-offscreen') {
    // 화면 밖에서 이미 끝났다 — 조회 횟수와 무관하게 결정적으로 `completed` (`readDeletionRequest` 는 최종 상태를 그대로 돌려준다)
    const record: MockDeletionRecord = {
      request: {
        id: MOCK_SEEDED_DELETION_REQUEST_ID,
        scope: 'all_data',
        sessionId: null,
        status: 'completed',
        requestedAt: nowIso,
        completedAt: nowIso,
      },
      outcome: 'completed',
      reads: MOCK_DELETION_FINAL_READ,
      applied: true,
    };
    state.records.set(record.request.id, record);
    state.childDataDeleted = true;
    onCompleted?.('all_data');
  }
}

/** `deletion-completed-offscreen` 이 기기에 표시해 둘 요청 id (= seed 요청 id). */
export function offscreenCompletedRequestId(store: ScenarioStore): string | null {
  return store.resolve(dataManagementScenarioGroup) === 'deletion-completed-offscreen'
    ? MOCK_SEEDED_DELETION_REQUEST_ID
    : null;
}
