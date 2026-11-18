/**
 * DiamondChart 기하 — Stage 6 Design Spec §3.1 (`N6-28` · `N6-30` · `D6-8`). **순수 함수**만 둔다.
 *
 * 좌표계: **단위 좌표** — 중심 `(0, 0)`, 외곽 꼭짓점(값 = `max`)까지 거리 `1`, y 는 아래로 증가(SVG).
 * 축 index 는 호출자가 넘긴 순서이며 위치는 고정이다: `0` 위 · `1` 오른쪽 · `2` 아래 · `3` 왼쪽.
 * (어떤 역량이 어느 축인지는 도메인 레이어가 정한다 — `packages/ui` 는 역량을 모른다.)
 *
 * | 항목 | 규칙 |
 * |---|---|
 * | 값 → 반지름 | `r(v) = v / max` — **1.0 은 중심이 아니라 20% 지점**이다 ("최저 = 아무것도 없음" 으로 읽히지 않게) |
 * | 면 | **이웃한 두 축이 모두 값이 있는 사분면 삼각형**(중심 · 꼭짓점 i · 꼭짓점 i+1)의 합집합 (`N6-30`) |
 * | 변형 A | 4축 값 → 사분면 4개 = 일반 다이아몬드 |
 * | 변형 B | null 축에 닿는 사분면은 그리지 않는다 → 도형이 null 쪽으로 **열린다**(0 으로 꺼지지 않는다) |
 * | 변형 C | 면 0 · 꼭짓점 0 |
 * | 외곽선 | 그린 사분면의 **바깥 변**(꼭짓점 i → i+1)만. 열린 변(null 쪽 반지름 변)에는 긋지 않는다 |
 *
 * 화면 크기(px)는 CSS 가 같은 식으로 정한다 (`DiamondChart.css` 의 grid 트랙). `diamondHalfDiagonal` 은
 * 그 식을 숫자로 옮긴 것이며 테스트·Visual Gap 기준값(393 → 86.5 · 320 → 50 · 480 → 100)의 근거다.
 */

/** 축 개수 — 다이아몬드는 4축 고정이다. */
export const DIAMOND_AXIS_COUNT = 4;

/** 단위 좌표의 한 점. */
export interface DiamondPoint {
  readonly x: number;
  readonly y: number;
}

/** 축 4개의 값 — `null` = 미관찰 (0 · 1.0 · 3.0 으로 대체하지 않는다). */
export type DiamondValues = readonly [number | null, number | null, number | null, number | null];

/** 위 → 오른쪽 → 아래 → 왼쪽 단위 방향. */
const DIRECTIONS: readonly DiamondPoint[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

const CENTER: DiamondPoint = { x: 0, y: 0 };

/** 부동소수점 꼬리(`0.30000000000000004`)를 SVG 속성에 남기지 않는다. */
function round(value: number): number {
  const rounded = Math.round(value * 10_000) / 10_000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/** 값 → 반지름 비율 `v / max` (0..1 로 자른다). */
export function diamondRadiusFraction(value: number, max: number): number {
  if (!(max > 0)) return 0;
  return Math.min(1, Math.max(0, value / max));
}

/** 축 `axisIndex` 위, 중심에서 `fraction` 만큼 떨어진 점. */
export function diamondPointOnAxis(axisIndex: number, fraction: number): DiamondPoint {
  const direction = DIRECTIONS[axisIndex % DIAMOND_AXIS_COUNT] ?? CENTER;
  return { x: round(direction.x * fraction), y: round(direction.y * fraction) };
}

/** 축별 꼭짓점. 미관찰(`null`) 축은 꼭짓점이 없다. */
export function diamondVertices(
  values: DiamondValues,
  max: number,
): readonly (DiamondPoint | null)[] {
  return values.map((value, index) =>
    value === null ? null : diamondPointOnAxis(index, diamondRadiusFraction(value, max)),
  );
}

/** 사분면 i(축 i ↔ 축 i+1)를 그리는가 — 두 축이 모두 값이 있을 때만. */
export function diamondQuadrants(values: DiamondValues): readonly boolean[] {
  return values.map(
    (value, index) => value !== null && values[(index + 1) % DIAMOND_AXIS_COUNT] !== null,
  );
}

/** 연속으로 그려지는 사분면 묶음 — `start` 사분면부터 `length` 개 (원형). */
interface QuadrantRun {
  readonly start: number;
  readonly length: number;
}

function quadrantRuns(present: readonly boolean[]): readonly QuadrantRun[] {
  if (present.every(Boolean)) return [{ start: 0, length: DIAMOND_AXIS_COUNT }];

  const runs: QuadrantRun[] = [];
  // 빠진 사분면 바로 다음에서 시작해야 원형 묶음이 둘로 쪼개지지 않는다.
  const firstMissing = present.indexOf(false);
  let start = -1;
  let length = 0;

  for (let step = 1; step <= DIAMOND_AXIS_COUNT; step += 1) {
    const index = (firstMissing + step) % DIAMOND_AXIS_COUNT;
    if (present[index] === true) {
      if (length === 0) start = index;
      length += 1;
    } else if (length > 0) {
      runs.push({ start, length });
      length = 0;
    }
  }
  if (length > 0) runs.push({ start, length });

  return runs;
}

/** 면 다각형 — 꼭짓점 목록 (닫힌 다각형). 4축 모두 값이면 다이아몬드 1개, 아니면 중심을 포함한 부채꼴. */
export function diamondAreaPolygons(
  values: DiamondValues,
  max: number,
): readonly (readonly DiamondPoint[])[] {
  const vertices = diamondVertices(values, max);
  const runs = quadrantRuns(diamondQuadrants(values));

  return runs.map((run) => {
    const points: DiamondPoint[] = [];
    const isFull = run.length === DIAMOND_AXIS_COUNT;
    if (!isFull) points.push(CENTER);
    const count = isFull ? DIAMOND_AXIS_COUNT : run.length + 1;
    for (let offset = 0; offset < count; offset += 1) {
      const vertex = vertices[(run.start + offset) % DIAMOND_AXIS_COUNT];
      if (vertex !== null && vertex !== undefined) points.push(vertex);
    }
    return points;
  });
}

/** 면 외곽선 — 바깥 변만. 4축 모두 값이면 닫힌 선, 아니면 열린 꺾은선. */
export interface DiamondOutline {
  readonly points: readonly DiamondPoint[];
  readonly closed: boolean;
}

export function diamondOutlines(values: DiamondValues, max: number): readonly DiamondOutline[] {
  return diamondAreaPolygons(values, max).map((polygon) => {
    const closed = polygon.length === DIAMOND_AXIS_COUNT && polygon[0] !== CENTER;
    // 부채꼴이면 첫 점(중심)을 빼고 꼭짓점만 잇는다 — 반지름 변(열린 변)에는 선을 긋지 않는다.
    return { points: closed ? polygon : polygon.slice(1), closed };
  });
}

/** SVG `d` 속성. */
export function diamondPathData(points: readonly DiamondPoint[], closed: boolean): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  const head = `M${String(first?.x ?? 0)} ${String(first?.y ?? 0)}`;
  const tail = rest.map((point) => `L${String(point.x)} ${String(point.y)}`).join(' ');
  return [head, tail, closed ? 'Z' : ''].filter((part) => part.length > 0).join(' ');
}

/** 단위 좌표 → 정사각 플롯 박스 기준 백분율 (`cx="60%"`). */
export function diamondPercent(point: DiamondPoint): { x: string; y: string } {
  return { x: `${String(round(50 + 50 * point.x))}%`, y: `${String(round(50 + 50 * point.y))}%` };
}

/** 차트 기하 상수 (px) — `T6-1`~`T6-3` 토큰 값과 같다 (가값 `P-33`). */
export interface DiamondSizing {
  readonly radiusMax: number;
  readonly labelMax: number;
  readonly labelGap: number;
}

/**
 * 반대각선 `h` (px) = `min(radiusMax, (W − 2·(labelMax + labelGap)) / 2)` — Spec §3.1 · §11.1.
 * CSS 는 같은 식을 grid 트랙 `min(2·radiusMax, 100% − 2·(labelMax + labelGap))` 으로 쓴다.
 */
export function diamondHalfDiagonal(width: number, sizing: DiamondSizing): number {
  return Math.max(
    0,
    Math.min(sizing.radiusMax, (width - 2 * (sizing.labelMax + sizing.labelGap)) / 2),
  );
}
