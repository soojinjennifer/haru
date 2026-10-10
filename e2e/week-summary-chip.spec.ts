/**
 * 주간 집계 칩 — **Home 헤더와 Library 헤더가 같아야 한다** (사용자 지시 2026-10-10:
 * *"Library 에 있는 것과 Home 에 있는 것을 동일한 디자인, 아이콘도 동일하게 맞추고"*).
 *
 * 두 화면은 이미 **같은 컴포넌트**(`WeekSummaryChip`)를 썼다. 갈라진 원인은 외형 CSS 가
 * `.haru-home-top-bar` 범위에 묶여 있어서 Library 에서는 공유 `Tag` 기본값(높이 26 ·
 * padding 12 · icon 16 · 아이콘색 `currentColor`)으로 렌더된 것이다.
 *
 * jsdom 은 외부 CSS 를 적용하지 않으므로 **기하·색은 여기서만** 검증된다. 소스 쪽 가드는
 * `apps/web/__tests__/stage3-css-guards.test.ts` 다.
 *
 * 한쪽만 바뀌면 깨지는 테스트다 — 두 측정값을 **서로** 비교하고, 그 다음 Figma 실측
 * 절대값과도 비교한다(두 쪽이 똑같이 틀리는 경우를 잡기 위해).
 *
 * ## 재질(면·그림자·아이콘 색)은 **값으로 단정**한다 (사용자 지시 2026-10-10)
 *
 * 전에는 `background` 를 **캡처만** 했고 두 화면의 동일성만 비교했다 — 그래서 어떤 값을
 * 넣어도 통과했고 **둘 다 틀린 경우**를 못 잡았다. 그림자는 측정조차 하지 않았다.
 *
 * 무엇을 보증하는가 / 못 하는가:
 *  - `computed` 단정(면·그림자·아이콘 색) = **선언이 결정된 토큰으로 해석된다**는 것. 반투명
 *    면(white 74%)이라 **화면에 찍히는 픽셀**은 뒤에 무엇이 있는지에 따라 달라지므로 픽셀
 *    비교로는 고정할 수 없다. 그래서 여기서는 computed 로 고정한다.
 *  - `토큰 해석값` 비교(`tokenBackground` 등) = **배선**이 결정된 토큰을 가리킨다는 것.
 *    토큰의 **값** 자체는 `packages/design-tokens` 테스트가 고정한다.
 *  - 리터럴 비교(`RENDERED`) = 배선이 **다른 토큰으로 조용히 갈아끼워지는** 경우.
 *    둘 다 있어야 "같은 틀린 값"과 "다른 올바른 토큰"을 모두 잡는다.
 *  - **픽셀 프로브**(아래 두 번째·세 번째 테스트) = 실제로 그려지는 면 색과 그림자 번짐,
 *    그리고 아이콘의 **실 대비**. computed 는 "그릴 의도"만 알려 준다.
 *  - 보증하지 못하는 것: 글리프 모양(= 시각 baseline), 그림자의 미세한 알파 분포,
 *    `prefers-color-scheme` 변형(MVP 에 dark mode 가 없다).
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

import { GALLERY, gotoApp, gotoStable, hideDevPanel, settle } from './support/gallery';
import { contrastRatio, decodePng, parseCssRgb, pixelAt, type Rgb } from './support/pixels';

/** Figma `26:40` 재실측 2026-10-10 — 프레임 145×34, icon `50:161` (x 14, y 10.5) 13×13, gap 6. */
const FIGMA = {
  blockSize: 34,
  padInline: 14,
  iconSize: 13,
  gap: 6,
} as const;

/**
 * 사용자 결정 2026-10-10 의 **결과값**. 토큰 경유 비교와 **함께** 쓴다 (위 주석 참조).
 *
 *  - `background` — Figma `26:40` `glass-fill` `#ffffffbd` = white **74%**
 *    = `--color-surface-glass`. 신규 토큰 없이 완전 일치한다.
 *  - `boxShadowDrop` — Effect Style `HARU/Shadow Rest` 를 **인스턴스가 렌더하는 1겹**
 *    (`--shadow-bubble`). ink 8% 가 computed 에서 `color(srgb …)` 로 나오므로 **offset/blur
 *    부분만** 리터럴로 고정하고 색은 토큰 해석값 비교에 맡긴다.
 *  - `icon` — `--haru-palette-yellow-700`. ⚠️ **Figma 와 다르다** (`50:161` fill `#d0cca1` 은
 *    유리 면에서 1.56:1 로 보이지 않는다) → 허용 차이 등록 대상.
 *
 * 색을 **채널 숫자**로 적는다 — `rgb()` 문자열을 적으면 ① 브라우저의 직렬화 형식(`rgb` ↔
 * `rgba`, 공백)에 묶이고 ② 색 리터럴 금지 lint 에 걸린다. 비교는 `channels()` 로 한다.
 */
const RENDERED = {
  /** white 74% — `--color-surface-glass`. */
  background: { r: 255, g: 255, b: 255, alpha: 0.74 },
  boxShadowDrop: '0px 6px 4px 0px',
  icon: { r: 120, g: 115, b: 60, alpha: 1 },
  /**
   * 유리 면 위 목표 대비.
   *   `[계산]` gradient start 4.62 · mid 4.52 · end 4.30 · 순백 4.85
   *   `[실측]` Home 면 246/250/249 → **4.62** · Library 면 245/250/249 → **4.62**
   * 하한을 4.4 로 둔 이유: 면이 반투명이라 뒤에 오는 gradient 위치에 따라 ±0.1 움직인다.
   * `#d0cca1` 로 되돌리면 1.56 이 되어 크게 깨진다.
   */
  iconContrastMin: 4.4,
} as const;

/** `rgb(…)` / `rgba(…)` 직렬화를 채널 숫자로 되돌린다 (alpha 생략 = 1). */
function channels(value: string): { r: number; g: number; b: number; alpha: number } {
  const parts = value.match(/-?[\d.]+/g);
  if (parts === null || parts.length < 3) throw new Error(`색을 파싱하지 못했다: ${value}`);
  return {
    r: Number(parts[0]),
    g: Number(parts[1]),
    b: Number(parts[2]),
    alpha: parts.length > 3 ? Number(parts[3]) : 1,
  };
}

/**
 * `--shadow-bubble` 번짐 — drop 1겹(`0 6px 4px`)이라 비대칭이다.
 *
 * `[실측]` 2026-10-10, 393×852 · dSF 1 · `box-shadow: none` 주입 전후 Δ:
 *   Home    아래 `29,29,26,26,24,19,16,10,4,3,0,0,0,0` → **10** · 위 `0×12` → **0**
 *           좌 `9,4,3,0…` · 우 `9,4,3,0…` → **3**
 *   gallery 아래 `28,28,26,26,24,16,14,10,4,3,0…` → **10** · 위 `0×14` · 좌우 `10,4,3,0…` → **3**
 *
 * 좌우가 4 가 아니라 **3** 인 것은 pill 이기 때문이다 — 측정선이 상자 세로 가운데를 지나고
 * 그 높이에서 둥근 변의 접선이 사각 상자보다 안쪽에 있다 (사각 면 기준값은 4).
 */
const BLEED = { blockEnd: 10, blockStart: 0, inline: 3 } as const;

interface ChipGeometry {
  blockSize: number;
  padInlineStart: number;
  padInlineEnd: number;
  gap: number;
  iconBoxSize: string;
  iconGlyphSize: string;
  iconColor: string;
  /**
   * 같은 문서에서 `var(--week-summary-chip-icon-color)` 를 해석한 값. 색 리터럴을 테스트에
   * 박지 않기 위한 기준선이다 (토큰 값 자체는 `packages/design-tokens` 테스트가 고정한다 —
   * `--color-icon-session-history` → `--haru-palette-yellow` → Figma `50:161` fill).
   */
  tokenIconColor: string;
  labelColor: string;
  background: string;
  /** 같은 문서에서 `var(--color-surface-glass)` 를 해석한 값 — 배선 비교용. */
  tokenBackground: string;
  boxShadow: string;
  /** 같은 문서에서 `var(--shadow-bubble)` 를 해석한 값 — 배선 비교용. */
  tokenBoxShadow: string;
  fontSize: string;
  label: string;
}

async function measureChip(chip: Locator): Promise<ChipGeometry> {
  await expect(chip).toBeVisible();
  await settle(chip.page());

  return chip.evaluate((wrapper: HTMLElement): ChipGeometry => {
    const tag = wrapper.querySelector('.haru-tag');
    const iconBox = wrapper.querySelector('.haru-tag__icon');
    const label = wrapper.querySelector('.haru-tag__label');
    if (tag === null || iconBox === null || label === null) {
      throw new Error('칩 내부 구조가 바뀌었다');
    }
    const glyph = iconBox.querySelector('.haru-icon') ?? iconBox.firstElementChild;
    if (glyph === null) throw new Error('아이콘 글리프가 없다');

    const tagStyle = globalThis.getComputedStyle(tag);
    const iconRect = iconBox.getBoundingClientRect();
    const glyphRect = glyph.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const round = (value: number): number => Math.round(value * 100) / 100;
    const size = (rect: DOMRect): string => `${round(rect.width)}×${round(rect.height)}`;

    /**
     * 토큰을 **문서가 해석한** 값으로 바꾼다 — 비교 대상이 리터럴이 아니라 토큰이 된다.
     * `property` 를 받으므로 색 말고 그림자도 같은 방법으로 해석된다.
     */
    function resolveToken(
      host: HTMLElement,
      property: 'color' | 'backgroundColor' | 'boxShadow',
      value: string,
    ): string {
      const probe = host.ownerDocument.createElement('span');
      probe.style.position = 'absolute';
      probe.style[property] = value;
      host.append(probe);
      const resolved = globalThis.getComputedStyle(probe)[property];
      probe.remove();
      return resolved;
    }

    return {
      blockSize: round(tag.getBoundingClientRect().height),
      padInlineStart: round(Number.parseFloat(tagStyle.paddingInlineStart)),
      padInlineEnd: round(Number.parseFloat(tagStyle.paddingInlineEnd)),
      // 선언값이 아니라 **아이콘과 라벨 사이의 실측 간격**이다.
      gap: round(labelRect.left - iconRect.right),
      iconBoxSize: size(iconRect),
      iconGlyphSize: size(glyphRect),
      iconColor: globalThis.getComputedStyle(iconBox).color,
      tokenIconColor: resolveToken(wrapper, 'color', 'var(--week-summary-chip-icon-color)'),
      labelColor: globalThis.getComputedStyle(label).color,
      background: tagStyle.backgroundColor,
      tokenBackground: resolveToken(wrapper, 'backgroundColor', 'var(--color-surface-glass)'),
      boxShadow: tagStyle.boxShadow,
      tokenBoxShadow: resolveToken(wrapper, 'boxShadow', 'var(--shadow-bubble)'),
      fontSize: tagStyle.fontSize,
      label: label.textContent ?? '',
    };
  });
}

/**
 * computed `box-shadow` 를 겹 단위로 쪼갠다. 색 함수 안에 쉼표가 있으므로
 * (`color(srgb …)` · `rgba(…)`) **괄호 깊이 0** 의 쉼표만 구분자로 본다.
 * `library-css-guards.test.ts` 가 소스 쪽에서 쓰는 것과 같은 방법이다.
 */
function splitShadowLayers(value: string): string[] {
  const layers: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      layers.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim() !== '') layers.push(current.trim());
  return layers;
}

/**
 * 칩 → 뷰포트 경로에서 **그림자를 자를 수 있는 조상**(`overflow` 가 `visible` 이 아닌 것)을
 * 모은다. `R-SHADOW-1` 이 요구하는 확인을 테스트로 고정하기 위한 것이다.
 */
async function clippingAncestors(chip: Locator): Promise<string[]> {
  return chip.evaluate((wrapper: HTMLElement) => {
    const found: string[] = [];
    for (let node = wrapper.parentElement; node !== null; node = node.parentElement) {
      const style = globalThis.getComputedStyle(node);
      if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
      /*
        이름은 **안정된 것**을 고른다 — Tailwind 유틸리티 클래스 문자열은 무관한 수정에도
        바뀌므로 `data-*` 가 있으면 그것을 쓴다.
      */
      const data = [...node.attributes].find((attribute) => attribute.name.startsWith('data-'));
      const name =
        data === undefined ? `${node.tagName.toLowerCase()}.${node.className}` : `[${data.name}]`;
      found.push(`${name} ${style.overflowX}/${style.overflowY}`);
    }
    return found;
  });
}

/** 화면 안의 칩. gallery 처럼 칩이 여러 개인 자리에서는 호출 측이 범위를 좁힌다. */
function chipOf(page: Page): Locator {
  return page.locator('.haru-week-summary-chip');
}

/** 칩 상자 **안쪽**에서 실제로 그려진 면 색을 읽는다 (반투명 합성 결과 = 실측). */
async function probeSurface(chip: Locator): Promise<Rgb> {
  const tag = chip.locator('.haru-tag');
  const box = await tag.boundingBox();
  if (box === null) throw new Error('칩 상자를 찾지 못했다');
  /*
    아이콘(x 14~27)과 라벨을 피해 **라벨 오른쪽 여백**을 찍는다 — padding 14 의 가운데다.
    y 는 상자 가운데. 1×1 촬영이라 안티앨리어싱에 걸리지 않는 자리를 고른다.
  */
  const png = await chip.page().screenshot({
    clip: {
      x: Math.round(box.x + box.width - FIGMA.padInline / 2),
      y: Math.round(box.y + box.height / 2),
      width: 1,
      height: 1,
    },
  });
  return pixelAt(decodePng(png), 0, 0);
}

/** 네 방향 번짐 프로파일 — 각 배열은 상자 경계에서 **멀어지는 순서**의 Δ 다. */
interface Bleed {
  above: number[];
  below: number[];
  left: number[];
  right: number[];
}

/** 프로브 깊이. `--shadow-bubble` 의 최대 번짐(아래 10)보다 넉넉해야 끝이 보인다. */
const PROBE_DEPTH = 14;

/**
 * 칩 상자 바깥 픽셀이 그림자 때문에 얼마나 달라지는지 **네 방향** 모두 잰다.
 * `box-shadow: none` 주입 **전후**를 비교하므로 뒤에 무엇이 있든 **그림자만** 남는다.
 * `R-SHADOW-1` ⑥ 이 "세로·가로 양쪽" 프로브를 요구한다 — 가로만 보던 탓에 세 번째 클리핑
 * 결함을 놓친 전례가 있다.
 *
 * 상자 주변을 **한 번에** 찍는다 (방향별 8장이 아니라 2장) — 두 촬영 사이에 배경이 바뀔
 * 틈을 줄인다.
 */
async function probeBleed(chip: Locator): Promise<Bleed> {
  const page = chip.page();
  const tag = chip.locator('.haru-tag');
  await tag.scrollIntoViewIfNeeded();
  await settle(page);

  const box = await tag.boundingBox();
  if (box === null) throw new Error('칩 상자를 찾지 못했다');

  const width = Math.round(box.width);
  const height = Math.round(box.height);
  /*
    위·왼쪽 여유는 **뷰포트 경계까지만** 잡는다 — Home 의 칩은 y=12 라 14 를 그대로 쓰면
    촬영 영역이 화면을 벗어난다. 위쪽 기대값이 0 이므로 깊이가 줄어도 단정은 유효하다.
  */
  const padAbove = Math.min(PROBE_DEPTH, Math.round(box.y));
  const padLeft = Math.min(PROBE_DEPTH, Math.round(box.x));
  if (padAbove < 1 || padLeft < 1) {
    throw new Error(`프로브 여유가 없다 (위 ${padAbove} · 왼쪽 ${padLeft})`);
  }
  const region = {
    x: Math.round(box.x) - padLeft,
    y: Math.round(box.y) - padAbove,
    width: width + padLeft + PROBE_DEPTH,
    height: height + padAbove + PROBE_DEPTH,
  };

  const withShadow = decodePng(await page.screenshot({ clip: region }));
  await page.addStyleTag({
    content: '.haru-week-summary-chip .haru-tag { box-shadow: none !important; }',
  });
  await settle(page);
  const withoutShadow = decodePng(await page.screenshot({ clip: region }));

  const delta = (x: number, y: number): number => {
    const a = pixelAt(withShadow, x, y);
    const b = pixelAt(withoutShadow, x, y);
    return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
  };

  /** 상자 안쪽 가운데 (local 좌표계 — 상자 좌상단이 `padLeft, padAbove` 다). */
  const midX = padLeft + Math.floor(width / 2);
  const midY = padAbove + Math.floor(height / 2);
  const walk = (depth: number, at: (step: number) => [number, number]): number[] =>
    Array.from({ length: depth }, (_unused, step) => delta(...at(step)));

  return {
    above: walk(padAbove, (step) => [midX, padAbove - 1 - step]),
    below: walk(PROBE_DEPTH, (step) => [midX, padAbove + height + step]),
    left: walk(padLeft, (step) => [padLeft - 1 - step, midY]),
    right: walk(PROBE_DEPTH, (step) => [padLeft + width + step, midY]),
  };
}

/** `deltas` 에서 **마지막으로 0 이 아닌** 지점의 거리(1-based). 전부 0 이면 0. */
function bleedExtent(deltas: number[]): number {
  let last = 0;
  deltas.forEach((delta, index) => {
    if (delta > 0) last = index + 1;
  });
  return last;
}

/** Home 에 착지한다 — 기본 `me` 는 온보딩을 마친 사용자다. */
async function logIn(page: Page): Promise<void> {
  await gotoApp(page, '/auth/log-in');
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.locator('.haru-activity-track')).toBeVisible();
}

test.describe('주간 집계 칩이 Home 과 Library 에서 같다', () => {
  test('기하 · 아이콘 크기 · 아이콘 색 · gap 이 두 화면에서 동일하고 Figma 26:40 과 맞는다', async ({
    page,
  }) => {
    await logIn(page);
    const home = await measureChip(chipOf(page));
    const homeClippers = await clippingAncestors(chipOf(page));

    /*
      **새 `goto` 는 인증을 잃으므로** 탭으로 이동한다 (실제 사용자 경로이기도 하다).
      같은 SPA 수명 안에서 이동하므로 칩의 값(`sessionsThisWeek`)도 같은 창을 본다.
    */
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Library' })
      .click();
    await expect(page).toHaveURL(/\/library$/);
    const library = await measureChip(chipOf(page));

    // ① 두 화면이 서로 같다 — 한쪽만 바뀌면 여기서 깨진다.
    expect(library).toEqual(home);

    // ② 두 쪽이 똑같이 틀리는 경우를 잡는다 — Figma 실측 절대값.
    expect(home.blockSize).toBe(FIGMA.blockSize);
    expect(home.padInlineStart).toBe(FIGMA.padInline);
    expect(home.padInlineEnd).toBe(FIGMA.padInline);
    expect(home.gap).toBe(FIGMA.gap);
    expect(home.iconBoxSize).toBe(`${FIGMA.iconSize}×${FIGMA.iconSize}`);
    expect(home.iconGlyphSize).toBe(`${FIGMA.iconSize}×${FIGMA.iconSize}`);
    expect(home.iconColor).toBe(home.tokenIconColor);
    // 아이콘만 색이 다르다 — 라벨은 본문색을 유지한다 (`A-23`-icon).
    expect(home.labelColor).not.toBe(home.iconColor);

    /*
      ③ **재질** — 결정값과 직접 단정한다 (사용자 결정 2026-10-10 ①·②).
      배선(토큰 경유)과 리터럴을 **둘 다** 본다: 앞은 "다른 토큰으로 갈아끼움", 뒤는
      "둘 다 똑같이 틀림" 을 잡는다. 반투명이라 픽셀로는 고정할 수 없다 (파일 머리 주석).
    */
    expect(home.background).toBe(home.tokenBackground);
    expect(channels(home.background)).toEqual(RENDERED.background);
    expect(home.boxShadow).toBe(home.tokenBoxShadow);
    expect(channels(home.iconColor)).toEqual(RENDERED.icon);

    /*
      그림자가 **1겹 + inset 2겹**이다 (`V-10` 과 같은 상황 — Effect Style 정의는 5겹이지만
      인스턴스는 1겹만 렌더한다). 겹이 늘면 번짐이 10 → 77 로 커져 `R-SHADOW-1` 재검토가
      필요하므로 여기서 막는다. 색은 computed 에서 `color(srgb …)` 로 풀리므로 offset/blur 만
      리터럴로 고정한다.
    */
    const layers = splitShadowLayers(home.boxShadow);
    expect(layers.filter((layer) => layer.includes('inset'))).toHaveLength(2);
    const drops = layers.filter((layer) => !layer.includes('inset'));
    expect(drops).toHaveLength(1);
    expect(drops[0]).toContain(RENDERED.boxShadowDrop);

    /*
      `R-SHADOW-1` — 칩 → 뷰포트 경로의 클리핑 조상은 **AppShell 스크롤 상자 하나뿐**이다.

      ⚠️ 측정으로 정정된 사실: "칩 경로에 `overflow` 선언이 0 건" 은 **CSS 파일**에만
      해당한다. `AppShell` 의 스크롤 뷰포트가 Tailwind 유틸리티(`overflow-y-auto`)로 선언되어
      있고, `overflow-y` 가 `visible` 이 아니면 `overflow-x` 도 `visible` 로 남지 못하므로
      computed 가 `auto/auto` 다 (Stage 2 에서 같은 함정을 겪었다 — `rules/frontend.md`
      `R-SHADOW-1`).

      그래도 자리 보정이 필요하지 않은 이유는 **클립 선이 화면 밖**이라는 것이다
      (`R-SHADOW-1` ④): 이 상자는 뷰포트 전 폭·전 높이를 덮고, 칩은 그 안쪽 상단에 있다.
      칩 우변은 gutter 24 만큼 떨어져 있어 좌우 번짐 4 가 들어가고, 위쪽 번짐은 0 이다.
      **추정이 아니라** 아래 `probeBleed` 테스트가 네 방향을 직접 재서 확인한다.

      목록을 `[]` 가 아니라 **이 하나**로 고정하므로, 화면 CSS 가 새 `overflow` 박스를
      더하면 여기서 깨진다.
    */
    const appShellViewport = ['[data-app-shell-viewport] auto/auto'];
    expect(homeClippers).toEqual(appShellViewport);
    expect(await clippingAncestors(chipOf(page))).toEqual(appShellViewport);
  });

  test('칩은 조상 화면에 의존하지 않는다 — dev gallery 에서도 같은 기하다', async ({ page }) => {
    await logIn(page);
    const home = await measureChip(chipOf(page));

    /* gallery 는 인증이 필요 없고 TopBar 조상도 없다 — 그래서 좋은 대조군이다. */
    await gotoStable(page, GALLERY.components);
    const gallery = await measureChip(
      page.locator('[data-demo="s3-week-summary-chip"] .haru-week-summary-chip').first(),
    );

    expect(gallery.blockSize).toBe(home.blockSize);
    expect(gallery.padInlineStart).toBe(home.padInlineStart);
    expect(gallery.gap).toBe(home.gap);
    expect(gallery.iconBoxSize).toBe(home.iconBoxSize);
    expect(gallery.iconGlyphSize).toBe(home.iconGlyphSize);
    expect(gallery.iconColor).toBe(home.iconColor);
    // 재질도 조상과 무관하다 — gallery 는 TopBar 도 앱 gradient 조상도 아니다.
    expect(gallery.background).toBe(home.background);
    expect(gallery.boxShadow).toBe(home.boxShadow);
    expect(channels(gallery.background)).toEqual(RENDERED.background);
    expect(channels(gallery.iconColor)).toEqual(RENDERED.icon);
  });
});

/**
 * computed 가 보증하지 못하는 두 가지를 **픽셀로** 잡는다.
 *  ① 반투명 면이 실제로 합성되어 그려지는 색과, 그 위에서 아이콘의 **실 대비**
 *  ② 그림자가 실제로 그려지고 **잘리지 않는** 것 (`R-SHADOW-1`)
 *
 * 대비는 아이콘 **computed 색**과 **찍힌 면 색**으로 계산한다. 글리프를 직접 찍지 않는 이유:
 * `50:161` 은 13px 채움 path 로 획 두께가 ~1px 이라 거의 모든 픽셀이 안티앨리어싱 혼합이고,
 * 그 혼합값으로 대비를 재면 실제보다 낮게 나온다. 혼합되지 않은 **원색**은 computed 쪽이다.
 */
test.describe('칩 재질이 화면에 실제로 그려진다 (픽셀 프로브)', () => {
  test('유리 면 위 아이콘 대비가 목표(약 4.5:1)를 넘는다 — Home · Library', async ({ page }) => {
    await hideDevPanel(page);
    await logIn(page);

    const measurements: { screen: string; surface: Rgb; ratio: number }[] = [];
    const record = async (screen: string): Promise<void> => {
      const chip = chipOf(page);
      const icon = parseCssRgb((await measureChip(chip)).iconColor);
      const surface = await probeSurface(chip);
      measurements.push({ screen, surface, ratio: contrastRatio(icon, surface) });
    };

    await record('home');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Library' })
      .click();
    await expect(page).toHaveURL(/\/library$/);
    await record('library');

    for (const { screen, surface, ratio } of measurements) {
      expect(
        ratio,
        `${screen}: 면 ${surface.r}/${surface.g}/${surface.b} 위 대비 ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(RENDERED.iconContrastMin);
      // 면이 **밝은 유리**로 그려졌다 — 불투명 dusk(`#c7c9d7`, 199/201/215)로 돌아가면 깨진다.
      expect(Math.min(surface.r, surface.g, surface.b)).toBeGreaterThan(230);
    }
  });

  /**
   * 번짐을 네 방향으로 재고 **잘리지 않았는지** 본다 (`R-SHADOW-1` ⑥).
   * `Home` 은 `AppShell` 스크롤 상자(`[data-app-shell-viewport]`) 안이고, `gallery` 는 조상
   * 구조가 전혀 다르다 (`dev.css` 에 스크롤 상자가 여럿 있지만 **이 데모 경로에는 하나도
   * 걸리지 않는다** — 실측 결과 클리핑 조상 0건). 두 쪽을 같은 잣대로 잰다.
   */
  const bleedCases = [
    {
      name: 'Home (AppShell 스크롤 상자 안)',
      open: async (page: Page): Promise<Locator> => {
        await logIn(page);
        return chipOf(page);
      },
    },
    {
      name: 'dev gallery (조상 구조가 다르다)',
      open: async (page: Page): Promise<Locator> => {
        await gotoStable(page, GALLERY.components);
        const chip = page
          .locator('[data-demo="s3-week-summary-chip"] .haru-week-summary-chip')
          .first();
        await expect(chip).toBeVisible();
        return chip;
      },
    },
  ] as const;

  for (const { name, open } of bleedCases) {
    test(`그림자가 아래 10 · 위 0 으로 그려지고 잘리지 않는다 — ${name}`, async ({ page }) => {
      await hideDevPanel(page);
      const chip = await open(page);
      const clippers = await clippingAncestors(chip);
      const bleed = await probeBleed(chip);
      const note = `클리핑 조상 [${clippers.join(' | ')}] · 아래 ${bleed.below.join(',')} · 위 ${bleed.above.join(',')} · 좌 ${bleed.left.join(',')} · 우 ${bleed.right.join(',')}`;

      // ① 그림자가 실제로 그려진다 — 선언만 있고 안 보이는 경우를 잡는다.
      expect(bleedExtent(bleed.below), note).toBeGreaterThan(0);

      /*
        ② 아래로 **약 10** 까지 번진다. 잘렸다면 여기서 뚝 끊긴다 (전례: 보정 없는
        스크롤 상자에서 `22 0 0 0 …` = 완전 절단). ±2 는 경계 픽셀 반올림 여유다.
      */
      expect(bleedExtent(bleed.below), note).toBeGreaterThanOrEqual(BLEED.blockEnd - 2);
      expect(bleedExtent(bleed.below), note).toBeLessThanOrEqual(BLEED.blockEnd + 2);

      /*
        ③ 위로는 번지지 않는다 — drop offset 이 `0 6px` blur 4 라 위쪽 번짐이 0 이다.
        3겹(`--shadow-glass-rest`)으로 바뀌면 위로 22 번져 여기서 깨진다.
      */
      expect(bleedExtent(bleed.above), note).toBeLessThanOrEqual(BLEED.blockStart + 1);

      /*
        ④ 좌우로 **3** 번진다 (pill 이라 사각 면 기준 4 보다 1 적다 — `BLEED` 주석).
        **가로도 재는** 이유는 한쪽 축만 보던 테스트가 다른 축의 절단을 놓친 전례가 있기
        때문이다 (`e2e/shadow.spec.ts` 가 가로만 봐서 세로 절단을 놓쳤다 — `R-SHADOW-1` ⑥).
        0 이면 좌우가 잘렸다는 뜻이다.
      */
      expect(bleedExtent(bleed.left), note).toBeGreaterThan(0);
      expect(bleedExtent(bleed.right), note).toBeGreaterThan(0);
      expect(bleedExtent(bleed.left), note).toBeLessThanOrEqual(BLEED.inline + 2);
      expect(bleedExtent(bleed.right), note).toBeLessThanOrEqual(BLEED.inline + 2);
    });
  }
});
