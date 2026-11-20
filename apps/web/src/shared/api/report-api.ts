/**
 * `reportApi` — 4주 리포트 overview · 목록 · 상세 · 열람 기록 (`docs/API_CONTRACTS.md` §4 Stage 7 C7-2~C7-4 · C7-7).
 *
 * | 호출 | endpoint | IK | 주요 오류 |
 * |---|---|---|---|
 * | `getOverview` | `GET /v1/children/:childId/reports/overview` | — | `CHILD_NOT_FOUND` |
 * | `list` | `GET /v1/children/:childId/reports?limit&cursor` | — | `VALIDATION_FAILED` · `CHILD_NOT_FOUND` |
 * | `getDetail` | `GET /v1/reports/:reportId` | — | `REPORT_NOT_READY`(`details.retryAfter?`) · `REPORT_NOT_ELIGIBLE` · `RESOURCE_NOT_FOUND` |
 * | `markViewed` | `POST /v1/reports/:reportId/viewed` → 204 | — (서버 멱등 — 반복 호출 204) | `RESOURCE_NOT_FOUND` |
 *
 * 호출 경로: `Component → entities/report hook → reportApi → MockReportApi | HttpReportApi`.
 * PDF 는 `reportPdfApi`, 클립 재생 URL 은 `highlightClipApi` 가 맡는다 (Mock scenario 그룹과 같은 경계).
 */
import type {
  ReportDetail,
  ReportListQueryInput,
  ReportOverview,
  ReportSummaryPage,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface ReportApi {
  getOverview(request: { childId: string }, options?: ApiRequestOptions): Promise<ReportOverview>;
  /** 발행 리포트 목록 — 최신 먼저 (C7-3). */
  list(
    request: { childId: string; query?: ReportListQueryInput },
    options?: ApiRequestOptions,
  ): Promise<ReportSummaryPage>;
  getDetail(request: { reportId: string }, options?: ApiRequestOptions): Promise<ReportDetail>;
  /** 상세 최초 표시 시 1회 (§2.3 리포트 열람률). 204 — 응답 body 없음. */
  markViewed(request: { reportId: string }, options?: ApiRequestOptions): Promise<void>;
}
