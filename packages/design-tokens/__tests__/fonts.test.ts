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
    // Stage 2-UI 에서 Tier 3 4종 추가 (list-row · deck 3종) → 52 (stage-2 Design Spec §4.2 · §4.3).
    // Stage 3 에서 6종 추가 (book-cover 2 · prompt-pill 1 · prompt-phase-tag 3) → 58 (§6.2).
    // Stage 3 Home 재구현(2026-10-05 Figma 재대조)에서 56종 순증 → 114.
    // (bubble +10 · home 10 · activity track/card 33 · prompt-pill/tag 6, bubble 2종 제거)
    // Visual Gap 교정(§20)에서 13종 추가 → 127 (워드마크 3 · 칩 3 · 카드 6 · 버블 1).
    // 버블 닫기 버튼(사용자 지시 2026-10-05)으로 1종 추가 → 128.
    // 카드 그림자 클리핑 수정(approvals §12.15 `D-REQ-4`)으로 2종 추가 → 130
    // (`--carousel-shadow-inset` · `--carousel-shadow-inset-block-end`).
    // Visual Gap 3차 결정(approvals §13)으로 2종 추가 → 132
    // (`--week-summary-chip-icon-color` `A-23`-icon · `--bubble-content-max-lines` `W-5`).
    // Library 1라운드에서 19종 추가 · 1종 제거 → 150 (Library Design Spec §5.2 `LT-3`~`LT-14`
    // + §8.1 inset 레시피 2종. 제거는 `--activity-card-cover-radius` — 간격 토큰 오용을
    // `--book-cover-radius-xl` 로 통합했고 **값 10 은 그대로**라 렌더 변화가 0 이다).
    // Library 2라운드-4(사용자 결정 2026-10-09 ③)에서 1종 추가 → 151
    // (`--sheet-content-shadow-inset-inline-cover` — `--shadow-cover` 좌우 번짐 14 실측).
    // Library 2라운드-5(사용자 결정 2026-10-09 ①)에서 1종 추가 → 152
    // (`--sheet-content-shadow-inset-block-start-cover` — 같은 그림자 **위쪽** 번짐 8 실측.
    //  offset-y +6 때문에 위/아래가 비대칭이라 좌우 토큰과 값을 공유할 수 없다).
    // Stage 4 `S4-F1`(세션 ready)에서 31종 추가 → 183 (RecordControl 11 · 세션 버블 8 ·
    // 세션 pill 밀도 4 · 하단 바 3 · 세로 배치 5 — Stage 4 Design Spec §5.2 · 4b Spec `T-21`).
    // Stage 4b `S4-F1R` 에서 2종 추가 → 185 (`--icon-button-fg` T-29 · `--icon-button-icon-size-close` T-30).
    // Stage 4b `S4-F2` 에서 28종 추가 → 213 (4b Spec §5.2 `T-15`~`T-18` · `T-20` · `T-21` + Button sm 2 · breathing 1).
    // Stage 4b `S4-G1` 에서 4종 추가 → 217 (4b Spec §5.2 `T-19` — 팝업 padding · 앵커 · `See all` 14/17).
    // Stage 4b `S4-G2` 에서 19종 추가 → 236 (Drawer `88:960` — Sheet floating 8 · 캐러셀 6 · 코칭 노트 5, `D4-71` 로 pill 폭 삭제).
    // Stage 4b `S4-K1` 에서 1종 추가 → 237 (짧은 세로 — 메달리온 링 compact, `D4-58` CP-7).
    // `S4-K1` 후속에서 2종 추가 → 239 (ready 버블 아래 14.4 · stage 하한 205, `D4-78` · `D4-81`). `S4-H1` 19종 → 258. `S4-H1R` 3종 → 261 (보조 줄 19 · 스티커 제목 14/17). `S4-G2MF` 1종 → 262 (floating 닫힘 그림자 번짐 28, `D4-139`).
    // Stage 5 `S5-B` 12종 → 274 (회고 카드 7 · 별 2 · 입력 2 · Chip select border 1 — `T5-2`~`T5-11`, `D5-4`).
    // `S5-B` 후속 `VG5B-1` ⓑ 1종 → 275 (`--chip-select-label-size` 12.5).
    // Stage 6 `S6-E1` 7종 → 282 (DiamondChart `T6-1`~`T6-3` · `T6-5` 굵기 · `T6-7` · `T6-8` 2, `D6-8`).
    // Stage 6 `S6-H` 3종 → 285 (`--choice-card-radius` · `--section-label-letter-spacing` · `--child-routine-label-offset`, `D6-10`). Stage 8 `S8-F` 에서 마지막 것을 `--section-label-offset` 으로 이름만 바꿨다(`VG6-H-09` A — 개수 변화 0).
    // Stage 7 `S7-B` 38종 → 323 (Stage 7 Spec §5.2 `T7-4`~`T7-15`, `D7-5` — 색 `color-mix` 는 Tier 2).
    // Stage 7 `D7-6` ① `--bar-chart-label-line` 1종 → 324 (`VG7-B-03` ⓑ).
    expect(manifest.counts['component']).toBe(324);
    // 2026-09-22 가값 승인 (stage-1-approvals §9) 후 남은 항목 = P-01 · P-02 · P-04 · P-05 · P-16.
    // Stage 3 에서 P-23(--color-prompt-tag-fg) 신설 (stage-3-approvals §9.2 ⑫).
    // Library 1라운드: **P-05 해제**(scrim 이 Figma 실측값이 되었다 — `L-NEW-09`) ·
    // **P-24 신설**(`--color-fg-tertiary` = ink-400, §20.4).
    expect(Object.keys(manifest.provisionalByItem).sort()).toEqual([
      'P-01',
      'P-02',
      'P-04',
      'P-16',
      'P-23',
      'P-24',
      'P-25',
      'P-30',
      'P-31',
      'P-32',
      'P-33',
      'P-35',
      'P-36',
      'P-37',
      'P-38',
      'P-39',
    ]);
    // 42 − 1 — `--color-scrim` 의 주석이 사라졌다. `--color-fg-tertiary` 는 P-01 → P-24 로
    // **소속만** 바뀌어 총 개수에 영향이 없다.
    // Stage 4 `S4-F1` +3 → 44: `P-25` 신설 2(`--color-action-neutral-bg`·`-fg`, `D4-16`) +
    // `P-16` 1(`--size-medallion-session` 174, `T-11`).
    // Stage 6 `S6-E1` +6 → 50: `P-30` 2(`--chart-area-stroke`·`--chart-grid-stroke`) · `P-31` 1 ·
    // `P-32` 1 · `P-33` 2(`--chart-diamond-radius-max`·`-label-max`) — Stage 6 Spec §5.3 (`D6-8`).
    // Stage 7 `S7-B` +17 → 67: `P-35` 1(`--color-fg-quaternary`) · `P-36` 7(growth 4 · bar 3) ·
    // `P-37` 2(Moment 면·테두리) · `P-38` 4(`--chart-previous-stroke` + 선 굵기·dash·범례 견본) ·
    // `P-39` 3(rail 2 · 클립 행 gap). `P-40`(막대 강조 비율 0.75)은 **JS 규칙**이라 토큰 주석이 없다
    // (`P-17` 선례 — `BarChart` 의 `DEFAULT_EMPHASIS_RATIO` 주석이 갖는다).
    expect(manifest.counts['provisional']).toBe(67);
  });
});
