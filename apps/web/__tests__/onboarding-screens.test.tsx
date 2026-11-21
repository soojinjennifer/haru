/**
 * 온보딩 — 소개 2화면 · `About your child` · 카드 4단계 · 제출 · **Privacy 불변식**.
 *
 * 재구성 Design Spec (`stage-2-onboarding-rework-design-spec.md`) 과 신규 AC
 * `AC-2R-01`~`AC-2R-15` 기준이다. 유지되는 기존 AC: `AC-2-20` · `AC-2-24` · `AC-2-25` ·
 * `AC-2-27`~`AC-2-30`.
 *
 * ── 카드 수는 **파생값**이다 (`R-02` · `AC-2R-09`) ──
 * Trial 구간은 서버 요청이 0건이라 Q5 책 카탈로그를 받아올 수 없어 카드가 하나 적다.
 * 그래서 이 테스트도 숫자를 적지 않고 `surveyCards()` 로 센다.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CapabilitySchema,
  FAVORITE_BOOKS_MAX,
  OnboardingDraftSchema,
  type OnboardingDraftAnswers,
} from '@haru/contracts';

import { AppRoutes } from '../src/app/router';
import {
  CARD_STEPS,
  DEFAULT_ONBOARDING_INSTRUMENT,
  onboardingCopy,
  slugFromStep,
  surveyCards,
} from '../src/features/onboarding-survey';
import { MOCK_REQUIRED_CONSENT_TYPES } from '../src/mocks/fixtures/consent';
import { MOCK_BOOKS } from '../src/mocks/fixtures/books';
import { MOCK_CHILD_FIRST_NAME } from '../src/mocks/fixtures/me';
import {
  createOnboardingInstrumentFixture,
  createChildInfoDraftAnswers,
} from '../src/mocks/fixtures/onboarding';
import { findChildDataKeys } from '../src/mocks/request-log';
import { ONBOARDING_DRAFT_STORAGE_KEY } from '../src/shared/lib/onboarding-draft';
import { ROUTES, onboardingStepPath } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;

/** Trial 구간 카드 수 (Q5 카탈로그가 없어 하나 적다) — **파생값**이다 (`AC-2R-09`). */
const TRIAL_CARD_TOTAL = surveyCards(DEFAULT_ONBOARDING_INSTRUMENT, CARD_STEPS).length;

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

async function expectPath(expected: string): Promise<void> {
  await waitFor(() => {
    expect(screen.getByTestId('pathname').textContent).toBe(expected);
  });
}

/** 앱을 띄운다. `signIn` 이 false 면 **미인증 = Trial** 이다 (C-12). */
async function renderApp(options: {
  path: string;
  scenarios?: readonly string[];
  signIn?: boolean;
  grantConsent?: boolean;
  draft?: OnboardingDraftAnswers;
}): Promise<Harness> {
  if (options.draft !== undefined) seedDraft(options.draft);

  const harness = createHarness({
    initialEntries: [options.path],
    scenarios: options.scenarios ?? [],
  });

  if (options.signIn === true) {
    await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  }
  if (options.grantConsent === true) {
    harness.bundle.consentState.grant(MOCK_REQUIRED_CONSENT_TYPES);
  }

  const Wrapper = harness.wrapper;

  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  // 미인증(Trial)은 Guard 가 렌더 안에서 바로 판정한다 — 비동기 단계가 아니므로 로그인한 경우만 기다린다.
  if (options.signIn === true) await waitForGuard();

  return harness;
}

/**
 * `QA-4B-006` · `D4-153` — 첫 화면을 기본 1000ms 창 하나로 기다리지 않는다. 진입 직후 Route Guard 가 `me`
 * 조회 동안 Spinner 를 그리고, 판정이 끝나야 화면이 마운트된다(+ 화면 query). 단계마다 기본 창을 따로 준다:
 * ① 여기 = Guard 판정 종료 ② 각 테스트의 원래 대기. 단언은 그대로이고 timeout 값은 바꾸지 않는다.
 */
async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(screen.queryByRole('status', { name: appCopy.guard.loadingLabel })).toBeNull();
  });
}

function readStoredDraft(): unknown {
  const raw = globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

/** 기기에 draft 를 심는다 (가입 화면에서 받아 둔 아이 정보를 재현 — `R-01`). */
function seedDraft(answers: OnboardingDraftAnswers): void {
  globalThis.localStorage.setItem(
    ONBOARDING_DRAFT_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      instrument: {
        code: DEFAULT_ONBOARDING_INSTRUMENT.code,
        version: DEFAULT_ONBOARDING_INSTRUMENT.version,
      },
      currentStep: 'child_info',
      answers,
      updatedAt: new Date().toISOString(),
    }),
  );
}

/** `SelectTrigger` — 트리거를 열고 옵션을 고른다. */
async function chooseOption(triggerName: RegExp, optionName: string): Promise<void> {
  fireEvent.click(await screen.findByRole('button', { name: triggerName }));
  fireEvent.click(await screen.findByRole('radio', { name: optionName }));
}

function nextCardButton(): HTMLElement {
  return screen.getByRole('button', { name: onboardingCopy.survey.nextQuestion });
}

function optionLabel(
  questionId: 'reading_together.story_comfort' | 'reading_together.read_aloud_behavior',
  code: string,
): string {
  const table: Record<string, string> = onboardingCopy.choiceOptions[questionId];
  return table[code] ?? '';
}

beforeEach(() => {
  globalThis.localStorage.clear();
});

describe('흐름과 경로 (`AC-2R-01` · `AC-2R-11`)', () => {
  it('`/onboarding/start` 는 프로필 입력 소개이고 CTA 가 `child-info` 로 보낸다', async () => {
    await renderApp({ path: ROUTES.onboarding.start });

    expect(await screen.findByText(onboardingCopy.intro.profile.title)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.intro.profile.cta }));

    await expectPath(onboardingStepPath('child-info'));
  });

  it('`/onboarding` 은 설문 소개이고 CTA 가 첫 카드 단계로 보낸다', async () => {
    await renderApp({ path: ROUTES.onboarding.intro });

    expect(await screen.findByText(onboardingCopy.intro.survey.body)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.intro.survey.cta }));

    await expectPath(onboardingStepPath('reading-together'));
  });

  it('소개 화면의 소요 시간·카드 수가 instrument 에서 온다 (`AC-2R-09`)', async () => {
    await renderApp({ path: ROUTES.onboarding.intro });

    const { surveyMinutes } = DEFAULT_ONBOARDING_INSTRUMENT.estimates;
    expect(
      await screen.findByText(
        onboardingCopy.intro.survey.duration(surveyMinutes, TRIAL_CARD_TOTAL),
      ),
    ).toBeDefined();
  });

  it('프로필 입력을 마치면 설문 소개로 간다 (카드로 바로 들어가지 않는다)', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });
    await fillChildInfo();

    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.wizard.next }));
    await expectPath(ROUTES.onboarding.intro);
  });

  it('네 카드 단계 slug 가 모두 열리고 제목이 바뀐다 (`AC-2R-01`)', async () => {
    for (const step of CARD_STEPS) {
      globalThis.localStorage.clear();
      document.body.innerHTML = '';

      await renderApp({ path: onboardingStepPath(slugFromStep(step)) });

      const titles: Record<string, string> = onboardingCopy.steps;
      expect(await screen.findByText(titles[step] ?? '')).toBeDefined();
    }
  });

  it('`Capability` 로 표시한다 — 내부 단계 이름을 노출하지 않는다 (`R-13`)', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    expect(await screen.findByText('Capability')).toBeDefined();
    // 내부 단계 이름이 화면 제목으로 노출되지 않는다 (`AD-S2R-09`).
    expect(screen.queryByText('Capability-items')).toBeNull();
    expect(screen.queryByText('What you have noticed')).toBeNull();
  });

  it('알 수 없는 slug 는 첫 단계로 되돌린다', async () => {
    await renderApp({ path: '/onboarding/not-a-step' });

    await expectPath(onboardingStepPath('child-info'));
  });
});

/** 필수 항목을 채운다 (이름 · 생년월 · 언어). */
async function fillChildInfo(firstName = 'Nova'): Promise<void> {
  fireEvent.change(await screen.findByLabelText(new RegExp(onboardingCopy.childInfo.firstName)), {
    target: { value: firstName },
  });
  await chooseOption(new RegExp(onboardingCopy.childInfo.birthYear), '2021');
  await chooseOption(new RegExp(onboardingCopy.childInfo.birthMonth), '04');
  fireEvent.click(screen.getByRole('button', { name: onboardingCopy.languageOptions.english }));
}

describe('`About your child` — 가입에서 받은 값을 표시한다 (`R-01` · `R-08`)', () => {
  it('draft 값이 있으면 표시 전용 행으로 보이고 재입력을 요구하지 않는다 (`AC-2R-06`)', async () => {
    await renderApp({
      path: onboardingStepPath('child-info'),
      draft: { child_info: createChildInfoDraftAnswers() },
    });

    // 표시 전용 행은 `<button>` 이다 — 눌리면 편집이라는 사실을 형태로 전한다 (§4.3 신호 ③).
    // 서버 draft fixture 이름 = Mock 아이 이름 (`OBS-5-7` 정리 — Stage 8 `S8-A`)
    const row = await screen.findByRole('button', { name: new RegExp(MOCK_CHILD_FIRST_NAME) });
    expect(row.tagName).toBe('BUTTON');
    // `readonly` input 을 쓰지 않는다 (§4.3 접근성).
    expect(document.querySelectorAll('input[readonly]')).toHaveLength(0);
    expect(screen.queryByLabelText(new RegExp(onboardingCopy.childInfo.firstName))).toBeNull();
  });

  it('행을 누르면 인라인 편집으로 들어간다 — 데드락이 없다 (`AC-2R-07`)', async () => {
    await renderApp({
      path: onboardingStepPath('child-info'),
      draft: { child_info: createChildInfoDraftAnswers() },
    });

    fireEvent.click(await screen.findByRole('button', { name: new RegExp(MOCK_CHILD_FIRST_NAME) }));

    const input = await screen.findByLabelText(new RegExp(onboardingCopy.childInfo.firstName));
    expect((input as HTMLInputElement).value).toBe(MOCK_CHILD_FIRST_NAME);
  });

  it('섹션 헤더 연필로도 편집에 들어가고 Done 으로 돌아온다', async () => {
    await renderApp({
      path: onboardingStepPath('child-info'),
      draft: { child_info: createChildInfoDraftAnswers() },
    });

    fireEvent.click(
      await screen.findByRole('button', { name: onboardingCopy.childInfo.editChild }),
    );
    expect(
      await screen.findByLabelText(new RegExp(onboardingCopy.childInfo.firstName)),
    ).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.childInfo.editDone }));
    await waitFor(() => {
      expect(screen.queryByLabelText(new RegExp(onboardingCopy.childInfo.firstName))).toBeNull();
    });
  });

  it('draft 에 값이 없으면 처음부터 편집 모드이고 오류를 띄우지 않는다 (`missing-prefill`)', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });

    expect(
      await screen.findByLabelText(new RegExp(onboardingCopy.childInfo.firstName)),
    ).toBeDefined();
    expect(screen.queryByText(onboardingCopy.childInfo.firstNameRequired)).toBeNull();
  });

  it('나이 Tag 가 입력에서 파생되고 접근성 이름이 축약형이 아니다 (`R-09`)', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });
    await fillChildInfo();

    expect(await screen.findByText(/^\d+yr \d+mo$/)).toBeDefined();
    expect(screen.getByText(/\d+ years? \d+ months?/)).toBeDefined();
  });

  it('필수 항목이 비어 있으면 넘어가지 않고 사유를 보여준다', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });

    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.wizard.next }));

    expect(await screen.findByText(onboardingCopy.childInfo.firstNameRequired)).toBeDefined();
    await expectPath(onboardingStepPath('child-info'));
  });

  it('Trial 안내는 미로그인일 때만 나온다 (`R-07`)', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });
    expect(await screen.findByText(onboardingCopy.notices.trialTitle)).toBeDefined();

    document.body.innerHTML = '';
    globalThis.localStorage.clear();

    await renderApp({
      path: onboardingStepPath('child-info'),
      scenarios: ['me:onboarding-incomplete'],
      signIn: true,
      grantConsent: true,
    });

    await waitFor(() => {
      expect(screen.queryByText(onboardingCopy.notices.trialTitle)).toBeNull();
    });
  });

  it('프로필 입력 화면에는 ProgressBar 를 그리지 않는다 (Figma `248:1159`)', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });
    await screen.findByLabelText(new RegExp(onboardingCopy.childInfo.firstName));

    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});

describe('카드 단계 — 한 카드 = 한 문항 (`AC-2R-02` · `AC-2R-03`)', () => {
  it('덱이 한 번에 문항 하나만 그린다', async () => {
    await renderApp({ path: onboardingStepPath('reading-together') });

    await screen.findByRole('group', { name: onboardingCopy.survey.deckLabel });
    // 카드 제목(h2)이 문항이다. `RadioGroup` legend 는 같은 문구를 스크린리더에만 남긴다.
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: onboardingCopy.questions['reading_together.story_comfort'].prompt,
      }),
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 2,
        name: onboardingCopy.questions['reading_together.read_aloud_behavior'].prompt,
      }),
    ).toBeNull();
  });

  it('카운터가 **전체 통산**이고 단계가 바뀌어도 끊기지 않는다 (`AC-2R-08`)', async () => {
    await renderApp({ path: onboardingStepPath('reading-together') });

    expect(
      await screen.findAllByText(onboardingCopy.survey.counter(1, TRIAL_CARD_TOTAL)),
    ).toBeDefined();

    // Q1 은 필수이므로 먼저 답한다 (키보드 선택 → 자동 전진 없음).
    const option = screen.getByRole('radio', {
      name: optionLabel('reading_together.story_comfort', 'quiet_gentle'),
    });
    fireEvent.keyDown(option, { key: ' ' });
    fireEvent.click(option);

    fireEvent.click(nextCardButton());
    await waitFor(() => {
      expect(
        screen.getAllByText(onboardingCopy.survey.counter(2, TRIAL_CARD_TOTAL))[0],
      ).toBeDefined();
    });

    document.body.innerHTML = '';
    await renderApp({ path: onboardingStepPath('growing-together') });

    // Reading together 2장 + Books and interests 2장(Trial, Q5 없음) 다음이 Growing together 다.
    expect(
      await screen.findAllByText(
        onboardingCopy.survey.counter(TRIAL_CARD_TOTAL - 10, TRIAL_CARD_TOTAL),
      ),
    ).toBeDefined();
  });

  it('카드 단계에는 하단 CTA 가 없다 — 마지막 카드에만 제출 CTA 다 (`S2R-OPEN-4`)', async () => {
    await renderApp({ path: onboardingStepPath('reading-together') });

    await screen.findByRole('group', { name: onboardingCopy.survey.deckLabel });
    expect(screen.queryByRole('button', { name: onboardingCopy.wizard.next })).toBeNull();
    expect(screen.queryByRole('button', { name: onboardingCopy.wizard.saveProfile })).toBeNull();
    expect(screen.queryByRole('button', { name: onboardingCopy.wizard.finish })).toBeNull();
  });

  it('필수 미응답이면 전진 어포던스가 `aria-disabled` 이고 카드 안에 사유가 있다 (§3.2)', async () => {
    await renderApp({ path: onboardingStepPath('reading-together') });

    const next = await screen.findByRole('button', {
      name: onboardingCopy.survey.nextQuestion,
    });
    expect(next.getAttribute('aria-disabled')).toBe('true');
    expect((next as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByText(onboardingCopy.wizard.requiredBlockedReason)).toBeDefined();

    // 눌러도 넘어가지 않는다.
    fireEvent.click(next);
    expect(
      screen.getAllByText(onboardingCopy.survey.counter(1, TRIAL_CARD_TOTAL))[0],
    ).toBeDefined();
  });

  it('선택 문항(Q3)은 응답 없이도 전진한다', async () => {
    await renderApp({ path: onboardingStepPath('books-and-interests') });

    const next = await screen.findByRole('button', {
      name: onboardingCopy.survey.nextQuestion,
    });
    expect(next.getAttribute('aria-disabled')).toBeNull();
  });

  it('복수 선택 문항이 Chip 이 아니라 체크박스 행이다 (§3.6)', async () => {
    await renderApp({ path: onboardingStepPath('growing-together') });

    const labels = CapabilitySchema.options.map(
      (code) => onboardingCopy.choiceOptions['growing_together.growth_goals'][code],
    );

    for (const label of labels) {
      expect(await screen.findByRole('checkbox', { name: label })).toBeDefined();
    }
  });

  it('`role="group"` 에는 `aria-required` 를 두지 않는다 (§15)', async () => {
    await renderApp({ path: onboardingStepPath('growing-together') });

    await screen.findByRole('group', { name: onboardingCopy.survey.deckLabel });
    expect(
      await screen.findByText(
        onboardingCopy.questions['growing_together.growth_goals'].description ?? '',
      ),
    ).toBeDefined();
    expect(document.querySelectorAll('[aria-required]')).toHaveLength(0);
  });

  it('마지막 카드에서만 제출 CTA 를 그린다', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    const items = DEFAULT_ONBOARDING_INSTRUMENT.survey.items;
    for (let index = 0; index < items.length - 1; index += 1) {
      expect(screen.queryByRole('button', { name: onboardingCopy.wizard.saveProfile })).toBeNull();
      fireEvent.click(nextCardButton());
      await waitFor(() => {
        expect(
          screen.getByText(
            onboardingCopy.survey.counter(
              TRIAL_CARD_TOTAL - items.length + index + 2,
              TRIAL_CARD_TOTAL,
            ),
          ),
        ).toBeDefined();
      });
    }

    expect(
      await screen.findByRole('button', { name: onboardingCopy.wizard.saveProfile }),
    ).toBeDefined();
  });
});

describe('자동 전진 (`S2R-OPEN-3` · §14)', () => {
  it('단일 선택을 포인터로 고르면 다음 카드로 넘어간다', async () => {
    await renderApp({ path: onboardingStepPath('reading-together') });

    const option = await screen.findByRole('radio', {
      name: optionLabel('reading_together.story_comfort', 'quiet_gentle'),
    });
    fireEvent.pointerDown(option);
    fireEvent.click(option);

    await waitFor(
      () => {
        expect(
          screen.getAllByText(onboardingCopy.survey.counter(2, TRIAL_CARD_TOTAL))[0],
        ).toBeDefined();
      },
      { timeout: 2000 },
    );
  });

  it('키보드로 고르면 자동 전진하지 않는다 (§14.3)', async () => {
    await renderApp({ path: onboardingStepPath('reading-together') });

    const option = await screen.findByRole('radio', {
      name: optionLabel('reading_together.story_comfort', 'quiet_gentle'),
    });
    fireEvent.keyDown(option, { key: ' ' });
    fireEvent.click(option);

    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(
      screen.getAllByText(onboardingCopy.survey.counter(1, TRIAL_CARD_TOTAL))[0],
    ).toBeDefined();
  });

  it('★ 돌아온 카드에서는 자동 전진하지 않는다 — 오선택을 고칠 수 있다 (§14.2-3)', async () => {
    await renderApp({ path: onboardingStepPath('reading-together') });

    const first = await screen.findByRole('radio', {
      name: optionLabel('reading_together.story_comfort', 'quiet_gentle'),
    });
    fireEvent.pointerDown(first);
    fireEvent.click(first);

    await waitFor(
      () => {
        expect(
          screen.getAllByText(onboardingCopy.survey.counter(2, TRIAL_CARD_TOTAL))[0],
        ).toBeDefined();
      },
      { timeout: 2000 },
    );

    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.survey.prevQuestion }));
    await waitFor(() => {
      expect(
        screen.getAllByText(onboardingCopy.survey.counter(1, TRIAL_CARD_TOTAL))[0],
      ).toBeDefined();
    });

    const corrected = screen.getByRole('radio', {
      name: optionLabel('reading_together.story_comfort', 'wild_ride'),
    });
    fireEvent.pointerDown(corrected);
    fireEvent.click(corrected);

    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(
      screen.getAllByText(onboardingCopy.survey.counter(1, TRIAL_CARD_TOTAL))[0],
    ).toBeDefined();
    expect((corrected as HTMLInputElement).checked).toBe(true);
  });

  it('해제는 자동 전진을 유발하지 않는다 (§14.2-4)', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    const scale = DEFAULT_ONBOARDING_INSTRUMENT.survey.scaleLabels[0];
    if (scale === undefined) throw new Error('missing scale');

    const option = await screen.findByRole('radio', { name: scale.label });
    fireEvent.keyDown(option, { key: ' ' });
    fireEvent.click(option);

    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.survey.clearAnswer }));

    await new Promise((resolve) => setTimeout(resolve, 600));
    await waitFor(() => {
      expect((screen.getByRole('radio', { name: scale.label }) as HTMLInputElement).checked).toBe(
        false,
      );
    });
  });
});

describe('Q5 — 이미 잘 아는 책 (`AC-2R-15` · `§11.11`)', () => {
  it('제목 체크박스 목록이고 제목이 fixture 에서 온다', async () => {
    await renderApp({
      path: onboardingStepPath('books-and-interests'),
      scenarios: ['me:onboarding-incomplete'],
      signIn: true,
      grantConsent: true,
    });

    // 첫 카드는 Q3 — 다음 카드가 Q5 다.
    await screen.findByRole('group', { name: onboardingCopy.survey.deckLabel });
    fireEvent.click(nextCardButton());

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: onboardingCopy.questions['books_and_interests.owned_books'].prompt,
      }),
    ).toBeDefined();

    for (const book of MOCK_BOOKS) {
      expect(screen.getByRole('checkbox', { name: book.title })).toBeDefined();
    }
    // 저자는 표시하지 않는다 (§6.1).
    expect(screen.queryByText(MOCK_BOOKS[0]?.author ?? '')).toBeNull();
  });

  it('카탈로그가 비면 카드가 사라지고 카드 수가 줄어든다 (`owned-books-empty`)', async () => {
    await renderApp({
      path: onboardingStepPath('books-and-interests'),
      scenarios: ['me:onboarding-incomplete', 'onboarding:owned-books-empty'],
      signIn: true,
      grantConsent: true,
    });

    await screen.findByRole('group', { name: onboardingCopy.survey.deckLabel });
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', {
          level: 2,
          name: onboardingCopy.questions['books_and_interests.owned_books'].prompt,
        }),
      ).toBeNull();
    });
  });
});

describe('좋아하는 책 — 검색 없음 (`§11.13`)', () => {
  async function openFavoritesCard(): Promise<void> {
    await renderApp({ path: onboardingStepPath('books-and-interests') });
    await screen.findByRole('group', { name: onboardingCopy.survey.deckLabel });
    // Trial 에는 Q5 가 없으므로 Q3 다음이 좋아하는 책 카드다.
    fireEvent.click(nextCardButton());
    await screen.findByRole('heading', {
      level: 2,
      name: onboardingCopy.books.favoritesSection,
    });
  }

  it('검색 입력·결과 목록·빈 상태가 없다', async () => {
    await openFavoritesCard();

    expect(document.querySelectorAll('input[type="search"]')).toHaveLength(0);
    expect(screen.queryByText('Goodnight Moon')).toBeNull();
  });

  it('제목을 직접 입력해 목록에 담는다', async () => {
    await openFavoritesCard();

    const input = screen.getByRole('textbox', { name: onboardingCopy.books.favoritesSection });
    fireEvent.change(input, { target: { value: 'Moonbeam' } });
    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.books.addAction }));

    const picked = await screen.findByRole('list', { name: onboardingCopy.books.selectedLabel });
    expect(within(picked).getByText('Moonbeam')).toBeDefined();
  });

  it('상한에 도달하면 **거절**하고 입력 필드를 숨기지 않는다 (`§11.15`)', async () => {
    await openFavoritesCard();

    const input = screen.getByRole('textbox', { name: onboardingCopy.books.favoritesSection });
    for (let index = 0; index < FAVORITE_BOOKS_MAX; index += 1) {
      fireEvent.change(input, { target: { value: `Book ${String(index)}` } });
      fireEvent.click(screen.getByRole('button', { name: onboardingCopy.books.addAction }));
    }

    expect(
      await screen.findByText(onboardingCopy.books.limitReached(FAVORITE_BOOKS_MAX)),
    ).toBeDefined();
    const field = screen.getByRole('textbox', { name: onboardingCopy.books.favoritesSection });
    expect((field as HTMLInputElement).disabled).toBe(true);
  });
});

describe('문항 문구는 instrument 가 소유한다 (결정 D-A ②③)', () => {
  it('서버가 내려준 문구가 copy 모듈보다 우선한다', async () => {
    await renderApp({
      path: onboardingStepPath('capability-items'),
      scenarios: ['me:onboarding-incomplete'],
      signIn: true,
      grantConsent: true,
    });

    const first = createOnboardingInstrumentFixture().survey.items[0];
    if (first === undefined) throw new Error('missing item');

    expect(await screen.findByRole('heading', { level: 2, name: first.prompt })).toBeDefined();
  });

  it('`instrument-v2` 로 문항이 줄면 카드 수도 따라 줄어든다 (`AC-2R-09`)', async () => {
    const harness = await renderApp({
      path: onboardingStepPath('reading-together'),
      scenarios: ['me:onboarding-incomplete', 'onboarding:instrument-v2'],
      signIn: true,
      grantConsent: true,
    });

    const reduced = createOnboardingInstrumentFixture({
      version: '2.1.0',
      questionIds: ['reading_together.story_comfort', 'growing_together.growth_goals'],
      ownedBookOptions: [],
    });
    const total = surveyCards(reduced, CARD_STEPS).length;

    expect(await screen.findAllByText(onboardingCopy.survey.counter(1, total))).toBeDefined();
    expect(harness.bundle.requestLog.entries().length).toBeGreaterThan(0);
  });
});

describe('역량 문항 — 비채점 옵션 (C-8 · C13-08)', () => {
  it('척도 6개이고 6번째에 별도 안내가 붙는다', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    await screen.findByRole('group', { name: onboardingCopy.survey.deckLabel });
    expect(screen.getAllByRole('radio')).toHaveLength(6);
    expect(screen.getByText(onboardingCopy.survey.notScoredCaption)).toBeDefined();
  });

  it('제스처 없이 버튼만으로 모든 문항에 도달한다 (`AC-2-25` · D-9)', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    const items = DEFAULT_ONBOARDING_INSTRUMENT.survey.items;
    for (const [index, item] of items.entries()) {
      expect(await screen.findByRole('heading', { level: 2, name: item.prompt })).toBeDefined();

      const scale = DEFAULT_ONBOARDING_INSTRUMENT.survey.scaleLabels[index % 6];
      if (scale === undefined) throw new Error('missing scale');
      const option = screen.getByRole('radio', { name: scale.label });
      fireEvent.keyDown(option, { key: ' ' });
      fireEvent.click(option);

      if (index < items.length - 1) fireEvent.click(nextCardButton());
    }

    await waitFor(() => {
      expect(screen.queryByText(/question[s]? left\./)).toBeNull();
    });
  });
});

describe('Trial — 가입 전에는 서버 요청이 0건이다 (`AC-2-27` · C-12)', () => {
  it('프로필 입력과 첫 카드 단계를 지나는 동안 요청 로그가 비어 있다', async () => {
    const harness = await renderApp({ path: ROUTES.onboarding.start });

    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.intro.profile.cta }));
    await expectPath(onboardingStepPath('child-info'));

    await fillChildInfo();
    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.wizard.next }));
    await expectPath(ROUTES.onboarding.intro);

    fireEvent.click(await screen.findByRole('button', { name: /Start|Pick up/ }));
    await expectPath(onboardingStepPath('reading-together'));

    expect(harness.bundle.requestLog.entries()).toStrictEqual([]);
    expect(findChildDataKeys(harness.bundle.requestLog.entries())).toStrictEqual([]);
  });

  it('응답은 기기 로컬 draft 에만 남고 schema 를 통과한다', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });

    await fillChildInfo('Nova');
    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.wizard.next }));
    await expectPath(ROUTES.onboarding.intro);

    const stored = readStoredDraft();
    expect(OnboardingDraftSchema.safeParse(stored).success).toBe(true);
    expect(OnboardingDraftSchema.parse(stored).answers.child_info?.firstName).toBe('Nova');
  });

  it('중도 이탈 후 다시 들어오면 저장된 카드 단계로 이어진다 (`AC-2-20`)', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });
    await fillChildInfo();
    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.wizard.next }));
    await expectPath(ROUTES.onboarding.intro);

    document.body.innerHTML = '';

    await renderApp({ path: ROUTES.onboarding.intro });
    fireEvent.click(
      await screen.findByRole('button', { name: onboardingCopy.intro.survey.resume }),
    );

    await expectPath(onboardingStepPath('reading-together'));
  });

  it('마지막 카드의 CTA 가 가입으로 보낸다 (C13-11)', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    const items = DEFAULT_ONBOARDING_INSTRUMENT.survey.items;
    for (let index = 0; index < items.length - 1; index += 1) {
      fireEvent.click(nextCardButton());
    }

    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.wizard.saveProfile }));
    await expectPath(ROUTES.auth.signUp);
  });
});

describe('제출과 착지 (`AC-2R-02` payload · AC-2-28)', () => {
  async function answerDeck(): Promise<void> {
    // 각 카드에서 첫 옵션을 고르고 다음 카드로. 카드 수를 세지 않고 "다음" 이 끝날 때까지 돈다.
    for (let guard = 0; guard < 40; guard += 1) {
      const radios = screen.queryAllByRole('radio');
      const checkboxes = screen.queryAllByRole('checkbox');
      const target = radios[0] ?? checkboxes[0];

      if (target !== undefined) {
        fireEvent.keyDown(target, { key: ' ' });
        fireEvent.click(target);
      }

      const next = screen.queryByRole('button', { name: onboardingCopy.survey.nextQuestion });
      if (next === null || (next as HTMLButtonElement).disabled) return;
      fireEvent.click(next);
      await waitFor(() => {
        expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
      });
    }
  }

  it('인증 상태에서 네 단계를 제출하면 `/onboarding/saved` 로 간다', async () => {
    const harness = await renderApp({
      path: onboardingStepPath('child-info'),
      scenarios: ['me:onboarding-incomplete'],
      signIn: true,
      grantConsent: true,
    });

    await fillChildInfo();
    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.wizard.next }));
    await expectPath(ROUTES.onboarding.intro);

    fireEvent.click(await screen.findByRole('button', { name: /Start|Pick up/ }));
    await expectPath(onboardingStepPath('reading-together'));

    // 카드 흐름은 하나다 — "다음" 이 끝날 때까지 돌면 마지막 카드에 닿는다 (단계 경계를 몰라도 된다).
    for (let round = 0; round < CARD_STEPS.length; round += 1) await answerDeck();
    await expectPath(onboardingStepPath('capability-items'));

    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.wizard.finish }));
    await expectPath(ROUTES.onboarding.saved);

    const submit = harness.bundle.requestLog
      .entries()
      .find((entry) => entry.operation === 'POST /v1/onboarding/submit');
    expect(submit).toBeDefined();

    const payload = submit?.payload as { answers: Record<string, unknown> } | undefined;
    expect(Object.keys(payload?.answers ?? {}).sort()).toStrictEqual([
      'books_and_interests',
      'capability_items',
      'child_info',
      'growing_together',
      'reading_together',
    ]);

    // 제출 성공 후 로컬 draft 가 삭제된다 (D-3 삭제 시점 ①, AC-2-28).
    expect(readStoredDraft()).toBeNull();
  });

  /*
   * 승계 기록 (Stage 6 Plan R-7 · R-8, `D6-1`): Stage 2 에서는 이 CTA 가 Home 으로 직결됐다(AC-2-28).
   * Stage 6 에서 PRD §5.1 ③④ 흐름이 삽입되어 목적지가 프로필 결과(`/onboarding/profile`)로 바뀌었다.
   * 프로필 → 발전 역량 → Home 구간은 `S6-E2` 가 잇는다.
   */
  it('`/onboarding/saved` 의 CTA 는 프로필 결과로 간다 (Stage 6 R-7 — 이전: Home 직결)', async () => {
    await renderApp({
      path: ROUTES.onboarding.saved,
      scenarios: ['me:success'],
      signIn: true,
      grantConsent: true,
    });

    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.saved.cta }));
    await expectPath(ROUTES.onboarding.profile);
  });
});

describe('Privacy — 동의 기록 전 아동 데이터 0건 (`AC-2-13` · `AC-2R-13`)', () => {
  it('동의가 없으면 Guard 가 온보딩 진입을 되돌리고 아동 데이터가 나가지 않는다', async () => {
    const harness = await renderApp({
      path: onboardingStepPath('child-info'),
      scenarios: ['me:consent-missing'],
      signIn: true,
    });

    await expectPath(ROUTES.auth.consent);
    expect(findChildDataKeys(harness.bundle.requestLog.entries())).toStrictEqual([]);
  });
});
