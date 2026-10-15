/**
 * `HttpRecordingApi` — Recording Upload Contract 의 Http Adapter **골격** (Stage 1 `D-7`).
 *
 * 실제 연동(서버 측 동의 강제 · part 검증 · sha256 대조 · 90일 만료 · 토큰 발급)은
 * `BACKEND_INTEGRATION_PENDING` 이다 (`RECORDING_UPLOAD_SPEC.md`, Stage 8).
 *
 * ⚠ `status` 경로(`GET /v1/recordings/:recordingId`)는 `API_CONTRACTS` §4 Stage 4 표에 없다 —
 * §5.1.1 이 메서드만 선언했다. Handoff 확정 대상이다 (`recording-api.ts` 머리말).
 */
import {
  RecordingStatusSchema,
  RecordingUploadCompleteRequestSchema,
  RecordingUploadCompleteResponseSchema,
  RecordingUploadInitRequestSchema,
  RecordingUploadInitResponseSchema,
  RefreshUploadTokensRequestSchema,
  type RecordingUploadCompleteRequest,
  type RecordingUploadInitRequest,
  type RefreshUploadTokensRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { ApiMutationOptions } from '../options';
import type { RecordingApi } from '../recording-api';

import type { HttpClient } from './httpClient';
import { sessionPath } from './HttpSessionApi';

export function sessionRecordingsPath(sessionId: string): string {
  return `${sessionPath(sessionId)}/recordings`;
}

export function recordingPath(recordingId: string): string {
  return `/recordings/${encodeURIComponent(recordingId)}`;
}

export function createHttpRecordingApi(client: HttpClient): RecordingApi {
  return {
    init: (
      request: { sessionId: string; body: RecordingUploadInitRequest },
      options: ApiMutationOptions,
    ) =>
      client.request({
        method: 'POST',
        path: sessionRecordingsPath(request.sessionId),
        body: RecordingUploadInitRequestSchema.parse(request.body),
        schema: RecordingUploadInitResponseSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),

    refreshTokens: (
      request: { recordingId: string; body: RefreshUploadTokensRequest },
      options: ApiMutationOptions,
    ) =>
      client.request({
        method: 'POST',
        path: `${recordingPath(request.recordingId)}/upload-tokens`,
        body: RefreshUploadTokensRequestSchema.parse(request.body),
        schema: RecordingUploadInitResponseSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),

    complete: (
      request: { recordingId: string; body: RecordingUploadCompleteRequest },
      options: ApiMutationOptions,
    ) =>
      client.request({
        method: 'POST',
        path: `${recordingPath(request.recordingId)}/complete`,
        body: RecordingUploadCompleteRequestSchema.parse(request.body),
        schema: RecordingUploadCompleteResponseSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),

    status: (request: { recordingId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: recordingPath(request.recordingId),
        schema: RecordingStatusSchema,
        signal: options.signal,
      }),
  };
}
