/** 주간 응답 → 표시 값 (`S7-C`) — Spec §3.3 · §3.4 · §3.5 · §2.8 · `D7-2`. Figma `31:102` 수치 fixture 로 검증. */
import { describe, expect, it } from 'vitest';

import { createWeeklyProgressFixture } from '../../../mocks/fixtures/weekly-progress';
import {
  growthThemeRows,
  momentSource,
  readingSummaryLine,
  weekRangeLabel,
  weeklyBars,
} from '../model/weeklyView';

function figmaWeek() {
  const weekly = createWeeklyProgressFixture('standard');
  if (weekly === undefined) throw new Error('fixture');
  return weekly;
}

describe('weeklyView', () => {
  it('보조 줄 = `6 nights · avg 12 min` — 분모 0 (D7-2 ②, AD7-2)', () => {
    expect(readingSummaryLine(figmaWeek().readingSummary)).toBe('6 nights · avg 12 min');
    expect(
      readingSummaryLine({ totalMinutes: 9, nightsWithSession: 1, averageSessionMinutes: null }),
    ).toBe('1 night');
    expect(
      readingSummaryLine({ totalMinutes: 0, nightsWithSession: 0, averageSessionMinutes: null }),
    ).toBe('No storytimes yet this week.');
  });

  it('막대 7개 = days 그대로 · null 은 `—` + SR *no storytime* · 요일 M→S (AC-7-22)', () => {
    const bars = weeklyBars(figmaWeek().days);
    expect(bars.map((bar) => bar.value)).toStrictEqual([8, 13, null, 16, 11, 20, 4]);
    expect(bars.map((bar) => bar.valueLabel)).toStrictEqual([
      '8m',
      '13m',
      '—',
      '16m',
      '11m',
      '20m',
      '4m',
    ]);
    expect(bars.map((bar) => bar.label).join('')).toBe('MTWTFSS');
    expect(bars[0]?.srLabel).toBe('Monday, 8 minutes');
    expect(bars[2]?.srLabel).toBe('Wednesday, no storytime');
  });

  it('0 분도 "기록 없음" 표기 (null 과 같다 — contracts 주석)', () => {
    const [bar] = weeklyBars([{ date: '2026-05-04', minutes: 0 }]);
    expect(bar?.valueLabel).toBe('—');
    expect(bar?.srLabel).toBe('Monday, no storytime');
  });

  it('Growth 4행 = Q6 순서 · #14 라벨 · 단계 라벨 · 응답 순서 무관 (AC-7-25)', () => {
    const rows = growthThemeRows([...figmaWeek().growthThemes].reverse());
    expect(rows.map((row) => [row.label, row.stageLabel])).toStrictEqual([
      ['Self-Direction', 'strong'],
      ['Emotion Regulation', 'growing'],
      ['Cognitive Flexibility', 'emerging'],
      ['Intrinsic Motivation', 'emerging'],
    ]);
    // VG7-A-04 — IM = Figma 0.32 (CF 와 같은 폭)
    expect(rows.map((row) => row.level)).toStrictEqual([0.78, 0.54, 0.32, 0.32]);
  });

  it('Moment 출처 = `Tue · The Most Magnificent Thing, p.14` (Figma `163:2636`) · 쪽 없으면 생략', () => {
    const moment = figmaWeek().momentOfWeek;
    if (moment === null) throw new Error('fixture');
    expect(momentSource(moment)).toBe('Tue · The Most Magnificent Thing, p.14');
    expect(momentSource({ ...moment, pageRef: null })).toBe('Tue · The Most Magnificent Thing');
  });

  it('주 범위 라벨 (시트 옵션) — 같은 달 · 달 넘김 · 연 넘김', () => {
    expect(weekRangeLabel('2026-05-04')).toBe('May 4 – 10');
    expect(weekRangeLabel('2026-04-27')).toBe('Apr 27 – May 3');
    expect(weekRangeLabel('2025-12-29')).toBe('Dec 29 – Jan 4');
  });
});
