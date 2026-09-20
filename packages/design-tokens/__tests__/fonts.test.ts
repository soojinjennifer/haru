/**
 * HARU Design Tokens — Font foundation 검증.
 * 기준: Stage 1 Plan §16 D-3 · Stage 0 결정 #11 · AC-1-13 · AC-1-14
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { stripCssComments } from '../scripts/parse-tokens.mjs';
import {
  ALL_CSS_FILES,
  PACKAGE_ROOT,
  collectDeclarations,
  readSource,
} from '../scripts/token-sources.mjs';

const fontsCss = readSource('src/fonts.css');
const fontsCode = stripCssComments(fontsCss);
const tokens = new Map(collectDeclarations().map((d) => [d.name, d]));

describe('@font-face 단일 선언 지점 (AC-1-13)', () => {
  it('저장소 CSS 중 @font-face 를 선언하는 파일은 src/fonts.css 하나뿐이다', () => {
    const declaring = ALL_CSS_FILES.filter((rel) =>
      stripCssComments(readSource(rel)).includes('@font-face'),
    );
    expect(declaring).toEqual(['src/fonts.css']);
  });

  it('@font-face 블록이 정확히 1개다 (latin subset · normal 만)', () => {
    expect(fontsCode.match(/@font-face/g)).toHaveLength(1);
    expect(fontsCode).not.toMatch(/font-style:\s*italic/);
  });
});

describe('Inter self-host (D-3)', () => {
  it('font-display 전략이 swap 이다', () => {
    expect(fontsCode).toMatch(/font-display:\s*swap/);
  });

  it('variable font 를 weight 100–900 으로 선언한다', () => {
    expect(fontsCode).toMatch(/font-weight:\s*100\s+900/);
    expect(fontsCode).toMatch(/format\('woff2-variations'\)/);
  });

  it('로컬 상대 경로 woff2 만 가리킨다 — 외부 CDN / Google Fonts 0건 (AC-1-14)', () => {
    const urls = [...fontsCode.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => m[1]);
    expect(urls).toEqual(['./assets/inter-latin-wght-normal.woff2']);
    for (const rel of ALL_CSS_FILES) {
      const code = stripCssComments(readSource(rel));
      expect(code).not.toMatch(/https?:\/\//i);
      expect(code).not.toMatch(/fonts\.(googleapis|gstatic)\.com/i);
    }
  });

  it('latin subset unicode-range 만 선언한다 (cyrillic / greek / vietnamese 미포함)', () => {
    expect(fontsCode).toContain('U+0000-00FF');
    expect(fontsCode).not.toContain('U+0460-052F'); // cyrillic-ext
    expect(fontsCode).not.toContain('U+0370-0377'); // greek
    expect(fontsCode).not.toContain('U+1EA0-1EF9'); // vietnamese
  });

  it('빌드 산출물에 latin woff2 1개와 라이선스만 들어간다', () => {
    const assetsDir = path.join(PACKAGE_ROOT, 'dist', 'assets');
    expect(existsSync(assetsDir)).toBe(true);
    const files = readdirSync(assetsDir).sort();
    expect(files).toEqual(['Inter-LICENSE.txt', 'inter-latin-wght-normal.woff2']);
    expect(readFileSync(path.join(assetsDir, 'Inter-LICENSE.txt'), 'utf8')).toContain(
      'SIL OPEN FONT LICENSE',
    );
  });
});

describe('--font-sans 스택 (결정 #11, AC-1-13)', () => {
  const fontSans = tokens.get('--font-sans');

  it('packages/design-tokens 한 곳에서만 정의된다', () => {
    const definingFiles = [...tokens.values()]
      .filter((d) => d.name === '--font-sans')
      .map((d) => d.file);
    expect(definingFiles).toEqual(['src/semantic/typography.css']);
  });

  it('결정 #11 의 stack 과 순서가 같다', () => {
    expect(fontSans?.value).toBe(
      `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    );
  });

  it('system-ui 를 "Inter" 앞에 두지 않는다', () => {
    const stack = fontSans?.value ?? '';
    expect(stack).not.toContain('system-ui');
    expect(stack.indexOf('-apple-system')).toBeLessThan(stack.indexOf('Inter'));
  });

  it('SF Pro 폰트 파일을 저장소·빌드에 포함하지 않는다', () => {
    for (const rel of ALL_CSS_FILES) {
      expect(stripCssComments(readSource(rel))).not.toMatch(/SF-?Pro/i);
    }
    const assetsDir = path.join(PACKAGE_ROOT, 'dist', 'assets');
    expect(readdirSync(assetsDir).filter((f) => /\.(ttf|otf)$/i.test(f))).toEqual([]);
  });
});

describe('빌드 산출물 — CSS Variable export (AC-1-11)', () => {
  const dist = path.join(PACKAGE_ROOT, 'dist');

  it('dist/index.css 에 Tier1 · Tier2 변수가 실제로 들어 있다', () => {
    const bundle = readFileSync(path.join(dist, 'index.css'), 'utf8');
    expect(bundle).toContain('--haru-palette-teal: #85bfb6;');
    expect(bundle).toContain('--color-action-primary-bg: var(--haru-palette-teal);');
    expect(bundle).toContain('color-scheme: light;');
    expect(bundle).toMatch(/@utility\s+app-column/);
  });

  it('dist/index.css 에 Tier3 component 토큰이 섞이지 않는다', () => {
    const bundle = stripCssComments(readFileSync(path.join(dist, 'index.css'), 'utf8'));
    expect(bundle).not.toContain('--tabbar-icon-size');
    expect(bundle).not.toContain('--button-height-lg');
  });

  it('dist/component.css 는 별도 산출물이다 (packages/ui 전용)', () => {
    const component = readFileSync(path.join(dist, 'component.css'), 'utf8');
    expect(component).toContain('--tabbar-icon-size: 21px;');
  });

  it('manifest 가 토큰 목록과 provisional 집계를 내보낸다', () => {
    const manifest = JSON.parse(readFileSync(path.join(dist, 'tokens-manifest.json'), 'utf8')) as {
      counts: Record<string, number>;
      provisionalByItem: Record<string, string[]>;
    };
    expect(manifest.counts['component']).toBe(48);
    expect(Object.keys(manifest.provisionalByItem)).toHaveLength(15);
  });
});
