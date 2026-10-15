/**
 * `MockNotificationApi` — Stage 4 `S4-C` (AC-4-21 notifications 부분 · AC-4-18 token 미반환).
 */
import { HaruApiError, NotificationPreferencesSchema, PushDeviceSchema } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { isNetworkError } from '../../shared/api/helpers';
import {
  NOTIFICATION_SCENARIO_KEYS,
  notificationScenarioGroup,
} from '../notifications/MockNotificationApi';
import { REDACTED } from '../request-log';

import { bundle } from './stage4-support';

async function codeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HaruApiError) return error.code;
    if (isNetworkError(error)) return 'NETWORK';
    throw error;
  }
  return 'OK';
}

describe('MockNotificationApi', () => {
  it('group `notifications` — Catalogue §5.3 공통 key 만 쓴다', () => {
    expect(notificationScenarioGroup.group).toBe('notifications');
    expect(NOTIFICATION_SCENARIO_KEYS).toStrictEqual([
      'success',
      'loading',
      'error',
      'retry',
      'offline',
    ]);
  });

  it('success — 설정 조회 · 부분 갱신 누적 · 응답 parse 통과', async () => {
    const { clients } = bundle();
    const initial = await clients.notifications.getPreferences();
    expect(NotificationPreferencesSchema.safeParse(initial).success).toBe(true);
    expect(initial.pushEnabled).toBe(false);

    await clients.notifications.updatePreferences({ body: { pushEnabled: true } });
    const updated = await clients.notifications.updatePreferences({
      body: { reminderDays: [1, 3], reminderTime: '19:30' },
    });
    expect(updated).toStrictEqual({
      cardRefreshTime: '07:00',
      reminderDays: [1, 3],
      reminderTime: '19:30',
      pushEnabled: true,
    });
    expect(await clients.notifications.getPreferences()).toStrictEqual(updated);
  });

  it('push 기기 — 응답에 token 이 없고, 같은 token 은 같은 기기, 로그의 token 은 [redacted]', async () => {
    const b = bundle();
    const device = await b.clients.notifications.registerPushDevice({
      body: { platform: 'web', token: 'fake-web-push-token' },
    });
    expect(PushDeviceSchema.safeParse(device).success).toBe(true);
    expect(Object.keys(device).sort()).toStrictEqual(['id', 'lastSeenAt', 'platform']);

    const again = await b.clients.notifications.registerPushDevice({
      body: { platform: 'web', token: 'fake-web-push-token' },
    });
    expect(again.id).toBe(device.id);

    const serialized = JSON.stringify(b.requestLog.entries());
    expect(serialized).not.toContain('fake-web-push-token');
    expect(serialized).toContain(REDACTED);

    await b.clients.notifications.deletePushDevice({ deviceId: device.id });
    expect(await codeOf(b.clients.notifications.deletePushDevice({ deviceId: device.id }))).toBe(
      'RESOURCE_NOT_FOUND',
    );
  });

  it('error · retry · offline', async () => {
    expect(await codeOf(bundle('notifications:error').clients.notifications.getPreferences())).toBe(
      'INTERNAL_ERROR',
    );
    const retry = bundle('notifications:retry').clients.notifications;
    expect(await codeOf(retry.getPreferences())).toBe('INTERNAL_ERROR');
    expect(await codeOf(retry.getPreferences())).toBe('OK');
    expect(
      await codeOf(bundle('notifications:offline').clients.notifications.getPreferences()),
    ).toBe('NETWORK');
  });
});
