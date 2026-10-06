/**
 * `HttpHomeApi` — `GET /v1/children/:childId/home` 의 Http Adapter 골격 (Stage 1 `D-7`).
 *
 * 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` 이다
 * (`P3-BIP-11` 진행 중 세션 판정 · `P3-BIP-01` 일일 카드 생성 잡).
 */
import { HomeSummarySchema } from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { HomeApi } from '../home-api';

import type { HttpClient } from './httpClient';

export function homePath(childId: string): string {
  return `/children/${encodeURIComponent(childId)}/home`;
}

export function createHttpHomeApi(client: HttpClient): HomeApi {
  return {
    getSummary: (request: { childId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: homePath(request.childId),
        schema: HomeSummarySchema,
        signal: options.signal,
      }),
  };
}
