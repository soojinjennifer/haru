/**
 * `HttpHealthApi` — `GET /v1/health` 의 Http Adapter 골격 (Plan §16 D-7).
 *
 * 공개 endpoint 이므로 `Authorization` 을 붙이지 않는다 (API_CONTRACTS §1 Auth).
 * 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` 이다.
 */
import { HealthResponseSchema } from '@haru/contracts';

import type { ApiRequestOptions, HealthApi } from '../health-api';

import type { HttpClient } from './httpClient';

export const HEALTH_PATH = '/health';

export function createHttpHealthApi(client: HttpClient): HealthApi {
  return {
    get: (options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: HEALTH_PATH,
        schema: HealthResponseSchema,
        auth: false,
        signal: options.signal,
      }),
  };
}
