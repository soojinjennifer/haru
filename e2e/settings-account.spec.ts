/**
 * Stage 8 `S8-D` — 계정 `/settings/account` (`C13-S8-6`) · 탈퇴 (§2.4-③) · 미가입 기기 draft 삭제 (`C13-S8-7`, `QA-2R-004`).
 * Figma 없음 — design-agent 명세 Spec §2.5 `VG8-C-12` · §2.6 · §2.7 · §6.2 · §10.4 · §10.5 (AC-8-33~39 화면 부분).
 *
 * 로그인 후 앱 안 이동으로 연다 (새로고침은 Mock 인증을 지운다). scenario 는 첫 진입 URL 에 붙인다.
 * `R-BASELINE-1`: dev 패널은 가린다 · settle 후 촬영 · 포인터 치움 · 포커스 해제 · 임계값은 `playwright.config.ts` 상수.
 */
import { expect, test, type Page } from '@playwright/test';

import { FRAME_SNAPSHOT, REGION_SNAPSHOT } from '../playwright.config';
import { gotoApp, hideDevPanel, settle } from './support/gallery';
import { seedChildDraft } from './support/onboarding';
import { logInToHome, requestOperations, requestPayloads } from './support/session';

const DELETE_ME_OP = 'DELETE /v1/me';
const EMAIL = 'sam@example.com';
const DRAFT_KEY = 'haru.onboarding.draft.v1';
const CARD_CACHE_KEY = 'haru.activity-card.v1';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

async function openAccount(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await expect(page).toHaveURL(/\/settings\/account$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Account' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Signed in as' })).toBeVisible();
}

const deleteRow = (page: Page) =>
  page
    .getByRole('list', { name: 'Delete account' })
    .getByRole('button', { name: 'Delete account' });

async function confirmDeletion(page: Page): Promise<void> {
  await deleteRow(page).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete account' }).click();
}

const count = async (page: Page, op: string) =>
  (await requestOperations(page)).filter((entry) => entry === op).length;

/** 포커스 · 포인터를 치운다 — 촬영 상태에 상호작용 흔적을 담지 않는다 (`R-BASELINE-1`). */
async function clearInteraction(page: Page): Promise<void> {
  await page.locator('body').evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  });
  await page.mouse.move(0, 0);
}

test.describe('계정 화면 (AC-8-33)', () => {
  test('이메일 = 응답 값 · 표시 전용 · 요금제 0 · 탈퇴 진입', async ({ page }) => {
    await openAccount(page);
    const signedIn = page.getByRole('list', { name: 'Signed in as' });
    await expect(signedIn.getByRole('listitem')).toHaveCount(1);
    await expect(signedIn.getByRole('listitem')).toHaveText(EMAIL);
    await expect(signedIn.getByRole('button')).toHaveCount(0);
    await expect(page.getByText(/plan|beta|free/i)).toHaveCount(0);
    await expect(page.getByText('SIGNED IN AS', { exact: true })).toBeVisible();
    await expect(page.getByText('DELETE ACCOUNT', { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        "Deleting your account also deletes all of Emma's data and signs you out on this device.",
      ),
    ).toBeVisible();
    await expect(deleteRow(page)).toBeEnabled();
  });

  test('콘솔에 이메일 원문 0 (AC-8-93 · Plan §5.5)', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', (message) => logs.push(message.text()));
    await openAccount(page);
    await confirmDeletion(page);
    await expect(page).toHaveURL(/\/auth\/welcome$/);
    expect(logs.filter((line) => line.includes(EMAIL))).toEqual([]);
  });
});

test.describe('탈퇴 (AC-8-34 · 35 · 36)', () => {
  test('Cancel → 요청 0 · 포커스 = 행', async ({ page }) => {
    await openAccount(page);
    await deleteRow(page).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('Delete your account?')).toBeVisible();
    await expect(
      dialog.getByText(
        "Your account and all of Emma's data will be deleted. This can't be undone.",
      ),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(deleteRow(page)).toBeFocused();
    expect(await count(page, DELETE_ME_OP)).toBe(0);
  });

  test('확인 → DELETE 1회 → 로컬 0 · /auth/welcome replace · Toast 1회 · 뒤로 가기 = 보호 화면 0', async ({
    page,
  }) => {
    await openAccount(page);
    await page.evaluate(
      ([draft, cards]: readonly [string, string]) => {
        globalThis.localStorage.setItem(draft, '{"schemaVersion":1}');
        globalThis.localStorage.setItem(cards, '{"schemaVersion":1}');
      },
      [DRAFT_KEY, CARD_CACHE_KEY] as const,
    );
    const payloadsBefore = await requestPayloads(page, DELETE_ME_OP);
    expect(payloadsBefore).toHaveLength(0);

    await confirmDeletion(page);
    await expect(page).toHaveURL(/\/auth\/welcome$/);
    await expect(page.getByText('Your account was deleted.')).toHaveCount(1);
    await expect(page.getByText('Your account was deleted.')).toBeVisible();
    expect(await requestPayloads(page, DELETE_ME_OP)).toEqual([{ confirmation: true }]);
    expect(
      await page.evaluate(
        ([draft, cards]: readonly [string, string]) => [
          globalThis.localStorage.getItem(draft),
          globalThis.localStorage.getItem(cards),
        ],
        [DRAFT_KEY, CARD_CACHE_KEY] as const,
      ),
    ).toEqual([null, null]);

    // 뒤로 가기 — 보호 화면이 다시 그려지지 않는다 (세션 0 → Guard 가 welcome 으로)
    await page.goBack();
    await expect(page).toHaveURL(/\/auth\/welcome$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Account' })).toHaveCount(0);
    await expect(page.getByRole('list', { name: 'Your child' })).toHaveCount(0);
    await page.goBack();
    await expect(page).toHaveURL(/\/auth\/(welcome|log-in)/);
    await expect(page.getByRole('banner').getByText('HARU')).toHaveCount(0);
  });

  test('실패 → error 알림 · 경로 그대로 · 로컬 보존 · 다시 시도 가능', async ({ page }) => {
    await openAccount(page, 'account:error');
    await page.evaluate((draft) => {
      globalThis.localStorage.setItem(draft, '{"schemaVersion":1}');
    }, DRAFT_KEY);
    await confirmDeletion(page);
    await expect(page.getByRole('alert')).toBeVisible();
    // 설명 = 무엇이 바뀌었는가 (Spec §10.4 `VG8-D-03`)
    await expect(page.getByRole('alert')).toContainText('Nothing was deleted. You can try again.');
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/settings\/account$/);
    expect(
      await page.evaluate((draft) => globalThis.localStorage.getItem(draft), DRAFT_KEY),
    ).not.toBe(null);
    await expect(deleteRow(page)).toBeFocused();
    await expect(deleteRow(page)).toBeEnabled();
  });

  test('기기 오프라인 → 요청 0 · offline 알림 · 경로 그대로', async ({ page, context }) => {
    await openAccount(page);
    await context.setOffline(true);
    await confirmDeletion(page);
    await expect(page.getByText('Nothing was sent.')).toBeVisible();
    expect(await count(page, DELETE_ME_OP)).toBe(0);
    await expect(page).toHaveURL(/\/settings\/account$/);
    await context.setOffline(false);
  });

  test('진행 중 전체 삭제 → 행 활성 · 서버 DELETION_ALREADY_REQUESTED → info 알림', async ({
    page,
  }) => {
    await openAccount(page, 'account:deletion-pending-write-blocked');
    await expect(deleteRow(page)).toBeEnabled();
    await confirmDeletion(page);
    // 제목 + 설명 2줄 표면 (Spec §10.4 `VG8-D-04` — 단어 변경 0)
    const info = page.locator('.haru-alert--info').filter({
      hasText: 'Your data is already being deleted',
    });
    await expect(
      info.getByText('Your data is already being deleted', { exact: true }),
    ).toBeVisible();
    await expect(
      info.getByText('You can delete your account after it finishes.', { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page).toHaveURL(/\/settings\/account$/);
  });
});

test.describe('탈퇴 후 welcome = Figma `179:1701` 레이아웃 불변 (Spec §13 `S8-D` — Toast 숨김 후 diff 0)', () => {
  test.use({ viewport: { width: 393, height: 852 } });
  /** 두 테스트가 **같은 baseline** 을 비교한다 — 직접 연 welcome 과 탈퇴 후 welcome(Toast 숨김)이 같아야 한다. */
  const SNAPSHOT = 's8-welcome-frame.png';

  test('직접 연 welcome', async ({ page }) => {
    await gotoApp(page, '/auth/welcome');
    await clearInteraction(page);
    await settle(page);
    await expect(page).toHaveScreenshot(SNAPSHOT, { fullPage: false, ...FRAME_SNAPSHOT });
  });

  test('탈퇴 후 welcome (Toast 숨김)', async ({ page }) => {
    await openAccount(page);
    await confirmDeletion(page);
    await expect(page).toHaveURL(/\/auth\/welcome$/);
    await expect(page.getByText('Your account was deleted.')).toBeVisible();
    await page.addStyleTag({
      content: '.haru-toast-viewport { visibility: hidden !important; }',
    });
    await clearInteraction(page);
    await settle(page);
    await expect(page).toHaveScreenshot(SNAPSHOT, { fullPage: false, ...FRAME_SNAPSHOT });
  });
});

test.describe('미가입 기기 draft 삭제 (AC-8-37 · 38 — QA-2R-004)', () => {
  const link = (page: Page) =>
    page.getByRole('button', { name: 'Remove my answers from this device' });

  test('Step 1 Trial + draft → Trial 안내 바로 아래 TextLink (간격 8 · 시작 정렬 · 터치 44)', async ({
    page,
  }) => {
    await seedChildDraft(page, 'Yuna');
    await gotoApp(page, '/onboarding/child-info');
    const alert = page.locator('.haru-trial-notice .haru-alert');
    await expect(alert).toBeVisible();
    await expect(link(page)).toBeVisible();
    const a = await alert.boundingBox();
    const l = await link(page).boundingBox();
    expect(a).not.toBeNull();
    expect(l).not.toBeNull();
    if (a === null || l === null) return;
    expect(Math.round(l.y - (a.y + a.height))).toBe(8);
    expect(Math.round(l.x)).toBe(Math.round(a.x));
    expect(l.height).toBeGreaterThanOrEqual(44);
  });

  test('draft 없음 → TextLink 0 · welcome / saved 에는 TextLink 0', async ({ page }) => {
    await gotoApp(page, '/onboarding/child-info');
    await expect(page.getByText('Your answers stay on this device')).toBeVisible();
    await expect(link(page)).toHaveCount(0);
    await gotoApp(page, '/auth/welcome');
    await expect(link(page)).toHaveCount(0);
  });

  test('Trial 안내 닫기 → TextLink 함께 숨음', async ({ page }) => {
    await seedChildDraft(page, 'Yuna');
    await gotoApp(page, '/onboarding/child-info');
    await expect(link(page)).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(page.getByText('Your answers stay on this device')).toHaveCount(0);
    await expect(link(page)).toHaveCount(0);
  });

  test('Keep → 변화 0 · Remove → draft 0 · 서버 요청 0 · /onboarding replace · Toast 1회', async ({
    page,
  }) => {
    await seedChildDraft(page, 'Yuna');
    await gotoApp(page, '/onboarding/child-info');
    await link(page).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('Remove answers from this device?')).toBeVisible();
    await expect(
      dialog.getByText(
        'Your answers about Yuna will be removed from this device. Nothing was sent to HARU.',
      ),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Keep' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Keep' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(link(page)).toBeFocused();
    expect(await page.evaluate((key) => globalThis.localStorage.getItem(key), DRAFT_KEY)).not.toBe(
      null,
    );

    await link(page).click();
    await dialog.getByRole('button', { name: 'Remove' }).click();
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByText('Removed from this device.')).toHaveCount(1);
    expect(await page.evaluate((key) => globalThis.localStorage.getItem(key), DRAFT_KEY)).toBe(
      null,
    );
    expect(await requestOperations(page)).toEqual([]);
    await expect(link(page)).toHaveCount(0);
    await expect(page.getByText('Your answers stay on this device')).toBeVisible();
  });
});

/**
 * 신규 baseline — 393 · 320 · `main` 영역 클립 (Visual Gap 자료, Spec §13 `S8-D`).
 */
for (const width of [393, 320] as const) {
  test.describe(`baseline — ${String(width)} (\`R-BASELINE-1\`)`, () => {
    test.use({ viewport: { width, height: 1000 } });
    const name = (id: string) => `s8-${id}-${String(width)}.png`;

    test('account', async ({ page }) => {
      await openAccount(page);
      await clearInteraction(page);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(name('account'), REGION_SNAPSHOT);
    });

    test('account-dialog', async ({ page }) => {
      await openAccount(page);
      await deleteRow(page).click();
      const dialog = page.getByRole('alertdialog');
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
      await settle(page);
      await expect(dialog).toHaveScreenshot(name('account-dialog'), REGION_SNAPSHOT);
    });

    test('account-failed', async ({ page }) => {
      await openAccount(page, 'account:error');
      await confirmDeletion(page);
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('alertdialog')).toHaveCount(0);
      await clearInteraction(page);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(name('account-failed'), REGION_SNAPSHOT);
    });

    test('account-already-requested', async ({ page }) => {
      await openAccount(page, 'account:deletion-pending-write-blocked');
      await confirmDeletion(page);
      await expect(
        page.getByText('Your data is already being deleted', { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole('alertdialog')).toHaveCount(0);
      await clearInteraction(page);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(
        name('account-already-requested'),
        REGION_SNAPSHOT,
      );
    });

    test('trial-draft-link', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-10-15T12:00:00Z'));
      await seedChildDraft(page, 'Yuna', 2020);
      await gotoApp(page, '/onboarding/child-info');
      await expect(
        page.getByRole('button', { name: 'Remove my answers from this device' }),
      ).toBeVisible();
      await clearInteraction(page);
      await settle(page);
      await expect(page.locator('.haru-trial-notice')).toHaveScreenshot(
        name('trial-draft-link'),
        REGION_SNAPSHOT,
      );
    });

    // `VG8-D-07` (`D8-2` ③) — `/onboarding/start`(`243:1147`) Trial 안내 아래 같은 링크 (Step 1 과 같은 규칙)
    test('trial-start-draft-link', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-10-15T12:00:00Z'));
      await seedChildDraft(page, 'Yuna', 2020);
      await gotoApp(page, '/onboarding/start');
      await expect(
        page.getByRole('button', { name: 'Remove my answers from this device' }),
      ).toBeVisible();
      await clearInteraction(page);
      await settle(page);
      await expect(page.locator('.haru-trial-notice')).toHaveScreenshot(
        name('trial-start-draft-link'),
        REGION_SNAPSHOT,
      );
    });

    test('trial-draft-dialog', async ({ page }) => {
      await seedChildDraft(page, 'Yuna');
      await gotoApp(page, '/onboarding/child-info');
      await page.getByRole('button', { name: 'Remove my answers from this device' }).click();
      const dialog = page.getByRole('alertdialog');
      await expect(dialog.getByRole('button', { name: 'Keep' })).toBeFocused();
      await settle(page);
      await expect(dialog).toHaveScreenshot(name('trial-draft-dialog'), REGION_SNAPSHOT);
    });
  });
}
