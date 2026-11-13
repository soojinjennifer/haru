import { writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { hideDevPanel } from './support/gallery';
import { settleImages, startSession } from './support/session';
test.use({ viewport: { width: 393, height: 852 } });
test('focus rings inside card clip', async ({ page }) => {
  await hideDevPanel(page);
  const id = await startSession(page);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(new RegExp(`/session/${id}/complete$`));
  await settleImages(page);
  await page.getByRole('radio').first().focus();
  const rows: unknown[] = [];
  for (let i = 0; i < 9; i++) {
    const r = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const card = document.querySelector('.haru-reflection-card')!.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const ow = parseFloat(cs.outlineWidth) || 0, oo = parseFloat(cs.outlineOffset) || 0;
      const e = cs.outlineStyle === 'none' ? 0 : ow + oo;
      return { name: el.getAttribute('aria-label') ?? el.textContent?.trim(), outline: `${cs.outlineStyle} ${cs.outlineWidth} off ${cs.outlineOffset}`, shadow: cs.boxShadow.slice(0, 60),
        clipL: b.left - e - card.left, clipR: card.right - (b.right + e), clipT: b.top - e - card.top, clipB: card.bottom - (b.bottom + e) };
    });
    rows.push(r);
    await page.keyboard.press('Tab');
    await page.mouse.move(0, 0);
  }
  await page.getByRole('button', { name: 'Big feelings' }).focus();
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  await page.screenshot({ path: 'docs/qa/evidence/stage-5/visual-gap-s5b/impl-focus-chip.png', clip: { x: 0, y: 540, width: 393, height: 120 } });
  writeFileSync('docs/qa/evidence/stage-5/visual-gap-s5b/focus-rings.json', JSON.stringify(rows, null, 2));
});
