/**
 * `AuthProvider` — 선택된 `AuthGateway` 와 세션 상태를 앱 트리에 공급한다 (Plan §5.2).
 *
 * Gateway **선택**은 `apiClients.ts` 한 곳에서 끝나고, 이 컴포넌트는 그 결과를 구독만 한다.
 *
 * - 세션 초기값은 `undefined`(미해결) 다. Route Guard 는 그 동안 `pending` 이다 (AC-2-44).
 * - 세션 주체가 바뀌면 Query 캐시를 비운다 — 이전 사용자의 데이터가 남지 않게 한다 (S2-R6).
 * - `sessionExpired` 는 `withAuthRefresh` 가 refresh 까지 실패했을 때 켜지며,
 *   Guard 가 `/auth/welcome` 대신 `/auth/log-in` 으로 보내는 근거다 (AC-2-07).
 */
import { useQueryClient } from '@tanstack/react-query';
import type { AuthSession } from '@haru/contracts';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { AuthContextProvider, type AuthGateway, type AuthSessionState } from '../../shared/auth';

export interface AuthProviderProps {
  gateway: AuthGateway;
  children: ReactNode;
}

export function AuthProvider({ gateway, children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSessionState>(undefined);
  const [sessionExpired, setSessionExpired] = useState(false);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    // 구독 즉시 현재 값을 1회 받는다 (AuthGateway 규약).
    return gateway.onChange((next: AuthSession | null) => {
      setSession(next);

      const nextUserId = next?.userId ?? null;
      if (lastUserId.current !== nextUserId) {
        lastUserId.current = nextUserId;
        // 로그인 주체가 바뀌었다 — 이전 사용자의 서버 상태를 남기지 않는다.
        queryClient.clear();
      }

      if (next !== null) setSessionExpired(false);
    });
  }, [gateway, queryClient]);

  const markSessionExpired = useCallback(() => {
    setSessionExpired(true);
  }, []);

  const value = useMemo(
    () => ({ gateway, session, sessionExpired, markSessionExpired }),
    [gateway, session, sessionExpired, markSessionExpired],
  );

  return <AuthContextProvider value={value}>{children}</AuthContextProvider>;
}
