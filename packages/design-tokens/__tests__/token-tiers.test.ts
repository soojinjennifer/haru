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
  /*
   * 34 = 30 + `--haru-white-a82` + `--haru-white-a85` + **`--haru-palette-yellow-700`**
   *      + **`--haru-gray-2`** (Stage 4 `D4-16` · 가값 `P-25` — Semantic 쪽이 주석을 갖는다).
   * 마지막 1종은 칩 아이콘 대비 교정(사용자 결정 2026-10-10 ②)에서 추가됐다 — Figma palette
   * 밖의 값이므로 허용 차이 등록 대상이고, 그래서 **개수가 늘면 눈에 걸리도록** 여기서 센다.
   * 35 = + **`--haru-gray-6`** (Stage 4b `S4-G2` — Drawer 캐러셀 화살표 비활성 fill `#f2f2f7`, `86:324`).
   * 36 = + **`--haru-mist-300`** (Stage 5 `T5-1` — Figma 빈 별 fill `#d6dedc`, `91:702`, `D5-4`).
   * 37 = + **`--haru-violet-67`** (Stage 7 `T7-1` — Figma **변수** `color/violet/67` `#ac93c4`, `163:2607`, `D7-5`).
   */
  it('palette 색 37개 + status 8개 — 30 + white a82 · a85 + yellow-700 + gray-2 · gray-6 + mist-300 + violet-67', () => {
    const colors = primitives.filter((d) => d.file === 'src/primitive/color.css');
    expect(colors.filter((d) => !d.name.startsWith('--haru-status-'))).toHaveLength(37);
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
  it('semantic color 가 86개다 — 67 + Home 재구현 5 + 칩 아이콘 1 + 세션 neutral 2 + 메달리온 링 1 + Drawer 3 + Stage 7 7 (--gradient-app 제외)', () => {
    const colors = semantics.filter((d) => d.name.startsWith('--color-'));
    // Stage 4b `S4-G2`: `--color-surface-drawer`(`T-1`) · `--color-carousel-arrow` · `-disabled` (`86:324`)
    // Stage 7 `S7-B` (+7): `--color-growth-theme-*` 4 (`T7-1`) · `--color-fg-quaternary` (`T7-6`) ·
    //   `--color-surface-moment` · `--color-border-moment` (`T7-7`).
    expect(colors).toHaveLength(86);
  });

  /*
   * Stage 4 `D4-16` (Design Spec `T-13`) — 이름이 `--color-action-secondary-*` 가 **아니다**.
   * 그 이름은 `glass` Button 면·라벨(가값 `P-11`)이며 값이 바뀌면 안 된다 (AC-4-119 ⓐ).
   */
  it('세션 Discard 면이 gray-2 Primitive 를 거치고 glass Button 토큰은 그대로다 (AC-4-119)', () => {
    expect(byName.get('--haru-gray-2')?.value).toBe('#aeaeb2');
    expect(byName.get('--color-action-neutral-bg')?.value).toBe('var(--haru-gray-2)');
    expect(byName.get('--color-action-neutral-fg')?.value).toBe('var(--haru-white)');
    expect(byName.get('--color-action-secondary-bg')?.value).toBe('var(--color-surface-glass)');
    expect(byName.get('--color-action-secondary-fg')?.value).toBe('var(--haru-ink-600)');
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
    expect(byName.get('--haru-palette-yellow')?.value).toBe('#d0cca1');
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
  /*
   * Stage 4 `S4-F1`(세션 `ready`)에서 **31종 추가** → 183.
   *  RecordControl 11 · 세션 버블 8 · 세션 pill 밀도 4 · 하단 바 3 · 세로 배치 5
   *  (Stage 4 Design Spec §5.2 `T-6`·`T-8`·`T-9`·`T-10`·`T-12`·`T-14` + 4b Spec `T-21`).
   *
   * Stage 4b `S4-F1R` 에서 **2종 추가** → 185 (4b Spec §5.3).
   *  `--icon-button-fg` (T-29, `D4-62` glass 글리프 색) · `--icon-button-icon-size-close` (T-30, `VG-F1-01`).
   *
   * Stage 4b `S4-F2`(recording · paused)에서 **28종 추가** → 213 (4b Spec §5.2 `T-15`~`T-18` · `T-20` · `T-21`).
   *  Button sm 9(`T-16` 7 + 아이콘 stroke · hit) · 세로 배치 3(`T-21`) + breathing 1(Stage 4 Spec §6.3) ·
   *  경과 시간 2(`T-15`) · 상태 pill 5(`T-17`) · 책 칩 6(`T-18`) · RecordControl 변형 2(`T-20`).
   *
   * Stage 4b `S4-G1`(Prompts 팝업 `296:1257`)에서 **4종 추가** → 217 (4b Spec §5.2 `T-19`, `D4-58` CP-1).
   *  padding 위·아래 14 · ring 아래 6 · `See all` 14 / 17.
   *
   * Stage 4b `S4-G2`(Prompt Drawer `88:960`)에서 **19종 추가** → 236 (Stage 4 Spec §3.2 · `T-10`).
   *  Sheet `floating` 8(inset 2 · padding 3 · gap · 핸들 2) · 캐러셀 6(pill 3 · gap · 화살표 2) · 코칭 노트 5.
   *  `--prompt-carousel-bar-width` 는 `D4-71` 로 삭제했다 (pill = 본문 100%).
   *
   * Stage 4b `S4-K1`(짧은 세로 압축, `D4-58` CP-7)에서 **1종 추가** → 237.
   *  메달리온 링 compact 152.
   * `S4-K1` 후속(`D4-78` · `D4-81`)에서 **2종 추가** → 239. ready 버블 아래 14.4 · stage 하한 205.
   *
   * Stage 4b `S4-H1`(완료 화면 `29:62`)에서 **19종 추가** → 258 (Stage 4 Spec §2.7 · §6.4).
   *  배치 5 · 버블 폭 · 모션 5 · 출석 스티커 8.
   *
   * Stage 5 `S5-B`(회고 카드 `91:691`)에서 **12종 추가** → 273 (Stage 5 Spec §5.2 `T5-2`~`T5-11`, `D5-4`).
   *  카드 7(`T5-2`~`T5-8`) · 별 2(`T5-9`) · 입력 2(`T5-10` + padding) · Chip select border 1(`T5-11`).
   * `S5-B` 후속 `VG5B-1` ⓑ(사용자 결정 2026-11-08)에서 **1종 추가** → 274. Chip `select` 라벨 12.5 (Figma `90:611`).
   *
   * Stage 6 `S6-E1`(DiamondChart, Stage 6 Spec §5.2 `T6-1`~`T6-3` · `T6-5` 굵기 · `T6-7` · `T6-8`, `D6-8`)에서 **7종 추가** → 281.
   * Stage 6 `S6-H`(QA 2차 결정 `D6-10` ② ③ — 언어 카드 radius 30 · 섹션 라벨 자간 0.72 · 독서 루틴 라벨 위 7)에서 **3종 추가** → 284.
   * Stage 7 `S7-B`(Stage 7 Spec §5.2 `T7-4`~`T7-15`, `D7-5`)에서 **38종 추가** — 색(`color-mix`)은 Tier 2 에 있다.
   * Stage 7 `D7-6` ①(`VG7-B-03` ⓑ — 막대 라벨 줄 높이 11)에서 **1종 추가** → 324.
   */
  it('Tier 3 토큰 324개를 전부 정의한다 (Home 재구현 + Visual Gap 교정·3차 + 버블 닫기 + 그림자 inset + Library 1라운드 + 표지 그림자 자리 + 세션 ready + S4-F1R + S4-F2 + S4-G1 + S4-G2 + S4-K1 + S4-H1 + S4-H1R + S5-B + S6-E1 + S6-H + S7-B + D7-6)', () => {
    expect(components.map((d) => d.name).sort()).toEqual(
      [
        '--bar-chart-block-size',
        '--bar-chart-pad-block-start',
        '--bar-chart-gap',
        '--bar-chart-label-gap',
        '--bar-chart-bar-width',
        '--bar-chart-bar-radius',
        '--bar-chart-empty-size',
        '--bar-chart-label-line',
        '--stat-tile-value-size',
        '--stat-tile-pad-block',
        '--stat-tile-pad-inline',
        '--stat-tile-gap',
        '--stat-tile-row-block-size',
        '--weekly-total-size',
        '--weekly-total-line',
        '--weekly-total-tracking',
        '--moment-card-gap',
        '--moment-quote-size',
        '--moment-quote-line',
        '--moment-eyebrow-tracking',
        '--report-card-icon-tile-size',
        '--report-card-icon-size',
        '--report-card-icon-tile-radius',
        '--report-card-progress-height',
        '--chart-previous-width',
        '--chart-previous-dash',
        '--chart-legend-swatch',
        '--progress-character-top',
        '--progress-character-aspect',
        '--progress-character-overlap',
        '--progress-character-overhang',
        '--week-picker-chip-block-size',
        '--week-picker-chip-pad-inline',
        '--week-picker-chip-gap',
        '--week-picker-chip-icon-size',
        '--week-picker-chip-hit-size',
        '--persona-rail-width',
        '--persona-rail-line',
        '--clip-row-gap',
        '--choice-card-radius',
        '--section-label-letter-spacing',
        '--child-routine-label-offset',
        '--chart-diamond-radius-max',
        '--chart-diamond-label-max',
        '--chart-diamond-label-gap',
        '--chart-stroke-width',
        '--chart-missing-dash',
        '--chart-vertex-size',
        '--chart-selected-ring',
        '--reflection-card-radius',
        '--reflection-card-width',
        '--reflection-card-gutter',
        '--reflection-card-offset',
        '--reflection-card-bottom-gap',
        '--reflection-card-title-line',
        '--reflection-chip-gap',
        '--rating-star-size',
        '--rating-star-gap',
        '--input-height',
        '--input-padding-x',
        '--chip-select-border-width',
        '--chip-select-label-size',
        '--session-complete-title-offset',
        '--session-complete-title-gap',
        '--session-complete-ring-gap',
        '--session-complete-ring-size',
        '--session-complete-bubble-offset',
        '--bubble-complete-width',
        '--bubble-complete-subtext-line',
        '--session-complete-ring-pop-scale',
        '--session-complete-enter-scale',
        '--session-complete-enter-shift',
        '--session-complete-bubble-delay',
        '--session-complete-sticker-delay',
        '--attendance-sticker-width',
        '--attendance-sticker-height',
        '--attendance-sticker-pad-start',
        '--attendance-sticker-pad-end',
        '--attendance-sticker-gap',
        '--attendance-sticker-tile-size',
        '--attendance-sticker-icon-inset',
        '--attendance-sticker-text-gap',
        '--attendance-sticker-title-size',
        '--attendance-sticker-title-line',
        '--button-height-md',
        '--button-height-lg',
        '--button-padding-x',
        '--button-padding-y-md',
        '--button-gap',
        '--button-radius',
        '--button-label-size',
        '--button-height-sm',
        '--button-padding-inline-start-sm',
        '--button-padding-inline-end-sm',
        '--button-gap-sm',
        '--button-icon-size-sm',
        '--button-label-size-sm',
        '--button-shadow-sm',
        '--button-icon-stroke-sm',
        '--button-hit-size-sm',
        '--icon-button-size',
        '--icon-button-icon-size',
        '--icon-button-hit-size',
        '--icon-button-fg',
        '--icon-button-icon-size-close',
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
        '--record-size',
        '--record-ring-mid-size',
        '--record-core-size',
        '--record-icon-size',
        '--record-stroke',
        '--record-ring-opacity-outer',
        '--record-ring-opacity-inner',
        '--record-label-size',
        '--record-icon-offset-labeled',
        '--record-pulse-opacity',
        '--record-pulse-scale',
        '--bubble-session-width',
        '--bubble-session-pad-block-end',
        '--bubble-session-title-line',
        '--bubble-tail-session-size',
        '--bubble-tail-session-shape',
        '--bubble-tail-session-rotate',
        '--bubble-tail-session-skew',
        '--bubble-tail-session-overhang',
        '--prompt-pill-session-height-min',
        '--prompt-pill-session-pad-block',
        '--prompt-pill-session-pad-inline',
        '--prompt-pill-session-tag-gap',
        '--session-action-bar-gap',
        '--session-action-button-width',
        '--session-action-bar-width',
        '--session-top-row-offset',
        '--session-medallion-offset',
        '--session-medallion-ring-size',
        '--session-medallion-ring-size-compact',
        '--session-bubble-bottom-gap',
        '--session-stage-min-block-size',
        '--session-bubble-offset',
        '--session-bottom-gap',
        '--session-book-chip-offset',
        '--session-status-block-offset',
        '--session-status-block-gap',
        '--session-breathing-scale',
        '--session-timer-size',
        '--session-timer-line',
        '--session-state-pill-pad-inline',
        '--session-state-pill-pad-block',
        '--session-state-pill-gap',
        '--session-state-dot-size',
        '--session-state-dot-stroke',
        '--session-book-chip-height',
        '--session-book-chip-pad-inline',
        '--session-book-chip-gap',
        '--session-book-cover-width',
        '--session-book-cover-height',
        '--session-book-cover-radius',
        '--record-tone-denied',
        '--record-core-shadow-disabled',
        '--prompt-popup-pad-block',
        '--prompt-popup-offset-top',
        '--prompt-popup-link-size',
        '--prompt-popup-link-line',
        '--sheet-floating-inset',
        '--sheet-floating-inset-block-end',
        '--sheet-floating-exit-shadow-reach',
        '--sheet-floating-pad-block-start',
        '--sheet-floating-pad-block-end',
        '--sheet-floating-pad-inline',
        '--sheet-floating-gap',
        '--sheet-floating-grabber-width',
        '--sheet-floating-grabber-margin',
        '--prompt-carousel-bar-height',
        '--prompt-carousel-bar-margin-block-start',
        '--prompt-carousel-bar-margin-block-end',
        '--prompt-carousel-gap',
        '--prompt-carousel-arrow-size',
        '--prompt-carousel-arrow-hit',
        '--prompt-drawer-note-min-height',
        '--prompt-drawer-note-pad-inline',
        '--prompt-drawer-note-pad-block-start',
        '--prompt-drawer-note-pad-block-end',
        '--prompt-drawer-note-line',
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
