/**
 * `useDeletionRequest(id)` — `GET /v1/data-deletion-requests/:id` 진행 상태 폴링 Query hook (Stage 8 `C8-3`, Plan §5.2 · AC-8-27).
 *
 * ```
 * (feature) → useDeletionRequest → dataManagementApi.getDeletionRequest → MockDataManagementApi | HttpDataManagementApi
 * ```
 *
 * - 간격 · 상한 · 종료 = `selectDeletionRefetchInterval` (`deletionPolling.ts`). 조회 횟수 = 이 query 의 성공 + 실패 갱신 수.
 * - 화면이 보이는 동안만 (`refetchIntervalInBackground: false` — TanStack 기본) · 화면을 떠나면 observer 가 없어 멈춘다.
 * - `requestId` 가 `null` 이면 요청하지 않는다.
 * - `failed` 에 닿으면 요약을 무효화한다 — 진행 중 요청이 요약에서 빠져 *Delete all data* 행 비활성이 풀린다.
 *   (`completed` 는 감시자가 로컬 정리로 Query 캐시를 비운다 — 여기서 다시 읽지 않는다.)
 *
 * ── `mode` (Stage 8 `N8-31` ⓐ — `D8-2` ①, Plan §5.7) ──
 * | mode | 조회 | 쓰는 곳 |
 * |---|---|---|
 * | `poll` (기본) | 마운트 시 조회 + 간격 폴링 | `app/providers` 감시자(기기 표시된 `all_data` 요청) · 화면의 `account` 요청 |
 * | `observe` | **조회 0** — 같은 key 의 캐시만 읽는다 | `/settings/data` 의 `all_data` 요청 (감시자가 같은 key 로 폴링한다) |
 *
 * 화면과 감시자가 같은 key 를 쓰고 폴링 주체가 하나라 **요청 중복 0** (TanStack 은 observer 마다 interval 타이머를 둔다).
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { DeletionRequest, ErrorCode } from '@haru/contracts';
import { useEffect } from 'react';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { dataManagementKeys } from './dataManagementKeys';
import { selectDeletionRefetchInterval } from './deletionPolling';

export type DeletionRequestQueryMode = 'poll' | 'observe';

export interface UseDeletionRequestOptions {
  mode?: DeletionRequestQueryMode | undefined;
}

export interface UseDeletionRequestResult {
  request: DeletionRequest | undefined;
  errorCode: ErrorCode | undefined;
  /** 응답(성공 · 실패)을 한 번이라도 받았는가 — 감시자가 Guard 대기를 풀 때 쓴다. */
  isSettled: boolean;
  /** 마지막 실패가 네트워크 오류인가. */
  isOffline: boolean;
  /** 한 번 더 조회한다 (화면 복귀 시 — 폴링 상한 후에도 1회). `observe` 에서는 아무것도 하지 않는다. */
  refetch: () => void;
}

export function useDeletionRequest(
  requestId: string | null,
  options: UseDeletionRequestOptions = {},
): UseDeletionRequestResult {
  const mode = options.mode ?? 'poll';
  const { dataManagement } = useApiClients();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: dataManagementKeys.request(requestId ?? ''),
    enabled: requestId !== null && mode === 'poll',
    queryFn: ({ signal }) =>
      dataManagement.getDeletionRequest({ requestId: requestId ?? '' }, { signal }),
    refetchInterval: (query) => {
      if (mode !== 'poll') return false;
      const error: unknown = query.state.error;
      return selectDeletionRefetchInterval(
        query.state.data,
        isHaruApiError(error) ? error.code : undefined,
        query.state.dataUpdateCount + query.state.errorUpdateCount,
      );
    },
    refetchIntervalInBackground: false,
    retry: false,
  });

  const status = result.data?.status;
  useEffect(() => {
    if (status === 'failed') {
      void queryClient.invalidateQueries({ queryKey: dataManagementKeys.summary() });
    }
  }, [status, queryClient]);

  const error: unknown = result.error;
  const { refetch } = result;
  return {
    request: result.data,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isSettled: result.data !== undefined || result.error !== null,
    isOffline: isNetworkError(error),
    refetch: () => {
      if (requestId === null || mode !== 'poll') return;
      void refetch();
    },
  };
}
