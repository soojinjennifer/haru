import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { HARU_ICONS } from '../haru';

const SVG_FILES: Record<keyof typeof HARU_ICONS, string> = {
  'haru:tab-center-home': '../haru/tab-center-home.svg',
};

function readSvg(relative: string): string {
  return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');
}

function pathData(markup: string): string[] {
  return [...markup.matchAll(/\sd="([^"]+)"/g)].map((match) => match[1] ?? '');
}

describe('HARU 전용 SVG (Design Spec §8.2 · §8.3)', () => {
  it('Stage 1 export 대상은 tab-center-home 1건뿐이다 (§11-6)', () => {
    expect(Object.keys(HARU_ICONS)).toEqual(['haru:tab-center-home']);
  });

  for (const [name, file] of Object.entries(SVG_FILES)) {
    describe(name, () => {
      const source = readSvg(file);

      it('루트에 width / height 가 없고 viewBox 만 남아 있다 (§8.3)', () => {
        const root = source.slice(0, source.indexOf('>'));
        expect(root).toContain('viewBox=');
        expect(root).not.toContain('width=');
        expect(root).not.toContain('height=');
      });

      it('루트에 aria-hidden 을 넣지 않는다 — Icon 이 결정한다 (§8.3)', () => {
        expect(source).not.toContain('aria-hidden');
      });

      it('색을 HEX 가 아니라 semantic 토큰으로 참조한다', () => {
        expect(/#[0-9a-fA-F]{3,8}/.test(source)).toBe(false);
        expect(source).toContain('var(--color-action-primary-bg)');
        expect(source).toContain('var(--color-fg-on-accent)');
      });

      it('코드 대응본이 .svg 파일과 같은 도형을 그린다', () => {
        const Glyph = HARU_ICONS[name as keyof typeof HARU_ICONS];
        const { container } = render(<Glyph />);
        const rendered = container.innerHTML;

        const expectedViewBox = /viewBox="([^"]+)"/.exec(source)?.[1];
        expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(expectedViewBox);
        expect(pathData(rendered)).toEqual(pathData(source));
        expect(pathData(source).length).toBeGreaterThan(0);
      });
    });
  }
});
