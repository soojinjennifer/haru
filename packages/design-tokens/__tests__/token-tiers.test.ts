/**
 * HARU Design Tokens — 3-tier 구조 · 의존 방향 · Tailwind 노출 검증.
 * 기준: Stage 1 Design Spec §3.1–§3.4 · AC-1-10 · AC-1-11 · AC-1-15 · AC-1-16
 */

import { describe, expect, it } from 'vitest';

import { stripCssComments } from '../scripts/parse-tokens.mjs';
import { ALL_CSS_FILES, collectDeclarations, readSource } from '../scripts/token-sources.mjs';

const declarations = collectDeclarations();
/** 네임스페이스 초기화(`--color-*: initial`)는 토큰 선언이 아니다. */
const tokens = declarations.filter((d) => !d.name.endsWith('-*'));
const byName = new Map(tokens.map((d) => [d.name, d]));

const primitives = tokens.filter((d) => d.tier === 'primitive');
const semantics = tokens.filter((d) => d.tier === 'semantic');
const components = tokens.filter((d) => d.tier === 'component');

describe('Tier 1 — Primitive (Design Spec §3.1)', () => {
  it('palette 색 30개 + status 8개가 정의되어 있다', () => {
    const colors = primitives.filter((d) => d.file === 'src/primitive/color.css');
    expect(colors.filter((d) => !d.name.startsWith('--haru-status-'))).toHaveLength(30);
    expect(colors.filter((d) => d.name.startsWith('--haru-status-'))).toHaveLength(8);
  });

  it('text style 11종(size/line) + weight 5종이 정의되어 있다', () => {
    const type = primitives.filter((d) => d.file === 'src/primitive/typography.css');
    expect(type.filter((d) => d.name.endsWith('-size'))).toHaveLength(11);
    expect(type.filter((d) => d.name.endsWith('-line'))).toHaveLength(11);
    expect(type.filter((d) => d.name.startsWith('--haru-weight-'))).toHaveLength(5);
  });

  it('11px 미만 텍스트 크기를 만들지 않는다 (Stage 0 #10-②)', () => {
    const sizes = primitives
      .filter((d) => d.name.endsWith('-size'))
      .map((d) => Number.parseFloat(d.value));
    expect(Math.min(...sizes)).toBe(11);
  });

  it('Primitive 는 다른 토큰을 참조하지 않는다 (의존 방향 역전 0건)', () => {
    const reversed = primitives.filter((d) => d.references.length > 0);
    expect(reversed.map((d) => d.name)).toEqual([]);
  });

  it('모든 Primitive 이름은 --haru- 네임스페이스다', () => {
    expect(primitives.filter((d) => !d.name.startsWith('--haru-'))).toEqual([]);
  });
});

describe('Tier 2 — Semantic (Design Spec §3.2)', () => {
  it('semantic color 가 65개다 — §3.2.1 표 64개 + S1-D1-1 (--gradient-app 제외)', () => {
    const colors = semantics.filter((d) => d.name.startsWith('--color-'));
    expect(colors).toHaveLength(65);
  });

  it('Tag neutral 배경이 semantic 을 거친다 (S1-D1-1, approvals §7)', () => {
    // 색 값은 바꾸지 않고 참조 경로만 semantic 을 거친다.
    expect(byName.get('--color-tag-neutral-bg')?.value).toBe('var(--haru-dusk-200)');
    expect(byName.get('--haru-dusk-200')?.value).toBe('#c7c9d7');
  });

  it('Semantic 은 Primitive 또는 같은 Tier 만 참조한다 (component 참조 0건)', () => {
    const componentNames = new Set(components.map((d) => d.name));
    const reversed = semantics.filter((d) => d.references.some((r) => componentNames.has(r)));
    expect(reversed.map((d) => d.name)).toEqual([]);
  });

  it('Semantic 이 참조하는 모든 var() 는 실제로 정의된 토큰이다', () => {
    const missing = semantics
      .flatMap((d) => d.references.map((r) => ({ from: d.name, ref: r })))
      .filter(({ ref }) => !byName.has(ref));
    expect(missing).toEqual([]);
  });

  it('Capability 색이 결정 #19 값과 일치하고 배지와 차트가 같은 토큰을 본다 (AC-1-15)', () => {
    const palette = {
      '--haru-palette-pink': '#efc3d4',
      '--haru-palette-green': '#90bfad',
      '--haru-palette-cyan': '#a0ccdd',
      '--haru-palette-purple': '#c9b8d4',
    } as const;
    for (const [name, value] of Object.entries(palette)) {
      expect(byName.get(name)?.value).toBe(value);
    }
    expect(byName.get('--color-capability-emotion-bg')?.value).toBe('var(--haru-palette-pink)');
    expect(byName.get('--color-capability-agency-bg')?.value).toBe('var(--haru-palette-green)');
    expect(byName.get('--color-capability-flexibility-bg')?.value).toBe('var(--haru-palette-cyan)');
    expect(byName.get('--color-capability-motivation-bg')?.value).toBe(
      'var(--haru-palette-purple)',
    );
    for (const key of ['agency', 'emotion', 'flexibility', 'motivation']) {
      expect(byName.get(`--color-capability-${key}-chart`)?.value).toBe(
        `var(--color-capability-${key}-bg)`,
      );
    }
  });

  it('breakpoint 는 md / lg 두 개뿐이고 --bp-* 와 값이 같다 (§7.1)', () => {
    const breakpoints = semantics.filter((d) => d.name.startsWith('--breakpoint-'));
    expect(breakpoints.map((d) => d.name).sort()).toEqual(['--breakpoint-lg', '--breakpoint-md']);
    expect(byName.get('--breakpoint-md')?.value).toBe(byName.get('--bp-md')?.value);
    expect(byName.get('--breakpoint-lg')?.value).toBe(byName.get('--bp-lg')?.value);
  });

  it('radius 는 6단계다 (§3.2.3)', () => {
    expect(semantics.filter((d) => d.name.startsWith('--radius-')).map((d) => d.name)).toEqual([
      '--radius-indicator',
      '--radius-control',
      '--radius-field',
      '--radius-surface',
      '--radius-card',
      '--radius-pill',
    ]);
  });

  it('사용자 확정값(2026-09-20)이 반영되어 있다', () => {
    expect(byName.get('--radius-surface')?.value).toBe('22px');
    expect(byName.get('--layout-gutter')?.value).toBe('var(--space-6)');
    expect(byName.get('--space-6')?.value).toBe('calc(var(--spacing) * 6)');
    expect(byName.get('--spacing')?.value).toBe('4px');
    expect(byName.get('--gradient-app')?.value).toContain('var(--color-bg-app-mid) 46%');
    expect(byName.get('--size-button-lg')?.value).toBe('56px');
    expect(byName.get('--size-medallion-sm')?.value).toBe('136px');
    expect(byName.get('--size-medallion-md')?.value).toBe('188px');
    expect(byName.get('--size-medallion-lg')?.value).toBe('232px');
    expect(byName.get('--size-medallion-ring-offset')?.value).toBe('8px');
  });

  it('신규 토큰 3종(S1-D3)이 승인된 값으로 들어있다', () => {
    // 알파를 유지한다 — 불투명 합성(#f9f9fb)이 아니다.
    expect(byName.get('--material-glass-fill-fallback')?.value).toBe('var(--haru-white-a90)');
    expect(byName.get('--haru-white-a90')?.value).toBe('rgb(255 255 255 / 0.9)');
    expect(byName.get('--tabbar-icon-size')?.value).toBe('21px');
    expect(byName.get('--layout-tabbar-center-overhang')?.value).toBe('35px');
  });
});

describe('Tier 3 — Component (Design Spec §3.3)', () => {
  it('component 토큰은 src/component/index.css 한 곳에만 있다', () => {
    expect([...new Set(components.map((d) => d.file))]).toEqual(['src/component/index.css']);
  });

  it('Design Spec §3.3 표 48개 + Stage 2 신규 4개 = 52개 토큰을 전부 정의한다', () => {
    expect(components.map((d) => d.name).sort()).toEqual(
      [
        '--button-height-md',
        '--button-height-lg',
        '--button-padding-x',
        '--button-padding-y-md',
        '--button-gap',
        '--button-radius',
        '--button-label-size',
        '--icon-button-size',
        '--icon-button-icon-size',
        '--icon-button-hit-size',
        '--topbar-height',
        '--topbar-gap',
        '--topbar-pill-height',
        '--topbar-pill-padding-x',
        '--tabbar-height',
        '--tabbar-icon-size',
        '--tabbar-label-size',
        '--tabbar-center-size',
        '--tabbar-item-gap',
        '--tag-height-sm',
        '--tag-height-xs',
        '--tag-padding-x',
        '--chip-height',
        '--chip-padding-x',
        '--chip-padding-y',
        '--chip-label-size',
        '--field-row-height',
        '--field-padding-x',
        '--field-padding-y',
        '--field-radius',
        '--field-label-size',
        '--field-value-size',
        '--bubble-radius',
        '--bubble-padding-x',
        '--bubble-padding-y',
        '--bubble-tail-size',
        '--indicator-dot-size',
        '--indicator-active-width',
        '--indicator-gap',
        '--progress-height-sm',
        '--progress-height-md',
        '--checkbox-size',
        '--radio-dot-size',
        '--radio-row-height',
        // Stage 2 Design Spec §4.2 · §4.3 신규 (D-8)
        '--list-row-height-min',
        '--deck-inset-x',
        '--deck-peek-y',
        '--deck-depth',
        '--sheet-radius-top',
        '--dialog-radius',
        '--toast-radius',
        '--skeleton-radius',
      ].sort(),
    );
  });

  it('Component 는 Primitive 를 건너뛰어 참조하지 않는다 (Component → Semantic 만)', () => {
    const skipping = components.filter((d) => d.references.some((r) => r.startsWith('--haru-')));
    expect(skipping.map((d) => d.name)).toEqual([]);
  });

  it('Component 가 참조하는 var() 는 전부 Semantic 토큰이다', () => {
    const semanticNames = new Set(semantics.map((d) => d.name));
    const bad = components
      .flatMap((d) => d.references.map((r) => ({ from: d.name, ref: r })))
      .filter(({ ref }) => !semanticNames.has(ref));
    expect(bad).toEqual([]);
  });

  it('Tier 3 는 패키지 진입점(index.css)에 포함되지 않는다 — packages/ui 전용 경계', () => {
    const entry = stripCssComments(readSource('src/index.css'));
    expect(entry).not.toContain('component/index.css');
  });
});

describe('Tailwind v4 노출 (Design Spec §3.4, AC-1-11)', () => {
  const themeTokens = declarations.filter((d) => d.block.startsWith('@theme'));

  it('@theme 에는 Semantic 만 있고 Primitive / Component 가 새지 않는다', () => {
    expect(themeTokens.filter((d) => d.tier !== 'semantic')).toEqual([]);
    expect(themeTokens.filter((d) => d.name.startsWith('--haru-'))).toEqual([]);
  });

  it('Tier 1 · Tier 3 선언은 전부 :root 블록이다', () => {
    expect([...primitives, ...components].filter((d) => d.block !== ':root')).toEqual([]);
  });

  it('기본 네임스페이스를 초기화한다 (§3.4 13 네임스페이스)', () => {
    const resets = declarations
      .filter((d) => d.name.endsWith('-*') && d.value === 'initial')
      .map((d) => d.name)
      .sort();
    expect(resets).toEqual(
      [
        '--color-*',
        '--font-*',
        '--text-*',
        '--font-weight-*',
        '--radius-*',
        '--shadow-*',
        '--inset-shadow-*',
        '--blur-*',
        '--ease-*',
        '--breakpoint-*',
        '--animate-*',
      ].sort(),
    );
  });

  it('@utility 노출 대상이 §3.4 표와 일치한다', () => {
    const utilities = [
      ...stripCssComments(readSource('src/utilities.css')).matchAll(
        /@utility\s+([a-z0-9-]+)\s*\{/g,
      ),
    ].map((m) => m[1]);
    expect(utilities.sort()).toEqual(
      [
        // z-index
        'z-base',
        'z-sticky',
        'z-tabbar',
        'z-sheet',
        'z-dialog',
        'z-toast',
        // motion duration
        'duration-instant',
        'duration-fast',
        'duration-base',
        'duration-slow',
        // material 합성
        'material-glass-rest',
        'material-glass-raised',
        'material-glass-pressed',
        'material-glass-strong',
        // layout
        'app-column',
        'px-gutter',
        'max-w-app',
        'min-w-app',
        'h-tabbar',
        // safe-area
        'pt-safe',
        'pb-safe',
        'pl-safe',
        'pr-safe',
        'mb-safe',
        // gradient / touch / focus / disabled / icon size
        'bg-app',
        'min-touch',
        'focus-ring',
        'opacity-disabled',
        'size-icon-sm',
        'size-icon-md',
        'size-icon-lg',
      ].sort(),
    );
  });

  it('@utility 본문은 리터럴 수치가 아니라 semantic 토큰만 쓴다 (AC-1-10)', () => {
    const body = stripCssComments(readSource('src/utilities.css'));
    // `blur(1px)` 은 @supports 지원 판정용 상수이므로 검사 대상에서 뺀다.
    const withoutSupportProbe = body.replace(/@supports[^{]*\{/g, '@supports {');
    // 임의 HEX 금지
    expect(withoutSupportProbe).not.toMatch(/:\s*#[0-9a-f]{3,8}/i);
    // 절대 길이(px/rem/em) 리터럴 금지 — 치수는 전부 semantic 토큰에서 온다
    expect(withoutSupportProbe).not.toMatch(/:\s*-?\d+(\.\d+)?(px|rem|em)\b/);
    // 백분율은 `width: 100%`(가용 폭 채우기) 하나만 허용한다
    const percents = [...withoutSupportProbe.matchAll(/:\s*(-?\d+(?:\.\d+)?%)/g)].map((m) => m[1]);
    expect(percents).toEqual(['100%']);
  });
});

describe('전역 불변 규칙', () => {
  it('토큰 이름이 중복되지 않는다', () => {
    const counts = new Map<string, number>();
    for (const d of tokens) counts.set(d.name, (counts.get(d.name) ?? 0) + 1);
    expect([...counts.entries()].filter(([, n]) => n > 1)).toEqual([]);
  });

  it('Dark mode 토큰이 없고 color-scheme: light 가 선언되어 있다 (AC-1-16)', () => {
    expect(readSource('src/color-scheme.css')).toContain('color-scheme: light');
    for (const rel of ALL_CSS_FILES) {
      expect(stripCssComments(readSource(rel))).not.toMatch(/prefers-color-scheme/);
    }
  });

  it('Secret / 외부 분석 SDK / 외부 URL 을 참조하지 않는다', () => {
    for (const rel of ALL_CSS_FILES) {
      expect(stripCssComments(readSource(rel))).not.toMatch(/https?:\/\//i);
    }
  });
});
