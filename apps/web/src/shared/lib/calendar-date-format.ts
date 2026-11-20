/**
 * 달력 날짜(`YYYY-MM-DD`) **표기** — Stage 7 Spec §2.0 "날짜 포맷" (`S7-C`).
 *
 * contracts `CalendarDate` 는 서버가 **보호자 시간대**로 계산한 날짜다 (`N7-13`). 그래서 여기서는 기기 시간대·
 * 현재 시각을 읽지 않는다 — 문자열의 년·월·일을 그대로 영어 표기로 바꿀 뿐이다 (주 경계·주기 계산 0, Plan §5.1).
 * 요일은 그 날짜 자체의 속성이라 UTC 자정으로 고정해 구한다 (시간대와 무관하게 같은 답).
 *
 * | 입력 | 출력 |
 * |---|---|
 * | `2026-06-07` | `Jun 7` |
 * | `2026-05-04` ~ `2026-05-10` | `May 4 – 10` (같은 달) |
 * | `2026-04-27` ~ `2026-05-03` | `Apr 27 – May 3` (달 넘김) |
 * | `2025-12-29` ~ `2026-01-04` | `Dec 29 – Jan 4` (연 넘김 — 연도 미표시, Spec §2.0) |
 *
 * 범위 구분자 = 앞뒤 공백 + en dash(U+2013) — Figma `31:119` *"May 4 – 10"* · `110:847` *"Apr 13 – May 10"*.
 */

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const RANGE_SEPARATOR = ' – ';

interface CalendarParts {
  year: number;
  month: number;
  day: number;
}

function parts(date: string): CalendarParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (match === null) throw new RangeError('Expected a calendar date (YYYY-MM-DD).');
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function monthShort(month: number): string {
  const name = MONTHS_SHORT[month - 1];
  if (name === undefined) throw new RangeError('Month out of range.');
  return name;
}

/** `2026-06-07` → `Jun 7`. */
export function formatCalendarMonthDay(date: string): string {
  const { month, day } = parts(date);
  return `${monthShort(month)} ${String(day)}`;
}

/** 같은 달이면 뒤 월 생략 (`May 4 – 10`), 아니면 양쪽 월 표기 (`Apr 27 – May 3`). 연도는 쓰지 않는다. */
export function formatCalendarRange(start: string, end: string): string {
  const from = parts(start);
  const to = parts(end);
  const sameMonth = from.year === to.year && from.month === to.month;
  const tail = sameMonth ? String(to.day) : formatCalendarMonthDay(end);
  return `${formatCalendarMonthDay(start)}${RANGE_SEPARATOR}${tail}`;
}

/** 그 날짜의 요일 전체 이름 (`Monday`). */
export function formatCalendarWeekdayLong(date: string): string {
  const { year, month, day } = parts(date);
  const index = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const name = WEEKDAYS_LONG[index];
  if (name === undefined) throw new RangeError('Weekday out of range.');
  return name;
}

/** 요일 약어 3글자 (`Tue`) — Figma `163:2636` *"Tue · …"*. */
export function formatCalendarWeekdayShort(date: string): string {
  return formatCalendarWeekdayLong(date).slice(0, 3);
}

/** 요일 첫 글자 (`M`) — Figma `163:2570` 막대 요일 라벨. */
export function formatCalendarWeekdayInitial(date: string): string {
  return formatCalendarWeekdayLong(date).slice(0, 1);
}
