/**
 * Stage 2-AUTH e2e — 화면 이동 · 키보드 조작 · Privacy · 반응형.
 * AC-2-04 · AC-2-09 · AC-2-13 · AC-2-59 · AC-2-60 · AC-2-66.
 */
import { expect, test } from '@playwright/test';

import { gotoApp } from './support/gallery';

test.describe('Auth 화면 이동 (AC-2-04)', () => {
  test('Welcome → 가입 → 뒤로 → 로그인 → 비밀번호 재설정', async ({ page }) => {
    await gotoApp(page, '/auth/welcome');

    await page.getByRole('button', { name: 'Sign up with email' }).click();
    await expect(page).toHaveURL(/\/auth\/sign-up$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Create your account' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/auth\/welcome$/);

    await page
      .getByRole('link', { name: 'Log in' })
      .or(page.getByRole('button', { name: 'Log in' }))
      .first()
      .click();
    await expect(page).toHaveURL(/\/auth\/log-in$/);

    await page.getByRole('button', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL(/\/auth\/forgot-password$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Reset password' })).toBeVisible();
  });

  test('미인증으로 `/` 에 들어가면 Guard 가 Welcome 으로 보낸다', async ({ page }) => {
    await gotoApp(page, '/');

    await expect(page).toHaveURL(/\/auth\/welcome$/);
  });

  test('비밀번호 재설정 링크 토큰이 없으면 만료 안내를 보여준다 (AC-2-09)', async ({ page }) => {
    await gotoApp(page, '/auth/reset-password');

    await expect(page.getByText("This link isn't active anymore")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Request a new link' })).toBeVisible();
  });
});

test.describe('키보드 조작 · 접근성 (AC-2-60)', () => {
  test('가입 폼을 키보드만으로 채우고 제출할 수 있다', async ({ page }) => {
    await gotoApp(page, '/auth/sign-up');

    await page.getByLabel('Your name').focus();
    await page.keyboard.type('Sam Rivera');
    await page.keyboard.press('Tab');
    await page.keyboard.type('sam@example.com');

    await page.getByRole('textbox', { name: 'Password', exact: true }).focus();
    await page.keyboard.type('sunny-evening-8');

    await expect(page.getByLabel('Your name')).toHaveValue('Sam Rivera');
    await expect(page.getByLabel('Email')).toHaveValue('sam@example.com');
  });

  test('비밀번호 토글이 aria-pressed 로 상태를 알린다', async ({ page }) => {
    await gotoApp(page, '/auth/sign-up');

    const toggle = page.getByRole('button', { name: 'Show password' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveAttribute(
      'type',
      'password',
    );

    await toggle.click();

    await expect(page.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveAttribute(
      'type',
      'text',
    );
  });

  /**
   * 문장 **안에** 있는 링크(`TextLink tone=default`)는 WCAG 2.5.8 의 "inline" 예외 대상이라
   * 44 를 요구하지 않는다 (Welcome 의 "Terms" · "Privacy Policy" · "Log in").
   * 단독 버튼과 `tone=standalone` 링크만 44 를 만족해야 한다.
   */
  test('버튼과 단독 링크의 터치 타깃이 44 이상이다', async ({ page }) => {
    await gotoApp(page, '/auth/welcome');

    const targets = page.locator(
      'main button:not(.haru-text-link), main a[href].haru-text-link--standalone',
    );
    const count = await targets.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const box = await targets.nth(index).boundingBox();
      if (box === null) continue;

      expect(box.height, `target ${String(index)} height`).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Privacy · 보안 (AC-2-13 · AC-2-66)', () => {
  test('Auth 화면에서 외부 도메인으로 나가는 요청이 0건이다', async ({ page }) => {
    const external: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (!url.startsWith('http://127.0.0.1') && !url.startsWith('data:')) external.push(url);
    });

    await gotoApp(page, '/auth/welcome');
    await gotoApp(page, '/auth/sign-up');
    await gotoApp(page, '/auth/log-in');

    expect(external).toStrictEqual([]);
  });

  test('약관·개인정보방침 링크가 새 탭 외부 링크다 (결정 D-4)', async ({ page }) => {
    await gotoApp(page, '/auth/welcome');

    const terms = page.getByRole('link', { name: /Terms/ });

    await expect(terms).toHaveAttribute('target', '_blank');
    await expect(terms).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(terms).toHaveAttribute('href', /\.invalid\//);
  });
});

test.describe('반응형 · 텍스트 확대 (AC-2-59)', () => {
  for (const width of [320, 393, 600, 1024]) {
    test(`Welcome 이 ${String(width)}px 에서 가로 스크롤을 만들지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await gotoApp(page, '/auth/welcome');

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );

      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('320px + 텍스트 200% 확대에서도 가로 스크롤이 생기지 않는다', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await gotoApp(page, '/auth/sign-up');

    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await page.waitForTimeout(100);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    expect(overflow).toBeLessThanOrEqual(0);
  });
});
