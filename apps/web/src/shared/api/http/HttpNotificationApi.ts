/**
 * `HttpNotificationApi` — 알림 설정 · 푸시 기기 endpoint 의 Http Adapter **골격** (Stage 1 `D-7`).
 *
 * 실제 연동(토큰 암호화 저장 · provider 발송)은 `BACKEND_INTEGRATION_PENDING` 이다.
 * `PUT` 과 `POST /v1/push-devices` 에는 `Idempotency-Key` 를 붙이지 않는다 (`notification-api.ts` 표).
 */
import {
  NotificationPreferencesSchema,
  PushDeviceSchema,
  RegisterPushDeviceRequestSchema,
  UpdateNotificationPreferencesRequestSchema,
  type RegisterPushDeviceRequest,
  type UpdateNotificationPreferencesRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { NotificationApi } from '../notification-api';

import type { HttpClient } from './httpClient';

export const NOTIFICATION_PREFERENCES_PATH = '/notification-preferences';
export const PUSH_DEVICES_PATH = '/push-devices';

export function pushDevicePath(deviceId: string): string {
  return `${PUSH_DEVICES_PATH}/${encodeURIComponent(deviceId)}`;
}

export function createHttpNotificationApi(client: HttpClient): NotificationApi {
  return {
    getPreferences: (options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: NOTIFICATION_PREFERENCES_PATH,
        schema: NotificationPreferencesSchema,
        signal: options.signal,
      }),

    updatePreferences: (
      request: { body: UpdateNotificationPreferencesRequest },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'PUT',
        path: NOTIFICATION_PREFERENCES_PATH,
        body: UpdateNotificationPreferencesRequestSchema.parse(request.body),
        schema: NotificationPreferencesSchema,
        signal: options.signal,
      }),

    registerPushDevice: (
      request: { body: RegisterPushDeviceRequest },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'POST',
        path: PUSH_DEVICES_PATH,
        body: RegisterPushDeviceRequestSchema.parse(request.body),
        schema: PushDeviceSchema,
        signal: options.signal,
      }),

    deletePushDevice: (request: { deviceId: string }, options: ApiRequestOptions = {}) =>
      client.send({
        method: 'DELETE',
        path: pushDevicePath(request.deviceId),
        signal: options.signal,
      }),
  };
}
