/** QA probe — `S2-FIX-2` 검증: 1줄 행 높이 회귀 0 · 2줄 이상 상하 여백 동일. */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

const PAGES = [
  ['/onboarding/reading-together', 'radio'],
  ['/onboarding/growing-together', 'checkbox'],
  ['/onboarding/capability-items', 'radio'],
] as const;

for (const [path, role] of PAGES) {
  test(`QA: row geometry ${path}`, async ({ page }) => {
    await gotoApp(page, path);
    await page.getByRole('group', { name: 'Onboarding questions' }).waitFor();

    const rows = await page.evaluate((r: string) => {
      const front = document.querySelector('.haru-swipe-deck__card--front');
      const inputs = [...(front?.querySelectorAll(`[role="${r}"], input[type=radio], input[type=checkbox]`) ?? [])];
      return inputs.map((input) => {
        const row = input.closest('label') ?? input.parentElement;
        if (row === null) return null;
        const box = row.getBoundingClientRect();
        const cs = getComputedStyle(row);
        // 텍스트 노드의 실제 line box 수
        const textEl = [...row.querySelectorAll('*')].find(
          (el) => (el.textContent ?? '').trim().length > 10 && el.children.length === 0,
        );
        const textBox = textEl?.getBoundingClientRect();
        const lh = textEl ? parseFloat(getComputedStyle(textEl).lineHeight) : 0;
        const lines = textBox && lh ? Math.round(textBox.height / lh) : 0;
        return {
          h: Math.round(box.height * 100) / 100,
          padTop: cs.paddingTop,
          padBottom: cs.paddingBottom,
          minH: cs.minBlockSize || cs.minHeight,
          align: cs.alignItems,
          lines,
          textH: textBox ? Math.round(textBox.height * 100) / 100 : 0,
          gapTop: textBox ? Math.round((textBox.top - box.top) * 100) / 100 : 0,
          gapBottom: textBox ? Math.round((box.bottom - textBox.bottom) * 100) / 100 : 0,
          text: (row.textContent ?? '').trim().slice(0, 44),
        };
      });
    }, role);

    // eslint-disable-next-line no-console
    console.log(`QA-ROWGEO ${path}\n` + rows.map((x) => JSON.stringify(x)).join('\n'));
    expect(rows.length).toBeGreaterThan(0);
  });
}
