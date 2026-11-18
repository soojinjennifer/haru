/**
 * Stage 6 `S6-G` G-10 — 회고 저장 → Home 오늘 카드 **즉시** 갱신 (`D6-9` ④ · `QA-6-006`, AC-6-39 · AC-6-40 회귀).
 *
 * 회고 저장 성공 시 `useSubmitReflection` 이 오늘 카드 캐시를 무효화한다 — Home 으로 돌아오자마자(탭 왕복·staleTime
 * 대기 없이) 다음 추천이 보인다. 문장은 Mock(서버) 응답 그대로다 (`mocks/fixtures/activity-cards.ts`).
 * 실제 서버 반영 시점은 `P6-BIP-04` (PENDING).
 *
 * 로그인 후 앱 안 이동으로 연다 (새로고침은 Mock 인증을 지운다). 스크린샷 없음.
 */
import { expect, test, type Page } from '@playwright/test';

import { hideDevPanel } from './support/gallery';
import { firstStartSession, logInToHome, requestPayloads, settleImages } from './support/session';

const REFLECTION_SUBMIT = 'POST /v1/sessions/:sessionId/reflection';
const LOWERED_REASON = 'After a tricky night, short pages and a gentle rhythm keep it light.';
const WARM_FIRST_REASON = 'Feelings came up in your last talks, and this one gives them names.';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const firstCardFront = (page: Page) =>
  page.locator('.haru-activity-card-flip__face--front').first();

/** Home → 세션 시작 → 녹음 → Submit → 완료 화면(회고 카드). */
async function completeSession(page: Page): Promise<void> {
  await firstStartSession(page).click();
  const sheet = page.getByRole('dialog', { name: 'When will you read?' });
  await sheet.getByText('Bedtime', { exact: true }).click();
  await sheet.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: 'Start recording' })).toBeVisible();
  await settleImages(page);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('radio', { name: '4 stars' })).toBeVisible();
}

/** 회고 저장 → Home(replace) 의 오늘 카드가 다시 그려질 때까지. */
async function saveReflection(page: Page, options: { tricky: boolean }): Promise<void> {
  await page.getByRole('radio', { name: '4 stars' }).click();
  if (options.tricky) {
    await page.getByRole('button', { name: 'Tricky today' }).click({ force: true });
  }
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('banner').getByText('HARU')).toBeVisible();
  await expect(
    page.locator('.haru-activity-track:not(.haru-activity-track--skeleton)'),
  ).toBeVisible();
}

test.describe('회고 저장 → 오늘 카드 즉시 갱신 (G-10)', () => {
  test('`difficulty-lowered` — *Tricky today* 저장 직후 Home 첫 카드 = 더 쉬운 책 + 사유 (AC-6-40)', async ({
    page,
  }) => {
    await logInToHome(page, 'activity-cards:difficulty-lowered');
    await expect(firstCardFront(page)).not.toContainText(LOWERED_REASON);

    await completeSession(page);
    await saveReflection(page, { tricky: true });
    const [submitted] = (await requestPayloads(page, REFLECTION_SUBMIT)) as { checks: string[] }[];
    expect(submitted?.checks).toEqual(['tricky_today']);

    // 탭 왕복 · 대기 없이 — 돌아온 Home 이 바로 새 덱이다
    await expect(firstCardFront(page)).toContainText(LOWERED_REASON);
    await expect(firstCardFront(page)).toContainText('Grumpy Monkey: Play All Day');
  });

  test('`cold-to-warm` — 4번째 완료 세션의 회고 저장 직후 Home 첫 카드 `reason` = warm (AC-6-39)', async ({
    page,
  }) => {
    // seed = 완료 2회. 3회째는 cold 유지, 4회째부터 warm.
    await logInToHome(page, 'activity-cards:cold-to-warm');
    await expect(firstCardFront(page)).not.toContainText(WARM_FIRST_REASON);

    await completeSession(page);
    await saveReflection(page, { tricky: false });
    await expect(firstCardFront(page)).not.toContainText(WARM_FIRST_REASON);

    await completeSession(page);
    await saveReflection(page, { tricky: false });
    await expect(firstCardFront(page)).toContainText(WARM_FIRST_REASON);
  });
});
