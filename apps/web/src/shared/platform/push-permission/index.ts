/**
 * push 권한 포트 — interface + Web 구현 (`S4-J`, 이월 `QA-3-001`). Native 구현은 후속 `S4N-D` 가
 * **추가만** 한다. 구현 선택은 `app/providers` 한 곳에서 한다.
 */
export type { PushPermissionPort, PushPermissionStatus } from './push-permission-port';
export {
  createBrowserNotificationEnvironment,
  createWebPushPermissionPort,
  WEB_PERMISSION_ONLY_TOKEN,
  type WebNotificationEnvironment,
} from './web-push-permission';
export { PushPermissionProvider, usePushPermissionPort } from './context';
export type { PushPermissionProviderProps } from './context';
