/**
 * Stage 4 세션 화면 e2e 도우미 — 로그인 → Home → `Start Session` → Reading Context → `/session/:id`.
 *
 * 세션 화면은 **클라이언트 이동**으로 들어오므로 `gotoApp` 의 settle 을 거치지 않는다
 * (`R-BASELINE-1` ①·④ — `s2-vpc-failed` 사고와 같은 경로). 그래서 여기서 이미지 디코드 + `settle()` 을
 * 직접 기다린다. scenario 는 첫 진입 URL 에 붙인다 — Mock 번들은 앱이 뜰 때 한 번 만들어지고
 * SPA 이동 동안 같은 store 를 쓴다.
 */
import { expect, type Page } from '@playwright/test';

import { gotoApp, settle } from './gallery';

export const READY_TITLE = 'When will you read?';

export async function logInToHome(page: Page, scenario?: string): Promise<void> {
  const query = scenario === undefined ? '' : `?scenario=${encodeURIComponent(scenario)}`;
  await gotoApp(page, `/auth/log-in${query}`);
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('banner').getByText('HARU')).toBeVisible();
  await expect(
    page.locator('.haru-activity-track:not(.haru-activity-track--skeleton)'),
  ).toBeVisible();
}

export function firstStartSession(page: Page) {
  return page
    .locator('.haru-activity-card-flip__face--front')
    .first()
    .getByRole('button', { name: 'Start Session' });
}

/** 이미지(아바타)까지 디코드된 뒤 두 프레임 — baseline 이 과도기 프레임을 담지 않게. */
export async function settleImages(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    [...document.images].every((image) => image.complete && image.naturalWidth > 0),
  );
  await settle(page);
}

/** ready 화면까지 간다. 돌려주는 값 = 세션 id. */
export async function startSession(page: Page, scenario?: string): Promise<string> {
  await logInToHome(page, scenario);
  await firstStartSession(page).click();
  const sheet = page.getByRole('dialog', { name: READY_TITLE });
  await sheet.getByText('Bedtime', { exact: true }).click();
  await sheet.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/session\/[0-9a-f-]+$/);
  await expect(page.getByRole('button', { name: 'Start recording' })).toBeVisible();
  // 시트 퇴장 모션이 끝나 scrim 이 사라질 때까지
  await expect(page.locator('.haru-scrim')).toHaveCount(0);
  await settleImages(page);
  return page.url().split('/').pop() ?? '';
}

/** dev 서버의 Mock 요청 로그 (`mocks/index.ts` — DEV 에서만 창에 노출된다). */
export async function requestOperations(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const log = (
      globalThis as unknown as {
        __HARU_MOCK_REQUEST_LOG__?: {
          entries(): readonly { operation: string; payload: unknown }[];
        };
      }
    ).__HARU_MOCK_REQUEST_LOG__;
    if (log === undefined) throw new Error('mock request log is not exposed (dev only)');
    return log.entries().map((entry) => entry.operation);
  });
}

export async function requestPayloads(page: Page, operation: string): Promise<unknown[]> {
  return page.evaluate((op) => {
    const log = (
      globalThis as unknown as {
        __HARU_MOCK_REQUEST_LOG__?: {
          entries(): readonly { operation: string; payload: unknown }[];
        };
      }
    ).__HARU_MOCK_REQUEST_LOG__;
    if (log === undefined) throw new Error('mock request log is not exposed (dev only)');
    return log
      .entries()
      .filter((entry) => entry.operation === op)
      .map((entry) => entry.payload);
  }, operation);
}
