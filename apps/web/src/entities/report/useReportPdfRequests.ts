/**
 * `useReportPdfRequests` — 리포트 PDF 요청 · 상태 조회 (Stage 7 C7-6 · `S7-F`, FR-17).
 *
 * ```
 * (features/report-pdf 상태 머신) → useReportPdfRequests → reportPdfApi.{request, getStatus} → Mock | Http
 * ```
 *
 * 자동 조회하는 `useQuery` 가 아니다 — 요청은 **사용자 탭**, 폴링 간격·상한은 상태 머신이 정한다
 * (contracts `REPORT_PDF_POLL_INTERVAL_MS` · `REPORT_PDF_POLL_TIMEOUT_MS`, C7-6a). 그래서 명령형 핸들을 돌려준다.
 * 자동 재시도 0 — 재시도는 화면의 *Try again* 으로만 (`QueryProvider` 기본 규칙과 같다).
 *
 * `downloadUrl` · `fileName` 은 로그 · 영속 저장 금지 (Plan §5.6) — 이 hook 은 값을 기록하지 않는다.
 */
import type { ReportPdfStatus } from '@haru/contracts';
import { useMemo } from 'react';

import { useApiClients } from '../../shared/api/context';

export interface ReportPdfRequests {
  /** `POST /v1/reports/:reportId/pdf` — 같은 시도는 같은 `Idempotency-Key` (AC-7-57). */
  request(reportId: string, idempotencyKey: string, signal?: AbortSignal): Promise<ReportPdfStatus>;
  /** `GET /v1/reports/:reportId/pdf` — 생성 중은 200 `generating`. */
  getStatus(reportId: string, signal?: AbortSignal): Promise<ReportPdfStatus>;
}

export function useReportPdfRequests(): ReportPdfRequests {
  const { reportPdf } = useApiClients();

  return useMemo<ReportPdfRequests>(
    () => ({
      request(reportId, idempotencyKey, signal) {
        return reportPdf.request(
          { reportId },
          signal === undefined ? { idempotencyKey } : { idempotencyKey, signal },
        );
      },
      getStatus(reportId, signal) {
        return reportPdf.getStatus({ reportId }, signal === undefined ? {} : { signal });
      },
    }),
    [reportPdf],
  );
}
