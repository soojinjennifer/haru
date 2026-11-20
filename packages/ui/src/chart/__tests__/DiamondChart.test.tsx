/**
 * DiamondChart — Stage 6 Spec §3.1 (AC-6-57 숫자 미노출 · 축 순서 · 대체 텍스트 · reduced motion,
 * AC-6-58 null 변형 · AC-6-61 축 탭 = 선택(컴포넌트 부분)).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DiamondChart, type DiamondAxis } from '../DiamondChart';

type Axes = readonly [DiamondAxis, DiamondAxis, DiamondAxis, DiamondAxis];

function axes(values: readonly [number | null, number | null, number | null, number | null]): Axes {
  return [
    { id: 'a', label: 'Self-Direction', value: values[0], tone: 'agency' },
    { id: 'b', label: 'Emotion Regulation', value: values[1], tone: 'emotion' },
    { id: 'c', label: 'Cognitive Flexibility', value: values[2], tone: 'flexibility' },
    { id: 'd', label: 'Intrinsic Motivation', value: values[3], tone: 'motivation' },
  ];
}

const SUMMARY =
  'Starting point for Emma. What we saw most: Self-Direction and Intrinsic Motivation.';

function plot() {
  return screen.getByRole('img', { name: SUMMARY });
}

describe('DiamondChart — display', () => {
  it('SVG 가 role="img" + summary 를 이름으로 갖는다 · 라벨은 SR 에서 숨김 (Spec §9.2)', () => {
    const { container } = render(
      <DiamondChart
        axes={axes([4.3, 3.5, 2.5, 3.7])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
      />,
    );
    expect(plot().tagName.toLowerCase()).toBe('svg');
    const labels = container.querySelectorAll('.haru-diamond__label');
    expect(labels).toHaveLength(4);
    labels.forEach((label) => {
      expect(label.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('축 라벨 위치 = 넘긴 순서 (위 → 오른쪽 → 아래 → 왼쪽)', () => {
    const { container } = render(
      <DiamondChart
        axes={axes([4.3, 3.5, 2.5, 3.7])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
      />,
    );
    const placed = [...container.querySelectorAll('.haru-diamond__label')].map((label) => [
      [...label.classList].find((name) => name.startsWith('haru-diamond__label--')),
      label.textContent,
    ]);
    expect(placed).toEqual([
      ['haru-diamond__label--top', 'Self-Direction'],
      ['haru-diamond__label--right', 'Emotion Regulation'],
      ['haru-diamond__label--bottom', 'Cognitive Flexibility'],
      ['haru-diamond__label--left', 'Intrinsic Motivation'],
    ]);
  });

  it('숫자를 그리지 않는다 — 텍스트에 숫자 0 · 눈금 링 0 (`N6-29`)', () => {
    const { container } = render(
      <DiamondChart
        axes={axes([4.3, 3.5, 2.5, 3.7])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
      />,
    );
    expect(container.textContent).not.toMatch(/\d/);
    expect(container.querySelectorAll('text')).toHaveLength(0);
    // 격자 = 외곽 변 4 + 축선 4 뿐
    expect(container.querySelectorAll('.haru-diamond__grid line')).toHaveLength(8);
  });

  it('꼭짓점 원의 좌표 = 기하 (1.0 = 20%) · 역량 tone 클래스', () => {
    const { container } = render(
      <DiamondChart axes={axes([1, 5, 2.5, 3.7])} summary={SUMMARY} missingLabel="Not seen yet" />,
    );
    const vertices = [...container.querySelectorAll('circle.haru-diamond__vertex')].map(
      (circle) => ({
        axis: circle.getAttribute('data-axis'),
        cx: circle.getAttribute('cx'),
        cy: circle.getAttribute('cy'),
        tone: [...circle.classList].find((name) => name.startsWith('haru-diamond__vertex--')),
      }),
    );
    expect(vertices).toEqual([
      { axis: 'a', cx: '50%', cy: '40%', tone: 'haru-diamond__vertex--agency' },
      { axis: 'b', cx: '100%', cy: '50%', tone: 'haru-diamond__vertex--emotion' },
      { axis: 'c', cx: '50%', cy: '75%', tone: 'haru-diamond__vertex--flexibility' },
      { axis: 'd', cx: '13%', cy: '50%', tone: 'haru-diamond__vertex--motivation' },
    ]);
  });

  it('변형 A — 면 1 · 닫힌 외곽선', () => {
    const { container } = render(
      <DiamondChart
        axes={axes([4.3, 3.5, 2.5, 3.7])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
      />,
    );
    expect(container.querySelectorAll('.haru-diamond__area-fill')).toHaveLength(1);
    const stroke = container.querySelector('.haru-diamond__area-stroke');
    expect(stroke?.getAttribute('d')).toMatch(/Z$/);
    expect(stroke?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    expect(container.querySelectorAll('.haru-diamond__axis--missing')).toHaveLength(0);
  });

  it('변형 B — null 축: 축선 점선 · 꼭짓점 없음 · 라벨 아래 캡션 · 축 제거 0 (AC-6-58)', () => {
    const { container } = render(
      <DiamondChart
        axes={axes([4.3, 3.5, null, 3.7])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
      />,
    );
    const missing = container.querySelectorAll('.haru-diamond__axis--missing');
    expect(missing).toHaveLength(1);
    expect(missing[0]?.getAttribute('data-axis')).toBe('c');
    expect(container.querySelector('circle.haru-diamond__vertex[data-axis="c"]')).toBeNull();
    expect(container.querySelectorAll('circle.haru-diamond__vertex')).toHaveLength(3);
    const bottom = container.querySelector('.haru-diamond__label--bottom');
    expect(bottom?.textContent).toBe('Cognitive FlexibilityNot seen yet');
    // 라벨 색은 다른 축과 같다 — 비활성 클래스 0
    expect(bottom?.className).not.toMatch(/disabled|muted/);
    // 열린 외곽선
    expect(container.querySelector('.haru-diamond__area-stroke')?.getAttribute('d')).not.toMatch(
      /Z$/,
    );
  });

  it('변형 C — 4축 null: 면 0 · 꼭짓점 0 · 격자·라벨 4 · 캡션 4', () => {
    const { container } = render(
      <DiamondChart
        axes={axes([null, null, null, null])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
      />,
    );
    expect(container.querySelectorAll('.haru-diamond__area-fill')).toHaveLength(0);
    expect(container.querySelectorAll('circle')).toHaveLength(0);
    expect(container.querySelectorAll('.haru-diamond__axis--missing')).toHaveLength(4);
    expect(container.querySelectorAll('.haru-diamond__label')).toHaveLength(4);
    expect(container.textContent?.match(/Not seen yet/g)).toHaveLength(4);
  });

  it('display 모드에는 버튼·선택 링이 없다', () => {
    const { container } = render(
      <DiamondChart
        axes={axes([4.3, 3.5, 2.5, 3.7])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
        selectedId="a"
      />,
    );
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(container.querySelector('.haru-diamond__ring')).toBeNull();
  });
});

describe('DiamondChart — selectable', () => {
  it('라벨 탭 = onSelect(id) · 버튼은 tabIndex −1 + aria-hidden (선택 수단은 RadioGroup 하나)', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <DiamondChart
        axes={axes([4.3, 3.5, null, 3.7])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
        mode="selectable"
        selectedId="a"
        onSelect={onSelect}
      />,
    );
    const buttons = [...container.querySelectorAll('button')];
    expect(buttons).toHaveLength(4);
    buttons.forEach((button) => {
      expect(button.tabIndex).toBe(-1);
      expect(button.getAttribute('aria-hidden')).toBe('true');
    });
    // 접근성 트리에는 버튼이 없다
    expect(screen.queryAllByRole('button')).toHaveLength(0);

    // null 축도 선택 가능 (`N6-11` ⓐ)
    fireEvent.click(container.querySelector('button[data-axis="c"]') as HTMLButtonElement);
    expect(onSelect).toHaveBeenCalledWith('c');
  });

  it('선택 표시 — 라벨 selected 클래스 + 꼭짓점 위치 링 · null 축이면 외곽 끝점', () => {
    const { container, rerender } = render(
      <DiamondChart
        axes={axes([4.3, 3.5, null, 3.7])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
        mode="selectable"
        selectedId="b"
      />,
    );
    expect(container.querySelector('.haru-diamond__label--selected')?.textContent).toBe(
      'Emotion Regulation',
    );
    const ring = container.querySelector('.haru-diamond__ring');
    expect([ring?.getAttribute('cx'), ring?.getAttribute('cy')]).toEqual(['85%', '50%']);

    rerender(
      <DiamondChart
        axes={axes([4.3, 3.5, null, 3.7])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
        mode="selectable"
        selectedId="c"
      />,
    );
    const nullRing = container.querySelector('.haru-diamond__ring');
    expect([nullRing?.getAttribute('cx'), nullRing?.getAttribute('cy')]).toEqual(['50%', '100%']);
  });

  it('disabled — 버튼 비활성 (저장 중)', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <DiamondChart
        axes={axes([4.3, 3.5, 2.5, 3.7])}
        summary={SUMMARY}
        missingLabel="Not seen yet"
        mode="selectable"
        onSelect={onSelect}
        disabled
      />,
    );
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('DiamondChart.css', () => {
  const css = readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'DiamondChart.css'),
    'utf8',
  );

  it('prefers-reduced-motion: reduce 에서 첫 표시·선택 링 애니메이션 없음 (즉시 최종 상태)', () => {
    const block =
      /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
    expect(block).toMatch(/\.haru-diamond__data/);
    expect(block).toMatch(/\.haru-diamond__ring/);
    expect(block).toMatch(/animation:\s*none/);
  });

  it('가운데 트랙 = min(2·radius-max, 100% − 2·(label-max + label-gap)) — 토큰만 쓴다', () => {
    expect(css).toMatch(/calc\(var\(--chart-diamond-radius-max\) \* 2\)/);
    expect(css).toMatch(
      /calc\(100% - 2 \* \(var\(--chart-diamond-label-max\) \+ var\(--chart-diamond-label-gap\)\)\)/,
    );
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('selectable 히트 영역 ≥ 44 (`--size-touch-min`)', () => {
    expect(css).toMatch(/max\(100%, var\(--size-touch-min\)\)/);
  });
});

/*
 * Stage 7 `S7-B` — `previous` 오버레이 (Spec §3.7 · §2.3.1, AC-7-38 렌더 · AC-7-81 기본값 불변).
 */
describe('DiamondChart — previous 레이어 (Stage 7)', () => {
  const current = axes([4.3, 3.5, 2.5, 3.7]);

  it('previous 미지정 · null → 레이어 · 범례가 DOM 에 없다 (AC-7-81)', () => {
    const { container, rerender } = render(
      <DiamondChart axes={current} summary={SUMMARY} missingLabel="Not seen yet" />,
    );
    expect(container.querySelector('.haru-diamond__previous')).toBeNull();
    expect(container.querySelector('.haru-diamond__legend')).toBeNull();

    rerender(
      <DiamondChart
        axes={current}
        summary={SUMMARY}
        missingLabel="Not seen yet"
        previous={null}
        legend={{ previous: 'Earlier', current: 'This report' }}
      />,
    );
    expect(container.querySelector('.haru-diamond__previous')).toBeNull();
    expect(container.querySelector('.haru-diamond__legend')).toBeNull();
  });

  it('previous 가 있으면 외곽선만 그린다 — 면 0 · 꼭짓점 0 · 현재 레이어보다 아래(z)', () => {
    const { container } = render(
      <DiamondChart
        axes={current}
        summary={SUMMARY}
        missingLabel="Not seen yet"
        previous={[3, 3, 2, 3]}
      />,
    );
    const layer = container.querySelector('.haru-diamond__previous');
    expect(layer).not.toBeNull();
    expect(layer?.querySelectorAll('.haru-diamond__previous-stroke')).toHaveLength(1);
    expect(layer?.querySelector('.haru-diamond__area-fill')).toBeNull();
    expect(layer?.querySelector('circle')).toBeNull();
    // 닫힌 다이아몬드 — 위 3/5 = 0.6 → y −0.6
    expect(layer?.querySelector('path')?.getAttribute('d')).toBe('M0 -0.6 L0.6 0 L0 0.4 L-0.6 0 Z');

    const plotChildren = [...(container.querySelector('.haru-diamond__plot')?.children ?? [])];
    const order = plotChildren.map((node) => node.getAttribute('class'));
    expect(order.indexOf('haru-diamond__grid')).toBeLessThan(
      order.indexOf('haru-diamond__previous'),
    );
    expect(order.indexOf('haru-diamond__previous')).toBeLessThan(
      order.indexOf('haru-diamond__data'),
    );
  });

  it('previous 의 null 축은 Stage 6 와 같은 사분면 규칙으로 열린다', () => {
    const { container } = render(
      <DiamondChart
        axes={current}
        summary={SUMMARY}
        missingLabel="Not seen yet"
        previous={[3, null, 2, 3]}
      />,
    );
    const paths = container.querySelectorAll('.haru-diamond__previous-stroke');
    expect(paths).toHaveLength(1);
    expect(paths[0]?.getAttribute('d')?.endsWith('Z')).toBe(false);
  });

  it('previous 값만으로는 숫자 텍스트가 생기지 않는다 (N7-15)', () => {
    const { container } = render(
      <DiamondChart
        axes={current}
        summary={SUMMARY}
        missingLabel="Not seen yet"
        previous={[3, 3, 2, 3]}
        legend={{ previous: 'Earlier', current: 'This report' }}
      />,
    );
    expect(container.textContent).not.toMatch(/\d/);
  });

  it('범례는 previous + legend 일 때만 · aria-hidden · 견본 2개', () => {
    const { container } = render(
      <DiamondChart
        axes={current}
        summary={SUMMARY}
        missingLabel="Not seen yet"
        previous={[3, 3, 2, 3]}
        legend={{ previous: 'Earlier', current: 'This report' }}
      />,
    );
    const legend = container.querySelector('.haru-diamond__legend');
    expect(legend?.getAttribute('aria-hidden')).toBe('true');
    expect(legend?.textContent).toBe('EarlierThis report');
    expect(legend?.querySelectorAll('.haru-diamond__swatch')).toHaveLength(2);
    // summary 는 그대로 SVG 이름이다 — 비교 문장을 컴포넌트가 만들지 않는다.
    expect(plot().getAttribute('aria-label')).toBe(SUMMARY);
  });

  it('CSS — previous 선은 토큰(P-38)만 · 모션 없음', () => {
    const css = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'DiamondChart.css'),
      'utf8',
    );
    const rule = /\.haru-diamond__previous-stroke\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(rule).toMatch(/stroke:\s*var\(--chart-previous-stroke\)/);
    expect(rule).toMatch(/stroke-width:\s*var\(--chart-previous-width\)/);
    expect(rule).toMatch(/stroke-dasharray:\s*var\(--chart-previous-dash\)/);
    expect(rule).toMatch(/fill:\s*none/);
    expect(css).not.toMatch(/\.haru-diamond__previous[^-][^{]*\{[^}]*animation/);
  });
});
