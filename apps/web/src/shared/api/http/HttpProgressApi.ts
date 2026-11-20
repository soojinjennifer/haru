/**
 * `HttpProgressApi` — 주간 Progress endpoint 의 Http Adapter **골격** (Stage 1 `D-7`, Stage 7 C7-1).
 *
 * 실제 연동(보호자 시간대 주 경계 · 집계 산식 · Growth themes 판정 · Moment 선정·안전 검증 · 소유권)은
 * `BACKEND_INTEGRATION_PENDING` 이다 (`P7-BIP-01`~`03` · `13`). 응답은 contracts 로 parse 한다.
 */
import {
  WeeklyProgressQuerySchema,
  WeeklyProgressSchema,
  type WeeklyProgressQuery,
} from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { ProgressApi } from '../progress-api';

import type { HttpClient } from './httpClient';

/** `weekStart` 는 query 다 — `httpClient` 가 경로만 받으므로 여기에서 만든다 (`childSessionsPath` 선례). */
export function weeklyProgressPath(childId: string, query: WeeklyProgressQuery = {}): string {
  const parsed = WeeklyProgressQuerySchema.parse(query);
  const base = `/children/${encodeURIComponent(childId)}/progress/weekly`;
  if (parsed.weekStart === undefined) return base;
  return `${base}?${new URLSearchParams({ weekStart: parsed.weekStart }).toString()}`;
}

export function createHttpProgressApi(client: HttpClient): ProgressApi {
  return {
    getWeekly: (
      request: { childId: string; query?: WeeklyProgressQuery },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'GET',
        path: weeklyProgressPath(request.childId, request.query),
        schema: WeeklyProgressSchema,
        signal: options.signal,
      }),
  };
}
