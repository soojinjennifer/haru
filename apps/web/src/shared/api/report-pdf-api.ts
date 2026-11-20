/**
 * `reportPdfApi` — 리포트 PDF 요청 · 상태 조회 (`docs/API_CONTRACTS.md` §4 Stage 7 C7-6, FR-17).
 *
 * | 호출 | endpoint | IK | 주요 오류 |
 * |---|---|---|---|
 * | `request` | `POST /v1/reports/:reportId/pdf` | **필수** | `REPORT_NOT_READY` · `RESOURCE_NOT_FOUND` · `IDEMPOTENCY_KEY_REUSED` |
 * | `getStatus` | `GET /v1/reports/:reportId/pdf` | — | `RESOURCE_NOT_FOUND`(요청 전) — 생성 중은 **200 `generating`** |
 *
 * 폴링 간격·상한 = contracts `REPORT_PDF_POLL_INTERVAL_MS` · `REPORT_PDF_POLL_TIMEOUT_MS` (C7-6a).
 * `downloadUrl` · `fileName` 은 로그·영속 저장 금지 (Plan §5.6).
 */
import type { ReportPdfStatus } from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';
import type { ApiMutationOptions } from './options';

export interface ReportPdfApi {
  request(request: { reportId: string }, options: ApiMutationOptions): Promise<ReportPdfStatus>;
  getStatus(request: { reportId: string }, options?: ApiRequestOptions): Promise<ReportPdfStatus>;
}
