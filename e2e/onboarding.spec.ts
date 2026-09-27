/**
 * Stage 2-ONBOARDING e2e — Trial 진입 · 제스처 없는 설문 완주 · 서버 요청 0건.
 * AC-2-19 · AC-2-25 · AC-2-27 + 결정 **D-9**(제스처는 부가 기능) · **D-C**(선택 항목).
 *
 * 여기에서만 확인할 수 있는 것: **실제 브라우저의 포커스·키 입력**. jsdom 단위 테스트는
 * 클릭 이벤트까지만 증명한다.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from './support/gallery';

const SURVEY_PATH = '/onboarding/capability-items';
const TOTAL_ITEMS = 10;

/** 서버로 나간 API 요청을 세어 둔다 (Trial 구간은 0건이어야 한다). */
function trackApiRequests(page: Page): string[] {
  const calls: string[] = [];

  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/v1/')) calls.push(`${request.method()} ${url}`);
  });

  return calls;
}

test.describe('Trial 진입 (AC-2-19 · AC-2-27)', () => {
  test('소개 화면에서 Step 1 로 들어가고 서버 요청이 0건이다', async ({ page }) => {
    const calls = trackApiRequests(page);

    await gotoApp(page, '/onboarding');
    await page.getByRole('button', { name: 'Start' }).click();

    await expect(page).toHaveURL(/\/onboarding\/child-info$/);
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    // 가입 전에는 이 기기를 떠나지 않는다는 안내가 보인다 (C13-11).
    await expect(page.getByText('Your answers stay on this device')).toBeVisible();

    expect(calls).toEqual([]);
  });

  test('Step 2~4 는 응답하지 않아도 넘어간다 (결정 D-C)', async ({ page }) => {
    await gotoApp(page, '/onboarding/temperament');

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/onboarding\/books$/);

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/onboarding\/goals$/);
  });
});

test.describe('Step 5 — 제스처 없이 완주한다 (AC-2-25 · D-9 · WCAG 2.5.1)', () => {
  test('키보드만으로 10문항 전부에 도달해 응답한다', async ({ page }) => {
    const calls = trackApiRequests(page);

    await gotoApp(page, SURVEY_PATH);

    const deck = page.getByRole('group', { name: 'Baseline questions' });
    await expect(deck).toBeVisible();

    const nextQuestion = page.getByRole('button', { name: 'Next question' });

    for (let index = 0; index < TOTAL_ITEMS; index += 1) {
      await expect(page.getByText(`${String(index + 1)} / ${String(TOTAL_ITEMS)}`)).toBeVisible();

      // 스와이프를 쓰지 않는다 — 포커스 + Space 로 응답한다.
      const option = deck.getByRole('radio').nth(index % 6);
      await option.focus();
      await page.keyboard.press('Space');
      await expect(option).toBeChecked();

      if (index < TOTAL_ITEMS - 1) {
        await nextQuestion.focus();
        await page.keyboard.press('Enter');
      }
    }

    // 전부 응답했으므로 남은 문항 안내가 사라진다.
    await expect(page.getByText(/question[s]? left\./)).toHaveCount(0);
    // Trial 이므로 마지막 CTA 는 가입이다 (제출이 아니다).
    await expect(page.getByRole('button', { name: 'Save profile' })).toBeVisible();

    expect(calls).toEqual([]);
  });

  test('이전 문항 버튼으로 되돌아갈 수 있다', async ({ page }) => {
    await gotoApp(page, SURVEY_PATH);

    await page.getByRole('button', { name: 'Next question' }).click();
    await expect(page.getByText(`2 / ${String(TOTAL_ITEMS)}`)).toBeVisible();

    await page.getByRole('button', { name: 'Previous question' }).click();
    await expect(page.getByText(`1 / ${String(TOTAL_ITEMS)}`)).toBeVisible();
  });

  test('비채점 옵션이 별도 안내와 함께 6번째로 놓인다 (C13-08)', async ({ page }) => {
    await gotoApp(page, SURVEY_PATH);

    const deck = page.getByRole('group', { name: 'Baseline questions' });
    await expect(deck.getByRole('radio')).toHaveCount(6);
    await expect(page.getByText("This one isn't scored.")).toBeVisible();

    // 비채점 응답도 1~5 와 똑같이 선택된다 (결측이지 낮은 점수가 아니다 — C-8).
    const notObserved = deck.getByRole('radio').nth(5);
    await notObserved.focus();
    await page.keyboard.press('Space');
    await expect(notObserved).toBeChecked();
  });
});

/**
 * `QA-2-001` 회귀 방지 — 덱 **안**에서도 마우스·터치가 키보드와 똑같이 동작해야 한다.
 *
 * 이 결함이 지금까지 비어 있던 이유: 위 테스트들이 전부 `focus()` + 키 입력이라
 * **click 의 target 리타깃**을 건드리지 않았다. 원인은 `pointerdown` 시점의
 * `setPointerCapture` 였고, 캡처가 걸리면 후속 `mouseup`·`click` 의 target 이 카드 컨테이너로
 * 바뀌어 카드 안 컨트롤이 입력을 받지 못했다. 세 입력 경로를 모두 여기서 고정한다.
 */
test.describe('세 입력 경로 — 마우스 · 키보드 · 터치 (QA-2-001)', () => {
  test('마우스 클릭으로 덱 안 라디오를 선택하고 다시 해제한다', async ({ page }) => {
    await gotoApp(page, SURVEY_PATH);

    const deck = page.getByRole('group', { name: 'Baseline questions' });
    const option = deck.getByRole('radio').nth(2);

    await option.click();
    await expect(option).toBeChecked();

    // 카드 우상단 `179:1804` — 이것도 카드 **안**이라 같은 결함의 영향을 받았다.
    await page.getByRole('button', { name: 'Clear this answer' }).click();
    await expect(option).not.toBeChecked();
  });

  test('대조군 — 덱 밖 RadioGroup 도 마우스로 선택된다', async ({ page }) => {
    await gotoApp(page, '/onboarding/temperament');

    const option = page.getByRole('radio').first();
    await option.click();
    await expect(option).toBeChecked();
  });

  test('마우스로 끌면 제스처는 그대로 동작한다 (클릭 수정이 스와이프를 막지 않는다)', async ({
    page,
  }) => {
    await gotoApp(page, SURVEY_PATH);

    const card = page.locator('.haru-swipe-deck__card--front');
    const box = await card.boundingBox();
    if (box === null) throw new Error('card not laid out');

    const startX = box.x + box.width - 20;
    const y = box.y + box.height / 2;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    // 한 번에 점프시키지 않는다 — 실제 끌기처럼 임계를 지나며 여러 번 움직인다.
    for (let step = 1; step <= 10; step += 1) {
      await page.mouse.move(startX - step * 25, y);
    }
    await page.mouse.up();

    await expect(page.getByText(`2 / ${String(TOTAL_ITEMS)}`)).toBeVisible();
  });

  test.describe('터치', () => {
    test.use({ hasTouch: true });

    test('탭으로 덱 안 라디오를 선택한다', async ({ page }) => {
      await gotoApp(page, SURVEY_PATH);

      const deck = page.getByRole('group', { name: 'Baseline questions' });
      await deck.locator('label').nth(1).tap();

      await expect(deck.getByRole('radio').nth(1)).toBeChecked();
    });

    test('손가락으로 밀면 다음 카드로 간다', async ({ page }) => {
      await gotoApp(page, SURVEY_PATH);

      const card = page.locator('.haru-swipe-deck__card--front');
      const box = await card.boundingBox();
      if (box === null) throw new Error('card not laid out');

      // Playwright 의 touchscreen 에는 끌기가 없다. 합성 PointerEvent 는 pointerId 가
      // 실제 포인터가 아니라 캡처에서 걸리므로, CDP 로 **진짜 터치 입력**을 보낸다.
      const cdp = await page.context().newCDPSession(page);
      const startX = box.x + box.width - 20;
      const y = box.y + 40;

      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: startX, y }],
      });
      for (let step = 1; step <= 10; step += 1) {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: startX - step * 25, y }],
        });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

      await expect(page.getByText(`2 / ${String(TOTAL_ITEMS)}`)).toBeVisible();
    });
  });
});
