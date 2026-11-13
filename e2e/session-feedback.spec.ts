/**
 * Stage 5 `S5-C` — 피드백 · 분석 상태 화면 `/session/:sessionId/feedback` (Figma 없음 — `C13-S5-1`, Spec §2.3 · §11,
 * AC-5-34~43 · 45 · 46).
 *
 * deep link 전용(`N5-10` ⓐ) — 앱 안 진입점이 없으므로 로그인 후 SPA 이동으로 직접 연다 (새로고침은 Mock 인증을 지운다).
 * 골격은 완료 화면(`29:62` 상단)과 같다 — 제목·메달리온 좌표를 **같은 세션의 완료 화면과 대조**한다 (Spec §11).
 * `R-BASELINE-1`: dev 패널은 가린다 · settle 후 촬영 · 상태별 전체 프레임 baseline 11장.
 */
import { expect, test, type Page } from '@playwright/test';

import { FRAME_SNAPSHOT } from '../playwright.config';
import { hideDevPanel } from './support/gallery';
import { logInToHome, requestOperations, settleImages } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

/** Mock 지난 세션 `analyzing` (`H5-1.4`). */
const SESSION = '77777777-7777-4777-8777-000000000002';
const FEEDBACK = `/session/${SESSION}/feedback`;
const SLOT = '.haru-session-feedback__state';
const ANALYSIS_OP = 'GET /v1/sessions/:sessionId/analysis';
const FEEDBACK_TEXT = 'Today brought lots of feeling words, and a new one — proud.';

async function spaGoto(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function openFeedback(page: Page, scenario?: string, path: string = FEEDBACK) {
  await logInToHome(page, scenario);
  await spaGoto(page, path);
  await expect(page.getByRole('heading', { level: 1, name: 'Storytime notes' })).toBeVisible();
}

async function box(page: Page, selector: string) {
  const found = await page.locator(selector).first().boundingBox();
  if (found === null) throw new Error(`no box for ${selector}`);
  return found;
}

async function analysisReads(page: Page): Promise<number> {
  return (await requestOperations(page)).filter((operation) => operation === ANALYSIS_OP).length;
}

test.describe('393×852 — 골격 (Spec §2.3 · §11)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('제목 · 메달리온 좌표 = 같은 세션 완료 화면 · 닫기 38 · 스티커 0 · 가로 넘침 0', async ({
    page,
  }) => {
    await logInToHome(page, 'analysis:analysis-pending');
    await spaGoto(page, `/session/${SESSION}/complete`);
    await expect(page.locator('.haru-session-complete')).toBeVisible();
    await settleImages(page);
    const completeTitle = await box(page, '.haru-session-complete h1');
    const completeRing = await box(page, '.haru-session-complete__ring');
    const completeClose = await box(page, '.haru-session-complete__close button');

    await spaGoto(page, FEEDBACK);
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'pending');
    await settleImages(page);
    const title = await box(page, '.haru-session-feedback h1');
    const ring = await box(page, '.haru-session-feedback__ring');
    const close = await box(page, '.haru-session-feedback__close button');

    // 제목 문구가 달라 폭·x 는 다르다 — 세로 위치·줄 높이를 대조한다.
    expect(title.y).toBe(completeTitle.y);
    expect(title.height).toBe(completeTitle.height);
    expect(ring).toEqual(completeRing);
    expect(close).toEqual(completeClose);
    expect(close.width).toBe(38);
    await expect(page.locator('.haru-attendance-sticker')).toHaveCount(0);

    // InlineAlert = ring bottom + 16 · 폭 = 컬럼 − 2×24
    const alert = await box(page, `${SLOT} .haru-alert`);
    expect(alert.y - (ring.y + ring.height)).toBeCloseTo(16, 1);
    expect(alert.width).toBeCloseTo(393 - 48, 1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });

  test('버블 = 완료 화면 버블과 같은 위치 · 폭 (ring bottom + offset)', async ({ page }) => {
    await logInToHome(page, 'analysis:analysis-completed');
    await spaGoto(page, `/session/${SESSION}/complete`);
    await expect(page.locator('.haru-session-complete__bubble .haru-bubble')).toBeVisible();
    await settleImages(page);
    const completeBubble = await box(page, '.haru-session-complete__bubble .haru-bubble');

    await spaGoto(page, FEEDBACK);
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'analyzed');
    await settleImages(page);
    const bubble = await box(page, `${SLOT} .haru-bubble`);
    expect(bubble.y).toBeCloseTo(completeBubble.y, 1);
    expect(bubble.x).toBeCloseTo(completeBubble.x, 1);
    expect(bubble.width).toBeCloseTo(completeBubble.width, 1);
    await expect(page.locator(`${SLOT} .haru-bubble`)).toHaveText(FEEDBACK_TEXT);
  });
});

test.describe('상태 (AC-5-36~42)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('failed — 버튼 0 (AC-5-39)', async ({ page }) => {
    await openFeedback(page, 'analysis:analysis-failed');
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'failed');
    await expect(page.locator(SLOT).getByRole('button')).toHaveCount(0);
  });

  test('Error → Try again → 성공 (`retry`)', async ({ page }) => {
    await openFeedback(page, 'analysis:retry');
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'error');
    await page.locator(SLOT).getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator(SLOT)).not.toHaveAttribute('data-state', 'error');
  });

  test('없는 세션 → Go home (AC-5-42)', async ({ page }) => {
    await openFeedback(page, undefined, '/session/99999999-9999-4999-8999-999999999999/feedback');
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'not-found');
    await page.locator(SLOT).getByRole('button', { name: 'Go home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('닫기 = 홈 replace — 뒤로가기로 돌아오지 않는다', async ({ page }) => {
    await openFeedback(page, 'analysis:analysis-pending');
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.haru-session-feedback')).toHaveCount(0);
  });

  test('deep link 미로그인 → 기존 Guard (목적지 보존 없음, AC-5-43)', async ({ page }) => {
    await page.goto(FEEDBACK);
    await expect(page).toHaveURL(/\/auth\//);
    await expect(page.locator('.haru-session-feedback')).toHaveCount(0);
  });

  test('전사·지표 DOM 0 · 콘솔에 피드백 문구·아이 이름 0 (AC-5-45 · 46)', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', (message) => logs.push(message.text()));
    await openFeedback(page, 'analysis:analysis-completed');
    await expect(page.locator(`${SLOT} .haru-bubble`)).toHaveText(FEEDBACK_TEXT);
    const text = (await page.locator('.haru-session-feedback').textContent()) ?? '';
    expect(text).not.toMatch(/transcript|\d+\s*(words?|times)/i);
    const joined = logs.join('\n');
    expect(joined).not.toContain(FEEDBACK_TEXT);
    expect(joined).not.toContain('Emma');
  });
});

/*
 * `D5-9` (`VG5C-1`) — 오류 · 오프라인 · 없음 카드도 안내 카드와 같은 폭 (컬럼 − 2×24). 문구 길이에 따라
 * 폭이 바뀌면(shrink-to-fit) 안 된다 — 393: 345 · 320: 272.
 * `D5-10` (`VG5C-2`) — live region 은 slot 하나뿐 (안쪽 카드의 role · aria-live 0).
 */
const CARD_STATES: readonly { name: string; scenario?: string; path?: string; card: string }[] = [
  { name: 'pending', scenario: 'analysis:analysis-pending', card: '.haru-alert' },
  { name: 'error', scenario: 'analysis:error', card: '.haru-surface' },
  { name: 'offline', scenario: 'analysis:offline', card: '.haru-surface' },
  {
    name: 'not-found',
    path: '/session/99999999-9999-4999-8999-999999999999/feedback',
    card: '.haru-surface',
  },
];

for (const viewport of [
  { width: 393, height: 852 },
  { width: 320, height: 568 },
]) {
  test.describe(`카드 폭 · live region ${String(viewport.width)} (D5-9 · D5-10)`, () => {
    test.use({ viewport });

    for (const item of CARD_STATES) {
      test(`${item.name} — 카드 폭 = 컬럼 − 48 · live region 1개`, async ({ page }) => {
        await openFeedback(page, item.scenario, item.path);
        await expect(page.locator(SLOT)).toHaveAttribute('data-state', item.name);
        const card = await box(page, `${SLOT} ${item.card}`);
        expect(card.width).toBeCloseTo(viewport.width - 48, 1);
        expect(card.x).toBeCloseTo(24, 1);
        await expect(page.locator(SLOT)).toHaveAttribute('aria-live', 'polite');
        await expect(page.locator(`${SLOT} [aria-live], ${SLOT} [role]`)).toHaveCount(0);
      });
    }

    /*
     * `D5-12` (`VG5C-3`) — loading 의 `Spinner` 도 안쪽 role · aria-live 0 (`announce="none"`). 폭 단정은 카드가 아니라
     * 해당 없음 — live region 만 본다. 라벨 *"Loading"* 은 접근성 트리에 남는다 (aria-hidden 0).
     */
    test('loading — live region 1개 · Spinner 라벨은 남는다 (D5-12)', async ({ page }) => {
      await page.clock.install();
      await openFeedback(page, 'analysis:loading');
      await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'loading');
      await expect(page.locator(SLOT)).toHaveAttribute('aria-live', 'polite');
      await expect(page.locator(`${SLOT} [aria-live], ${SLOT} [role]`)).toHaveCount(0);
      await expect(page.locator(`${SLOT} [aria-hidden="true"]`).getByText('Loading')).toHaveCount(
        0,
      );
      await expect(page.locator(SLOT).getByText('Loading', { exact: true })).toHaveCount(1);
    });
  });
}

test.describe('폴링 (AC-5-35)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('pending → 15초 × 2 → analyzed · 이후 조회 0', async ({ page }) => {
    // 첫 조회 수는 세지 않고 **증가분**을 잰다 — dev 서버는 `StrictMode` 라 마운트 직후 조회가 한 번 취소·재요청된다
    // (queryFn 이 `signal` 을 쓰는 다른 query 와 같다, Production 빌드는 1회). 이 Mock 시나리오의 진행은 조회 횟수다.
    await page.clock.install();
    await openFeedback(page, 'analysis:analysis-pending-then-completed');
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'pending');
    const first = await analysisReads(page);
    expect(first).toBeGreaterThanOrEqual(1);

    await page.clock.runFor(14_000);
    expect(await analysisReads(page)).toBe(first);
    await page.clock.runFor(1_000);
    await expect.poll(() => analysisReads(page)).toBe(first + 1);
    if (first === 1) {
      await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'pending');
      await page.clock.runFor(15_000);
      await expect.poll(() => analysisReads(page)).toBe(first + 2);
    }
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'analyzed');
    await expect(page.locator(`${SLOT} .haru-bubble`)).toHaveText(FEEDBACK_TEXT);
    const done = await analysisReads(page);

    await page.clock.runFor(60_000);
    expect(await analysisReads(page)).toBe(done);
  });

  test('failed — 60초 간격 (15초에는 조회 0)', async ({ page }) => {
    await page.clock.install();
    await openFeedback(page, 'analysis:analysis-failed');
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'failed');
    const first = await analysisReads(page);
    await page.clock.runFor(45_000);
    expect(await analysisReads(page)).toBe(first);
    await page.clock.runFor(15_000);
    await expect.poll(() => analysisReads(page)).toBe(first + 1);
  });

  test('recording-deleted — 폴링 정지', async ({ page }) => {
    await page.clock.install();
    await openFeedback(page, 'analysis:recording-deleted');
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'not-available');
    const reads = await analysisReads(page);
    await page.clock.runFor(60_000);
    expect(await analysisReads(page)).toBe(reads);
  });
});

test.describe('반응형 (320 · 600 · 1024)', () => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 600, height: 900 },
    { width: 1024, height: 768 },
  ]) {
    test.describe(`${String(viewport.width)}×${String(viewport.height)}`, () => {
      test.use({ viewport });

      test('가로 넘침 0 · 앱 컬럼 안 · low-quality 전부 보인다(스크롤)', async ({ page }) => {
        await openFeedback(page, 'analysis:analysis-low-quality');
        await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'low-quality');
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
        const screen = await box(page, '.haru-session-feedback');
        expect(screen.width).toBeLessThanOrEqual(480);
        const alert = page.locator(`${SLOT} .haru-alert`);
        await alert.scrollIntoViewIfNeeded();
        await expect(alert).toBeInViewport();
      });
    });
  }
});

/** Spec §11 — 상태별 전체 프레임 11종 (`R-BASELINE-1`). */
const BASELINES: readonly { name: string; scenario?: string; path?: string; state: string }[] = [
  { name: 'loading', scenario: 'analysis:loading', state: 'loading' },
  { name: 'pending', scenario: 'analysis:analysis-pending', state: 'pending' },
  { name: 'analyzed', scenario: 'analysis:analysis-completed', state: 'analyzed' },
  { name: 'text-null', scenario: 'analysis:analysis-feedback-missing', state: 'analyzed' },
  { name: 'low-quality', scenario: 'analysis:analysis-low-quality', state: 'low-quality' },
  { name: 'failed', scenario: 'analysis:analysis-failed', state: 'failed' },
  {
    name: 'not-available',
    scenario: 'analysis:analysis-not-available',
    state: 'not-available',
  },
  { name: 'no-recording', scenario: 'analysis:recording-deleted', state: 'not-available' },
  { name: 'error', scenario: 'analysis:error', state: 'error' },
  { name: 'offline', scenario: 'analysis:offline', state: 'offline' },
  {
    name: 'not-found',
    path: '/session/99999999-9999-4999-8999-999999999999/feedback',
    state: 'not-found',
  },
];

test.describe('baseline 393×852', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  for (const item of BASELINES) {
    test(`baseline: ${item.name}`, async ({ page }) => {
      // loading — Mock 지연(1.5s)을 가짜 시계로 멈춰 Spinner 프레임을 결정적으로 담는다.
      if (item.name === 'loading') await page.clock.install();
      await openFeedback(page, item.scenario, item.path);
      await expect(page.locator(SLOT)).toHaveAttribute('data-state', item.state);
      await settleImages(page);
      await expect(page).toHaveScreenshot(`s5-feedback-${item.name}.png`, FRAME_SNAPSHOT);
    });
  }
});
