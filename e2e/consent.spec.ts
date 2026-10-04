/**
 * Stage 2-CONSENT e2e — 가입 3경로 → 동의 화면 · 문서 외부 링크 · VPC 슬롯 · Privacy.
 * AC-2-12 · AC-2-13 · AC-2-17 · AC-2-18 · AC-2-59 · AC-2-60 · AC-2-66.
 *
 * `?scenario=` 는 앱이 시작할 때 **한 번** 읽혀 SPA 수명 동안 유지된다. 그래서 가입 화면에서
 * scenario 를 지정하면 이후 client-side 이동(동의 화면)에서도 같은 Mock 상태가 쓰인다.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from './support/gallery';

const CONSENT_SCENARIO = '?scenario=me:consent-missing';
const REQUIRED_TITLES = ['Terms of Service', 'Privacy Policy', "Recording your child's voice"];

async function signUpWithEmail(page: Page): Promise<void> {
  await gotoApp(page, `/auth/sign-up${CONSENT_SCENARIO}`);

  await page.getByLabel('Your name').fill('Sam Rivera');
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Create account' }).click();
}

test.describe('모든 가입 경로가 동의 화면으로 모인다 (AC-2-12, C-2)', () => {
  test('Email 가입 → /auth/consent', async ({ page }) => {
    await signUpWithEmail(page);

    await expect(page).toHaveURL(/\/auth\/consent$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Before we begin' })).toBeVisible();
  });

  for (const provider of ['Continue with Google', 'Continue with Apple']) {
    test(`${provider} → /auth/consent`, async ({ page }) => {
      await gotoApp(page, `/auth/welcome${CONSENT_SCENARIO}`);

      await page.getByRole('button', { name: provider }).click();

      await expect(page).toHaveURL(/\/auth\/consent$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Before we begin' })).toBeVisible();
    });
  }
});

test.describe('동의 화면 — 5항목 · 필수 미체크 차단 (AC-2-10 · AC-2-11)', () => {
  test('체크박스 5개가 그룹으로 묶여 있다', async ({ page }) => {
    await signUpWithEmail(page);

    const group = page.getByRole('group', { name: 'Consent items' });
    await expect(group.getByRole('checkbox')).toHaveCount(5);
  });

  test('필수 미체크 CTA 는 aria-disabled 이고 포커스를 받을 수 있다', async ({ page }) => {
    await signUpWithEmail(page);

    const cta = page.getByRole('button', { name: 'Continue' });
    await expect(cta).toHaveAttribute('aria-disabled', 'true');
    await expect(cta).toHaveAttribute('aria-describedby', /.+/);
    await expect(page.getByText('Select the required items to continue.')).toBeVisible();

    await cta.focus();
    await expect(cta).toBeFocused();
    // Playwright 의 actionability 검사도 `aria-disabled` 를 "enabled 아님" 으로 본다.
    await expect(cta).toBeDisabled();

    // 강제로 눌러도(프로그램적 click) 제출되지 않는다 — 폼 핸들러가 막는다.
    await cta.dispatchEvent('click');
    await expect(page).toHaveURL(/\/auth\/consent$/);
  });

  test('키보드만으로 필수 3종을 체크하고 제출할 수 있다 (AC-2-60)', async ({ page }) => {
    await signUpWithEmail(page);

    for (const title of REQUIRED_TITLES) {
      await page.getByRole('checkbox', { name: new RegExp(title) }).focus();
      await page.keyboard.press('Space');
    }

    const cta = page.getByRole('button', { name: 'Continue' });
    await expect(cta).not.toHaveAttribute('aria-disabled', 'true');

    await cta.focus();
    await page.keyboard.press('Enter');

    /*
      동의가 끝나면 Guard 가 온보딩 구간으로 넘긴다. 저장된 draft 가 없으므로 **프로필 안내**
      (`/onboarding/start`)다 — 중도 복귀면 그 지점으로 간다 (`§11.19` 7-2).
    */
    await expect(page).toHaveURL(/\/onboarding\/start$/);
  });
});

test.describe('문서 링크 — 외부 링크로만 연다 (결정 D-4, AC-2-18)', () => {
  test('항목마다 새 탭 외부 링크가 있고 주소가 placeholder 임이 드러난다', async ({ page }) => {
    await signUpWithEmail(page);

    const links = page.getByRole('group', { name: 'Consent items' }).getByRole('link');
    await expect(links).toHaveCount(5);

    const count = await links.count();
    for (let index = 0; index < count; index += 1) {
      await expect(links.nth(index)).toHaveAttribute('target', '_blank');
      await expect(links.nth(index)).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(links.nth(index)).toHaveAttribute('href', /\.invalid\/.*--placeholder$/);
    }
  });
});

test.describe('VPC 슬롯 (AC-2-17, C-3)', () => {
  test('vpc-pending 이면 그 화면에 머문다', async ({ page }) => {
    await gotoApp(page, '/auth/sign-up?scenario=me:vpc-pending');

    await page.getByLabel('Your name').fill('Sam Rivera');
    await page.getByLabel('Email').fill('sam@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/auth\/verify-parent$/);
    await expect(page.getByText("We're confirming this step.")).toBeVisible();

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/auth\/verify-parent$/);
  });

  test('vpc-failed 면 안내와 재시도가 보이고 온보딩으로 넘어가지 않는다', async ({ page }) => {
    await gotoApp(page, '/auth/sign-up?scenario=me:vpc-failed');

    await page.getByLabel('Your name').fill('Sam Rivera');
    await page.getByLabel('Email').fill('sam@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/auth\/verify-parent$/);
    await expect(page.getByText("We couldn't complete this step yet.")).toBeVisible();

    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page).toHaveURL(/\/auth\/verify-parent$/);
  });
});

test.describe('Privacy · 반응형', () => {
  test('동의 화면에서 외부 도메인 요청이 0건이다 (AC-2-66)', async ({ page }) => {
    const external: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (!url.startsWith('http://127.0.0.1') && !url.startsWith('data:')) external.push(url);
    });

    await signUpWithEmail(page);
    await expect(page).toHaveURL(/\/auth\/consent$/);

    expect(external).toStrictEqual([]);
  });

  for (const width of [320, 393, 600, 1024]) {
    test(`동의 화면이 ${String(width)}px 에서 가로 스크롤을 만들지 않는다 (AC-2-59)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await signUpWithEmail(page);
      await expect(page).toHaveURL(/\/auth\/consent$/);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );

      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('동의 항목 행의 터치 타깃이 44 이상이다 (AC-2-60)', async ({ page }) => {
    await signUpWithEmail(page);
    await expect(page.getByRole('group', { name: 'Consent items' })).toBeVisible();

    const rows = page.locator('.haru-consent-row .haru-checkbox__row');
    const count = await rows.count();
    expect(count).toBe(5);

    for (let index = 0; index < count; index += 1) {
      const box = await rows.nth(index).boundingBox();
      if (box === null) continue;

      expect(box.height, `row ${String(index)} height`).toBeGreaterThanOrEqual(44);
    }
  });
});
