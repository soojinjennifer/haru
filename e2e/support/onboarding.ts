/**
 * 온보딩 완주 도우미 — `/onboarding/saved` 는 **인증 + 동의 + 제출 이후**에만 열린다
 * (`resolveGuardDecision` 예외 ③). 세션은 메모리에만 있으므로 `page.goto` 로 바로 갈 수 없고,
 * Trial 5단계 → 가입 → 동의 → 재개 → 제출까지 **같은 SPA 수명 안에서** 이동해야 한다.
 *
 * `QA-2-002` 로 드러난 `/onboarding/saved` 레이아웃 회귀를 baseline 으로 잡으려면 이 경로가
 * 필요하다. `e2e/visual.spec.ts` 가 쓴다.
 */
import { expect, type Page } from '@playwright/test';

import { gotoApp } from './gallery';

const REQUIRED_CONSENTS = ['Terms of Service', 'Privacy Policy', "Recording your child's voice"];

/** SelectTrigger 는 Sheet 안의 RadioGroup 으로 값을 고른다 (§4.1). */
async function pickFromSheet(page: Page, trigger: RegExp, option: string): Promise<void> {
  await page.getByRole('button', { name: trigger }).click();
  await page.getByRole('radio', { name: option, exact: true }).click();
}

/**
 * Trial 로 5단계를 채우고 가입·동의를 거쳐 제출까지 마친다. 끝나면 `/onboarding/saved` 다.
 *
 * 생년월은 제출 schema 의 3~9세 범위를 지켜야 한다 — 실행 연도에서 6년을 뺀다.
 */
export async function completeOnboardingToSaved(page: Page): Promise<void> {
  await gotoApp(page, '/onboarding?scenario=me:consent-missing');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page).toHaveURL(/\/onboarding\/child-info$/);

  await page.getByLabel('First name').fill('Yuna');
  const birthYear = String(new Date().getUTCFullYear() - 6);
  await pickFromSheet(page, /Birth year/, birthYear);
  await pickFromSheet(page, /Birth month/, '04');
  await pickFromSheet(page, /Gender/, 'Girl');
  await page.getByRole('button', { name: 'English' }).click();

  // Step 2~4 는 선택이다 (결정 D-C).
  for (const path of [/\/temperament$/, /\/books$/, /\/goals$/, /\/capability-items$/]) {
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(path);
  }

  const deck = page.getByRole('group', { name: 'Baseline questions' });
  for (let index = 0; index < 10; index += 1) {
    const option = deck.getByRole('radio').nth(2);
    await option.click();
    await expect(option).toBeChecked();
    if (index < 9) await page.getByRole('button', { name: 'Next question' }).click();
  }

  // Trial 이므로 마지막 CTA 는 제출이 아니라 가입이다 (§2.12).
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page).toHaveURL(/\/auth\/sign-up$/);

  await page.getByLabel('Your name').fill('Sam Rivera');
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/auth\/consent$/);

  for (const title of REQUIRED_CONSENTS) {
    await page.getByRole('checkbox', { name: new RegExp(title) }).click();
  }
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);

  // 기기 draft 가 남아 있으므로 소개 화면 CTA 가 "이어서" 로 바뀐다.
  await page.getByRole('button', { name: 'Pick up where you left off' }).click();
  await expect(page).toHaveURL(/\/onboarding\/capability-items$/);

  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page).toHaveURL(/\/onboarding\/saved$/);
}
