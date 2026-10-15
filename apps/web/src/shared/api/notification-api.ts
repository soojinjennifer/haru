/**
 * `notificationApi` — 알림 설정 · 푸시 기기 등록 (`docs/API_CONTRACTS.md` §4 Stage 3 표,
 * **구현 Stage = 4** — 이월 `QA-3-001`).
 *
 * | 호출 | endpoint | Idempotency-Key |
 * |---|---|---|
 * | `getPreferences` | `GET /v1/notification-preferences` | — |
 * | `updatePreferences` | `PUT /v1/notification-preferences` | 보내지 않는다 (PUT = 상태 설정) |
 * | `registerPushDevice` | `POST /v1/push-devices` | 보내지 않는다 (§4 표에 IK 표시 없음 — 같은 token 은 같은 기기) |
 * | `deletePushDevice` | `DELETE /v1/push-devices/:id` | — (204) |
 *
 * Stage 4 Frontend 는 `platform: 'web'` 만 보낸다 (`D4-1` · `D-16`). 알림 설정 **화면**은 Out of Scope
 * (`D-18`) — 이 interface 는 이월 push 기능군(`S4-J`)이 쓴다.
 */
import type {
  NotificationPreferences,
  PushDevice,
  RegisterPushDeviceRequest,
  UpdateNotificationPreferencesRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface NotificationApi {
  getPreferences(options?: ApiRequestOptions): Promise<NotificationPreferences>;
  updatePreferences(
    request: { body: UpdateNotificationPreferencesRequest },
    options?: ApiRequestOptions,
  ): Promise<NotificationPreferences>;
  registerPushDevice(
    request: { body: RegisterPushDeviceRequest },
    options?: ApiRequestOptions,
  ): Promise<PushDevice>;
  deletePushDevice(request: { deviceId: string }, options?: ApiRequestOptions): Promise<void>;
}
