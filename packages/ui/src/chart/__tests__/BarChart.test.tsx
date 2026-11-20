/**
 * BarChart — Stage 7 Spec §3.4 (AC-7-22 접근성 · 스텁 · 강조 렌더, AC-7-83 라벨 크기 토큰).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BarChart, type BarChartBar } from '../BarChart';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const VALUES = [8, 13, null, 16, 11, 20, 4] as const;

const BARS: readonly BarChartBar[] = VALUES.map((value, index) => ({
  id: `d${String(index)}`,
  label: DAYS[index]?.charAt(0) ?? '',
  srLabel:
    value === null
      ? `${DAYS[index] ?? ''}, no storytime`
      : `${DAYS[index] ?? ''}, ${String(value)} minutes`,
  value,
  valueLabel: value === null ? '—' : `${String(value)}m`,
}));

const SUMMARY = 'Minutes read each day this week';

describe('BarChart', () => {
  it('list + listitem 7개 · 항목 이름 = srLabel (AC-7-22)', () => {
    render(<BarChart bars={BARS} summary={SUMMARY} />);
    const list = screen.getByRole('list', { name: SUMMARY });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(7);
    expect(items[0]?.textContent).toContain('Monday, 8 minutes');
    expect(items[2]?.textContent).toContain('Wednesday, no storytime');
  });

  it('시각 라벨(값 · 요일)과 막대는 aria-hidden — SR 은 srLabel 만 읽는다', () => {
    const { container } = render(<BarChart bars={BARS} summary={SUMMARY} />);
    const hidden = container.querySelectorAll('.haru-visually-hidden');
    expect(hidden).toHaveLength(7);
    container.querySelectorAll('.haru-bar-chart__plot, .haru-bar-chart__label').forEach((node) => {
      expect(node.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('강조 = 16 · 20 두 열 · 기록 없음 = 수요일 1열 (N7-29)', () => {
    const { container } = render(<BarChart bars={BARS} />);
    const emphasized = [...container.querySelectorAll('.haru-bar-chart__column--emphasized')];
    expect(emphasized.map((node) => node.getAttribute('data-bar'))).toStrictEqual(['d3', 'd5']);
    const empty = [...container.querySelectorAll('.haru-bar-chart__column--empty')];
    expect(empty.map((node) => node.getAttribute('data-bar'))).toStrictEqual(['d2']);
    expect(empty[0]?.querySelector('.haru-bar-chart__value')?.textContent).toBe('—');
  });

  it('막대 높이는 CSS 변수 비율로만 넘긴다 (px 하드코딩 0)', () => {
    const { container } = render(<BarChart bars={BARS} />);
    const ratios = [...container.querySelectorAll<HTMLElement>('.haru-bar-chart__bar')].map((bar) =>
      bar.style.getPropertyValue('--bar-chart-ratio'),
    );
    expect(ratios).toStrictEqual(['0.4', '0.65', '0', '0.8', '0.55', '1', '0.2']);
    container.querySelectorAll<HTMLElement>('.haru-bar-chart__bar').forEach((bar) => {
      expect(bar.style.height).toBe('');
      expect(bar.style.blockSize).toBe('');
    });
  });

  it('emphasisRatio prop 이 강조 규칙을 바꾼다', () => {
    const { container } = render(<BarChart bars={BARS} emphasisRatio={1} />);
    expect(container.querySelectorAll('.haru-bar-chart__column--emphasized')).toHaveLength(1);
  });

  it('summary 가 없으면 aria-label 을 달지 않는다', () => {
    const { container } = render(<BarChart bars={BARS} />);
    expect(container.querySelector('.haru-bar-chart')?.hasAttribute('aria-label')).toBe(false);
  });

  describe('CSS — 토큰만 · 11px 미만 글자 0 · overflow 0 · reduced motion (AC-7-70 · AC-7-83)', () => {
    const css = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../BarChart.css'),
      'utf8',
    );
    const code = css.replace(/\/\*[\s\S]*?\*\//g, '');

    it('라벨 크기는 caption-2 토큰만 쓴다', () => {
      expect(code.match(/font-size:[^;]+;/g)).toStrictEqual(['font-size: var(--text-caption-2);']);
    });

    it('HEX · rgb 함수 · px 리터럴 · overflow 선언이 없다', () => {
      expect(code).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(code).not.toMatch(/\brgba?\b/);
      expect(code).not.toMatch(/\d+px/);
      expect(code).not.toMatch(/overflow/);
    });

    it('reduced motion 에서 막대 grow 애니메이션을 끈다', () => {
      expect(code).toMatch(
        /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.haru-bar-chart__bar\s*\{\s*animation: none;/,
      );
    });
  });
});
