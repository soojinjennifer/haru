/**
 * `/progress` — Stage 7 `S7-C` (Figma `31:102` 주간 관찰 + `110:835` 4주 리포트 카드, `D7-1`).
 *
 *  ① 기하 — 393 에서 캐릭터 347×422 @ (24, 4) · 본문 스택 y280 · StatTile 행 84 (Figma `get_metadata` 좌표 − 66 일괄 —
 *     `VG7-C-02` ⓑ · `D7-6` ②) · chip 오른쪽 끝 x369 (`VG7-C-04` ⓐ)
 *  ② computed — Glass Rest 카드 2장(`163:2551` · `110:835`) = `--shadow-glass-rest` · `--color-surface-card` · blur 12 ·
 *     radius 22 (AC-7-77, `R-FIGMA-1` ④ — Tailwind 유틸리티 포함 computed 로 본다) · Moment eyebrow 색(AC-7-80) ·
 *     렌더 텍스트 ≥ 11px (AC-7-83)
 *  ③ 접근성 — 카드·Growth 의 `progressbar` 0 (AC-7-31) · 주간 카드 토글 0 (AC-7-24) · 헤더 링크 1개 · 중첩 인터랙티브 0
 *     (AC-7-33 — axe 는 저장소에 없다 · 도입 = 승인 사항 → DOM 으로 본다)
 *  ④ `R-SHADOW-1` — Glass Rest 카드 **세로·가로** 프로브 320 / 393 / 600 + StatTile 아래 번짐(AC-7-79)
 *  ⑤ 반응형 320 / 393 / 600 / 1024 — 가로 스크롤 0 · 컬럼 480 (AC-7-71)
 *  ⑥ 주 선택 시트 — 선택 즉시 닫힘 · URL `?week=` · 포커스 chip 복귀 (AC-7-27)
 *  ⑦ 콘솔에 아이 이름 · 인용 0 (AC-7-64)
 *  ⑧ baseline (`R-BASELINE-1` — dev 패널 가림 · 이미지 디코드 + settle 후)
 */
import { inflateSync } from 'node:zlib';

import { expect, test, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';

import { hideDevPanel, settle } from './support/gallery';
import { logInToHome, settleImages } from './support/session';

const READY_WEEKLY = '.haru-progress-weekly[data-state="ready"]';
const REPORT_CARD =
  '.haru-report-card[data-state]:not([data-state="loading"]):not([data-state="error"])';
const WEEKLY_CARD = '.haru-weekly-reading .haru-surface';
const REPORT_SURFACE = '.haru-report-card .haru-surface';

async function openProgress(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await page.getByRole('navigation').getByRole('link', { name: 'Progress' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
  await expect(page.locator(READY_WEEKLY)).toBeVisible();
  await expect(page.locator(REPORT_CARD)).toBeVisible();
  // 클라이언트 이동이라 `gotoApp` 의 settle 을 거치지 않는다 — 캐릭터 이미지 디코드까지 기다린다 (R-BASELINE-1 ①)
  await settleImages(page);
}

function box(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: Math.round(rect.x * 10) / 10,
        y: Math.round(rect.y * 10) / 10,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
      };
    });
}

// ── ① 기하 ─────────────────────────────────────────────────────────────────

test.describe('기하 — Figma `31:102` (393×852, get_metadata 좌표 − 66: 상태바 56 + 위 여백 10)', () => {
  test.beforeEach(async ({ page }) => {
    await hideDevPanel(page);
    await openProgress(page);
  });

  test('캐릭터 `163:2642` 347×422 @ (24, 4) · 겹침 146 → 본문 y280 (AC-7-78)', async ({ page }) => {
    expect(await box(page, '.haru-progress-overview__character')).toStrictEqual({
      x: 24,
      y: 4,
      width: 347,
      height: 422,
    });
    const stack = await box(page, '.haru-progress-overview__stack');
    expect(stack.y).toBe(280);
    // 겹침 = 캐릭터 하단 426 − 280 = 146 (= 422 × 0.346)
    expect(4 + 422 - stack.y).toBe(146);

    // 장식 — 접근성 트리 밖 · alt="" · 크롭용 overflow 0 (에셋에 미리 적용 — H7-3)
    const character = page.locator('.haru-progress-overview__character');
    await expect(character.locator('[aria-hidden="true"]')).toHaveCount(1);
    await expect(character.locator('img')).toHaveAttribute('alt', '');
    const overflow = await character.evaluate((node) => {
      const values: string[] = [];
      for (let el: Element | null = node; el !== null; el = el.firstElementChild) {
        values.push(getComputedStyle(el).overflow);
      }
      return values;
    });
    expect(overflow.every((value) => value === 'visible')).toBe(true);
  });

  test('StatTile 행 84 · 타일 2개 가로 gap 10 · 막대 영역 110 · 막대 폭 16 (AC-7-20 · 22)', async ({
    page,
  }) => {
    const row = await box(page, '.haru-progress-weekly__stats');
    expect(row).toMatchObject({ x: 24, y: 280, width: 345, height: 84 });
    const tiles = await page
      .locator('.haru-stat-tile')
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().x));
    expect(tiles).toStrictEqual([24, 201.5]);
    expect((await box(page, '.haru-bar-chart')).height).toBe(110);
    const bar = await page
      .locator('.haru-bar-chart__bar')
      .first()
      .evaluate((node) => {
        return node.getBoundingClientRect().width;
      });
    expect(bar).toBe(16);
  });

  /*
    chip 오른쪽 끝 = **x369** (Figma `31:118` — 컬럼 끝). 공유 `TopBar large` 가 빈 leading 을 숨긴 뒤 남던 세 번째 열의
    column-gap(20) 때문에 x349 였다 → 빈 leading 이면 2열로 접는다 (`VG7-C-04` ⓐ · `D7-6` ③). `/library` 단정은
    `e2e/library.spec.ts`, Home(leading 있음 — 불변) 단정은 아래.
  */
  test('주 선택 chip `31:118` — h34 · 오른쪽 끝 x369 · 라벨 May 4 – 10', async ({ page }) => {
    const chip = page.getByRole('button', { name: 'Week: May 4 – 10. Change week' });
    const rect = await chip.boundingBox();
    expect(rect?.height).toBe(34);
    expect((rect?.x ?? 0) + (rect?.width ?? 0)).toBe(369);
    const columns = await page
      .locator('.haru-top-bar--large')
      .evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(2);
  });

  test('제목 `31:115` 행 ↔ 캐릭터 — 제목·캐릭터 모두 −66 매핑 (`VG7-C-02` ⓑ)', async ({ page }) => {
    // Figma: 캐릭터 y70 · 제목 행 y66(상태바 56 + 위 여백 10) → 웹 4 · 0. 상대 거리 4 가 Figma 와 같다.
    const title = await box(page, '.haru-top-bar--large');
    const character = await box(page, '.haru-progress-overview__character');
    expect(character.y - title.y).toBe(4);
  });
});

test('Home `TopBar large` — leading(워드마크)이 있으면 3열 그대로 (`VG7-C-04` ⓐ 조건 밖)', async ({
  page,
}) => {
  await hideDevPanel(page);
  await logInToHome(page);
  const bar = page.locator('.haru-top-bar--large');
  const layout = await bar.evaluate((node) => {
    const leading = node.querySelector('.haru-top-bar__leading');
    const trailing = node.querySelector('.haru-top-bar__trailing');
    return {
      columns: getComputedStyle(node).gridTemplateColumns.split(' ').length,
      leadingDisplay: leading === null ? 'none' : getComputedStyle(leading).display,
      trailingRight: Math.round((trailing?.getBoundingClientRect().right ?? 0) * 10) / 10,
    };
  });
  expect(layout).toStrictEqual({ columns: 3, leadingDisplay: 'flex', trailingRight: 369 });
});

// ── ② computed ────────────────────────────────────────────────────────────

test.describe('computed — HTML import 카드 흡수 (AC-7-77 · 80 · 83)', () => {
  test.beforeEach(async ({ page }) => {
    await hideDevPanel(page);
    await openProgress(page);
  });

  for (const [name, selector] of [
    ['주간 `163:2551`', WEEKLY_CARD],
    ['리포트 `110:835`', REPORT_SURFACE],
  ] as const) {
    test(`${name} — --shadow-glass-rest · --color-surface-card · blur 12 · radius 22`, async ({
      page,
    }) => {
      const computed = await page
        .locator(selector)
        .first()
        .evaluate((node) => {
          const probe = document.createElement('div');
          probe.style.boxShadow = 'var(--shadow-glass-rest)';
          probe.style.backgroundColor = 'var(--color-surface-card)';
          probe.style.borderRadius = 'var(--radius-surface)';
          document.body.append(probe);
          const expected = getComputedStyle(probe);
          const actual = getComputedStyle(node);
          const result = {
            shadow: actual.boxShadow === expected.boxShadow,
            background: actual.backgroundColor === expected.backgroundColor,
            radius: actual.borderTopLeftRadius === expected.borderTopLeftRadius,
            radiusValue: actual.borderTopLeftRadius,
            blur: actual.backdropFilter,
            shadowLayers: actual.boxShadow.split(/,(?![^(]*\))/).length,
          };
          probe.remove();
          return result;
        });
      expect(computed).toStrictEqual({
        shadow: true,
        background: true,
        radius: true,
        radiusValue: '22px',
        blur: 'blur(12px)',
        // `--shadow-glass-rest` = drop 3겹 + inset 2겹 (R-FIGMA-1 ③ — `--shadow-rest` 아님)
        shadowLayers: 5,
      });
    });
  }

  test('Moment `163:2633` — eyebrow = --color-fg-secondary (N7-32 ⓐ) · border 1px · 그림자 0', async ({
    page,
  }) => {
    const moment = await page.locator('.haru-notable-quote').evaluate((node) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--color-fg-secondary)';
      probe.style.borderColor = 'var(--color-border-moment)';
      probe.style.backgroundColor = 'var(--color-surface-moment)';
      document.body.append(probe);
      const expected = getComputedStyle(probe);
      const eyebrow = node.querySelector('.haru-notable-quote__eyebrow');
      const style = getComputedStyle(node);
      const result = {
        eyebrow: eyebrow === null ? null : getComputedStyle(eyebrow).color === expected.color,
        border: style.borderTopWidth,
        borderColor: style.borderTopColor === expected.borderColor,
        background: style.backgroundColor === expected.backgroundColor,
        shadow: style.boxShadow,
      };
      probe.remove();
      return result;
    });
    expect(moment).toStrictEqual({
      eyebrow: true,
      border: '1px',
      borderColor: true,
      background: true,
      shadow: 'none',
    });
  });

  test('본문 렌더 텍스트는 전부 ≥ 11px (N7-31 ⓐ · AC-7-83)', async ({ page }) => {
    const sizes = await page.locator('main').evaluate((root) => {
      const found: { text: string; size: number }[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (parent === null || (node.textContent ?? '').trim() === '') continue;
        if (parent.closest('.haru-visually-hidden, [aria-hidden="true"] .haru-visually-hidden'))
          continue;
        const rect = parent.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        found.push({
          text: (node.textContent ?? '').trim(),
          size: parseFloat(getComputedStyle(parent).fontSize),
        });
      }
      return found;
    });
    expect(sizes.length).toBeGreaterThan(30);
    expect(sizes.filter((entry) => entry.size < 11)).toStrictEqual([]);
  });

  test('Growth 막대 4색 = growth-theme 토큰 (T7-1 · N7-10)', async ({ page }) => {
    const matches = await page.locator('.haru-growth-theme').evaluateAll((rows) => {
      const tokens = ['agency', 'emotion', 'flexibility', 'motivation'];
      return rows.map((row, index) => {
        const probe = document.createElement('span');
        probe.style.backgroundColor = `var(--color-growth-theme-${tokens[index] ?? ''})`;
        document.body.append(probe);
        const expected = getComputedStyle(probe).backgroundColor;
        probe.remove();
        const fill = row.querySelector('.haru-progress__fill');
        return fill === null ? false : getComputedStyle(fill).backgroundColor === expected;
      });
    });
    expect(matches).toStrictEqual([true, true, true, true]);
  });
});

// ── ③ 접근성 ─────────────────────────────────────────────────────────────

test.describe('접근성 — 숫자 미낭독 · 토글 0 · 헤더 링크 (AC-7-24 · 31 · 33)', () => {
  test.beforeEach(async ({ page }) => {
    await openProgress(page);
  });

  test('카드 · Growth 영역 접근성 트리에 progressbar · aria-valuenow 0', async ({ page }) => {
    await expect(page.locator('main').getByRole('progressbar')).toHaveCount(0);
    await expect(page.locator('main [aria-valuenow]')).toHaveCount(0);
  });

  test('주간 카드 — 버튼 · aria-expanded · 포커스 가능한 요소 0 (N7-41 ⓐ)', async ({ page }) => {
    const card = page.getByRole('region', { name: "This week's reading" });
    await expect(card.getByRole('button')).toHaveCount(0);
    await expect(card.locator('[aria-expanded]')).toHaveCount(0);
    await expect(card.locator('a, button, [tabindex]')).toHaveCount(0);
  });

  test('리포트 카드 — 헤더 링크 1개 · 이름 · hit ≥ 44 · 안에 인터랙티브 0 → 상세 경로로 이동', async ({
    page,
  }) => {
    const card = page.getByRole('region', { name: '4-week full report' });
    const links = card.getByRole('link');
    await expect(links).toHaveCount(1);
    // `D8-3` (`H8-6-N1`) — 이름 = 보이는 내용 (제목 + 범위가 든 설명)
    const link = card.getByRole('link', { name: /^4-week full report\s*Apr 13 – May 10 · / });
    await expect(link).not.toHaveAttribute('aria-label', /.*/);
    await expect(link.locator('a, button, input, [tabindex]')).toHaveCount(0);
    const rect = await link.boundingBox();
    expect(rect?.height ?? 0).toBeGreaterThanOrEqual(44);

    // 포커스 순서: chip → 헤더 링크 (주간 카드 토글 없음)
    await page.getByRole('button', { name: /Change week/ }).focus();
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();

    await link.click();
    await expect(page).toHaveURL(/\/progress\/reports\/e7e7e7e7-0000-4000-8000-000000000002$/);
  });
});

// ── ④ R-SHADOW-1 ──────────────────────────────────────────────────────────

/** 카드 좌우에서 재는 거리 (Glass Rest 좌우 번짐 28~32 안). */
const SIDE_PROBE_PX = 6;
/** 위아래 — 블록 간격 14 안쪽(이웃 카드 면을 피한다). */
const VERTICAL_PROBE_PX = 6;
/** 실측: 그림자 있음 ≥ 10, 잘림 0~2. 사이 값. */
const MIN_SHADOW_DELTA = 6;

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function decodeSinglePixel(png: Buffer): Rgb {
  const chunks: Buffer[] = [];
  let offset = 8;
  while (offset + 8 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  return { r: raw[1] as number, g: raw[2] as number, b: raw[3] as number };
}

async function pixelAt(page: Page, x: number, y: number): Promise<Rgb> {
  return decodeSinglePixel(await page.screenshot({ clip: { x, y, width: 1, height: 1 } }));
}

const distance = (a: Rgb, b: Rgb): number =>
  Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);

async function shadowDeltas(
  page: Page,
  selector: string,
  points: readonly { x: number; y: number }[],
): Promise<number[]> {
  const before: Rgb[] = [];
  for (const point of points) before.push(await pixelAt(page, point.x, point.y));
  const style = await page.addStyleTag({ content: `${selector} { box-shadow: none !important; }` });
  await settle(page);
  const deltas: number[] = [];
  for (const [index, point] of points.entries()) {
    deltas.push(distance(before[index] as Rgb, await pixelAt(page, point.x, point.y)));
  }
  await style.evaluate((node) => {
    (node as Element).remove();
  });
  await settle(page);
  return deltas;
}

/** 카드를 화면 가운데로 스크롤하고 박스 · 가로 클리핑 조상 · 컬럼 왼쪽을 잰다. */
async function measureCard(page: Page, selector: string) {
  await page
    .locator(selector)
    .first()
    .evaluate((node) => {
      node.scrollIntoView({ block: 'center' });
    });
  await settle(page);
  return page
    .locator(selector)
    .first()
    .evaluate((node) => {
      const clippers: { className: string; clientWidth: number; axis: string }[] = [];
      for (let el = node.parentElement; el !== null; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
          clippers.push({
            className: el.getAttribute('class') ?? '',
            clientWidth: el.clientWidth,
            axis: `${style.overflowX}/${style.overflowY}`,
          });
        }
      }
      const column = document
        .querySelector('[data-app-shell-viewport] > *')
        ?.getBoundingClientRect();
      const rect = node.getBoundingClientRect();
      return {
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        columnLeft: Math.round(column?.left ?? 0),
        viewportWidth: window.innerWidth,
        clippers,
      };
    });
}

const SHADOW_VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
] as const;

for (const [name, selector] of [
  ['주간 카드 `163:2551`', WEEKLY_CARD],
  ['리포트 카드 `110:835`', REPORT_SURFACE],
] as const) {
  test.describe(`Glass Rest 그림자 — ${name} (R-SHADOW-1 세로·가로)`, () => {
    for (const viewport of SHADOW_VIEWPORTS) {
      test(`${String(viewport.width)}px — 구조 · 좌 · 우 · 위 · 아래 (+ 600 컬럼 경계)`, async ({
        page,
      }) => {
        await hideDevPanel(page);
        await page.setViewportSize(viewport);
        await openProgress(page);
        const card = await measureCard(page, selector);

        // ① 구조 — 클리핑 조상은 AppShell 뷰포트 하나뿐이고 뷰포트 전 폭이다 (새 overflow 0)
        expect(card.clippers.length).toBe(1);
        expect(card.clippers[0]?.clientWidth).toBeGreaterThanOrEqual(card.viewportWidth);

        const sideY = Math.round((card.top + card.bottom) / 2);
        const midX = Math.round(card.left + card.width * 0.25);
        const points = [
          { x: card.left - SIDE_PROBE_PX, y: sideY },
          { x: card.right + SIDE_PROBE_PX - 1, y: sideY },
          { x: midX, y: card.top - VERTICAL_PROBE_PX },
          { x: midX, y: card.bottom + VERTICAL_PROBE_PX - 1 },
        ];
        const edge = card.columnLeft > 3 ? { x: card.columnLeft - 3, y: sideY } : null;
        const deltas = await shadowDeltas(page, selector, [
          ...points,
          ...(edge === null ? [] : [edge]),
        ]);
        test.info().annotations.push({
          type: 'shadow-deltas',
          description: JSON.stringify({ card, deltas }),
        });
        const [left, right, above, below, columnEdge] = deltas;
        expect(left, '왼쪽 6px').toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
        expect(right, '오른쪽 6px').toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
        expect(above, '위 6px').toBeGreaterThan(0);
        expect(below, '아래 6px').toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
        if (viewport.width >= 600) {
          expect(edge, '600 은 컬럼 바깥 여백이 있다').not.toBeNull();
          expect(columnEdge ?? 0, '컬럼 바깥 3px — 컬럼 경계에 클립 선 없음').toBeGreaterThan(0);
        }
      });
    }
  });
}

test('StatTile 아래 번짐이 행에서 잘리지 않는다 — Figma 행 overflow-clip 미재현 (AC-7-79 · AD7-11)', async ({
  page,
}) => {
  await hideDevPanel(page);
  await openProgress(page);
  const tile = '.haru-stat-tile .haru-surface';
  const card = await measureCard(page, tile);
  // 행 h84 · 타일 h72 · 가운데 → 타일 아래 6 은 행 안, 8 은 행 밖. 둘 다 번짐(10)이 보여야 한다.
  const x = Math.round(card.left + card.width / 2);
  const [inside, outside] = await shadowDeltas(page, tile, [
    { x, y: card.bottom + 3 },
    { x, y: card.bottom + 7 },
  ]);
  expect(inside, '타일 아래 3px').toBeGreaterThan(0);
  expect(outside, '타일 아래 7px (행 경계 밖)').toBeGreaterThan(0);
  const rowOverflow = await page
    .locator('.haru-progress-weekly__stats')
    .evaluate((node) => getComputedStyle(node).overflow);
  expect(rowOverflow).toBe('visible');
});

// ── ⑤ 반응형 ─────────────────────────────────────────────────────────────

for (const viewport of [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
  { width: 1024, height: 768 },
] as const) {
  test(`반응형 ${String(viewport.width)} — 가로 스크롤 0 · 컬럼 ≤ 480 · 캐릭터 = 컬럼 + 2 (AC-7-71)`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openProgress(page);
    const result = await page.evaluate(() => {
      const viewportEl = document.querySelector('[data-app-shell-viewport]');
      const column = document.querySelector('.haru-progress-overview')?.getBoundingClientRect();
      const character = document
        .querySelector('.haru-progress-overview__character')
        ?.getBoundingClientRect();
      return {
        scrollX: (viewportEl?.scrollWidth ?? 0) - (viewportEl?.clientWidth ?? 0),
        docScrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        column: column?.width ?? 0,
        character: character?.width ?? 0,
      };
    });
    expect(result.scrollX).toBe(0);
    expect(result.docScrollX).toBe(0);
    expect(result.column).toBeLessThanOrEqual(432);
    expect(result.character).toBe(result.column + 2);
  });
}

// ── ⑥ 주 선택 ────────────────────────────────────────────────────────────

test('주 선택 — 시트 → 이전 주 → 즉시 닫힘 · URL ?week= · 포커스 chip 복귀 · 그 주 데이터 (AC-7-27)', async ({
  page,
}) => {
  await openProgress(page, 'progress:progress-multi-week');
  await page.getByRole('button', { name: 'Week: May 4 – 10. Change week' }).click();
  const sheet = page.getByRole('dialog', { name: 'Choose a week' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('radio')).toHaveCount(4);
  // 선택 즉시 시트가 닫힌다 — `check()` 는 닫힌 뒤 상태를 확인하지 못하므로 `click()`
  await sheet.getByRole('radio', { name: /Dec 29 – Jan 4/ }).click();
  await expect(sheet).toBeHidden();
  await expect(page).toHaveURL(/\/progress\?(.*&)?week=2025-12-29/);
  const chip = page.getByRole('button', { name: 'Week: Dec 29 – Jan 4. Change week' });
  await expect(chip).toBeFocused();
  await expect(page.getByText('The snow is quiet like a library.', { exact: false })).toBeVisible();
});

// ── ⑦ Privacy ────────────────────────────────────────────────────────────

test('콘솔 · 에러 로그에 아이 이름 · 인용이 없다 (AC-7-64)', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', (message) => {
    messages.push(message.text());
  });
  page.on('pageerror', (error) => {
    messages.push(error.message);
  });
  await openProgress(page);
  expect(
    messages.filter((text) => /Emma|Maybe she just needs|Magnificent/.test(text)),
  ).toStrictEqual([]);
});

// ── ⑧ baseline ───────────────────────────────────────────────────────────

test.describe('baseline (R-BASELINE-1)', () => {
  test.beforeEach(async ({ page }) => {
    await hideDevPanel(page);
  });

  test('s7-progress-frame — 393×1105 (Figma `31:102` 프레임 높이, 같은 수치 fixture)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 1105 });
    await openProgress(page);
    await expect(page).toHaveScreenshot('s7-progress-frame.png');
  });

  test('s7-progress-main — 393 · 전체 콘텐츠', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 1500 });
    await openProgress(page);
    await expect(page.locator('main')).toHaveScreenshot('s7-progress-main.png', REGION_SNAPSHOT);
  });

  for (const [id, scenario] of [
    ['s7-report-card-published', undefined],
    ['s7-report-card-first-cycle', 'reports:empty'],
    ['s7-report-card-generating', 'reports:report-eligible'],
    ['s7-report-card-deferred', 'reports:report-deferred'],
    ['s7-report-card-delayed', 'reports:report-delayed'],
    ['s7-report-card-no-previous', 'reports:report-no-previous'],
  ] as const) {
    test(`${id}`, async ({ page }) => {
      await openProgress(page, scenario);
      const card = page.locator('.haru-report-card');
      await card.evaluate((node) => {
        node.scrollIntoView({ block: 'center' });
      });
      await settle(page);
      await expect(card).toHaveScreenshot(`${id}.png`, REGION_SNAPSHOT);
    });
  }

  test('s7-progress-empty-week — 이번 주 0 (C13-S7-8)', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 1500 });
    await openProgress(page, 'progress:empty,reports:empty');
    await expect(page.locator('main')).toHaveScreenshot(
      's7-progress-empty-week.png',
      REGION_SNAPSHOT,
    );
  });

  test('s7-past-reports — 생성 중 + 과거 2건 (C13-S7-5)', async ({ page }) => {
    await openProgress(page, 'reports:report-eligible');
    const past = page.locator('.haru-past-reports');
    await past.evaluate((node) => {
      node.scrollIntoView({ block: 'center' });
    });
    await settle(page);
    await expect(past).toHaveScreenshot('s7-past-reports.png', REGION_SNAPSHOT);
  });

  test('s7-week-sheet — 주 선택 시트 (C13-S7-6)', async ({ page }) => {
    await openProgress(page, 'progress:progress-multi-week');
    await page.getByRole('button', { name: /Change week/ }).click();
    const sheet = page.getByRole('dialog', { name: 'Choose a week' });
    await expect(sheet).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('s7-week-sheet.png');
  });

  test('s7-progress-error — 주간 · 리포트 오류 (C13-S7-9)', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 1200 });
    await logInToHome(page, 'progress:error,reports:error');
    await page.getByRole('navigation').getByRole('link', { name: 'Progress' }).click();
    await expect(page.getByRole('button', { name: 'Try again' })).toHaveCount(2);
    await settleImages(page);
    await expect(page.locator('main')).toHaveScreenshot('s7-progress-error.png', REGION_SNAPSHOT);
  });
});
