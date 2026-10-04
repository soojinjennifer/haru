/** QA probe — `S2-FIX-1`: 마지막 블록 bottom → 화면 bottom = max(safe-bottom, 44). */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

const ROUTES = [
  '/', '/settings', '/auth/welcome', '/auth/sign-up', '/auth/log-in',
  '/auth/forgot-password', '/onboarding', '/onboarding/start',
  '/onboarding/child-info', '/onboarding/reading-together',
  '/onboarding/books-and-interests', '/onboarding/growing-together',
  '/onboarding/capability-items',
];

test('QA: StackLayout 하단 인셋 13 route', async ({ page }) => {
  const rows: string[] = [];
  for (const path of ROUTES) {
    await gotoApp(page, path);
    await page.waitForTimeout(120);
    const r = await page.evaluate(() => {
      const col = document.querySelector('.haru-app-column');
      if (col === null) return null;
      const cs = getComputedStyle(col);
      return {
        padBottom: cs.paddingBottom,
        hasGapClass: col.classList.contains('haru-app-column--bottom-gap'),
        url: location.pathname,
      };
    });
    rows.push(`${path} → padding-block-end=${String(r?.padBottom)} gapClass=${String(r?.hasGapClass)} landedOn=${String(r?.url)}`);
  }
  // eslint-disable-next-line no-console
  console.log('QA-BOTTOMGAP\n' + rows.join('\n'));
  expect(rows.length).toBe(ROUTES.length);
});
