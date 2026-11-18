/**
 * Stage 6 `S6-C` — 설문 재응답 `/settings/child/survey` · `/settings/child/survey/:step` (`C13-S6-3`)
 * (Figma 없음 — design-agent 명세 Spec §2.6 · §2.7 · §9.1 · §10.3 · §11, 재사용 노드 `243:1147` · `179:1770`,
 * AC-6-24 · 25 · 26 · 27 · 28 + AC-6-29 회귀는 `onboarding.spec.ts` · `visual.spec.ts`).
 *
 * 로그인 후 앱 안 이동으로 연다 (새로고침은 Mock 인증을 지운다). 답은 **키보드**로 고른다 — 포인터 단일 선택은
 * 자동 전진(§14.1)이라 진행 제어가 겹친다 (`support/onboarding.ts` 와 같은 이유).
 * `R-BASELINE-1`: dev 패널은 가린다 · settle 후 촬영 · 임계값은 `playwright.config.ts` 상수.
 */
import { expect, test, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';
import { hideDevPanel, settle } from './support/gallery';
import { cardCounterIndex, expectCardIndex, frontCardCounter } from './support/onboarding';
import { logInToHome, requestOperations, requestPayloads } from './support/session';

const SAVE = 'PUT /v1/children/:childId/survey-update/steps/:step';
const SUBMIT = 'POST /v1/children/:childId/survey-update/submit';
const INTRO_READY = '.haru-survey-update[data-state="ready"]';
const CARDS_READY = '.haru-survey-update [data-state="ready"]';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

async function openIntro(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await page.getByRole('button', { name: 'Update survey answers' }).click();
  await expect(page).toHaveURL(/\/settings\/child\/survey$/);
}

async function openCards(page: Page, scenario?: string): Promise<void> {
  await openIntro(page, scenario);
  await expect(page.locator(INTRO_READY)).toBeVisible();
  await page.getByRole('button', { name: /^(Start|Continue where you left off)$/ }).click();
  await expect(page.locator(CARDS_READY)).toBeVisible();
  await expect(frontCardCounter(page)).toBeVisible();
  await settle(page);
}

const nextCard = (page: Page) => page.getByRole('button', { name: 'Next question' });
const saveAnswers = (page: Page) => page.getByRole('button', { name: 'Save answers' });

/** TopBar 다음으로 마지막 카드까지 (답은 프리필 그대로). */
async function goToLastCard(page: Page): Promise<void> {
  for (let guard = 0; guard < 40; guard += 1) {
    if (await nextCard(page).isDisabled()) break;
    const before = await cardCounterIndex(page);
    if (before === null) throw new Error('card counter not rendered');
    await nextCard(page).click();
    await expectCardIndex(page, before + 1);
  }
  await expect(saveAnswers(page)).toBeVisible();
}

test.describe('진입 · 카드 (AC-6-24)', () => {
  test('설정 행 → 진입 → Start → 첫 카드: 프리필 선택 · 통산 카운터 · 진행바 · 단계 제목', async ({
    page,
  }) => {
    await openIntro(page);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Update your answers' }),
    ).toBeVisible();
    await expect(page.getByText('About 3 minutes')).toBeVisible();
    await expect(page.getByText('Your earlier answers are filled in')).toBeVisible();
    // 온보딩 전용 안내 없음 (`N6-07`)
    await expect(page.getByText('Your answers stay on this device')).toHaveCount(0);

    await page.locator(INTRO_READY).waitFor();
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page).toHaveURL(/\/settings\/child\/survey\/reading-together$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Reading together' })).toBeVisible();
    await expectCardIndex(page, 1);
    await expect(page.getByRole('progressbar')).toBeVisible();

    // 프리필 — 서버 draft(최근 제출 응답)의 답이 선택된 채로 시작한다
    const front = page.locator('.haru-swipe-deck__card--front');
    await expect(front.getByRole('radio', { checked: true })).toHaveCount(1);
  });

  test('첫 카드 뒤로 → 진입 · 진입 뒤로 → 설정 목록 (흐름은 history 1칸)', async ({ page }) => {
    await openCards(page);
    await page.getByRole('button', { name: 'Go back' }).click();
    await expect(page).toHaveURL(/\/settings\/child\/survey$/);
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
  });
});

test.describe('단계 저장 · 이탈 복귀 (AC-6-25 · 26)', () => {
  test('단계 경계 1회 PUT · 이탈 → 재진입 *Continue where you left off* → 바꾼 답 보존', async ({
    page,
  }) => {
    await openCards(page);

    // 첫 카드에서 프리필과 다른 답을 키보드로 고른다
    const front = page.locator('.haru-swipe-deck__card--front');
    const checked = front.getByRole('radio', { checked: true });
    const before = await checked.getAttribute('value');
    await checked.focus();
    await page.keyboard.press('ArrowDown');
    const after = await front.getByRole('radio', { checked: true }).getAttribute('value');
    expect(after).not.toBe(before);

    // 단계 안 이동은 저장하지 않는다 — 단계를 넘길 때 1회
    await nextCard(page).click();
    await expectCardIndex(page, 2);
    expect(await requestPayloads(page, SAVE)).toEqual([]);
    await nextCard(page).click();
    await expect(page).toHaveURL(/\/books-and-interests$/);
    const saves = (await requestPayloads(page, SAVE)) as { step: string; currentStep?: string }[];
    // Rev 10.1 (`D6-9` ②) — 떠나는 단계의 답 + 도착 단계
    expect(saves).toEqual([
      expect.objectContaining({ step: 'reading_together', currentStep: 'books_and_interests' }),
    ]);

    // 이탈 — 흐름은 history 1칸이라 브라우저 back = 설정 목록. 단계 2 에서 고친 답이 없으니 이탈 PUT 0
    await page.goBack();
    await expect(page).toHaveURL(/\/settings$/);
    expect(await requestPayloads(page, SAVE)).toHaveLength(1);

    // 재진입 → 이어서 = **보던 단계**(단계 2, 그 단계의 첫 카드 — AC-6-26 개정 문구)
    await page.getByRole('button', { name: 'Update survey answers' }).click();
    await expect(page.locator(INTRO_READY)).toBeVisible();
    await page.getByRole('button', { name: 'Continue where you left off' }).click();
    await expect(page.locator(CARDS_READY)).toBeVisible();
    await expect(page).toHaveURL(/\/settings\/child\/survey\/books-and-interests$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Books and interests' }),
    ).toBeVisible();
    await expectCardIndex(page, 3);

    // 단계 1 에서 바꾼 답은 보존 — 첫 카드까지 뒤로
    for (let guard = 0; guard < 5; guard += 1) {
      if ((await cardCounterIndex(page)) === 1) break;
      const before = await cardCounterIndex(page);
      await page.getByRole('button', { name: 'Previous question' }).click();
      await expectCardIndex(page, (before ?? 2) - 1);
    }
    await expect(page).toHaveURL(/\/settings\/child\/survey\/reading-together$/);
    await expect(
      page.locator('.haru-swipe-deck__card--front').getByRole('radio', { checked: true }),
    ).toHaveAttribute('value', after ?? '');

    // 기기 저장 0 (`N6-07`)
    const stored = await page.evaluate(() =>
      [
        ...Object.keys({ ...globalThis.localStorage }),
        ...Object.keys({ ...globalThis.sessionStorage }),
        JSON.stringify(window.history.state),
      ].join('\n'),
    );
    expect(stored).not.toContain(after ?? '');
  });

  test('Rev 10.1 — 단계 안에서 고친 답 → 브라우저 back = 이탈 PUT 1건(`currentStep` 생략) → 같은 단계 · 답 보존', async ({
    page,
  }) => {
    await openCards(page);
    const front = page.locator('.haru-swipe-deck__card--front');
    const checked = front.getByRole('radio', { checked: true });
    await checked.focus();
    await page.keyboard.press('ArrowDown');
    const after = await front.getByRole('radio', { checked: true }).getAttribute('value');
    expect(await requestPayloads(page, SAVE)).toEqual([]);

    await page.goBack();
    await expect(page).toHaveURL(/\/settings$/);
    await expect.poll(async () => (await requestPayloads(page, SAVE)).length).toBe(1);
    const [save] = (await requestPayloads(page, SAVE)) as Record<string, unknown>[];
    expect(save).toMatchObject({ step: 'reading_together' });
    expect(save).not.toHaveProperty('currentStep');

    await page.getByRole('button', { name: 'Update survey answers' }).click();
    await expect(page.locator(INTRO_READY)).toBeVisible();
    await page.getByRole('button', { name: 'Continue where you left off' }).click();
    await expect(page.locator(CARDS_READY)).toBeVisible();
    await expect(page).toHaveURL(/\/settings\/child\/survey\/reading-together$/);
    await expect(
      page.locator('.haru-swipe-deck__card--front').getByRole('radio', { checked: true }),
    ).toHaveAttribute('value', after ?? '');
  });

  test('`survey-update-draft` 시나리오 → 이어서 → 서버 `currentStep` 카드', async ({ page }) => {
    await openIntro(page, 'children:survey-update-draft');
    await expect(page.locator(INTRO_READY)).toBeVisible();
    await page.getByRole('button', { name: 'Continue where you left off' }).click();
    await expect(page).toHaveURL(/\/settings\/child\/survey\/books-and-interests$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Books and interests' }),
    ).toBeVisible();
  });
});

test.describe('제출 (AC-6-27 · 28)', () => {
  test('*Save answers* → POST 1건 → Toast → 프로필(replace) UpdateNote *from your latest answers* → 뒤로 = 설정', async ({
    page,
  }) => {
    await openCards(page);
    await goToLastCard(page);
    await saveAnswers(page).dblclick();

    await expect(page).toHaveURL(/\/settings\/profile$/);
    await expect(page.getByText('Your answers are saved')).toBeVisible();
    await expect(page.getByText(/from your latest answers$/)).toBeVisible();
    expect(await requestPayloads(page, SUBMIT)).toHaveLength(1);
    // 프로필 재조회 (캐시 무효화)
    const operations = await requestOperations(page);
    expect(operations.lastIndexOf('GET /v1/children/:childId/profile')).toBeGreaterThan(
      operations.indexOf(SUBMIT),
    );

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
  });

  test('`offline` → 오프라인 안내 · 화면·답 유지', async ({ page }) => {
    await openCards(page, 'children.submitsurveyupdate:offline');
    await goToLastCard(page);
    await saveAnswers(page).click();

    await expect(page.getByRole('alert').getByText("You're offline")).toBeVisible();
    await expect(page).toHaveURL(/\/capability-items$/);
    await expect(saveAnswers(page)).toBeVisible();
  });

  test('`retry` → 첫 실패 안내 · 다시 누르면 같은 답으로 재시도 → 성공', async ({ page }) => {
    await openCards(page, 'children.submitsurveyupdate:retry');
    await goToLastCard(page);
    await saveAnswers(page).click();
    await expect(page.getByText("We couldn't save your answers right now")).toBeVisible();

    await saveAnswers(page).click();
    await expect(page).toHaveURL(/\/settings\/profile$/);
    const submits = await requestPayloads(page, SUBMIT);
    expect(submits).toHaveLength(2);
    expect(submits[0]).toEqual(submits[1]);
  });
});

for (const viewport of [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
  { width: 1024, height: 768 },
] as const) {
  test(`${String(viewport.width)}px — 진입·카드 가로 넘침 0 · 새 클립 조상 0 · CTA 도달`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openIntro(page);
    await expect(page.locator(INTRO_READY)).toBeVisible();

    const measure = () =>
      page.evaluate(() => {
        const root = document.querySelector('.haru-survey-update');
        const clippers: number[] = [];
        for (let node = root; node !== null; node = node.parentElement) {
          if (window.getComputedStyle(node).overflowX !== 'visible')
            clippers.push(node.clientWidth);
        }
        return {
          doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          clippers,
          viewport: window.innerWidth,
        };
      });

    for (const step of ['intro', 'card'] as const) {
      if (step === 'card') {
        await page.getByRole('button', { name: 'Start' }).click();
        await expect(page.locator(CARDS_READY)).toBeVisible();
      }
      const result = await measure();
      expect(result.doc, step).toBe(0);
      for (const width of result.clippers) expect(width).toBeGreaterThanOrEqual(result.viewport);
    }

    await goToLastCard(page);
    await saveAnswers(page).scrollIntoViewIfNeeded();
    await expect(saveAnswers(page)).toBeInViewport();
  });
}

/**
 * 신규 baseline — 393 · `main` 영역 클립 (Visual Gap 자료). 카드 화면은 온보딩 카드 baseline 과 같은 852 높이.
 */
test.describe('baseline — 393 (`R-BASELINE-1`)', () => {
  test('s6-survey-intro', async ({ page }) => {
    await openIntro(page);
    await expect(page.locator(INTRO_READY)).toBeVisible();
    await settle(page);
    await expect(page.locator('main')).toHaveScreenshot('s6-survey-intro.png', REGION_SNAPSHOT);
  });

  test('s6-survey-intro-resume', async ({ page }) => {
    await openIntro(page, 'children:survey-update-draft');
    await expect(page.getByRole('button', { name: 'Continue where you left off' })).toBeVisible();
    await settle(page);
    await expect(page.locator('main')).toHaveScreenshot(
      's6-survey-intro-resume.png',
      REGION_SNAPSHOT,
    );
  });

  test('s6-survey-card', async ({ page }) => {
    await openCards(page);
    await expect(page.locator('main')).toHaveScreenshot('s6-survey-card.png', REGION_SNAPSHOT);
  });

  test('s6-survey-error', async ({ page }) => {
    await openIntro(page, 'children.getsurveyupdate:error');
    await expect(page.locator('.haru-survey-update [data-state="error"]')).toBeVisible();
    await settle(page);
    await expect(page.locator('main')).toHaveScreenshot('s6-survey-error.png', REGION_SNAPSHOT);
  });

  test.describe('긴 화면', () => {
    test.use({ viewport: { width: 393, height: 1300 } });

    test('s6-survey-save-failed', async ({ page }) => {
      await openCards(page, 'children.submitsurveyupdate:error');
      await goToLastCard(page);
      await saveAnswers(page).click();
      await expect(page.getByRole('alert')).toBeVisible();
      await page.mouse.move(0, 0);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(
        's6-survey-save-failed.png',
        REGION_SNAPSHOT,
      );
    });
  });
});
