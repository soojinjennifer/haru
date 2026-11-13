/**
 * `HttpAnalysisApi` — 분석 상태 조회 endpoint 의 Http Adapter **골격** (Stage 1 `D-7`).
 *
 * 실제 연동(STT → 분석 파이프라인 · 품질 게이트 · 피드백 생성 · 24h SLA · 소유권/RLS)은
 * `BACKEND_INTEGRATION_PENDING` 이다 (`P5-BIP-06`~`13` · `15`). 응답은 contracts 로 parse 한다.
 */
import { SessionAnalysisStatusSchema } from '@haru/contracts';

import type { AnalysisApi } from '../analysis-api';
import type { ApiRequestOptions } from '../health-api';

import type { HttpClient } from './httpClient';
import { sessionPath } from './HttpSessionApi';

export function sessionAnalysisPath(sessionId: string): string {
  return `${sessionPath(sessionId)}/analysis`;
}

export function createHttpAnalysisApi(client: HttpClient): AnalysisApi {
  return {
    getStatus: (request: { sessionId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: sessionAnalysisPath(request.sessionId),
        schema: SessionAnalysisStatusSchema,
        signal: options.signal,
      }),
  };
}
