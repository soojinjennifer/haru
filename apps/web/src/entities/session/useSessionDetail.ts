/**
 * `useSessionDetail` — `GET /v1/sessions/:sessionId` Query hook (Stage 4 Plan §9.3, FR-09).
 *
 * ```
 * (feature) → useSessionDetail → sessionApi.getDetail → MockSessionApi | HttpSessionApi
 * ```
 *
 * 세션 화면의 **표시 데이터**(버블 인사 · Prompt · 책 · 모드)의 출처다. 녹음 진행 상태는 이 쿼리가 아니라
 * `useSessionRecorder` 구독이 소유한다 — 녹음 중에는 클라이언트가 서버보다 앞선다 (`ARCHITECTURE` §10.1-6).
 * 그래서 이 쿼리는 재조회로 화면 상태를 덮어쓰지 않도록 **자동 재조회를 끈다**.
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, SessionDetail } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { sessionKeys } from './sessionKeys';

export interface UseSessionDetailResult {
  session: SessionDetail | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useSessionDetail(sessionId: string): UseSessionDetailResult {
  const { sessions } = useApiClients();

  const result = useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: ({ signal }) => sessions.getDetail({ sessionId }, { signal }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const error: unknown = result.error;

  return {
    session: result.data,
    isPending: result.isPending,
    isError: result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void result.refetch();
    },
  };
}
