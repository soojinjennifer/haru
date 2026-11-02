/**
 * 시각 비교 baseline — Design Spec §10.2 (V-1 … V-9) · Plan §12 · AC-1-24.
 *
 * V-1 … V-8 은 Figma node 와 대조하는 항목이고, V-9 는 Figma 가 없는 항목(공통 상태 · focus ·
 * 반응형)의 **회귀 기준**이다. 여기서 만드는 것은 "구현 스냅샷" 이며, Figma 와의 대조 판정은
 * QA 가 Figma screenshot 과 나란히 놓고 한다 (§10.3 허용 차이 AD-1 … AD-10 적용).
 *
 * 임계값은 결정 `D-12` 로 **2종으로 나뉜다** (stage-2-approvals §4).
 *   - 영역 클립(`REGION_SNAPSHOT`) `0.002 / 20` — Figma 대조 대상 · 컴포넌트 블록
 *   - 전체 프레임(`FRAME_SNAPSHOT`) `0.002 / 50` — 레이아웃 회귀 전용 (반응형 4폭)
 * 비율 0.002 는 `S1-D2-6` 확정값 그대로다.
 *
 * 2026-10-08: 두 종류 모두 **픽셀당 임계값 `0.02`** 를 쓴다. 전체 프레임이 Playwright 기본값
 * `0.2` 로 남아 있던 탓에 dev Scenario Panel 이 찍힌 `frame-1024` baseline 이 통과하고 있었다
 * (`playwright.config.ts` `VISUAL_THRESHOLD_FRAME` 주석에 실측 근거). 같은 날 전체 프레임의
 * 절대 픽셀 상한도 **200 → 50** 으로 조였다 — 픽셀당 임계값이 노이즈를 걸러주므로 개수 상한이
 * 그 역할을 겸할 필요가 없어졌다 (`VISUAL_MAX_DIFF_PIXELS` 주석).
 */
import { expect, test, type Page } from '@playwright/test';

import { FRAME_SNAPSHOT, REGION_SNAPSHOT } from '../playwright.config';
import { demo, GALLERY, gotoApp, gotoStable, hideDevPanel, settle } from './support/gallery';
import {
  completeOnboardingToSaved,
  DECK_LABEL,
  seedChildDraft,
  signUpAndConsent,
} from './support/onboarding';

/*
 * **이 파일의 모든 스냅샷에서 dev Scenario Panel 을 제외한다** (사용자 결정 2026-10-06).
 *
 * 패널은 dev 전용이라 Production 화면에 없다 — baseline 이 제품에 없는 UI 를 담고 있었다.
 * 영역 클립도 안전하지 않다: Playwright 의 element screenshot 은 그 요소의 bounding box 를
 * 찍으므로 **위에 떠 있는 `position: fixed` 패널이 함께 들어온다**. 그래서 선택자를 좁히는
 * 방식으로는 끝나지 않고, **찍을 때 가리는 것**이 올바른 해결이다 (`hideDevPanel` 주석).
 */
test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

/** Design Spec §10.2 — Figma 대조 대상. */
const FIGMA_BACKED: readonly { id: string; figma: string; page: string }[] = [
  { id: 'v1-button', figma: '17:20', page: GALLERY.components },
  { id: 'v2-surface', figma: '17:332 / 16:24', page: GALLERY.components },
  { id: 'v2-material', figma: '17:332 / 16:24', page: GALLERY.tokens },
  { id: 'v3-tab-bar', figma: '25:87', page: GALLERY.components },
  { id: 'v4-tag-chip', figma: '76:440 / 90:626 / 40:316', page: GALLERY.components },
  { id: 'v5-field', figma: '76:417', page: GALLERY.components },
  // 2026-10-05 Home 재대조 — Home 버블이 `88:922`→`261:1293`(= `50:176` Type2) 로 교체되면서
  // `SpeechBubble` 의 tail 기하·padding 이 `50:176` 기준이 되었다 (audit §10.3).
  { id: 'v6-bubble', figma: '50:176 (구 88:721)', page: GALLERY.components },
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
 * `s2-welcome` · `s2-login` 은 **전체 프레임**(레이아웃 회귀), `s2-signup` 은 `form` 을 클립한다.
 * `R-01` 로 `YOUR CHILD` 섹션이 **렌더되므로** 비교 대상은 `179:1724` **전체 프레임**이다
 * (`AD-S2R-07` — 기존 `AD-S2-1` "보호자 영역만" 은 무효). `form` 클립이 그 섹션을 포함한다.
 * Figma `179:1745` 의 한 줄 동의 체크는 법무 보류(`S2R-OPEN-7`)로 렌더하지 않는다.
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

  test('s2-signup — Figma 179:1724 전체 프레임 (AD-S2R-07, form 클립)', async ({ page }) => {
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

  /*
   * ⚠ 두 화면은 **가입 후 클라이언트 이동**으로 들어온다 — `gotoApp` 의 `settle` 을 거치지
   * 않는다. 그래서 `settle` 을 직접 불러야 한다. 안 부르면 **레이아웃이 끝나기 전 프레임**이
   * 찍힌다: `VpcStep` 의 CTA 는 `mt-auto` 로 열 바닥에 붙는데(최종 y=752), 셸이 아직 높이를
   * 받기 전에는 카드 바로 아래(y≈465)에 있다. 2026-10-06 에 저장돼 있던 `s2-vpc-failed`
   * baseline 이 바로 그 **과도기 프레임**이었고(실측: 세 번 독립 측정 모두 최종 y=752),
   * dev 패널 제외로 타이밍이 1프레임 밀리자 드러났다.
   */
  test('s2-consent — 동의 5항목 (전체 프레임)', async ({ page }) => {
    await signUp(page, 'me:consent-missing');
    await expect(page.getByRole('group', { name: 'Consent items' })).toBeVisible();
    await settle(page);

    await expect(page).toHaveScreenshot('s2-consent.png', { fullPage: false, ...FRAME_SNAPSHOT });
  });

  test('s2-vpc-failed — VPC 슬롯 실패 상태 (전체 프레임)', async ({ page }) => {
    await signUp(page, 'me:vpc-failed');
    await expect(page.getByText("We couldn't complete this step yet.")).toBeVisible();
    await settle(page);

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
  test('s2-onboarding-start — Figma 243:1147', async ({ page }) => {
    await gotoApp(page, '/onboarding/start');
    await expect(page.getByRole('button', { name: 'Start the questions' })).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot('s2-onboarding-start.png', REGION_SNAPSHOT);
  });

  test('s2-onboarding-intro — Figma 179:1748', async ({ page }) => {
    await gotoApp(page, '/onboarding');
    await expect(page.getByRole('button', { name: /^(Start|Pick up)/ })).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot('s2-onboarding-intro.png', REGION_SNAPSHOT);
  });

  /**
   * `248:1159` 는 **세 상태**를 갖는다. 세 baseline 이 서로 다른 화면을 찍어야 한다
   * (`QA-2R-003` — 이전에는 `-trial` 과 `-edit` 이 같은 상태를 두 번 찍어 바이트가 같았다).
   *
   * | baseline | 세션 | draft | 모드 | Trial 안내 |
   * |---|---|---|---|---|
   * | `-trial` | 미로그인 | **있음** | 표시 전용 | **있음** (`R-07` A) |
   * | (기본) | 인증+동의 | **있음** | 표시 전용 | **없음** (`R-07` B) |
   * | `-edit` | 미로그인 | 없음 | **편집** (`missing-prefill`) | 있음 |
   */

  /**
   * 나이 배지는 **실제 시계**로 계산된다(입력 파생, D-10) — `6yr 6mo` 가 달이 바뀌면 `6yr 7mo` 가 되어
   * baseline 이 11월에 깨졌다. 재생성은 다음 달에 또 깨지므로 **시계와 출생 연도를 함께 고정**한다
   * (`seedChildDraft` 기본값은 실제 연도 − 6 이라 해가 바뀌면 같은 일이 난다). 세 값이 baseline 의 `6yr 6mo` 다.
   */
  const AGE_BADGE_NOW = new Date('2026-10-15T12:00:00Z');
  const AGE_BADGE_BIRTH_YEAR = 2020;

  /** `R-07` A + `R-08` 표시 전용 — Trial 안내 **있음**. */
  test('s2-onboarding-childinfo-trial — Figma 248:1159 (display · 안내 있음)', async ({ page }) => {
    await page.clock.setFixedTime(AGE_BADGE_NOW);
    await seedChildDraft(page, 'Yuna', AGE_BADGE_BIRTH_YEAR);
    await gotoApp(page, '/onboarding/child-info');

    await expect(page.getByText('Your answers stay on this device')).toBeVisible();
    // 표시 전용 모드다 — 입력 필드가 없다 (`R-08`).
    await expect(page.getByRole('button', { name: /Yuna/ })).toBeVisible();
    await expect(page.getByLabel('First name')).toHaveCount(0);

    await expect(page.locator('main')).toHaveScreenshot(
      's2-onboarding-childinfo-trial.png',
      REGION_SNAPSHOT,
    );
  });

  /** `R-07` B — 가입 완료 후 도달. Trial 안내 블록과 gap 이 통째로 사라진다 (§4.4). */
  test('s2-onboarding-childinfo — Figma 248:1159 (display · 안내 없음)', async ({ page }) => {
    await page.clock.setFixedTime(AGE_BADGE_NOW);
    await seedChildDraft(page, 'Yuna', AGE_BADGE_BIRTH_YEAR);
    // 아이 정보 draft 가 있으므로 동의 직후 Guard 가 이 화면으로 되돌린다 (`§11.19` 7-2).
    await signUpAndConsent(page, ',onboarding:prefilled-child-info');

    await expect(page).toHaveURL(/\/onboarding\/child-info$/);
    await expect(page.getByRole('button', { name: /Yuna/ })).toBeVisible();
    await expect(page.getByText('Your answers stay on this device')).toHaveCount(0);

    await expect(page.locator('main')).toHaveScreenshot(
      's2-onboarding-childinfo.png',
      REGION_SNAPSHOT,
    );
  });

  /** `R-08` — `YOUR CHILD` 편집 모드. draft 값이 없으면 이 모드로 진입한다 (§4.5). */
  test('s2-onboarding-childinfo-edit — Figma 248:1159 (edit)', async ({ page }) => {
    await gotoApp(page, '/onboarding/child-info');
    await expect(page.getByLabel('First name')).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot(
      's2-onboarding-childinfo-edit.png',
      REGION_SNAPSHOT,
    );
  });

  test('s2-deck-reading-together — Figma 179:1770 (단일 선택)', async ({ page }) => {
    await gotoApp(page, '/onboarding/reading-together');
    await expect(page.getByRole('group', { name: DECK_LABEL })).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot(
      's2-deck-reading-together.png',
      REGION_SNAPSHOT,
    );
  });

  test('s2-deck-books-q3 — Figma 179:1770 (복수 선택 + 배타 분리행)', async ({ page }) => {
    await gotoApp(page, '/onboarding/books-and-interests');
    await expect(page.getByRole('group', { name: DECK_LABEL })).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot('s2-deck-books-q3.png', REGION_SNAPSHOT);
  });

  test('s2-deck-books-favorites — 검색 없음 (`§11.13`)', async ({ page }) => {
    await gotoApp(page, '/onboarding/books-and-interests');
    await expect(page.getByRole('group', { name: DECK_LABEL })).toBeVisible();
    await page.getByRole('button', { name: 'Next question' }).click();

    const input = page.getByRole('textbox', { name: 'Books your child loves' });
    for (const title of ['Moonbeam', 'The Blue Hat', 'Ollie and Me']) {
      await input.fill(title);
      await page.getByRole('button', { name: 'Add' }).click();
    }

    await expect(page.locator('main')).toHaveScreenshot(
      's2-deck-books-favorites.png',
      REGION_SNAPSHOT,
    );
  });

  test('s2-deck-growing-together — Figma 179:1770', async ({ page }) => {
    await gotoApp(page, '/onboarding/growing-together');
    await expect(page.getByRole('group', { name: DECK_LABEL })).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot(
      's2-deck-growing-together.png',
      REGION_SNAPSHOT,
    );
  });

  test('s2-deck-capability — Figma 179:1770 (`s2-onboarding-step5` 대체)', async ({ page }) => {
    await gotoApp(page, '/onboarding/capability-items');
    await expect(page.getByRole('group', { name: DECK_LABEL })).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot('s2-deck-capability.png', REGION_SNAPSHOT);
  });

  test('s2-onboarding-saved — Figma 179:1809', async ({ page }) => {
    await completeOnboardingToSaved(page);
    await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot('s2-onboarding-saved.png', REGION_SNAPSHOT);
  });
});

/**
 * Home baseline — **Figma 재대조 후 전면 재생성** (approvals §12, audit §11.12 · §16).
 *
 * ⚠ **기존 Home baseline 5장은 전부 무효다.** 덱이 `SwipeDeck` 스택 → 가로 scroll-snap 트랙으로,
 * ActionBar 가 `Pick a time` → `★ Save` 로, Prompt 가 접힘 3개 → 전부 노출로 바뀌었고
 * 캐릭터·버블·dots·탭바 간격이 모두 재실측값으로 교체되었다.
 *
 * | baseline | 대상 | Figma |
 * |---|---|---|
 * | `s2-home-header` | 헤더 영역 (워드마크 + 칩 + 설정) | `26:21` 상단 |
 * | `s3-home` | `/` 전체 프레임 (레이아웃 회귀) | `26:21` |
 * | `s3-home-deck` | 트랙 영역 — 카드 1 + peek 8 | `163:2649` |
 * | `s3-home-deck-back` | **카드 뒷면** (신규) | `86:482` |
 * | `s3-home-deck-scrolled` | 카드 2 스냅 상태 (좌우 peek) (신규) | `163:2648` |
 * | `s3-home-card-save-saved` | `Saved` 상태 ActionBar (신규) | `117:973` (saved 변형 없음 — `D-REQ-1a`) |
 * | `s3-tabbar-top` · `s3-tabbar-bottom` | 스크롤 상단/하단 2컷 + 하단 16px | `25:87` |
 *
 * 폐기: `s3-home-deck-prompts-expanded` (확장 트리거가 Figma 에 없다).
 */
async function logInToHome(page: Page, scenario?: string): Promise<void> {
  const query = scenario === undefined ? '' : `?scenario=${encodeURIComponent(scenario)}`;
  await gotoApp(page, `/auth/log-in${query}`);
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('banner').getByText('HARU')).toBeVisible();

  /*
    Home 은 **반투명 표면이 많다** — 탭바(glass)와 카드가 뒤 콘텐츠를 blur 로 비춘다. 그래서
    배경 캐릭터 PNG·책 표지가 디코드되기 전에 찍으면 픽셀이 달라진다 (`settle` 은 폰트만
    기다린다). 이미지까지 기다려야 baseline 이 결정적이다.
  */
  await page.waitForFunction(() =>
    [...document.images].every((image) => image.complete && image.naturalWidth > 0),
  );
  await settle(page);
}

test.describe('Home baseline (audit §11.12)', () => {
  test('s2-home-header — Figma 26:21 헤더 영역 (영역 클립)', async ({ page }) => {
    await logInToHome(page);

    await expect(page.getByRole('banner')).toHaveScreenshot('s2-home-header.png', REGION_SNAPSHOT);
  });

  test('s3-home — `/` 전체 프레임 (레이아웃 회귀)', async ({ page }) => {
    await logInToHome(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();
    await settle(page);

    await expect(page).toHaveScreenshot('s3-home.png', FRAME_SNAPSHOT);
  });

  test('s3-home-deck — 트랙(카드 1 + peek 8) + dots', async ({ page }) => {
    await logInToHome(page);
    const deck = page.locator('.haru-activity-deck');
    await expect(deck).toBeVisible();
    await settle(page);

    await expect(deck).toHaveScreenshot('s3-home-deck.png', REGION_SNAPSHOT);
  });

  test('s3-home-deck-back — 카드 뒷면 (Figma 86:482)', async ({ page }) => {
    await logInToHome(page);
    await page.getByRole('button', { name: 'Show prompts and coaching notes' }).first().click();
    await expect(page.locator('.haru-activity-card-flip').first()).toHaveAttribute(
      'data-face',
      'back',
    );
    await settle(page);

    await expect(page.locator('.haru-activity-deck')).toHaveScreenshot(
      's3-home-deck-back.png',
      REGION_SNAPSHOT,
    );
  });

  test('s3-home-deck-scrolled — 카드 2 스냅 (좌우 peek)', async ({ page }) => {
    await logInToHome(page);
    const track = page.locator('.haru-activity-track');
    await track.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[aria-live="polite"]')).toHaveText(/Option 2 of 3/);
    await settle(page);

    await expect(page.locator('.haru-activity-deck')).toHaveScreenshot(
      's3-home-deck-scrolled.png',
      REGION_SNAPSHOT,
    );
  });

  test('s3-home-card-save-saved — `Saved` 상태 ActionBar', async ({ page }) => {
    await logInToHome(page);
    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Saved', exact: true }).first()).toBeVisible();
    await settle(page);

    await expect(page.locator('.haru-activity-card__actions').first()).toHaveScreenshot(
      's3-home-card-save-saved.png',
      REGION_SNAPSHOT,
    );
  });

  /*
   * ⚠ **바(bar) 요소만 클립하면 2컷이 같아진다.** 유리 바 **뒤에 구분되는 콘텐츠가 없어서**
   * 스크롤 위치가 달라도 같은 그림이 나온다 (audit §20.8 이 md5 일치로 지적한 결함이며,
   * 393×852 → 393×600 으로 바꿔도 **바만 찍으면 그대로 같다**).
   *
   * 그래서 ① 실제로 스크롤되는 **393×600** 에서 ② **화면 하단 220px 를 통째로** 찍는다.
   * 그래야 "마지막 콘텐츠가 중앙 버튼에 가리지 않는가"(§2.1 sticky 규칙)가 그림에 들어오고
   * 상단/하단 2컷이 서로 다른 그림이 된다.
   */
  test('s3-tabbar — 스크롤 상단 · 하단 2컷 (393×600, 하단 220px 영역)', async ({ page }) => {
    const viewportSize = { width: 393, height: 600 };
    await page.setViewportSize(viewportSize);
    await logInToHome(page);

    const viewport = page.locator('[data-app-shell-viewport]');
    const range = await viewport.evaluate((node) => node.scrollHeight - node.clientHeight);
    // 2컷이 같은 그림이 되지 않는다는 전제를 테스트 안에서 고정한다.
    expect(range).toBeGreaterThan(0);

    const clip = {
      x: 0,
      y: viewportSize.height - 220,
      width: viewportSize.width,
      height: 220,
    } as const;

    await expect(viewport).toBeVisible();
    await settle(page);

    await expect(page).toHaveScreenshot('s3-tabbar-top.png', { ...REGION_SNAPSHOT, clip });

    await viewport.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await settle(page);

    await expect(page).toHaveScreenshot('s3-tabbar-bottom.png', { ...REGION_SNAPSHOT, clip });
  });
});

/**
 * 오프라인 캐시 Home baseline — **신규** (Stage 4a `S4-J` 후속, `D4-37` · `D4-38`, 2026-10-18).
 *
 * `offline-cached-card` 상태 = 캐시 카드 + TopBar 밑 **1줄** Offline Banner
 * (`Go online to start a session`). 배너 높이만큼 캐릭터가 54px 내려가는 것은 허용 차이
 * `AD-S4-11` 이다 — 이 baseline 은 그 상태의 **회귀 기준**이며 Figma 대조 대상이 아니다
 * (Figma 에 오프라인 배너가 없다).
 *
 * `R-BASELINE-1` 준수: ① 로그인 후 클라이언트 이동이므로 `logInToHome` 이 이미지 디코드 +
 * `settle()` 을 기다리고, 배너·트랙 표시 뒤 한 번 더 `settle()` 한다 ② dev Scenario Panel 은
 * 이 파일의 `beforeEach` 가 가린다. 393 · 320 두 폭 (§6.2 실측 폭).
 */
test.describe('오프라인 캐시 Home baseline (AC-4-82 — 신규)', () => {
  for (const width of [393, 320] as const) {
    test(`s4-home-offline-cached-${width} — 1줄 배너 + 캐시 카드 (전체 프레임)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 852 });
      await logInToHome(page, 'activity-cards:offline-cached-card');
      await expect(page.locator('.haru-app-shell__bar-top .haru-alert--banner')).toHaveText(
        'Go online to start a session',
      );
      await expect(
        page.locator('.haru-activity-track:not(.haru-activity-track--skeleton)'),
      ).toBeVisible();
      await settle(page);

      await expect(page).toHaveScreenshot(`s4-home-offline-cached-${width}.png`, {
        fullPage: false,
        ...FRAME_SNAPSHOT,
      });
    });
  }
});

/**
 * scrim 감시 baseline — **신규 추가** (`stage-3-approvals.md` §19.4 · §20.2 `L-NEW-09`).
 *
 * `--color-scrim` 이 Library `LT-12` 로 `#29293a3b`(남색 기운 23%) → `rgb(0 0 0 / 0.34)`
 * (Figma 실측 순검정 34%)로 바뀌었다. 그런데 이 저장소에는 **열린 Sheet / Dialog / Scrim 을
 * 담은 baseline 이 한 장도 없었다** — `visual.spec.ts` 에 `sheet`·`dialog`·`scrim` 문자열이
 * 0건이었고 `s2-selecttrigger` 는 **닫힌** 트리거 행만 찍는다. 즉 scrim 값이 깨져도 잡는
 * 테스트가 없었다. 그 공백을 여기에서 메운다.
 *
 * 찍는 자리는 **지금 실제로 scrim 을 렌더하는 지점**이다 (`--color-scrim` 참조점은
 * `Sheet.tsx` · `Dialog.tsx` 2곳뿐이고, 화면에서는 `SelectTrigger` 시트 7 인스턴스와
 * `SettingsMenu` `ConfirmDialog` 1 = 8 인스턴스가 전부다).
 *
 * `R-BASELINE-1` 준수
 *   ① 스냅샷 전에 **`settle()`** 을 부른다 — 시트·다이얼로그는 `translateY`/fade 모션이 있어
 *      정착 전 프레임을 담으면 `s2-vpc-failed` 와 같은 사고가 난다. 두 화면 모두
 *      **클라이언트 이동**(가입 후 / 로그인 후)으로 들어오므로 `gotoApp` 의 settle 을 거치지
 *      않는 경로다.
 *   ② dev Scenario Panel 은 이 파일의 `beforeEach` 가 가린다 (`hideDevPanel`).
 *   전체 프레임이므로 `FRAME_SNAPSHOT` 을 쓴다 — scrim 은 뷰포트 전체를 덮는 레이어이고
 *   영역 클립으로는 "뒤 배경이 얼마나 어두워졌는가" 가 그림에 들어오지 않는다.
 */
test.describe('scrim baseline (L-NEW-09 감시 — 신규)', () => {
  test('s3-sheet-scrim — SelectTrigger 시트가 열린 상태 (전체 프레임)', async ({ page }) => {
    await gotoApp(page, '/auth/sign-up');

    // `SelectTrigger` 는 Sheet 안 RadioGroup 으로 값을 고른다 (Stage 2 §4.1).
    await page.getByRole('button', { name: /Birth year/ }).click();

    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('radio').first()).toBeVisible();
    // 시트 진입 모션(translateY 100% → 0)이 끝난 뒤에 찍는다 (`R-BASELINE-1` ①).
    await settle(page);

    await expect(page).toHaveScreenshot('s3-sheet-scrim.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });

  test('s3-dialog-scrim — 로그아웃 ConfirmDialog 가 열린 상태 (전체 프레임)', async ({ page }) => {
    await logInToHome(page);

    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/settings$/);

    await page.getByRole('button', { name: 'Log out', exact: true }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    // destructive 라 초기 포커스가 Cancel 이다 — 포커스가 정해진 뒤에 찍는다.
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await settle(page);

    await expect(page).toHaveScreenshot('s3-dialog-scrim.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });
});

/**
 * Library 1라운드 Shared UI baseline — dev gallery 영역 클립 (`D-12` `0.002 / 20`).
 *
 * 서재 **화면**은 2라운드다. 여기서 고정하는 것은 **토대 컴포넌트의 구현 스냅샷**이며
 * Figma 와의 판정은 화면이 생긴 뒤 QA 가 한다.
 */
test.describe('Library 1라운드 컴포넌트 baseline (영역 클립)', () => {
  for (const id of ['s3-section-header', 's3-book-cover', 's3-list-media'] as const) {
    test(id, async ({ page }) => {
      await gotoStable(page, GALLERY.components);
      await expect(demo(page, id)).toHaveScreenshot(`${id}.png`, REGION_SNAPSHOT);
    });
  }
});

/**
 * Library 2라운드 — `/library` **본 화면** baseline.
 *
 * | baseline | 대상 | Figma |
 * |---|---|---|
 * | `s3-library` | `/library` 전체 프레임 (레이아웃 회귀) | `30:74` + `145:1141` 합성 |
 * | `s3-library-reading-now` | `ReadingNowCard` 영역 | `145:1145` |
 * | `s3-library-shelf` | 큐레이션 캐러셀 블록 (표지 3 + dots) | `113:1992` |
 * | `s3-library-list` | `Finished together` 4행 | `30:140` |
 * | `s3-library-favorites-empty` | ⭐ **저장 전 기본 상태** (가장 흔한 실제 화면) | Figma 없음 — §7.4 |
 * | `s3-library-empty` | 3섹션 안내 동시 노출 + `Reading now` 블록 제거 | Figma 없음 — §7.4 |
 *
 * `R-BASELINE-1`: ① `settle()` 로 레이아웃 정착을 보장하고(표지 이미지 디코드까지 기다린다)
 * ② dev Scenario Panel 은 이 파일의 `beforeEach` 가 가린다. 새 baseline 은 저장 후 **눈으로
 * 확인**했다.
 */
async function logInToLibrary(page: Page, scenario?: string): Promise<void> {
  /*
    scenario 는 **로그인 화면에서** 심는다 — `?scenario=` 는 sessionStorage 에 남으므로
    이후 SPA 이동에도 유지된다. Library 로 **새로 `goto` 하지 않는 이유**는 그 경로가
    인증 상태를 잃고 Route Guard 에 걸리기 때문이다 (탭 이동이 실제 사용자 경로이기도 하다).
  */
  await gotoApp(
    page,
    scenario === undefined ? '/auth/log-in' : `/auth/log-in?scenario=${scenario}`,
  );
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.locator('.haru-activity-track')).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Library' })
    .click();

  const shelves = page.locator('.haru-library-shelves');
  await expect(shelves).toBeVisible();
  await expect(shelves).not.toHaveAttribute('aria-busy', 'true');

  // 표지 PNG 가 디코드되기 전에 찍으면 픽셀이 달라진다 (Home baseline 과 같은 이유).
  await page.waitForFunction(() =>
    [...document.images].every((image) => image.complete && image.naturalWidth > 0),
  );
  await settle(page);
}

test.describe('Library 2라운드 화면 baseline', () => {
  test('s3-library — `/library` 전체 프레임 (레이아웃 회귀)', async ({ page }) => {
    await logInToLibrary(page);

    await expect(page).toHaveScreenshot('s3-library.png', FRAME_SNAPSHOT);
  });

  test('s3-library-reading-now — Figma 145:1145', async ({ page }) => {
    await logInToLibrary(page);

    await expect(page.locator('.haru-reading-now')).toHaveScreenshot(
      's3-library-reading-now.png',
      REGION_SNAPSHOT,
    );
  });

  test('s3-library-shelf — Figma 113:1992 (표지 3 + dots)', async ({ page }) => {
    await logInToLibrary(page);

    await expect(page.locator('.haru-shelf-carousel').first()).toHaveScreenshot(
      's3-library-shelf.png',
      REGION_SNAPSHOT,
    );
  });

  test('s3-library-list — Figma 30:140 (`Finished together` 4행)', async ({ page }) => {
    await logInToLibrary(page);

    /*
      `R-BASELINE-1` ② — Playwright 의 element screenshot 은 **요소 bounding box** 를 찍으므로
      그 위에 떠 있는 `sticky` 탭바가 함께 들어온다. 실제로 첫 생성본에 탭바와 중앙 버튼이
      목록 3·4행 위에 찍혀 있었다. **끝까지 스크롤하면** 탭바 위로 완전히 올라온다.

      ⚠️ 2라운드-2 에서 목록은 더 이상 마지막 블록이 아니다 — 아래에 `LibraryEntryActions`
      (`ListGroup` 2행)가 생겼다. 그래서 `.haru-list-group` 이 **2개**가 되었고 선택자를
      `.haru-library-shelves` 안으로 좁혔다 (Figma `30:140` 대조 대상은 서재 목록 하나다).
    */
    await page.evaluate(() => {
      // 스크롤 컨테이너는 **앱 컬럼 바깥의 AppShell 뷰포트**다 (`document.scrollingElement` 가 아니다).
      for (
        let node =
          document.querySelector('.haru-library-shelves .haru-list-group')?.parentElement ?? null;
        node !== null;
        node = node.parentElement
      ) {
        if (node.scrollHeight > node.clientHeight) {
          node.scrollTop = node.scrollHeight;
          return;
        }
      }
      throw new Error('스크롤 컨테이너를 찾지 못했다');
    });
    await settle(page);

    const list = page.locator('.haru-library-shelves .haru-list-group');
    const overlap = await list.evaluate((node) => {
      const bar = document.querySelector('.haru-app-shell__bar-bottom');
      if (bar === null) return 0;
      return node.getBoundingClientRect().bottom - bar.getBoundingClientRect().top;
    });
    expect(overlap, '목록이 탭바에 가려진 채로 baseline 에 들어갔다').toBeLessThanOrEqual(0);

    await expect(list).toHaveScreenshot('s3-library-list.png', REGION_SNAPSHOT);
  });

  test('s3-library-favorites-empty — 저장 전 기본 상태 (§7.4)', async ({ page }) => {
    await logInToLibrary(page, 'library:favorites-empty');

    await expect(page).toHaveScreenshot('s3-library-favorites-empty.png', FRAME_SNAPSHOT);
  });

  test('s3-library-empty — 3섹션 안내 동시 노출 (§7.4)', async ({ page }) => {
    await logInToLibrary(page, 'library:empty');

    await expect(page).toHaveScreenshot('s3-library-empty.png', FRAME_SNAPSHOT);
  });
});

/**
 * Library 2라운드-2 — **시트 2종 · 진입점 · 하위 화면 2종** baseline.
 *
 * | baseline | 대상 | Figma |
 * |---|---|---|
 * | `s3-library-shelf-sheet` | `LibraryShelfSheet` 떠 있는 카드 | `163:1898` `type=shelf` · `163:2347` |
 * | `s3-library-book-sheet` | `BookDetailSheet` 떠 있는 카드 (**앞면**) | `145:1085` |
 * | `s3-library-book-sheet-back` | 같은 시트의 **뒷면**(코칭 노트) | `86:482` 구성 |
 * | `s3-library-entry-actions` | 진입점 `ListGroup` 2행 | 없음 — §7.1 (`C-13` ②) |
 * | `s3-library-add` | `/library/add` 전체 프레임 | 없음 — §7.2 |
 * | `s3-library-gift-requests` | `/library/gift-requests` 전체 프레임 | 없음 — §7.3 |
 *
 * `R-BASELINE-1`: ① `settle()` 로 정착 보장(표지 디코드 포함) ② dev 패널은 `beforeEach` 가
 * 가린다 ③ 신규 baseline 은 저장 후 **눈으로 확인**했다.
 *
 * 시트는 **요소 클립**이다 — scrim 전체를 담으면 뒤 화면의 스크롤 위치까지 기준이 되어 시트와
 * 무관한 변화에 깨진다. scrim 자체는 `s3-sheet-scrim` 이 이미 고정한다.
 */
test.describe('Library 2라운드-2 시트 · 진입점 baseline', () => {
  test('s3-library-shelf-sheet — Figma 163:1898 (`type=shelf`)', async ({ page }) => {
    await logInToLibrary(page);

    await page.getByRole('button', { name: 'See all Our curated shelf' }).click();
    const sheet = page.locator('.haru-sheet--inset-card');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('.haru-list-row').first()).toBeVisible();
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete && image.naturalWidth > 0),
    );
    await settle(page);

    await expect(sheet).toHaveScreenshot('s3-library-shelf-sheet.png', REGION_SNAPSHOT);
  });

  /*
   * ⚠️ 2라운드-5(사용자 결정 2026-10-09 ①)에서 **이 baseline 1종만** 재생성했다 — 시트 표지에
   * `--shadow-cover` + radius 10 이 생겼다 (`library.css` 가 시트 범위에만 덮는다).
   * 변화를 픽셀 클러스터로 분해해 **전부 설명한 뒤** 재생성했다 (실측, 365×554 클립):
   *   변화 픽셀 **4322개 · 연결 성분 1개**, bounding box x 4…89 · y 60…170
   *   = 표지 상자(x 18…75 · y 68…150) ⊕ 번짐 **위 8 · 아래 20 · 좌우 14** 와 **정확히 일치**
   *   ├ 표지 **밖** 4190개 = 새로 그려진 drop shadow (상 442 · 하 1138 · 좌 1123 · 우 1123 ·
   *   │  모서리 364). 네 방향 실측 번짐과 같다
   *   ├ 표지 **안** 132개 = radius 8 → 10 (img) · 상자 radius 신설. **전부 모서리 11px 안**이다
   *   └ 표지 안에서 모서리 11px 밖 = **0개** → 표지 이미지가 움직이지도 재샘플되지도 않았다
   * 설명되지 않는 변화는 **없다**. Home·목록·캐러셀 baseline 은 **1종도 변하지 않았다**
   * (`BookCover` 기본값을 건드리지 않았다 — 전체 `test:e2e` 에서 다른 baseline 전부 통과).
   */
  test('s3-library-book-sheet — Figma 145:1085', async ({ page }) => {
    await logInToLibrary(page);

    await page.locator('.haru-shelf-item--pressable').first().click();
    const sheet = page.locator('.haru-sheet--inset-card');
    await expect(sheet).toBeVisible();
    // Prompt 가 도착하기 **전에** 찍으면 Skeleton 이 기준이 된다 (`R-BASELINE-1` ①).
    await expect(sheet.locator('.haru-prompt-pill').first()).toBeVisible();
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete && image.naturalWidth > 0),
    );
    await settle(page);

    await expect(sheet).toHaveScreenshot('s3-library-book-sheet.png', REGION_SNAPSHOT);
  });

  /*
   * 뒷면 — 사용자 결정 2026-10-09 (`L-R2B-02` → 2라운드-4 ① · ②). `s3-library-book-sheet` 는
   * **앞면** 기준이라 이 상태를 보지 못한다.
   *
   * 2라운드-4 에서 이 기준이 바뀐 것 2가지 — 둘 다 Figma `86:482` 를 따른 것이다.
   *   ① **면 전체가 초록**(`color/spring green/86`). 2라운드-3 은 흰 면(반투명)이었다
   *   ② **ActionBar 가 없다.** 그래서 시트가 57(ActionBar 45 + gap 12) 짧아져 이미지 높이도
   *      그만큼 줄어든다 (실측 554 → 497).
   *
   * 기준 프레임: 뒤집은 **직후**(목록 최상단). 스크롤 위치를 기준에 넣지 않는다 — 스크롤한
   * 상태를 찍으면 항목 높이가 1px 만 달라져도 전체가 밀린다. 끝까지 내린 상태의 그림자 자리는
   * `shadow.spec.ts` 의 프로브가 **픽셀로** 고정한다.
   */
  test('s3-library-book-sheet-back — 코칭 노트 뒷면 (Figma `86:482` 구성)', async ({ page }) => {
    await logInToLibrary(page);

    await page.locator('.haru-shelf-item--pressable').first().click();
    const sheet = page.locator('.haru-sheet--inset-card');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('.haru-prompt-pill').first()).toBeVisible();
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete && image.naturalWidth > 0),
    );

    await page.getByRole('button', { name: 'Show prompts and coaching notes' }).click();
    await expect(sheet.locator('.haru-book-sheet__flip')).toHaveAttribute('data-face', 'back');
    await settle(page);

    await expect(sheet).toHaveScreenshot('s3-library-book-sheet-back.png', REGION_SNAPSHOT);
  });

  test('s3-library-entry-actions — 진입점 2행 (§7.1, Figma 없음)', async ({ page }) => {
    await logInToLibrary(page);

    const entry = page.getByRole('list', { name: 'Library actions' });
    await expect(entry).toBeVisible();
    /*
      `R-BASELINE-1` ② — 요소 bounding box 를 찍으므로 위에 떠 있는 sticky 탭바가 함께
      들어올 수 있다. 진입점은 **마지막 블록**이라 끝까지 스크롤하면 탭바 위로 올라온다.
    */
    await page.evaluate(() => {
      for (
        let node = document.querySelector('.haru-library-shelves')?.parentElement ?? null;
        node !== null;
        node = node.parentElement
      ) {
        if (node.scrollHeight > node.clientHeight) {
          node.scrollTop = node.scrollHeight;
          return;
        }
      }
      throw new Error('스크롤 컨테이너를 찾지 못했다');
    });
    await settle(page);

    const overlap = await entry.evaluate((node) => {
      const bar = document.querySelector('.haru-app-shell__bar-bottom');
      if (bar === null) return 0;
      return node.getBoundingClientRect().bottom - bar.getBoundingClientRect().top;
    });
    expect(overlap, '진입점이 탭바에 가려진 채로 baseline 에 들어갔다').toBeLessThanOrEqual(0);

    await expect(entry).toHaveScreenshot('s3-library-entry-actions.png', REGION_SNAPSHOT);
  });

  test('s3-library-add — `/library/add` (§7.2, Figma 없음)', async ({ page }) => {
    await logInToLibrary(page);

    await page.getByRole('button', { name: 'Add a book you own' }).click();
    await expect(page.getByRole('textbox', { name: 'Title' })).toBeVisible();
    await settle(page);

    await expect(page).toHaveScreenshot('s3-library-add.png', FRAME_SNAPSHOT);
  });

  test('s3-library-gift-requests — `/library/gift-requests` (§7.3, Figma 없음)', async ({
    page,
  }) => {
    await logInToLibrary(page);

    await page.getByRole('button', { name: 'Gift requests' }).click();
    await expect(page.getByRole('list', { name: 'Gift requests' })).toBeVisible();
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete && image.naturalWidth > 0),
    );
    await settle(page);

    await expect(page).toHaveScreenshot('s3-library-gift-requests.png', FRAME_SNAPSHOT);
  });
});
