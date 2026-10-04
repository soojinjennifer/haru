/** QA probe — 카드 단계의 실제 DOM 구조를 덤프한다. */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

const STEPS = [
  '/onboarding/reading-together',
  '/onboarding/books-and-interests',
  '/onboarding/growing-together',
  '/onboarding/capability-items',
];

for (const path of STEPS) {
  test(`QA: DOM dump ${path}`, async ({ page }) => {
    await gotoApp(page, path);
    await page.getByRole('group', { name: 'Onboarding questions' }).waitFor();
    const info = await page.evaluate(() => {
      const root = document.querySelector('#root') ?? document.body;
      const landmarks = [...root.querySelectorAll('header,[role="banner"],main,footer,nav')].map(
        (el) => `${el.tagName}[role=${el.getAttribute('role') ?? ''}]`,
      );
      const topText = root.textContent?.slice(0, 400) ?? '';
      const outline = root.innerHTML.slice(0, 1600);
      return { landmarks, topText, outline };
    });
    // eslint-disable-next-line no-console
    console.log(`QA-DOM ${path}\nlandmarks=${JSON.stringify(info.landmarks)}\ntext=${info.topText}\n---HTML---\n${info.outline}\n`);
    expect(info.landmarks.length).toBeGreaterThan(0);
  });
}
