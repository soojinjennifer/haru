/**
 * 온보딩 완주 도우미 — `/onboarding/saved` 는 **인증 + 동의 + 제출 이후**에만 열린다
 * (`resolveGuardDecision` 예외 ③). 세션은 메모리에만 있으므로 `page.goto` 로 바로 갈 수 없고,
 * Trial 흐름 → 가입 → 동의 → 재개 → 제출까지 **같은 SPA 수명 안에서** 이동해야 한다.
 *
 * 재구성(2026-10-03) 이후 흐름:
 * `/onboarding/start` → `child-info` → `/onboarding` → 카드 단계 4개 → `saved`
 *
 * 카드 단계에는 **하단 CTA 가 없다** (`§11.7`). 전진은 TopBar `Next question` 이고
 * 마지막 카드에만 제출 CTA 가 붙는다. 카드 수는 instrument 파생값이라 **세지 않는다**.
 */
import { expect, type Page } from '@playwright/test';

import { gotoApp } from './gallery';

const REQUIRED_CONSENTS = ['Terms of Service', 'Privacy Policy', "Recording your child's voice"];

/** 카드 덱 — 재구성으로 라벨이 단계 공용(`Onboarding questions`)이 되었다. */
export const DECK_LABEL = 'Onboarding questions';

/** SelectTrigger 는 Sheet 안의 RadioGroup 으로 값을 고른다 (§4.1). */
async function pickFromSheet(page: Page, trigger: RegExp, option: string): Promise<void> {
  await page.getByRole('button', { name: trigger }).click();
  await page.getByRole('radio', { name: option, exact: true }).click();
}

/** 앞 카드 안쪽의 통산 카운터(`n / N`). 덱의 `aria-live` 문구와 형식이 달라 섞이지 않는다. */
export function frontCardCounter(page: Page) {
  return page.locator('.haru-swipe-deck__card--front').getByText(/^\d+ \/ \d+$/);
}

/**
 * 현재 카드의 통산 번호. 카드가 아직 자리 잡지 않았으면 `null`.
 *
 * **분모는 구간에 따라 다르다** (Trial 15 / 인증+동의 16 — `§11.19` 7-1). 그래서 분모를
 * 테스트에 적지 않고 분자만 읽는다.
 */
export async function cardCounterIndex(page: Page): Promise<number | null> {
  const text = await frontCardCounter(page)
    .textContent()
    .catch(() => null);
  const match = text === null ? null : /^(\d+) \/ (\d+)$/.exec(text.trim());

  return match?.[1] === undefined ? null : Number(match[1]);
}

/** 카드가 바뀔 때까지 기다린다 — `renderItem` 교체 직후의 셀렉터 경합을 없앤다. */
export async function expectCardIndex(page: Page, expected: number): Promise<void> {
  await expect.poll(() => cardCounterIndex(page), { timeout: 5_000 }).toBe(expected);
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(1);
}

/**
 * 현재 카드에 답하고 다음 카드로 넘어간다. 마지막 카드에 닿으면 멈춘다.
 *
 * **키보드로 선택한다** — 포인터 선택은 단일 선택 카드에서 자동 전진을 유발해(§14.1)
 * 진행 제어가 겹치기 때문이다. 자동 전진 자체는 `onboarding.spec.ts` 가 따로 검증한다.
 *
 * 전진 후에는 **통산 카운터가 1 늘어날 때까지** 기다린다. 카드 교체 직후에
 * `getByRole('radio').first()` 를 잡으면 이전 카드의 컨트롤과 경합한다 (`QA-2R-001` 5번).
 */
export async function answerAllCards(page: Page): Promise<void> {
  const nextCard = page.getByRole('button', { name: 'Next question' });

  for (let guard = 0; guard < 40; guard += 1) {
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(1);
    const before = await cardCounterIndex(page);
    if (before === null) throw new Error('card counter not rendered');

    const radio = page.getByRole('radio').first();
    const checkbox = page.getByRole('checkbox').first();

    if ((await radio.count()) > 0) {
      await radio.focus();
      await page.keyboard.press('Space');
    } else if ((await checkbox.count()) > 0) {
      await checkbox.focus();
      await page.keyboard.press('Space');
    }

    // 전체 마지막 카드에서만 native disabled 다 (그 전에는 단계를 넘긴다).
    if (await nextCard.isDisabled()) return;
    await nextCard.click();
    await expectCardIndex(page, before + 1);
  }

  throw new Error('card deck did not reach the last card');
}

/**
 * 가입 → 동의까지 마쳐 **인증 + 동의 완료** 상태를 만든다 (세션은 메모리에만 있다).
 * 아이 정보 draft 가 기기에 있으면 Guard 가 그 지점으로 되돌린다 (`§11.19` 7-2).
 */
export async function signUpAndConsent(page: Page, extraScenario = ''): Promise<void> {
  const scenario = `?scenario=me:consent-missing${extraScenario}`;
  await gotoApp(page, `/auth/sign-up${scenario}`);

  await page.getByLabel('Your name').fill('Sam Rivera');
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/auth\/consent$/);

  for (const title of REQUIRED_CONSENTS) {
    await page.getByRole('checkbox', { name: new RegExp(title) }).click();
  }
  await page.getByRole('button', { name: 'Continue' }).click();
}

/**
 * 기기에 아이 정보 draft 를 심는다 — 가입 화면에서 받아 둔 상태의 재현 (`R-01`).
 * 앱이 뜨기 전에 넣어야 `About your child` 의 첫 렌더가 **표시 전용 모드**가 된다.
 */
export async function seedChildDraft(page: Page, firstName = 'Yuna'): Promise<void> {
  const birthYear = new Date().getUTCFullYear() - 6;

  await page.addInitScript(
    ([name, year]: [string, number]) => {
      globalThis.localStorage.setItem(
        'haru.onboarding.draft.v1',
        JSON.stringify({
          schemaVersion: 1,
          instrument: { code: 'onboarding_v1_1', version: '2.0.0' },
          currentStep: 'child_info',
          answers: {
            child_info: {
              firstName: name,
              birthYearMonth: `${String(year)}-04`,
              gender: 'girl',
              languageEnvironment: ['english'],
              readingRoutine: 'few_times_a_week',
            },
          },
          updatedAt: new Date().toISOString(),
        }),
      );
    },
    [firstName, birthYear] as [string, number],
  );
}

/**
 * 프로필 입력 화면을 채운다. 생년월은 제출 schema 의 3~9세 범위를 지켜야 한다.
 *
 * **언어는 누르지 않는다** — 선택 항목이고 영어가 기본 선택이기 때문이다
 * (사용자 결정 2026-10-04). 여기서 누르면 오히려 **해제**된다.
 */
export async function fillChildInfo(page: Page, firstName = 'Yuna'): Promise<void> {
  await page.getByLabel('First name').fill(firstName);
  const birthYear = String(new Date().getUTCFullYear() - 6);
  await pickFromSheet(page, /Birth year/, birthYear);
  await pickFromSheet(page, /Birth month/, '04');
  await pickFromSheet(page, /Gender/, 'Girl');
  await expect(page.getByRole('button', { name: 'English' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
}

/** Trial 로 전 과정을 채우고 가입·동의를 거쳐 제출까지 마친다. 끝나면 `/onboarding/saved` 다. */
export async function completeOnboardingToSaved(page: Page): Promise<void> {
  await gotoApp(page, '/onboarding/start?scenario=me:consent-missing');
  await page.getByRole('button', { name: 'Start the questions' }).click();
  await expect(page).toHaveURL(/\/onboarding\/child-info$/);

  await fillChildInfo(page);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByRole('button', { name: /^(Start|Pick up where you left off)$/ }).click();
  await expect(page).toHaveURL(/\/onboarding\/reading-together$/);

  await answerAllCards(page);
  await expect(page).toHaveURL(/\/onboarding\/capability-items$/);

  // Trial 이므로 마지막 CTA 는 제출이 아니라 가입이다 (§2.12).
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page).toHaveURL(/\/auth\/sign-up$/);

  await page.getByLabel('Your name').fill('Sam Rivera');
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/auth\/consent$/);

  for (const title of REQUIRED_CONSENTS) {
    await page.getByRole('checkbox', { name: new RegExp(title) }).click();
  }
  /*
    동의 직후 Guard 가 **저장된 지점으로** 되돌린다 (`§11.19` 7-2) — 기기 draft 가 남아 있으므로
    프로필 안내를 건너뛰고 마지막으로 보던 카드 단계로 간다.
  */
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/onboarding\/capability-items$/);

  /*
    복귀 지점은 그 단계의 **첫 카드**다 (카드 index 는 세션 상태라 draft 에 없다). 제출 CTA 는
    **전체 마지막 카드에만** 있으므로(§3.2) 다시 끝까지 걸어간다. 응답은 이미 저장돼 있다.
  */
  await answerAllCards(page);

  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page).toHaveURL(/\/onboarding\/saved$/);
}
