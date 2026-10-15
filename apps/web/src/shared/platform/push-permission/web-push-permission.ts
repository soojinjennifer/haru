/**
 * `PushPermissionPort` 의 Web 구현 — `Notification.permission` / `Notification.requestPermission()`
 * **까지만** 쓴다 (`D-16`, AC-4-81).
 *
 * ⛔ 쓰지 않는 것: `PushManager` · Service Worker 구독 · VAPID · provider SDK. 그래서 `getToken()` 은
 * 실제 발송 토큰이 아니라 **결정적 자리표시 값**(`WEB_PERMISSION_ONLY_TOKEN`)이다. 서버는 이 값으로
 * 발송할 수 없다 — 실제 Web Push 구독은 provider 선정 후 Backend 와 함께 정한다
 * (`BACKEND_INTEGRATION_PENDING`, `P4-BIP-13`).
 *
 * 브라우저 전역은 **호출 시점에** 읽는다 (모듈 로드 시 전역을 만지지 않는다 — 테스트·SSR 안전).
 * 테스트는 `WebNotificationEnvironment` 를 주입한다.
 */
import type { PushPermissionPort, PushPermissionStatus } from './push-permission-port';

/**
 * Web 의 자리표시 토큰. **비밀이 아니다** — 권한을 받았다는 사실만 나타낸다.
 * 서버가 실제 구독 토큰과 구분할 수 있도록 접두사를 고정한다.
 */
export const WEB_PERMISSION_ONLY_TOKEN = 'web-permission-only:v1';

/** 브라우저 `Notification` 과 닿는 최소 handle. */
export interface WebNotificationEnvironment {
  /** `Notification` 이 없으면 `null`. */
  permission(): 'default' | 'granted' | 'denied' | null;
  /** `Notification.requestPermission()` — 구형 Safari 의 콜백 형식도 받는다. */
  requestPermission(): Promise<'default' | 'granted' | 'denied'>;
}

type BrowserNotification = typeof Notification;

function browserNotification(): BrowserNotification | null {
  if (typeof globalThis === 'undefined') return null;
  const candidate = (globalThis as { Notification?: BrowserNotification }).Notification;
  return typeof candidate === 'function' ? candidate : null;
}

export function createBrowserNotificationEnvironment(): WebNotificationEnvironment {
  return {
    permission: () => browserNotification()?.permission ?? null,
    requestPermission() {
      const api = browserNotification();
      if (api === null) return Promise.resolve('denied');

      return new Promise((resolve) => {
        // 구형 Safari 는 Promise 를 돌려주지 않고 콜백만 부른다 — 두 형식을 다 받는다.
        const maybe = api.requestPermission((result) => {
          resolve(result);
        }) as Promise<NotificationPermission> | undefined;
        void maybe?.then(resolve, () => {
          resolve('denied');
        });
      });
    },
  };
}

function toStatus(value: 'default' | 'granted' | 'denied' | null): PushPermissionStatus {
  if (value === null) return 'unsupported';
  return value === 'default' ? 'prompt' : value;
}

export function createWebPushPermissionPort(
  environment: WebNotificationEnvironment = createBrowserNotificationEnvironment(),
): PushPermissionPort {
  const status = (): PushPermissionStatus => toStatus(environment.permission());

  return {
    platform: 'web',
    getStatus: () => Promise.resolve(status()),
    async request() {
      const current = status();
      // 이미 결정됐으면 다시 묻지 않는다 — 거부 뒤의 재요청은 브라우저가 무시하거나 막는다.
      if (current !== 'prompt') return current;
      return toStatus(await environment.requestPermission());
    },
    getToken: () => Promise.resolve(status() === 'granted' ? WEB_PERMISSION_ONLY_TOKEN : null),
  };
}
