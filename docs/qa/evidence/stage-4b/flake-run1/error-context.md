# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: session-notices.spec.ts >> `S4-H3R` — `D4-132` · `D4-134` (`VG-H3-01` · `VG-H3-02` · `VG-H3-04`) >> `VG-H3-02` — Discard → Home 경로도 보류 안내가 Home 에서 1회 보인다
- Location: e2e/session-notices.spec.ts:365:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.haru-toast')
Expected: 0
Received: 1
Timeout:  10000ms

Call log:
  - Expect "toHaveCount" locator('.haru-toast') with timeout 10000ms
  - waiting for locator('.haru-toast')
    13 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main "Main content" [ref=e7]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - button "Prompts" [ref=e11] [cursor=pointer]
        - button "Close session" [ref=e18] [cursor=pointer]
      - generic [ref=e27]:
        - generic [ref=e28]: Where the Wild Things Are
        - generic [ref=e31]:
          - generic [ref=e32]: Recording
          - timer [ref=e35]: 00:09
          - generic [ref=e36]: Up to 30:00
      - generic [ref=e37]:
        - button "Pause recording" [active] [ref=e38] [cursor=pointer]
        - group "Session actions" [ref=e46]:
          - button "Discard" [ref=e47] [cursor=pointer]
          - button "Submit" [ref=e50] [cursor=pointer]
          - generic [ref=e53]: Available after you start recording.
  - status [ref=e54]:
    - paragraph [ref=e55]: Your recording hasn't uploaded yet. It's still saved on this device.
    - button "Try again" [ref=e56] [cursor=pointer]
    - button "Dismiss" [ref=e57] [cursor=pointer]
```

# Test source

```ts
  273 |     const ready = page.getByRole('dialog', { name: READY_TITLE });
  274 |     await ready.getByText('Bedtime', { exact: true }).click();
  275 |     await ready.getByRole('button', { name: 'Continue' }).click();
  276 |     const sheet = page.getByRole('dialog', { name: 'Your microphone is off' });
  277 |     await expect(sheet).toBeVisible();
  278 |     const before = await page.locator('.haru-record').boundingBox();
  279 |     await sheet.getByRole('button', { name: 'Not now' }).click();
  280 |     await expect(sheet).toHaveCount(0);
  281 |     await expect(page.locator('.haru-record')).toBeFocused();
  282 |     const after = await page.locator('.haru-record').boundingBox();
  283 |     expect(after?.y).toBe(before?.y);
  284 |   });
  285 | });
  286 | 
  287 | test.describe('`S4-H3R` — `D4-132` · `D4-134` (`VG-H3-01` · `VG-H3-02` · `VG-H3-04`)', () => {
  288 |   interface ToastSegment {
  289 |     text: string;
  290 |     path: string;
  291 |     from: number;
  292 |     to: number | null;
  293 |   }
  294 | 
  295 |   /**
  296 |    * 화면의 Toast 문구 변화를 시각과 함께 적는다 — 같은 노드에서 문구만 바뀌는 교체도 잡는다.
  297 |    * 문서 전체 subtree 를 보는 `MutationObserver` 라 4ms 교체(`VG-H3-02`)도 놓치지 않는다.
  298 |    */
  299 |   async function watchToasts(page: Page): Promise<void> {
  300 |     await page.addInitScript(() => {
  301 |       const store = globalThis as { __toastLog?: ToastSegment[] };
  302 |       store.__toastLog = [];
  303 |       let current: string | null = null;
  304 |       const sample = (): void => {
  305 |         const node = document.querySelector('.haru-toast');
  306 |         const text = node?.textContent ?? null;
  307 |         if (text === current) return;
  308 |         const now = performance.now();
  309 |         const log = store.__toastLog ?? [];
  310 |         const open = log.at(-1);
  311 |         if (open !== undefined && open.to === null) open.to = now;
  312 |         if (text !== null) log.push({ text, path: location.pathname, from: now, to: null });
  313 |         current = text;
  314 |       };
  315 |       new MutationObserver(sample).observe(document, {
  316 |         subtree: true,
  317 |         childList: true,
  318 |         characterData: true,
  319 |       });
  320 |     });
  321 |   }
  322 | 
  323 |   async function toastLog(page: Page): Promise<ToastSegment[]> {
  324 |     return page.evaluate(() => (globalThis as { __toastLog?: ToastSegment[] }).__toastLog ?? []);
  325 |   }
  326 | 
  327 |   test('`VG-H3-02` — 녹음 중 보류된 복구 안내는 `Submit` 후 완료 Toast 가 사라진 뒤 4초 보인다', async ({
  328 |     page,
  329 |   }) => {
  330 |     test.setTimeout(90_000);
  331 |     await watchToasts(page);
  332 |     // 48h(6초)가 떠 있는 동안 녹음을 시작해 크래시 복구 안내를 보류시킨다 (`D4-120` Q13 · Q14 순서 48h → 복구).
  333 |     await startSession(page, 'recorder:crash-recovered,recordings:upload-stalled-48h');
  334 |     const toast = page.locator('.haru-toast');
  335 |     await expect(toast).toContainText(STALLED);
  336 |     await page.getByRole('button', { name: 'Start recording' }).click();
  337 |     await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  338 |     // 48h 가 사라진 뒤 녹음 중에는 아무 Toast 도 뜨지 않는다 (보류)
  339 |     await expect(toast).toHaveCount(0, { timeout: 10_000 });
  340 |     await page.waitForTimeout(1_000);
  341 |     await expect(toast).toHaveCount(0);
  342 | 
  343 |     await page.getByRole('button', { name: 'Submit' }).click();
  344 |     await expect(page).toHaveURL(/\/session\/[0-9a-f-]+\/complete$/);
  345 |     await expect(toast).toHaveText('Recording submitted');
  346 |     await expect(toast).toHaveText(RECOVERED, { timeout: 10_000 });
  347 |     await expect(toast).toHaveCount(0, { timeout: 10_000 });
  348 | 
  349 |     const log = await toastLog(page);
  350 |     const submitted = log.filter((segment) => segment.text === 'Recording submitted');
  351 |     const recovered = log.filter((segment) => segment.text === RECOVERED);
  352 |     expect(submitted).toHaveLength(1);
  353 |     expect(recovered).toHaveLength(1);
  354 |     const [done] = submitted;
  355 |     const [notice] = recovered;
  356 |     if (done === undefined || notice === undefined || done.to === null || notice.to === null) {
  357 |       throw new Error('toast segments incomplete');
  358 |     }
  359 |     // 세션 화면이 아니라 완료 화면에서 · 완료 Toast 가 **사라진 뒤** 에 · 기본 4초 동안 (DOM 체류 = 타이머 + 퇴장)
  360 |     expect(notice.path).toMatch(/\/complete$/);
  361 |     expect(notice.from).toBeGreaterThanOrEqual(done.to);
  362 |     expect(notice.to - notice.from).toBeGreaterThanOrEqual(4_000);
  363 |   });
  364 | 
  365 |   test('`VG-H3-02` — Discard → Home 경로도 보류 안내가 Home 에서 1회 보인다', async ({ page }) => {
  366 |     test.setTimeout(90_000);
  367 |     await watchToasts(page);
  368 |     await startSession(page, 'recorder:crash-recovered,recordings:upload-stalled-48h');
  369 |     const toast = page.locator('.haru-toast');
  370 |     await expect(toast).toContainText(STALLED);
  371 |     await page.getByRole('button', { name: 'Start recording' }).click();
  372 |     await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
> 373 |     await expect(toast).toHaveCount(0, { timeout: 10_000 });
      |                         ^ Error: expect(locator).toHaveCount(expected) failed
  374 |     await page.getByRole('button', { name: 'Discard' }).click();
  375 |     await page
  376 |       .getByRole('alertdialog')
  377 |       .getByRole('button', { name: 'Discard', exact: true })
  378 |       .click();
  379 |     await expect(page).toHaveURL(/\/$/);
  380 |     await expect(toast).toHaveText(RECOVERED, { timeout: 10_000 });
  381 |     await expect(toast).toHaveCount(0, { timeout: 10_000 });
  382 |     const recovered = (await toastLog(page)).filter((segment) => segment.text === RECOVERED);
  383 |     expect(recovered).toHaveLength(1);
  384 |     expect(recovered[0]?.path).toBe('/');
  385 |   });
  386 | 
  387 |   for (const [width, height] of [
  388 |     [393, 86],
  389 |     [320, 104],
  390 |   ] as const) {
  391 |     test(`\`VG-H3-01\` ${width}×852 — 48h Toast \`Dismiss\` 는 38×38 (줄지 않음) · Toast 높이 ${height}`, async ({
  392 |       page,
  393 |     }) => {
  394 |       await page.setViewportSize({ width, height: 852 });
  395 |       await openApp(page, 'recordings:upload-stalled-48h');
  396 |       const toast = page.locator('.haru-toast');
  397 |       await expect(toast).toContainText(STALLED);
  398 |       const close = await toast.getByRole('button', { name: 'Dismiss' }).boundingBox();
  399 |       expect(close?.width).toBe(38);
  400 |       expect(close?.height).toBe(38);
  401 |       expect((await toast.boundingBox())?.height).toBe(height);
  402 |     });
  403 |   }
  404 | 
  405 |   test('`VG-H3-04` — 7일 배너를 키보드로 닫으면 포커스는 다음 Tab 대상(버블 닫기) — `BODY` 아님', async ({
  406 |     page,
  407 |   }) => {
  408 |     await logInToHome(page, 'recorder:local-retention-notice');
  409 |     const banner = page.locator(BANNER);
  410 |     const close = banner.getByRole('button', { name: 'Dismiss' });
  411 |     // 기대 대상 = 닫기 전 그 버튼에서 Tab 했을 때 가는 곳
  412 |     await close.focus();
  413 |     await page.keyboard.press('Tab');
  414 |     const expected = await page.evaluate(() => {
  415 |       const node = document.activeElement as HTMLElement;
  416 |       node.setAttribute('data-next-probe', '');
  417 |       return node.getAttribute('aria-label');
  418 |     });
  419 |     expect(expected).toBe('Dismiss');
  420 |     await close.focus();
  421 |     await page.keyboard.press('Enter');
  422 |     await expect(page.locator(BANNER)).toHaveCount(0);
  423 |     await expect(page.locator('[data-next-probe]')).toBeFocused();
  424 |     expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  425 |   });
  426 | });
  427 | 
```