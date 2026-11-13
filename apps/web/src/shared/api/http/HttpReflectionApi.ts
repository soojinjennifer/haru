/**
 * `HttpReflectionApi` — 세션 회고 endpoint 의 Http Adapter **골격** (Stage 1 `D-7`).
 *
 * 실제 연동(세션당 1건 · 완료 계열 서버 강제 · Idempotency 24h · `note` redaction · 추천·평점 반영)은
 * `BACKEND_INTEGRATION_PENDING` 이다 (`P5-BIP-01`~`05`).
 *
 * 여기에서 코드로 고정하는 규약: ① `submit` 은 **`Idempotency-Key` 필수** ② 요청·응답 contracts parse.
 */
import {
  ReflectionSchema,
  SubmitReflectionRequestSchema,
  type SubmitReflectionRequest,
} from '@haru/contracts';

import type { ApiMutationOptions } from '../options';
import type { ReflectionApi } from '../reflection-api';

import type { HttpClient } from './httpClient';
import { sessionPath } from './HttpSessionApi';

export function sessionReflectionPath(sessionId: string): string {
  return `${sessionPath(sessionId)}/reflection`;
}

export function createHttpReflectionApi(client: HttpClient): ReflectionApi {
  return {
    submit: (
      request: { sessionId: string; body: SubmitReflectionRequest },
      options: ApiMutationOptions,
    ) =>
      client.request({
        method: 'POST',
        path: sessionReflectionPath(request.sessionId),
        body: SubmitReflectionRequestSchema.parse(request.body),
        schema: ReflectionSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),
  };
}
