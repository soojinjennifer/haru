/**
 * BarChart 높이·강조 규칙 — Stage 7 Design Spec §3.4 · `N7-29` ⓐ (`D7-5`). **순수 함수**만 둔다.
 *
 * | 항목 | 규칙 |
 * |---|---|
 * | 기록 없음 | `null` · 0 이하 · 유한수가 아닌 값 → **스텁**(h4) · 비율 0 · 강조 아님 |
 * | 높이 비율 | `value / max(values)` — 최대값 막대 = 트랙 전체. 상한 클립 없음 (`M7-3`: Figma 는 선형 4.36 px/min + 상한 63.5 클립) |
 * | 강조 | `value ≥ emphasisRatio × max` (기본 **0.75** — 가값 `P-40`). Figma fixture `8·13·—·16·11·20·4` 에서 **16 · 20** 두 개 |
 *
 * `packages/ui` 는 값의 단위(분)·요일을 모른다. 숫자 배열만 받는다.
 */

/**
 * 강조 비율 기본값 — 주 최대값의 75% 이상.
 * provisional: P-40 (docs/design/stage-7-design-spec.md §5.3) — Figma fixture 재현용 추정 (디자이너 Q7-13).
 */
export const DEFAULT_EMPHASIS_RATIO = 0.75;

/** 막대 하나의 배치 결과. */
export interface BarLayout {
  /** `0..1` — 트랙 높이 대비 막대 높이. 기록 없음 = 0. */
  readonly ratio: number;
  /** 강조 막대 (teal 100% + 진한 값 라벨). */
  readonly emphasized: boolean;
  /** 기록 없음 — 스텁(h4)과 "—" 라벨로 그린다. */
  readonly empty: boolean;
}

function hasValue(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value > 0;
}

/** `emphasisRatio` 를 `0..1` 로 자른다. 유한수가 아니면 기본값. */
export function normalizeEmphasisRatio(ratio: number | undefined): number {
  if (ratio === undefined || !Number.isFinite(ratio)) return DEFAULT_EMPHASIS_RATIO;
  return Math.min(1, Math.max(0, ratio));
}

/** 값 배열 → 막대별 높이 비율 · 강조 · 빈 막대. 입력 순서를 유지한다. */
export function barChartLayout(
  values: readonly (number | null)[],
  emphasisRatio: number = DEFAULT_EMPHASIS_RATIO,
): readonly BarLayout[] {
  const present = values.filter(hasValue);
  const max = present.length === 0 ? 0 : Math.max(...present);
  const threshold = normalizeEmphasisRatio(emphasisRatio) * max;

  return values.map((value) => {
    if (!hasValue(value) || max <= 0) return { ratio: 0, emphasized: false, empty: true };
    return { ratio: value / max, emphasized: value >= threshold, empty: false };
  });
}
