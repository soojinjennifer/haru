/**
 * `useWeeklyProgress` — `GET /v1/children/:childId/progress/weekly` Query hook (Stage 7 C7-1, Figma `31:102`).
 *
 * ```
 * (feature) → useWeeklyProgress → progressApi.getWeekly → MockProgressApi | HttpProgressApi
 * ```
 *
 * - 아이 id 가 아직 없으면 요청하지 않는다.
 * - `weekStart` 생략 = 이번 주 (서버 계산). Frontend 는 주 경계를 계산하지 않는다 (Plan §5.1 · `N7-13`).
 * - `keepPrevious` — 주를 바꾸는 동안 **이전 성공 값**을 유지한다. TopBar chip 전용(Spec §2.9 "chip = 마지막 성공
 *   값 유지"). 본문은 이 옵션을 쓰지 않는다 — 교체 중에는 Skeleton 으로 바뀐다 (Spec §6).
 * - stale = 기본값(30s, `QueryProvider`). Plan §5.2 권고 5분은 "세션 완료 시 invalidate" 와 짝인데 세션 완료에는
 *   단일 success 지점이 없어(`useSessionCompletion` 은 결과 기억만 한다) 기본값으로 두었다 — H7-3.
 *   회고 저장은 `progressKeys.all` 을 무효화한다 (`useSubmitReflection`).
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ErrorCode, WeeklyProgress } from '@haru/contracts';

import { useCurrentChildId } from '../me';
import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { progressKeys } from './progressKeys';

export interface UseWeeklyProgressOptions {
  /** 주 시작일 (`availableWeeks` 값). 생략 = 이번 주. */
  weekStart?: string | undefined;
  /** 키가 바뀌는 동안 이전 성공 값을 유지한다 (chip 전용). */
  keepPrevious?: boolean;
}

export interface UseWeeklyProgressResult {
  weekly: WeeklyProgress | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

export function useWeeklyProgress(options: UseWeeklyProgressOptions = {}): UseWeeklyProgressResult {
  const { weekStart, keepPrevious = false } = options;
  const { progress } = useApiClients();
  const childId = useCurrentChildId();

  const result = useQuery({
    queryKey: progressKeys.week(childId ?? '', weekStart),
    enabled: childId !== undefined,
    queryFn: ({ signal }) =>
      progress.getWeekly(
        { childId: childId ?? '', ...(weekStart === undefined ? {} : { query: { weekStart } }) },
        { signal },
      ),
    ...(keepPrevious ? { placeholderData: keepPreviousData } : {}),
  });

  const error: unknown = result.error;

  return {
    weekly: result.data,
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
