/**
 * `useReport` — `GET /v1/reports/:reportId` Query hook (Stage 7 C7-4 · `S7-D`).
 *
 * ```
 * (feature) → useReport → reportApi.getDetail → MockReportApi | HttpReportApi
 * ```
 *
 * - stale = **Infinity** — 발행 리포트는 불변 스냅샷이다 (`report_snapshots`, `P7-BIP-07` · Plan §5.2).
 *   열람 표식(`summary.viewed`)만 `useMarkReportViewed` 가 캐시에서 갱신한다.
 * - 오류 code(`REPORT_NOT_READY` · `REPORT_NOT_ELIGIBLE` · `RESOURCE_NOT_FOUND`)는 그대로 넘긴다 —
 *   어떤 화면을 그릴지는 feature 가 정한다 (Spec §2.9).
 * - 자동 재시도 0 (앱 기본 `retry: false`) — 재시도는 사용자 행동으로만.
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, ReportDetail } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { reportKeys } from './reportKeys';

export interface UseReportResult {
  report: ReportDetail | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

export function useReport(reportId: string): UseReportResult {
  const { reports } = useApiClients();

  const result = useQuery({
    queryKey: reportKeys.detail(reportId),
    enabled: reportId !== '',
    staleTime: Infinity,
    queryFn: ({ signal }) => reports.getDetail({ reportId }, { signal }),
  });

  const error: unknown = result.error;

  return {
    report: result.data,
    isPending: result.isPending,
    isError: result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    isRefetching: result.isRefetching,
    refetch: () => {
      void result.refetch();
    },
  };
}
