/**
 * StatTile — Stage 7 Spec §3.1 (AC-7-79 타일 · AC-7-70 토큰 · AC-7-67 읽기 순서).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatTile } from '../StatTile';

describe('StatTile', () => {
  it('값과 라벨이 한 문단에 순서대로 있어 SR 이 "5 sessions" 로 읽는다', () => {
    const { container } = render(<StatTile value="5" label="sessions" />);
    const body = container.querySelector('p.haru-stat-tile__body');
    expect(body?.textContent).toBe('5 sessions');
    expect(container.querySelector('.haru-stat-tile__value')?.textContent).toBe('5');
  });

  it('면 · 그림자는 Surface fill="strong" material="bubble" radius="surface" 다 (V-10 선례)', () => {
    const { container } = render(<StatTile value="62m" label="together" />);
    const surface = container.querySelector('.haru-surface');
    expect(surface?.classList.contains('haru-surface--fill-strong')).toBe(true);
    expect(surface?.classList.contains('haru-surface--material-bubble')).toBe(true);
    expect(surface?.classList.contains('haru-surface--radius-surface')).toBe(true);
  });

  it('라벨은 caption-2 · medium · secondary 다', () => {
    const { container } = render(<StatTile value="5" label="sessions" />);
    const label = container.querySelector('.haru-stat-tile__body > .haru-text');
    expect(label?.className).toContain('haru-text--caption-2');
    expect(label?.className).toContain('haru-text--weight-medium');
    expect(label?.className).toContain('haru-text--tone-secondary');
  });

  it('CSS 에 overflow · 임의 값이 없다 (R-SHADOW-1 ① · AC-7-79 타일)', () => {
    const css = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../StatTile.css'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).not.toMatch(/overflow/);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/\d+px/);
  });
});
