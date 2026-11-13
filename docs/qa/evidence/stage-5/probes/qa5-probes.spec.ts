/**
 * Stage 5 QA 독립 프로브 (stage-qa-agent, 2026-11-10). 제품·e2e 코드를 수정하지 않는다.
 * 결과는 RESULTS 폴더에 JSON · PNG 로 남긴다.
 *  P-A  회고 카드 별 5개 — Tab 진입 + 화살표 이동 시 :focus-visible · outline computed · 링 픽셀 4방향 (393 · 320)
 *  P-D  피드백 화면 11상태 — live region 수 (slot 1 · 안쪽 0) + pending→analyzed 전이 시 slot 동일 노드
 *  P-R  반응형 320 · 600 · 1024 — 회고 카드 · 피드백 화면 가로 넘침 · 컬럼 폭
 *  P-C  AC-5-31 — auto_timeout 완료 후 제출 · crash 복구 세션 완료 화면 카드 제출
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

import { expect, test, type Page } from '@playwright/test';

import { hideDevPanel } from '../../../../../e2e/support/gallery';
import {
  logInToHome,
  requestOperations,
  requestPayloads,
  settleImages,
  startSession,
} from '../../../../../e2e/support/session';

const RESULTS = '/Users/soojin/dev/haru/docs/qa/evidence/stage-5/probes/results';
mkdirSync(RESULTS, { recursive: true });
const save = (name: string, data: unknown) =>
  writeFileSync(`${RESULTS}/${name}.json`, JSON.stringify(data, null, 2));

const TITLE = 'How was storytime with Nova?';
const SUBMIT_OP = 'POST /v1/sessions/:sessionId/reflection';
const SLOT = '.haru-session-feedback__state';
const HISTORY_ANALYZING = '77777777-7777-4777-8777-000000000002';
const HISTORY_ANALYZED = '77777777-7777-4777-8777-000000000001';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

async function spaGoto(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

/* ---------- PNG decode (zlib only) ---------- */
interface Img {
  w: number;
  h: number;
  bpp: number;
  px: Uint8Array;
}
function decodePng(buf: Buffer): Img {
  let off = 8;
  let w = 0;
  let h = 0;
  let colorType = 0;
  const idat: Buffer[] = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      colorType = data[9] ?? 0;
    } else if (type === 'IDAT') idat.push(data);
    off += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const px = new Uint8Array(h * stride);
  for (let y = 0; y < h; y += 1) {
    const f = raw[y * (stride + 1)] ?? 0;
    for (let x = 0; x < stride; x += 1) {
      const v = raw[y * (stride + 1) + 1 + x] ?? 0;
      const a = x >= bpp ? (px[y * stride + x - bpp] ?? 0) : 0;
      const b = y > 0 ? (px[(y - 1) * stride + x] ?? 0) : 0;
      const c = x >= bpp && y > 0 ? (px[(y - 1) * stride + x - bpp] ?? 0) : 0;
      let out = v;
      if (f === 1) out = v + a;
      else if (f === 2) out = v + b;
      else if (f === 3) out = v + Math.floor((a + b) / 2);
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        out = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      px[y * stride + x] = out & 0xff;
    }
  }
  return { w, h, bpp, px };
}
function changedIn(a: Img, b: Img, x0: number, y0: number, x1: number, y1: number): number {
  let n = 0;
  for (let y = Math.max(0, Math.floor(y0)); y < Math.min(a.h, Math.ceil(y1)); y += 1)
    for (let x = Math.max(0, Math.floor(x0)); x < Math.min(a.w, Math.ceil(x1)); x += 1) {
      const i = (y * a.w + x) * a.bpp;
      const d = Math.max(
        Math.abs((a.px[i] ?? 0) - (b.px[i] ?? 0)),
        Math.abs((a.px[i + 1] ?? 0) - (b.px[i + 1] ?? 0)),
        Math.abs((a.px[i + 2] ?? 0) - (b.px[i + 2] ?? 0)),
      );
      if (d > 8) n += 1;
    }
  return n;
}

/* ---------- P-A ---------- */
async function openCardBySubmit(page: Page): Promise<void> {
  const id = await startSession(page);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(new RegExp(`/session/${id}/complete$`));
  await expect(page.getByRole('region', { name: TITLE })).toBeVisible();
  await settleImages(page);
}

for (const vp of [
  { width: 393, height: 852 },
  { width: 320, height: 568 },
]) {
  test(`P-A 별 포커스 링 ${String(vp.width)}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await openCardBySubmit(page);
    const radios = page.getByRole('radio');
    await radios.first().scrollIntoViewIfNeeded();
    const close = page.getByRole('button', { name: 'Close session' });
    await close.focus();
    await page.keyboard.press('Tab');
    const rows: unknown[] = [];
    for (let k = 1; k <= 6; k += 1) {
      if (k > 1) await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(150);
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          role: el.getAttribute('role'),
          name: el.getAttribute('aria-label'),
          checked: el.getAttribute('aria-checked'),
          focusVisible: el.matches(':focus-visible'),
          outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
          outlineOffset: cs.outlineOffset,
          box: { x: r.x, y: r.y, w: r.width, h: r.height },
        };
      });
      const focused = decodePng(await page.screenshot());
      const shotF = await page.screenshot({
        clip: { x: info.box.x - 8, y: info.box.y - 8, width: info.box.w + 16, height: info.box.h + 16 },
      });
      if (k === 1 || k === 6) writeFileSync(`${RESULTS}/P-A-${String(vp.width)}-star${String(k)}-focused.png`, shotF);
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(150);
      const blurred = decodePng(await page.screenshot());
      await page.keyboard.press('Tab');
      const { x, y, w, h } = info.box;
      const band = 6;
      const sides = {
        top: changedIn(focused, blurred, x - band, y - band, x + w + band, y),
        bottom: changedIn(focused, blurred, x - band, y + h, x + w + band, y + h + band),
        left: changedIn(focused, blurred, x - band, y, x, y + h),
        right: changedIn(focused, blurred, x + w, y, x + w + band, y + h),
      };
      rows.push({ k, ...info, ringPixelsBySide: sides });
      expect(info.focusVisible).toBe(true);
      expect(info.outline).not.toMatch(/^none/);
      expect(sides.top).toBeGreaterThan(0);
      expect(sides.bottom).toBeGreaterThan(0);
      expect(sides.left).toBeGreaterThan(0);
      expect(sides.right).toBeGreaterThan(0);
    }
    save(`P-A-${String(vp.width)}`, rows);
  });
}

/* ---------- P-D ---------- */
const STATES: readonly { name: string; scenario?: string; path?: string; state: string }[] = [
  { name: 'loading', scenario: 'analysis:loading', state: 'loading' },
  { name: 'pending', scenario: 'analysis:analysis-pending', state: 'pending' },
  { name: 'analyzed', scenario: 'analysis:analysis-completed', state: 'analyzed' },
  { name: 'text-null', scenario: 'analysis:analysis-feedback-missing', state: 'analyzed' },
  { name: 'low-quality', scenario: 'analysis:analysis-low-quality', state: 'low-quality' },
  { name: 'failed', scenario: 'analysis:analysis-failed', state: 'failed' },
  { name: 'not-available', scenario: 'analysis:analysis-not-available', state: 'not-available' },
  { name: 'no-recording', scenario: 'analysis:recording-deleted', state: 'not-available' },
  { name: 'error', scenario: 'analysis:error', state: 'error' },
  { name: 'offline', scenario: 'analysis:offline', state: 'offline' },
  { name: 'not-found', path: '/session/99999999-9999-4999-8999-999999999999/feedback', state: 'not-found' },
];

async function liveRegionReport(page: Page) {
  return page.evaluate((slotSel) => {
    const screen = document.querySelector('.haru-session-feedback');
    const slot = document.querySelector(slotSel);
    const live = (root: Element | null) =>
      root === null
        ? []
        : [...root.querySelectorAll('[aria-live],[role="status"],[role="alert"],[role="log"],[role="marquee"],[role="timer"]')].map(
            (el) => `${el.tagName.toLowerCase()}.${el.className}|role=${el.getAttribute('role') ?? ''}|live=${el.getAttribute('aria-live') ?? ''}`,
          );
    return {
      slotAriaLive: slot?.getAttribute('aria-live') ?? null,
      slotRole: slot?.getAttribute('role') ?? null,
      liveInsideScreen: live(screen),
      anyRoleInsideSlot: slot === null ? -1 : slot.querySelectorAll('[role]').length,
      liveInsideSlot: live(slot).length,
      slotText: (slot?.textContent ?? '').trim().slice(0, 120),
    };
  }, SLOT);
}

for (const s of STATES) {
  test(`P-D live region — ${s.name}`, async ({ page }) => {
    if (s.name === 'loading') await page.clock.install();
    await logInToHome(page, s.scenario);
    await spaGoto(page, s.path ?? `/session/${HISTORY_ANALYZING}/feedback`);
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', s.state);
    const report = await liveRegionReport(page);
    save(`P-D-${s.name}`, report);
    expect(report.slotAriaLive).toBe('polite');
    expect(report.liveInsideScreen).toEqual(['div.haru-session-feedback__state|role=|live=polite']);
    expect(report.anyRoleInsideSlot).toBe(0);
  });
}

test('P-D2 pending→analyzed 전이 — slot 동일 노드 · live region 1개 유지', async ({ page }) => {
  await page.clock.install();
  await logInToHome(page, 'analysis:analysis-pending-then-completed');
  await spaGoto(page, `/session/${HISTORY_ANALYZING}/feedback`);
  await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'pending');
  await page.evaluate((sel) => {
    (document.querySelector(sel) as HTMLElement & { __qaMark?: boolean }).__qaMark = true;
  }, SLOT);
  const before = await liveRegionReport(page);
  await page.clock.runFor(31_000);
  await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'analyzed');
  const sameNode = await page.evaluate(
    (sel) => (document.querySelector(sel) as HTMLElement & { __qaMark?: boolean }).__qaMark === true,
    SLOT,
  );
  const after = await liveRegionReport(page);
  save('P-D2-transition', { before, after, sameNode });
  expect(sameNode).toBe(true);
  expect(after.liveInsideScreen).toHaveLength(1);
});

/* ---------- P-R ---------- */
for (const vp of [
  { width: 320, height: 568 },
  { width: 600, height: 900 },
  { width: 1024, height: 768 },
]) {
  test(`P-R 반응형 ${String(vp.width)}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await logInToHome(page, 'analysis:analysis-low-quality');
    await spaGoto(page, `/session/${HISTORY_ANALYZED}/complete`);
    const card = page.getByRole('region', { name: TITLE });
    await expect(card).toBeVisible();
    await settleImages(page);
    const measure = async () =>
      page.evaluate(() => {
        const viewport = document.querySelector('[data-app-shell-viewport]') ?? document.documentElement;
        const col = (document.querySelector('.haru-app-column') ?? viewport).getBoundingClientRect();
        return {
          docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          viewportOverflowX: viewport.scrollWidth - viewport.clientWidth,
          column: { x: col.x, w: col.width },
        };
      });
    const cardBox = await card.boundingBox();
    const save1 = page.getByRole('button', { name: 'Save' });
    await save1.scrollIntoViewIfNeeded();
    const saveInView = await save1.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight;
    });
    const cardM = await measure();
    await page.screenshot({ path: `${RESULTS}/P-R-${String(vp.width)}-card.png` });
    await spaGoto(page, `/session/${HISTORY_ANALYZING}/feedback`);
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'low-quality');
    await settleImages(page);
    const fbM = await measure();
    await page.screenshot({ path: `${RESULTS}/P-R-${String(vp.width)}-feedback.png` });
    save(`P-R-${String(vp.width)}`, { cardBox, saveInView, cardM, fbM });
    for (const m of [cardM, fbM]) {
      expect(m.docOverflowX).toBe(0);
      expect(m.viewportOverflowX).toBe(0);
      expect(m.column.w).toBeLessThanOrEqual(480);
      expect(Math.abs(m.column.x * 2 + m.column.w - vp.width)).toBeLessThanOrEqual(1);
    }
    expect(saveInView).toBe(true);
  });
}

/* ---------- P-C ---------- */
test('P-C1 auto_timeout 완료 → 카드 제출 가능', async ({ page }) => {
  await page.clock.install();
  const sessionId = await startSession(page);
  for (let attempt = 0; ; attempt += 1) {
    const now = await page.evaluate(() => Date.now());
    try {
      await page.clock.pauseAt(now + 250);
      break;
    } catch (error) {
      if (attempt >= 5) throw error;
    }
  }
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.clock.fastForward(1_800_000);
  await page.clock.runFor(500);
  await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/complete$`));
  await expect(page.getByRole('region', { name: TITLE })).toBeVisible();
  await page.getByRole('radio', { name: '3 stars' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.clock.runFor(3_000);
  await expect.poll(async () => (await requestPayloads(page, SUBMIT_OP)).length).toBe(1);
  const payload = (await requestPayloads(page, SUBMIT_OP))[0];
  save('P-C1-auto-timeout', { payload });
});

test('P-C2 crash 복구 세션 → 완료 화면 카드 제출 가능', async ({ page }) => {
  await logInToHome(page, 'recorder:crash-recovered');
  await expect
    .poll(async () =>
      (await requestPayloads(page, 'POST /v1/sessions/:sessionId/transitions')).map(
        (p) => (p as { completedReason?: string }).completedReason,
      ),
    )
    .toContain('recovered_after_crash');
  await spaGoto(page, '/session/66666666-6666-4666-8666-000000000001/complete');
  const card = page.getByRole('region', { name: TITLE });
  const visible = await card
    .waitFor({ state: 'visible', timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  const ops: string[] = [];
  if (visible) {
    await page.getByRole('button', { name: 'Engaged' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect.poll(async () => (await requestPayloads(page, SUBMIT_OP)).length).toBe(1);
  }
  ops.push(...(await requestOperations(page)));
  save('P-C2-crash-recovered', { visible, url: page.url(), ops });
  expect(visible).toBe(true);
});
