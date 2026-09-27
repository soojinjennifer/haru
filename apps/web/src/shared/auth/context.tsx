/**
 * 인증 세션 접근 지점 (context) — Query hook · feature 가 Gateway 를 **주입받는** 통로다.
 *
 * 선택(Mock | 실제)은 `app/providers/AuthProvider.tsx` 가 하고 여기에는 선택 로직이 없다.
 * `shared` 에 있어야 `entities/*` 가 레이어 역방향 import 없이 접근할 수 있다
 * (`.claude/rules/architecture.md` §3).
 */
import type { AuthSession } from '@haru/contracts';
import { createContext, use, type ReactNode } from 'react';

import type { AuthGateway } from './AuthGateway';

/** `undefined` = 아직 해석되지 않음 (Guard 는 이 동안 `pending` 이다 — AC-2-44). */
export type AuthSessionState = AuthSession | null | undefined;

export interface AuthContextValue {
  gateway: AuthGateway;
  session: AuthSessionState;
  /**
   * refresh 까지 실패해 세션을 잃었는가 (AC-2-07).
   * `true` 면 Guard 가 `/auth/welcome` 대신 `/auth/log-in` 으로 보낸다.
   */
  sessionExpired: boolean;
  /** `withAuthRefresh` 의 `onSessionLost` 에 연결된다. */
  markSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthContextProviderProps {
  value: AuthContextValue;
  children: ReactNode;
}

/** 이미 결정된 Gateway·세션을 하위 트리에 공급한다 (선택 로직 없음). */
export function AuthContextProvider({ value, children }: AuthContextProviderProps) {
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);

  if (value === null) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }

  return value;
}

/** 세션만 필요한 소비자용 단축 hook. */
export function useAuthSession(): AuthSessionState {
  return useAuth().session;
}
