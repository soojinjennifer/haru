/**
 * 주간 응답 → 표시 값 — Stage 7 Spec §3.3 · §3.4 · §3.5 · §2.8 (`S7-C`).
 *
 * 순수 함수(단위 테스트 대상). **포맷만** 한다 — 집계·비교·보간 0 (Plan §5.1). 문구는 `copy.ts`.
 *
 * Spec §3.4 는 `days → bars` 매핑을 `entities/weekly-progress` 에 두었으나, 매핑이 SR 문장·요일 이름 등 **문구**를 만들기
 * 때문에 문구를 소유한 feature 로 옮겼다 (copy 는 feature copy 모듈 — 지시 · `rules/frontend.md` §8). 엔티티 카드는
 * 포맷된 값만 받는다 — H7-3.
 */
import {
  shiftCalendarDate,
  WEEK_DAY_COUNT,
  type GrowthTheme,
  type WeeklyProgress,
} from '@haru/contracts';
import type { BarChartBar } from '@haru/ui';

import { CAPABILITY_AXIS_ORDER } from '../../../entities/child-profile';
import { formatMinutes, type GrowthThemeRow } from '../../../entities/weekly-progress';
import { capabilityCopy } from '../../../shared/copy/capability-copy';
import {
  formatCalendarRange,
  formatCalendarWeekdayInitial,
  formatCalendarWeekdayLong,
  formatCalendarWeekdayShort,
} from '../../../shared/lib/calendar-date-format';
import { progressOverviewCopy as copy } from '../copy';

/** 보조 줄 — `6 nights · avg 12 min` (`D7-2` ② 분모 0) · 0 이면 *No storytimes yet this week.* (Spec §2.8). */
export function readingSummaryLine(summary: WeeklyProgress['readingSummary']): string {
  if (summary.nightsWithSession === 0) return copy.reading.none;
  const average =
    summary.averageSessionMinutes === null
      ? ''
      : copy.reading.average(summary.averageSessionMinutes);
  return `${copy.reading.nights(summary.nightsWithSession)}${average}`;
}

/** `days`(월→일) → `BarChart` 막대. `null` · 0 = "기록 없음" 스텁 + 값 라벨 `—` (Figma `163:2579`). */
export function weeklyBars(days: WeeklyProgress['days']): BarChartBar[] {
  return days.map((day) => {
    const weekday = formatCalendarWeekdayLong(day.date);
    const recorded = day.minutes !== null && day.minutes > 0;
    return {
      id: day.date,
      label: formatCalendarWeekdayInitial(day.date),
      srLabel:
        recorded && day.minutes !== null
          ? copy.reading.barMinutes(weekday, day.minutes)
          : copy.reading.barNone(weekday),
      value: day.minutes,
      valueLabel:
        recorded && day.minutes !== null ? formatMinutes(day.minutes) : copy.reading.noValue,
    };
  });
}

/** Growth themes 4행 — 배치 순서 = Q6 (`CAPABILITY_AXIS_ORDER`, Spec §3.5). 응답 순서와 무관 (배치 규칙, 데이터 가공 아님). */
export function growthThemeRows(themes: readonly GrowthTheme[]): GrowthThemeRow[] {
  return CAPABILITY_AXIS_ORDER.flatMap((capability) => {
    const theme = themes.find((item) => item.capability === capability);
    return theme === undefined
      ? []
      : [
          {
            capability,
            label: capabilityCopy[capability],
            stageLabel: copy.growth.stage[theme.stage],
            level: theme.level,
          },
        ];
  });
}

/** Moment 출처 — `Tue · The Most Magnificent Thing, p.14`. */
export function momentSource(moment: NonNullable<WeeklyProgress['momentOfWeek']>): string {
  return copy.moment.source(
    formatCalendarWeekdayShort(moment.sessionDate),
    moment.bookTitle,
    moment.pageRef,
  );
}

/**
 * 주 시작일 → 범위 라벨 (`May 4 – 10`). 시트 옵션은 서버가 **시작일만** 준다(`availableWeeks`) — 끝 날짜는 계약상
 * 주 길이(`WEEK_DAY_COUNT` 7, 월~일)로 정해진다. contracts 의 달력 문자열 함수 `shiftCalendarDate` 로 구한다(기기 시간대 0) —
 * 주 **경계** 계산이 아니라 표기다 (H7-3).
 */
export function weekRangeLabel(weekStart: string): string {
  return formatCalendarRange(weekStart, shiftCalendarDate(weekStart, WEEK_DAY_COUNT - 1));
}
