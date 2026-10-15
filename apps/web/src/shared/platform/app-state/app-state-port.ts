/**
 * `AppStatePort` — network / appState 포트 (Stage 4 `S4-E`, Plan §9.4 "network/appState port").
 *
 * 앱이 놓인 **환경 신호**를 플랫폼 중립 값으로 알린다.
 *
 * | 신호 | Web (Stage 4) | 후속 (Native) | 쓰는 곳 |
 * |---|---|---|---|
 * | 연결 `online` / `offline` | `navigator.onLine` + window `online`·`offline` | Capacitor Network | `UploadQueue` · `SessionOutbox` 자동 재개 (AC-4-31 · AC-4-66) |
 * | 화면 `visible` / `hidden` | document `visibilitychange` | Capacitor App `appStateChange` | 복귀 시 큐 재시도 · AC-4-108 측정 도구 |
 * | 오디오 장치 변경 | `navigator.mediaDevices` `devicechange` | Capacitor/네이티브 route 변경 | AC-4-108 측정 도구 (녹음 인터럽션 판정은 `RecorderAdapter` 소관) |
 *
 * ⭐ `RecorderAdapter` 와 같은 원칙 — **이 파일에는 DOM 타입이 나오지 않는다** (`R4-01`).
 * 브라우저 접점은 `web-app-state.ts` 안에만 있다.
 *
 * ⚠️ `online` 은 "기기가 네트워크 인터페이스를 가졌다" 일 뿐 서버 도달을 보장하지 않는다. 그래서 큐는
 * `offline` 일 때 **시도를 미루기만** 하고, `online` 이라고 성공을 가정하지 않는다 (실패는 재시도로 처리).
 */

export type Connectivity = 'online' | 'offline';

export type AppVisibility = 'visible' | 'hidden';

export type AppStateEvent =
  | { readonly type: 'connectivity'; readonly value: Connectivity }
  | { readonly type: 'visibility'; readonly value: AppVisibility }
  | { readonly type: 'audio_devices_changed' };

export type AppStateUnsubscribe = () => void;

export interface AppStatePort {
  connectivity(): Connectivity;
  visibility(): AppVisibility;
  /** 신호가 바뀔 때마다 호출된다. 같은 값이 반복되면 알리지 않는다 (연결·화면). */
  subscribe(listener: (event: AppStateEvent) => void): AppStateUnsubscribe;
  /** 플랫폼 리스너를 전부 놓는다. */
  dispose(): void;
}
