/**
 * `useDataManagementSummary` — `GET /v1/data-management` Query hook (Stage 8 `C8-1`, Plan §5.2).
 *
 * ```
 * (feature) → useDataManagementSummary → dataManagementApi.summary → MockDataManagementApi | HttpDataManagementApi
 * ```
 *
 * - 보관 일수(`retentionPolicy.rawAudioDays`) · 삭제 가능한 녹음 수(`recordingsCount` — `VG8-A-04`) · 진행 중 삭제 요청.
 * - 화면은 보관 일수를 **이 응답 값으로만** 쓴다 (`90` 리터럴 0 — AC-8-15).
 * - 세션 녹음 삭제 성공 시 무효화된다 (`recordingsCount` 가 줄어든다).
 */
import { useQuery } from '@tanstack/react-query';
import type { DataManagementSummary, ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { dataManagementKeys } from './dataManagementKeys';

export interface UseDataManagementSummaryResult {
  summary: DataManagementSummary | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

export function useDataManagementSummary(): UseDataManagementSummaryResult {
  const { dataManagement } = useApiClients();

  const result = useQuery({
    queryKey: dataManagementKeys.summary(),
    queryFn: ({ signal }) => dataManagement.summary({ signal }),
  });

  const error: unknown = result.error;

  return {
    summary: result.data,
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
