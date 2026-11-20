/**
 * Stage 7 `S7-B` — Shared UI + 토큰 (Stage 7 Design Spec §3.1 · §3.4 · §3.7 · §3.9 · §5.2, `D7-5`).
 *
 * dev gallery `/__dev/ui/components` 의 `s7-*` 블록을 본다. 화면(`/progress` · 리포트 상세)은 `S7-C` · `S7-D` 다.
 *
 *  ① computed — 토큰 값이 Spec §5.2 와 같다 (`R-FIGMA-1` ④ — CSS grep 이 아니라 computed)
 *  ② BarChart — 높이 비례(`N7-29`) · 강조 16·20 · 스텁 h4 · 라벨 ≥ 11px (AC-7-22 · AC-7-83)
 *  ③ StatTile — 그림자가 잘리지 않는다: 세로(아래) · 가로(오른쪽) 픽셀 프로브 (AC-7-79 타일 · `R-SHADOW-1` ⑥)
 *  ④ ProgressBar 장식 모드 — 접근성 트리에 `progressbar` 0 (AC-7-31 · `M7-11`)
 *  ⑤ 영역 baseline — 새 `s7-*` 블록만. 기존 블록은 `visual.spec.ts` 가 그대로 지킨다 (AC-7-81).
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';
import { demo, GALLERY, gotoStable, hideDevPanel } from './support/gallery';
import { decodePng, maxChannelDelta, pixelAt } from './support/pixels';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
  await gotoStable(page, GALLERY.components);
});

/**
 * 색은 **채널 숫자**로 비교한다 (`week-summary-chip.spec.ts` `channels()` 선례) — 색 리터럴 금지 lint ·
 * 브라우저 직렬화 형식(`rgb` ↔ `rgba` ↔ `color(srgb …)`)에 묶이지 않는다. `color(srgb …)` 는 0..1 → 0..255.
 */
interface Channels {
  r: number;
  g: number;
  b: number;
  alpha: number;
}

function channels(value: string): Channels {
  const parts = value.match(/-?[\d.]+/g);
  if (parts === null || parts.length < 3) throw new Error(`색을 파싱하지 못했다: ${value}`);
  const unit = value.startsWith('color(') ? 255 : 1;
  return {
    r: Math.round(Number(parts[0]) * unit),
    g: Math.round(Number(parts[1]) * unit),
    b: Math.round(Number(parts[2]) * unit),
    alpha: parts.length > 3 ? Number(parts[3]) : 1,
  };
}

/** Figma 선언값 · 토큰 값 (Spec §0.2 · §5.2). */
const C = {
  white90: { r: 255, g: 255, b: 255, alpha: 0.9 },
  white82: { r: 255, g: 255, b: 255, alpha: 0.82 },
  ink700: { r: 74, g: 95, b: 92, alpha: 1 },
  ink600: { r: 94, g: 115, b: 112, alpha: 1 },
  ink500: { r: 125, g: 146, b: 145, alpha: 1 },
  ink400: { r: 154, g: 171, b: 170, alpha: 1 },
  ink300: { r: 179, g: 192, b: 191, alpha: 1 },
  ink18: { r: 94, g: 115, b: 112, alpha: 0.18 },
  teal: { r: 133, g: 191, b: 182, alpha: 1 },
  teal55: { r: 133, g: 191, b: 182, alpha: 0.55 },
  pink: { r: 239, g: 195, b: 212, alpha: 1 },
  blue: { r: 127, g: 174, b: 193, alpha: 1 },
  violet67: { r: 172, g: 147, b: 196, alpha: 1 },
} as const;

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (rect === null) throw new Error('bounding box 없음');
  return rect;
}

test.describe('S7-B computed — 토큰 값 (Spec §5.2)', () => {
  test('StatTile — radius 22 · pad 13/8 · gap 5 · 값 24 Heavy · 라벨 11 Medium · --shadow-bubble · overflow 0', async ({
    page,
  }) => {
    const block = demo(page, 's7-stat-tile');
    const tile = block.locator('.haru-stat-tile').first();
    const surface = tile.locator('.haru-surface');
    const body = tile.locator('.haru-stat-tile__body');
    const value = tile.locator('.haru-stat-tile__value');
    const label = body.locator('.haru-text');

    const s = await surface.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        radius: style.borderTopLeftRadius,
        shadow: style.boxShadow,
        bg: style.backgroundColor,
        overflow: style.overflow,
      };
    });
    expect(s.radius).toBe('22px');
    // `--shadow-bubble` = drop 1겹 `0 6 4` + inset 2겹
    expect(s.shadow.match(/inset/g)?.length).toBe(2);
    expect(s.shadow).toContain('0px 6px 4px 0px');
    expect(channels(s.bg)).toStrictEqual(C.white90);
    expect(s.overflow).toBe('visible');

    const b = await body.evaluate((node) => {
      const style = getComputedStyle(node);
      return [style.paddingTop, style.paddingBottom, style.paddingLeft, style.rowGap];
    });
    expect(b).toStrictEqual(['13px', '13px', '8px', '5px']);

    const v = await value.evaluate((node) => {
      const style = getComputedStyle(node);
      return [style.fontSize, style.fontWeight, style.color];
    });
    expect(v.slice(0, 2)).toStrictEqual(['24px', '860']);
    expect(channels(v[2] ?? '')).toStrictEqual(C.ink700);

    const l = await label.evaluate((node) => {
      const style = getComputedStyle(node);
      return [style.fontSize, style.fontWeight, style.color];
    });
    expect(l.slice(0, 2)).toStrictEqual(['11px', '510']);
    expect(channels(l[2] ?? '')).toStrictEqual(C.ink500);

    // 행(gallery) h84 · 두 타일 폭 같음 · gap 10
    const tiles = block.locator('.haru-stat-tile');
    const [left, right] = [await box(tiles.nth(0)), await box(tiles.nth(1))];
    expect(Math.abs(left.width - right.width)).toBeLessThan(0.5);
    expect(Math.round(right.x - (left.x + left.width))).toBe(10);
    expect(
      Math.round(await box(block.locator('.haru-dev-s7-stat-row')).then((r) => r.height)),
    ).toBe(84);
  });

  test('Surface fill="card" — white 82% + blur 12 (T7-3)', async ({ page }) => {
    const surface = demo(page, 's7-surface-card').locator('.haru-surface');
    const s = await surface.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        bg: style.backgroundColor,
        blur: style.backdropFilter,
        radius: style.borderTopLeftRadius,
      };
    });
    expect(channels(s.bg)).toStrictEqual(C.white82);
    expect(s.blur).toBe('blur(12px)');
    expect(s.radius).toBe('22px');
  });

  test('ProgressBar --progress-fill-color — Growth 4색 = Figma 변수 (T7-1 · T7-2)', async ({
    page,
  }) => {
    const fills = demo(page, 's7-progress-fill').locator('.haru-progress__fill');
    await expect(fills).toHaveCount(4);
    const colors = await fills.evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).backgroundColor),
    );
    // accents/teal #85bfb6 · accents/pink #efc3d4 · accents/blue #7faec1 · color/violet/67 #ac93c4
    expect(colors.map(channels)).toStrictEqual([C.teal, C.pink, C.blue, C.violet67]);
    const track = await demo(page, 's7-progress-fill')
      .locator('.haru-progress__track')
      .first()
      .evaluate((node) => getComputedStyle(node).height);
    expect(track).toBe('8px');
  });

  test('기존 ProgressBar 의 채움 색은 그대로다 (override 미지정 — AC-7-81)', async ({ page }) => {
    const color = await demo(page, 'v7-progress')
      .locator('.haru-progress--accent .haru-progress__fill')
      .first()
      .evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(channels(color)).toStrictEqual(C.teal);
  });
});

test.describe('S7-B BarChart — N7-29 (AC-7-22 · AC-7-83)', () => {
  test('막대 높이 = value / max × 트랙 · 강조 16·20 · 스텁 h4 · 라벨 11px', async ({ page }) => {
    const chart = demo(page, 's7-bar-chart').locator('.haru-bar-chart');
    const chartBox = await box(chart);
    expect(Math.round(chartBox.height)).toBe(110);

    const bars = chart.locator('.haru-bar-chart__bar');
    await expect(bars).toHaveCount(7);
    const heights = await bars.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().height),
    );
    const widths = await bars.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().width),
    );
    expect(new Set(widths.map((w) => Math.round(w)))).toStrictEqual(new Set([16]));

    // 트랙 = 96 − 11(값 라벨 줄) − 6 − 6 − 11(요일 줄) = 62 — 라벨 줄 높이 = Figma leading 1.0 (`VG7-B-03` ⓑ · `D7-6` ①,
    // `--bar-chart-label-line` 11). Figma 63 과 Δ−1 (글자 10/10.5 → 11 흡수분 — `N7-31`).
    const max = heights[5] ?? 0;
    expect(max).toBeCloseTo(62, 0);
    const labelLines = await chart
      .locator('.haru-bar-chart__value, .haru-bar-chart__label')
      .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).lineHeight));
    expect(new Set(labelLines)).toStrictEqual(new Set(['11px']));
    const minutes = [8, 13, null, 16, 11, 20, 4];
    minutes.forEach((value, index) => {
      if (value === null) {
        expect(heights[index]).toBeCloseTo(4, 0);
      } else {
        expect(heights[index]).toBeCloseTo((value / 20) * max, 0);
      }
    });
    // 16m ≠ 20m (Figma 는 상한 63.5 에서 둘 다 잘렸다 — M7-3)
    expect((heights[3] ?? 0) < max).toBe(true);

    const fills = await bars.evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).backgroundColor),
    );
    expect(channels(fills[3] ?? '')).toStrictEqual(C.teal);
    expect(channels(fills[5] ?? '')).toStrictEqual(C.teal);
    expect(channels(fills[0] ?? '')).toStrictEqual(C.teal55);
    expect(channels(fills[2] ?? '')).toStrictEqual(C.ink18);

    // 값 라벨: 강조 ink-600 · 일반 ink-300 · 요일 ink-400 · 전부 ≥ 11px
    const valueColors = await chart
      .locator('.haru-bar-chart__value')
      .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).color));
    expect(channels(valueColors[3] ?? '')).toStrictEqual(C.ink600);
    expect(channels(valueColors[0] ?? '')).toStrictEqual(C.ink300);
    const sizes = await chart
      .locator('.haru-bar-chart__value, .haru-bar-chart__label')
      .evaluateAll((nodes) =>
        nodes.map((node) => Number.parseFloat(getComputedStyle(node).fontSize)),
      );
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(11);

    // 값 라벨은 막대 바로 위 6px 에 붙는다 (Figma 값 라벨 → gap 6 → 막대)
    const valueBox = await box(chart.locator('.haru-bar-chart__value').nth(0));
    const barBox = await box(bars.nth(0));
    expect(Math.round(barBox.y - (valueBox.y + valueBox.height))).toBe(6);
  });

  test('접근성 — list 이름 + listitem 7개 이름 (시각 라벨은 숨김)', async ({ page }) => {
    const list = demo(page, 's7-bar-chart').getByRole('list', {
      name: 'Minutes read each day this week',
    });
    await expect(list.getByRole('listitem')).toHaveCount(7);
    // 접근성 트리 — aria-hidden 시각 라벨(`8m` · `M`)이 빠지고 SR 문장만 남는다.
    await expect(list).toMatchAriaSnapshot(`
      - list "Minutes read each day this week":
        - listitem: Monday, 8 minutes
        - listitem: Tuesday, 13 minutes
        - listitem: Wednesday, no storytime
        - listitem: Thursday, 16 minutes
        - listitem: Friday, 11 minutes
        - listitem: Saturday, 20 minutes
        - listitem: Sunday, 4 minutes
    `);
  });
});

/**
 * `R-SHADOW-1` ⑥ — 세로 · 가로 양쪽 프로브. 같은 지점을 `box-shadow: none` 으로 다시 찍어 비교하므로
 * 배경 gradient 와 무관하다 (`e2e/shadow.spec.ts` 방식). `--shadow-bubble` 번짐 = 아래 10 · 좌우 4 · 위 0.
 */
async function probe(page: Page, surface: Locator, points: readonly { x: number; y: number }[]) {
  async function shot(): Promise<ReturnType<typeof decodePng>> {
    return decodePng(await page.screenshot({ animations: 'disabled' }));
  }
  const withShadow = await shot();
  await surface.evaluate((node) => {
    (node as HTMLElement).style.boxShadow = 'none';
  });
  const without = await shot();
  await surface.evaluate((node) => {
    (node as HTMLElement).style.boxShadow = '';
  });
  return points.map((point) =>
    maxChannelDelta(
      pixelAt(withShadow, Math.round(point.x), Math.round(point.y)),
      pixelAt(without, Math.round(point.x), Math.round(point.y)),
    ),
  );
}

test.describe('S7-B StatTile 그림자 — 잘리지 않는다 (AC-7-79 타일 · R-SHADOW-1)', () => {
  /*
   * 실측 프로파일 (2026-11-19, 393×852 · dSF 1, 가장자리에서 1px 씩, max channel Δ):
   *   아래  `9 9 8 8 7 5 4 3 2 1 0` → 번짐 10 · 오른쪽 `5 3 2 1 0` · 왼쪽 `3 2 1 0` → 4 · 위 `0` (Spec §9.5 와 일치)
   * ⚠ 가로 프로브는 **세로 가운데**에서 잰다 — 아래 모서리 근처는 radius 22 곡선 안이라 그림자가 타일 자신에
   * 가려 0 이 나온다 (첫 시도에서 `bottom − 4` 로 재서 0 이었다).
   */
  test('아래(세로) · 좌우(가로) 번짐이 실제 픽셀로 남는다', async ({ page }) => {
    const surface = demo(page, 's7-stat-tile').locator('.haru-stat-tile .haru-surface').last();
    await surface.scrollIntoViewIfNeeded();
    const r = await box(surface);
    const middle = r.y + r.height / 2;
    const [below, right, left] = await probe(page, surface, [
      // 아래: offset-y 6 · blur 4 → 아래 가장자리 +5 (번짐 10 안)
      { x: r.x + r.width / 2, y: Math.ceil(r.y + r.height) + 4 },
      // 좌우: blur 4 → 가장자리 바로 바깥 1px
      { x: Math.ceil(r.x + r.width), y: middle },
      { x: Math.floor(r.x) - 1, y: middle },
    ]);
    expect(below ?? 0).toBeGreaterThanOrEqual(3);
    expect(right ?? 0).toBeGreaterThanOrEqual(2);
    expect(left ?? 0).toBeGreaterThanOrEqual(2);
  });
});

test.describe('S7-B ProgressBar 장식 모드 (AC-7-31 · M7-11)', () => {
  test('s7-progress-fill 영역 접근성 트리에 progressbar · aria-valuenow 0', async ({ page }) => {
    const block = demo(page, 's7-progress-fill');
    await expect(block.getByRole('progressbar')).toHaveCount(0);
    await expect(block.locator('[aria-valuenow]')).toHaveCount(0);
    await expect(block.locator('.haru-progress[aria-hidden="true"]')).toHaveCount(4);
    // 기존 블록은 여전히 progressbar 를 노출한다 (기본 모드 불변)
    await expect(demo(page, 'v7-progress').getByRole('progressbar').first()).toBeVisible();
  });
});

test.describe('S7-B DiamondChart previous (AC-7-38 렌더 · P-38)', () => {
  test('이전 외곽선 = ink-400 · 1.5px · dash 4 3 · 면 0 · 범례 2항목', async ({ page }) => {
    const block = demo(page, 's7-diamond-previous');
    const stroke = block.locator('.haru-diamond__previous-stroke');
    await expect(stroke).toHaveCount(1);
    const s = await stroke.evaluate((node) => {
      const style = getComputedStyle(node);
      return [style.stroke, style.strokeWidth, style.strokeDasharray, style.fill];
    });
    expect(channels(s[0] ?? '')).toStrictEqual(C.ink400);
    expect(s.slice(1)).toStrictEqual(['1.5px', '4px, 3px', 'none']);
    await expect(block.locator('.haru-diamond__legend')).toHaveText('EarlierThis report');
    await expect(block.locator('.haru-diamond__legend')).toHaveAttribute('aria-hidden', 'true');
  });
});

/** 새 블록만 baseline 을 만든다 — 기존 블록 baseline 은 `visual.spec.ts` 소유이며 불변이어야 한다. */
const S7_BLOCKS = [
  's7-stat-tile',
  's7-bar-chart',
  's7-diamond-previous',
  's7-surface-card',
  's7-progress-fill',
  's7-icons',
] as const;

test.describe('S7-B 영역 baseline (D-12 · R-BASELINE-1)', () => {
  for (const id of S7_BLOCKS) {
    test(id, async ({ page }) => {
      await expect(demo(page, id)).toHaveScreenshot(`${id}.png`, REGION_SNAPSHOT);
    });
  }
});
