/**
 * design-agent Visual Gap RE-REVIEW probe — Stage 5 S5-C (temporary; copied to e2e/ to run, removed after).
 * Feedback screen states: geometry + computed + a11y structure at 393 and 320; complete-screen comparison;
 * reflection-card chip hit split at 320 (3 rows).
 */
import { writeFileSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

import { hideDevPanel } from './support/gallery';
import { logInToHome, settleImages } from './support/session';

const OUT = 'docs/qa/evidence/stage-5/visual-gap-s5c-rereview';
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
      slotAttrs: { live: slot.getAttribute('aria-live'), role: slot.getAttribute('role'), atomic: slot.getAttribute('aria-atomic') },
      innerLiveCount: slot.querySelectorAll('[aria-live]').length,
      innerRoleCount: slot.querySelectorAll('[role]').length,
      innerRoles: [...slot.querySelectorAll('[role]')].map((e) => e.getAttribute('role')),
      wrapperCss: cs(slot.querySelector('.haru-session-feedback__alert, .haru-session-feedback__loading'), ['display','flex-direction','justify-content','align-items','inline-size']),
      wrapperBox: r(slot.querySelector('.haru-session-feedback__alert, .haru-session-feedback__loading')),
      surface: r(slot.querySelector('.haru-surface')),
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

