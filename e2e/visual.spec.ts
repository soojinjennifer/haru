/**
 * 시각 비교 baseline — Design Spec §10.2 (V-1 … V-9) · Plan §12 · AC-1-24.
 *
 * V-1 … V-8 은 Figma node 와 대조하는 항목이고, V-9 는 Figma 가 없는 항목(공통 상태 · focus ·
 * 반응형)의 **회귀 기준**이다. 여기서 만드는 것은 "구현 스냅샷" 이며, Figma 와의 대조 판정은
 * QA 가 Figma screenshot 과 나란히 놓고 한다 (§10.3 허용 차이 AD-1 … AD-10 적용).
 *
 * 임계값은 결정 `D-12` 로 **2종으로 나뉜다** (stage-2-approvals §4).
 *   - 영역 클립(`REGION_SNAPSHOT`) `0.002 / 20` — Figma 대조 대상 · 컴포넌트 블록
 *   - 전체 프레임(`FRAME_SNAPSHOT`) `0.002 / 200` — 레이아웃 회귀 전용 (반응형 4폭)
 * 비율 0.002 는 `S1-D2-6` 확정값 그대로다.
 */
import { expect, test, type Page } from '@playwright/test';

import { FRAME_SNAPSHOT, REGION_SNAPSHOT } from '../playwright.config';
import { demo, GALLERY, gotoApp, gotoStable } from './support/gallery';
import { completeOnboardingToSaved } from './support/onboarding';

/** Design Spec §10.2 — Figma 대조 대상. */
const FIGMA_BACKED: readonly { id: string; figma: string; page: string }[] = [
  { id: 'v1-button', figma: '17:20', page: GALLERY.components },
  { id: 'v2-surface', figma: '17:332 / 16:24', page: GALLERY.components },
  { id: 'v2-material', figma: '17:332 / 16:24', page: GALLERY.tokens },
  { id: 'v3-tab-bar', figma: '25:87', page: GALLERY.components },
  { id: 'v4-tag-chip', figma: '76:440 / 90:626 / 40:316', page: GALLERY.components },
  { id: 'v5-field', figma: '76:417', page: GALLERY.components },
  { id: 'v6-bubble', figma: '88:721', page: GALLERY.components },
  { id: 'v7-progress', figma: '88:789 / 179:1779', page: GALLERY.components },
  { id: 'v8-color-semantic', figma: '17:366', page: GALLERY.tokens },
  { id: 'v8-typography', figma: '17:298', page: GALLERY.tokens },
];

/** Stage 2-UI 신규 6종 — Stage 2 Design Spec §11.2 (`s2-*`, dev gallery · 영역 클립). */
const STAGE2_COMPONENTS: readonly string[] = [
  's2-selecttrigger',
  's2-deck',
  's2-listrow',
  's2-inforow',
  's2-dividerlabel',
  's2-textlink',
];

/** Figma 가 없는 항목 — 회귀 기준만 (V-9). */
const SPEC_ONLY: readonly { id: string; page: string }[] = [
  { id: 'v9-text', page: GALLERY.components },
  { id: 'v9-icon', page: GALLERY.components },
  { id: 'v9-icon-button', page: GALLERY.components },
  { id: 'v9-top-bar', page: GALLERY.components },
  { id: 'v9-spinner-skeleton', page: GALLERY.components },
  { id: 'v9-state-cards', page: GALLERY.components },
  { id: 'v9-toast', page: GALLERY.components },
  { id: 'v9-state-loading', page: GALLERY.states },
  { id: 'v9-state-empty', page: GALLERY.states },
  { id: 'v9-state-error', page: GALLERY.states },
  { id: 'v9-state-offline', page: GALLERY.states },
  { id: 'v9-focus', page: GALLERY.a11y },
];

test.describe('Figma 대조 baseline (V-1 … V-8)', () => {
  for (const target of FIGMA_BACKED) {
    test(`${target.id} — Figma ${target.figma}`, async ({ page }) => {
      await gotoStable(page, target.page);
      await expect(demo(page, target.id)).toHaveScreenshot(`${target.id}.png`, REGION_SNAPSHOT);
    });
  }
});

test.describe('명세 기준 baseline (V-9, Figma 없음)', () => {
  for (const target of SPEC_ONLY) {
    test(target.id, async ({ page }) => {
      await gotoStable(page, target.page);
      await expect(demo(page, target.id)).toHaveScreenshot(`${target.id}.png`, REGION_SNAPSHOT);
    });
  }
});

test.describe('Stage 2 신규 컴포넌트 baseline (§11.2, 영역 클립)', () => {
  for (const id of STAGE2_COMPONENTS) {
    test(id, async ({ page }) => {
      await gotoStable(page, GALLERY.components);
      await expect(demo(page, id)).toHaveScreenshot(`${id}.png`, REGION_SNAPSHOT);
    });
  }
});

test.describe('반응형 baseline — 앱 컬럼 (AC-1-23)', () => {
  const VIEWPORTS = [
    { width: 320, height: 568 },
    { width: 393, height: 852 },
    { width: 600, height: 800 },
    { width: 1024, height: 768 },
  ] as const;

  for (const viewport of VIEWPORTS) {
    test(`frame ${viewport.width}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await gotoStable(page, GALLERY.frame);
      await expect(page).toHaveScreenshot(`frame-${viewport.width}.png`, {
        fullPage: false,
        ...FRAME_SNAPSHOT,
      });
    });
  }
});

/**
 * Stage 2-AUTH 화면 baseline — Stage 2 Design Spec §11.2.
 *
 * `s2-welcome` · `s2-login` 은 **전체 프레임**(레이아웃 회귀), `s2-signup` 은 Figma
 * `179:1724` 의 **보호자 영역만** 클립한다 — "YOUR CHILD" 섹션과 단일 체크박스를 렌더하지
 * 않는 것은 사전 등록된 허용 차이 `AD-S2-1` 이라, 프레임 전체로 비교하면 의미가 없다.
 */
test.describe('Stage 2 Auth 화면 baseline (§11.2)', () => {
  test('s2-welcome — Figma 179:1701 (전체 프레임)', async ({ page }) => {
    await gotoApp(page, '/auth/welcome');
    await expect(page).toHaveScreenshot('s2-welcome.png', { fullPage: false, ...FRAME_SNAPSHOT });
  });

  test('s2-login — Figma 179:1820 (전체 프레임)', async ({ page }) => {
    await gotoApp(page, '/auth/log-in');
    await expect(page).toHaveScreenshot('s2-login.png', { fullPage: false, ...FRAME_SNAPSHOT });
  });

  test('s2-signup — Figma 179:1724 보호자 영역만 (영역 클립)', async ({ page }) => {
    await gotoApp(page, '/auth/sign-up');
    await expect(page.locator('form')).toHaveScreenshot('s2-signup.png', REGION_SNAPSHOT);
  });
});

/**
 * Stage 2-CONSENT 화면 baseline — Stage 2 Design Spec §11.2.
 *
 * 두 화면 모두 **Figma 가 없는 명세 기준 화면**(`C13-02` · `C13-03`)이라 대조 대상이 아니라
 * **회귀 기준**이다. Guard 를 통과해야 열리므로 가입을 거쳐 진입한다.
 */
test.describe('Stage 2 동의 · VPC 화면 baseline (§11.2)', () => {
  async function signUp(page: Page, scenario: string): Promise<void> {
    await gotoApp(page, `/auth/sign-up?scenario=${scenario}`);
    await page.getByLabel('Your name').fill('Sam Rivera');
    await page.getByLabel('Email').fill('sam@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
    await page.getByRole('button', { name: 'Create account' }).click();
  }

  test('s2-consent — 동의 5항목 (전체 프레임)', async ({ page }) => {
    await signUp(page, 'me:consent-missing');
    await expect(page.getByRole('group', { name: 'Consent items' })).toBeVisible();

    await expect(page).toHaveScreenshot('s2-consent.png', { fullPage: false, ...FRAME_SNAPSHOT });
  });

  test('s2-vpc-failed — VPC 슬롯 실패 상태 (전체 프레임)', async ({ page }) => {
    await signUp(page, 'me:vpc-failed');
    await expect(page.getByText("We couldn't complete this step yet.")).toBeVisible();

    await expect(page).toHaveScreenshot('s2-vpc-failed.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });
});

/**
 * Stage 2-ONBOARDING 화면 baseline — `S2-HOME-2`.
 *
 * Figma `179:1748` · `179:1770` · `179:1809` 에는 자동 회귀 기준이 없어서 `QA-2-002`
 * (`/onboarding/saved` CTA 위치)가 e2e 를 그대로 통과했다. 세 화면을 **영역 클립**
 * (`REGION_SNAPSHOT` — D-12 `0.002 / 20`)으로 고정한다. 클립 대상은 `main` 이다 — Figma
 * 대조 항목이 화면 전체 세로 배치(= 이번 결함의 성격)이기 때문이다.
 *
 * Figma 와의 판정은 QA 가 허용 차이(`AD-S2-*`)를 적용해 하며, 여기서 만드는 것은 구현 스냅샷이다.
 */
test.describe('Stage 2 온보딩 화면 baseline (S2-HOME-2, 영역 클립)', () => {
  test('s2-onboarding-intro — Figma 179:1748', async ({ page }) => {
    await gotoApp(page, '/onboarding');
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot('s2-onboarding-intro.png', REGION_SNAPSHOT);
  });

  test('s2-onboarding-step5 — Figma 179:1770', async ({ page }) => {
    await gotoApp(page, '/onboarding/capability-items');
    await expect(page.getByRole('group', { name: 'Baseline questions' })).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot('s2-onboarding-step5.png', REGION_SNAPSHOT);
  });

  test('s2-onboarding-saved — Figma 179:1809', async ({ page }) => {
    await completeOnboardingToSaved(page);
    await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot('s2-onboarding-saved.png', REGION_SNAPSHOT);
  });
});

/**
 * Stage 2-HOME 헤더 baseline — Stage 2 Design Spec §11.2 (`s2-home-header`, 영역 클립).
 *
 * Figma `26:21` 의 헤더(`26:39` 워드마크 + `26:44` 설정)와 **대조**하는 항목이다. 본문은
 * Figma 가 없는 명세(`C13-13`)이고 Stage 3 에서 통째로 바뀌므로 프레임 전체를 찍지 않는다.
 */
test.describe('Stage 2 Home 헤더 baseline (§11.2)', () => {
  test('s2-home-header — Figma 26:21 헤더 영역 (영역 클립)', async ({ page }) => {
    await gotoApp(page, '/auth/log-in');
    await page.getByLabel('Email').fill('sam@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();

    await expect(page.getByRole('banner').getByText('HARU')).toBeVisible();
    await expect(page.getByRole('banner')).toHaveScreenshot('s2-home-header.png', REGION_SNAPSHOT);
  });
});
