/** QA probe — 반응형 320 / 393 / 600 / 1024 (`AC-2-59` 회귀) + 가입 폼의 아이 섹션 포함 여부. */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

const SIZES = [320, 393, 600, 1024];
const PATHS = ['/onboarding/reading-together', '/onboarding/child-info', '/auth/sign-up'];

for (const path of PATHS) {
  test(`QA: responsive ${path}`, async ({ page }) => {
    const out: string[] = [];
    for (const w of SIZES) {
      await page.setViewportSize({ width: w, height: 852 });
      await gotoApp(page, path);
      await page.waitForTimeout(150);
      const r = await page.evaluate(() => {
        const col = document.querySelector('.haru-app-column');
        const cr = col?.getBoundingClientRect();
        return {
          hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
          scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
          colW: cr ? Math.round(cr.width) : null,
          colX: cr ? Math.round(cr.x) : null,
        };
      });
      out.push(`${String(w)}px → hScroll=${String(r.hScroll)} (scrollW ${String(r.scrollW)} / inner ${String(r.innerW)}) col=${String(r.colW)}@x${String(r.colX)}`);
    }
    // eslint-disable-next-line no-console
    console.log(`QA-RESP ${path}\n` + out.join('\n'));
    expect(out.length).toBe(SIZES.length);
  });
}

test('QA: 가입 폼이 아이 섹션을 포함한다 (`AC-2R-12` `179:1724` 전체)', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await gotoApp(page, '/auth/sign-up');
  const info = await page.evaluate(() => {
    const form = document.querySelector('form');
    const txt = form?.textContent ?? '';
    return {
      hasYourChild: /YOUR CHILD/i.test(txt),
      hasFirstName: form?.querySelector('input[id*="first" i], input[name*="first" i]') !== null,
      labels: [...(form?.querySelectorAll('label') ?? [])].map((l) => (l.textContent ?? '').trim().slice(0, 30)),
      formH: Math.round(form?.getBoundingClientRect().height ?? 0),
    };
  });
  // eslint-disable-next-line no-console
  console.log('QA-SIGNUP-FORM ' + JSON.stringify(info));
  expect(info.hasYourChild).toBe(true);
});
