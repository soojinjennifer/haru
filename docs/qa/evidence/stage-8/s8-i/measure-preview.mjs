import { createRequire } from 'node:module';
const require = createRequire('/Users/soojin/dev/haru/package.json');
const { chromium } = require('@playwright/test');
const BASE = 'http://127.0.0.1:4179';
const browser = await chromium.launch();
const out = {};
async function login(page, query) {
  await page.goto(`${BASE}/auth/log-in${query}`);
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.waitForURL(/\/$/);
  await page.locator('.haru-activity-track').waitFor();
  await page.waitForTimeout(800);
}
const msg = 'A storytime is still open — you can pick it back up.';
for (const [label, q] of [['no-query', ''], ['query', '?scenario=home:session-already-active']]) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  await login(page, q);
  out[label] = {
    url: page.url(),
    stillOpenNotice: await page.getByText(msg).count(),
    scenarioPanel: await page.locator('aside[aria-label="Mock scenario"], .haru-dev-panel').count(),
    requestLogGlobal: await page.evaluate(() => '__HARU_MOCK_REQUEST_LOG__' in globalThis),
    coverSrcs: await page.locator('.haru-book-cover img').evaluateAll((els) => els.map((e) => new URL(e.src).pathname)),
    consoleErrors,
  };
  await ctx.close();
}
// panel sessionStorage layer (no UI) — 확인용
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  for (const path of ['/progress', '/settings/data', '/dev/gallery']) {
    const res = await page.goto(`${BASE}${path}`);
    await page.locator('main').waitFor({ state: 'attached' });
    await page.waitForTimeout(500);
    out[`deep ${path}`] = { status: res.status(), finalPath: new URL(page.url()).pathname, mainCount: await page.locator('main').count(), headings: await page.locator('h1').allInnerTexts() };
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
