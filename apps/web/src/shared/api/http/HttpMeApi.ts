/**
 * `HttpMeApi` — `GET /v1/me` 의 Http Adapter 골격 (Plan §16 D-7).
 *
 * 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING`(P2-BIP-01) 이다.
 */
import { MeResponseSchema, type UpdateCaregiverRequest } from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { MeApi } from '../me-api';

import type { HttpClient } from './httpClient';

export const ME_PATH = '/me';

export function createHttpMeApi(client: HttpClient): MeApi {
  return {
    get: (options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: ME_PATH,
        schema: MeResponseSchema,
        signal: options.signal,
      }),

    // 보호자 소유 데이터 전용 경로다 (D-16). 아동 데이터는 이 요청에 섞이지 않는다.
    update: (request: UpdateCaregiverRequest, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'PATCH',
        path: ME_PATH,
        schema: MeResponseSchema,
        body: request,
        signal: options.signal,
      }),
  };
}
