/** QA probe — 스와이프 제스처가 실제로 카드를 넘기는지 (실패 e2e 3·4 의 원인 분리). */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

async function counterText(page: import('@playwright/test').Page): Promise<string> {
  return (await page.locator('.haru-top-bar').first().innerText()).replace(/\n+/g, ' | ');
}

test('QA: 마우스 드래그로 카드가 넘어간다', async ({ page }) => {
  await gotoApp(page, '/onboarding/capability-items');
  const before = await page.getByRole('heading', { level: 2 }).first().innerText();
  const beforeCounter = await page.locator('main').first().innerText();
  const card = page.locator('.haru-swipe-deck__card--front');
  const box = await card.boundingBox();
  if (box === null) throw new Error('no box');
  const startX = box.x + box.width - 20;
  const y = box.y + box.height / 2;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  for (let s = 1; s <= 10; s += 1) await page.mouse.move(startX - s * 25, y);
  await page.mouse.up();
  await page.waitForTimeout(800);
  const after = await page.getByRole('heading', { level: 2 }).first().innerText();
  const afterCounter = await page.locator('main').first().innerText();
  // eslint-disable-next-line no-console
  console.log(
    `QA-SWIPE mouse\n  before h2="${before}"\n  after  h2="${after}"\n  beforeCounterSnippet="${beforeCounter.slice(0, 40).replace(/\n/g, ' ')}"\n  afterCounterSnippet="${afterCounter.slice(0, 40).replace(/\n/g, ' ')}"`,
  );
  expect(after).not.toBe(before);
});

test.describe('터치', () => {
  test.use({ hasTouch: true });
  test('QA: 터치 드래그로 카드가 넘어간다', async ({ page }) => {
    await gotoApp(page, '/onboarding/capability-items');
    const before = await page.getByRole('heading', { level: 2 }).first().innerText();
    const card = page.locator('.haru-swipe-deck__card--front');
    const box = await card.boundingBox();
    if (box === null) throw new Error('no box');
    const cdp = await page.context().newCDPSession(page);
    const startX = box.x + box.width - 20;
    const y = box.y + 40;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y }] });
    for (let s = 1; s <= 10; s += 1) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: startX - s * 25, y }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(800);
    const after = await page.getByRole('heading', { level: 2 }).first().innerText();
    // eslint-disable-next-line no-console
    console.log(`QA-SWIPE touch\n  before h2="${before}"\n  after  h2="${after}"`);
    expect(after).not.toBe(before);
  });
});
