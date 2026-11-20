/**
 * `WeeklyReadingCard` — Stage 7 Spec §3.3 (Figma `163:2551` "This week's reading").
 *
 * ```
 * section (aria-labelledby = 제목)
 * └─ ReportGlassCard (Glass Rest — Spec §0.3 흡수표, `M7-1`)
 *    ├─ header   h2 제목 → 4 → 합계(Bold 26) → 4 → 보조 줄(caption-1 tertiary)
 *    └─ BarChart 7열 (packages/ui — 높이 비례 · ≥0.75×max 강조, `N7-29`)
 * ```
 *
 * Figma 에 있지만 **그리지 않는 것** (허용 차이 후보 — 등록은 사용자 승인 후, 최우선 규칙 6):
 * - `163:2558` *"+18% vs last week"* — `D7-2` ① (`AD7-1`)
 * - `163:2561` 접기 chevron 토글 — `N7-41` ⓐ (`D7-5` 명시 승인, AC-7-24 개정 · `AD7-12`). 버튼·`aria-expanded`·접기 동작 0.
 *
 * 표시 전용 — 문구·포맷된 값은 전부 prop (feature copy 모듈 → `features/progress-overview`).
 */
import { BarChart, Text, type BarChartBar } from '@haru/ui';
import { useId } from 'react';

import { ReportGlassCard } from '../report';

export interface WeeklyReadingCardProps {
  title: string;
  /** 포맷된 합계 (`1h 12m`). */
  total: string;
  /** 보조 줄 (`6 nights · avg 12 min` / `No storytimes yet this week.`) — 분모 0 (`D7-2` ②). */
  summary: string;
  bars: readonly BarChartBar[];
  /** 막대 목록의 접근성 이름. */
  barsLabel: string;
}

export function WeeklyReadingCard({
  title,
  total,
  summary,
  bars,
  barsLabel,
}: WeeklyReadingCardProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="haru-weekly-reading">
      <ReportGlassCard>
        <div className="haru-weekly-reading__header">
          <Text as="h2" id={titleId} variant="subheadline" weight="bold" tone="primary">
            {title}
          </Text>
          <p className="haru-weekly-reading__total">{total}</p>
          <Text as="p" variant="caption-1" tone="tertiary">
            {summary}
          </Text>
        </div>
        <BarChart bars={bars} summary={barsLabel} />
      </ReportGlassCard>
    </section>
  );
}
