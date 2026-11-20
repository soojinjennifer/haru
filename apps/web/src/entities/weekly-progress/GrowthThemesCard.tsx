/**
 * `GrowthThemesCard` — Stage 7 Spec §3.5 (Figma `163:2607` "Growth themes").
 *
 * 셸 = Stage 6 `ProfileCard` recipe 그대로 (이 노드에서 만든 recipe — `Surface strong / bubble / surface / 4`).
 *
 * - 행 순서는 호출부가 Q6 순서(Self-Direction → Emotion Regulation → Cognitive Flexibility → Intrinsic Motivation)로 준다.
 * - 단계 라벨 = `strong` / `growing` / `emerging` (`D7-2` ③ — Figma 소문자 그대로).
 * - 막대 = `ProgressBar md` **장식 모드** (`aria-hidden` — `M7-11` · AC-7-31): `level` 을 SR 이 숫자로 읽지 않는다.
 *   정보는 행 텍스트(*"Self-Direction, strong"*)가 전달한다 (Spec §9.1).
 * - 막대 색 = 역량별 `--color-growth-theme-*` (`N7-10` · `T7-1`) — `weekly-progress.css` 가 `--progress-fill-color` 로 준다.
 * - Figma `163:2629`(4행 라벨)만 Medium 13 → 다른 3행과 같은 Semibold 12 로 통일 (`N7-31` ⓐ · `AD7-7`).
 */
import { ProgressBar, Text } from '@haru/ui';
import type { Capability } from '@haru/contracts';
import { useId } from 'react';

import { ProfileCard } from '../child-profile';

export interface GrowthThemeRow {
  capability: Capability;
  /** 화면 표시 라벨 (#14). */
  label: string;
  /** 단계 라벨 (`strong` …). */
  stageLabel: string;
  /** 막대 길이 0..1 (서버 값 — 숫자로 표시하지 않는다). */
  level: number;
}

export interface GrowthThemesCardProps {
  title: string;
  rows: readonly GrowthThemeRow[];
}

export function GrowthThemesCard({ title, rows }: GrowthThemesCardProps) {
  const titleId = useId();
  return (
    <ProfileCard>
      <Text as="h2" id={titleId} variant="subheadline" weight="bold" tone="primary">
        {title}
      </Text>
      <ul className="haru-growth-themes" aria-labelledby={titleId}>
        {rows.map((row) => (
          <li
            key={row.capability}
            className={`haru-growth-theme haru-growth-theme--${row.capability}`}
          >
            <p className="haru-growth-theme__text">
              <Text as="span" variant="caption-1" weight="semibold" tone="inherit">
                <span className="haru-growth-theme__label">{row.label}</span>
                <span className="haru-visually-hidden">, </span>
              </Text>
              <Text as="span" variant="caption-1" weight="medium" tone="tertiary">
                {row.stageLabel}
              </Text>
            </p>
            <ProgressBar decorative value={row.level} max={1} size="md" />
          </li>
        ))}
      </ul>
    </ProfileCard>
  );
}
