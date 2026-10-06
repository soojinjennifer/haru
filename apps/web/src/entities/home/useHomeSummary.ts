/**
 * `useHomeSummary` — `GET /v1/children/:childId/home` Query hook (FR-07).
 *
 * ```
 * (feature) → useHomeSummary → homeApi.getSummary → MockHomeApi | HttpHomeApi
 * ```
 *
 * - 아이 id 가 아직 없으면(온보딩 전) **요청하지 않는다**.
 * - 이 쿼리는 **덱을 blocking 하지 않는다** (AC-3-14). 덱은 `useTodayActivityCard` 를 따로
 *   쓰며, 헤더·탭바는 두 쿼리 어느 쪽도 기다리지 않는다.
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, HomeSummary } from '@haru/contracts';

import { useCurrentChildId } from '../me';
import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { homeKeys } from './homeKeys';

export interface UseHomeSummaryResult {
  summary: HomeSummary | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useHomeSummary(): UseHomeSummaryResult {
  const { home } = useApiClients();
  const childId = useCurrentChildId();

  const result = useQuery({
    queryKey: homeKeys.summary(childId ?? ''),
    enabled: childId !== undefined,
    queryFn: ({ signal }) => home.getSummary({ childId: childId ?? '' }, { signal }),
  });

  const error: unknown = result.error;

  return {
    summary: result.data,
    isPending: childId === undefined || result.isPending,
    isError: result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void result.refetch();
    },
  };
}
