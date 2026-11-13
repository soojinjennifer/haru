import { writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { hideDevPanel } from './support/gallery';
import { settleImages, startSession } from './support/session';
test.use({ viewport: { width: 320, height: 1100 } });
test('before', async ({ page }) => {
  await hideDevPanel(page);
  const id = await startSession(page);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(new RegExp(`/session/${id}/complete$`));
  await settleImages(page);
  await page.getByRole('button', { name: 'Big feelings' }).click();
  await page.mouse.move(0, 0);
  const r = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.haru-reflection-card .haru-chip')].map((c) => {
    const b = getComputedStyle(c, '::before'); const s = getComputedStyle(c);
    return { name: c.textContent, follows: c.getAttribute('data-chip-row-follows'), h: c.getBoundingClientRect().height, border: s.borderTopWidth, top: b.top, bottom: b.bottom, height: b.height, inset: b.inset, pressed: c.getAttribute('aria-pressed') };
  }));
  writeFileSync('docs/qa/evidence/stage-5/visual-gap-s5c/chip-before-320.json', JSON.stringify(r, null, 2));
});
