/**
 * Stage 6 `S6-E1` — 프로필 결과 2모드 `/onboarding/profile` · `/settings/profile`
 * (Figma 없음 — `C13-09` design-agent 명세 Spec §2.1 · §2.2 · §3.1 · §3.4 · §9.5 · §11,
 * AC-6-34 · 37 · 38 · 47 · 53(saved → profile) · 55 · 56 · 57 · 58 · 60 · 63 · 66).
 *
 * 로그인 후 SPA 이동으로 연다 (새로고침은 Mock 인증을 지운다 — `session-feedback.spec.ts` 와 같다).
 * `R-BASELINE-1`: dev 패널은 가린다 · settle 후 촬영 · 임계값은 `playwright.config.ts` 상수.
 * Loading 은 Mock 지연이 1.5 s 라 baseline 을 만들지 않는다(과도기 프레임 위험) — DOM 으로만 본다.
 */
import { expect, test, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';
import { hideDevPanel, settle } from './support/gallery';
import { completeOnboardingToSaved } from './support/onboarding';
import { logInToHome } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const ONBOARDING = '/onboarding/profile';
const REVISIT = '/settings/profile';
const READY = '.haru-profile-view [data-state="ready"]';

async function spaGoto(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function openProfile(page: Page, path: string, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await spaGoto(page, path);
  await expect(page.locator(READY)).toBeVisible();
  await settle(page);
}

async function box(page: Page, selector: string) {
  const found = await page.locator(selector).first().boundingBox();
  if (found === null) throw new Error(`no box for ${selector}`);
  return found;
}

/** Spec §11.1 — 컬럼별 다이아몬드 대각선 2h (h = min(100, (W − 140) / 2), W = 컬럼 − 80). */
const WIDTHS = [
  { viewport: { width: 320, height: 568 }, diamond: 100 },
  { viewport: { width: 393, height: 852 }, diamond: 173 },
  { viewport: { width: 600, height: 800 }, diamond: 200 },
  { viewport: { width: 1024, height: 768 }, diamond: 200 },
] as const;

for (const { viewport, diamond } of WIDTHS) {
  test.describe(`${String(viewport.width)}×${String(viewport.height)} — 차트 기하 · 넘침 (Spec §11 · AC-6-66)`, () => {
    test.use({ viewport });

    test(`다이아몬드 ${String(diamond)} · 가로 넘침 0 · 라벨 ↔ 플롯 겹침 0 · CTA 스크롤 도달`, async ({
      page,
    }) => {
      await openProfile(page, ONBOARDING);

      const plot = await box(page, '.haru-diamond__plot');
      expect(plot.width).toBeCloseTo(diamond, 0);
      expect(plot.height).toBeCloseTo(diamond, 0);

      // 가로 넘침 0 — 문서·앱 셸 모두
      const overflow = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      expect(overflow.doc).toBe(0);

      // 좌우 라벨은 플롯 밖 · 폭 ≤ 64 · 카드 안
      const card = await box(page, '.haru-profile-view section');
      const left = await box(page, '.haru-diamond__label--left');
      const right = await box(page, '.haru-diamond__label--right');
      expect(left.x + left.width).toBeLessThanOrEqual(plot.x - 6 + 0.5);
      expect(right.x).toBeGreaterThanOrEqual(plot.x + plot.width + 6 - 0.5);
      expect(left.width).toBeLessThanOrEqual(64);
      expect(right.width).toBeLessThanOrEqual(64);
      expect(left.x).toBeGreaterThanOrEqual(card.x);
      expect(right.x + right.width).toBeLessThanOrEqual(card.x + card.width);

      // CTA — 콘텐츠 끝, 스크롤로 도달 (sticky 아님)
      const next = page.getByRole('button', { name: 'Next' });
      await next.scrollIntoViewIfNeeded();
      await expect(next).toBeInViewport();
    });
  });
}

test.describe('320×568 — 미관찰 축 라벨 (`T6-2` 실측 · Spec §3.1)', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('변형 C — 좌우 라벨 ≤ 64 · 캡션 한 줄 · 라벨 ↔ 플롯 겹침 0', async ({ page }) => {
    await openProfile(page, ONBOARDING, 'children:all-scores-missing');
    const plot = await box(page, '.haru-diamond__plot');
    const measured = await page.evaluate(() =>
      ['left', 'right'].map((side) => {
        const label = document.querySelector(`.haru-diamond__label--${side}`) as HTMLElement;
        const caption = label.querySelector('.haru-text--caption-2') as HTMLElement;
        return {
          width: label.getBoundingClientRect().width,
          right: label.getBoundingClientRect().right,
          left: label.getBoundingClientRect().left,
          captionLines: Math.round(
            caption.getBoundingClientRect().height /
              parseFloat(getComputedStyle(caption).lineHeight),
          ),
        };
      }),
    );
    const [left, right] = measured;
    expect(left?.width).toBeLessThanOrEqual(64);
    expect(right?.width).toBeLessThanOrEqual(64);
    expect(left?.captionLines).toBe(1);
    expect(right?.captionLines).toBe(1);
    expect(left?.right ?? 0).toBeLessThanOrEqual(plot.x);
    expect(right?.left ?? 0).toBeGreaterThanOrEqual(plot.x + plot.width);
  });
});

test.describe('393×852 — 카드 recipe · 모션 · 그림자 자리', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('카드 = `--shadow-bubble` · radius 22 · padding 16 (Spec §3.4 `163:2607`)', async ({
    page,
  }) => {
    await openProfile(page, ONBOARDING);
    const style = await page.evaluate(() => {
      const card = document.querySelector('.haru-profile-view section') as HTMLElement;
      const probe = document.createElement('div');
      probe.style.boxShadow = 'var(--shadow-bubble)';
      document.body.append(probe);
      const expected = getComputedStyle(probe).boxShadow;
      probe.remove();
      const computed = getComputedStyle(card);
      return {
        shadow: computed.boxShadow,
        expected,
        radius: computed.borderTopLeftRadius,
        padding: computed.paddingTop,
      };
    });
    expect(style.shadow).toBe(style.expected);
    expect(style.radius).toBe('22px');
    expect(style.padding).toBe('16px');
  });

  test('`R-SHADOW-1` — 카드 좌우 ≥ 4 · 카드 사이·CTA 위 ≥ 10 (번짐 4 / 0 / 10, 새 overflow 0)', async ({
    page,
  }) => {
    await openProfile(page, ONBOARDING);
    const cards = await page
      .locator('.haru-profile-view section')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().toJSON() as DOMRect),
      );
    const viewport = page.viewportSize();
    if (viewport === null) throw new Error('no viewport');
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(card.x).toBeGreaterThanOrEqual(4);
      expect(viewport.width - (card.x + card.width)).toBeGreaterThanOrEqual(4);
    }
    for (let index = 1; index < cards.length; index += 1) {
      const above = cards[index - 1] as DOMRect;
      expect((cards[index] as DOMRect).y - (above.y + above.height)).toBeGreaterThanOrEqual(10);
    }
    const cta = await box(page, '.haru-profile-view button.haru-button');
    const last = cards[cards.length - 1] as DOMRect;
    expect(cta.y - (last.y + last.height)).toBeGreaterThanOrEqual(10);
    // 이 화면이 새로 만든 overflow 박스 0 — 카드 조상 중 가로를 자르는 요소는 **앱 셸 뷰포트**뿐이고
    // 그 폭은 뷰포트 폭이다(컬럼 바깥 — `shadow.spec.ts` ① 과 같은 판정).
    const clippers = await page.evaluate(() => {
      const card = document.querySelector('.haru-profile-view section');
      const found: { width: number; insideView: boolean }[] = [];
      for (let node = card?.parentElement ?? null; node !== null; node = node.parentElement) {
        if (getComputedStyle(node).overflowX === 'visible') continue;
        found.push({
          width: node.getBoundingClientRect().width,
          insideView: node.closest('.haru-profile-view') !== null,
        });
      }
      return found;
    });
    expect(clippers.filter((clipper) => clipper.insideView)).toEqual([]);
    for (const clipper of clippers) expect(clipper.width).toBeGreaterThanOrEqual(viewport.width);
  });

  test('reduced motion = 즉시 최종 상태 · 기본 = 첫 표시 모션 (Spec §3.1)', async ({ page }) => {
    await openProfile(page, ONBOARDING);
    expect(
      await page
        .locator('.haru-diamond__data')
        .evaluate((node) => getComputedStyle(node).animationName),
    ).toBe('none');

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    expect(
      await page
        .locator('.haru-diamond__data')
        .evaluate((node) => getComputedStyle(node).animationName),
    ).toBe('haru-diamond-enter');
  });

  test('페르소나 설명 말줄임 0 · 이름 h2 (AC-6-66)', async ({ page }) => {
    await openProfile(page, ONBOARDING, 'children:persona-changed');
    const clipped = await page.evaluate(() => {
      const heading = [...document.querySelectorAll('.haru-profile-view h2')].at(-1);
      const description = heading?.parentElement?.querySelector('p:last-of-type') as HTMLElement;
      const style = getComputedStyle(description);
      return {
        overflow: description.scrollHeight - description.clientHeight,
        ellipsis: style.textOverflow,
        clamp: style.webkitLineClamp,
        length: description.textContent?.length ?? 0,
      };
    });
    expect(clipped.overflow).toBe(0);
    expect(clipped.ellipsis).not.toBe('ellipsis');
    expect(clipped.clamp).toBe('none');
    expect(clipped.length).toBeGreaterThanOrEqual(110);
  });
});

test.describe('흐름 · 상태 (AC-6-53 · 55)', () => {
  test('`/onboarding/saved` Get started → `/onboarding/profile` (replace — 뒤로 가도 saved 로 안 간다)', async ({
    page,
  }) => {
    await completeOnboardingToSaved(page);
    await page.getByRole('button', { name: 'Get started' }).click();
    await expect(page).toHaveURL(/\/onboarding\/profile$/);
    await expect(page.locator(READY)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      "Here's where we're starting with Yuna",
    );
  });

  test('Loading → Skeleton (aria-busy) → 화면', async ({ page }) => {
    await logInToHome(page, 'children:loading');
    await spaGoto(page, ONBOARDING);
    await expect(page.getByRole('status', { name: 'Loading' })).toBeVisible();
    await expect(page.locator(READY)).toBeVisible({ timeout: 5_000 });
  });

  test('조회 실패 (온보딩) → Continue to Home → Home', async ({ page }) => {
    await logInToHome(page, 'children:error');
    await spaGoto(page, ONBOARDING);
    await page.getByRole('button', { name: 'Continue to Home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

/**
 * 상태별 baseline — `main` 영역 클립 (Spec §14 "프로필 2모드 × 변형 A/B/C/fallback/updated").
 * Visual Gap 은 design-agent 가 이 이미지를 Spec 과 대조한다 (Figma 프레임 없음 — `R6-01`).
 */
const BASELINES = [
  { id: 's6-profile-onboarding', path: ONBOARDING, scenario: undefined },
  {
    id: 's6-profile-onboarding-partial',
    path: ONBOARDING,
    scenario: 'children:scores-partially-missing',
  },
  { id: 's6-profile-onboarding-empty', path: ONBOARDING, scenario: 'children:all-scores-missing' },
  { id: 's6-profile-onboarding-fallback', path: ONBOARDING, scenario: 'children:persona-fallback' },
  { id: 's6-profile-revisit', path: REVISIT, scenario: undefined },
  { id: 's6-profile-revisit-updated', path: REVISIT, scenario: 'children:persona-changed' },
] as const;

/*
 * 콘텐츠가 852 보다 길어(Spec §11.2 ≈ 860~910) `main` 클립이 앱 셸 스크롤 뷰포트에 잘린다 — CTA 가 반쯤 찍혔다.
 * baseline 은 **전체 콘텐츠가 한 화면에 들어가는 높이**(393×1200)로 찍는다. 폭 기하는 393 그대로다.
 */
test.describe('baseline — 393 폭 · 전체 콘텐츠 (`R-BASELINE-1`)', () => {
  test.use({ viewport: { width: 393, height: 1200 } });

  for (const target of BASELINES) {
    test(target.id, async ({ page }) => {
      await openProfile(page, target.path, target.scenario);
      await expect(page.locator('main')).toHaveScreenshot(`${target.id}.png`, REGION_SNAPSHOT);
    });
  }

  test('s6-profile-error', async ({ page }) => {
    await logInToHome(page, 'children:error');
    await spaGoto(page, ONBOARDING);
    await expect(page.getByRole('button', { name: 'Continue to Home' })).toBeVisible();
    await settle(page);
    await expect(page.locator('main')).toHaveScreenshot('s6-profile-error.png', REGION_SNAPSHOT);
  });

  test('s6-profile-onboarding-320', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1400 });
    await openProfile(page, ONBOARDING);
    await expect(page.locator('main')).toHaveScreenshot(
      's6-profile-onboarding-320.png',
      REGION_SNAPSHOT,
    );
  });
});
