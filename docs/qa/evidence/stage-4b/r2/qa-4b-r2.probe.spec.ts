/**
 * Stage 4b QA 2회차 독립 프로브 (stage-qa-agent, 2026-11-07) — 구현자 e2e 와 별개로 QA 가 작성한 단정.
 * Product Code 수정 0. 실행: `pnpm exec playwright test -c docs/qa/evidence/stage-4b/r2/qa-4b-r2.config.ts`
 *
 * R7  AC-4-35 화면 부분 — 3 key × 2 경로 (Home Activity Card 시트 · 서재 Book Detail)
 * R8  AC-4-36 화면 부분 — 2 경로 → /onboarding, `GET /v1/me` 재조회, 일반 실패 문구 0
 * R6  AC-4-99 ③ — 클래식 스크롤바(config 가 `--hide-scrollbars` 제외, CSS 강제 없음) 양축 프로브
 * R12 AC-4-156 ③ — round-1 P12 v1 (심장박동만, rAF 루프 없음) 재현 프로브 · `--repeat-each=50`
 */
import { expect, test, type Page } from '@playwright/test';

import { logInToHome, requestOperations, startSession } from '../../../../../e2e/support/session';

const START_FAILED = "We couldn't start the session. Please try again.";
const ALREADY_TITLE = 'A storytime is already open';
const ALREADY_JOINED =
  'A storytime is already open. Continue the open storytime, or finish it before starting a new one.';
const ACTIVE_ID = '99999999-9999-4999-8999-000000000001';

async function homeStart(page: Page): Promise<void> {
  await page
    .locator('.haru-activity-card-flip__face--front')
    .first()
    .getByRole('button', { name: 'Start Session' })
    .click();
  const sheet = page.getByRole('dialog', { name: 'When will you read?' });
  await sheet.getByText('Bedtime', { exact: true }).click();
  await sheet.getByRole('button', { name: 'Continue' }).click();
}

async function libraryStart(page: Page): Promise<void> {
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Library' }).click();
  await expect(page.locator('.haru-library-shelves')).toBeVisible();
  await page.locator('.haru-shelf-item--pressable').first().click();
  const sheet = page.locator('.haru-sheet--inset-card');
  await expect(sheet).toBeVisible();
  await sheet.getByRole('button', { name: 'Start Session' }).click();
}

function count(ops: string[], op: string): number {
  return ops.filter((o) => o === op).length;
}

test.describe('QA-4B r2 probe', () => {
  for (const path of ['home', 'library'] as const) {
    for (const key of ['session-already-active', 'session-already-active-paused'] as const) {
      test(`R7 ${path} ${key} → 안내 · 이동 0 · 생성 1 · Detail 1 · 일반 실패 문구 0`, async ({ page }) => {
        await logInToHome(page, `sessions:${key}`);
        const startUrl = path === 'home' ? '/' : '/library';
        if (path === 'home') await homeStart(page);
        else await libraryStart(page);
        if (path === 'home') {
          const alert = page.getByRole('dialog', { name: 'When will you read?' }).getByRole('alert');
          await expect(alert).toContainText(ALREADY_TITLE);
        } else {
          await expect(page.locator('.haru-toast')).toHaveText(ALREADY_JOINED);
        }
        await expect(page.getByText(START_FAILED)).toHaveCount(0);
        expect(new URL(page.url()).pathname).toBe(startUrl);
        const ops = await requestOperations(page);
        const summary = {
          create: count(ops, 'POST /v1/sessions'),
          detail: count(ops, 'GET /v1/sessions/:sessionId'),
          transitions: ops.filter((o) => o.includes('/transitions')).length,
          recordings: ops.filter((o) => o.includes('/recordings')).length,
        };
        console.log('QA-R7', JSON.stringify({ path, key, url: page.url(), summary, ops }));
        expect(summary.create).toBe(1);
        expect(summary.detail).toBe(1);
        expect(summary.transitions).toBe(0);
        expect(summary.recordings).toBe(0);
      });
    }
    test(`R7 ${path} session-already-active-ready → /session/${ACTIVE_ID} (push) · 생성 1`, async ({ page }) => {
      await logInToHome(page, 'sessions:session-already-active-ready');
      if (path === 'library') {
        await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Library' }).click();
        await expect(page.locator('.haru-library-shelves')).toBeVisible();
      }
      const before = await page.evaluate(() => history.length);
      if (path === 'home') await homeStart(page);
      else {
        await page.locator('.haru-shelf-item--pressable').first().click();
        await page.locator('.haru-sheet--inset-card').getByRole('button', { name: 'Start Session' }).click();
      }
      await expect(page).toHaveURL(new RegExp(`/session/${ACTIVE_ID}$`));
      await expect(page.getByRole('button', { name: 'Start recording' })).toBeVisible();
      const after = await page.evaluate(() => history.length);
      const ops = await requestOperations(page);
      console.log('QA-R7ready', JSON.stringify({ path, before, after, ops }));
      expect(after).toBe(before + 1);
      expect(count(ops, 'POST /v1/sessions')).toBe(1);
      await expect(page.getByText(START_FAILED)).toHaveCount(0);
    });
    test(`R8 ${path} onboarding-incomplete → /onboarding · me 재조회 · 일반 실패 문구 0`, async ({ page }) => {
      await logInToHome(page, 'sessions:onboarding-incomplete');
      if (path === 'library') {
        await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Library' }).click();
        await expect(page.locator('.haru-library-shelves')).toBeVisible();
      }
      const meBefore = count(await requestOperations(page), 'GET /v1/me');
      if (path === 'home') await homeStart(page);
      else {
        await page.locator('.haru-shelf-item--pressable').first().click();
        await page.locator('.haru-sheet--inset-card').getByRole('button', { name: 'Start Session' }).click();
      }
      await expect(page).toHaveURL(/\/onboarding/);
      await expect(page.getByText(START_FAILED)).toHaveCount(0);
      const ops = await requestOperations(page);
      const meAfter = count(ops, 'GET /v1/me');
      console.log('QA-R8', JSON.stringify({ path, url: page.url(), meBefore, meAfter, tail: ops.slice(-6) }));
      expect(meAfter).toBeGreaterThan(meBefore);
    });
  }

  for (const vp of [
    { width: 320, height: 568 },
    { width: 393, height: 600 },
    { width: 1024, height: 500 },
  ]) {
    test(`R6 클래식 스크롤바 ${vp.width}x${vp.height} — 세션 ready · recording · Home · Library 가로 넘침 0`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      const measure = async (label: string): Promise<Record<string, unknown>> => {
        const m = await page.evaluate(() => {
          const boxes = [...document.querySelectorAll<HTMLElement>('*')].filter((el) => {
            const cs = getComputedStyle(el);
            return cs.overflowY === 'auto' || cs.overflowY === 'scroll';
          });
          const col = document.querySelector('.haru-app-column')?.getBoundingClientRect();
          const vpBox = boxes.find((el) => el.querySelector('.haru-app-column') !== null) ?? null;
          return {
            docOver: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            scrollers: boxes
              .filter((el) => el.clientWidth > 0)
              .map((el) => ({
                cls: el.className.toString().slice(0, 50),
                clientW: el.clientWidth,
                scrollW: el.scrollWidth,
                sb: el.offsetWidth - el.clientWidth,
              })),
            colW: col?.width ?? null,
            colCenter: col ? col.left + col.width / 2 : null,
            boxCenter: vpBox ? vpBox.getBoundingClientRect().left + vpBox.clientWidth / 2 : null,
          };
        });
        console.log('QA-R6', JSON.stringify({ vp, label, m }));
        return m;
      };
      const check = (m: Record<string, unknown>): void => {
        expect(m['docOver'] as number).toBeLessThanOrEqual(0);
        for (const s of m['scrollers'] as { scrollW: number; clientW: number }[]) {
          expect(s.scrollW, 'scroller horizontal overflow').toBeLessThanOrEqual(s.clientW);
        }
        if (m['colCenter'] !== null && m['boxCenter'] !== null) {
          expect(Math.abs((m['colCenter'] as number) - (m['boxCenter'] as number))).toBeLessThanOrEqual(0.5);
        }
      };
      await logInToHome(page);
      check(await measure('home'));
      await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Library' }).click();
      await expect(page.locator('.haru-library-shelves')).toBeVisible();
      check(await measure('library'));
      await startSession(page);
      check(await measure('session-ready'));
      await page.getByRole('button', { name: 'Start recording' }).click();
      await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
      check(await measure('session-recording'));
    });
  }

  test('R12 (P12 v1) Submit 후 완료 화면 Toast 수명 — 심장박동만, rAF 루프 없음', async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript(() => {
      const w = globalThis as unknown as { __qa: { beats: number[]; vis: string[] } };
      w.__qa = { beats: [], vis: [] };
      setInterval(() => w.__qa.beats.push(performance.now() | 0), 250);
      document.addEventListener('visibilitychange', () => w.__qa.vis.push(`${performance.now() | 0}:${document.visibilityState}`));
    });
    await startSession(page);
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page).toHaveURL(/\/complete$/);
    await page.waitForTimeout(9_000);
    const qa = await page.evaluate(() => (globalThis as unknown as { __qa: { beats: number[]; vis: string[] } }).__qa);
    const gaps = qa.beats.slice(1).map((b, i) => b - (qa.beats[i] ?? b));
    const still = await page.locator('.haru-toast').count();
    console.log('QA-R12', JSON.stringify({ beats: qa.beats.length, maxGap: Math.max(...gaps), vis: qa.vis, still }));
    expect(still, 'Toast still present 9s after Submit').toBe(0);
  });

  test('R13 측정판 console 관찰 — preload 경고 · Inter FontFace 상태', async ({ page }) => {
    test.setTimeout(60_000);
    const logged: string[] = [];
    page.on('console', (m) => logged.push(`${m.type()}: ${m.text().slice(0, 160)}`));
    await page.goto('/__dev/ui/recording-measure', { waitUntil: 'load' });
    await page.locator('#measure-start-latency-run').waitFor();
    await page.waitForTimeout(6_000);
    const fonts = await page.evaluate(() => ({
      faces: [...document.fonts].map((f) => `${f.family}:${f.status}`),
      body: getComputedStyle(document.body).fontFamily.slice(0, 120),
      preload: [...document.querySelectorAll('link[rel=preload]')].map((l) => (l as HTMLLinkElement).href),
      interUsed: performance.getEntriesByType('resource').filter((e) => e.name.includes('inter-latin')).map((e) => `${(e as PerformanceResourceTiming).initiatorType}`),
    }));
    console.log('QA-R13', JSON.stringify({ server: process.env['QA_SERVER'] ?? 'unknown', logged, fonts }));
  });
});
