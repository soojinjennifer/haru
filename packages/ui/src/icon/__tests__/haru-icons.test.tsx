import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { HARU_ICONS } from '../haru';

const SVG_FILES: Record<keyof typeof HARU_ICONS, string> = {
  'haru:tab-center-home': '../haru/tab-center-home.svg',
  'haru:flip-to-back': '../haru/flip-to-back.svg',
  'haru:save-star': '../haru/save-star.svg',
  'haru:session-history': '../haru/session-history.svg',
};

/**
 * 색을 어떻게 받는지는 아이콘마다 다르다.
 *  - 합성 아이콘(`tab-center-home`)은 Figma 원본이 **두 색**이라 semantic 토큰을 직접 참조한다.
 *  - 단색 아이콘(Stage 3 export 3건)은 `currentColor` 로 바꾸고 색은 **사용 지점이 토큰으로**
 *    주입한다 (audit §16.8 — `currentColor` 변환이 export 규격이다).
 * 공통 규칙은 **HEX 를 굽지 않는다** 하나다.
 */
const COLOR_SOURCES: Record<keyof typeof HARU_ICONS, readonly string[]> = {
  'haru:tab-center-home': ['var(--color-action-primary-bg)', 'var(--color-fg-on-accent)'],
  'haru:flip-to-back': ['currentColor'],
  'haru:save-star': ['currentColor'],
  'haru:session-history': ['currentColor'],
};

function readSvg(relative: string): string {
  return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');
}

function pathData(markup: string): string[] {
  return [...markup.matchAll(/\sd="([^"]+)"/g)].map((match) => match[1] ?? '');
}

describe('HARU 전용 SVG (Design Spec §8.2 · §8.3)', () => {
  it('export 대상은 Stage 1 의 1건 + Stage 3 Home 재구현 2건 + Visual Gap 3차 1건이다', () => {
    expect(Object.keys(HARU_ICONS)).toEqual([
      'haru:tab-center-home',
      'haru:flip-to-back',
      'haru:save-star',
      // `A-23`-icon (approvals §13.2) — Lucide `star` 임의 변경을 Figma `50:161` 로 되돌렸다.
      'haru:session-history',
    ]);
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

      it('색을 HEX 로 굽지 않는다 — 토큰 또는 currentColor 다', () => {
        expect(/#[0-9a-fA-F]{3,8}/.test(source)).toBe(false);
        for (const expected of COLOR_SOURCES[name as keyof typeof HARU_ICONS]) {
          expect(source).toContain(expected);
        }
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
