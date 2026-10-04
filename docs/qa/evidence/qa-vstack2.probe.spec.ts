/**
 * QA 재검증 probe (`QA-2R-002` 간격 24) — 세로 간격 실측 + 전 카드 높이 예산 재검산.
 * 393×852 와 320×852 두 폭에서 **인증+동의(16장)** 전수를 걷는다. Product Code 수정 없음.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';
import { cardCounterIndex, fillChildInfo, signUpAndConsent } from '../../../e2e/support/onboarding';

const CTA_GAP = 44; // --layout-cta-bottom-gap = spacing*11
const PEEK = 32;

async function box(page: Page, selector: string) {
  return page.locator(selector).first().boundingBox();
}

async function walkAndMeasure(page: Page, width: number): Promise<void> {
  await page.setViewportSize({ width, height: 852 });

  await signUpAndConsent(page);
  // 동의 직후 복귀 지점은 그 단계의 첫 화면이다 (`§11.19` 7-2).
  await expect(page).toHaveURL(/\/onboarding\/start$/);
  await page.getByRole('button', { name: 'Start the questions' }).click();
  await expect(page).toHaveURL(/\/onboarding\/child-info$/);
  await fillChildInfo(page);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: /^(Start|Pick up where you left off)$/ }).click();
  await expect(page).toHaveURL(/reading-together$/);

  const topBar = await box(page, '.haru-top-bar');
  const progress = await box(page, '[role="progressbar"]');
  const firstCard = await box(page, '.haru-swipe-deck__card--front');
  // eslint-disable-next-line no-console
  console.log(
    `QA-VSTACK2 w=${String(width)} topBarBottom=${String((topBar?.y ?? 0) + (topBar?.height ?? 0))} progressTop=${String(progress?.y)} progressBottom=${String((progress?.y ?? 0) + (progress?.height ?? 0))} cardTop=${String(firstCard?.y)}`,
  );

  const nextCard = page.getByRole('button', { name: 'Next question' });
  const rows: string[] = [];

  for (let guard = 0; guard < 40; guard += 1) {
    const idx = await cardCounterIndex(page);
    if (idx === null) throw new Error('counter missing');
    const h2 = await page.getByRole('heading', { level: 2 }).first().innerText();
    const card = await box(page, '.haru-swipe-deck__card--front');
    const h = Math.round(card?.height ?? 0);
    const top = Math.round(card?.y ?? 0);
    const budget = 852 - top - CTA_GAP - PEEK;
    rows.push(
      `${String(idx).padStart(2)} top=${String(top)} h=${String(h)} budget=${String(budget)} slack=${String(budget - h)} over=${budget - h < 0 ? 'YES' : 'no'} | ${h2.slice(0, 34)}`,
    );

    const radio = page.getByRole('radio').first();
    const checkbox = page.getByRole('checkbox').first();
    if ((await radio.count()) > 0) {
      await radio.focus();
      await page.keyboard.press('Space');
    } else if ((await checkbox.count()) > 0) {
      await checkbox.focus();
      await page.keyboard.press('Space');
    }
    if (await nextCard.isDisabled()) break;
    await nextCard.click();
    await expect.poll(() => cardCounterIndex(page), { timeout: 5_000 }).toBe(idx + 1);
  }

  // 마지막 카드 + 제출 CTA 의 실제 스크롤 높이
  const cta = page.getByRole('button', { name: 'Save profile' });
  const ctaBox = (await cta.count()) > 0 ? await cta.boundingBox() : null;
  const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
  // eslint-disable-next-line no-console
  console.log(
    `QA-VSTACK2 w=${String(width)} CARDS\n${rows.join('\n')}\nctaBottom=${String(Math.round((ctaBox?.y ?? 0) + (ctaBox?.height ?? 0)))} scrollHeight=${String(scrollH)}`,
  );
}

test('QA: 393 세로 간격 + 예산', async ({ page }) => {
  await walkAndMeasure(page, 393);
});

test('QA: 320 세로 간격 + 예산', async ({ page }) => {
  await walkAndMeasure(page, 320);
});
