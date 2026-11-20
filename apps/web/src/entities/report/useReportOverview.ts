/**
 * `useReportOverview` — `GET /v1/children/:childId/reports/overview` Query hook (Stage 7 C7-2 · C7-2a).
 *
 * ```
 * (feature) → useReportOverview → reportApi.getOverview → MockReportApi | HttpReportApi
 * ```
 *
 * - 주간 쿼리와 **독립**이다 — 한쪽 Loading/Error 가 다른 쪽을 가리지 않는다 (Spec §2.1 · AC-7-29).
 * - stale 1분 (Plan §5.2). push 진입·탭 재진입 시 refetch 는 TanStack 기본(mount 시 stale 이면 재조회)이 맡는다.
 * - 화면은 응답 `currentCycle.status` · `latestReport` 로만 분기한다 — eligibility 재판정 0 (Plan §5.1).
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, ReportOverview } from '@haru/contracts';

import { useCurrentChildId } from '../me';
import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { reportKeys } from './reportKeys';

export const REPORT_OVERVIEW_STALE_TIME_MS = 60_000;

export interface UseReportOverviewResult {
  overview: ReportOverview | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

export function useReportOverview(): UseReportOverviewResult {
  const { reports } = useApiClients();
  const childId = useCurrentChildId();

  const result = useQuery({
    queryKey: reportKeys.overview(childId ?? ''),
    enabled: childId !== undefined,
    staleTime: REPORT_OVERVIEW_STALE_TIME_MS,
    queryFn: ({ signal }) => reports.getOverview({ childId: childId ?? '' }, { signal }),
  });

  const error: unknown = result.error;

  return {
    overview: result.data,
    isPending: childId === undefined || result.isPending,
    isError: result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    isRefetching: result.isRefetching,
    refetch: () => {
      void result.refetch();
    },
  };
}
