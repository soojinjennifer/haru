/**
 * Stage 6 `S6-E2` — 발전 역량 온보딩 모드 `/onboarding/growth-capability` + 온보딩 끝 흐름
 * (Figma 없음 — `C13-10` design-agent 명세 Spec §2.3 · §3.1 selectable · §3.2 · §9.1 · §9.4 · §9.5 · §11,
 * AC-6-47 · 53 · 54 · 61 · 62 · 65 · 66). 설정 모드 route 연결은 `S6-D` — 여기서 열지 않는다.
 *
 * 로그인 후 SPA 이동으로 연다 (새로고침은 Mock 인증을 지운다 — `profile-result.spec.ts` 와 같다).
 * `R-BASELINE-1`: dev 패널은 가린다 · settle 후 촬영 · 임계값은 `playwright.config.ts` 상수.
 */
import { expect, test, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';
import { hideDevPanel, settle } from './support/gallery';
import { completeOnboardingToSaved } from './support/onboarding';
import { logInToHome } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const GROWTH = '/onboarding/growth-capability';
const READY = '.haru-growth-focus [data-state="ready"]';

async function spaGoto(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function openGrowth(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await spaGoto(page, GROWTH);
  await expect(page.locator(READY)).toBeVisible();
  await settle(page);
}

test.describe('흐름 (AC-6-53 · 54 · 65)', () => {
  test('Trial 가입 전환 경로: saved → profile → Next → growth → Start with this → Home (replace)', async ({
    page,
  }) => {
    await completeOnboardingToSaved(page);
    await page.getByRole('button', { name: 'Get started' }).click();
    await expect(page).toHaveURL(/\/onboarding\/profile$/);
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/onboarding\/growth-capability$/);
    await expect(page.locator(READY)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Pick one to focus on together',
    );

    await page.getByRole('button', { name: 'Start with this' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('banner').getByText('HARU')).toBeVisible();

    // replace — 뒤로 가도 발전 역량·saved 로 돌아가지 않는다
    await page.goBack();
    await expect(page).not.toHaveURL(/growth-capability|\/onboarding\/saved/);
  });

  test('뒤로 → `/onboarding/profile`', async ({ page }) => {
    await openGrowth(page);
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/onboarding\/profile$/);
    await expect(page.locator('.haru-profile-view [data-state="ready"]')).toBeVisible();
  });

  test('Guard 변경 0 (`D-6`) — 두 화면을 건너뛰고 Home 으로 가도 재강제 없음', async ({ page }) => {
    await openGrowth(page);
    await spaGoto(page, '/');
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.locator('.haru-activity-track:not(.haru-activity-track--skeleton)'),
    ).toBeVisible();
  });
});

test.describe('393×852 — 선택 · 키보드 · 저장 실패 (AC-6-61 · 62)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('축 탭 = 목록 선택 · 차트 버튼 히트 ≥ 44×44 · 서로 겹침 0 (Spec §3.1 · §9.4)', async ({
    page,
  }) => {
    await openGrowth(page);
    const hits = await page.evaluate(() =>
      [...document.querySelectorAll('button.haru-diamond__label')].map((node) => {
        const label = node.getBoundingClientRect();
        const after = getComputedStyle(node, '::after');
        return {
          axis: node.getAttribute('data-axis'),
          width: Math.max(label.width, parseFloat(after.width)),
          height: Math.max(label.height, parseFloat(after.height)),
          rect: label.toJSON() as DOMRect,
        };
      }),
    );
    expect(hits).toHaveLength(4);
    for (const hit of hits) {
      expect(hit.width).toBeGreaterThanOrEqual(44);
      expect(hit.height).toBeGreaterThanOrEqual(44);
    }

    await page.locator('button.haru-diamond__label[data-axis="intrinsic_motivation"]').click();
    await expect(page.getByRole('radio', { name: 'Intrinsic Motivation' })).toBeChecked();
    // 제시값(기본 fixture = Cognitive Flexibility, 최저 점수) 의 "Suggested" 는 원래 옵션에 남는다
    await expect(
      page.getByRole('radio', { name: 'Cognitive Flexibility Suggested' }),
    ).not.toBeChecked();
    await expect(page.locator('[aria-live="polite"]')).toHaveText(
      'Following their own curiosity and enjoying the effort for its own sake.',
    );
  });

  test('키보드: Back → RadioGroup(1 tab stop, 화살표 = 선택) → CTA · 차트 버튼은 포커스 0 (Spec §9.1)', async ({
    page,
  }) => {
    await openGrowth(page);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Back' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('radio', { name: 'Cognitive Flexibility Suggested' }),
    ).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio', { name: 'Intrinsic Motivation' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Intrinsic Motivation' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Start with this' })).toBeFocused();
  });

  test('저장 실패 → 선택 보존 + 안내 → 다시 누르면 재시도 → Home', async ({ page }) => {
    await openGrowth(page, 'children.setgrowthcapability:retry');
    await page.getByRole('radio', { name: 'Emotion Regulation' }).check();
    await page.getByRole('button', { name: 'Start with this' }).click();
    await expect(page.getByRole('alert')).toContainText("We couldn't save your choice right now");
    await expect(page.getByRole('radio', { name: 'Emotion Regulation' })).toBeChecked();
    await expect(page).toHaveURL(/growth-capability$/);
    await page.getByRole('button', { name: 'Start with this' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('제안 없음 — CTA aria-disabled + 사유 · 누름 무시 · null 축 선택 후 진행', async ({
    page,
  }) => {
    await openGrowth(page, 'children:all-scores-missing');
    const cta = page.getByRole('button', { name: 'Start with this' });
    await expect(cta).toHaveAttribute('aria-disabled', 'true');
    await expect(cta).toHaveAccessibleDescription('Choose one to continue.');
    // Playwright 는 aria-disabled 를 "not enabled" 로 본다 — 실제 누름이 무시되는지 force 로 확인한다
    await cta.click({ force: true });
    await expect(page).toHaveURL(/growth-capability$/);
    await page.getByRole('radio', { name: 'Self-Direction' }).check();
    await expect(cta).not.toHaveAttribute('aria-disabled', 'true');
    await cta.click();
    await expect(page).toHaveURL(/\/$/);
  });
});

/** Spec §11.1 — 컬럼별 다이아몬드 대각선 2h (프로필과 같은 카드 폭). */
const WIDTHS = [
  { viewport: { width: 320, height: 568 }, diamond: 100 },
  { viewport: { width: 393, height: 852 }, diamond: 173 },
  { viewport: { width: 600, height: 800 }, diamond: 200 },
  { viewport: { width: 1024, height: 768 }, diamond: 200 },
] as const;

for (const { viewport, diamond } of WIDTHS) {
  test.describe(`${String(viewport.width)}×${String(viewport.height)} — 넘침 · 그림자 자리 (AC-6-47 · 66)`, () => {
    test.use({ viewport });

    test(`다이아몬드 ${String(diamond)} · 가로 넘침 0 · 카드 좌우 ≥ 4 · 새 overflow 0 · CTA 스크롤 도달`, async ({
      page,
    }) => {
      await openGrowth(page);
      const plot = await page.locator('.haru-diamond__plot').boundingBox();
      expect(plot?.width).toBeCloseTo(diamond, 0);

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
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          left: rect.left,
          right: window.innerWidth - rect.right,
          clippers,
        };
      });
      expect(probe.overflow).toBe(0);
      expect(probe.left).toBeGreaterThanOrEqual(4);
      expect(probe.right).toBeGreaterThanOrEqual(4);
      expect(probe.clippers.filter((clipper) => clipper.insideView)).toEqual([]);
      for (const clipper of probe.clippers) {
        expect(clipper.width).toBeGreaterThanOrEqual(viewport.width);
      }

      // 차트 카드 아래 그림자 자리(10) ≤ 다음 요소까지 간격
      const gap = await page.evaluate(() => {
        const card = document.querySelector('.haru-growth-focus .haru-surface') as HTMLElement;
        const group = document.querySelector('.haru-growth-focus .haru-radio-group') as HTMLElement;
        return group.getBoundingClientRect().top - card.getBoundingClientRect().bottom;
      });
      expect(gap).toBeGreaterThanOrEqual(10);

      const cta = page.getByRole('button', { name: 'Start with this' });
      await cta.scrollIntoViewIfNeeded();
      await expect(cta).toBeInViewport();
    });
  });
}

/**
 * `VG6-E2-04` — 선택 행은 **hover 중에도** teal 채움(`--color-selected-bg`)을 유지한다.
 * 수정 전: 일반 hover 규칙(특이도 0,3,0)이 선택 복원 규칙(0,2,0)을 이겨 선택 행이 `#dbeee7` + 흰 라벨(1.21:1)
 * 이었다. 비교 기준은 **같은 행의 hover 없는 computed 값**이다(색 리터럴을 테스트에 두지 않는다).
 * 반대 방향도 본다: **선택되지 않은 행**의 hover 는 여전히 tinted 로 바뀐다(hover 규칙 자체는 살아 있다).
 */
test.describe('RadioGroup 선택 행 + hover (VG6-E2-04)', () => {
  test.use({ viewport: { width: 393, height: 1200 } });

  test('선택 행에 포인터를 올려도 배경 = 선택 색 · 미선택 행 hover 는 바뀐다', async ({ page }) => {
    await openGrowth(page);

    const option = (name: string) =>
      page.locator('.haru-radio-group__option', {
        has: page.getByRole('radio', { name, exact: false }),
      });
    const background = (name: string) =>
      option(name).evaluate((node) => window.getComputedStyle(node).backgroundColor);

    // 기대값 = 토큰 `--color-selected-bg` 의 실제 렌더 값 (리터럴을 테스트에 두지 않는다).
    const selectedBg = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--color-selected-bg)';
      document.body.append(probe);
      const value = window.getComputedStyle(probe).backgroundColor;
      probe.remove();
      return value;
    });

    await page.getByRole('radio', { name: 'Emotion Regulation' }).check();
    await page.mouse.move(0, 0);
    await expect.poll(() => background('Emotion Regulation')).toBe(selectedBg);
    await expect.poll(() => background('Intrinsic Motivation')).not.toBe(selectedBg);
    const unselectedRest = await background('Intrinsic Motivation');

    await option('Emotion Regulation').hover();
    // 배경 전환(--motion-duration-fast)이 끝난 뒤에도 선택 색이어야 한다 (수정 전: hover 색으로 끝났다).
    await page.waitForTimeout(400);
    expect(await background('Emotion Regulation')).toBe(selectedBg);

    await option('Intrinsic Motivation').hover();
    await expect.poll(() => background('Intrinsic Motivation')).not.toBe(unselectedRest);
  });
});

/**
 * 상태별 baseline — `main` 영역 클립 (Spec §14 "발전 역량 2모드 × default/changed/null/저장 실패" 중 온보딩 모드).
 * 설정 모드 baseline 은 route 가 생기는 `S6-D` 에서 만든다. 콘텐츠 전체가 들어가는 393×1200 으로 찍는다.
 */
test.describe('baseline — 393 폭 · 전체 콘텐츠 (`R-BASELINE-1`)', () => {
  test.use({ viewport: { width: 393, height: 1200 } });

  test('s6-growth-onboarding', async ({ page }) => {
    await openGrowth(page);
    await expect(page.locator('main')).toHaveScreenshot(
      's6-growth-onboarding.png',
      REGION_SNAPSHOT,
    );
  });

  test('s6-growth-onboarding-changed', async ({ page }) => {
    await openGrowth(page);
    await page.getByRole('radio', { name: 'Emotion Regulation' }).check();
    await settle(page);
    await expect(page.locator('main')).toHaveScreenshot(
      's6-growth-onboarding-changed.png',
      REGION_SNAPSHOT,
    );
  });

  test('s6-growth-onboarding-empty', async ({ page }) => {
    await openGrowth(page, 'children:all-scores-missing');
    await expect(page.locator('main')).toHaveScreenshot(
      's6-growth-onboarding-empty.png',
      REGION_SNAPSHOT,
    );
  });

  test('s6-growth-onboarding-save-failed', async ({ page }) => {
    await openGrowth(page, 'children.setgrowthcapability:error');
    await page.getByRole('button', { name: 'Start with this' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await settle(page);
    await expect(page.locator('main')).toHaveScreenshot(
      's6-growth-onboarding-save-failed.png',
      REGION_SNAPSHOT,
    );
  });
});
