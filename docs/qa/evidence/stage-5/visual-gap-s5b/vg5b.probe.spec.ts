/**
 * design-agent Visual Gap probe — Stage 5 S5-B (temporary; moved to docs/qa/evidence/stage-5/visual-gap-s5b/ after run).
 */
import { writeFileSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

import { hideDevPanel } from './support/gallery';
import { logInToHome, settleImages, startSession } from './support/session';

const OUT = 'docs/qa/evidence/stage-5/visual-gap-s5b';
const CARD = '.haru-reflection-card';
const TITLE = 'How was storytime with Nova?';
const HISTORY_SESSION = '77777777-7777-4777-8777-000000000001';

test.use({ viewport: { width: 393, height: 852 } });
test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

async function submitSession(page: Page, scenario?: string) {
  const sessionId = await startSession(page, scenario);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/complete$`));
  await expect(page.getByRole('region', { name: TITLE })).toBeVisible();
  await settleImages(page);
}

async function shoot(page: Page, name: string) {
  await page.screenshot({ path: `${OUT}/impl-${name}-frame.png` });
  const b = await page.locator(CARD).boundingBox();
  if (b) {
    await page.screenshot({
      path: `${OUT}/impl-${name}-card.png`,
      clip: { x: b.x - 4, y: b.y, width: b.width + 8, height: b.height + 10 },
    });
  }
}

async function dump(page: Page, name: string) {
  const data = await page.evaluate((cardSel) => {
    const card = document.querySelector(cardSel) as HTMLElement;
    const r0 = card.getBoundingClientRect();
    const pick = (el: Element) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        cls: (el as HTMLElement).className,
        text: (el.textContent ?? '').trim().slice(0, 60),
        x: +(r.x - r0.x).toFixed(2),
        y: +(r.y - r0.y).toFixed(2),
        w: +r.width.toFixed(2),
        h: +r.height.toFixed(2),
        bg: cs.backgroundColor,
        color: cs.color,
        fill: cs.fill,
        font: `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily.slice(0, 40)}`,
        border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
        radius: cs.borderRadius,
        shadow: cs.boxShadow,
        filter: cs.filter,
        backdrop: cs.backdropFilter,
        overflow: `${cs.overflowX}/${cs.overflowY}`,
        padding: cs.padding,
        gap: cs.gap,
        opacity: cs.opacity,
        textAlign: cs.textAlign,
      };
    };
    const sel = [
      '.haru-reflection-card__title',
      '.haru-star-rating',
      '.haru-star-rating__glyph',
      '.haru-reflection-card__checks',
      '.haru-chip',
      '.haru-chip *',
      '.haru-text-input',
      '.haru-text-input input',
      '.haru-button',
      '.haru-button *',
    ];
    const out: Record<string, unknown> = {
      card: { x: r0.x, y: r0.y, w: r0.width, h: r0.height, ...pick(card) },
      viewportScroll: (() => {
        const v = document.querySelector('[data-app-shell-viewport]') as HTMLElement | null;
        return v ? { scrollHeight: v.scrollHeight, clientHeight: v.clientHeight, scrollTop: v.scrollTop } : null;
      })(),
      placeholderColor: (() => {
        const i = card.querySelector('input');
        return i ? getComputedStyle(i, '::placeholder').color : null;
      })(),
    };
    for (const s of sel) out[s] = [...card.querySelectorAll(s)].map(pick);
    return out;
  }, CARD);
  writeFileSync(`${OUT}/computed-${name}.json`, JSON.stringify(data, null, 2));
}

test('empty', async ({ page }) => {
  await submitSession(page);
  await shoot(page, 'empty');
  await dump(page, 'empty');
});

test('filled (4 stars + Engaged + Ask Questions)', async ({ page }) => {
  await submitSession(page);
  await page.getByRole('radio', { name: /^4 stars?$/ }).click();
  await page.getByRole('button', { name: 'Engaged' }).click();
  await page.getByRole('button', { name: 'Ask Questions' }).click();
  await page.mouse.move(0, 0);
  await page.locator('body').click({ position: { x: 2, y: 2 }, force: true }).catch(() => {});
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await settleImages(page);
  await shoot(page, 'filled');
  await dump(page, 'filled');
});

test('saving', async ({ page }) => {
  await submitSession(page, 'reflections:loading');
  await page.getByRole('radio', { name: /^4 stars?$/ }).click();
  await page.getByRole('button', { name: 'Engaged' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(300);
  await shoot(page, 'saving');
  await dump(page, 'saving');
});

test('failed', async ({ page }) => {
  await submitSession(page, 'reflections:error');
  await page.getByRole('radio', { name: /^4 stars?$/ }).click();
  await page.getByRole('button', { name: 'Engaged' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('status').or(page.getByRole('alert')).first()).toBeVisible();
  await page.waitForTimeout(500);
  await shoot(page, 'failed');
  await dump(page, 'failed');
});

test('saved read-only re-entry', async ({ page }) => {
  await logInToHome(page, 'session-completion:reflection-submitted');
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, `/session/${HISTORY_SESSION}/complete`);
  await expect(page.locator(CARD)).toBeVisible();
  await settleImages(page);
  await shoot(page, 'readonly');
  await dump(page, 'readonly');
});
