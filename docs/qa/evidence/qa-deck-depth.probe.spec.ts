/** QA probe — `AC-2R-03`: 덱 depth 3 · Y 오프셋 16 · 좌우 각 8 폭 감소. */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

for (const path of ['/onboarding/capability-items', '/onboarding/reading-together']) {
  test(`QA: deck depth ${path}`, async ({ page }) => {
    await gotoApp(page, path);
    await page.getByRole('group', { name: 'Onboarding questions' }).waitFor();
    const info = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.haru-swipe-deck__card')];
      return cards.map((c) => {
        const r = c.getBoundingClientRect();
        return {
          cls: c.className.toString().replace('haru-swipe-deck__card', '').trim().slice(0, 40),
          x: Math.round(r.x * 10) / 10,
          y: Math.round(r.y * 10) / 10,
          w: Math.round(r.width * 10) / 10,
          h: Math.round(r.height * 10) / 10,
        };
      });
    });
    // eslint-disable-next-line no-console
    console.log(`QA-DEPTH ${path} count=${String(info.length)}\n` + info.map((x) => JSON.stringify(x)).join('\n'));
    expect(info.length).toBeGreaterThan(0);
  });
}
