/**
 * `useReportList` — `GET /v1/children/:childId/reports` (cursor) infinite Query hook (Stage 7 C7-3 · `N7-11`).
 *
 * - 최신 먼저 (서버 순서 그대로). *Show earlier reports* = `fetchNextPage` (Spec §2.4).
 * - stale 5분 (Plan §5.2). `enabled` 가 거짓이면 요청하지 않는다 — 과거 목록을 보일 조건(`N7-35`)이 아닐 때.
 * - overview 의 `latestReport.id` 가 바뀌면(새 발행) 목록이 낡는다 — 호출부가 키 `latestId` 를 넘겨 다른 캐시를 쓴다.
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import type { ErrorCode, ReportSummary } from '@haru/contracts';

import { useCurrentChildId } from '../me';
import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { reportKeys } from './reportKeys';

export const REPORT_LIST_STALE_TIME_MS = 5 * 60_000;

export interface UseReportListOptions {
  enabled: boolean;
  /** overview 의 `latestReport.id` — 바뀌면 목록 캐시를 새로 쓴다 (Plan §5.2 "latestReport.id 가 바뀌면 invalidate"). */
  latestId: string | null;
}

export interface UseReportListResult {
  reports: readonly ReportSummary[];
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export function useReportList({ enabled, latestId }: UseReportListOptions): UseReportListResult {
  const { reports } = useApiClients();
  const childId = useCurrentChildId();

  const result = useInfiniteQuery({
    queryKey: [...reportKeys.list(childId ?? ''), latestId ?? 'none'] as const,
    enabled: enabled && childId !== undefined,
    staleTime: REPORT_LIST_STALE_TIME_MS,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      reports.list(
        {
          childId: childId ?? '',
          ...(pageParam === undefined ? {} : { query: { cursor: pageParam } }),
        },
        { signal },
      ),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });

  const error: unknown = result.error;

  return {
    reports: result.data?.pages.flatMap((page) => page.items) ?? [],
    isPending: result.isPending,
    isError: result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    fetchNextPage: () => {
      void result.fetchNextPage();
    },
    refetch: () => {
      void result.refetch();
    },
  };
}
