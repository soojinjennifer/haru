/**
 * `formatMonthDay` — 7일 보관 배너의 삭제 예정일 (4b Spec §18.4, `D4-120` Q12): 절대 날짜 · 영어 · 기기 시간대 ·
 * 해가 다르면 연도. 기준 시각은 주입한다 (시계를 읽지 않는다).
 */
import { describe, expect, it } from 'vitest';

import { formatMonthDay } from '../date-format';

const at = (iso: string) => Date.parse(iso);

describe('formatMonthDay', () => {
  it('같은 해 → `Nov 17` (연도·시각 없음)', () => {
    expect(formatMonthDay(at('2026-11-17T15:00:00Z'), at('2026-11-10T09:00:00Z'), 'UTC')).toBe(
      'Nov 17',
    );
  });

  it('해가 다르면 연도를 붙인다 → `Jan 3, 2027`', () => {
    expect(formatMonthDay(at('2027-01-03T12:00:00Z'), at('2026-12-27T12:00:00Z'), 'UTC')).toBe(
      'Jan 3, 2027',
    );
  });

  it('연도 판정은 기준 시각도 같은 시간대로 본다 — UTC 새해 직후가 LA 에서는 아직 작년', () => {
    const deleteAt = at('2027-01-01T03:00:00Z'); // LA = 2026-12-31 19:00
    const now = at('2026-12-25T12:00:00Z');
    expect(formatMonthDay(deleteAt, now, 'America/Los_Angeles')).toBe('Dec 31');
    expect(formatMonthDay(deleteAt, now, 'UTC')).toBe('Jan 1, 2027');
  });

  it('시간대가 날짜를 바꾼다 (기기 시간대 기준)', () => {
    const deleteAt = at('2026-11-17T02:00:00Z');
    const now = at('2026-11-10T00:00:00Z');
    expect(formatMonthDay(deleteAt, now, 'America/New_York')).toBe('Nov 16');
    expect(formatMonthDay(deleteAt, now, 'Asia/Seoul')).toBe('Nov 17');
  });

  it('상대 표기를 쓰지 않는다', () => {
    const text = formatMonthDay(at('2026-11-17T00:00:00Z'), at('2026-11-10T00:00:00Z'), 'UTC');
    expect(text).not.toMatch(/day|week|tomorrow|today|in /i);
  });
});
