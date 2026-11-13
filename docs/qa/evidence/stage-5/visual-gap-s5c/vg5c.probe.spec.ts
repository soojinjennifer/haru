/**
 * design-agent Visual Gap probe — Stage 5 S5-C (temporary; copied to e2e/ to run, removed after).
 * Feedback screen states: geometry + computed + a11y structure at 393 and 320; complete-screen comparison;
 * reflection-card chip hit split at 320 (3 rows).
 */
import { writeFileSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

import { hideDevPanel } from './support/gallery';
import { logInToHome, settleImages, startSession } from './support/session';

const OUT = 'docs/qa/evidence/stage-5/visual-gap-s5c';
const SESSION = '77777777-7777-4777-8777-000000000002';
const SLOT = '.haru-session-feedback__state';

const STATES: { name: string; scenario?: string; path?: string; state: string }[] = [
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

async function spaGoto(page: Page, path: string) {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function dumpFeedback(page: Page) {
  return page.evaluate((slotSel) => {
    const r = (el: Element | null) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
    };
    const cs = (el: Element | null, keys: string[]) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return Object.fromEntries(keys.map((k) => [k, s.getPropertyValue(k)]));
    };
    const slot = document.querySelector(slotSel)!;
    const h1 = document.querySelector('.haru-session-feedback h1');
    const bubble = slot.querySelector('.haru-bubble');
    const bubbleBody = bubble ? (bubble.querySelector('[class*="body"]') ?? bubble) : null;
    const alerts = [...slot.querySelectorAll('.haru-alert')];
    const errorState = slot.querySelector('.haru-error-state, [class*="error-state"]');
    const live = [...document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')]
      .filter((el) => slot === el || slot.contains(el) || el.contains(slot))
      .map((el) => ({
        tag: el.tagName,
        cls: (el as HTMLElement).className.toString().slice(0, 60),
        role: el.getAttribute('role'),
        live: el.getAttribute('aria-live'),
        atomic: el.getAttribute('aria-atomic'),
      }));
    const close = document.querySelector('.haru-session-feedback__close button');
    return {
      viewport: [innerWidth, innerHeight],
      state: slot.getAttribute('data-state'),
      h1: { box: r(h1), text: h1?.textContent, css: cs(h1, ['font-size', 'font-weight', 'line-height', 'color']) },
      close: { box: r(close), label: close?.getAttribute('aria-label') },
      ring: { box: r(document.querySelector('.haru-session-feedback__ring')), css: cs(document.querySelector('.haru-session-feedback__ring'), ['background-color', 'box-shadow']) },
      avatar: r(document.querySelector('.haru-session-feedback .haru-character-medallion')),
      sticker: document.querySelectorAll('.haru-attendance-sticker').length,
      slot: r(slot),
      bubble: bubble
        ? {
            box: r(bubble),
            text: bubble.textContent,
            css: cs(bubble, ['background-color', 'border-radius', 'box-shadow', 'padding']),
            body: cs(bubbleBody, ['background-color', 'border-radius', 'box-shadow', 'padding']),
            textCss: cs(bubble.querySelector('p, span') ?? bubble, ['font-size', 'font-weight', 'line-height', 'color']),
          }
        : null,
      alerts: alerts.map((a) => ({ box: r(a), css: cs(a, ['background-color', 'border', 'border-radius', 'box-shadow']) })),
      errorState: errorState ? { cls: (errorState as HTMLElement).className, box: r(errorState), css: cs(errorState, ['max-inline-size', 'inline-size', 'background-color', 'border-radius', 'box-shadow']) } : null,
      buttons: [...slot.querySelectorAll('button')].map((b) => ({ name: b.textContent?.trim(), box: r(b) })),
      live,
      scroll: [document.documentElement.scrollWidth - document.documentElement.clientWidth],
    };
  }, SLOT);
}

for (const vp of [
  { w: 393, h: 852 },
  { w: 320, h: 568 },
]) {
  test.describe(`feedback ${vp.w}`, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });
    test.beforeEach(async ({ page }) => hideDevPanel(page));
    for (const s of STATES) {
      test(`${s.name}`, async ({ page }) => {
        if (s.name === 'loading') await page.clock.install();
        await logInToHome(page, s.scenario);
        await spaGoto(page, s.path ?? `/session/${SESSION}/feedback`);
        await expect(page.locator(SLOT)).toHaveAttribute('data-state', s.state);
        if (s.name !== 'loading') await settleImages(page);
        await page.mouse.move(0, 0);
        const d = await dumpFeedback(page);
        writeFileSync(`${OUT}/computed-${vp.w}-${s.name}.json`, JSON.stringify(d, null, 2));
        await page.screenshot({ path: `${OUT}/impl-${vp.w}-${s.name}.png`, fullPage: false });
      });
    }
  });
}

test.describe('complete vs feedback 393', () => {
  test.use({ viewport: { width: 393, height: 852 } });
  test.beforeEach(async ({ page }) => hideDevPanel(page));
  test('complete-screen skeleton + bubble computed', async ({ page }) => {
    await logInToHome(page, 'analysis:analysis-completed');
    await spaGoto(page, `/session/${SESSION}/complete`);
    await expect(page.locator('.haru-session-complete__bubble .haru-bubble')).toBeVisible();
    await settleImages(page);
    const complete = await page.evaluate(() => {
      const r = (s: string) => {
        const e = document.querySelector(s);
        if (!e) return null;
        const b = e.getBoundingClientRect();
        return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
      };
      const h1 = document.querySelector('.haru-session-complete h1')!;
      const ring = document.querySelector('.haru-session-complete__ring')!;
      const bubble = document.querySelector('.haru-session-complete__bubble .haru-bubble')!;
      const s = (e: Element, k: string[]) => Object.fromEntries(k.map((x) => [x, getComputedStyle(e).getPropertyValue(x)]));
      return {
        h1: { box: r('.haru-session-complete h1'), css: s(h1, ['font-size', 'font-weight', 'line-height', 'color']) },
        close: { box: r('.haru-session-complete__close button'), label: document.querySelector('.haru-session-complete__close button')?.getAttribute('aria-label') },
        ring: { box: r('.haru-session-complete__ring'), css: s(ring, ['background-color', 'box-shadow']) },
        avatar: r('.haru-session-complete .haru-character-medallion'),
        bubble: { box: r('.haru-session-complete__bubble .haru-bubble'), css: s(bubble, ['background-color', 'border-radius', 'box-shadow', 'padding']), html: bubble.outerHTML.slice(0, 600) },
      };
    });
    writeFileSync(`${OUT}/computed-393-complete-reference.json`, JSON.stringify(complete, null, 2));
    await page.screenshot({ path: `${OUT}/impl-393-complete-reference.png` });
    // feedback bubble html for structural comparison
    await spaGoto(page, `/session/${SESSION}/feedback`);
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'analyzed');
    const html = await page.locator(`${SLOT} .haru-bubble`).evaluate((e) => e.outerHTML.slice(0, 600));
    writeFileSync(`${OUT}/bubble-html.json`, JSON.stringify({ complete: complete.bubble.html, feedback: html }, null, 2));
  });
});

/* ---- reflection card chip hit split @320 (3 rows) ---- */
async function submitSession(page: Page) {
  const sessionId = await startSession(page);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/complete$`));
  await expect(page.locator('.haru-reflection-card')).toBeVisible();
  await settleImages(page);
}

for (const selected of [[], ['Big feelings', 'Stay Focus'], ['Engaged', 'Ask Questions', 'Tricky today']] as string[][]) {
  test.describe(`chip split 320 [${selected.join('+') || 'none'}]`, () => {
    // tall viewport so the whole card is inside the viewport without scrolling (elementFromPoint)
    test.use({ viewport: { width: 320, height: 1100 } });
    test.beforeEach(async ({ page }) => hideDevPanel(page));
    test('scan', async ({ page }) => {
      await submitSession(page);
      for (const name of selected) await page.getByRole('button', { name }).click();
      await page.mouse.move(0, 0);
      const card = page.locator('.haru-reflection-card');
      await card.scrollIntoViewIfNeeded();
      const res = await page.evaluate(() => {
        const card = document.querySelector('.haru-reflection-card')!;
        const chips = [...card.querySelectorAll<HTMLElement>('.haru-chip')];
        const gap = parseFloat(getComputedStyle(card).getPropertyValue('--reflection-chip-gap'));
        const rows: HTMLElement[][] = [];
        for (const c of chips) {
          const t = c.offsetTop;
          const row = rows.find((r) => r[0]!.offsetTop === t);
          if (row) row.push(c);
          else rows.push([c]);
        }
        const owner = (x: number, y: number) => {
          const hit = document.elementFromPoint(x, y);
          return chips.find((c) => hit !== null && c.contains(hit))?.textContent ?? null;
        };
        // hit extent at chip center x, 0.25px scan
        const extent = (c: HTMLElement) => {
          const b = c.getBoundingClientRect();
          const x = b.left + b.width / 2;
          let top = b.top + b.height / 2;
          while (owner(x, top - 0.25) === c.textContent) top -= 0.25;
          let bot = b.top + b.height / 2;
          while (owner(x, bot + 0.25) === c.textContent) bot += 0.25;
          return { name: c.textContent, boxTop: +b.top.toFixed(2), boxBottom: +b.bottom.toFixed(2), hitTop: top, hitBottom: bot, hitH: +(bot - top).toFixed(2), centerOffsetTop: +(b.top + b.height / 2 - top).toFixed(2), centerOffsetBottom: +(bot - (b.top + b.height / 2)).toFixed(2), follows: c.getAttribute('data-chip-row-follows') };
        };
        const pairs: unknown[] = [];
        for (let i = 0; i + 1 < rows.length; i++) {
          const upper = rows[i]!;
          const lower = rows[i + 1]!;
          const lowerTop = Math.min(...lower.map((c) => c.getBoundingClientRect().top));
          const upperBottomMax = Math.max(...upper.map((c) => c.getBoundingClientRect().bottom));
          const midline = lowerTop - gap / 2;
          for (const u of upper) {
            for (const l of lower) {
              const ub = u.getBoundingClientRect();
              const lb = l.getBoundingClientRect();
              const left = Math.max(ub.left, lb.left);
              const right = Math.min(ub.right, lb.right);
              if (right - left < 2) continue;
              const x = (left + right) / 2;
              // find actual switch y between ub.bottom and lb.top
              let y = ub.bottom;
              while (y < lb.top && owner(x, y) === u.textContent) y += 0.25;
              pairs.push({
                rowPair: `${i}->${i + 1}`,
                upper: u.textContent,
                lower: l.textContent,
                upperBottom: +ub.bottom.toFixed(2),
                lowerTop: +lb.top.toFixed(2),
                midline: +midline.toFixed(2),
                geometricMid: +((upperBottomMax + lowerTop) / 2).toFixed(2),
                switchAt: y,
                switchMinusMidline: +(y - midline).toFixed(2),
                at_mid_minus1: owner(x, midline - 1),
                at_mid_plus1: owner(x, midline + 1),
              });
            }
          }
        }
        return { gap, rowCount: rows.length, rows: rows.map((r) => r.map((c) => c.textContent)), extents: chips.map(extent), pairs };
      });
      writeFileSync(`${OUT}/chip-split-320-${selected.join('+') || 'none'}.json`, JSON.stringify(res, null, 2));
      const b = await card.boundingBox();
      if (b) await page.screenshot({ path: `${OUT}/impl-320-card-${selected.join('+') || 'none'}.png`, clip: { x: b.x - 4, y: b.y, width: b.width + 8, height: b.height + 10 } });
    });
  });
}
