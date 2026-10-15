/**
 * `offline-queued` 전용 연결 상태 — Stage 4 Plan §8.2 (AC-4-31 · AC-4-66).
 *
 * `offline` 은 **영구** 오프라인이다 (Adapter 가 항상 network error 를 던진다).
 * `offline-queued` 는 "오프라인에서 녹음 완료 → 큐 대기 → **복구 후 업로드**" 라서 **복구 시점**이
 * 있어야 한다. 그 시점을 이 객체가 정한다.
 *
 * - 시작은 **끊김**이다 (`offline-queued` 를 고른 이유가 끊김에서 시작하는 것이므로).
 * - 테스트는 `goOnline()` 을 직접 부른다 (결정적).
 * - 브라우저 조립(`createBrowserMockApiClients`)은 window `online` 이벤트에 `goOnline()` 을 연결한다.
 *   Playwright `context.setOffline(true → false)` 가 그 이벤트를 낸다. 실제 네트워크는 쓰지 않는다.
 *
 * ⚠ 다른 scenario 는 이 값을 보지 않는다 — `success` 등에서 연결 상태가 응답을 바꾸지 않는다.
 */
export interface MockConnectivity {
  isOnline(): boolean;
  goOnline(): void;
  goOffline(): void;
}

export function createMockConnectivity(initiallyOnline = false): MockConnectivity {
  let online = initiallyOnline;

  return {
    isOnline: () => online,
    goOnline: () => {
      online = true;
    },
    goOffline: () => {
      online = false;
    },
  };
}
