/**
 * 온보딩 e2e — 재구성(2026-10-03) 기준. Trial 진입 · 제스처 없는 완주 · 서버 요청 0건 ·
 * 자동 전진과 복귀 경로.
 *
 * `AC-2R-01`~`AC-2R-09` + `AC-2-25`(키보드 전체 도달) · `AC-2-27`(Trial 요청 0건) +
 * 결정 **D-9**(제스처는 부가 기능) · `S2-ONB-1`(Q1 · Q4 · Q2 필수, Q3 · Q5 선택).
 *
 * 여기에서만 확인할 수 있는 것: **실제 브라우저의 포커스·키 입력·포인터 캡처**.
 * jsdom 단위 테스트는 합성 이벤트까지만 증명한다.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from './support/gallery';
import {
  answerAllCards,
  cardCounterIndex,
  DECK_LABEL,
  expectCardIndex,
  fillChildInfo,
  frontCardCounter,
} from './support/onboarding';

const FIRST_CARD_PATH = '/onboarding/reading-together';
const SURVEY_PATH = '/onboarding/capability-items';
const BASELINE_ITEMS = 10;

/** 서버로 나간 API 요청을 세어 둔다 (Trial 구간은 0건이어야 한다). */
function trackApiRequests(page: Page): string[] {
  const calls: string[] = [];

  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/v1/')) calls.push(`${request.method()} ${url}`);
  });

  return calls;
}

/**
 * 카드 안쪽 통산 카운터 locator. **분모를 테스트에 적지 않는다** — Trial 15 / 인증+동의 16 으로
 * 구간에 따라 다르다 (`§11.19` 7-1).
 */
function counter(page: Page, index: number) {
  return page
    .locator('.haru-swipe-deck__card--front')
    .getByText(new RegExp(`^${String(index)} / \\d+$`));
}

/** 통산 카운터의 **분모**. 구간에 따라 다르므로 읽어서 쓴다 (`§11.19` 7-1). */
async function cardCounterTotal(page: Page): Promise<number> {
  const text = await frontCardCounter(page).textContent();
  const match = /^(\d+) \/ (\d+)$/.exec((text ?? '').trim());

  if (match?.[2] === undefined) throw new Error('card counter not rendered');
  return Number(match[2]);
}

/**
 * 자동 전진이 "일어나지 않는 것"을 확인하려면 대기가 필요하다 — 기다릴 이벤트가 없다.
 * `AUTO_ADVANCE_DELAY_MS`(400) 보다 넉넉히 둔다.
 */
async function settleAutoAdvance(page: Page): Promise<void> {
  await page.waitForTimeout(1_200);
}

/** 앞 카드에 **키보드로** 답한다 — 포인터 선택은 자동 전진을 유발한다 (§14.3). */
async function answerFrontCardByKeyboard(page: Page): Promise<void> {
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
}

test.describe('흐름 (`AC-2R-01` · `AC-2R-11` · `AC-2-27`)', () => {
  test('소개 2화면을 지나 카드 단계로 들어가고 서버 요청이 0건이다', async ({ page }) => {
    const calls = trackApiRequests(page);

    await gotoApp(page, '/onboarding/start');
    await page.getByRole('button', { name: 'Start the questions' }).click();
    await expect(page).toHaveURL(/\/onboarding\/child-info$/);

    // 가입 전에는 이 기기를 떠나지 않는다는 안내가 보인다 (C13-11 · `R-07`).
    await expect(page.getByText('Your answers stay on this device')).toBeVisible();

    await fillChildInfo(page);
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/onboarding$/);

    await page.getByRole('button', { name: /^(Start|Pick up where you left off)$/ }).click();
    await expect(page).toHaveURL(new RegExp(`${FIRST_CARD_PATH}$`));

    expect(calls).toEqual([]);
  });

  test('네 카드 단계가 모두 열리고 제목이 바뀐다', async ({ page }) => {
    const steps = [
      ['/onboarding/reading-together', 'Reading together'],
      ['/onboarding/books-and-interests', 'Books and interests'],
      ['/onboarding/growing-together', 'Growing together'],
      ['/onboarding/capability-items', 'Capability'],
    ] as const;

    for (const [path, title] of steps) {
      await gotoApp(page, path);
      await expect(page.getByRole('group', { name: DECK_LABEL })).toBeVisible();
      /*
        `banner` landmark 로 찾지 않는다 — 온보딩 TopBar 는 `<main>` **안**에 있어 HTML-AAM
        상 `banner` role 이 없다 (`QA-2R-008`, 선행 구조). 제목은 `<h1>` 으로 남아 있다.
      */
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    }
  });
});

test.describe('카드 단계 — 한 카드 = 한 문항 (`AC-2R-02`)', () => {
  test('한 번에 문항 하나만 보이고 하단 CTA 가 없다', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    await expect(page.getByRole('group', { name: DECK_LABEL })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Save profile' })).toHaveCount(0);
  });

  test('필수 미응답이면 전진 어포던스가 `aria-disabled` 이고 사유가 카드 안에 있다', async ({
    page,
  }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    const nextCard = page.getByRole('button', { name: 'Next question' });
    await expect(nextCard).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByText('Answer this one to move on.')).toBeVisible();

    // `force` 로 실제 클릭을 강제해도 진행되지 않는다 (핸들러가 막는다).
    await nextCard.click({ force: true });
    await expect(counter(page, 1)).toBeVisible();
  });

  test('카운터가 전체 통산이고 단계 경계에서 끊기지 않는다 (`AC-2R-08`)', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    await expect(counter(page, 1)).toBeVisible();

    const answerAndAdvance = async () => {
      // 키보드로 답하면 자동 전진이 일어나지 않는다 (§14.3) — 전진 제어가 겹치지 않는다.
      const option = page.getByRole('radio').first();
      await option.focus();
      await page.keyboard.press('Space');
      await page.getByRole('button', { name: 'Next question' }).click();
    };

    // Q1 · Q4 는 **둘 다 필수**다 (`S2-ONB-1`) — 답하지 않으면 차단이 정상 동작이다.
    await answerAndAdvance();
    await expectCardIndex(page, 2);

    // 단계가 바뀌어도 번호가 이어진다.
    await answerAndAdvance();
    await expect(page).toHaveURL(/\/onboarding\/books-and-interests$/);
    await expectCardIndex(page, 3);
  });

  test('복수 선택 문항이 체크박스 행이다 (§3.6)', async ({ page }) => {
    await gotoApp(page, '/onboarding/growing-together');

    await expect(page.getByRole('group', { name: DECK_LABEL })).toBeVisible();
    await expect(page.getByRole('checkbox').first()).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(0);
  });
});

test.describe('자동 전진과 복귀 경로 (§14)', () => {
  test('단일 선택을 포인터로 고르면 다음 카드로 넘어간다', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    await page.getByRole('radio').first().click();

    await expect(counter(page, 2)).toBeVisible();
  });

  /*
    아래 세 건은 **단계 경계**를 본다. 위 테스트가 첫 카드만 보기 때문에 "단계의 마지막
    카드에서 전진이 멈추는" 결함을 놓쳤다 (첫 카드는 단계의 마지막이 아니다).
    카드 흐름은 15장(또는 16장)이 **하나의 덱**이라는 것이 `R-02` 통산 카운터의 전제다.
  */

  test('★ 단계의 마지막 카드에서도 전진한다 — 단계 경계를 넘는다', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    await page.getByRole('radio').first().click();
    await expectCardIndex(page, 2);

    // 2번째 카드가 `Reading together` 의 **마지막** 카드다.
    await page.getByRole('radio').first().click();

    await expectCardIndex(page, 3);
    await expect(page).toHaveURL(/\/onboarding\/books-and-interests$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Books and interests' }),
    ).toBeVisible();
  });

  test('★ 덱의 마지막 카드에서는 전진하지 않는다 (경계 유지)', async ({ page }) => {
    await gotoApp(page, SURVEY_PATH);

    const nextCard = page.getByRole('button', { name: 'Next question' });

    // 역량 단계 마지막 카드 = 덱 전체의 마지막 카드. 키보드로 답하며 걸어간다.
    for (let guard = 0; guard < BASELINE_ITEMS; guard += 1) {
      if (await nextCard.isDisabled()) break;

      const before = await cardCounterIndex(page);
      if (before === null) throw new Error('card counter not rendered');
      await nextCard.click();
      await expectCardIndex(page, before + 1);
    }

    await expect(nextCard).toBeDisabled();
    const last = await cardCounterIndex(page);
    expect(last).not.toBeNull();

    await page.getByRole('radio').first().click();
    await settleAutoAdvance(page);

    expect(await cardCounterIndex(page)).toBe(last);
    await expect(page).toHaveURL(new RegExp(`${SURVEY_PATH}$`));
  });

  test('★ 단일 선택 카드 전부에서 전진한다 (단계마다 하나씩만 보면 같은 함정에 빠진다)', async ({
    page,
  }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    const nextCard = page.getByRole('button', { name: 'Next question' });
    const total = await cardCounterTotal(page);

    for (let index = 1; index <= total; index += 1) {
      await expectCardIndex(page, index);

      const radio = page.getByRole('radio').first();

      if ((await radio.count()) > 0) {
        // 단일 선택 — 포인터로 고르면 자동 전진한다 (단계 경계와 무관하게).
        await radio.click();

        if (index < total) {
          await expectCardIndex(page, index + 1);
          continue;
        }

        await settleAutoAdvance(page);
        expect(await cardCounterIndex(page)).toBe(total);
        return;
      }

      // 복수 선택·텍스트 입력 카드가 수동인 것은 설계대로다 (`S2R-OPEN-3`).
      const checkbox = page.getByRole('checkbox').first();
      if ((await checkbox.count()) > 0) {
        await checkbox.focus();
        await page.keyboard.press('Space');
      }

      await nextCard.click();
      await expectCardIndex(page, index + 1);
    }

    throw new Error('deck never reached a single-choice last card');
  });

  test('키보드 선택은 자동 전진하지 않는다 (방향키 탐색을 막지 않는다)', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    const option = page.getByRole('radio').first();
    await option.focus();
    await page.keyboard.press('Space');

    await expect(option).toBeChecked();
    await expect(counter(page, 1)).toBeVisible();
  });

  test('★ 돌아온 카드에서는 자동 전진하지 않는다 — 오선택을 고칠 수 있다', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    await page.getByRole('radio').first().click();
    await expect(counter(page, 2)).toBeVisible();

    await page.getByRole('button', { name: 'Previous question' }).click();
    await expect(counter(page, 1)).toBeVisible();

    const corrected = page.getByRole('radio').nth(2);
    await corrected.click();

    await expect(corrected).toBeChecked();
    await expect(counter(page, 1)).toBeVisible();
  });

  test('자동 전진 후 포커스가 새 카드의 첫 옵션으로 간다 (§14.3)', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    await page.getByRole('radio').first().click();
    await expect(counter(page, 2)).toBeVisible();

    await expect(page.getByRole('radio').first()).toBeFocused();
  });

  /*
    위 두 건은 **한 단계 안**만 본다. 단계를 넘으면 navigate 가 일어나고
    `RouteErrorBoundary`(`key={location.key}`)가 덱을 통째로 재마운트하므로, 떠난 카드 목록과
    포커스가 그 지점에서 사라졌다. 아래 두 건이 그 경계를 지킨다.
  */

  test('★ 경계를 넘어 돌아온 카드에서도 자동 전진하지 않는다', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    await page.getByRole('radio').first().click();
    await expectCardIndex(page, 2);
    await page.getByRole('radio').first().click();
    await expectCardIndex(page, 3);

    /*
      단계의 첫 카드에서도 leading 은 `Previous question` 이고 이전 단계의 **마지막 카드**로
      돌아간다 (`S2-FIX-4`). 이 라벨이 `Go back` 이던 때는 동작과 어긋났다 (WCAG 2.4.6).
    */
    await page.getByRole('button', { name: 'Previous question' }).click();
    await expect(page).toHaveURL(new RegExp(`${FIRST_CARD_PATH}$`));
    await expectCardIndex(page, 2);

    // 2번 카드는 **경계를 넘긴 그 카드**다 → 답을 고쳐도 머문다.
    const correctedLast = page.getByRole('radio').nth(2);
    await correctedLast.click();
    await settleAutoAdvance(page);

    await expect(correctedLast).toBeChecked();
    expect(await cardCounterIndex(page)).toBe(2);
    await expect(page).toHaveURL(new RegExp(`${FIRST_CARD_PATH}$`));

    // 경계를 넘기 전에 떠난 1번 카드도 마찬가지다.
    await page.getByRole('button', { name: 'Previous question' }).click();
    await expectCardIndex(page, 1);

    const corrected = page.getByRole('radio').nth(2);
    await corrected.click();
    await settleAutoAdvance(page);

    await expect(corrected).toBeChecked();
    expect(await cardCounterIndex(page)).toBe(1);
  });

  test('★ 단계를 넘은 뒤에도 포커스가 새 카드의 첫 옵션에 있다 (§14.3)', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    await page.getByRole('radio').first().click();
    await expectCardIndex(page, 2);
    await page.getByRole('radio').first().click();
    await expectCardIndex(page, 3);

    const focused = await page.evaluate(() => {
      const element = document.activeElement;
      if (element === null) return null;

      return {
        tag: element.tagName,
        inFrontCard: element.closest('.haru-swipe-deck__card--front') !== null,
      };
    });

    expect(focused?.tag).not.toBe('BODY');
    expect(focused?.inFrontCard).toBe(true);
  });

  test('★ 이전 단계로 돌아가면 그 단계의 마지막 카드다 (§14.2-1)', async ({ page }) => {
    // `/onboarding/books-and-interests` 의 첫 카드가 통산 3번이다.
    await gotoApp(page, '/onboarding/books-and-interests');
    await expectCardIndex(page, 3);

    // 단계 첫 카드의 leading 은 `Previous question` 이다 (`S2-FIX-4`).
    await page.getByRole('button', { name: 'Previous question' }).click();

    await expect(page).toHaveURL(new RegExp(`${FIRST_CARD_PATH}$`));
    // 이전 단계의 **마지막** 카드다 — 첫 카드(1)가 아니다.
    await expectCardIndex(page, 2);
  });

  test('★ 앞뒤로 오가도 복귀 지점이 어긋나지 않는다', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    const nextCard = page.getByRole('button', { name: 'Next question' });

    // 키보드로 답한다 — 포인터는 자동 전진을 유발해 전진 제어가 겹친다 (§14.3).
    await answerFrontCardByKeyboard(page);
    await nextCard.click();
    await expectCardIndex(page, 2);

    await answerFrontCardByKeyboard(page);
    await nextCard.click();
    await expectCardIndex(page, 3); // 단계를 넘었다

    // 단계 경계에서도 라벨은 `Previous question` 이다 (`S2-FIX-4`).
    await page.getByRole('button', { name: 'Previous question' }).click();
    await expectCardIndex(page, 2);

    // 다시 앞으로 — 복귀 지점이 남아 있으면 여기에서 어긋난다.
    await nextCard.click();
    await expectCardIndex(page, 3);

    await page.getByRole('button', { name: 'Previous question' }).click();
    await expectCardIndex(page, 2);

    // 같은 단계 안의 뒤로 가기는 여전히 한 칸이다.
    await page.getByRole('button', { name: 'Previous question' }).click();
    await expectCardIndex(page, 1);
  });
});

/**
 * 카드 옆 이동 버튼 — 재구성 Design Spec **§18** · 사용자 결정 **`§11.23`**.
 *
 * 기능이 아니라 **발견 가능성**을 고치는 변경이다 (§18.0): TopBar chevron 은 이미 동작했고,
 * 자동 전진이 없는 복수 선택·입력 카드에서 그 경로가 카드에서 멀어 보이지 않았다.
 * 그래서 아래 검증의 축은 두 가지다 — ① **같은 핸들러**가 카드 옆에서도 불린다
 * ② 기하(가로 모서리 · 세로 중앙)가 **카드 높이 235~638 전부에서** 성립한다.
 *
 * 카드 버튼은 `aria-hidden` 이라 role 로 잡을 수 없다 (§18.7 — 포인터 전용 보조 어포던스).
 * 그래서 이 블록만 CSS 셀렉터를 쓴다.
 */
test.describe('카드 옆 이동 버튼 (§18 · `§11.23`)', () => {
  const CARD_PREV = '.haru-survey-deck__nav--prev .haru-icon-button';
  const CARD_NEXT = '.haru-survey-deck__nav--next .haru-icon-button';

  /** 카드 단계 경로 — 카드 번호는 instrument 파생값이라 테스트에 **경로만** 적는다. */
  const BOOKS_PATH = '/onboarding/books-and-interests';
  const GOALS_PATH = '/onboarding/growing-together';

  /** 앞 카드와 버튼의 기하. 세로 중앙 규칙(§18.3)은 **실측으로만** 증명된다. */
  async function geometry(page: Page, side: 'prev' | 'next') {
    const selector = side === 'prev' ? CARD_PREV : CARD_NEXT;
    const card = await page.locator('.haru-swipe-deck__card--front').boundingBox();
    const deck = await page.locator('.haru-survey-deck').boundingBox();
    const button = await page.locator(selector).boundingBox();

    if (card === null || deck === null || button === null) {
      throw new Error(`geometry not measurable (${side})`);
    }

    return { card, deck, button };
  }

  test('★ 복수 선택 카드와 favorites 카드에서 카드 우측 버튼으로 전진한다', async ({ page }) => {
    // 이 단계의 첫 카드가 Q3(복수 선택)이고 다음이 favorites 입력 카드다 — 둘 다 자동 전진이 없다.
    await gotoApp(page, BOOKS_PATH);
    const before = await cardCounterIndex(page);
    if (before === null) throw new Error('card counter not rendered');

    await expect(page.getByRole('checkbox').first()).toBeVisible();
    await page.locator(CARD_NEXT).click();
    await expectCardIndex(page, before + 1);

    // favorites 카드 — 입력만 있는 카드에서도 전진한다 (단계 경계를 넘는다).
    await expect(page.getByRole('textbox', { name: 'Books your child loves' })).toBeVisible();
    await page.locator(CARD_NEXT).click();
    await expectCardIndex(page, before + 2);
    await expect(page).toHaveURL(new RegExp(`${GOALS_PATH}$`));
  });

  test('★ 카드 좌측 버튼으로 이전 카드로 돌아간다', async ({ page }) => {
    await gotoApp(page, BOOKS_PATH);
    const before = await cardCounterIndex(page);
    if (before === null) throw new Error('card counter not rendered');

    await page.locator(CARD_NEXT).click();
    await expectCardIndex(page, before + 1);

    await page.locator(CARD_PREV).click();
    await expectCardIndex(page, before);
  });

  test('★ 전체 첫 카드에는 카드 좌측 버튼이 없다 (`S2R-OPEN-16`)', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);
    await expectCardIndex(page, 1);

    // 우 버튼은 있다 — 없으면 "버튼이 아예 안 그려진 것" 과 구별되지 않는다.
    await expect(page.locator(CARD_NEXT)).toHaveCount(1);
    await expect(page.locator(CARD_PREV)).toHaveCount(0);

    // 설문 **밖**으로 나가는 경로는 TopBar 에만 남는다.
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
  });

  test('★ 단계 첫 카드의 TopBar leading 은 `Previous question` 이다 (`S2-FIX-4`)', async ({
    page,
  }) => {
    // 2·3·4 카드 단계의 첫 카드 — 라벨은 `Go back` 이었지만 실제로는 이전 **카드**로 간다.
    for (const path of [BOOKS_PATH, GOALS_PATH, SURVEY_PATH]) {
      await gotoApp(page, path);
      await expect(page.getByRole('group', { name: DECK_LABEL })).toBeVisible();

      await expect(page.getByRole('button', { name: 'Previous question' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Go back' })).toHaveCount(0);
    }

    // 동작은 그대로다 — 이전 단계의 **마지막 카드**로 간다 (§14.2-1).
    await gotoApp(page, BOOKS_PATH);
    const before = await cardCounterIndex(page);
    if (before === null) throw new Error('card counter not rendered');
    await page.getByRole('button', { name: 'Previous question' }).click();
    await expect(page).toHaveURL(new RegExp(`${FIRST_CARD_PATH}$`));
    await expectCardIndex(page, before - 1);
  });

  test('★ 카드 버튼은 탭 순서에 없고 접근성 트리에도 없다 (§18.7)', async ({ page }) => {
    await gotoApp(page, BOOKS_PATH);

    for (const selector of [CARD_PREV, CARD_NEXT]) {
      const button = page.locator(selector);
      await expect(button).toHaveAttribute('aria-hidden', 'true');
      await expect(button).toHaveAttribute('tabindex', '-1');
    }

    // 이전/다음은 접근성 트리에 **1쌍**만 남는다 (TopBar). 중복 노드를 만들지 않는다.
    await expect(page.getByRole('button', { name: 'Previous question' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Next question' })).toHaveCount(1);

    /*
      속성 단언만으로는 "탭 순서에 없다" 를 증명하지 못한다 — 실제로 Tab 을 돌려 본다.
      화면 전체를 한 바퀴 돌 만큼 눌러도 포커스가 카드 버튼에 닿지 않아야 한다.
    */
    await page.getByRole('button', { name: 'Previous question' }).focus();
    for (let press = 0; press < 30; press += 1) {
      await page.keyboard.press('Tab');
      const onNav = await page.evaluate(
        () => (document.activeElement?.closest('.haru-survey-deck__nav') ?? null) !== null,
      );
      expect(onNav, `Tab #${String(press + 1)} 이 카드 버튼에 멈췄다`).toBe(false);
    }
  });

  /**
   * 세로 중앙 규칙(§18.3)의 핵심 검증 — Figma 의 `y=415` 를 고정값으로 굳히면 **최단 카드에서
   * 버튼이 카드를 벗어난다**. 최단(favorites 선택 0건)과 최장(Q2) 양 끝을 실측한다.
   */
  test('★ 최단 · 최장 카드 모두에서 버튼이 카드 세로 중앙에 있다 (§18.3)', async ({ page }) => {
    const heights: number[] = [];

    const checkCentered = async (label: string) => {
      for (const side of ['prev', 'next'] as const) {
        const { card, deck, button } = await geometry(page, side);

        // 덱 래퍼는 앞 카드보다 **뒤 카드 peek 만큼** 높다 — 이 보정이 중앙 계산의 전제다.
        expect(deck.height, `${label} deck height > card height`).toBeGreaterThan(card.height);

        const cardCenter = card.y + card.height / 2;
        const buttonCenter = button.y + button.height / 2;
        expect(Math.abs(buttonCenter - cardCenter), `${label} ${side} center`).toBeLessThanOrEqual(
          2,
        );

        // 카드 안에 들어 있다 (고정 offset 이면 최단 카드에서 이 조건이 깨진다).
        expect(button.y, `${label} ${side} top inside card`).toBeGreaterThanOrEqual(card.y);
        expect(button.y + button.height, `${label} ${side} bottom inside card`).toBeLessThanOrEqual(
          card.y + card.height,
        );

        // 버튼 **중심**이 카드 세로 모서리 위에 있다 (§18.2).
        const edge = side === 'prev' ? card.x : card.x + card.width;
        expect(
          Math.abs(button.x + button.width / 2 - edge),
          `${label} ${side} edge`,
        ).toBeLessThanOrEqual(1);
      }

      const { card } = await geometry(page, 'next');
      heights.push(Math.round(card.height));
    };

    // 최장 — Q2 성장 목표 카드 (§5.3 실측 638).
    await gotoApp(page, GOALS_PATH);
    await expect(page.getByRole('checkbox').first()).toBeVisible();
    await checkCentered('longest');

    // 최단 — favorites 카드의 선택 0건 상태 (§5.3 실측 235).
    await gotoApp(page, BOOKS_PATH);
    await page.locator(CARD_NEXT).click();
    await expect(page.getByRole('textbox', { name: 'Books your child loves' })).toBeVisible();
    await checkCentered('shortest');

    // 두 끝이 실제로 다른 높이여야 이 테스트가 의미를 갖는다.
    expect(heights[0]).toBeGreaterThan(heights[1] ?? 0);
  });

  test('★ 320px 에서 버튼이 화면 밖으로 나가지 않고 옵션 행과 겹치지 않는다 (§18.8)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await gotoApp(page, BOOKS_PATH);
    await expect(page.getByRole('checkbox').first()).toBeVisible();

    for (const side of ['prev', 'next'] as const) {
      const { button } = await geometry(page, side);
      expect(button.x, `${side} left in viewport`).toBeGreaterThanOrEqual(0);
      expect(button.x + button.width, `${side} right in viewport`).toBeLessThanOrEqual(320);
    }

    // 가로 스크롤이 생기지 않는다.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    // 옵션 행의 터치 타깃(카드 content box)과 교차하지 않는다.
    const optionRow = await page
      .locator('.haru-survey-options .haru-checkbox-group__option')
      .first()
      .boundingBox();
    if (optionRow === null) throw new Error('option row box not measurable');

    for (const side of ['prev', 'next'] as const) {
      const { button } = await geometry(page, side);
      const overlaps =
        button.x < optionRow.x + optionRow.width && button.x + button.width > optionRow.x;
      expect(overlaps, `${side} overlaps option row`).toBe(false);
    }
  });
});

/**
 * 카드 버튼 **위에서 시작한 포인터** — 스와이프와 클릭이 둘 다 살아야 한다 (사용자 결정 2026-10-05).
 *
 * 사용자 지시는 "지금 카드 스와이프 동작은 **그대로 두고** 버튼을 두어라" 였다. 버튼이 카드
 * 모서리에 반씩 걸치면서(§18.2) 그 44px 띠에서 시작한 끌기가 죽었고, 그것은 지시 위반이다.
 *
 * 판정 규칙은 `SwipeDeck` 이 `QA-2-001` 에서 이미 쓴 것과 **같다**: `SWIPE_SLOP_PX`(8) 를
 * 넘게 **움직이면** 제스처, **제자리에서 떼면** 클릭. 임계값·방향·애니메이션은 그대로다.
 */
test.describe('카드 버튼 위에서 시작한 제스처 (§18.4 · `QA-2-001` 규칙 공유)', () => {
  const CARD_NEXT = '.haru-survey-deck__nav--next .haru-icon-button';
  const CARD_PREV = '.haru-survey-deck__nav--prev .haru-icon-button';

  /** 카드 우측 모서리에서 **안쪽으로** `inset` 만큼. 버튼 히트 영역(44) 한가운데가 −10 이다. */
  async function dragFromRightEdge(page: Page, inset: number): Promise<void> {
    const box = await page.locator('.haru-swipe-deck__card--front').boundingBox();
    if (box === null) throw new Error('card not laid out');

    const startX = box.x + box.width - inset;
    const y = box.y + box.height / 2;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    for (let step = 1; step <= 10; step += 1) {
      await page.mouse.move(startX - step * 25, y);
    }
    await page.mouse.up();
  }

  test('★ 버튼 히트 영역 한가운데(모서리 −10px)에서 끌면 스와이프된다', async ({ page }) => {
    await gotoApp(page, SURVEY_PATH);

    const start = await cardCounterIndex(page);
    if (start === null) throw new Error('card counter not rendered');

    await dragFromRightEdge(page, 10);

    await expectCardIndex(page, start + 1);
  });

  test('모서리 −20px 에서도 끌면 스와이프된다', async ({ page }) => {
    await gotoApp(page, SURVEY_PATH);

    const start = await cardCounterIndex(page);
    if (start === null) throw new Error('card counter not rendered');

    await dragFromRightEdge(page, 20);

    await expectCardIndex(page, start + 1);
  });

  test('★ 버튼을 제자리에서 누르면 클릭이다 (움직이면 제스처, 안 움직이면 클릭)', async ({
    page,
  }) => {
    await gotoApp(page, SURVEY_PATH);

    const start = await cardCounterIndex(page);
    if (start === null) throw new Error('card counter not rendered');

    const nextBox = await page.locator(CARD_NEXT).boundingBox();
    if (nextBox === null) throw new Error('card next button not laid out');

    // 제자리 누름 — 이동 0. 캡처가 걸리지 않으므로 click 이 버튼에 간다.
    await page.mouse.move(nextBox.x + nextBox.width / 2, nextBox.y + nextBox.height / 2);
    await page.mouse.down();
    await page.mouse.up();
    await expectCardIndex(page, start + 1);

    const prevBox = await page.locator(CARD_PREV).boundingBox();
    if (prevBox === null) throw new Error('card prev button not laid out');

    await page.mouse.move(prevBox.x + prevBox.width / 2, prevBox.y + prevBox.height / 2);
    await page.mouse.down();
    await page.mouse.up();
    await expectCardIndex(page, start);
  });

  test('★ 카드 안 컨트롤 클릭이 전부 살아 있다 (`QA-2-001` 회귀 가드)', async ({ page }) => {
    // 라디오 — 역량 문항 카드.
    await gotoApp(page, SURVEY_PATH);
    const radio = page.getByRole('radio').nth(1);
    await radio.click();
    await expect(radio).toBeChecked();

    // 체크박스 — 복수 선택 카드.
    await gotoApp(page, '/onboarding/books-and-interests');
    const checkbox = page.getByRole('checkbox').first();
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // 텍스트 입력 + 카드 안 버튼 — favorites 카드.
    await page.locator(CARD_NEXT).click();
    const input = page.getByRole('textbox', { name: 'Books your child loves' });
    await input.click();
    await input.fill('Moonbeam');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Moonbeam')).toBeVisible();
  });

  test.describe('터치', () => {
    test.use({ hasTouch: true });

    /** Playwright touchscreen 에는 끌기가 없다 — CDP 로 **진짜 터치 입력**을 보낸다. */
    test('★ 버튼 히트 영역 한가운데에서 밀면 스와이프되고, 제자리 탭은 클릭이다', async ({
      page,
    }) => {
      await gotoApp(page, SURVEY_PATH);

      const box = await page.locator('.haru-swipe-deck__card--front').boundingBox();
      if (box === null) throw new Error('card not laid out');
      const start = await cardCounterIndex(page);
      if (start === null) throw new Error('card counter not rendered');

      const cdp = await page.context().newCDPSession(page);
      const startX = box.x + box.width - 10;
      const y = box.y + box.height / 2;

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

      await expectCardIndex(page, start + 1);

      // 제자리 탭은 버튼 클릭이다.
      await page.locator(CARD_NEXT).tap();
      await expectCardIndex(page, start + 2);
    });
  });
});

test.describe('역량 문항 — 제스처 없이 완주한다 (`AC-2-25` · D-9 · WCAG 2.5.1)', () => {
  test('키보드만으로 10문항 전부에 도달해 응답한다', async ({ page }) => {
    const calls = trackApiRequests(page);

    await gotoApp(page, SURVEY_PATH);

    const deck = page.getByRole('group', { name: DECK_LABEL });
    await expect(deck).toBeVisible();

    const nextQuestion = page.getByRole('button', { name: 'Next question' });

    for (let index = 0; index < BASELINE_ITEMS; index += 1) {
      // 스와이프를 쓰지 않는다 — 포커스 + Space 로 응답한다.
      const option = deck.getByRole('radio').nth(index % 6);
      await option.focus();
      await page.keyboard.press('Space');
      await expect(option).toBeChecked();

      if (index < BASELINE_ITEMS - 1) {
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

  test('비채점 옵션이 별도 안내와 함께 6번째로 놓인다 (C13-08)', async ({ page }) => {
    await gotoApp(page, SURVEY_PATH);

    const deck = page.getByRole('group', { name: DECK_LABEL });
    await expect(deck.getByRole('radio')).toHaveCount(6);
    await expect(page.getByText("This one isn't scored.")).toBeVisible();

    // 비채점 응답도 1~5 와 똑같이 선택된다 (결측이지 낮은 점수가 아니다 — C-8).
    const notObserved = deck.getByRole('radio').nth(5);
    await notObserved.focus();
    await page.keyboard.press('Space');
    await expect(notObserved).toBeChecked();
  });
});

test.describe('좋아하는 책 — 검색 없음 (`§11.13`)', () => {
  test('검색 입력이 없고 제목 직접 입력으로 담는다', async ({ page }) => {
    await gotoApp(page, '/onboarding/books-and-interests');

    await expect(page.getByRole('group', { name: DECK_LABEL })).toBeVisible();
    // Trial 에는 Q5 카탈로그가 없으므로 Q3 다음이 좋아하는 책 카드다.
    await page.getByRole('button', { name: 'Next question' }).click();

    await expect(
      page.getByRole('heading', { level: 2, name: 'Books your child loves' }),
    ).toBeVisible();
    await expect(page.locator('input[type="search"]')).toHaveCount(0);

    const input = page.getByRole('textbox', { name: 'Books your child loves' });
    await input.fill('Moonbeam');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByRole('list', { name: 'Books you picked' })).toContainText('Moonbeam');
  });
});

/**
 * `QA-2-001` 회귀 방지 — 덱 **안**에서도 마우스·터치가 키보드와 똑같이 동작해야 한다.
 *
 * 원인은 `pointerdown` 시점의 `setPointerCapture` 였고, 캡처가 걸리면 후속 `mouseup`·`click`
 * 의 target 이 카드 컨테이너로 바뀌어 카드 안 컨트롤이 입력을 받지 못했다.
 * 세 입력 경로를 모두 여기서 고정한다. **`SwipeDeck.tsx` 는 이번 재구성에서 수정하지 않았다.**
 */
test.describe('세 입력 경로 — 마우스 · 키보드 · 터치 (QA-2-001)', () => {
  test('마우스 클릭으로 덱 안 라디오를 선택하고 다시 해제한다', async ({ page }) => {
    await gotoApp(page, SURVEY_PATH);

    const deck = page.getByRole('group', { name: DECK_LABEL });
    const option = deck.getByRole('radio').nth(2);

    await option.click();
    await expect(option).toBeChecked();

    // 카드 우상단 `179:1804` — 이것도 카드 **안**이라 같은 결함의 영향을 받았다.
    await page.getByRole('button', { name: 'Clear this answer' }).click();
    await expect(deck.getByRole('radio').nth(2)).not.toBeChecked();
  });

  test('대조군 — 덱 밖 컨트롤(프로필 입력)도 마우스로 동작한다', async ({ page }) => {
    await gotoApp(page, '/onboarding/child-info');

    // 기본 선택이 아닌 칩을 쓴다 — English 는 기본 선택이라 클릭하면 **해제**된다.
    const chip = page.getByRole('button', { name: 'Korean' });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');

    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  test('마우스로 끌면 제스처는 그대로 동작한다 (클릭 수정이 스와이프를 막지 않는다)', async ({
    page,
  }) => {
    await gotoApp(page, SURVEY_PATH);

    const card = page.locator('.haru-swipe-deck__card--front');
    const box = await card.boundingBox();
    if (box === null) throw new Error('card not laid out');

    /*
      `/onboarding/capability-items` 직접 진입은 **통산 1번 카드가 아니다** — 앞 단계 카드 수만큼
      뒤에서 시작한다 (`R-02` 통산 카운터). 그래서 기대값을 현재 번호에서 파생한다.
    */
    const start = await cardCounterIndex(page);
    if (start === null) throw new Error('card counter not rendered');

    const startX = box.x + box.width - 20;
    const y = box.y + box.height / 2;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    // 한 번에 점프시키지 않는다 — 실제 끌기처럼 임계를 지나며 여러 번 움직인다.
    for (let step = 1; step <= 10; step += 1) {
      await page.mouse.move(startX - step * 25, y);
    }
    await page.mouse.up();

    await expectCardIndex(page, start + 1);
  });

  test.describe('터치', () => {
    test.use({ hasTouch: true });

    test('탭으로 덱 안 라디오를 선택한다', async ({ page }) => {
      await gotoApp(page, SURVEY_PATH);

      const deck = page.getByRole('group', { name: DECK_LABEL });
      await deck.locator('label').nth(1).tap();

      await expect(deck.getByRole('radio').nth(1)).toBeChecked();
    });

    test('손가락으로 밀면 다음 카드로 간다', async ({ page }) => {
      await gotoApp(page, SURVEY_PATH);

      const card = page.locator('.haru-swipe-deck__card--front');
      const box = await card.boundingBox();
      if (box === null) throw new Error('card not laid out');

      const start = await cardCounterIndex(page);
      if (start === null) throw new Error('card counter not rendered');

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

      await expectCardIndex(page, start + 1);
    });
  });
});

test.describe('전 카드 완주 — 마지막 카드에만 제출 CTA 가 있다', () => {
  test('첫 카드부터 끝까지 가면 제출 CTA 가 나온다', async ({ page }) => {
    await gotoApp(page, FIRST_CARD_PATH);

    await answerAllCards(page);

    await expect(page).toHaveURL(new RegExp(`${SURVEY_PATH}$`));
    await expect(page.getByRole('button', { name: 'Save profile' })).toBeVisible();
  });
});

/**
 * `QA-2R-009` 회귀 — Trial 에서 고른 **언어 환경**이 가입을 지나도 남아 있어야 한다.
 *
 * 가입 화면에는 언어 입력이 없다. 그 화면의 로컬 저장이 언어를 지우면, 동의 직후 Guard 가
 * 저장된 단계로 되돌리므로(`§11.19` 7-2) 사용자는 `About your child` 를 다시 지나지 않고
 * 언어가 빠진 채 제출된다 — 알아챌 방법이 없다. 그래서 **브라우저 실측**으로 고정한다.
 */
test.describe('Trial → 가입 — 언어 환경 보존 (`QA-2R-009`)', () => {
  const DRAFT_KEY = 'haru.onboarding.draft.v1';

  async function childInfoDraft(page: Page): Promise<Record<string, unknown> | undefined> {
    const raw = await page.evaluate(
      (key: string) => globalThis.localStorage.getItem(key),
      DRAFT_KEY,
    );
    const parsed: { answers?: { child_info?: Record<string, unknown> } } =
      raw === null ? {} : JSON.parse(raw);

    return parsed.answers?.child_info;
  }

  async function signUp(page: Page): Promise<void> {
    await gotoApp(page, '/auth/sign-up?scenario=me:consent-missing');
    await page.getByLabel('Your name').fill('Sam Rivera');
    await page.getByLabel('Email').fill('sam@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/auth\/consent$/);
  }

  test('고른 언어가 가입을 지나도 draft 에 남아 있다', async ({ page }) => {
    await gotoApp(page, '/onboarding/start?scenario=me:consent-missing');
    await page.getByRole('button', { name: 'Start the questions' }).click();
    await fillChildInfo(page);
    // 기본 선택(English) 위에 **직접 고른** 값을 얹는다 — 기본값이 되살아난 것과 구분된다.
    await page.getByRole('button', { name: 'Korean' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/onboarding$/);

    expect((await childInfoDraft(page))?.['languageEnvironment']).toStrictEqual([
      'english',
      'korean',
    ]);

    await signUp(page);

    const after = await childInfoDraft(page);
    expect(after?.['languageEnvironment']).toStrictEqual(['english', 'korean']);
    // 다른 필드도 함께 살아 있어야 한다 (병합이 아니라 덮어쓰기가 되지 않았는지).
    expect(after?.['gender']).toBe('girl');
  });

  /**
   * 사용자 결정 2026-10-04 — 언어는 **선택 항목**이고 영어가 기본 선택이다.
   * 해제는 가능해야 하고, 해제 상태가 저장소에서 영어로 되살아나면 안 된다.
   */
  test('English 가 기본 선택이고, 전부 해제해도 전진이 막히지 않는다', async ({ page }) => {
    await gotoApp(page, '/onboarding/start?scenario=me:consent-missing');
    await page.getByRole('button', { name: 'Start the questions' }).click();

    const english = page.getByRole('button', { name: 'English' });
    await expect(english).toHaveAttribute('aria-pressed', 'true');

    await page.getByLabel('First name').fill('Yuna');
    await english.click();
    await expect(english).toHaveAttribute('aria-pressed', 'false');

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/onboarding$/);

    // 해제 상태는 **빈 배열로** 남는다 (키를 지우면 기본값이 되살아난다).
    await expect
      .poll(async () => (await childInfoDraft(page))?.['languageEnvironment'])
      .toStrictEqual([]);

    await signUp(page);

    // 가입 저장이 해제 상태를 영어로 되돌리지 않는다 (`QA-2R-009` 의 반대 방향).
    expect((await childInfoDraft(page))?.['languageEnvironment']).toStrictEqual([]);
  });
});
