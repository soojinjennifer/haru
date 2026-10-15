/**
 * `PushPermissionPort` — 푸시 알림 **권한**과 기기 토큰의 플랫폼 포트
 * (Stage 3 `D-16` · Stage 4 `D4-1` · 이월 `QA-3-001`, AC-4-81).
 *
 * | 구현 | Stage | 하는 일 |
 * |---|---|---|
 * | Web (`web-push-permission.ts`) | **4** | `Notification.permission` · `Notification.requestPermission()` **까지만** |
 * | Mock (`mocks/platform/MockPushPermissionPort.ts`) | **4** | scenario `push:push-permission-denied` 재현 |
 * | Native (Capacitor push) | 후속 `S4N-D` | 이 interface 를 **추가 구현만** 한다 |
 *
 * ⛔ Web 구현은 **실제 구독을 만들지 않는다** — `PushManager` · Service Worker 구독 · VAPID 키 ·
 * provider SDK **0건** (`D-16`). provider 가 미선정이고(PLANNING §7-6) 서버 키는 Frontend 에 둘 수
 * 없다. 그래서 Web 의 `getToken()` 은 **결정적 자리표시 값**이다 → 실제 발송 토큰은
 * `BACKEND_INTEGRATION_PENDING` (`P4-BIP-13`).
 *
 * ⭐ `RecorderAdapter` 와 같은 원칙 — **이 파일에는 DOM 타입이 나오지 않는다** (`R4-01`).
 * `NotificationPermission` 같은 Web 타입은 `web-push-permission.ts` 안에서만 쓴다.
 *
 * 선택 지점은 `app/providers` 한 곳이다 (`rules/architecture.md` §4 와 같은 규칙).
 */
import type { PushPlatform } from '@haru/contracts';

/**
 * 권한 상태 — 플랫폼 중립 값.
 *
 * | 값 | 뜻 | 화면이 할 일 (Stage 3 Design Spec §2.14) |
 * |---|---|---|
 * | `prompt` | 아직 묻지 않았다 | **사전 안내** 후 사용자가 누르면 `request()` |
 * | `granted` | 허용 | 기기 등록 (`POST /v1/push-devices`) |
 * | `denied` | 거부 — OS 프롬프트가 다시 뜨지 않는다 | 기기 설정 안내 · **재요청 버튼 없음** |
 * | `unsupported` | 이 환경에 알림 API 가 없다 | 권한 UI 를 내지 않는다 |
 */
export type PushPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface PushPermissionPort {
  /** 등록 요청의 `platform` 값. Stage 4 = `web` 만 (`D4-1`). */
  readonly platform: PushPlatform;
  /** 현재 상태를 읽는다. **권한을 요청하지 않는다** (화면 진입만으로 묻지 않는다 — §2.14). */
  getStatus(): Promise<PushPermissionStatus>;
  /**
   * OS 권한 프롬프트를 띄운다 — **사용자 행동 뒤에만** 부른다.
   * 이미 결정된 상태(`granted`·`denied`·`unsupported`)면 프롬프트 없이 그 상태를 돌려준다.
   */
  request(): Promise<PushPermissionStatus>;
  /** `granted` 일 때만 기기 토큰. 그 밖에는 `null`. 토큰은 로그에 남기지 않는다. */
  getToken(): Promise<string | null>;
}
