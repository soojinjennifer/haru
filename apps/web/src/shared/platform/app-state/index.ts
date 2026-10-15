/**
 * network / appState 포트 — interface + Web 구현 (`S4-E`). Native 구현은 후속 단계가 **추가만** 한다.
 * 구현 선택은 `app/providers` 한 곳에서 한다 (Plan §5.2-2).
 */
export type {
  AppStateEvent,
  AppStatePort,
  AppStateUnsubscribe,
  AppVisibility,
  Connectivity,
} from './app-state-port';
export {
  createBrowserAppStateEnvironment,
  createWebAppStatePort,
  type WebAppStateEnvironment,
} from './web-app-state';
