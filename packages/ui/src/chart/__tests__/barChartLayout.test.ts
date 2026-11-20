/**
 * BarChart 높이·강조 규칙 — Stage 7 Spec §3.4 · `N7-29` ⓐ (AC-7-22 계산 단위, 가값 `P-40`).
 */
import { describe, expect, it } from 'vitest';

import { barChartLayout, DEFAULT_EMPHASIS_RATIO, normalizeEmphasisRatio } from '../barChartLayout';

/** Figma `163:2564` 의 주간 값 (M T W T F S S) — Spec §3.4 · AC-7-22. */
const FIGMA_WEEK = [8, 13, null, 16, 11, 20, 4] as const;

describe('barChartLayout — N7-29 ⓐ', () => {
  it('기본 강조 비율은 0.75 다 (가값 P-40)', () => {
    expect(DEFAULT_EMPHASIS_RATIO).toBe(0.75);
  });

  it('Figma fixture 에서 16 · 20 **두 개**가 강조된다', () => {
    const layout = barChartLayout(FIGMA_WEEK);
    expect(layout.map((bar) => bar.emphasized)).toStrictEqual([
      false,
      false,
      false,
      true,
      false,
      true,
      false,
    ]);
  });

  it('높이 = value / max — 최대값 막대가 트랙 전체(1)이고 상한 클립이 없다 (M7-3)', () => {
    const layout = barChartLayout(FIGMA_WEEK);
    expect(layout.map((bar) => bar.ratio)).toStrictEqual([0.4, 0.65, 0, 0.8, 0.55, 1, 0.2]);
    // Figma 는 16m 과 20m 이 같은 높이(63)로 잘렸다 — 여기서는 서로 다르다.
    expect(layout[3]?.ratio).not.toBe(layout[5]?.ratio);
  });

  it('null · 0 · 음수 · NaN · Infinity 는 기록 없음(스텁)이고 강조되지 않는다', () => {
    const layout = barChartLayout([null, 0, -3, Number.NaN, Number.POSITIVE_INFINITY, 10]);
    expect(layout.slice(0, 5).every((bar) => bar.empty && !bar.emphasized && bar.ratio === 0)).toBe(
      true,
    );
    expect(layout[5]).toStrictEqual({ ratio: 1, emphasized: true, empty: false });
  });

  it('전부 기록 없음이면 전부 스텁 · 강조 0', () => {
    const layout = barChartLayout([null, null, 0]);
    expect(layout.every((bar) => bar.empty && !bar.emphasized)).toBe(true);
  });

  it('값이 하나뿐이면 그 막대가 트랙 전체 + 강조', () => {
    expect(barChartLayout([null, 5, null])[1]).toStrictEqual({
      ratio: 1,
      emphasized: true,
      empty: false,
    });
  });

  it('경계: 정확히 0.75 × max 는 강조, 그 아래는 강조 아님', () => {
    const layout = barChartLayout([15, 14.99, 20]);
    expect(layout.map((bar) => bar.emphasized)).toStrictEqual([true, false, true]);
  });

  it('emphasisRatio 를 바꿀 수 있다 — 1 이면 최대값만 강조', () => {
    expect(barChartLayout(FIGMA_WEEK, 1).filter((bar) => bar.emphasized)).toHaveLength(1);
    expect(barChartLayout(FIGMA_WEEK, 0).filter((bar) => bar.emphasized)).toHaveLength(6);
  });

  it('emphasisRatio 는 0..1 로 잘리고 유한수가 아니면 기본값', () => {
    expect(normalizeEmphasisRatio(1.5)).toBe(1);
    expect(normalizeEmphasisRatio(-1)).toBe(0);
    expect(normalizeEmphasisRatio(Number.NaN)).toBe(DEFAULT_EMPHASIS_RATIO);
    expect(normalizeEmphasisRatio(undefined)).toBe(DEFAULT_EMPHASIS_RATIO);
  });

  it('입력 순서와 개수를 유지한다', () => {
    expect(barChartLayout([])).toStrictEqual([]);
    expect(barChartLayout(FIGMA_WEEK)).toHaveLength(7);
  });
});
