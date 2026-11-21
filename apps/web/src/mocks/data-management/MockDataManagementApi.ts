/**
 * `MockDataManagementApi` — 데이터 관리 · 삭제 Mock Adapter (Stage 8 Plan §8 그룹 `data-management` · `API_CONTRACTS` §3.13 · §5.4 Rev 12).
 *
 * **상태를 가진다** — 세션·녹음은 `MockSessionState`(세션 상세 · 하이라이트 클립과 공유), 삭제 요청은 `MockDeletionState`
 * (탈퇴 · 쓰기 차단 guard 와 공유).
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | 요약(진행 요청 없음 · `recordingsCount` = 삭제 가능 행 수 6 — `deleted`·`expired` 제외, `VG8-A-04`) · 녹음 목록 **8행 · cursor 2페이지**(5 + 3) — 행 상태 5종 · `book = null` 1행 · 40자 제목 1행 (`M8-4`, `fixtures/data-management.ts`) · 행 삭제 성공 · 전체 삭제 `received → processing → completed` |
 * | `loading` · `error` · `retry` · `offline` | 공통 (`deliver`) — 성공 응답은 `success` 와 같다 |
 * | `empty` | 녹음 0 · 목록 0 (`D4-40`) |
 * | `deletion-processing` | 이미 진행 중인 `all_data` 요청(`received`)이 요약에 있다 → 폴링 3회로 `completed` |
 * | `deletion-failed` | 전체 삭제 `received → processing → failed` (요청마다 같다 — 결정적) |
 * | `deletion-retry` | RETRY (`H8-1-N4`) — **첫** 전체 삭제 요청은 `received → processing → failed`, *Try again* 으로 만든 **두 번째부터** `received → processing → completed` (번들 안 `all_data` 요청 수로 판정 — 결정적) |
 * | `deletion-already-requested` | 진행 중 요청(`processing` 고정)이 요약에 있다 · `POST` → `DELETION_ALREADY_REQUESTED` |
 * | `deletion-completed-offscreen` | 화면 밖에서 이미 끝난 `all_data` 요청 — 요약 진행 요청 0 · 요청 `GET` = `completed`(첫 조회부터) · `me` 온보딩 전 (`N8-31` ⓐ). 기기 표시는 `dataDeletionMarkerSeed.ts` |
 * | `recording-deleted` | 행 삭제 → `RECORDING_DELETED`(`reason: 'deleted'`) — 서버 상태는 *이미 삭제됨* 으로 바뀌어 재조회 시 행이 *Deleted* |
 * | `recording-delete-local-pending` | 서버 동작은 `success` 와 같다. 기기 seed(`mocks/recorder/deviceSeed.ts`)가 `pending` 행 세션에 로컬 미업로드 녹음 + 큐 항목을 넣는다 |
 *
 * ── 서버 규칙 (Backend 요구 `P8-BIP-01` · `02` · `04` 와 같다) ──
 * - 아이 id 는 `GET /v1/me` 의 아이 하나뿐 — 다른 id → `CHILD_NOT_FOUND`
 * - 세션 녹음 삭제: 원본 + 클립 삭제 → `uploadStatus='deleted'` · `deletedAt` (세션 상세 · 클립 재생이 같은 값을 본다 — AC-8-10).
 *   이미 삭제 / 만료 → `RECORDING_DELETED`(`reason` = `deleted` | `expired`). 녹음 없는 세션 → `RESOURCE_NOT_FOUND`.
 *   응답 = `DeletionRequest`(`session_recording`, 즉시 `completed`)
 * - 전체 삭제: 진행 중 `all_data` · `account` 요청이 있으면 `DELETION_ALREADY_REQUESTED`. 상태는 **조회 횟수**로 진행한다
 *   (`MOCK_DELETION_FINAL_READ`). `completed` 에 닿으면 서버의 아동 데이터를 지운다(`onDataDeleted`)
 * - 진행 중 삭제가 있으면 다른 쓰기(세션 녹음 삭제 포함)는 `ACCOUNT_DELETION_PENDING` — 번들의 쓰기 guard 가 낸다 (`mocks/common/writeGuard.ts`)
 * - `Idempotency-Key`: 쓰기 2종은 키를 보관·재생한다. 판정이 scenario 분기보다 **앞**이다
 * - 요청 로그에는 id · scope · confirmation 만 남는다 (PII 0 — Plan §5.5)
 */
import {
  CreateDeletionRequestSchema,
  CursorPageRequestSchema,
  DataManagementSummarySchema,
  DeletionRequestSchema,
  ListSessionsResponseSchema,
  RecordingDeletedDetailsSchema,
  type CreateDeletionRequest,
  type CursorPageRequestInput,
  type DataManagementSummary,
  type DeletionRequest,
  type DeletionScope,
  type ListSessionsResponse,
  type SessionListItem,
} from '@haru/contracts';

import type { DataManagementApi } from '../../shared/api/data-management-api';
import { parseRequest, parseResponse, type Timer } from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { ApiMutationOptions } from '../../shared/api/options';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { idempotencyFingerprint, type IdempotencyLedger } from '../common/idempotency';
import { MOCK_RAW_AUDIO_DAYS, MOCK_RECORDING_PAGE_SIZE } from '../fixtures/data-management';
import { MOCK_CHILD_ID } from '../fixtures/me';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioStore } from '../scenarios';
import {
  markRecordingDeleted,
  toRecordingStatus,
  type MockSessionState,
} from '../sessions/sessionState';

import {
  DATA_MANAGEMENT_LOADING_DELAY_MS,
  dataManagementScenarioGroup,
  type DataManagementScenarioKey,
} from './dataManagementScenarios';
import {
  activeDeletionRequest,
  addDeletionRequest,
  ensureDeletionSeed,
  readDeletionRequest,
  type MockDeletionState,
} from './deletionState';
import { ensureRecordingHistory } from './recordingHistory';

const SUMMARY_OPERATION = 'GET /v1/data-management';
const LIST_OPERATION = 'GET /v1/children/:childId/sessions?hasRecording=true';
const DELETE_RECORDING_OPERATION = 'DELETE /v1/sessions/:sessionId/recording';
const CREATE_OPERATION = 'POST /v1/data-deletion-requests';
const GET_REQUEST_OPERATION = 'GET /v1/data-deletion-requests/:id';

/** `recordingsCount` 가 세는 녹음 상태 — *Delete* 버튼이 있는 행 (`VG8-A-04`). */
const DELETABLE_UPLOAD_STATUSES: ReadonlySet<string> = new Set(['uploaded', 'pending', 'failed']);

/** cursor 는 불투명 문자열이다 — Mock 은 다음 행의 위치를 담는다. */
const CURSOR_PREFIX = 'mock-recordings:';

export interface MockDataManagementApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  sessionState: MockSessionState;
  deletionState: MockDeletionState;
  idempotency: IdempotencyLedger;
  /** 전체 삭제 · 탈퇴가 `completed` 에 닿았을 때 — 번들이 서버 상태(세션 · 아이 프로필 · 온보딩)를 지운다. */
  onDataDeleted?: ((scope: DeletionScope) => void) | undefined;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockDataManagementApi(deps: MockDataManagementApiDeps): DataManagementApi {
  const { store, clock, idFactory, timer, sessionState, deletionState, idempotency } = deps;
  const { requestLog, errorCodes } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;
  const group = dataManagementScenarioGroup.group;

  function seed(): void {
    ensureRecordingHistory(sessionState, clock);
    ensureDeletionSeed(deletionState, store, clock.nowIso());
  }

  /** 녹음이 있는 세션 (`recording !== null`) — 최신 준비 시각 순. */
  function recordingRows(childId: string, scenario: DataManagementScenarioKey): SessionListItem[] {
    if (scenario === 'empty') return [];
    return [...sessionState.sessions.values()]
      .filter((record) => record.childId === childId)
      .map((record) => ({ ...record.summary, recording: toRecordingStatus(sessionState, record) }))
      .filter((item) => item.recording !== null)
      .sort((a, b) => (a.readyAt < b.readyAt ? 1 : a.readyAt > b.readyAt ? -1 : 0));
  }

  function offsetOf(cursor: string | undefined): number {
    if (cursor === undefined) return 0;
    const offset = cursor.startsWith(CURSOR_PREFIX)
      ? Number(cursor.slice(CURSOR_PREFIX.length))
      : Number.NaN;
    if (!Number.isInteger(offset) || offset <= 0) {
      return fail('VALIDATION_FAILED', 'That page is not available.', { fields: ['cursor'] });
    }
    return offset;
  }

  function call<T>(
    method: string,
    scenario: DataManagementScenarioKey,
    attempt: number,
    signal: AbortSignal | undefined,
    run: () => T,
  ): Promise<T> {
    return deliver({
      scenario,
      attempt,
      delayMs: DATA_MANAGEMENT_LOADING_DELAY_MS,
      run,
      message: 'Mock data management request failed.',
      errorCode: resolveErrorCode(errorCodes, group, method),
      signal,
      timer,
      failure,
    });
  }

  /** 새 전체 삭제 요청이 폴링 끝에 닿는 결과. `deletion-retry` = 첫 요청만 실패 (`H8-1-N4`). */
  function deletionOutcome(scenario: DataManagementScenarioKey): 'completed' | 'failed' {
    if (scenario === 'deletion-failed') return 'failed';
    if (scenario === 'deletion-retry') {
      const earlier = [...deletionState.records.values()].filter(
        (record) => record.request.scope === 'all_data',
      ).length;
      return earlier === 0 ? 'failed' : 'completed';
    }
    return 'completed';
  }

  function recordingDeleted(reason: 'deleted' | 'expired'): never {
    return fail(
      'RECORDING_DELETED',
      'This recording is no longer available.',
      RecordingDeletedDetailsSchema.parse({ reason }),
    );
  }

  return {
    summary(options: ApiRequestOptions = {}): Promise<DataManagementSummary> {
      requestLog?.record(SUMMARY_OPERATION);
      const { scenario, attempt } = beginScenarioCall(
        store,
        dataManagementScenarioGroup,
        'summary',
        options.signal,
      );

      return call('summary', scenario, attempt, options.signal, () => {
        seed();
        return parseResponse(
          DataManagementSummarySchema,
          {
            retentionPolicy: { rawAudioDays: MOCK_RAW_AUDIO_DAYS },
            // 삭제 가능한 녹음만 센다 — `deleted` · `expired` 행은 목록에 남지만 세지 않는다 (`VG8-A-04`, Spec §2.2).
            recordingsCount: recordingRows(MOCK_CHILD_ID, scenario).filter(
              (row) =>
                row.recording !== null && DELETABLE_UPLOAD_STATUSES.has(row.recording.uploadStatus),
            ).length,
            activeDeletionRequest: activeDeletionRequest(deletionState),
          },
          { operation: SUMMARY_OPERATION, direction: 'response' },
        );
      });
    },

    listRecordingSessions(
      request: { childId: string; query?: CursorPageRequestInput },
      options: ApiRequestOptions = {},
    ): Promise<ListSessionsResponse> {
      const query = parseRequest(CursorPageRequestSchema, request.query ?? {}, {
        operation: LIST_OPERATION,
      });
      requestLog?.record(LIST_OPERATION, { childId: request.childId, ...query });
      const { scenario, attempt } = beginScenarioCall(
        store,
        dataManagementScenarioGroup,
        'listRecordingSessions',
        options.signal,
      );

      return call('listRecordingSessions', scenario, attempt, options.signal, () => {
        seed();
        if (request.childId !== MOCK_CHILD_ID) return fail('CHILD_NOT_FOUND', 'Unknown child.');

        const rows = recordingRows(request.childId, scenario);
        const offset = offsetOf(query.cursor);
        const size = Math.min(query.limit, MOCK_RECORDING_PAGE_SIZE);
        const end = offset + size;

        return parseResponse(
          ListSessionsResponseSchema,
          {
            items: rows.slice(offset, end),
            nextCursor: end < rows.length ? `${CURSOR_PREFIX}${String(end)}` : null,
          },
          { operation: LIST_OPERATION, direction: 'response' },
        );
      });
    },

    async deleteSessionRecording(
      request: { sessionId: string },
      options: ApiMutationOptions,
    ): Promise<DeletionRequest> {
      requestLog?.record(DELETE_RECORDING_OPERATION, { sessionId: request.sessionId });

      const fingerprint = idempotencyFingerprint(
        DELETE_RECORDING_OPERATION,
        { sessionId: request.sessionId },
        null,
      );
      const replayed = idempotency.replay<DeletionRequest>(options.idempotencyKey, fingerprint);
      if (replayed !== undefined) return replayed;

      const { scenario, attempt } = beginScenarioCall(
        store,
        dataManagementScenarioGroup,
        'deleteSessionRecording',
        options.signal,
      );

      return call('deleteSessionRecording', scenario, attempt, options.signal, () => {
        seed();
        const record = sessionState.sessions.get(request.sessionId);
        if (record === undefined || record.childId !== MOCK_CHILD_ID) {
          return fail('RESOURCE_NOT_FOUND', 'Unknown session.');
        }
        const recording =
          record.recordingId === null ? undefined : sessionState.recordings.get(record.recordingId);
        if (recording === undefined) return fail('RESOURCE_NOT_FOUND', 'No recording to delete.');

        if (recording.uploadStatus === 'deleted') return recordingDeleted('deleted');
        if (recording.uploadStatus === 'expired') return recordingDeleted('expired');

        const now = clock.nowIso();
        // 원본 + 클립 삭제 → `deleted`. 진행 중이던 업로드 토큰 · 확정도 이후 `RECORDING_DELETED` 다 (`P8-BIP-01`).
        markRecordingDeleted(sessionState, recording.recordingId, now);

        // `recording-deleted` — 다른 기기에서 이미 지운 상태. 서버 상태는 *삭제됨* 이고 응답은 오류다 (화면은 행을 갱신).
        if (scenario === 'recording-deleted') return recordingDeleted('deleted');

        const response = parseResponse(
          DeletionRequestSchema,
          {
            id: idFactory.next(),
            scope: 'session_recording',
            sessionId: request.sessionId,
            status: 'completed',
            requestedAt: now,
            completedAt: now,
          },
          { operation: DELETE_RECORDING_OPERATION, direction: 'response' },
        );
        return idempotency.remember(options.idempotencyKey, fingerprint, response);
      });
    },

    async createDeletionRequest(
      request: { body: CreateDeletionRequest },
      options: ApiMutationOptions,
    ): Promise<DeletionRequest> {
      const body = parseRequest(CreateDeletionRequestSchema, request.body, {
        operation: CREATE_OPERATION,
      });
      requestLog?.record(CREATE_OPERATION, body);

      const fingerprint = idempotencyFingerprint(CREATE_OPERATION, {}, body);
      const replayed = idempotency.replay<DeletionRequest>(options.idempotencyKey, fingerprint);
      if (replayed !== undefined) return replayed;

      const { scenario, attempt } = beginScenarioCall(
        store,
        dataManagementScenarioGroup,
        'createDeletionRequest',
        options.signal,
      );

      return call('createDeletionRequest', scenario, attempt, options.signal, () => {
        seed();
        if (activeDeletionRequest(deletionState) !== null) {
          return fail('DELETION_ALREADY_REQUESTED', 'A deletion request is already in progress.');
        }

        const created = parseResponse(
          DeletionRequestSchema,
          {
            id: idFactory.next(),
            scope: body.scope,
            sessionId: null,
            status: 'received',
            requestedAt: clock.nowIso(),
            completedAt: null,
          },
          { operation: CREATE_OPERATION, direction: 'response' },
        );
        addDeletionRequest(deletionState, created, deletionOutcome(scenario));
        return idempotency.remember(options.idempotencyKey, fingerprint, created);
      });
    },

    getDeletionRequest(
      request: { requestId: string },
      options: ApiRequestOptions = {},
    ): Promise<DeletionRequest> {
      requestLog?.record(GET_REQUEST_OPERATION, { requestId: request.requestId });
      const { scenario, attempt } = beginScenarioCall(
        store,
        dataManagementScenarioGroup,
        'getDeletionRequest',
        options.signal,
      );

      return call('getDeletionRequest', scenario, attempt, options.signal, () => {
        seed();
        const record = deletionState.records.get(request.requestId);
        if (record === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown deletion request.');

        const next = readDeletionRequest(deletionState, record, clock.nowIso(), (scope) => {
          deps.onDataDeleted?.(scope);
        });
        return parseResponse(DeletionRequestSchema, next, {
          operation: GET_REQUEST_OPERATION,
          direction: 'response',
        });
      });
    },
  };
}
