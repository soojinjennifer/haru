import { cx } from '../lib/cx';
import { Text } from '../text/Text';

import {
  diamondAreaPolygons,
  diamondOutlines,
  diamondPathData,
  diamondPercent,
  diamondPointOnAxis,
  diamondRadiusFraction,
  diamondVertices,
  type DiamondValues,
} from './diamondGeometry';

/**
 * 축 색 tone — `TagTone` 에서 `neutral` 을 뺀 것. 색은 `--color-capability-{tone}-chart`(#19) 다.
 * `packages/ui` 는 역량 enum 을 모르므로 capability 키가 아니라 tone 이름을 받는다 (AC-1-25).
 */
export type DiamondTone = 'agency' | 'emotion' | 'flexibility' | 'motivation';

export interface DiamondAxis {
  /** 축 식별자 — 도메인 레이어가 넣는다 (예: capability 키). `onSelect` 로 돌려준다. */
  id: string;
  /** 표시 라벨. */
  label: string;
  /** `1..max`. `null` = 미관찰 — 0 · 1.0 · 3.0 으로 대체하지 않는다. */
  value: number | null;
  tone: DiamondTone;
}

export type DiamondChartMode = 'display' | 'selectable';

export interface DiamondChartProps {
  /** 순서 = **위 → 오른쪽 → 아래 → 왼쪽** (시계 방향). 순서는 호출자가 정한다. */
  axes: readonly [DiamondAxis, DiamondAxis, DiamondAxis, DiamondAxis];
  /** 값 상한 (기본 5). */
  max?: number;
  /** 차트 대체 텍스트 (필수) — 차트 SVG 의 접근성 이름이다 (Spec §9.2). */
  summary: string;
  /** 미관찰 축 라벨 아래 캡션 (예: "Not seen yet"). */
  missingLabel: string;
  mode?: DiamondChartMode;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** 저장 중처럼 잠깐 선택을 막는다 — 시각 변화 없음 (Spec §3.1). */
  disabled?: boolean;
}

const POSITIONS = ['top', 'right', 'bottom', 'left'] as const;

/**
 * DiamondChart — Stage 6 Design Spec §3.1 (Figma 없음 → design-agent 명세, `D6-1` · `D6-8`).
 *
 * 4축 다이아몬드 차트. **숫자를 그리지 않는다** — 눈금 링·값 라벨이 없다 (`N6-29`).
 *
 * 구조
 * ```
 * div.haru-diamond (grid 3×3 — 가운데 칸이 정사각 플롯, 네 변에 축 라벨)
 * ├─ svg.haru-diamond__plot  role="img" aria-label={summary}
 * │   ├─ g 격자     — 외곽 다이아몬드(v = max) + 중심→꼭짓점 축선 4개. null 축 축선은 점선
 * │   ├─ g 데이터   — 면(단위 좌표 viewBox 의 내부 svg) + 꼭짓점 원(px 반지름)
 * │   └─ 선택 링    — selectable 에서 선택 축의 꼭짓점(null 축이면 외곽 끝점)
 * └─ 라벨 ×4 (aria-hidden) — display = span, selectable = 보조 포인터 단축키 button(tabIndex −1)
 * ```
 *
 * - 크기는 CSS 가 컨테이너 폭에서 정한다 — JS 측정이 없다. 꼭짓점·선택 링·선 굵기는 화면 px 로 고정이고
 *   면만 플롯 크기에 맞춰 늘어난다 (`vector-effect: non-scaling-stroke`).
 * - **선택 수단은 이 컴포넌트가 아니다.** 키보드·스크린리더의 선택은 호출자가 함께 두는 RadioGroup 하나다.
 *   라벨 버튼은 같은 컨트롤 2벌 노출을 피하려고 `aria-hidden` + `tabIndex −1` 이다 (Spec §3.1 접근성).
 * - 첫 표시 모션(scale 0.6 → 1 + opacity)은 `prefers-reduced-motion: reduce` 에서 **즉시 최종 상태**다.
 */
export function DiamondChart({
  axes,
  max = 5,
  summary,
  missingLabel,
  mode = 'display',
  selectedId = null,
  onSelect,
  disabled = false,
}: DiamondChartProps) {
  const values: DiamondValues = [axes[0].value, axes[1].value, axes[2].value, axes[3].value];
  const vertices = diamondVertices(values, max);
  const polygons = diamondAreaPolygons(values, max);
  const outlines = diamondOutlines(values, max);
  const selectedIndex =
    mode === 'selectable' && selectedId !== null
      ? axes.findIndex((axis) => axis.id === selectedId)
      : -1;
  const selectedAxis = selectedIndex >= 0 ? axes[selectedIndex] : undefined;
  const ringPoint =
    selectedAxis === undefined
      ? null
      : diamondPercent(
          diamondPointOnAxis(
            selectedIndex,
            selectedAxis.value === null ? 1 : diamondRadiusFraction(selectedAxis.value, max),
          ),
        );

  return (
    <div className={cx('haru-diamond', `haru-diamond--${mode}`)}>
      <svg className="haru-diamond__plot" role="img" aria-label={summary} focusable="false">
        <g className="haru-diamond__grid">
          {POSITIONS.map((_, index) => {
            const from = diamondPercent(diamondPointOnAxis(index, 1));
            const to = diamondPercent(diamondPointOnAxis(index + 1, 1));
            return (
              <line
                key={`edge-${String(index)}`}
                className="haru-diamond__grid-edge"
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
              />
            );
          })}
          {axes.map((axis, index) => {
            const end = diamondPercent(diamondPointOnAxis(index, 1));
            return (
              <line
                key={`axis-${axis.id}`}
                className={cx(
                  'haru-diamond__axis',
                  axis.value === null && 'haru-diamond__axis--missing',
                )}
                data-axis={axis.id}
                x1="50%"
                y1="50%"
                x2={end.x}
                y2={end.y}
              />
            );
          })}
        </g>
        <g className="haru-diamond__data">
          <svg
            className="haru-diamond__area"
            viewBox="-1 -1 2 2"
            preserveAspectRatio="none"
            width="100%"
            height="100%"
          >
            {polygons.map((points, index) => (
              <path
                key={`fill-${String(index)}`}
                className="haru-diamond__area-fill"
                d={diamondPathData(points, true)}
              />
            ))}
            {outlines.map((outline, index) => (
              <path
                key={`stroke-${String(index)}`}
                className="haru-diamond__area-stroke"
                vectorEffect="non-scaling-stroke"
                d={diamondPathData(outline.points, outline.closed)}
              />
            ))}
          </svg>
          {axes.map((axis, index) => {
            const vertex = vertices[index];
            if (vertex === null || vertex === undefined) return null;
            const at = diamondPercent(vertex);
            return (
              <circle
                key={`vertex-${axis.id}`}
                className={cx('haru-diamond__vertex', `haru-diamond__vertex--${axis.tone}`)}
                data-axis={axis.id}
                cx={at.x}
                cy={at.y}
              />
            );
          })}
        </g>
        {ringPoint === null || selectedAxis === undefined ? null : (
          <circle
            key={`ring-${selectedAxis.id}`}
            className="haru-diamond__ring"
            data-axis={selectedAxis.id}
            cx={ringPoint.x}
            cy={ringPoint.y}
          />
        )}
      </svg>

      {axes.map((axis, index) => {
        const selected = index === selectedIndex;
        const className = cx(
          'haru-diamond__label',
          `haru-diamond__label--${POSITIONS[index] ?? 'top'}`,
          selected && 'haru-diamond__label--selected',
        );
        const content = (
          <>
            <Text as="span" variant="caption-1" weight={selected ? 'bold' : 'semibold'}>
              {axis.label}
            </Text>
            {axis.value === null ? (
              <Text as="span" variant="caption-2">
                {missingLabel}
              </Text>
            ) : null}
          </>
        );

        if (mode === 'selectable') {
          return (
            <button
              key={axis.id}
              type="button"
              className={className}
              data-axis={axis.id}
              tabIndex={-1}
              aria-hidden="true"
              disabled={disabled}
              onClick={() => {
                onSelect?.(axis.id);
              }}
            >
              {content}
            </button>
          );
        }

        return (
          <span key={axis.id} className={className} data-axis={axis.id} aria-hidden="true">
            {content}
          </span>
        );
      })}
    </div>
  );
}
