/**
 * QA 재검증 probe 2 — ① 마지막 카드 + 제출 CTA 의 실제 스크롤 ② 320px 에서 간격 16(이전) 과
 * 24(현재) 의 초과 카드 수 비교. Product Code 수정 없음 — 비교군은 CSS override 로만 만든다.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';
import { cardCounterIndex, fillChildInfo, signUpAndConsent } from '../../../e2e/support/onboarding';

const CTA_GAP = 44;
const PEEK = 32;

async function enter(page: Page, width: number, oldSpacing: boolean): Promise<void> {
  await page.setViewportSize({ width, height: 852 });
  if (oldSpacing) {
    await page.addInitScript(() => {
      globalThis.addEventListener('DOMContentLoaded', () => {
        const style = globalThis.document.createElement('style');
        style.textContent = '.haru-wizard-body{margin-block-start:var(--space-4) !important}';
        globalThis.document.head.append(style);
      });
    });
  }
  await signUpAndConsent(page);
  await page.getByRole('button', { name: 'Start the questions' }).click();
  await fillChildInfo(page);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: /^(Start|Pick up where you left off)$/ }).click();
  await expect(page).toHaveURL(/reading-together$/);
}

async function walk(page: Page, label: string): Promise<void> {
  const nextCard = page.getByRole('button', { name: 'Next question' });
  const over: string[] = [];
  let cardTop = 0;

  for (let guard = 0; guard < 40; guard += 1) {
    const idx = await cardCounterIndex(page);
    if (idx === null) throw new Error('counter missing');
    const card = await page.locator('.haru-swipe-deck__card--front').first().boundingBox();
    cardTop = Math.round(card?.y ?? 0);
    const h = Math.round(card?.height ?? 0);
    const slack = 852 - cardTop - CTA_GAP - PEEK - h;
    if (slack < 0) over.push(`#${String(idx)}(h=${String(h)},slack=${String(slack)})`);

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

  const names = await page.getByRole('button').evaluateAll((els) =>
    els.map((e) => (e.textContent ?? '') + '|' + (e.getAttribute('aria-label') ?? '')),
  );
  // eslint-disable-next-line no-console
  console.log(`QA-V3 ${label} BUTTONS ${JSON.stringify(names)}`);
  const cta = page.getByRole('button', { name: /Save profile|Finish|Submit|See /i }).last();
  const ctaBox = (await cta.count()) > 0 ? await cta.boundingBox() : null;
  const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
  const scrollables = await page.evaluate(() =>
    [...document.querySelectorAll('*')]
      .filter((e) => e.scrollHeight - e.clientHeight > 1 && e.clientHeight > 100)
      .map(
        (e) =>
          `${e.tagName}.${e.className.toString().slice(0, 40)}:${String(e.scrollHeight)}/${String(e.clientHeight)}`,
      ),
  );
  // eslint-disable-next-line no-console
  console.log(`QA-V3 ${label} SCROLLABLES ${JSON.stringify(scrollables)}`);
  const lastCard = await page.locator('.haru-swipe-deck__card--front').first().boundingBox();
  // eslint-disable-next-line no-console
  console.log(
    `QA-V3 ${label} cardTop=${String(cardTop)} overCount=${String(over.length)} over=[${over.join(' ')}] lastCardH=${String(Math.round(lastCard?.height ?? 0))} ctaBottom=${String(Math.round((ctaBox?.y ?? 0) + (ctaBox?.height ?? 0)))} scrollHeight=${String(scrollH)} pageScroll=${String(scrollH - 852)}`,
  );
}

test('QA: 393 현재(24) 마지막 카드 + CTA', async ({ page }) => {
  await enter(page, 393, false);
  await walk(page, 'w393-gap24');
});

test('QA: 393 이전(16) 비교군', async ({ page }) => {
  await enter(page, 393, true);
  await walk(page, 'w393-gap16');
});

test('QA: 320 현재(24)', async ({ page }) => {
  await enter(page, 320, false);
  await walk(page, 'w320-gap24');
});

test('QA: 320 이전(16) 비교군', async ({ page }) => {
  await enter(page, 320, true);
  await walk(page, 'w320-gap16');
});
