/**
 * `HttpReportApi` — 4주 리포트 overview · 목록 · 상세 · 열람 endpoint 의 Http Adapter **골격**
 * (Stage 1 `D-7`, Stage 7 C7-2~C7-4 · C7-7).
 *
 * 실제 연동(주기·eligibility 서버 판정 · 생성 Job · 발행 스냅샷 불변 · 열람 시각 기록 · 소유권/RLS)은
 * `BACKEND_INTEGRATION_PENDING` 이다 (`P7-BIP-04`~`08` · `11` · `13` · `15` · `16`).
 */
import {
  ReportDetailSchema,
  ReportListQuerySchema,
  ReportOverviewSchema,
  ReportSummaryPageSchema,
  type ReportListQueryInput,
} from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { ReportApi } from '../report-api';

import type { HttpClient } from './httpClient';

export const REPORTS_PATH = '/reports';

export function reportPath(reportId: string): string {
  return `${REPORTS_PATH}/${encodeURIComponent(reportId)}`;
}

export function reportViewedPath(reportId: string): string {
  return `${reportPath(reportId)}/viewed`;
}

export function reportOverviewPath(childId: string): string {
  return `/children/${encodeURIComponent(childId)}/reports/overview`;
}

export function childReportsPath(childId: string, query: ReportListQueryInput = {}): string {
  const parsed = ReportListQuerySchema.parse(query);
  const params = new URLSearchParams({ limit: String(parsed.limit) });
  if (parsed.cursor !== undefined) params.set('cursor', parsed.cursor);
  return `/children/${encodeURIComponent(childId)}/reports?${params.toString()}`;
}

export function createHttpReportApi(client: HttpClient): ReportApi {
  return {
    getOverview: (request: { childId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: reportOverviewPath(request.childId),
        schema: ReportOverviewSchema,
        signal: options.signal,
      }),

    list: (
      request: { childId: string; query?: ReportListQueryInput },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'GET',
        path: childReportsPath(request.childId, request.query),
        schema: ReportSummaryPageSchema,
        signal: options.signal,
      }),

    getDetail: (request: { reportId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: reportPath(request.reportId),
        schema: ReportDetailSchema,
        signal: options.signal,
      }),

    markViewed: (request: { reportId: string }, options: ApiRequestOptions = {}) =>
      client.send({
        method: 'POST',
        path: reportViewedPath(request.reportId),
        signal: options.signal,
      }),
  };
}
