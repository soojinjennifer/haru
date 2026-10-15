import { describe, expect, it } from 'vitest';

import {
  NotificationPreferencesSchema,
  PushDeviceSchema,
  PushPlatformSchema,
  RegisterPushDeviceRequestSchema,
  UpdateNotificationPreferencesRequestSchema,
} from '../index.js';

/**
 * Stage 4 `S4-B` — notifications contracts (이월 `QA-3-001`, AC-4-18 · 19).
 */

const DEVICE_ID = '99999999-9999-4999-8999-000000000001';

const PREFERENCES = {
  cardRefreshTime: '07:00',
  reminderDays: [1, 3, 5],
  reminderTime: '19:30',
  pushEnabled: true,
} as const;

describe('NotificationPreferences', () => {
  it('대표 값이 parse 된다', () => {
    expect(NotificationPreferencesSchema.safeParse(PREFERENCES).success).toBe(true);
    expect(
      NotificationPreferencesSchema.safeParse({
        ...PREFERENCES,
        reminderTime: null,
        reminderDays: [],
      }).success,
    ).toBe(true);
  });

  it('reminderDays 는 0 ~ 6 이고 중복이 없다', () => {
    const at = (reminderDays: number[]) =>
      NotificationPreferencesSchema.safeParse({ ...PREFERENCES, reminderDays }).success;
    expect(at([0, 6])).toBe(true);
    expect(at([7])).toBe(false);
    expect(at([-1])).toBe(false);
    expect(at([1, 1])).toBe(false);
  });

  it('시각은 HH:mm 이다', () => {
    expect(
      NotificationPreferencesSchema.safeParse({ ...PREFERENCES, cardRefreshTime: '7:00' }).success,
    ).toBe(false);
  });

  it('marketing 동의 필드를 담지 않는다 (동의 원본은 consent_events — C-4)', () => {
    expect(Object.keys(NotificationPreferencesSchema.shape)).not.toContain('marketingOptIn');
  });

  it('부분 갱신은 최소 1개 필드가 필요하다', () => {
    expect(
      UpdateNotificationPreferencesRequestSchema.safeParse({ pushEnabled: false }).success,
    ).toBe(true);
    expect(UpdateNotificationPreferencesRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe('PushDevice (AC-4-18 · 19)', () => {
  it('PushPlatform 은 ios · android · web 3값이다 (AC-4-19)', () => {
    expect(PushPlatformSchema.options).toEqual(['ios', 'android', 'web']);
  });

  it('등록 요청은 platform + token 이다', () => {
    expect(
      RegisterPushDeviceRequestSchema.safeParse({ platform: 'web', token: 'opaque-token' }).success,
    ).toBe(true);
    expect(RegisterPushDeviceRequestSchema.safeParse({ platform: 'web', token: '' }).success).toBe(
      false,
    );
    expect(
      RegisterPushDeviceRequestSchema.safeParse({ platform: 'windows', token: 'x' }).success,
    ).toBe(false);
  });

  it('PushDevice 응답에 token 필드가 없다 — 섞여 와도 parse 가 버린다 (AC-4-18)', () => {
    expect(Object.keys(PushDeviceSchema.shape).sort()).toEqual(['id', 'lastSeenAt', 'platform']);

    const parsed = PushDeviceSchema.parse({
      id: DEVICE_ID,
      platform: 'web',
      lastSeenAt: '2026-10-14T09:00:00Z',
      token: 'should-not-survive',
      providerToken: 'should-not-survive',
    });
    expect(parsed).not.toHaveProperty('token');
    expect(parsed).not.toHaveProperty('providerToken');
  });
});
