import { z } from 'zod';

import { TimeOfDaySchema } from '../common/time-of-day.js';

/**
 * 알림 설정 — `GET/PUT /v1/notification-preferences` (PRD FR-08 · §7.8).
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 3 (구현 Stage = 4, 이월 `QA-3-001`),
 * `stage-3-plan.md` §7.1, `docs/DATA_MODEL.md` §7 `notification_preferences`.
 *
 * `marketing_opt_in` 은 담지 않는다 — 동의의 원본은 `consent_events` 이며 알림 설정에서
 * 동의를 바꾸지 않는다 (C-4).
 */

/** 요일 — 0(일) … 6(토). */
export const WeekdaySchema = z.int().min(0).max(6);

export const NotificationPreferencesSchema = z.object({
  /** Activity Card 갱신 시각 (기본 07:00 — 서버 기본값). */
  cardRefreshTime: TimeOfDaySchema,
  reminderDays: z
    .array(WeekdaySchema)
    .max(7)
    .refine((days) => new Set(days).size === days.length, {
      message: 'reminderDays must be unique.',
    }),
  reminderTime: TimeOfDaySchema.nullable(),
  pushEnabled: z.boolean(),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

/** 부분 갱신. 최소 1개 필드가 있어야 한다. */
export const UpdateNotificationPreferencesRequestSchema =
  NotificationPreferencesSchema.partial().refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    { message: 'at least one field is required.' },
  );

export type UpdateNotificationPreferencesRequest = z.infer<
  typeof UpdateNotificationPreferencesRequestSchema
>;
