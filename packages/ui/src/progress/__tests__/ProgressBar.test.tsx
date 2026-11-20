import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('exposes value semantics with an accessible name', () => {
    render(<ProgressBar value={3} max={10} label="Survey progress" />);

    const bar = screen.getByRole('progressbar', { name: 'Survey progress' });
    expect(bar.getAttribute('aria-valuenow')).toBe('3');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('10');
  });

  it('clamps values outside the range', () => {
    const { rerender } = render(<ProgressBar value={12} max={10} label="Survey progress" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('10');

    rerender(<ProgressBar value={-4} max={10} label="Survey progress" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<ProgressBar value={null} label="Loading" />);

    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('can repeat the value as text so it is not carried by colour alone', () => {
    render(<ProgressBar value={3} max={10} label="Survey progress" showValue />);

    expect(screen.getByText('3 / 10')).toBeTruthy();
  });

  it('drives the fill width from a custom property instead of a hard-coded size', () => {
    const { container } = render(<ProgressBar value={5} max={10} label="Survey progress" />);

    const fill = container.querySelector('.haru-progress__fill');
    expect(fill?.getAttribute('style')).toContain('--progress-fill-size: 50%');
  });

  /*
   * Stage 7 `M7-11` (Plan §5.7 · AC-7-31) — 장식 모드: SR 이 % 를 읽지 않는다.
   * 카드 · Growth themes 영역의 접근성 트리에 `progressbar` 가 남지 않아야 한다.
   */
  it('decorative 이면 progressbar role · aria-value* 가 없고 루트가 aria-hidden 이다', () => {
    const { container } = render(<ProgressBar value={0.6} max={1} decorative />);

    expect(screen.queryByRole('progressbar')).toBeNull();
    const root = container.querySelector('.haru-progress');
    expect(root?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('[aria-valuenow]')).toBeNull();
    expect(container.querySelector('[aria-label]')).toBeNull();
    // 시각 표현은 그대로다 — 채움 비율은 같은 변수로 간다.
    expect(container.querySelector('.haru-progress__fill')?.getAttribute('style')).toContain(
      '--progress-fill-size: 60%',
    );
  });

  it('decorative + segments 도 role 을 만들지 않는다', () => {
    render(<ProgressBar value={1} max={3} segments={[1, 1, 1]} decorative />);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('기본 모드는 aria-hidden 을 달지 않는다 (AC-7-81 — DOM 불변)', () => {
    const { container } = render(<ProgressBar value={3} max={10} label="Survey progress" />);
    expect(container.querySelector('.haru-progress')?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('채움 색은 --progress-fill-color 가 있으면 그것, 없으면 --color-progress-fill (T7-2)', () => {
    const css = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../ProgressBar.css'),
      'utf8',
    );
    const rule = /\.haru-progress__fill\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(rule).toMatch(
      /background-color:\s*var\(--progress-fill-color,\s*var\(--color-progress-fill\)\)/,
    );
  });
});
