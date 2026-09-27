/**
 * Stage 2-HOME e2e — 착지 화면 · 설정 진입 · 로그아웃 로컬 정리 · 반응형.
 * AC-2-29 · AC-2-39 · AC-2-40 · AC-2-41 · AC-2-59 · AC-2-60 · AC-2-66.
 *
 * 여기에서만 확인할 수 있는 것: **실제 브라우저의 `localStorage`** 와 포커스·키 입력.
 * jsdom 단위 테스트(`apps/web/__tests__/home-settings.test.tsx`)는 같은 경로를 DOM 수준에서 덮는다.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from './support/gallery';

const DRAFT_KEY = 'haru.onboarding.draft.v1';

/** 로그인해서 `/` 에 착지한다 — 기본 `me` 는 온보딩까지 마친 사용자다. */
async function logIn(page: Page): Promise<void> {
  await gotoApp(page, '/auth/log-in');

  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
}

/** Trial 구간에서 실제로 만들어지는 draft 를 남긴 뒤 로그인한다 (D-3 삭제 시점 ② 검증용). */
async function leaveOnboardingDraft(page: Page): Promise<void> {
  await gotoApp(page, '/onboarding/child-info');
  await page.getByLabel('First name').fill('Nova');

  await expect
    .poll(async () => page.evaluate((key) => globalThis.localStorage.getItem(key), DRAFT_KEY))
    .not.toBeNull();
}

test.describe('`/` Home skeleton (AC-2-39 · #33)', () => {
  test('로그인하면 워드마크 + 설정 아이콘 + 빈 상태 안내만 있는 화면에 착지한다', async ({
    page,
  }) => {
    await logIn(page);

    const header = page.getByRole('banner');
    await expect(header.getByText('HARU')).toBeVisible();
    await expect(header.getByRole('button', { name: 'Settings' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Your storytime space is ready.' }),
    ).toBeVisible();

    // Stage 3 요소는 없다 — 탭바 · 덱 · 캐릭터 이미지.
    await expect(page.getByRole('navigation')).toHaveCount(0);
    await expect(page.locator('.haru-tab-bar')).toHaveCount(0);
    await expect(page.getByRole('img')).toHaveCount(0);
  });

  test('Home 에서 나가는 contract 요청이 `GET /v1/me` 밖에 없다', async ({ page }) => {
    const calls: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/v1/')) calls.push(`${request.method()} ${url}`);
    });

    await logIn(page);
    await expect(page.getByRole('banner')).toBeVisible();

    // Mock 모드라 실제 네트워크 요청 자체가 0건이다 (Adapter 가 in-memory 다).
    expect(calls).toEqual([]);
  });
});

test.describe('`/settings` · 로그아웃 (AC-2-40 · AC-2-41 · AC-2-29 · D-7 · D-3)', () => {
  test('설정 아이콘 → 로그아웃 1행 → 확인 Dialog → Welcome + 로컬 draft 삭제', async ({ page }) => {
    await leaveOnboardingDraft(page);
    await logIn(page);

    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();

    // 목록은 로그아웃 1행뿐이다 (C13-12).
    const list = page.getByRole('list', { name: 'Account' });
    await expect(list.getByRole('listitem')).toHaveCount(1);

    await page.getByRole('button', { name: 'Log out', exact: true }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText('Onboarding answers saved on this device will be removed.'),
    ).toBeVisible();
    // destructive — 초기 포커스는 취소다.
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();

    await dialog.getByRole('button', { name: 'Log out', exact: true }).click();

    await expect(page).toHaveURL(/\/auth\/welcome$/);

    // AC-2-29 — 이 기기에 HARU 키가 하나도 남지 않는다.
    const remaining = await page.evaluate(() =>
      Object.keys(globalThis.localStorage).filter((key) => key.startsWith('haru.')),
    );
    expect(remaining).toEqual([]);
  });

  test('취소하면 로그아웃하지 않고 로컬 draft 도 남는다', async ({ page }) => {
    await leaveOnboardingDraft(page);
    await logIn(page);

    // 새로고침으로 들어가지 않는다 — Mock 세션은 메모리에 있어 reload 하면 로그인이 풀린다.
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/settings$/);

    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/settings$/);
    expect(
      await page.evaluate((key) => globalThis.localStorage.getItem(key), DRAFT_KEY),
    ).not.toBeNull();
  });

  test('키보드만으로 설정 진입 → 로그아웃 확인까지 간다 (AC-2-60)', async ({ page }) => {
    await logIn(page);

    const settings = page.getByRole('button', { name: 'Settings' });
    await settings.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/settings$/);

    const row = page.getByRole('button', { name: 'Log out', exact: true });
    await row.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();

    // Esc 는 취소와 같다 (ConfirmDialog 규약).
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/settings$/);
  });
});

test.describe('반응형 (AC-2-59)', () => {
  for (const width of [320, 393, 600, 1024]) {
    test(`Home 이 ${String(width)}px 에서 가로 스크롤을 만들지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await logIn(page);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    });
  }

  test('600px 이상에서 앱 컬럼이 480 을 넘지 않고 가운데 정렬된다', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await logIn(page);

    const column = page.locator('[data-app-shell-viewport] > *').first();
    const box = await column.boundingBox();

    expect(box).not.toBeNull();
    expect(box?.width).toBeLessThanOrEqual(480);
    // 좌우 여백이 같다 (가운데 정렬).
    expect(
      Math.abs((box?.x ?? 0) - (1024 - (box?.width ?? 0) - (box?.x ?? 0))),
    ).toBeLessThanOrEqual(1);
  });
});
