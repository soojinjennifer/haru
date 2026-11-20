import { REPORT_CYCLE_DAYS } from './report-eligibility.js';

/**
 * 4주 리포트 **주기 번호** — Stage 7 Plan §7 C7-11 (`N7-14` → `D7-4`).
 *
 * 날짜 문자열(`YYYY-MM-DD`, 보호자 시간대 기준으로 서버가 이미 계산한 **달력 날짜**)만 다루는 순수 함수다.
 * 시각·시간대·`Date` 객체를 쓰지 않는다 — Mock 과 향후 Backend 가 **같은 산식**을 쓰게 하는 것이 목적이다.
 *
 * - 주기 1 = `firstCycleStart` 부터 `REPORT_CYCLE_DAYS`(28)일. 주기 k = 그 뒤로 28일씩 반복 (#17).
 * - 주기 시작일(`firstCycleStart`) = 첫 완료 세션의 날짜(모드 무관 — `N7-12`). 그 날짜를 정하는 일은 서버 몫이다.
 * - `cycle_in_progress` 판정 시점(`N7-14`): 주기 마지막 날(`periodEnd`) 자정이 지난 뒤에 평가한다.
 *   그 전에는 `isReportEligible` 결과가 `eligible` 이어도 응답 eligibility 는 `cycle_in_progress` 다.
 *
 * ⚠️ **화면은 이 함수를 호출하지 않는다** — 주기·진행률·"Next report on" 은 서버 값만 표시한다
 * (Plan §5.1 "Frontend 날짜 계산 0", `L-D2`).
 */

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * 그레고리력 날짜 → 1970-01-01 기준 일 번호 (proleptic Gregorian, H. Hinnant `days_from_civil`).
 * `Date` 를 쓰지 않으므로 실행 환경 시간대와 무관하다.
 */
function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const mp = (month + 9) % 12;
  const doy = Math.floor((153 * mp + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

function civilFromDays(days: number): { year: number; month: number; day: number } {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  return { year: yoe + era * 400 + (month <= 2 ? 1 : 0), month, day };
}

/** `YYYY-MM-DD` → 일 번호. 형식이 틀리거나 존재하지 않는 날짜(`2026-02-30`)면 `RangeError`. */
function toDayNumber(date: string): number {
  const match = ISO_DATE_PATTERN.exec(date);
  if (match === null) throw new RangeError('Expected a calendar date (YYYY-MM-DD).');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const days = daysFromCivil(year, month, day);
  const back = civilFromDays(days);
  if (back.year !== year || back.month !== month || back.day !== day) {
    throw new RangeError('Expected an existing calendar date.');
  }
  return days;
}

function fromDayNumber(days: number): string {
  const { year, month, day } = civilFromDays(days);
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** 달력 날짜에 `days` 일을 더한다 (음수 가능). 순수 문자열 산식 — 시간대 영향 없음. */
export function shiftCalendarDate(date: string, days: number): string {
  if (!Number.isInteger(days)) throw new RangeError('days must be an integer.');
  return fromDayNumber(toDayNumber(date) + days);
}

/** 두 달력 날짜 사이의 일 수 (`to − from`). */
export function calendarDaysBetween(from: string, to: string): number {
  return toDayNumber(to) - toDayNumber(from);
}

/**
 * `date` 가 속한 리포트 주기 번호 (1부터). `date` 가 첫 주기 시작 전이면 `RangeError`.
 *
 * 경계: 시작일 + 27일 = 주기 1 마지막 날, + 28일 = 주기 2 첫날.
 */
export function reportCycleIndex(firstCycleStart: string, date: string): number {
  const offset = calendarDaysBetween(firstCycleStart, date);
  if (offset < 0) throw new RangeError('date is before the first report cycle.');
  return Math.floor(offset / REPORT_CYCLE_DAYS) + 1;
}

/** 주기 `index`(1부터)의 시작·마지막 날짜. 마지막 날 = 시작 + 27일. */
export function reportCyclePeriod(
  firstCycleStart: string,
  index: number,
): { periodStart: string; periodEnd: string } {
  if (!Number.isInteger(index) || index < 1) {
    throw new RangeError('index must be a positive integer.');
  }
  const periodStart = shiftCalendarDate(firstCycleStart, (index - 1) * REPORT_CYCLE_DAYS);
  return { periodStart, periodEnd: shiftCalendarDate(periodStart, REPORT_CYCLE_DAYS - 1) };
}
