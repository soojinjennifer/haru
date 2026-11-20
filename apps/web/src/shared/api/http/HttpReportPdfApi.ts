/**
 * `HttpReportPdfApi` — 리포트 PDF endpoint 의 Http Adapter **골격** (Stage 1 `D-7`, Stage 7 C7-6).
 *
 * 실제 연동(서버 렌더 · private bucket · 짧은 만료 signed URL · 같은 리포트 재요청 멱등 · 생성 ≤ 60초)은
 * `BACKEND_INTEGRATION_PENDING` 이다 (`P7-BIP-09`).
 *
 * 여기에서 코드로 고정하는 규약: ① `request` 는 **`Idempotency-Key` 필수** ② 응답 contracts parse (`ready` refine 포함).
 */
import { ReportPdfStatusSchema } from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { ApiMutationOptions } from '../options';
import type { ReportPdfApi } from '../report-pdf-api';

import type { HttpClient } from './httpClient';
import { reportPath } from './HttpReportApi';

export function reportPdfPath(reportId: string): string {
  return `${reportPath(reportId)}/pdf`;
}

export function createHttpReportPdfApi(client: HttpClient): ReportPdfApi {
  return {
    request: (request: { reportId: string }, options: ApiMutationOptions) =>
      client.request({
        method: 'POST',
        path: reportPdfPath(request.reportId),
        schema: ReportPdfStatusSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),

    getStatus: (request: { reportId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: reportPdfPath(request.reportId),
        schema: ReportPdfStatusSchema,
        signal: options.signal,
      }),
  };
}
