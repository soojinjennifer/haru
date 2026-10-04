/** QA 독립 probe — 카드 덱을 끝까지 걸어가며 각 카드의 상태를 덤프한다. */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

test('QA: deck walk — 카드별 제목 · 카운터 · 전진 가능 여부', async ({ page }) => {
  await gotoApp(page, '/onboarding/reading-together');

  const rows: string[] = [];

  for (let i = 0; i < 25; i += 1) {
    const url = new URL(page.url()).pathname;
    const banner = (await page.locator('.haru-top-bar').first().innerText()).replace(/\n+/g, ' | ');
    const h2 = await page.getByRole('heading', { level: 2 }).count();
    const h2text = h2 > 0 ? await page.getByRole('heading', { level: 2 }).first().innerText() : '-';
    const next = page.getByRole('button', { name: 'Next question' });
    const nextCount = await next.count();
    const ariaDisabled = nextCount ? await next.getAttribute('aria-disabled') : 'n/a';
    const nativeDisabled = nextCount ? await next.isDisabled() : null;
    const radios = await page.getByRole('radio').count();
    const checks = await page.getByRole('checkbox').count();
    const submitCta = await page
      .getByRole('button', { name: /^(Save profile|Finish)$/ })
      .count();
    const bottomButtons = await page.locator('main button, footer button').count();

    rows.push(
      `#${String(i)} url=${url} h2count=${String(h2)} h2="${h2text.replace(/\n/g, ' ')}" banner="${banner}" next(aria-disabled=${String(ariaDisabled)}, native=${String(nativeDisabled)}) radios=${String(radios)} checks=${String(checks)} submitCTA=${String(submitCta)}`,
    );

    // 답한다 (키보드 — 자동 전진 회피).
    if (radios > 0) {
      await page.getByRole('radio').first().focus();
      await page.keyboard.press('Space');
    } else if (checks > 0) {
      await page.getByRole('checkbox').first().focus();
      await page.keyboard.press('Space');
    }

    const after = nextCount ? await next.getAttribute('aria-disabled') : 'n/a';
    rows[rows.length - 1] += ` -> afterAnswer(aria-disabled=${String(after)})`;

    if (!nextCount || (await next.isDisabled())) break;
    if (after === 'true') {
      rows[rows.length - 1] += ' !! STUCK';
      break;
    }
    await next.click();
    await page.waitForTimeout(250);
  }

  // eslint-disable-next-line no-console
  console.log('QA-DECK-WALK\n' + rows.join('\n'));
  expect(rows.length).toBeGreaterThan(0);
});
