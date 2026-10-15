/**
 * `WebAppStatePort` — `online`/`offline` · `visibilitychange` · `devicechange` (Stage 4 `S4-E`).
 */
import { afterEach, describe, expect, it } from 'vitest';

import type { AppStateEvent } from '../app-state-port';
import { createWebAppStatePort, type WebAppStateEnvironment } from '../web-app-state';

function fakeEnvironment() {
  let online = true;
  let hidden = false;
  const connectivity = new Set<() => void>();
  const visibility = new Set<() => void>();
  const devices = new Set<() => void>();
  const environment: WebAppStateEnvironment = {
    isOnline: () => online,
    isHidden: () => hidden,
    onConnectivity: (listener) => {
      connectivity.add(listener);
      return () => connectivity.delete(listener);
    },
    onVisibility: (listener) => {
      visibility.add(listener);
      return () => visibility.delete(listener);
    },
    onDeviceChange: (listener) => {
      devices.add(listener);
      return () => devices.delete(listener);
    },
  };
  return {
    environment,
    goOffline() {
      online = false;
      for (const listener of connectivity) listener();
    },
    goOnline() {
      online = true;
      for (const listener of connectivity) listener();
    },
    hide() {
      hidden = true;
      for (const listener of visibility) listener();
    },
    show() {
      hidden = false;
      for (const listener of visibility) listener();
    },
    deviceChange() {
      for (const listener of devices) listener();
    },
    listenerCount: () => connectivity.size + visibility.size + devices.size,
  };
}

describe('WebAppStatePort (주입 환경)', () => {
  it('신호를 플랫폼 중립 이벤트로 낸다', () => {
    const env = fakeEnvironment();
    const port = createWebAppStatePort(env.environment);
    const events: AppStateEvent[] = [];
    port.subscribe((event) => events.push(event));

    env.goOffline();
    env.hide();
    env.deviceChange();
    env.show();
    env.goOnline();

    expect(events).toStrictEqual([
      { type: 'connectivity', value: 'offline' },
      { type: 'visibility', value: 'hidden' },
      { type: 'audio_devices_changed' },
      { type: 'visibility', value: 'visible' },
      { type: 'connectivity', value: 'online' },
    ]);
    expect(port.connectivity()).toBe('online');
    expect(port.visibility()).toBe('visible');
  });

  it('같은 값이 반복되면 알리지 않는다', () => {
    const env = fakeEnvironment();
    const port = createWebAppStatePort(env.environment);
    const events: AppStateEvent[] = [];
    port.subscribe((event) => events.push(event));
    env.goOnline();
    env.show();
    expect(events).toStrictEqual([]);
  });

  it('dispose 는 플랫폼 리스너를 전부 놓는다', () => {
    const env = fakeEnvironment();
    const port = createWebAppStatePort(env.environment);
    expect(env.listenerCount()).toBe(3);
    port.dispose();
    expect(env.listenerCount()).toBe(0);
  });
});

describe('WebAppStatePort (jsdom 전역)', () => {
  const ports: { dispose(): void }[] = [];
  afterEach(() => {
    for (const port of ports.splice(0)) port.dispose();
  });

  it('window online/offline · document visibilitychange 를 듣는다', () => {
    const port = createWebAppStatePort();
    ports.push(port);
    const events: AppStateEvent[] = [];
    port.subscribe((event) => events.push(event));

    const onLine = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine');
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    window.dispatchEvent(new Event('offline'));
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true });
    window.dispatchEvent(new Event('online'));
    if (onLine !== undefined) Object.defineProperty(navigator, 'onLine', onLine);

    const visibility = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));
    if (visibility !== undefined) {
      // 원래 정의(prototype)로 되돌린다
      Reflect.deleteProperty(document, 'visibilityState');
    }

    expect(events).toStrictEqual([
      { type: 'connectivity', value: 'offline' },
      { type: 'connectivity', value: 'online' },
      { type: 'visibility', value: 'hidden' },
      { type: 'visibility', value: 'visible' },
    ]);
  });
});
