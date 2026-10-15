/**
 * `createWebPushPermissionPort` — `Notification` API 까지만 (`D-16`, AC-4-81).
 */
import { describe, expect, it, vi } from 'vitest';

import {
  createBrowserNotificationEnvironment,
  createWebPushPermissionPort,
  WEB_PERMISSION_ONLY_TOKEN,
  type WebNotificationEnvironment,
} from '../web-push-permission';

function environment(
  initial: 'default' | 'granted' | 'denied' | null,
  answer: 'default' | 'granted' | 'denied' = 'granted',
) {
  let permission = initial;
  const requestPermission = vi.fn(() => {
    permission = answer;
    return Promise.resolve(answer);
  });
  const env: WebNotificationEnvironment = {
    permission: () => permission,
    requestPermission,
  };
  return { env, requestPermission };
}

describe('Web PushPermissionPort', () => {
  it('platform = web (Stage 4 는 web 만 등록한다 — D4-1)', () => {
    expect(createWebPushPermissionPort(environment('default').env).platform).toBe('web');
  });

  it('default → prompt · 상태 조회는 OS 프롬프트를 띄우지 않는다', async () => {
    const { env, requestPermission } = environment('default');
    const port = createWebPushPermissionPort(env);

    expect(await port.getStatus()).toBe('prompt');
    expect(await port.getToken()).toBeNull();
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('request → granted → 자리표시 토큰', async () => {
    const { env, requestPermission } = environment('default', 'granted');
    const port = createWebPushPermissionPort(env);

    expect(await port.request()).toBe('granted');
    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(await port.getStatus()).toBe('granted');
    expect(await port.getToken()).toBe(WEB_PERMISSION_ONLY_TOKEN);
  });

  it('request → denied → 다시 묻지 않는다 · 토큰 없음', async () => {
    const { env, requestPermission } = environment('default', 'denied');
    const port = createWebPushPermissionPort(env);

    expect(await port.request()).toBe('denied');
    expect(await port.request()).toBe('denied');
    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(await port.getToken()).toBeNull();
  });

  it('이미 granted 면 프롬프트 없이 granted', async () => {
    const { env, requestPermission } = environment('granted');
    expect(await createWebPushPermissionPort(env).request()).toBe('granted');
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('사용자가 프롬프트를 닫으면(default) 다시 prompt', async () => {
    const { env } = environment('default', 'default');
    expect(await createWebPushPermissionPort(env).request()).toBe('prompt');
  });

  it('Notification 이 없으면 unsupported — request 도 묻지 않는다', async () => {
    const { env, requestPermission } = environment(null);
    const port = createWebPushPermissionPort(env);

    expect(await port.getStatus()).toBe('unsupported');
    expect(await port.request()).toBe('unsupported');
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('브라우저 환경 — jsdom 에는 Notification 이 없다 → unsupported', async () => {
    expect('Notification' in globalThis).toBe(false);
    const port = createWebPushPermissionPort(createBrowserNotificationEnvironment());
    expect(await port.getStatus()).toBe('unsupported');
  });

  it('브라우저 환경 — Notification 전역을 호출 시점에 읽는다 (Promise · 콜백 둘 다)', async () => {
    const fake = Object.assign(vi.fn(), {
      permission: 'default' as NotificationPermission,
      requestPermission: vi.fn((callback?: (value: NotificationPermission) => void) => {
        fake.permission = 'granted';
        callback?.('granted');
        return Promise.resolve<NotificationPermission>('granted');
      }),
    });
    vi.stubGlobal('Notification', fake);
    try {
      const port = createWebPushPermissionPort(createBrowserNotificationEnvironment());
      expect(await port.getStatus()).toBe('prompt');
      expect(await port.request()).toBe('granted');
      expect(fake.requestPermission).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
