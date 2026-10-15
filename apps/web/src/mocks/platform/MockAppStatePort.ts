/**
 * `MockAppStatePort` — network / appState 포트의 Mock (Stage 4 `S4-E`, Plan §9.4 "Mock = 주입").
 *
 * 테스트가 연결·화면·오디오 장치 신호를 **원하는 시점에** 낸다 (결정적). 같은 값으로 바꾸면 알리지 않는다
 * (`WebAppStatePort` 와 같은 약속).
 */
import type {
  AppStateEvent,
  AppStatePort,
  AppVisibility,
  Connectivity,
} from '../../shared/platform/app-state';

export interface MockAppStatePort extends AppStatePort {
  setConnectivity(value: Connectivity): void;
  setVisibility(value: AppVisibility): void;
  emitAudioDevicesChanged(): void;
  listenerCount(): number;
}

export function createMockAppStatePort(
  initial: { connectivity?: Connectivity; visibility?: AppVisibility } = {},
): MockAppStatePort {
  let connectivity: Connectivity = initial.connectivity ?? 'online';
  let visibility: AppVisibility = initial.visibility ?? 'visible';
  const listeners = new Set<(event: AppStateEvent) => void>();
  const emit = (event: AppStateEvent): void => {
    for (const listener of [...listeners]) listener(event);
  };

  return {
    connectivity: () => connectivity,
    visibility: () => visibility,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      listeners.clear();
    },
    setConnectivity(value) {
      if (value === connectivity) return;
      connectivity = value;
      emit({ type: 'connectivity', value });
    },
    setVisibility(value) {
      if (value === visibility) return;
      visibility = value;
      emit({ type: 'visibility', value });
    },
    emitAudioDevicesChanged() {
      emit({ type: 'audio_devices_changed' });
    },
    listenerCount: () => listeners.size,
  };
}
