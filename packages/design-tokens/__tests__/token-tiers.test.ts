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
  it('palette 색 32개 + status 8개 — 30 + `--haru-white-a82` + `--haru-white-a85`', () => {
    const colors = primitives.filter((d) => d.file === 'src/primitive/color.css');
    expect(colors.filter((d) => !d.name.startsWith('--haru-status-'))).toHaveLength(32);
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
  it('semantic color 가 73개다 — 67 + Home 재구현 5 + 칩 아이콘 1 (--gradient-app 제외)', () => {
    const colors = semantics.filter((d) => d.name.startsWith('--color-'));
    expect(colors).toHaveLength(73);
  });

  /*
   * Stage 3 Home 재구현(2026-10-05 Figma 재대조). 넷 다 **Tier 3 가 Primitive 를 직접 참조할 수
   * 없어서**(build-tokens 3-4) semantic 경유가 유일한 경로인 경우다 — `--color-prompt-tag-*` 와
   * 같은 사유다. 값은 전부 기존 Primitive 안에 있다 (신규 HEX 0건).
   */
  it('Home 재구현 색 4종이 기존 Primitive 를 가리킨다', () => {
    expect(byName.get('--color-surface-card')?.value).toBe('var(--haru-white-a82)');
    expect(byName.get('--haru-white-a82')?.value).toBe('rgb(255 255 255 / 0.82)');
    expect(byName.get('--color-surface-spring')?.value).toBe('var(--haru-mist-200)');
    expect(byName.get('--color-icon-flip')?.value).toBe('var(--haru-palette-mint)');
    expect(byName.get('--color-icon-save-star')?.value).toBe('var(--haru-palette-yellow)');
    // Visual Gap `V-11` — `Button/White` 는 0.85 다. `--color-surface-strong`(0.90)과 다르다.
    expect(byName.get('--color-action-white-bg')?.value).toBe('var(--haru-white-a85)');
    expect(byName.get('--haru-white-a85')?.value).toBe('rgb(255 255 255 / 0.85)');
  });

  /*
   * Stage 3 Design Spec §6.2 는 "신규 semantic 0건" 을 적었으나, 거기에서 제안한 Tier 3
   * `--prompt-phase-tag-bg/-fg` 의 값이 **Primitive**(`--haru-palette-cyan` · `--haru-white`)
   * 라서 Tier 3 → Primitive 직접 참조 금지(build-tokens 3-4)에 걸린다. 같은 절이 역량 색
   * 토큰 재사용도 금지하므로 **semantic 2개 신설이 유일하게 규칙을 지키는 경로**다.
   */
  it('Prompt 배지 색이 semantic 을 거친다 (Tier3 → Primitive 직접 참조 금지 회피)', () => {
    expect(byName.get('--color-prompt-tag-bg')?.value).toBe('var(--haru-palette-cyan)');
    expect(byName.get('--color-prompt-tag-fg')?.value).toBe('var(--haru-white)');
    // 역량 색 토큰을 재사용하지 않는다 (#19 오염 금지 — Design Spec §6.2).
    expect(byName.get('--prompt-phase-tag-bg')?.value).toBe('var(--color-prompt-tag-bg)');
    expect(byName.get('--prompt-phase-tag-fg')?.value).toBe('var(--color-prompt-tag-fg)');
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

  /*
   * **7단계** — Stage 0 `#10-②`("6단계 고정")은 `L-OPEN-09` 결정으로 개정되었다
   * (`stage-3-approvals.md` §17.3). 추가는 `--radius-media`(12) 한 건이다.
   * 표지 10 은 여기에 넣지 않는다 — 8·12 동점이라 흡수 근거가 없고, Tier 3
   * `--book-cover-radius-xl` 가 현재 렌더값 10 을 그대로 보존한다 (Library Design Spec §5.5).
   */
  it('radius 는 7단계다 (§3.2.3 개정 — L-OPEN-09)', () => {
    expect(semantics.filter((d) => d.name.startsWith('--radius-')).map((d) => d.name)).toEqual([
      '--radius-indicator',
      '--radius-control',
      '--radius-media',
      '--radius-field',
      '--radius-surface',
      '--radius-card',
      '--radius-pill',
    ]);
    expect(byName.get('--radius-media')?.value).toBe('12px');
  });

  /*
   * `LT-1` — Figma Library 의 3단계 회색. 재매핑 전에는 secondary 와 **같은** `ink-500` 이었다.
   * `LT-12` — scrim 은 Figma 실측값(7점 최소제곱)이다. 남색 기운(`#29293a`)이 아니라 순검정이다.
   */
  it('Library 색 결정 2건이 반영되어 있다 (LT-1 · LT-12)', () => {
    expect(byName.get('--color-fg-tertiary')?.value).toBe('var(--haru-ink-400)');
    expect(byName.get('--haru-ink-400')?.value).toBe('#9aabaa');
    expect(byName.get('--color-fg-secondary')?.value).toBe('var(--haru-ink-500)');
    expect(byName.get('--color-scrim')?.value).toBe('rgb(0 0 0 / 0.34)');
  });

  it('사용자 확정값(2026-09-20)이 반영되어 있다', () => {
    expect(byName.get('--radius-surface')?.value).toBe('22px');
    // `A-20` (stage-3-approvals §12.13) — 18 은 흡수하지 않고 0.5 스텝으로 스케일에 넣는다.
    expect(byName.get('--space-4-5')?.value).toBe('calc(var(--spacing) * 4.5)');
    // Figma `26:21` 852 − (766 + 70)
    expect(byName.get('--layout-tabbar-bottom-gap')?.value).toBe('16px');
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

  /*
   * Visual Gap 3차 결정(2026-10-06, approvals §13)에서 **2종 추가** → 132.
   *  - `--week-summary-chip-icon-color` (`A-23`-icon — Figma `50:161` 채움색)
   *  - `--bubble-content-max-lines` (`W-5` — 주 문구 4줄 상한)
   *
   * Library 1라운드(`LT-3`~`LT-14` + §8.1 inset 레시피)에서 **19종 추가 · 1종 제거** → 150.
   *  추가: `--book-cover-w-sm` · `-w-xl` · `-h-xl` · `--book-cover-radius-xl` ·
   *        `--library-shelf-cover-aspect` · `--library-shelf-block-size` ·
   *        `--library-shelf-indicator-gap` · `--library-shelf-item-gap` ·
   *        `--reading-now-text-gap` · `--reading-now-progress-height` ·
   *        `--book-list-row-height-min` · `--library-entry-row-height-min` ·
   *        `--section-header-action-hit` · `--sheet-inset-inline` · `--sheet-inset-block-end` ·
   *        `--sheet-inset-radius` · `--sheet-inset-pad` ·
   *        `--sheet-content-shadow-inset-block-end` · `--sheet-content-shadow-inset-inline`
   *  제거: `--activity-card-cover-radius` (간격 토큰 오용 → `--book-cover-radius-xl` 로 통합,
   *        **값 10 동일이므로 렌더 변화 0**)
   *
   * Library 2라운드-4(사용자 결정 2026-10-09 ③)에서 **1종 추가** → 151.
   *  추가: `--sheet-content-shadow-inset-inline-cover` — 같은 inset 레시피의 **표지 전용
   *        좌우 값**이다. `--shadow-bubble`(좌우 4)과 `--shadow-cover`(좌우 **14**)의 번짐이
   *        다르므로 값을 공유할 수 없다 (둘 다 픽셀 프로브 실측).
   *
   * Library 2라운드-5(사용자 결정 2026-10-09 ①)에서 **1종 추가** → 152.
   *  추가: `--sheet-content-shadow-inset-block-start-cover` — 같은 표지 그림자의 **위쪽**
   *        값이다. `--shadow-cover` 는 offset-y `+6` 이라 번짐이 비대칭이고(위 **8** · 아래
   *        **20** · 좌우 **14**, 전부 픽셀 프로브 실측) 위쪽만 본문 클립 선에 걸린다.
   */
  it('Tier 3 토큰 152개를 전부 정의한다 (Home 재구현 + Visual Gap 교정·3차 + 버블 닫기 + 그림자 inset + Library 1라운드 + 표지 그림자 자리)', () => {
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
        '--bubble-shadow',
        '--bubble-padding-x',
        '--bubble-padding-block-start',
        '--bubble-padding-block-end',
        '--bubble-gap',
        '--bubble-hint-size',
        '--bubble-tail-inline-size',
        '--bubble-tail-block-size',
        '--bubble-tail-radius',
        '--bubble-tail-shape-size',
        '--bubble-tail-start',
        '--bubble-tail-overhang',
        '--bubble-tail-rotate',
        '--bubble-tail-skew',
        '--bubble-dismiss-inset',
        '--bubble-content-max-lines',
        '--indicator-dot-size',
        '--indicator-active-width',
        '--indicator-gap',
        '--progress-height-sm',
        '--progress-height-md',
        '--checkbox-size',
        '--radio-dot-size',
        '--radio-row-height',
        '--list-row-height-min',
        '--book-list-row-height-min',
        '--library-entry-row-height-min',
        '--deck-inset-x',
        '--deck-peek-y',
        '--deck-depth',
        '--book-cover-aspect',
        '--book-cover-w-sm',
        '--book-cover-w-md',
        '--book-cover-w-xl',
        '--book-cover-h-xl',
        '--book-cover-radius-xl',
        '--library-shelf-cover-aspect',
        '--library-shelf-block-size',
        '--library-shelf-indicator-gap',
        '--library-shelf-item-gap',
        '--reading-now-text-gap',
        '--reading-now-progress-height',
        '--section-header-action-hit',
        '--prompt-pill-height-min',
        '--prompt-pill-pad-block',
        '--prompt-pill-pad-inline',
        '--prompt-pill-gap',
        '--prompt-pill-text-size',
        '--prompt-pill-text-line',
        '--prompt-tag-size',
        '--prompt-phase-tag-bg',
        '--prompt-phase-tag-fg',
        '--prompt-phase-tag-gap',
        '--home-header-block-size',
        '--home-header-pad-block-start',
        '--home-wordmark-offset-block',
        '--home-wordmark-offset-inline',
        '--home-wordmark-line',
        '--week-summary-chip-block-size',
        '--week-summary-chip-pad-inline',
        '--week-summary-chip-icon-size',
        '--week-summary-chip-icon-color',
        '--home-character-top',
        '--home-character-overhang',
        '--home-character-aspect',
        '--home-bubble-size',
        '--home-bubble-offset',
        '--home-bubble-pad-block-start',
        '--home-indicator-gap',
        '--home-indicator-bottom-gap',
        '--activity-track-pad',
        '--activity-track-gap',
        '--activity-card-track-size',
        '--carousel-shadow-inset',
        '--carousel-shadow-inset-block-end',
        '--activity-card-size',
        '--activity-card-back-size',
        '--activity-card-prompts-size',
        '--activity-card-pad',
        '--activity-card-pad-bottom',
        '--activity-card-row-gap',
        '--activity-card-back-gap',
        '--activity-card-back-pad-bottom',
        '--activity-card-tag-pad-inline',
        '--activity-card-tag-line',
        '--activity-card-book-title-line',
        '--activity-card-book-author-line',
        '--activity-card-title-size',
        '--activity-card-book-size',
        '--activity-card-book-gap',
        '--activity-card-cover-shadow',
        '--activity-card-flip-size',
        '--activity-card-flip-color',
        '--activity-card-action-size',
        '--activity-card-action-gap',
        '--activity-card-action-pad-inline',
        '--activity-card-action-label-size',
        '--activity-card-action-label-line',
        '--activity-card-save-size',
        '--activity-card-save-bg',
        '--activity-card-save-pad-inline',
        '--activity-card-save-gap',
        '--activity-card-save-icon-inline-size',
        '--activity-card-save-icon-block-size',
        '--activity-card-save-star-color',
        '--activity-card-note-pad-block',
        '--activity-card-note-pad-inline',
        '--sheet-radius-top',
        '--sheet-inset-inline',
        '--sheet-inset-block-end',
        '--sheet-inset-radius',
        '--sheet-inset-pad',
        '--sheet-content-shadow-inset-block-end',
        '--sheet-content-shadow-inset-inline',
        '--sheet-content-shadow-inset-inline-cover',
        '--sheet-content-shadow-inset-block-start-cover',
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
