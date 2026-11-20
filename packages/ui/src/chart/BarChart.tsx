import type { CSSProperties } from 'react';

import { cx } from '../lib/cx';

import { barChartLayout, DEFAULT_EMPHASIS_RATIO } from './barChartLayout';

export interface BarChartBar {
  /** 막대 식별자 (React key). */
  id: string;
  /** 막대 아래 짧은 라벨 (예: 요일 1글자 `"M"`). 시각 전용 — SR 에는 `srLabel` 이 읽힌다. */
  label: string;
  /**
   * 막대 하나의 **접근성 이름 전체** (예: *"Monday, 8 minutes"* / *"Wednesday, no storytime"*).
   * 문장은 호출 측(도메인)이 만든다 — `packages/ui` 는 단위·요일을 모른다 (Spec §3.4 · AC-7-22).
   */
  srLabel: string;
  /** 높이 계산용 값. `null` · 0 = 기록 없음 (스텁 h4). */
  value: number | null;
  /** 막대 위 값 라벨 — 포맷된 문자열 (예: `"8m"` · `"—"`). 시각 전용. */
  valueLabel: string;
}

export interface BarChartProps {
  bars: readonly BarChartBar[];
  /** 강조 기준 — `value ≥ emphasisRatio × max` (기본 0.75, 가값 `P-40`). */
  emphasisRatio?: number;
  /** 목록 전체의 접근성 이름 (예: *"Minutes read each day this week"*). */
  summary?: string;
}

/**
 * BarChart — Stage 7 Design Spec §3.4 (Figma `163:2564`, `N7-21` · `N7-29`, `D7-5`).
 *
 * div 막대 차트. 도메인 비의존이다 — `entities/weekly-progress` 가 `days` → `bars` 매핑(요일 라벨 · 분 포맷 ·
 * SR 문장)을 한다.
 *
 * 구조
 * ```
 * div.haru-bar-chart role="list" aria-label={summary}      (block 110 · pt 14 · 열 gap 10)
 * └─ div.haru-bar-chart__column role="listitem" ×N          (flex 1 · col · gap 6)
 *    ├─ span.haru-visually-hidden  {srLabel}                (항목 이름)
 *    ├─ span.haru-bar-chart__plot  aria-hidden               (flex 1 · 아래 정렬)
 *    │   ├─ span 값 라벨  caption-2 bold
 *    │   └─ span 막대     w16 · radius 8 · 높이 = ratio × 트랙
 *    └─ span 요일 라벨 aria-hidden  caption-2 semibold tertiary
 * ```
 *
 * - **트랙 높이는 CSS 가 정한다** — 열 높이에서 값 라벨 줄 · gap 을 뺀 나머지 (`BarChart.css`). JS 측정 없음.
 * - 높이 비율 · 강조는 `barChartLayout` (순수 함수, 단위 테스트 대상).
 * - 첫 표시 모션(막대 grow)은 `prefers-reduced-motion: reduce` 에서 즉시 최종 상태다.
 * - `overflow` 없음 · 그림자 없음 (`R-SHADOW-1` 대상 아님).
 */
export function BarChart({ bars, emphasisRatio = DEFAULT_EMPHASIS_RATIO, summary }: BarChartProps) {
  const layout = barChartLayout(
    bars.map((bar) => bar.value),
    emphasisRatio,
  );

  return (
    <div className="haru-bar-chart" role="list" aria-label={summary}>
      {bars.map((bar, index) => {
        const item = layout[index] ?? { ratio: 0, emphasized: false, empty: true };
        return (
          <div
            key={bar.id}
            role="listitem"
            className={cx(
              'haru-bar-chart__column',
              item.emphasized && 'haru-bar-chart__column--emphasized',
              item.empty && 'haru-bar-chart__column--empty',
            )}
            data-bar={bar.id}
          >
            <span className="haru-visually-hidden">{bar.srLabel}</span>
            <span className="haru-bar-chart__plot" aria-hidden="true">
              <span className="haru-bar-chart__value">{bar.valueLabel}</span>
              <span
                className="haru-bar-chart__bar"
                style={{ '--bar-chart-ratio': String(item.ratio) } as CSSProperties}
              />
            </span>
            <span className="haru-bar-chart__label" aria-hidden="true">
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
