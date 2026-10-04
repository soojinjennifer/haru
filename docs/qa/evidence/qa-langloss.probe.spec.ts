/** QA probe — Trial 에서 고른 언어가 가입 제출 시 지워지는지 (해피 패스 실측). */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';
import { fillChildInfo } from '../../../e2e/support/onboarding';

test('Trial 에서 English 선택 → 가입 → draft 의 languageEnvironment', async ({ page }) => {
  const read = async (tag: string) => {
    const v = await page.evaluate(() =>
      globalThis.localStorage.getItem('haru.onboarding.draft.v1'),
    );
    const parsed: { answers?: { child_info?: Record<string, unknown> } } =
      v === null ? {} : JSON.parse(v);
    // eslint-disable-next-line no-console
    console.log(`QA-LANG ${tag} child_info=${JSON.stringify(parsed.answers?.child_info)}`);
  };

  await gotoApp(page, '/onboarding/start?scenario=me:consent-missing');
  await page.getByRole('button', { name: 'Start the questions' }).click();
  await fillChildInfo(page);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await read('after-child-info');

  await gotoApp(page, '/auth/sign-up?scenario=me:consent-missing');
  await page.getByLabel('Your name').fill('Sam Rivera');
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/auth\/consent$/);
  await read('after-sign-up');
});
