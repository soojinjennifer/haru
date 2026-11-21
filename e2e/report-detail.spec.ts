/**
 * `/progress/reports/:reportId` — Stage 7 `S7-D` (`C13-S7-1` · `C13-S7-7` · `C13-S7-9`, Spec §2.3 · §2.9). Figma 없음.
 *
 *  ① 진입 — `/progress` 카드 헤더 링크 → 상세 · Back = 앱 안 이전 화면 / deep link(이전 기록 0) → `/progress` (`N7-23`) ·
 *     미인증 deep link → `/auth/welcome` → 로그인 → **원래 리포트 경로로 복귀** (AC-7-46, `D7-6` ⑨) · 외부 URL 복귀 0
 *  ② viewed — 미열람 리포트 최초 표시 1회 · 재진입 0 (AC-7-44, Mock 요청 로그)
 *  ③ 접근성 — heading 구조 · progressbar = 클립 재생 위치뿐 · 본문 인터랙티브 = 클립 버튼(`S7-E`) · 렌더 텍스트 ≥ 11px (AC-7-67 · 83)
 *  ④ `R-SHADOW-1` — `ProfileCard`(`--shadow-bubble`) **세로·가로** 프로브 320 / 393 / 600 · 클리핑 조상 = AppShell 뷰포트 1개
 *  ⑤ 반응형 320 / 393 / 600 / 1024 — 가로 스크롤 0 · 컬럼 ≤ 480 (AC-7-71)
 *  ⑥ 콘솔에 아이 이름 · 인용 · 리포트 id 0 (AC-7-64)
 *  ⑦ baseline (`R-BASELINE-1` — dev 패널 가림 · SPA 이동 뒤 settle)
 */
import { inflateSync } from 'node:zlib';

import { expect, test, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';

import { hideDevPanel, settle } from './support/gallery';
import { logInToHome, requestOperations, settleImages } from './support/session';

const LATEST = 'e7e7e7e7-0000-4000-8000-000000000002';
const EARLIER = 'e7e7e7e7-0000-4000-8000-000000000001';
const PENDING = 'e7e7e7e7-0000-4000-8000-000000000003';
const UNKNOWN = 'e7e7e7e7-0000-4000-8000-0000000000ff';
const READY = '.haru-report-detail__body[data-state="ready"]';
const VIEWED_OP = 'POST /v1/reports/:reportId/viewed';

/** 앱 안 이동 — history.state 에 RR idx 가 없다 = push 알림 · 외부 링크 진입과 같다 (Stage 5 `spaGoto` 선례). */
async function deepLink(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function openDetail(page: Page, reportId: string, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await deepLink(page, `/progress/reports/${reportId}`);
  await expect(page.getByRole('heading', { level: 1, name: '4-week report' })).toBeVisible();
}

async function openReady(page: Page, reportId: string = LATEST, scenario?: string) {
  await openDetail(page, reportId, scenario);
  await expect(page.locator(READY)).toBeVisible();
  // SPA 이동이라 `gotoApp` 의 settle 을 거치지 않는다 (R-BASELINE-1 ①)
  await settleImages(page);
}

// ── ① 진입 · Back ──────────────────────────────────────────────────────────

test('카드 헤더 링크 → 상세 → Back = 앱 안 이전 화면 `/progress` (AC-7-33 목적지 · N7-23)', async ({
  page,
}) => {
  await logInToHome(page);
  await page.getByRole('navigation').getByRole('link', { name: 'Progress' }).click();
  await page.getByRole('link', { name: /^4-week full report\s*Apr 13 – May 10 · / }).click();
  await expect(page).toHaveURL(new RegExp(`/progress/reports/${LATEST}$`));
  await expect(page.locator(READY)).toBeVisible();
  await expect(page.getByText('Apr 13 – May 10', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(/\/progress$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
});

test('deep link 진입(앱 안 기록 0) → Back = `/progress` replace (N7-23)', async ({ page }) => {
  await openReady(page);
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(/\/progress$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
});

test('미인증 deep link → Welcome → Log in → 원래 리포트 상세로 복귀 (Home 아님) → Back = `/progress` (AC-7-46 · D7-6 ⑨ · D7-7)', async ({
  page,
}) => {
  const messages: string[] = [];
  page.on('console', (message) => messages.push(message.text()));
  await page.goto(`/progress/reports/${LATEST}`, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/auth\/welcome$/);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/log-in$/);
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();

  await expect(page).toHaveURL(new RegExp(`/progress/reports/${LATEST}$`));
  await expect(page.locator(READY)).toBeVisible();
  // Back — 앞의 기록(Welcome · Log in)은 콘텐츠가 아니라 인증 관문이다. 복귀 이동의 router state 표식으로
  // "앱 안 기록 없음" 처리 → deep link 목적지 `/progress` (N7-23 · D7-7 — VG7-R-09 ⓑ). Home · 인증 화면이 아니다.
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(/\/progress$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
  // replace 이동 — 브라우저 뒤로 가기가 리포트 상세로 되돌아가지 않는다 (루프 0)
  await page.goBack();
  await expect(page).not.toHaveURL(new RegExp(`/progress/reports/${LATEST}$`));
  // 경로 · 리포트 id 를 콘솔에 남기지 않는다 (PII 규칙 — AC-7-64)
  expect(messages.some((text) => text.includes(LATEST) || text.includes('/progress/reports'))).toBe(
    false,
  );
});

test('복귀 경로 없음 — `/auth/log-in` 에서 로그인 → Home (Stage 2 기본값 유지)', async ({
  page,
}) => {
  await logInToHome(page);
  await expect(page).toHaveURL(/\/$/);
});

// ── ② viewed ──────────────────────────────────────────────────────────────

test('viewed — 미열람 리포트 최초 표시 1회 · 재진입 0 · 열람한 리포트는 0 (AC-7-44)', async ({
  page,
}) => {
  await openReady(page, LATEST, 'reports:report-published-unviewed');
  await expect
    .poll(async () => (await requestOperations(page)).filter((op) => op === VIEWED_OP).length)
    .toBe(1);
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('link', { name: /^4-week full report\s*Apr 13 – May 10 · / }).click();
  await expect(page.locator(READY)).toBeVisible();
  await settle(page);
  expect((await requestOperations(page)).filter((op) => op === VIEWED_OP)).toHaveLength(1);
});

test('viewed — 이미 열람한 리포트(`success`)는 보내지 않는다', async ({ page }) => {
  await openReady(page);
  await settle(page);
  expect((await requestOperations(page)).filter((op) => op === VIEWED_OP)).toHaveLength(0);
});

// ── ③ 접근성 ──────────────────────────────────────────────────────────────

test('heading 구조 · progressbar = 클립 2 · 본문 인터랙티브 = 클립 버튼 2 + PDF 1 (AC-7-37 · 67 · S7-E · S7-F)', async ({
  page,
}) => {
  await openReady(page);
  const main = page.locator('main');
  const headings = await main
    .locator('h1, h2, h3')
    .evaluateAll((nodes) => nodes.map((node) => `${node.tagName}:${node.textContent ?? ''}`));
  expect(headings).toStrictEqual([
    'H2:Growth themes',
    "H2:Emma's storytime persona",
    'H3:The Quiet Noticer',
    'H3:Brave Little Maker',
    'H3:The Curious Page-Turner',
    'H2:How you talked together',
    'H2:What you noticed',
    'H2:Highlight clips',
  ]);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('4-week report');
  // progressbar = ⑥ 클립 재생 위치뿐 (Plan §5.7 클립 행 — role 유지). 점수·진행률 막대 0
  await expect(page.getByRole('progressbar')).toHaveCount(2);
  await expect(page.locator('.haru-clip-row [role="progressbar"]')).toHaveCount(2);
  // 본문 인터랙티브 = ⑥ 클립 재생 버튼 2개 + ⑦ *Download PDF* 1개 (S7-F — 콘텐츠 끝)
  await expect(main.getByRole('button')).toHaveCount(3);
  expect(
    await main
      .getByRole('button')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('aria-label') ?? node.textContent),
      ),
  ).toStrictEqual([
    'Play clip: Talking about feelings',
    'Play clip: Guessing what happens next',
    'Download PDF',
  ]);
  for (const role of ['link', 'textbox', 'checkbox', 'radio', 'combobox'] as const) {
    await expect(main.getByRole(role), role).toHaveCount(0);
  }
});

test('렌더 텍스트 font-size ≥ 11px (AC-7-83)', async ({ page }) => {
  await openReady(page);
  const sizes = await page.locator('main').evaluate((root) => {
    const result: number[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (parent === null || (node.textContent ?? '').trim() === '') continue;
      if (parent.closest('.haru-visually-hidden') !== null) continue;
      result.push(Number.parseFloat(getComputedStyle(parent).fontSize));
    }
    return result;
  });
  expect(sizes.length).toBeGreaterThan(20);
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(11);
});

// ── ④ R-SHADOW-1 ──────────────────────────────────────────────────────────

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

/** 그 지점들의 색을 그림자 있음 / `box-shadow: none` 으로 찍어 채널합 차이를 낸다 (S7-C `shadowDeltas` 와 같은 방식). */
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

/** 대화 지표 카드(`ProfileCard`) — 다음 블록과 겹치지 않는 아래 · 좌우 지점이 있다. */
const DIALOGUE_CARD = '.haru-surface:has([data-section="dialogue"])';

for (const viewport of [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
] as const) {
  test(`ProfileCard 그림자 ${String(viewport.width)}px — 좌 · 우 · 아래 번짐 · 클리핑 조상 1개 (R-SHADOW-1 세로·가로)`, async ({
    page,
  }) => {
    await hideDevPanel(page);
    await page.setViewportSize(viewport);
    await openReady(page);
    const card = await page
      .locator(DIALOGUE_CARD)
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
    // 클리핑 조상 = AppShell 뷰포트 1개 · 뷰포트 전 폭 (새 overflow 0)
    expect(card.clippers).toHaveLength(1);
    expect(Number(card.clippers[0]?.split(':').pop())).toBeGreaterThanOrEqual(card.viewportWidth);

    // `--shadow-bubble` 번짐 = 좌우 4 · 위 0 · 아래 10 (Stage 6 · S7-B 실측) → 좌우 2px · 아래 3/7px 에서 잰다
    const midY = Math.round((card.top + card.bottom) / 2);
    const midX = Math.round((card.left + card.right) / 2);
    const [left, right, below3, below7] = await shadowDeltas(page, DIALOGUE_CARD, [
      { x: card.left - 2, y: midY },
      { x: card.right + 1, y: midY },
      { x: midX, y: card.bottom + 2 },
      { x: midX, y: card.bottom + 6 },
    ]);
    test.info().annotations.push({
      type: 'shadow-deltas',
      description: JSON.stringify({ card, left, right, below3, below7 }),
    });
    expect(left, '왼쪽 2px').toBeGreaterThan(0);
    expect(right, '오른쪽 2px').toBeGreaterThan(0);
    expect(below3, '아래 3px').toBeGreaterThan(0);
    expect(below7, '아래 7px').toBeGreaterThan(0);
  });
}

// ── ⑤ 반응형 ─────────────────────────────────────────────────────────────

for (const viewport of [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
  { width: 1024, height: 768 },
] as const) {
  test(`반응형 ${String(viewport.width)} — 가로 스크롤 0 · 컬럼 ≤ 432 (AC-7-71)`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openReady(page);
    const result = await page.evaluate(() => {
      const viewportEl = document.querySelector('[data-app-shell-viewport]');
      const column = document.querySelector('.haru-report-detail')?.getBoundingClientRect();
      return {
        scrollX: (viewportEl?.scrollWidth ?? 0) - (viewportEl?.clientWidth ?? 0),
        docScrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        column: column?.width ?? 0,
      };
    });
    expect(result.scrollX).toBe(0);
    expect(result.docScrollX).toBe(0);
    expect(result.column).toBeLessThanOrEqual(432);
  });
}

// ── ⑥ Privacy ────────────────────────────────────────────────────────────

test('콘솔 · 에러 로그에 아이 이름 · 인용 · 리포트 id 가 없다 (AC-7-64)', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', (message) => {
    messages.push(message.text());
  });
  page.on('pageerror', (error) => {
    messages.push(error.message);
  });
  await openReady(page, LATEST, 'reports:report-published-unviewed');
  await expect
    .poll(async () => (await requestOperations(page)).filter((op) => op === VIEWED_OP).length)
    .toBe(1);
  expect(
    messages.filter((text) =>
      /Emma|Maybe she just needs|Magnificent|e7e7e7e7|Noticer|Page-Turner/.test(text),
    ),
  ).toStrictEqual([]);
});

// ── ⑦ baseline ───────────────────────────────────────────────────────────

test.describe('baseline (R-BASELINE-1)', () => {
  test.beforeEach(async ({ page }) => {
    await hideDevPanel(page);
  });

  test('s7-report-detail-main — 393 · 전체 콘텐츠 (C13-S7-1, success)', async ({ page }) => {
    // S7-E: ⑥ 클립 섹션이 붙어 콘텐츠가 2600 을 넘는다 → 전체 콘텐츠가 한 번에 담기게 높인다
    await page.setViewportSize({ width: 393, height: 2900 });
    await openReady(page);
    await expect(page.locator('main')).toHaveScreenshot(
      's7-report-detail-main.png',
      REGION_SNAPSHOT,
    );
  });

  test('s7-report-detail-first — 첫 리포트 · 페르소나 1 · 피드백 빈 문구 · 40자 이름', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 2000 });
    await openReady(page, EARLIER);
    await expect(page.locator('main')).toHaveScreenshot(
      's7-report-detail-first.png',
      REGION_SNAPSHOT,
    );
  });

  test('s7-report-detail-frame — 393×852 첫 화면 (TopBar 포함)', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await openReady(page);
    await expect(page).toHaveScreenshot('s7-report-detail-frame.png');
  });

  for (const [id, reportId, scenario, heading] of [
    [
      's7-report-detail-not-ready',
      PENDING,
      'reports:report-delayed',
      "This report isn't ready yet.",
    ],
    ['s7-report-detail-not-found', UNKNOWN, undefined, "We couldn't find this report."],
    ['s7-report-detail-offline', LATEST, 'reports:offline', null],
  ] as const) {
    test(`${id} (C13-S7-9)`, async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 852 });
      await openDetail(page, reportId, scenario);
      if (heading === null) {
        await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
      } else {
        await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
      }
      await settleImages(page);
      await expect(page.locator('main')).toHaveScreenshot(`${id}.png`, REGION_SNAPSHOT);
    });
  }
});
