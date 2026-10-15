/**
 * 알림 설정 · 푸시 기기 fixture — `docs/API_CONTRACTS.md` §4 Stage 3 표 (구현 Stage 4).
 *
 * 기본값은 서버 기본값을 흉내낸다: 카드 갱신 07:00, 알림 요일·시각 없음, push 꺼짐.
 */
import { NotificationPreferencesSchema, type NotificationPreferences } from '@haru/contracts';

export function createNotificationPreferencesFixture(): NotificationPreferences {
  return NotificationPreferencesSchema.parse({
    cardRefreshTime: '07:00',
    reminderDays: [],
    reminderTime: null,
    pushEnabled: false,
  });
}
