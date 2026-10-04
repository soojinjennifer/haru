/** QA probe — 부록 A-6-2: draft 가 있을 때 `Pick up where you left off` 가 여전히 도달 가능한가. */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';
import { fillChildInfo } from '../../../e2e/support/onboarding';

test('QA: resume CTA 도달 경로', async ({ page }) => {
  const log: string[] = [];

  // ① Trial 로 진입해 draft 를 만든다.
  await gotoApp(page, '/onboarding/start');
  await page.getByRole('button', { name: 'Start the questions' }).click();
  await fillChildInfo(page);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);

  const ctaFirst = await page
    .getByRole('button', { name: /^(Start|Pick up where you left off)$/ })
    .innerText();
  log.push(`① /onboarding 최초 CTA = "${ctaFirst}"`);

  await page.getByRole('button', { name: /^(Start|Pick up where you left off)$/ }).click();
  await expect(page).toHaveURL(/\/onboarding\/reading-together$/);

  // ② 카드 1장 답해 진행 상태를 만든다.
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);

  // ③ 리로드 — Guard 가 draft 를 보고 어디로 보내는가.
  await gotoApp(page, '/onboarding');
  log.push(`② /onboarding 재방문 후 url = ${new URL(page.url()).pathname}`);
  const resumeVisible = await page
    .getByRole('button', { name: 'Pick up where you left off' })
    .count();
  log.push(`③ 재방문 시 resume CTA 노출 = ${String(resumeVisible)}건`);

  // ④ 카드 단계에서 leading chevron(첫 카드) 으로 뒤로 → intro 로 돌아가는가.
  await gotoApp(page, '/onboarding/reading-together');
  const back = page.getByRole('button', { name: /^(Go back|Previous question)$/ });
  const backLabel = await back.getAttribute('aria-label');
  log.push(`④ 첫 카드 leading aria-label = ${String(backLabel)}`);
  await back.click();
  await page.waitForTimeout(400);
  log.push(`⑤ 뒤로 누른 뒤 url = ${new URL(page.url()).pathname}`);
  const resumeAfterBack = await page
    .getByRole('button', { name: 'Pick up where you left off' })
    .count();
  log.push(`⑥ 그 화면의 resume CTA = ${String(resumeAfterBack)}건`);

  // eslint-disable-next-line no-console
  console.log('QA-RESUME\n' + log.join('\n'));
  expect(log.length).toBeGreaterThan(0);
});
