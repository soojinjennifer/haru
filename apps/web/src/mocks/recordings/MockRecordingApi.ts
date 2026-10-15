/**
 * `MockRecordingApi` — Recording Upload Contract Mock Adapter (`API_CONTRACTS` §3.3 · §3.9 · §5.1.1).
 *
 * 이름은 §5.1.1 그대로다 (`RecordingUploadApi` · `MockRecordingUploadApi` 등 변형 금지 — Plan §8.4-2).
 * 서버 상태(`sessionState.ts`)를 `MockSessionApi` · `MockUploadTransport` 와 공유한다.
 *
 * ── scenario (group `recordings`, `recordingScenarios.ts`) ──
 * | key | 이 Adapter 의 동작 |
 * |---|---|
 * | `success` · `recording-upload-success` | init → (전송) → complete → `uploadStatus='uploaded'`, 세션이 `completed` 면 `analyzing` (AC-4-26) |
 * | `loading` · `error` · `retry` · `offline` | 공통 (`common/delivery.ts`). `retry` 는 **메서드별** 1회차 실패 |
 * | `consent-missing` | `init` · `refreshTokens` · `complete` (CG) → `CONSENT_REQUIRED` |
 * | `recording-upload-failure` · `upload-stalled-48h` | `complete` 가 **지속** `INTERNAL_ERROR`(5xx). 전송도 지속 실패 (Transport). 48h 판정은 클라이언트 큐가 주입 clock 으로 한다 (AC-4-32) |
 * | `upload-retry` | API 는 정상. 전송이 part 마다 1회 중간 실패 (Transport) |
 * | `upload-token-expired` | `init` 이 **만료 취급 토큰**을 준다 → 전송 `UPLOAD_TOKEN_EXPIRED` → `refreshTokens` 가 유효 토큰 → 성공 (AC-4-29) |
 * | `recording-incomplete` | `complete` → `RECORDING_INCOMPLETE`(`details.partNos`) — **지속** (AC-4-30) |
 * | `offline-queued` | 연결(`common/connectivity.ts`)이 복구될 때까지 `NetworkError`, 복구 후 정상 (AC-4-31) |
 * | `recording-deleted` | 만료 토큰 → `refreshTokens` 가 `RECORDING_DELETED` (AC-4-33) |
 * | `recording-discarded` | `success` 와 같다. 폐기는 **상태 규칙** — 세션 `abandoned` 후 이 녹음의 `refreshTokens`·`complete` → `RECORDING_DELETED`, `status` → `uploadStatus='deleted'` (`D4-13`) |
 *
 * ── 서버 규칙 (상태 기반, 모든 key 에서) ──
 * - 대화 전용 세션의 `init` → `RECORDING_NOT_ALLOWED_FOR_MODE`
 * - `init` 은 `recording`·`paused`·`completed` 세션에서만 → 그 밖은 `SESSION_INVALID_TRANSITION`(`details.from`)
 * - `complete` 는 선언된 **모든 part 의 바이트가 다 올라왔을 때만** 성공 → 아니면 `RECORDING_INCOMPLETE`
 * - 삭제(폐기)된 녹음 → `RECORDING_DELETED`
 *
 * **`Idempotency-Key`**: `init` · `refreshTokens` · `complete` 는 보관·재생한다 (AC-4-37).
 * `status` 는 `RECORDING_DELETED` 를 던지지 않고 `uploadStatus='deleted'` 를 돌려준다 (§3.9 "폐기된 녹음").
 */
import {
  canTransition,
  RecordingStatusSchema,
  RecordingUploadCompleteRequestSchema,
  RecordingUploadCompleteResponseSchema,
  RecordingUploadInitRequestSchema,
  RecordingUploadInitResponseSchema,
  RefreshUploadTokensRequestSchema,
  type RecordingStatus,
  type RecordingUploadCompleteRequest,
  type RecordingUploadCompleteResponse,
  type RecordingUploadInitRequest,
  type RecordingUploadInitResponse,
  type RecordingUploadTarget,
  type RefreshUploadTokensRequest,
} from '@haru/contracts';

import { NetworkError, parseRequest, parseResponse, type Timer } from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { ApiMutationOptions } from '../../shared/api/options';
import type { RecordingApi } from '../../shared/api/recording-api';
import { shiftedIso, type Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import type { MockConnectivity } from '../common/connectivity';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { idempotencyFingerprint, type IdempotencyLedger } from '../common/idempotency';
import {
  createUploadTargetFixture,
  MOCK_UPLOAD_TOKEN_TTL_MS,
  mockObjectKey,
} from '../fixtures/recordings';
import { MOCK_RAW_AUDIO_RETENTION_MS } from '../fixtures/sessions';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioStore } from '../scenarios';
import type {
  MockRecordingRecord,
  MockSessionState,
  MockUploadPartRecord,
} from '../sessions/sessionState';

import {
  isPersistentUploadFailure,
  issuesExpiredTokens,
  RECORDING_LOADING_DELAY_MS,
  recordingScenarioGroup,
  type RecordingScenarioKey,
} from './recordingScenarios';

const INIT_OPERATION = 'POST /v1/sessions/:sessionId/recordings';
const REFRESH_OPERATION = 'POST /v1/recordings/:recordingId/upload-tokens';
const COMPLETE_OPERATION = 'POST /v1/recordings/:recordingId/complete';
const STATUS_OPERATION = 'GET /v1/recordings/:recordingId';

export interface MockRecordingApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  state: MockSessionState;
  idempotency: IdempotencyLedger;
  connectivity: MockConnectivity;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockRecordingApi(deps: MockRecordingApiDeps): RecordingApi {
  const { store, clock, idFactory, timer, state, idempotency, connectivity, requestLog } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;
  const group = recordingScenarioGroup.group;

  /** `offline-queued` — 연결이 복구되기 전에는 서버에 닿지 않는다. */
  function gate(scenario: RecordingScenarioKey): void {
    if (scenario === 'offline-queued' && !connectivity.isOnline()) {
      throw new NetworkError('Mock adapter is offline (queued).');
    }
  }

  function guardConsent(scenario: RecordingScenarioKey): void {
    if (scenario === 'consent-missing') {
      fail('CONSENT_REQUIRED', 'Consent is needed before uploading a recording.');
    }
  }

  function findRecording(recordingId: string): MockRecordingRecord {
    const recording = state.recordings.get(recordingId);
    if (recording === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown recording.');
    return recording;
  }

  function assertNotDeleted(recording: MockRecordingRecord): void {
    if (recording.uploadStatus === 'deleted') {
      fail('RECORDING_DELETED', 'This recording is no longer available.');
    }
  }

  /** part 에 새 토큰을 발급하고 대상(target)을 만든다. */
  function issue(
    recording: MockRecordingRecord,
    part: MockUploadPartRecord,
    expired: boolean,
  ): RecordingUploadTarget {
    const token = idFactory.next();
    const target = createUploadTargetFixture({
      recordingId: recording.recordingId,
      partNo: part.partNo,
      token,
      expiresAt: shiftedIso(clock, MOCK_UPLOAD_TOKEN_TTL_MS),
    });
    part.uploadToken = target.uploadToken;
    part.tokenExpired = expired;
    return target;
  }

  function initResponse(
    recording: MockRecordingRecord,
    targets: RecordingUploadTarget[],
    operation: string,
  ): RecordingUploadInitResponse {
    return parseResponse(
      RecordingUploadInitResponseSchema,
      {
        recordingId: recording.recordingId,
        uploadStatus: recording.uploadStatus,
        transport: 'tus',
        parts: targets,
      },
      { operation, direction: 'response' },
    );
  }

  return {
    async init(
      request: { sessionId: string; body: RecordingUploadInitRequest },
      options: ApiMutationOptions,
    ): Promise<RecordingUploadInitResponse> {
      const body = parseRequest(RecordingUploadInitRequestSchema, request.body, {
        operation: INIT_OPERATION,
      });
      requestLog?.record(INIT_OPERATION, { sessionId: request.sessionId, ...body });

      const fingerprint = idempotencyFingerprint(
        INIT_OPERATION,
        { sessionId: request.sessionId },
        body,
      );
      const replayed = idempotency.replay<RecordingUploadInitResponse>(
        options.idempotencyKey,
        fingerprint,
      );
      if (replayed !== undefined) return replayed;

      const { scenario, attempt } = beginScenarioCall(
        store,
        recordingScenarioGroup,
        'init',
        options.signal,
      );
      gate(scenario);
      guardConsent(scenario);

      const run = (): RecordingUploadInitResponse => {
        const session = state.sessions.get(request.sessionId);
        if (session === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown session.');

        if (session.summary.mode !== 'recorded') {
          return fail('RECORDING_NOT_ALLOWED_FOR_MODE', 'This session does not record audio.');
        }
        if (!['recording', 'paused', 'completed'].includes(session.summary.status)) {
          return fail('SESSION_INVALID_TRANSITION', 'This session cannot accept a recording.', {
            from: session.summary.status,
          });
        }

        const existing =
          session.recordingId === null ? undefined : state.recordings.get(session.recordingId);
        if (existing !== undefined) assertNotDeleted(existing);

        const recording: MockRecordingRecord = existing ?? {
          recordingId: idFactory.next(),
          sessionId: session.summary.id,
          parts: new Map(),
          uploadStatus: 'pending',
          expiresAt: null,
          deletedAt: null,
        };
        state.recordings.set(recording.recordingId, recording);
        session.recordingId = recording.recordingId;

        const targets = body.parts.map((declared) => {
          const previous = recording.parts.get(declared.partNo);
          const objectKey = mockObjectKey(recording.recordingId, declared.partNo);
          const part: MockUploadPartRecord = {
            partNo: declared.partNo,
            bytes: declared.bytes,
            objectKey,
            uploadToken: '',
            tokenExpired: false,
            // 같은 크기로 다시 선언된 part 는 서버가 받은 바이트를 유지한다 (재개 가능).
            offset:
              previous !== undefined && previous.bytes === declared.bytes ? previous.offset : 0,
            failedOnce: previous?.failedOnce ?? false,
          };
          recording.parts.set(part.partNo, part);
          state.objects.set(objectKey, recording.recordingId);
          return issue(recording, part, issuesExpiredTokens(scenario));
        });

        const response = initResponse(recording, targets, INIT_OPERATION);
        return idempotency.remember(options.idempotencyKey, fingerprint, response);
      };

      return deliver({
        scenario,
        attempt,
        delayMs: RECORDING_LOADING_DELAY_MS,
        run,
        message: 'Mock recording init failed.',
        errorCode: resolveErrorCode(deps.errorCodes, group, 'init'),
        signal: options.signal,
        timer,
        failure,
      });
    },

    async refreshTokens(
      request: { recordingId: string; body: RefreshUploadTokensRequest },
      options: ApiMutationOptions,
    ): Promise<RecordingUploadInitResponse> {
      const body = parseRequest(RefreshUploadTokensRequestSchema, request.body, {
        operation: REFRESH_OPERATION,
      });
      requestLog?.record(REFRESH_OPERATION, { recordingId: request.recordingId, ...body });

      const fingerprint = idempotencyFingerprint(
        REFRESH_OPERATION,
        { recordingId: request.recordingId },
        body,
      );
      const replayed = idempotency.replay<RecordingUploadInitResponse>(
        options.idempotencyKey,
        fingerprint,
      );
      if (replayed !== undefined) return replayed;

      const { scenario, attempt } = beginScenarioCall(
        store,
        recordingScenarioGroup,
        'refreshTokens',
        options.signal,
      );
      gate(scenario);
      guardConsent(scenario);

      if (scenario === 'recording-deleted') {
        return fail('RECORDING_DELETED', 'This recording is no longer available.');
      }

      const run = (): RecordingUploadInitResponse => {
        const recording = findRecording(request.recordingId);
        assertNotDeleted(recording);

        const targets = body.partNos.map((partNo) => {
          const part = recording.parts.get(partNo);
          if (part === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown recording part.');
          return issue(recording, part, false);
        });

        const response = initResponse(recording, targets, REFRESH_OPERATION);
        return idempotency.remember(options.idempotencyKey, fingerprint, response);
      };

      return deliver({
        scenario,
        attempt,
        delayMs: RECORDING_LOADING_DELAY_MS,
        run,
        message: 'Mock upload token refresh failed.',
        errorCode: resolveErrorCode(deps.errorCodes, group, 'refreshTokens'),
        signal: options.signal,
        timer,
        failure,
      });
    },

    async complete(
      request: { recordingId: string; body: RecordingUploadCompleteRequest },
      options: ApiMutationOptions,
    ): Promise<RecordingUploadCompleteResponse> {
      const body = parseRequest(RecordingUploadCompleteRequestSchema, request.body, {
        operation: COMPLETE_OPERATION,
      });
      requestLog?.record(COMPLETE_OPERATION, { recordingId: request.recordingId, ...body });

      const fingerprint = idempotencyFingerprint(
        COMPLETE_OPERATION,
        { recordingId: request.recordingId },
        body,
      );
      const replayed = idempotency.replay<RecordingUploadCompleteResponse>(
        options.idempotencyKey,
        fingerprint,
      );
      if (replayed !== undefined) return replayed;

      const { scenario, attempt } = beginScenarioCall(
        store,
        recordingScenarioGroup,
        'complete',
        options.signal,
      );
      gate(scenario);
      guardConsent(scenario);

      if (scenario === 'recording-incomplete') {
        return fail('RECORDING_INCOMPLETE', 'Some parts of the recording have not arrived yet.', {
          partNos: body.parts.map((part) => part.partNo),
        });
      }
      if (isPersistentUploadFailure(scenario)) {
        return fail('INTERNAL_ERROR', 'Mock recording complete failed.');
      }

      const run = (): RecordingUploadCompleteResponse => {
        const recording = findRecording(request.recordingId);
        assertNotDeleted(recording);

        const reported = new Map(body.parts.map((part) => [part.partNo, part]));
        const missing = [...recording.parts.values()]
          .filter((part) => {
            const claim = reported.get(part.partNo);
            return claim === undefined || claim.bytes !== part.bytes || part.offset < part.bytes;
          })
          .map((part) => part.partNo);
        const unknown = body.parts
          .filter((part) => !recording.parts.has(part.partNo))
          .map((part) => part.partNo);

        if (missing.length > 0 || unknown.length > 0) {
          return fail('RECORDING_INCOMPLETE', 'Some parts of the recording have not arrived yet.', {
            partNos: [...missing, ...unknown].sort((a, b) => a - b),
          });
        }

        recording.uploadStatus = 'uploaded';
        recording.expiresAt = shiftedIso(clock, MOCK_RAW_AUDIO_RETENTION_MS);

        const session = state.sessions.get(recording.sessionId);
        if (
          session !== undefined &&
          session.summary.status === 'completed' &&
          canTransition('completed', 'analyzing', 'server', session.summary.mode)
        ) {
          session.summary = { ...session.summary, status: 'analyzing' };
        }

        const response = parseResponse(
          RecordingUploadCompleteResponseSchema,
          {
            recordingId: recording.recordingId,
            uploadStatus: 'uploaded',
            sessionStatus: session?.summary.status ?? 'analyzing',
            expiresAt: recording.expiresAt,
          },
          { operation: COMPLETE_OPERATION, direction: 'response' },
        );
        return idempotency.remember(options.idempotencyKey, fingerprint, response);
      };

      return deliver({
        scenario,
        attempt,
        delayMs: RECORDING_LOADING_DELAY_MS,
        run,
        message: 'Mock recording complete failed.',
        errorCode: resolveErrorCode(deps.errorCodes, group, 'complete'),
        signal: options.signal,
        timer,
        failure,
      });
    },

    async status(
      request: { recordingId: string },
      options: ApiRequestOptions = {},
    ): Promise<RecordingStatus> {
      requestLog?.record(STATUS_OPERATION, { recordingId: request.recordingId });

      const { scenario, attempt } = beginScenarioCall(
        store,
        recordingScenarioGroup,
        'status',
        options.signal,
      );
      gate(scenario);

      const run = (): RecordingStatus => {
        const recording = findRecording(request.recordingId);
        return parseResponse(
          RecordingStatusSchema,
          {
            recordingId: recording.recordingId,
            uploadStatus: recording.uploadStatus,
            partCount: recording.parts.size,
            expiresAt: recording.expiresAt,
            deletedAt: recording.deletedAt,
          },
          { operation: STATUS_OPERATION, direction: 'response' },
        );
      };

      return deliver({
        scenario,
        attempt,
        delayMs: RECORDING_LOADING_DELAY_MS,
        run,
        message: 'Mock recording status failed.',
        errorCode: resolveErrorCode(deps.errorCodes, group, 'status'),
        signal: options.signal,
        timer,
        failure,
      });
    },
  };
}
