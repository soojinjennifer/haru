/**
 * `AppStatePort` 의 Web 구현 — `navigator.onLine` · `online`/`offline` · `visibilitychange` · `devicechange`.
 *
 * 브라우저 전역은 **호출 시점에** 읽는다 (모듈 로드 시 전역을 만지지 않는다 — 테스트·SSR 안전).
 * 테스트는 `WebAppStateEnvironment` 를 주입하거나 jsdom 전역 이벤트를 그대로 쓴다.
 */
import type { AppStateEvent, AppStatePort, AppVisibility, Connectivity } from './app-state-port';

/** 브라우저와 닿는 최소 handle. */
export interface WebAppStateEnvironment {
  isOnline(): boolean;
  isHidden(): boolean;
  onConnectivity(listener: () => void): () => void;
  onVisibility(listener: () => void): () => void;
  onDeviceChange(listener: () => void): () => void;
}

export function createBrowserAppStateEnvironment(): WebAppStateEnvironment {
  const win = typeof window === 'undefined' ? undefined : window;
  const doc = typeof document === 'undefined' ? undefined : document;
  const devices = (): MediaDevices | undefined =>
    typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;

  return {
    // `navigator.onLine` 이 없으면 연결됨으로 본다 — 끊김을 가정해 업로드를 영원히 미루지 않는다.
    isOnline: () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false),
    isHidden: () => doc?.visibilityState === 'hidden',
    onConnectivity(listener) {
      win?.addEventListener('online', listener);
      win?.addEventListener('offline', listener);
      return () => {
        win?.removeEventListener('online', listener);
        win?.removeEventListener('offline', listener);
      };
    },
    onVisibility(listener) {
      doc?.addEventListener('visibilitychange', listener);
      return () => {
        doc?.removeEventListener('visibilitychange', listener);
      };
    },
    onDeviceChange(listener) {
      const target = devices();
      if (typeof target?.addEventListener !== 'function') return () => undefined;
      target.addEventListener('devicechange', listener);
      return () => {
        target.removeEventListener('devicechange', listener);
      };
    },
  };
}

export function createWebAppStatePort(
  environment: WebAppStateEnvironment = createBrowserAppStateEnvironment(),
): AppStatePort {
  const listeners = new Set<(event: AppStateEvent) => void>();
  const read = (): { connectivity: Connectivity; visibility: AppVisibility } => ({
    connectivity: environment.isOnline() ? 'online' : 'offline',
    visibility: environment.isHidden() ? 'hidden' : 'visible',
  });
  let last = read();

  const emit = (event: AppStateEvent): void => {
    for (const listener of [...listeners]) listener(event);
  };

  const offConnectivity = environment.onConnectivity(() => {
    const value = read().connectivity;
    if (value === last.connectivity) return;
    last = { ...last, connectivity: value };
    emit({ type: 'connectivity', value });
  });
  const offVisibility = environment.onVisibility(() => {
    const value = read().visibility;
    if (value === last.visibility) return;
    last = { ...last, visibility: value };
    emit({ type: 'visibility', value });
  });
  const offDevices = environment.onDeviceChange(() => {
    emit({ type: 'audio_devices_changed' });
  });

  return {
    connectivity: () => read().connectivity,
    visibility: () => read().visibility,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      offConnectivity();
      offVisibility();
      offDevices();
      listeners.clear();
    },
  };
}
