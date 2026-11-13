/**
 * `useSessionAnalysis` — `GET /v1/sessions/:sessionId/analysis` Query hook (Stage 5 Plan §5.2 · §5.3, FR-13 · FR-14).
 *
 * ```
 * (feature) → useSessionAnalysis → analysisApi.getStatus → MockAnalysisApi | HttpAnalysisApi
 * ```
 *
 * - 폴링 간격은 `selectAnalysisRefetchInterval` (15초 · `failed` 60초 · 종착 정지, `N5-14`).
 * - 화면이 가려지면 멈춘다 (`refetchIntervalInBackground: false` — `visibilitychange`).
 * - 이 hook 을 쓰는 화면만 조회한다 — 다른 화면은 분석 상태를 조회하지 않는다 (AC-5-35). `enabled: false` 면 요청 0.
 * - 표시 문구는 응답 값 그대로다 — 이 hook 은 `shortFeedback.text` 를 가공하지 않는다 (AC-5-37).
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, SessionAnalysisStatus } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { analysisKeys } from './analysisKeys';
import { selectAnalysisRefetchInterval } from './analysisPolling';

export interface UseSessionAnalysisResult {
  analysis: SessionAnalysisStatus | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useSessionAnalysis(
  sessionId: string,
  options: { enabled?: boolean } = {},
): UseSessionAnalysisResult {
  const { analysis } = useApiClients();

  const result = useQuery({
    queryKey: analysisKeys.status(sessionId),
    queryFn: ({ signal }) => analysis.getStatus({ sessionId }, { signal }),
    enabled: options.enabled ?? true,
    refetchInterval: (query) => {
      const error: unknown = query.state.error;
      return selectAnalysisRefetchInterval(
        query.state.data,
        isHaruApiError(error) ? error.code : undefined,
      );
    },
    refetchIntervalInBackground: false,
  });

  const error: unknown = result.error;

  return {
    analysis: result.data,
    isPending: result.isPending,
    isError: result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void result.refetch();
    },
  };
}
