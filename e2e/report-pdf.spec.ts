/**
 * 4주 리포트 PDF — Stage 7 `S7-F` (`C13-S7-4`, Spec §2.6 · §9.1, Plan §5.3 · §5.5, FR-17 · `N7-19` · `N7-24` · `N7-40`).
 * Figma 는 `110:835` 카드 안 `110:854` idle 버튼만 — 나머지 상태는 design-agent 명세.
 *
 *  ① 실제 Chromium 다운로드 — ready 도달 시 `download` 이벤트 **0**, *Save PDF* 탭 1회 = **1** · `%PDF-` 바이트 (AC-7-56)
 *  ② 재탭 = POST 1 (AC-7-57) · 카드 · 상세 같은 기록 (AC-7-61) · 상세 ⑦ = 콘텐츠 끝
 *  ③ 실패 → 재시도 · 지연(60s — `page.clock`) · 오프라인 (AC-7-58) · 공유 미지원 · 공유 취소 (AC-7-59)
 *  ④ 콘솔에 파일명 · URL · 이름 0 (AC-7-60 · 64)
 *  ⑤ `110:835` 카드 재비교 — 버튼 `Button md` 45 (Figma h50 → `AD7-9`) · 카드 안 간격 14 · 폭 313
 *  ⑥ `R-SHADOW-1` — 버튼 그림자 **세로·가로** 프로브 320 / 393 / 600 · 클리핑 조상 = AppShell 뷰포트 1개
 *  ⑦ baseline 7 상태 (`R-BASELINE-1` — dev 패널 가림 · 이미지 디코드 + settle 후)
 */
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

import { expect, test, type Locator, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';

import { advanceUntil } from './support/clock';
import { hideDevPanel, settle } from './support/gallery';
import { logInToHome, requestOperations, settleImages } from './support/session';

const LATEST = 'e7e7e7e7-0000-4000-8000-000000000002';
const POST = 'POST /v1/reports/:reportId/pdf';
const GET = 'GET /v1/reports/:reportId/pdf';
const CARD = '.haru-report-card[data-state="published"]';
const PDF = '.haru-report-pdf';
const DETAIL_READY = '.haru-report-detail__body[data-state="ready"]';

async function openProgress(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await page.getByRole('navigation').getByRole('link', { name: 'Progress' }).click();
  await expect(page.locator(CARD)).toBeVisible();
  await settleImages(page);
}

async function deepLink(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function openDetail(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await deepLink(page, `/progress/reports/${LATEST}`);
  await expect(page.locator(DETAIL_READY)).toBeVisible();
  await settleImages(page);
}

async function count(page: Page, operation: string): Promise<number> {
  return (await requestOperations(page)).filter((op) => op === operation).length;
}

function pdf(page: Page): Locator {
  return page.locator(PDF);
}

async function untilReady(page: Page): Promise<void> {
  await expect(pdf(page)).toHaveAttribute('data-state', 'ready', { timeout: 15_000 });
}

// ── ① 다운로드 ─────────────────────────────────────────────────────────────

test('카드: Download → loading + Preparing → ready = Share · Save · 자동 다운로드 0 → Save 탭 = 다운로드 1 (%PDF-) (AC-7-56 · 59)', async ({
  page,
}) => {
  let downloads = 0;
  page.on('download', () => {
    downloads += 1;
  });
  await openProgress(page);
  const card = page.getByRole('region', { name: '4-week full report' });
  const download = card.getByRole('button', { name: 'Download PDF' });
  await expect(download).toBeVisible();

  await download.click();
  await expect(download).toHaveAttribute('aria-busy', 'true');
  await expect(card.getByRole('status').filter({ hasText: 'Preparing your PDF.' })).toHaveText(
    'Preparing your PDF. This can take up to a minute.',
  );

  await untilReady(page);
  await expect(card.getByRole('button', { name: 'Save PDF' })).toBeVisible();
  await expect(card.getByRole('button', { name: 'Share' })).toBeVisible();
  await expect(pdf(page).getByRole('status')).toHaveText('Your PDF is ready.');
  await settle(page);
  expect(downloads, 'ready 도달 = 자동 저장 0 (N7-40)').toBe(0);

  const [file] = await Promise.all([
    page.waitForEvent('download'),
    card.getByRole('button', { name: 'Save PDF' }).click(),
  ]);
  expect(file.suggestedFilename()).toMatch(/^haru-4-week-report-2026-04-13-to-2026-05-10\.pdf$/);
  const path = await file.path();
  expect(readFileSync(path).subarray(0, 5).toString('latin1')).toBe('%PDF-');
  expect(downloads).toBe(1);
  // blob URL 은 쓰고 바로 해제된다 — 남은 a[download] 0
  await expect(page.locator('a[download]')).toHaveCount(0);
});

// ── ② 멱등 · 공유 기록 ─────────────────────────────────────────────────────

test('재탭 = POST 1 · 상세에서 준비 → Progress 카드도 ready · 새 요청 0 (AC-7-57 · 61)', async ({
  page,
}) => {
  await openDetail(page);
  const action = pdf(page);
  // ⑦ = 상세 콘텐츠의 마지막 요소
  expect(
    await page
      .locator(DETAIL_READY)
      .evaluate((body) => body.lastElementChild?.classList.contains('haru-report-detail__pdf')),
  ).toBe(true);
  const button = action.getByRole('button', { name: 'Download PDF' });
  await button.click();
  await button.dispatchEvent('click');
  await button.dispatchEvent('click');
  await untilReady(page);
  expect(await count(page, POST)).toBe(1);
  const polls = await count(page, GET);

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(/\/progress$/);
  const card = page.getByRole('region', { name: '4-week full report' });
  await expect(card.getByRole('button', { name: 'Save PDF' })).toBeVisible();
  await expect(card.getByRole('button', { name: 'Download PDF' })).toHaveCount(0);
  expect(await count(page, POST)).toBe(1);
  expect(await count(page, GET)).toBe(polls);
});

// ── ③ 실패 · 지연 · 오프라인 · 공유 ───────────────────────────────────────

test('`pdf-failed` → 안내 + Try again → ready (AC-7-58)', async ({ page }) => {
  await openProgress(page, 'report-pdf:pdf-failed');
  await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
  await expect(pdf(page).getByRole('alert')).toContainText("We couldn't prepare the PDF.");
  await expect(pdf(page).getByRole('alert')).toContainText('Please try again.');
  await pdf(page).getByRole('button', { name: 'Try again' }).click();
  await untilReady(page);
  expect(await count(page, POST)).toBe(2);
});

test('`pdf-timeout` → 60s 에서 지연 안내 · 폴링 중단 (page.clock) (AC-7-58)', async ({ page }) => {
  await page.clock.install();
  await openProgress(page, 'report-pdf:pdf-timeout');
  await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
  await expect(pdf(page)).toHaveAttribute('data-state', 'generating');
  await advanceUntil(
    page,
    async () => (await pdf(page).getAttribute('data-state')) === 'timeout',
    'pdf timeout',
    70_000,
  );
  await expect(pdf(page).getByText('Your PDF is taking longer than usual.')).toBeVisible();
  await expect(pdf(page).getByText('Try again in a little while.')).toBeVisible();
  const polls = await count(page, GET);
  expect(polls).toBeGreaterThanOrEqual(28);
  expect(polls).toBeLessThanOrEqual(30);
  await page.clock.runFor(10_000);
  expect(await count(page, GET)).toBe(polls);
});

test('`offline` → 오프라인 안내 + Try again', async ({ page }) => {
  await openProgress(page, 'report-pdf:offline');
  await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
  await expect(pdf(page).getByText("You're offline.")).toBeVisible();
  await expect(pdf(page).getByText("Try again when you're back online.")).toBeVisible();
  await expect(pdf(page).getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('`share-unsupported` → Save PDF 1개뿐 (AC-7-59)', async ({ page }) => {
  await openProgress(page, 'report-pdf:share-unsupported');
  await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
  await untilReady(page);
  await expect(pdf(page).getByRole('button')).toHaveText(['Save PDF']);
});

test('`share-cancelled` → Share 탭 후 표시 변화 0 · 오류 0 (AC-7-59)', async ({ page }) => {
  await openProgress(page, 'report-pdf:share-cancelled');
  await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
  await untilReady(page);
  const before = await pdf(page).innerHTML();
  await pdf(page).getByRole('button', { name: 'Share' }).click();
  await settle(page);
  expect(await pdf(page).innerHTML()).toBe(before);
  await expect(pdf(page).getByRole('alert')).toHaveCount(0);
});

// ── ④ Privacy ─────────────────────────────────────────────────────────────

test('콘솔 · 에러 로그에 파일명 · PDF URL · 이름 · 리포트 id 0 (AC-7-60 · 64)', async ({
  page,
}) => {
  const messages: string[] = [];
  page.on('console', (message) => {
    messages.push(message.text());
  });
  page.on('pageerror', (error) => {
    messages.push(error.message);
  });
  await openProgress(page);
  await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
  await untilReady(page);
  await Promise.all([
    page.waitForEvent('download'),
    pdf(page).getByRole('button', { name: 'Save PDF' }).click(),
  ]);
  await pdf(page).getByRole('button', { name: 'Share' }).click();
  expect(
    messages.filter((text) => /haru-4-week-report|data:application\/pdf|Emma|e7e7e7e7/.test(text)),
  ).toStrictEqual([]);
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(stored).not.toMatch(/pdf|haru-4-week-report/i);
});

// ── ⑤ `110:835` 재비교 ───────────────────────────────────────────────────

test('`110:835` 카드 — 버튼 Button md 45 · 폭 313 · 진행 막대 ↔ 버튼 ↔ footer 간격 14 (Figma h50 → AD7-9)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await openProgress(page);
  const geometry = await page.locator(CARD).evaluate((card) => {
    const rect = (selector: string) => {
      const node = card.querySelector(selector);
      if (node === null) throw new Error(selector);
      return node.getBoundingClientRect();
    };
    const surface = rect('.haru-surface');
    const progress = rect('.haru-report-card__progress');
    const button = rect('.haru-report-pdf .haru-button');
    const footer = [...card.querySelectorAll('p')].at(-1)?.getBoundingClientRect();
    const label = card.querySelector('.haru-report-pdf .haru-button__label');
    const icon = card.querySelector('.haru-report-pdf .haru-button__icon');
    return {
      card: { width: surface.width, height: Math.round(surface.height * 10) / 10 },
      buttonTop: Math.round((button.top - surface.top) * 10) / 10,
      button: { width: button.width, height: button.height, left: button.left - surface.left },
      gapAbove: Math.round((button.top - progress.bottom) * 10) / 10,
      gapBelow: Math.round(((footer?.top ?? 0) - button.bottom) * 10) / 10,
      labelSize: label === null ? null : getComputedStyle(label).fontSize,
      labelWeight: label === null ? null : getComputedStyle(label).fontWeight,
      icon: icon === null ? null : icon.getBoundingClientRect().width,
      radius: getComputedStyle(card.querySelector('.haru-report-pdf .haru-button') as Element)
        .borderTopLeftRadius,
    };
  });
  test.info().annotations.push({ type: 'pdf-geometry', description: JSON.stringify(geometry) });
  expect(geometry.button).toStrictEqual({ width: 313, height: 45, left: 16 });
  expect(geometry.gapAbove).toBe(14);
  expect(geometry.gapBelow).toBe(14);
  expect(geometry.card.width).toBe(345);
});

for (const [width, expected] of [
  [393, 'stacked'],
  [600, 'inline'],
] as const) {
  test(`ready 버튼 2개 ${String(width)}px — 각 45 · ${expected} (ButtonGroup 자동 stack < 360 — 눌림 0)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await openProgress(page);
    await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
    await untilReady(page);
    const rects = await pdf(page)
      .locator('.haru-button')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        }),
      );
    test.info().annotations.push({ type: 'ready-buttons', description: JSON.stringify(rects) });
    expect(rects.map((rect) => rect.height)).toStrictEqual([45, 45]);
    const [share, save] = rects as [(typeof rects)[number], (typeof rects)[number]];
    if (expected === 'stacked') {
      expect(save.y - (share.y + share.height)).toBe(12);
      expect(save.width).toBe(share.width);
    } else {
      expect(save.y).toBe(share.y);
      expect(save.x - (share.x + share.width)).toBe(12);
    }
  });
}

// ── ⑥ R-SHADOW-1 ──────────────────────────────────────────────────────────

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

for (const [where, open] of [
  ['card', openProgress],
  ['detail', openDetail],
] as const) {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 393, height: 852 },
    { width: 600, height: 800 },
  ] as const) {
    test(`PDF 버튼 그림자 ${where} ${String(viewport.width)}px — 좌 · 우 · 아래 번짐 · 클리핑 조상 1개 (R-SHADOW-1 세로·가로)`, async ({
      page,
    }) => {
      await hideDevPanel(page);
      await page.setViewportSize(viewport);
      await open(page);
      const selector = `${PDF} .haru-button`;
      const box = await page
        .locator(selector)
        .first()
        .evaluate((node) => {
          node.scrollIntoView({ block: 'center' });
          const clippers: string[] = [];
          for (let el = node.parentElement; el !== null; el = el.parentElement) {
            const style = getComputedStyle(el);
            if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
              clippers.push(`${el.getAttribute('class') ?? el.tagName}:${String(el.clientWidth)}`);
            }
          }
          const rect = node.getBoundingClientRect();
          return {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            clippers,
            viewportWidth: window.innerWidth,
          };
        });
      await settle(page);
      expect(box.clippers).toHaveLength(1);
      expect(Number(box.clippers[0]?.split(':').pop())).toBeGreaterThanOrEqual(box.viewportWidth);

      const midY = Math.round((box.top + box.bottom) / 2);
      const midX = Math.round((box.left + box.right) / 2);
      const points = [
        { x: box.left - 2, y: midY },
        { x: box.right + 1, y: midY },
        { x: midX, y: box.bottom + 2 },
        { x: midX, y: box.bottom + 6 },
      ];
      const before: Rgb[] = [];
      for (const point of points) before.push(await pixelAt(page, point.x, point.y));
      await page.addStyleTag({ content: `${selector} { box-shadow: none !important; }` });
      await settle(page);
      const deltas: number[] = [];
      for (const [index, point] of points.entries()) {
        deltas.push(distance(before[index] as Rgb, await pixelAt(page, point.x, point.y)));
      }
      test.info().annotations.push({
        type: 'shadow-deltas',
        description: JSON.stringify({ box, deltas }),
      });
      const [left, right, below3, below7] = deltas;
      expect(left, '왼쪽 2px').toBeGreaterThan(0);
      expect(right, '오른쪽 2px').toBeGreaterThan(0);
      expect(below3, '아래 3px').toBeGreaterThan(0);
      expect(below7, '아래 7px').toBeGreaterThan(0);
    });
  }
}

// ── ⑦ baseline ───────────────────────────────────────────────────────────

async function snapCard(page: Page, name: string): Promise<void> {
  const card = page.locator('.haru-report-card');
  await card.evaluate((node) => {
    node.scrollIntoView({ block: 'center' });
  });
  // 누른 버튼의 focus ring 을 담지 않는다
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  });
  await settle(page);
  await expect(card).toHaveScreenshot(name, REGION_SNAPSHOT);
}

test.describe('baseline — PDF 7 상태 (R-BASELINE-1, C13-S7-4)', () => {
  test.beforeEach(async ({ page }) => {
    await hideDevPanel(page);
    await page.setViewportSize({ width: 393, height: 852 });
  });

  test('s7-pdf-generating — 버튼 loading + Preparing (pdf-timeout = 생성 지속)', async ({
    page,
  }) => {
    await openProgress(page, 'report-pdf:pdf-timeout');
    await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
    await expect(pdf(page).getByText('Preparing your PDF.', { exact: false })).toBeVisible();
    await snapCard(page, 's7-pdf-generating.png');
  });

  test('s7-pdf-ready-share — Share · Save', async ({ page }) => {
    await openProgress(page);
    await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
    await untilReady(page);
    await snapCard(page, 's7-pdf-ready-share.png');
  });

  test('s7-pdf-ready-save — 공유 미지원 = Save 1개', async ({ page }) => {
    await openProgress(page, 'report-pdf:share-unsupported');
    await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
    await untilReady(page);
    await snapCard(page, 's7-pdf-ready-save.png');
  });

  test('s7-pdf-failed', async ({ page }) => {
    await openProgress(page, 'report-pdf:pdf-failed');
    await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
    await expect(pdf(page)).toHaveAttribute('data-state', 'failed');
    await snapCard(page, 's7-pdf-failed.png');
  });

  test('s7-pdf-offline', async ({ page }) => {
    await openProgress(page, 'report-pdf:offline');
    await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
    await expect(pdf(page)).toHaveAttribute('data-state', 'offline');
    await snapCard(page, 's7-pdf-offline.png');
  });

  test('s7-pdf-timeout (page.clock)', async ({ page }) => {
    await page.clock.install();
    await openProgress(page, 'report-pdf:pdf-timeout');
    await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
    await advanceUntil(
      page,
      async () => (await pdf(page).getAttribute('data-state')) === 'timeout',
      'pdf timeout',
      70_000,
    );
    await snapCard(page, 's7-pdf-timeout.png');
  });

  test('s7-pdf-detail-ready — 상세 ⑦ (카드 밖 · 콘텐츠 끝)', async ({ page }) => {
    await openDetail(page);
    await pdf(page).getByRole('button', { name: 'Download PDF' }).click();
    await untilReady(page);
    const area = page.locator('.haru-report-detail__pdf');
    await area.evaluate((node) => {
      node.scrollIntoView({ block: 'center' });
    });
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    await settle(page);
    await expect(area).toHaveScreenshot('s7-pdf-detail-ready.png', REGION_SNAPSHOT);
  });
});
