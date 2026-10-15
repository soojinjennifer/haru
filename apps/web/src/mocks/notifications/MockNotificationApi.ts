/**
 * `MockNotificationApi` — 알림 설정 · 푸시 기기 Mock Adapter
 * (`API_CONTRACTS` §4 Stage 3 표, 구현 Stage 4 — 이월 `QA-3-001`).
 *
 * ── scenario (group `notifications`) — Catalogue §5.3 "notifications / push-devices" 공통 4종 + `offline` ──
 * | key | 동작 |
 * |---|---|
 * | `success` | 상태 기반 — 설정은 부분 갱신이 누적되고, 같은 token 의 재등록은 **같은 기기**를 돌려준다 |
 * | `loading` · `error` · `retry` · `offline` | 공통 (`common/delivery.ts`). `retry` 는 메서드별 1회차 실패 |
 *
 * `push-permission-denied` 는 **이 API 의 key 가 아니다** — OS 권한은 platform adapter(`PushPermissionPort`)
 * 의 일이고 `S4-J` 가 만든다 (Catalogue §5.4 "push-devices (platform adapter)").
 *
 * 응답 `PushDevice` 에는 token 이 없다 (AC-4-18). 요청 로그는 token 을 `[redacted]` 로 남긴다.
 */
import {
  NotificationPreferencesSchema,
  PushDeviceSchema,
  RegisterPushDeviceRequestSchema,
  UpdateNotificationPreferencesRequestSchema,
  type NotificationPreferences,
  type PushDevice,
  type RegisterPushDeviceRequest,
  type UpdateNotificationPreferencesRequest,
} from '@haru/contracts';

import { parseRequest, parseResponse, type Timer } from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { NotificationApi } from '../../shared/api/notification-api';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { createNotificationPreferencesFixture } from '../fixtures/notifications';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const NOTIFICATION_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
] as const;

export type NotificationScenarioKey = (typeof NOTIFICATION_SCENARIO_KEYS)[number];

export const notificationScenarioGroup: ScenarioGroupDefinition<NotificationScenarioKey> = {
  group: 'notifications',
  keys: NOTIFICATION_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** 설정 저장은 작은 쓰기다 (`LIBRARY_LOADING_DELAY_MS` 와 같은 기준). */
export const NOTIFICATION_LOADING_DELAY_MS = 900;

const GET_OPERATION = 'GET /v1/notification-preferences';
const PUT_OPERATION = 'PUT /v1/notification-preferences';
const REGISTER_OPERATION = 'POST /v1/push-devices';
const DELETE_OPERATION = 'DELETE /v1/push-devices/:id';

export interface MockNotificationApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockNotificationApi(deps: MockNotificationApiDeps): NotificationApi {
  const { store, clock, idFactory, timer, requestLog } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;
  const group = notificationScenarioGroup.group;

  let preferences: NotificationPreferences = createNotificationPreferencesFixture();
  /** token → 등록된 기기. 같은 token 은 같은 기기다. */
  const devicesByToken = new Map<string, PushDevice>();

  function call<T>(
    method: string,
    signal: AbortSignal | undefined,
    run: () => T,
    message: string,
  ): Promise<T> {
    const { scenario, attempt } = beginScenarioCall(
      store,
      notificationScenarioGroup,
      method,
      signal,
    );
    return deliver({
      scenario,
      attempt,
      delayMs: NOTIFICATION_LOADING_DELAY_MS,
      run,
      message,
      errorCode: resolveErrorCode(deps.errorCodes, group, method),
      signal,
      timer,
      failure,
    });
  }

  return {
    getPreferences(options: ApiRequestOptions = {}) {
      requestLog?.record(GET_OPERATION);
      return call(
        'getPreferences',
        options.signal,
        () =>
          parseResponse(NotificationPreferencesSchema, preferences, {
            operation: GET_OPERATION,
            direction: 'response',
          }),
        'Mock notification preferences failed.',
      );
    },

    updatePreferences(
      request: { body: UpdateNotificationPreferencesRequest },
      options: ApiRequestOptions = {},
    ) {
      const body = parseRequest(UpdateNotificationPreferencesRequestSchema, request.body, {
        operation: PUT_OPERATION,
      });
      requestLog?.record(PUT_OPERATION, body);

      return call(
        'updatePreferences',
        options.signal,
        () => {
          preferences = parseResponse(
            NotificationPreferencesSchema,
            { ...preferences, ...body },
            { operation: PUT_OPERATION, direction: 'response' },
          );
          return preferences;
        },
        'Mock notification preferences update failed.',
      );
    },

    registerPushDevice(
      request: { body: RegisterPushDeviceRequest },
      options: ApiRequestOptions = {},
    ) {
      const body = parseRequest(RegisterPushDeviceRequestSchema, request.body, {
        operation: REGISTER_OPERATION,
      });
      requestLog?.record(REGISTER_OPERATION, body);

      return call(
        'registerPushDevice',
        options.signal,
        () => {
          const existing = devicesByToken.get(body.token);
          const device = parseResponse(
            PushDeviceSchema,
            {
              id: existing?.id ?? idFactory.next(),
              platform: body.platform,
              lastSeenAt: clock.nowIso(),
            },
            { operation: REGISTER_OPERATION, direction: 'response' },
          );
          devicesByToken.set(body.token, device);
          return device;
        },
        'Mock push device registration failed.',
      );
    },

    deletePushDevice(request: { deviceId: string }, options: ApiRequestOptions = {}) {
      requestLog?.record(DELETE_OPERATION, { deviceId: request.deviceId });

      return call(
        'deletePushDevice',
        options.signal,
        () => {
          const entry = [...devicesByToken.entries()].find(
            ([, device]) => device.id === request.deviceId,
          );
          if (entry === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown device.');
          devicesByToken.delete(entry[0]);
        },
        'Mock push device removal failed.',
      );
    },
  };
}
