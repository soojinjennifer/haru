/**
 * DiamondChart 기하 — Stage 6 Spec §3.1 · §11.1 (AC-6-57 꼭짓점 좌표 · AC-6-58 null 변형 A/B/C).
 */
import { describe, expect, it } from 'vitest';

import {
  diamondAreaPolygons,
  diamondHalfDiagonal,
  diamondOutlines,
  diamondPathData,
  diamondPercent,
  diamondQuadrants,
  diamondRadiusFraction,
  diamondVertices,
  type DiamondValues,
} from '../diamondGeometry';

/** `T6-1`~`T6-3` (가값 `P-33`). */
const SIZING = { radiusMax: 100, labelMax: 64, labelGap: 6 } as const;

describe('반대각선 h (Spec §11.1)', () => {
  it.each([
    // 카드 내부 폭 W = 컬럼 − 2×24 − 2×16
    [320, 240, 50],
    [393, 313, 86.5],
    [480, 400, 100],
  ])('컬럼 %i → W %i → h %d', (_column, width, expected) => {
    expect(diamondHalfDiagonal(width, SIZING)).toBe(expected);
  });

  it('상한 100 을 넘지 않고 음수가 되지 않는다', () => {
    expect(diamondHalfDiagonal(1000, SIZING)).toBe(100);
    expect(diamondHalfDiagonal(100, SIZING)).toBe(0);
  });
});

describe('값 → 반지름 (1.0 = 20% 지점)', () => {
  it.each([
    [1, 0.2],
    [2.5, 0.5],
    [3.5, 0.7],
    [5, 1],
  ])('%d / 5 → %d', (value, fraction) => {
    expect(diamondRadiusFraction(value, 5)).toBeCloseTo(fraction, 10);
  });

  it('범위 밖 값은 0..1 로 자른다', () => {
    expect(diamondRadiusFraction(7, 5)).toBe(1);
    expect(diamondRadiusFraction(-1, 5)).toBe(0);
    expect(diamondRadiusFraction(3, 0)).toBe(0);
  });
});

describe('꼭짓점 좌표 — 위 → 오른쪽 → 아래 → 왼쪽', () => {
  it('Emma 기본 응답(SD 4.3 · ER 3.5 · CF 2.5 · IM 3.7)의 단위 좌표', () => {
    const vertices = diamondVertices([4.3, 3.5, 2.5, 3.7], 5);
    expect(vertices).toEqual([
      { x: 0, y: -0.86 },
      { x: 0.7, y: 0 },
      { x: 0, y: 0.5 },
      { x: -0.74, y: 0 },
    ]);
  });

  it('1.0 은 중심이 아니라 반지름 20% 지점이다 · 5.0 은 외곽', () => {
    const [top, right, bottom, left] = diamondVertices([1, 5, 1, 5], 5);
    expect(top).toEqual({ x: 0, y: -0.2 });
    expect(right).toEqual({ x: 1, y: 0 });
    expect(bottom).toEqual({ x: 0, y: 0.2 });
    expect(left).toEqual({ x: -1, y: 0 });
  });

  it('393 폭(h 86.5)에서 px 좌표 = 중심 ± h·v/max', () => {
    const h = diamondHalfDiagonal(313, SIZING);
    const [top] = diamondVertices([4.3, 3.5, 2.5, 3.7], 5);
    expect((top?.y ?? 0) * h).toBeCloseTo(-74.39, 2);
  });

  it('플롯 박스 백분율 — 중심 50% · 외곽 0% / 100%', () => {
    expect(diamondPercent({ x: 0, y: -1 })).toEqual({ x: '50%', y: '0%' });
    expect(diamondPercent({ x: 0.7, y: 0 })).toEqual({ x: '85%', y: '50%' });
    expect(diamondPercent({ x: 0, y: 0.2 })).toEqual({ x: '50%', y: '60%' });
  });

  it('null 축은 꼭짓점이 없다 — 0 · 1.0 · 3.0 대체값 0 (AC-6-58)', () => {
    const vertices = diamondVertices([4, null, 2, 3], 5);
    expect(vertices[1]).toBeNull();
    expect(vertices.filter((vertex) => vertex !== null)).toHaveLength(3);
  });
});

describe('면 — 이웃 두 축이 모두 값인 사분면만 (`N6-30`)', () => {
  it('변형 A — 4축 값 → 다이아몬드 1개(닫힌 외곽선)', () => {
    const values: DiamondValues = [4.3, 3.5, 2.5, 3.7];
    expect(diamondQuadrants(values)).toEqual([true, true, true, true]);
    const polygons = diamondAreaPolygons(values, 5);
    expect(polygons).toHaveLength(1);
    expect(polygons[0]).toEqual(diamondVertices(values, 5));
    const outlines = diamondOutlines(values, 5);
    expect(outlines).toEqual([{ points: diamondVertices(values, 5), closed: true }]);
    expect(diamondPathData(outlines[0]?.points ?? [], true)).toBe(
      'M0 -0.86 L0.7 0 L0 0.5 L-0.74 0 Z',
    );
  });

  it('변형 B — 1축 null → null 쪽으로 열린 부채꼴(중심 포함) · 반지름 변에는 외곽선 없음', () => {
    // 아래(Cognitive Flexibility) null — `scores-partially-missing`
    const values: DiamondValues = [4.3, 3.5, null, 3.7];
    expect(diamondQuadrants(values)).toEqual([true, false, false, true]);
    const polygons = diamondAreaPolygons(values, 5);
    // 사분면 3(왼↔위) · 0(위↔오른) 연속 → 중심 · 왼 · 위 · 오른
    expect(polygons).toEqual([
      [
        { x: 0, y: 0 },
        { x: -0.74, y: 0 },
        { x: 0, y: -0.86 },
        { x: 0.7, y: 0 },
      ],
    ]);
    expect(diamondOutlines(values, 5)).toEqual([
      {
        points: [
          { x: -0.74, y: 0 },
          { x: 0, y: -0.86 },
          { x: 0.7, y: 0 },
        ],
        closed: false,
      },
    ]);
  });

  it('변형 B — 이웃한 2축 null → 사분면 1개', () => {
    const values: DiamondValues = [null, null, 3, 4];
    expect(diamondQuadrants(values)).toEqual([false, false, true, false]);
    expect(diamondAreaPolygons(values, 5)).toEqual([
      [
        { x: 0, y: 0 },
        { x: 0, y: 0.6 },
        { x: -0.8, y: 0 },
      ],
    ]);
  });

  it('변형 B — 이웃하지 않은 2축만 값 → 면 0 · 점 2개', () => {
    const values: DiamondValues = [3, null, 4, null];
    expect(diamondAreaPolygons(values, 5)).toEqual([]);
    expect(diamondOutlines(values, 5)).toEqual([]);
    expect(diamondVertices(values, 5).filter((vertex) => vertex !== null)).toHaveLength(2);
  });

  it('변형 B — 값이 1축뿐 → 면 0 · 점 1개', () => {
    const values: DiamondValues = [null, 2, null, null];
    expect(diamondAreaPolygons(values, 5)).toEqual([]);
    expect(diamondVertices(values, 5).filter((vertex) => vertex !== null)).toHaveLength(1);
  });

  it('변형 C — 4축 null → 면 0 · 꼭짓점 0', () => {
    const values: DiamondValues = [null, null, null, null];
    expect(diamondAreaPolygons(values, 5)).toEqual([]);
    expect(diamondOutlines(values, 5)).toEqual([]);
    expect(diamondVertices(values, 5).every((vertex) => vertex === null)).toBe(true);
  });
});
