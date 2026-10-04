/** QA probe — intro 2화면 세로 실측 (Figma `243:1147` · `179:1748` 대조). */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

for (const [path, name] of [
  ['/onboarding/start', '243:1147'],
  ['/onboarding', '179:1748'],
] as const) {
  test(`QA: intro geometry ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await gotoApp(page, path);
    await page.getByRole('button', { name: /^(Start the questions|Start|Pick up where you left off)$/ }).waitFor();
    const info = await page.evaluate(() => {
      const g = (el: Element | null | undefined) => {
        if (el === null || el === undefined) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      };
      const main = document.querySelector('main');
      const h1 = main?.querySelector('h1');
      const rows = [...(main?.querySelectorAll('.haru-info-row') ?? [])];
      const btn = main?.querySelector('button:not([aria-label])');
      const art = main?.querySelector('.haru-character, img, svg[width], [class*="character"]');
      const bodies = [...(main?.querySelectorAll('p') ?? [])];
      return {
        viewportH: window.innerHeight,
        main: g(main),
        character: g(art),
        h1: g(h1),
        h1text: (h1?.textContent ?? '').slice(0, 50),
        body: g(bodies[0]),
        bodyText: (bodies[0]?.textContent ?? '').slice(0, 90),
        infoRows: rows.map((r) => ({ ...g(r), t: (r.textContent ?? '').trim().slice(0, 40) })),
        cta: g(btn),
        ctaText: (btn?.textContent ?? '').trim(),
        docH: document.documentElement.scrollHeight,
      };
    });
    // eslint-disable-next-line no-console
    console.log(`QA-INTRO ${path} (Figma ${name})\n` + JSON.stringify(info, null, 1));
    expect(info.main).not.toBeNull();
  });
}
