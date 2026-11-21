/**
 * `HttpSessionApi` — Storytime Session endpoint 의 Http Adapter **골격** (Stage 1 `D-7`).
 *
 * 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` 이다 — 서버 측 전이 강제(`canTransition`
 * 동일 표), 진행 중 세션 1개 규칙(`SESSION_ALREADY_ACTIVE`), 동의 강제(`to=recording`), 스티커 멱등,
 * `abandoned` 수신 시 업로드 part 정리(`P4-BIP-21`).
 *
 * 여기에서 코드로 고정하는 규약
 *   ① `create` · `transition` 은 **`Idempotency-Key` 필수**
 *   ② 요청·응답 전부 contracts schema 로 parse
 */
import {
  CreateSessionRequestSchema,
  CreateSessionResponseSchema,
  ListSessionsRequestSchema,
  ListSessionsResponseSchema,
  SessionDetailSchema,
  SessionTransitionRequestSchema,
  SessionTransitionResultSchema,
  type CreateSessionRequest,
  type ListSessionsRequestInput,
  type SessionTransitionRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { ApiMutationOptions } from '../options';
import type { SessionApi } from '../session-api';

import type { HttpClient } from './httpClient';

export const SESSIONS_PATH = '/sessions';

export function sessionPath(sessionId: string): string {
  return `${SESSIONS_PATH}/${encodeURIComponent(sessionId)}`;
}

export function sessionTransitionsPath(sessionId: string): string {
  return `${sessionPath(sessionId)}/transitions`;
}

/** 목록 query 는 `httpClient` 가 경로만 받으므로 여기에서 만든다 (`libraryListPath` 선례). */
export function childSessionsPath(childId: string, query: ListSessionsRequestInput): string {
  const parsed = ListSessionsRequestSchema.parse(query);
  const params = new URLSearchParams({ limit: String(parsed.limit) });

  if (parsed.status !== undefined) params.set('status', parsed.status);
  // Stage 8 `C8-2` — `true` / `false` 문자열로 보낸다. 생략 = 필터 없음.
  if (parsed.hasRecording !== undefined) params.set('hasRecording', String(parsed.hasRecording));
  if (parsed.cursor !== undefined) params.set('cursor', parsed.cursor);

  return `/children/${encodeURIComponent(childId)}/sessions?${params.toString()}`;
}

export function createHttpSessionApi(client: HttpClient): SessionApi {
  return {
    create: (request: { body: CreateSessionRequest }, options: ApiMutationOptions) =>
      client.request({
        method: 'POST',
        path: SESSIONS_PATH,
        body: CreateSessionRequestSchema.parse(request.body),
        schema: CreateSessionResponseSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),

    getDetail: (request: { sessionId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: sessionPath(request.sessionId),
        schema: SessionDetailSchema,
        signal: options.signal,
      }),

    transition: (
      request: { sessionId: string; body: SessionTransitionRequest },
      options: ApiMutationOptions,
    ) =>
      client.request({
        method: 'POST',
        path: sessionTransitionsPath(request.sessionId),
        body: SessionTransitionRequestSchema.parse(request.body),
        schema: SessionTransitionResultSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),

    list: (
      request: { childId: string; query: ListSessionsRequestInput },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'GET',
        path: childSessionsPath(request.childId, request.query),
        schema: ListSessionsResponseSchema,
        signal: options.signal,
      }),
  };
}
