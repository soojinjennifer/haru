/**
 * Stage 6 `S6-D` — 발전 역량 설정 모드 `/settings/growth-capability` (Figma 없음 — `C13-S6-4` design-agent 명세
 * Spec §2.3 · §2.3.1 · §2.3.2 · §9.5 · §10.2 · §11, AC-6-16 · 30 · 31 · 32 · 47 · 64).
 *
 * 온보딩 모드(`growth-capability.spec.ts`)와 **같은 컴포넌트**다(`D6-6`). 여기서는 설정 모드에서만 다른 것을 본다:
 * 진입 경로(설정 목록 행) · TopBar "Growth focus" = h1 · 무제안 안내 문장(`D6-8` 보충) · *Current* · 변경 없음 →
 * Save 비활성 · 저장 → Toast → 뒤로 · 캐시 반영 · 이탈 확인 없음(`N6-46`) · 조회 실패에 *Continue to Home* 없음.
 *
 * 로그인 후 앱 안 이동으로 연다 (새로고침은 Mock 인증을 지운다).
 * `R-BASELINE-1`: dev 패널은 가린다 · settle 후 촬영 · 임계값은 `playwright.config.ts` 상수.
 */
import { expect, test, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';
import { hideDevPanel, settle } from './support/gallery';
import { logInToHome, requestPayloads } from './support/session';

const PUT = 'PUT /v1/children/:childId/growth-capability';
const READY = '.haru-growth-focus [data-state="ready"]';
const NO_SUGGESTION = "Choose the one you'd like to explore together first.";

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

async function openSettings(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('list', { name: 'Your child' })).toBeVisible();
}

async function openGrowthFocus(page: Page, scenario?: string): Promise<void> {
  await openSettings(page, scenario);
  await page.getByRole('button', { name: 'Growth focus' }).click();
  await expect(page).toHaveURL(/\/settings\/growth-capability$/);
  await expect(page.locator(READY)).toBeVisible();
  await settle(page);
}

const save = (page: Page) => page.getByRole('button', { name: 'Save', exact: true });

test.describe('진입 · 구성 · 저장 (AC-6-16 · 30 · 31 · 64)', () => {
  test('설정 행 → 화면 · h1 = TopBar "Growth focus" · 무제안 안내 · 현재값 "Current" · Save 비활성', async ({
    page,
  }) => {
    await openGrowthFocus(page);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Growth focus');
    await expect(page.getByText(NO_SUGGESTION)).toBeVisible();
    await expect(page.getByText("We've suggested a place to begin.", { exact: false })).toHaveCount(
      0,
    );
    // 기본 fixture 현재값 = Cognitive Flexibility
    await expect(page.getByRole('radio', { name: 'Cognitive Flexibility Current' })).toBeChecked();
    await expect(page.getByText('Suggested', { exact: true })).toHaveCount(0);
    await expect(page.getByText('You can change this anytime in Settings.')).toHaveCount(0);
    await expect(save(page)).toHaveAttribute('aria-disabled', 'true');

    await save(page).click({ force: true });
    expect(await requestPayloads(page, PUT)).toEqual([]);
  });

  test('바꾸고 Save(더블 탭) → PUT 1건 → Toast "Saved" → 설정 목록 · 다시 들어오면 새 값이 "Current"', async ({
    page,
  }) => {
    await openGrowthFocus(page);

    await page.getByRole('radio', { name: 'Emotion Regulation' }).check();
    await expect(
      page.getByRole('radio', { name: 'Cognitive Flexibility Current' }),
    ).not.toBeChecked();
    await expect(save(page)).not.toHaveAttribute('aria-disabled', 'true');
    await save(page).dblclick();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
    expect(await requestPayloads(page, PUT)).toEqual([{ capability: 'emotion_regulation' }]);

    // 캐시 = 응답 (낙관적 갱신 아님) — 재진입 시 새 현재값
    await page.getByRole('button', { name: 'Growth focus' }).click();
    await expect(page.locator(READY)).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Emotion Regulation Current' })).toBeChecked();
    await expect(save(page)).toHaveAttribute('aria-disabled', 'true');
  });

  test('뒤로 — 바꾼 뒤에도 확인 없이 설정 목록 (`N6-46`) · 저장 0', async ({ page }) => {
    await openGrowthFocus(page);
    await page.getByRole('radio', { name: 'Self-Direction' }).check();

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    expect(await requestPayloads(page, PUT)).toEqual([]);

    // 저장하지 않았으므로 현재값은 그대로
    await page.getByRole('button', { name: 'Growth focus' }).click();
    await expect(page.getByRole('radio', { name: 'Cognitive Flexibility Current' })).toBeChecked();
  });

  test('브라우저 back — 설정 목록', async ({ page }) => {
    await openGrowthFocus(page);
    await page.goBack();
    await expect(page).toHaveURL(/\/settings$/);
  });
});

test.describe('저장 실패 (AC-6-31 · Spec §2.3.1)', () => {
  test('`error` → 안내 · 선택 보존 · 화면 유지 · 다시 들어오면 이전 값', async ({ page }) => {
    await openGrowthFocus(page, 'children.setgrowthcapability:error');
    await page.getByRole('radio', { name: 'Emotion Regulation' }).check();
    await save(page).click();

    await expect(page.getByRole('alert')).toContainText("We couldn't save your choice right now");
    await expect(page.getByRole('alert')).toContainText('Your selection is still here. Try again.');
    await expect(page.getByRole('radio', { name: 'Emotion Regulation' })).toBeChecked();
    await expect(page).toHaveURL(/\/settings\/growth-capability$/);

    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('button', { name: 'Growth focus' }).click();
    await expect(page.getByRole('radio', { name: 'Cognitive Flexibility Current' })).toBeChecked();
  });

  test('`offline` → 오프라인 안내 · 선택 보존', async ({ page }) => {
    await openGrowthFocus(page, 'children.setgrowthcapability:offline');
    await page.getByRole('radio', { name: 'Intrinsic Motivation' }).check();
    await save(page).click();

    await expect(page.getByRole('alert')).toContainText("You're offline");
    await expect(page.getByRole('radio', { name: 'Intrinsic Motivation' })).toBeChecked();
    await expect(page).toHaveURL(/\/settings\/growth-capability$/);
  });

  test('`retry` → 첫 실패 · 다시 Save → 성공 → 설정 목록', async ({ page }) => {
    await openGrowthFocus(page, 'children.setgrowthcapability:retry');
    await page.getByRole('radio', { name: 'Emotion Regulation' }).check();
    await save(page).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await save(page).click();
    await expect(page).toHaveURL(/\/settings$/);
  });
});

test.describe('조회 상태 · 결측 (AC-6-32 · Spec §2.3.1)', () => {
  test('Loading → Skeleton (aria-busy) → 화면', async ({ page }) => {
    await openSettings(page, 'children:loading');
    await page.getByRole('button', { name: 'Growth focus' }).click();
    await expect(page.getByRole('status', { name: 'Loading' })).toBeVisible();
    await expect(page.locator(READY)).toBeVisible({ timeout: 5_000 });
  });

  test('조회 실패 → ErrorState(h2) + Try again · Continue to Home 없음', async ({ page }) => {
    await openSettings(page, 'children:error');
    await page.getByRole('button', { name: 'Growth focus' }).click();
    await expect(page.locator('.haru-growth-focus [data-state="error"]')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue to Home' })).toHaveCount(0);
  });

  test('조회 오프라인 → 오프라인 ErrorState', async ({ page }) => {
    await openSettings(page, 'children:offline');
    await page.getByRole('button', { name: 'Growth focus' }).click();
    const error = page.locator('.haru-growth-focus [data-state="error"]');
    await expect(error).toBeVisible();
    await expect(error.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('`all-scores-missing` — 현재값 없음 → 미선택 · Save 비활성 + 사유 · null 축 선택 후 저장', async ({
    page,
  }) => {
    await openGrowthFocus(page, 'children:all-scores-missing');
    await expect(page.getByText(NO_SUGGESTION)).toBeVisible();
    for (const radio of await page.getByRole('radio').all()) await expect(radio).not.toBeChecked();
    await expect(page.getByText('Current', { exact: true })).toHaveCount(0);
    await expect(save(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(save(page)).toHaveAccessibleDescription('Choose one to continue.');

    await page.getByRole('radio', { name: 'Self-Direction' }).check();
    await expect(save(page)).not.toHaveAttribute('aria-disabled', 'true');
    await save(page).click();
    await expect(page).toHaveURL(/\/settings$/);
    expect(await requestPayloads(page, PUT)).toEqual([{ capability: 'self_directed_agency' }]);
  });
});

for (const viewport of [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
  { width: 1024, height: 768 },
] as const) {
  test(`${String(viewport.width)}px — 가로 넘침 0 · 카드 좌우 ≥ 4 · 새 overflow 0 · Save 스크롤 도달 (AC-6-47)`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openGrowthFocus(page);

    const probe = await page.evaluate(() => {
      const card = document.querySelector('.haru-growth-focus .haru-surface') as HTMLElement;
      const rect = card.getBoundingClientRect();
      const clippers: { width: number; insideView: boolean }[] = [];
      for (let node = card.parentElement; node !== null; node = node.parentElement) {
        if (getComputedStyle(node).overflowX === 'visible') continue;
        clippers.push({
          width: node.getBoundingClientRect().width,
          insideView: node.closest('.haru-growth-focus') !== null,
        });
      }
      const group = document.querySelector('.haru-growth-focus .haru-radio-group') as HTMLElement;
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        left: rect.left,
        right: window.innerWidth - rect.right,
        gapBelow: group.getBoundingClientRect().top - rect.bottom,
        clippers,
      };
    });
    expect(probe.overflow).toBe(0);
    expect(probe.left).toBeGreaterThanOrEqual(4);
    expect(probe.right).toBeGreaterThanOrEqual(4);
    // `--shadow-bubble` 아래 번짐 10 ≤ 다음 요소까지 간격 (Spec §9.5)
    expect(probe.gapBelow).toBeGreaterThanOrEqual(10);
    expect(probe.clippers.filter((clipper) => clipper.insideView)).toEqual([]);
    for (const clipper of probe.clippers) {
      expect(clipper.width).toBeGreaterThanOrEqual(viewport.width);
    }

    await save(page).scrollIntoViewIfNeeded();
    await expect(save(page)).toBeInViewport();
  });
}

/**
 * 상태별 baseline — `main` 영역 클립 (Spec §14 "발전 역량 2모드 × default/changed/null/저장 실패" 중 설정 모드).
 * 콘텐츠 전체가 들어가는 393×1200 으로 찍는다 (온보딩 모드 baseline 과 같은 크기).
 */
test.describe('baseline — 393 폭 · 전체 콘텐츠 (`R-BASELINE-1`)', () => {
  test.use({ viewport: { width: 393, height: 1200 } });

  test('s6-growth-settings', async ({ page }) => {
    await openGrowthFocus(page);
    await expect(page.locator('main')).toHaveScreenshot('s6-growth-settings.png', REGION_SNAPSHOT);
  });

  test('s6-growth-settings-changed', async ({ page }) => {
    await openGrowthFocus(page);
    await page.getByRole('radio', { name: 'Emotion Regulation' }).check();
    await page.mouse.move(0, 0);
    await settle(page);
    await expect(page.locator('main')).toHaveScreenshot(
      's6-growth-settings-changed.png',
      REGION_SNAPSHOT,
    );
  });

  test('s6-growth-settings-empty', async ({ page }) => {
    await openGrowthFocus(page, 'children:all-scores-missing');
    await expect(page.locator('main')).toHaveScreenshot(
      's6-growth-settings-empty.png',
      REGION_SNAPSHOT,
    );
  });

  test('s6-growth-settings-save-failed', async ({ page }) => {
    await openGrowthFocus(page, 'children.setgrowthcapability:error');
    await page.getByRole('radio', { name: 'Emotion Regulation' }).check();
    await save(page).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await page.mouse.move(0, 0);
    await settle(page);
    await expect(page.locator('main')).toHaveScreenshot(
      's6-growth-settings-save-failed.png',
      REGION_SNAPSHOT,
    );
  });
});
