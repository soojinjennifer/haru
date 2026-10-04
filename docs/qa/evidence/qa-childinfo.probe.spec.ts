/** QA probe — `s2-onboarding-childinfo`(인증) baseline 에서 언어 칩 선택이 비어 보이는 원인 확인. */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';
import { seedChildDraft, signUpAndConsent } from '../../../e2e/support/onboarding';

async function dump(page: Page, label: string): Promise<void> {
  const chips = await page
    .getByRole('button', { pressed: true })
    .evaluateAll((els) => els.map((e) => e.textContent ?? ''));
  const name = await page
    .getByRole('button', { name: /Yuna|Nova/ })
    .first()
    .textContent();
  const routine = await page
    .getByRole('radio', { checked: true })
    .evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? e.id));
  // eslint-disable-next-line no-console
  console.log(`QA-CHILDINFO ${label} pressedChips=${JSON.stringify(chips)} nameRow=${String(name)} checkedRadios=${JSON.stringify(routine)}`);
}

test('trial(미로그인 + 로컬 draft)', async ({ page }) => {
  await seedChildDraft(page);
  await gotoApp(page, '/onboarding/child-info');
  await expect(page.getByRole('button', { name: /Yuna/ })).toBeVisible();
  await dump(page, 'trial');
});

test('auth(가입+동의 + prefilled-child-info)', async ({ page }) => {
  await seedChildDraft(page);
  await signUpAndConsent(page, ',onboarding:prefilled-child-info');
  await expect(page).toHaveURL(/\/onboarding\/child-info$/);
  await expect(page.getByRole('button', { name: /Yuna|Nova/ })).toBeVisible();
  await dump(page, 'auth');
});

test('auth — localStorage draft 추적', async ({ page }) => {
  await seedChildDraft(page);
  const read = async (tag: string) => {
    const v = await page.evaluate(() => globalThis.localStorage.getItem('haru.onboarding.draft.v1'));
    // eslint-disable-next-line no-console
    console.log(`QA-LS ${tag} ${String(v)}`);
  };
  await gotoApp(page, '/auth/sign-up?scenario=me:consent-missing,onboarding:prefilled-child-info');
  await read('after-signup-load');
  await signUpAndConsent(page, ',onboarding:prefilled-child-info');
  await expect(page).toHaveURL(/\/onboarding\/child-info$/);
  await read('after-consent');
});
