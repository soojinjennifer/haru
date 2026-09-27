/**
 * `useMe` — `GET /v1/me` Query hook. **Route Guard 판정의 유일한 데이터 출처**다 (D-5).
 *
 * ```
 * useGuardDecision → useMe → meApi.get → MockMeApi | HttpMeApi
 * ```
 *
 * - 세션이 없으면 요청하지 않는다 (미인증 = `me: null`). 불필요한 401 왕복을 만들지 않는다.
 * - `AUTH_TOKEN_EXPIRED` 는 `withAuthRefresh` 가 **1회** refresh 후 재시도한다 (AC-2-07).
 *   재시도도 실패하면 Gateway 가 `signOut` 되고 `sessionExpired` 가 켜진다.
 * - `AUTH_REQUIRED` · `AUTH_TOKEN_EXPIRED` 로 끝난 경우는 **미인증**으로 해석한다.
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, MeResponse } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { useAuth, withAuthRefresh } from '../../shared/auth';

import { meKeys } from './meKeys';

/** Guard 입력 — `undefined` 미해결 · `null` 미인증 · 값 = 해석 완료. */
export type MeState = MeResponse | null | undefined;

export interface UseMeResult {
  me: MeState;
  isPending: boolean;
  isError: boolean;
  /** Error Envelope 이 있는 실패의 코드. 전송 실패(offline)면 `undefined`. */
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

const UNAUTHENTICATED_CODES: readonly ErrorCode[] = ['AUTH_REQUIRED', 'AUTH_TOKEN_EXPIRED'];

export function useMe(): UseMeResult {
  const { me } = useApiClients();
  const { gateway, session, markSessionExpired } = useAuth();

  const query = useQuery({
    queryKey: meKeys.detail(),
    enabled: session !== null && session !== undefined,
    queryFn: ({ signal }) =>
      withAuthRefresh(() => me.get({ signal }), {
        refresh: () => gateway.refreshSession(),
        signOut: () => gateway.signOut(),
        onSessionLost: markSessionExpired,
      }),
  });

  const error: unknown = query.error;
  const errorCode = isHaruApiError(error) ? error.code : undefined;
  const unauthenticated = errorCode !== undefined && UNAUTHENTICATED_CODES.includes(errorCode);

  function resolveMe(): MeState {
    if (session === undefined) return undefined;
    if (session === null) return null;
    if (unauthenticated) return null;

    return query.data;
  }

  return {
    me: resolveMe(),
    isPending: query.isPending,
    isError: query.isError,
    errorCode,
    isOffline: isNetworkError(error),
    refetch: () => {
      void query.refetch();
    },
  };
}
