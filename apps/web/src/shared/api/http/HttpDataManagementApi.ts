/**
 * `HttpDataManagementApi` — 데이터 관리 · 삭제 endpoint 의 Http Adapter **골격** (Stage 1 `D-7`, Stage 8 Rev 12 `C8-9`).
 *
 * 실제 연동은 `BACKEND_INTEGRATION_PENDING` 이다 — Storage 객체 삭제 · audit · job 취소(`P8-BIP-01`), 전체 삭제 파이프라인
 * (`P8-BIP-02`), `hasRecording` 필터 · 보관 정책 값(`P8-BIP-04`), 진행 중 쓰기 차단(`P8-BIP-07`).
 *
 * 여기에서 코드로 고정하는 규약
 *   ① `deleteSessionRecording` · `createDeletionRequest` 는 **`Idempotency-Key` 필수**
 *   ② 요청·응답 전부 contracts schema 로 parse (`confirmation` literal `true` · `.strict()` 포함)
 *   ③ 세션 녹음 목록은 세션 목록 endpoint 에 `hasRecording=true` 를 고정한다 (별도 endpoint 없음 — `C8-2`)
 */
import {
  CreateDeletionRequestSchema,
  DataManagementSummarySchema,
  DeletionRequestSchema,
  ListSessionsResponseSchema,
  type CreateDeletionRequest,
  type CursorPageRequestInput,
} from '@haru/contracts';

import type { DataManagementApi } from '../data-management-api';
import type { ApiRequestOptions } from '../health-api';
import type { ApiMutationOptions } from '../options';

import type { HttpClient } from './httpClient';
import { childSessionsPath, sessionPath } from './HttpSessionApi';

export const DATA_MANAGEMENT_PATH = '/data-management';
export const DATA_DELETION_REQUESTS_PATH = '/data-deletion-requests';

export function sessionRecordingPath(sessionId: string): string {
  return `${sessionPath(sessionId)}/recording`;
}

export function dataDeletionRequestPath(requestId: string): string {
  return `${DATA_DELETION_REQUESTS_PATH}/${encodeURIComponent(requestId)}`;
}

/** `GET /v1/children/:childId/sessions?hasRecording=true` — 쿼리 직렬화는 세션 목록과 같은 함수를 쓴다. */
export function recordingSessionsPath(childId: string, query: CursorPageRequestInput = {}): string {
  return childSessionsPath(childId, { ...query, hasRecording: true });
}

export function createHttpDataManagementApi(client: HttpClient): DataManagementApi {
  return {
    summary: (options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: DATA_MANAGEMENT_PATH,
        schema: DataManagementSummarySchema,
        signal: options.signal,
      }),

    listRecordingSessions: (
      request: { childId: string; query?: CursorPageRequestInput },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'GET',
        path: recordingSessionsPath(request.childId, request.query),
        schema: ListSessionsResponseSchema,
        signal: options.signal,
      }),

    deleteSessionRecording: (request: { sessionId: string }, options: ApiMutationOptions) =>
      client.request({
        method: 'DELETE',
        path: sessionRecordingPath(request.sessionId),
        schema: DeletionRequestSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),

    createDeletionRequest: (
      request: { body: CreateDeletionRequest },
      options: ApiMutationOptions,
    ) =>
      client.request({
        method: 'POST',
        path: DATA_DELETION_REQUESTS_PATH,
        body: CreateDeletionRequestSchema.parse(request.body),
        schema: DeletionRequestSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),

    getDeletionRequest: (request: { requestId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: dataDeletionRequestPath(request.requestId),
        schema: DeletionRequestSchema,
        signal: options.signal,
      }),
  };
}
