/** `calendar-date-format` — Stage 7 Spec §2.0 날짜 포맷 (`S7-C`). 기기 시간대와 무관하다. */
import { describe, expect, it } from 'vitest';

import {
  formatCalendarMonthDay,
  formatCalendarRange,
  formatCalendarWeekdayInitial,
  formatCalendarWeekdayLong,
  formatCalendarWeekdayShort,
} from '../calendar-date-format';

describe('calendar-date-format', () => {
  it('월 · 일 — Figma `110:861` *Jun 7*', () => {
    expect(formatCalendarMonthDay('2026-06-07')).toBe('Jun 7');
    expect(formatCalendarMonthDay('2026-12-31')).toBe('Dec 31');
  });

  it.each([
    ['2026-05-04', '2026-05-10', 'May 4 – 10'],
    ['2026-04-27', '2026-05-03', 'Apr 27 – May 3'],
    ['2025-12-29', '2026-01-04', 'Dec 29 – Jan 4'],
    ['2026-04-13', '2026-05-10', 'Apr 13 – May 10'],
  ])('범위 %s ~ %s → %s (같은 달 · 달 넘김 · 연 넘김 — 연도 미표시)', (start, end, expected) => {
    expect(formatCalendarRange(start, end)).toBe(expected);
  });

  it('요일 — 2026-05-04 = 월요일 (Figma 막대 M→S) · 2026-05-05 = Tue', () => {
    expect(formatCalendarWeekdayLong('2026-05-04')).toBe('Monday');
    expect(formatCalendarWeekdayShort('2026-05-05')).toBe('Tue');
    expect(
      ['04', '05', '06', '07', '08', '09', '10'].map((day) =>
        formatCalendarWeekdayInitial(`2026-05-${day}`),
      ),
    ).toStrictEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  });

  it('달력 날짜가 아니면 RangeError (조용히 틀린 날짜를 그리지 않는다)', () => {
    expect(() => formatCalendarMonthDay('2026-5-4')).toThrow(RangeError);
    expect(() => formatCalendarMonthDay('2026-13-01')).toThrow(RangeError);
  });
});
