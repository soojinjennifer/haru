/**
 * Stage 6 `S6-B` — 설정 목록 `/settings` (`C13-S6-1`) + 아이 정보 수정 `/settings/child` (`C13-S6-2`)
 * (Figma 없음 — design-agent 명세 Spec §2.4 · §2.5 · §2.7 · §9.1 · §10.3 · §10.4 · §11,
 * AC-6-15 · 16 · 18 · 19 · 20 · 21 · 22 · 23).
 *
 * 로그인 후 앱 안 이동으로 연다 (새로고침은 Mock 인증을 지운다).
 * `R-BASELINE-1`: dev 패널은 가린다 · settle 후 촬영 · 임계값은 `playwright.config.ts` 상수.
 */
import { expect, test, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';
import { gotoApp, hideDevPanel, settle } from './support/gallery';
import { fillChildInfo } from './support/onboarding';
import { firstStartSession, logInToHome, requestPayloads, settleImages } from './support/session';

const UPDATE = 'PATCH /v1/children/:childId';
const EDIT_READY = '.haru-child-info-edit [data-state="ready"]';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

async function openSettings(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('list', { name: 'Your child' })).toBeVisible();
}

async function openChildInfo(page: Page, scenario?: string): Promise<void> {
  await openSettings(page, scenario);
  await page.getByRole('button', { name: 'Child info' }).click();
  await expect(page).toHaveURL(/\/settings\/child$/);
  await expect(page.locator(EDIT_READY)).toBeVisible();
  await settle(page);
}

const COMPLETE_BUBBLE_TEXT = '.haru-session-bubble--complete .haru-text';

/** Home → 세션 시작 → 녹음 → Submit → 완료 화면. */
async function completeSessionFromHome(page: Page): Promise<void> {
  await firstStartSession(page).click();
  const sheet = page.getByRole('dialog', { name: 'When will you read?' });
  await sheet.getByText('Bedtime', { exact: true }).click();
  await sheet.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: 'Start recording' })).toBeVisible();
  await settleImages(page);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
}

const firstName = (page: Page) => page.getByRole('textbox', { name: /First name/ });
const save = (page: Page) => page.getByRole('button', { name: 'Save', exact: true });

test.describe('설정 목록 (AC-6-15 · 16)', () => {
  test('2그룹 5행 · 행 → route · 뒤로 = 설정 목록 · 로그아웃 동작 유지', async ({ page }) => {
    await openSettings(page);

    await expect(page.getByRole('list', { name: 'Your child' }).getByRole('button')).toHaveText([
      'Profile',
      'Child info',
      'Update survey answers',
      'Growth focus',
    ]);
    // Stage 8 `Q8-02` ⓐ — 이동 행 2 → Log out (AC-8-13)
    await expect(page.getByRole('list', { name: 'Account' }).getByRole('button')).toHaveText([
      'Data & privacy',
      'Account',
      'Log out',
    ]);

    await page.getByRole('button', { name: 'Profile', exact: true }).click();
    await expect(page).toHaveURL(/\/settings\/profile$/);
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);

    await page.getByRole('button', { name: 'Child info' }).click();
    await expect(page).toHaveURL(/\/settings\/child$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Child info' })).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);

    // 로그아웃 — Stage 2 동작 회귀 없음 (Dialog 까지만)
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
  });
});

test.describe('아이 정보 수정 — 저장 · 교차 화면 (AC-6-18 · 19 · 22)', () => {
  test('바뀐 필드만 PATCH 1건 · Toast → 설정 목록 · 회고 카드 제목이 새 이름', async ({ page }) => {
    await openChildInfo(page);

    await expect(firstName(page)).toHaveValue('Emma');
    await expect(save(page)).toHaveAttribute('aria-disabled', 'true');
    // 관계(보호자 데이터)는 이 화면에 없다 (`N6-39`)
    await expect(page.getByText('Your relationship to this child')).toHaveCount(0);

    await firstName(page).fill('Mia');
    await page.getByRole('button', { name: 'Spanish' }).click();
    await save(page).dblclick();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByText('Saved')).toBeVisible();
    expect(await requestPayloads(page, UPDATE)).toEqual([
      { firstName: 'Mia', languageEnvironment: ['english', 'spanish'] },
    ]);

    // 교차 화면 — 설정 → Home → 세션 → 완료 화면 회고 카드 제목 (`Me.child.firstName`)
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByRole('banner').getByText('HARU')).toBeVisible();
    await completeSessionFromHome(page);
    await expect(page.getByRole('region', { name: 'How was storytime with Mia?' })).toBeVisible();
  });

  test('이름 수정 → 세션 완료 → 완료 버블과 회고 카드가 같은 새 이름 (QA-6-001 · AC-6-22)', async ({
    page,
  }) => {
    await openChildInfo(page);
    await firstName(page).fill('Mia');
    await save(page).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByRole('banner').getByText('HARU')).toBeVisible();

    await completeSessionFromHome(page);
    // 버블 문장은 Mock(서버) 응답 그대로다 — 이름은 아이 프로필 서버 상태에서 온다
    await expect(page.locator(COMPLETE_BUBBLE_TEXT)).toHaveText(
      'Storytime success! Mia did wonderfully.',
    );
    await expect(page.getByRole('region', { name: 'How was storytime with Mia?' })).toBeVisible();
    await expect(page.getByText(/Emma/)).toHaveCount(0);
  });
});

test.describe('아이 정보 수정 — 실패 (AC-6-20 · 21)', () => {
  test('`validation-failed` → 필드 오류 · 입력 보존 · 포커스 = 이름', async ({ page }) => {
    await openChildInfo(page, 'children.update:validation-failed');

    await firstName(page).fill('Mia');
    await save(page).click();

    await expect(page.getByText('Please check this and try again.')).toBeVisible();
    await expect(firstName(page)).toHaveValue('Mia');
    await expect(firstName(page)).toBeFocused();
    await expect(page).toHaveURL(/\/settings\/child$/);
  });

  test('`offline` → 안내 · 입력 보존 · 저장소 기록 0', async ({ page }) => {
    await openChildInfo(page, 'children.update:offline');

    await firstName(page).fill('Mia');
    await save(page).click();

    await expect(page.getByRole('alert').getByText("You're offline")).toBeVisible();
    await expect(firstName(page)).toHaveValue('Mia');

    const stored = await page.evaluate(() =>
      [
        ...Object.values({ ...globalThis.localStorage }),
        ...Object.values({ ...globalThis.sessionStorage }),
        JSON.stringify(window.history.state),
      ].join('\n'),
    );
    expect(stored).not.toContain('Mia');
  });

  test('`retry` → 첫 실패 · 다시 Save → 성공', async ({ page }) => {
    await openChildInfo(page, 'children.update:retry');

    await firstName(page).fill('Mia');
    await save(page).click();
    await expect(page.getByText("We couldn't save the changes right now")).toBeVisible();
    await save(page).click();
    await expect(page).toHaveURL(/\/settings$/);
  });
});

test.describe('변경 후 이탈 확인 (N6-14 ⓐ · AC-6-23)', () => {
  test('브라우저 back — 변경 있으면 Dialog(URL 그대로) · Keep editing · 다시 back → Discard → 설정 목록', async ({
    page,
  }) => {
    await openChildInfo(page);
    await firstName(page).fill('Mia');

    await page.goBack();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Your edits to Emma's info won't be saved.")).toBeVisible();
    await expect(page).toHaveURL(/\/settings\/child$/);

    await dialog.getByRole('button', { name: 'Keep editing' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(firstName(page)).toHaveValue('Mia');

    await page.goBack();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Discard' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    expect(await requestPayloads(page, UPDATE)).toEqual([]);

    // 다시 들어오면 서버 값 그대로
    await page.getByRole('button', { name: 'Child info' }).click();
    await expect(page.locator(EDIT_READY)).toBeVisible();
    await expect(firstName(page)).toHaveValue('Emma');
  });

  test('되돌린 뒤 브라우저 back — 확인 없이 설정 목록', async ({ page }) => {
    await openChildInfo(page);
    await firstName(page).fill('Mia');
    await firstName(page).fill('Emma');

    await page.goBack();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
  });

  test('TopBar 뒤로 — 변경 있으면 Dialog · Discard → 설정 목록 (브라우저 history 1칸)', async ({
    page,
  }) => {
    await openChildInfo(page);
    await firstName(page).fill('Mia');

    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Discard' }).click();
    await expect(page).toHaveURL(/\/settings$/);

    // sentinel 이 남지 않았다 — 한 번 더 뒤로 = Home
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByRole('banner').getByText('HARU')).toBeVisible();
  });
});

/**
 * `VG6-B-09` — 나이 Tag(`76:440`)는 **내용 폭 pill** 이다. 수정 전에는 부모 flex column(`align-items: stretch`)
 * 때문에 앱 컬럼 폭 전체(393 → 345)로 늘어났다. 두 화면(설정 아이 정보 · 온보딩 Step 1 편집 모드)이 같은
 * `ChildIdentityFields` 를 쓰므로 둘 다 본다. 기대값 = 라벨 글자 폭 + 좌우 padding (Tag 자체 CSS) — 리터럴 0.
 */
async function measureAgeTag(page: Page) {
  const tag = page.locator('.haru-tag--flexibility').first();
  await expect(tag).toBeVisible();
  return tag.evaluate((node) => {
    const style = window.getComputedStyle(node);
    const label = node.querySelector('.haru-tag__label') as HTMLElement;
    const field = node.closest('section') as HTMLElement;
    return {
      width: node.getBoundingClientRect().width,
      content:
        label.getBoundingClientRect().width +
        parseFloat(style.paddingLeft) +
        parseFloat(style.paddingRight),
      fieldWidth: field.getBoundingClientRect().width,
      left: node.getBoundingClientRect().left,
      fieldLeft: field.getBoundingClientRect().left,
    };
  });
}

test.describe('나이 Tag = 내용 폭 (VG6-B-09)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('설정 아이 정보', async ({ page }) => {
    await openChildInfo(page);
    const tag = await measureAgeTag(page);
    expect(tag.width).toBeCloseTo(tag.content, 0);
    expect(tag.width).toBeLessThan(tag.fieldWidth / 2);
    expect(tag.left).toBeCloseTo(tag.fieldLeft, 0);
  });

  test('온보딩 Step 1 편집 모드 (생년 선택 후)', async ({ page }) => {
    await gotoApp(page, '/onboarding/start?scenario=me:consent-missing');
    await page.getByRole('button', { name: 'Start the questions' }).click();
    await expect(page).toHaveURL(/\/onboarding\/child-info$/);
    await fillChildInfo(page);
    const tag = await measureAgeTag(page);
    expect(tag.width).toBeCloseTo(tag.content, 0);
    expect(tag.width).toBeLessThan(tag.fieldWidth / 2);
    expect(tag.left).toBeCloseTo(tag.fieldLeft, 0);
  });
});

for (const viewport of [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
  { width: 1024, height: 768 },
] as const) {
  test(`${String(viewport.width)}px — 가로 넘침 0 · Save 스크롤 도달 · 새 overflow 0`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openChildInfo(page);

    const overflow = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      shell:
        (document.querySelector('[data-app-shell-viewport]')?.scrollWidth ?? 0) -
        (document.querySelector('[data-app-shell-viewport]')?.clientWidth ?? 0),
      // 화면 안에 새 가로 클리핑 조상이 없다 — 앱 셸 뷰포트(뷰포트 폭)만
      clippers: (() => {
        const root = document.querySelector('.haru-child-info-edit');
        const found: number[] = [];
        for (let node = root; node !== null; node = node.parentElement) {
          if (window.getComputedStyle(node).overflowX !== 'visible') found.push(node.clientWidth);
        }
        return found;
      })(),
      viewport: window.innerWidth,
    }));
    expect(overflow.doc).toBe(0);
    expect(overflow.shell).toBe(0);
    for (const width of overflow.clippers) expect(width).toBeGreaterThanOrEqual(overflow.viewport);

    await save(page).scrollIntoViewIfNeeded();
    await expect(save(page)).toBeInViewport();
  });
}

/**
 * 신규 baseline — 393 폭 · 콘텐츠 전체 높이 · `main` 영역 클립 (Visual Gap 자료).
 */
test.describe('baseline — 393 (`R-BASELINE-1`)', () => {
  test.use({ viewport: { width: 393, height: 1300 } });

  test('s6-settings', async ({ page }) => {
    await openSettings(page);
    await settle(page);
    await expect(page.locator('main')).toHaveScreenshot('s6-settings.png', REGION_SNAPSHOT);
  });

  test('s6-settings-child', async ({ page }) => {
    await openChildInfo(page);
    await expect(page.locator('main')).toHaveScreenshot('s6-settings-child.png', REGION_SNAPSHOT);
  });

  test('s6-settings-child-save-failed', async ({ page }) => {
    await openChildInfo(page, 'children.update:error');
    await firstName(page).fill('Mia');
    await save(page).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await page.mouse.move(0, 0);
    await settle(page);
    await expect(page.locator('main')).toHaveScreenshot(
      's6-settings-child-save-failed.png',
      REGION_SNAPSHOT,
    );
  });
});
