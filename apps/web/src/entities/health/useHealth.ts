/**
 * `useHealth` — `GET /v1/health` Query hook.
 *
 * ```
 * Component → useHealth → healthApi.get → MockHealthApi | HttpHealthApi
 * ```
 *
 * 이 hook 은 어떤 Adapter 가 주입됐는지 모른다. Mock ↔ Http 를 바꿔도 이 파일과
 * 이 hook 을 쓰는 UI 는 바뀌지 않는다 (Plan §5.2 · Exit Criteria).
 *
 * 화면이 필요한 상태를 그대로 돌려준다:
 * Loading / Success / Error(+Retry) / Offline.
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, HealthResponse } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { healthKeys } from './healthKeys';

export interface UseHealthResult {
  data: HealthResponse | undefined;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  /** Error Envelope 이 있는 실패의 코드. 전송 실패(offline)면 `undefined`. */
  errorCode: ErrorCode | undefined;
  /** 서버에 닿지 못한 실패 — Offline Banner 대상 */
  isOffline: boolean;
  refetch: () => void;
}

export function useHealth(): UseHealthResult {
  const { health } = useApiClients();

  const query = useQuery({
    queryKey: healthKeys.status(),
    queryFn: ({ signal }) => health.get({ signal }),
  });

  const error: unknown = query.error;

  return {
    data: query.data,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void query.refetch();
    },
  };
}
