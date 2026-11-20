/**
 * `/__dev/ui/components` — Stage 7 `S7-B` Shared UI (Stage 7 Design Spec §3.1 · §3.4 · §3.7 · §3.9, `D7-5`).
 *
 * dev 전용이다. 시각 비교 블록 id 는 `s7-*` (영역 클립 baseline — `D-12`).
 *  - `s7-stat-tile`        — StatTile 2열 행 (`163:2544` — 5 sessions · 62m together, 행 h84 · gap 10).
 *  - `s7-bar-chart`        — BarChart, Figma `163:2564` 수치(8·13·—·16·11·20·4) — 강조 16·20 · 스텁 수요일.
 *                            `163:2551` 과 같은 `Surface fill="card" material="rest"` 셸(pad 16) 안에 둔다.
 *  - `s7-diamond-previous` — DiamondChart `previous` 오버레이 + 범례 (가값 `P-38`, Figma 없음).
 *  - `s7-surface-card`     — `Surface fill="card"` (`T7-3`).
 *  - `s7-progress-fill`    — ProgressBar `--progress-fill-color` override 4색 + 장식 모드 (`T7-2` · `M7-11`).
 *  - `s7-icons`            — Icon registry 추가 6종.
 *
 * 기존 블록(`v2-surface` · `v7-progress` · `v9-icon`)은 **건드리지 않는다** — Stage 6 baseline 불변(AC-7-81).
 * 값은 gallery 시연용 상수다 (Mock fixture 아님 — Figma `31:102` 과 같은 수치로 Visual Gap 대조).
 */
import {
  BarChart,
  DiamondChart,
  Icon,
  ProgressBar,
  StatTile,
  Surface,
  Text,
  type BarChartBar,
  type DiamondAxis,
  type IconName,
} from '@haru/ui';

import { galleryCopy } from './gallery-copy';
import { Row, Section, Stack, Stage, SubHead } from './primitives';

const copy = galleryCopy.stage7;

/** Figma `163:2564` 막대 수치 (월 → 일). */
const FIGMA_WEEK_MINUTES = [8, 13, null, 16, 11, 20, 4] as const;

const BARS: readonly BarChartBar[] = FIGMA_WEEK_MINUTES.map((minutes, index) => {
  const day = copy.barDays[index] ?? '';
  return {
    id: day,
    label: day.charAt(0),
    srLabel: minutes === null ? copy.barNoStorytime(day) : copy.barMinutes(day, minutes),
    value: minutes,
    valueLabel: minutes === null ? copy.barNoValue : copy.barValue(minutes),
  };
});

const DIAMOND_AXES: readonly [DiamondAxis, DiamondAxis, DiamondAxis, DiamondAxis] = [
  { id: 'agency', label: copy.axisAgency, value: 4.3, tone: 'agency' },
  { id: 'emotion', label: copy.axisEmotion, value: 3.5, tone: 'emotion' },
  { id: 'flexibility', label: copy.axisFlexibility, value: 2.5, tone: 'flexibility' },
  { id: 'motivation', label: copy.axisMotivation, value: 3.7, tone: 'motivation' },
];

const DIAMOND_PREVIOUS = [3.6, 3.0, 2.2, 3.1] as const;

const GROWTH_ROWS = [
  { tone: 'agency', level: 0.85 },
  { tone: 'emotion', level: 0.6 },
  { tone: 'flexibility', level: 0.55 },
  { tone: 'motivation', level: 0.35 },
] as const;

const STAGE7_ICONS: readonly IconName[] = [
  'file-down',
  'arrow-down-to-line',
  'share',
  'play',
  'pause',
  'clock',
];

export function Stage7ProgressSection() {
  return (
    <>
      <Section
        id="s7-stat-tile"
        title="S7-1. StatTile"
        note="163:2544 — 2열 flex-1 · gap 10 · 행 h84 · 타일 pad 13/8 · gap 5 · radius 20→22 · Heavy 24 / Medium 11 · --shadow-bubble · overflow 0 (M7-9)"
      >
        <Stage>
          <div className="haru-dev-s7-stat-row">
            <StatTile value={copy.statSessionsValue} label={copy.statSessionsLabel} />
            <StatTile value={copy.statMinutesValue} label={copy.statMinutesLabel} />
          </div>
        </Stage>
      </Section>

      <Section
        id="s7-bar-chart"
        title="S7-2. BarChart"
        note="163:2564 — h110 · pt14 · 열 gap 10 · 막대 16/radius 8 · 높이 = value/max (N7-29) · 강조 ≥ 0.75×max (P-40) → 16·20 · 스텁 h4 · 라벨 caption-2 11 (N7-31)"
      >
        <Stage>
          <Surface fill="card" material="rest" radius="surface" padding="4">
            <BarChart bars={BARS} summary={copy.barSummary} />
          </Surface>
        </Stage>
      </Section>

      <Section
        id="s7-diamond-previous"
        title="S7-3. DiamondChart previous"
        note="Spec §3.7 — previous = ink-400 1.5px dash 4 3 · 외곽선만 · 즉시 표시 (P-38) · 범례 Earlier / This report"
      >
        <Stage>
          <Surface fill="strong" material="bubble" radius="surface" padding="4">
            <DiamondChart
              axes={DIAMOND_AXES}
              previous={DIAMOND_PREVIOUS}
              legend={{ previous: copy.legendPrevious, current: copy.legendCurrent }}
              summary={copy.diamondSummary}
              missingLabel={copy.diamondMissing}
            />
          </Surface>
        </Stage>
      </Section>

      <Section
        id="s7-surface-card"
        title="S7-4. Surface fill=card"
        note="T7-3 — 163:2551 · 110:835"
      >
        <Stage>
          <Surface fill="card" material="rest" radius="surface" padding="4">
            <Text variant="footnote">{copy.surfaceCard}</Text>
          </Surface>
        </Stage>
      </Section>

      <Section
        id="s7-progress-fill"
        title="S7-5. ProgressBar --progress-fill-color · decorative"
        note="163:2607 — md 8 · track ink 12% · fill teal · pink · blue · violet/67 (T7-1 · T7-2, P-36) · aria-hidden (M7-11)"
      >
        <Stage>
          <Surface fill="strong" material="bubble" radius="surface" padding="4">
            <Stack>
              {/* 행 텍스트(라벨 ↔ 단계)는 Domain `GrowthThemesCard`(S7-C) 몫 — 여기서는 막대 색만 본다. */}
              {GROWTH_ROWS.map((row) => (
                <div key={row.tone} className={`haru-dev-s7-growth--${row.tone}`}>
                  <ProgressBar value={row.level} max={1} size="md" decorative />
                </div>
              ))}
              <Text variant="caption-1" tone="secondary">
                {copy.decorativeNote}
              </Text>
            </Stack>
          </Surface>
        </Stage>
      </Section>

      <Section id="s7-icons" title="S7-6. Icon registry" note="Stage 7 Spec §3.9 — Lucide 6종">
        <Stage plain>
          <Row>
            <SubHead>md</SubHead>
            {STAGE7_ICONS.map((name) => (
              <Icon key={name} name={name} size="md" decorative />
            ))}
          </Row>
        </Stage>
      </Section>
    </>
  );
}
