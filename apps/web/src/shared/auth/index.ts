/** 인증 경계 공개 진입점 — Plan §5.2. 구체 Gateway 는 `app/providers` 에서만 조립한다. */
export { AUTH_GATEWAY_METHODS } from './AuthGateway';
export type { AuthGateway, AuthGatewayMethod, Unsubscribe } from './AuthGateway';
export { AuthContextProvider, useAuth, useAuthSession } from './context';
export type { AuthContextProviderProps, AuthContextValue, AuthSessionState } from './context';
export { withAuthRefresh } from './withAuthRefresh';
export type { AuthRefreshDeps } from './withAuthRefresh';
export { createUnavailableAuthGateway } from './UnavailableAuthGateway';
