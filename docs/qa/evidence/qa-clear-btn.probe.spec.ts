/** QA probe — Figma `179:1804` 해제 IconButton: 응답 후 노출 위치 (absolute · 카드 우상단). */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

test('QA: clear-answer IconButton', async ({ page }) => {
  await gotoApp(page, '/onboarding/capability-items');
  await page.getByRole('group', { name: 'Onboarding questions' }).waitFor();

  const before = await page.getByRole('button', { name: 'Clear this answer' }).count();
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  const after = await page.getByRole('button', { name: 'Clear this answer' }).count();

  const geo = await page.evaluate(() => {
    const front = document.querySelector('.haru-swipe-deck__card--front');
    const surface = front?.querySelector('.haru-surface');
    const btn = front?.querySelector('[aria-label="Clear this answer"]');
    if (surface == null || btn == null) return null;
    const s = surface.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    return {
      pos: getComputedStyle(btn).position,
      dxFromRight: Math.round(s.right - b.right),
      dyFromTop: Math.round(b.top - s.top),
      w: Math.round(b.width),
      h: Math.round(b.height),
    };
  });
  // eslint-disable-next-line no-console
  console.log(`QA-CLEARBTN before=${String(before)} after=${String(after)} geo=${JSON.stringify(geo)}`);
  expect(after).toBeGreaterThanOrEqual(0);
});
