/**
 * `MockAccountApi` — 탈퇴 Mock Adapter (Stage 8 Plan §8 그룹 `account` · `API_CONTRACTS` §4 Stage 8 · `N8-02` ⓐ).
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | `DELETE /v1/me` → `DeletionRequest`(`scope='account'`, `received`). 이후 계정은 `deletion_pending` — 다른 쓰기 `ACCOUNT_DELETION_PENDING` |
 * | `loading` · `error` · `retry` · `offline` | 공통 (`deliver`) |
 * | `deletion-pending-write-blocked` | 이미 진행 중인 전체 삭제(`processing` 고정)가 있다 — 다른 쓰기 → `ACCOUNT_DELETION_PENDING` (쓰기 guard), 탈퇴 → `DELETION_ALREADY_REQUESTED` |
 *
 * ── 서버 규칙 (`P8-BIP-03` · `P8-BIP-07`) ──
 * - 진행 중 `all_data` · `account` 요청이 있으면 `DELETION_ALREADY_REQUESTED` (탈퇴 endpoint 자신은 `ACCOUNT_DELETION_PENDING` 이 아니다)
 * - 탈퇴 요청은 `MockDeletionState` 에 들어가 `GET /v1/data-deletion-requests/:id` 로 같은 진행(폴링 3회 → `completed`)을 따른다
 * - `Idempotency-Key` 보관·재생 — 판정이 scenario 분기보다 앞이다
 * - 요청 로그 = `confirmation` 만 (보호자 이메일 · 아이 이름 0 — Plan §5.5)
 */
import {
  DeleteAccountRequestSchema,
  DeletionRequestSchema,
  type DeleteAccountRequest,
  type DeletionRequest,
} from '@haru/contracts';

import type { AccountApi } from '../../shared/api/account-api';
import { parseRequest, parseResponse, type Timer } from '../../shared/api/helpers';
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
import {
  ACCOUNT_LOADING_DELAY_MS,
  accountScenarioGroup,
} from '../data-management/dataManagementScenarios';
import {
  activeDeletionRequest,
  addDeletionRequest,
  ensureDeletionSeed,
  type MockDeletionState,
} from '../data-management/deletionState';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioStore } from '../scenarios';

const DELETE_ACCOUNT_OPERATION = 'DELETE /v1/me';

export interface MockAccountApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  deletionState: MockDeletionState;
  idempotency: IdempotencyLedger;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockAccountApi(deps: MockAccountApiDeps): AccountApi {
  const { store, clock, idFactory, timer, deletionState, idempotency, requestLog, errorCodes } =
    deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;

  return {
    async deleteAccount(
      request: { body: DeleteAccountRequest },
      options: ApiMutationOptions,
    ): Promise<DeletionRequest> {
      const body = parseRequest(DeleteAccountRequestSchema, request.body, {
        operation: DELETE_ACCOUNT_OPERATION,
      });
      requestLog?.record(DELETE_ACCOUNT_OPERATION, body);

      const fingerprint = idempotencyFingerprint(DELETE_ACCOUNT_OPERATION, {}, body);
      const replayed = idempotency.replay<DeletionRequest>(options.idempotencyKey, fingerprint);
      if (replayed !== undefined) return replayed;

      const { scenario, attempt } = beginScenarioCall(
        store,
        accountScenarioGroup,
        'deleteAccount',
        options.signal,
      );

      return deliver({
        scenario,
        attempt,
        delayMs: ACCOUNT_LOADING_DELAY_MS,
        run: () => {
          ensureDeletionSeed(deletionState, store, clock.nowIso());
          if (activeDeletionRequest(deletionState) !== null) {
            return fail('DELETION_ALREADY_REQUESTED', 'A deletion request is already in progress.');
          }

          const created = parseResponse(
            DeletionRequestSchema,
            {
              id: idFactory.next(),
              scope: 'account',
              sessionId: null,
              status: 'received',
              requestedAt: clock.nowIso(),
              completedAt: null,
            },
            { operation: DELETE_ACCOUNT_OPERATION, direction: 'response' },
          );
          addDeletionRequest(deletionState, created, 'completed');
          return idempotency.remember(options.idempotencyKey, fingerprint, created);
        },
        message: 'Mock account deletion failed.',
        errorCode: resolveErrorCode(errorCodes, accountScenarioGroup.group, 'deleteAccount'),
        signal: options.signal,
        timer,
        failure,
      });
    },
  };
}
