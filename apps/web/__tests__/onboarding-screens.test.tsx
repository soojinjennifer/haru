/**
 * 온보딩 Step 1~5 · 제출 · `/onboarding/saved` — 화면 동작 · 접근성 · **Privacy 불변식**.
 *
 * AC-2-19 · AC-2-20 · AC-2-21 · AC-2-22 · AC-2-23 · AC-2-24 · AC-2-25 · AC-2-26 ·
 * AC-2-27 · AC-2-28 + 결정 **D-A**(문항 교체 가능 구조) · **D-B**(성장 목표 = 4대 역량) ·
 * **D-9**(제스처 없이 완주).
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CapabilitySchema,
  ONBOARDING_CHOICE_QUESTIONS,
  OnboardingDraftSchema,
  type ChoiceQuestion,
  type OnboardingDraftAnswers,
  type OnboardingInstrument,
} from '@haru/contracts';

import { AppRoutes } from '../src/app/router';
import { ApiClientProvider } from '../src/app/providers/ApiClientProvider';
import { QueryProvider, createQueryClient } from '../src/app/providers/QueryProvider';
import { ChoiceQuestionList, onboardingCopy } from '../src/features/onboarding-survey';
import { DEFAULT_ONBOARDING_INSTRUMENT } from '../src/features/onboarding-survey';
import { MOCK_REQUIRED_CONSENT_TYPES } from '../src/mocks/fixtures/consent';
import { findChildDataKeys } from '../src/mocks/request-log';
import { ONBOARDING_DRAFT_STORAGE_KEY } from '../src/shared/lib/onboarding-draft';
import { ROUTES, onboardingStepPath } from '../src/shared/config/routes';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;

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
}): Promise<Harness> {
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

  // Trial 진입 전에 남아 있을 수 있는 요청(세션 해석 등)을 구분하기 위해 기준점을 만든다.
  return harness;
}

function readStoredDraft(): unknown {
  const raw = globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

/** `SelectTrigger` — 트리거를 열고 옵션을 고른다. */
async function chooseOption(triggerName: RegExp, optionName: string): Promise<void> {
  fireEvent.click(await screen.findByRole('button', { name: triggerName }));
  fireEvent.click(await screen.findByRole('radio', { name: optionName }));
}

/** Step 1 필수 항목을 채운다 (이름 · 생년월 · 언어). */
async function fillChildInfo(firstName = 'Nova'): Promise<void> {
  fireEvent.change(await screen.findByLabelText(new RegExp(onboardingCopy.childInfo.firstName)), {
    target: { value: firstName },
  });
  await chooseOption(new RegExp(onboardingCopy.childInfo.birthYear), '2021');
  await chooseOption(new RegExp(onboardingCopy.childInfo.birthMonth), '04');
  fireEvent.click(screen.getByRole('button', { name: onboardingCopy.languageOptions.english }));
}

function nextButton(): HTMLElement {
  return screen.getByRole('button', { name: onboardingCopy.wizard.next });
}

beforeEach(() => {
  globalThis.localStorage.clear();
});

describe('경로와 진행 (AC-2-19)', () => {
  it('`/onboarding` 소개 → Step 1 로 들어간다', async () => {
    await renderApp({ path: ROUTES.onboarding.intro });

    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.intro.start }));
    await expectPath(onboardingStepPath('child-info'));
  });

  it('5단계 slug 가 모두 열리고 진행 표시가 텍스트로 병기된다', async () => {
    const slugs = ['child-info', 'temperament', 'books', 'goals', 'capability-items'] as const;

    for (const [index, slug] of slugs.entries()) {
      globalThis.localStorage.clear();
      document.body.innerHTML = '';

      await renderApp({ path: onboardingStepPath(slug) });

      expect(await screen.findByText(onboardingCopy.wizard.stepOf(index + 1, 5))).toBeDefined();
    }
  });

  it('알 수 없는 slug 는 첫 단계로 되돌린다', async () => {
    await renderApp({ path: '/onboarding/not-a-step' });

    await expectPath(onboardingStepPath('child-info'));
  });
});

describe('Step 1 — 아이 정보 (AC-2-21 · AC-2-22)', () => {
  it('성·이름 두 칸이며 성은 선택이다 (C-6 · D-1)', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });

    expect(
      await screen.findByLabelText(new RegExp(onboardingCopy.childInfo.firstName)),
    ).toBeDefined();
    expect(screen.getByLabelText(new RegExp(onboardingCopy.childInfo.lastName))).toBeDefined();
  });

  it('성별은 기본 미선택이고 3옵션이다 (C-7)', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });

    const trigger = await screen.findByRole('button', {
      name: new RegExp(onboardingCopy.childInfo.gender),
    });
    expect(trigger.textContent).toContain(onboardingCopy.childInfo.genderPlaceholder);

    fireEvent.click(trigger);
    const sheet = await screen.findByRole('dialog', {
      name: new RegExp(onboardingCopy.childInfo.gender),
    });
    expect(within(sheet).getAllByRole('radio')).toHaveLength(3);
  });

  it('나이 Tag 가 입력에서 파생되어 표시된다', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });
    await fillChildInfo();

    expect(await screen.findByText(/^\d+yr \d+mo$/)).toBeDefined();
  });

  it('필수 항목이 비어 있으면 다음으로 넘어가지 않고 사유를 보여준다', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });

    fireEvent.click(nextButton());

    expect(await screen.findByText(onboardingCopy.childInfo.firstNameRequired)).toBeDefined();
    await expectPath(onboardingStepPath('child-info'));
  });

  it('채우면 Step 2 로 넘어간다', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });
    await fillChildInfo();
    fireEvent.click(nextButton());

    await expectPath(onboardingStepPath('temperament'));
  });
});

describe('Step 2~4 — 문항은 instrument 가 정한다 (결정 D-A ②③)', () => {
  it('Step 2 는 instrument 의 문항 문구를 그대로 그린다', async () => {
    await renderApp({ path: onboardingStepPath('temperament') });

    for (const question of ONBOARDING_CHOICE_QUESTIONS.filter((q) => q.step === 'temperament')) {
      expect(
        await screen.findByText(onboardingCopy.questions[question.questionId].prompt),
      ).toBeDefined();
    }
  });

  it('Step 4 선택지가 4대 역량과 같은 목록이다 (결정 D-B)', async () => {
    await renderApp({ path: onboardingStepPath('goals') });

    const labels = CapabilitySchema.options.map(
      (code) => onboardingCopy.choiceOptions['goals.growth_goals'][code],
    );

    for (const label of labels) {
      expect(await screen.findByRole('button', { name: label })).toBeDefined();
    }
  });

  it('Step 4 에서 목표를 고르면 선택 상태가 표시된다', async () => {
    await renderApp({ path: onboardingStepPath('goals') });

    const label = onboardingCopy.choiceOptions['goals.growth_goals'].emotion_regulation;
    const chip = await screen.findByRole('button', { name: label });
    fireEvent.click(chip);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: label }).getAttribute('aria-pressed')).toBe('true');
    });
  });
});

describe('문항 교체 — 화면 코드를 고치지 않는다 (결정 D-A ②)', () => {
  function renderWithInstrument(
    questions: readonly ChoiceQuestion[],
    answers: OnboardingDraftAnswers = {},
  ) {
    const instrument: OnboardingInstrument = {
      ...DEFAULT_ONBOARDING_INSTRUMENT,
      questions,
    };

    render(
      <MemoryRouter>
        <QueryProvider client={createQueryClient()}>
          <ApiClientProvider clients={createHarness().bundle.clients}>
            <ChoiceQuestionList
              instrument={instrument}
              step="goals"
              answers={answers}
              onChange={() => undefined}
            />
          </ApiClientProvider>
        </QueryProvider>
      </MemoryRouter>,
    );
  }

  const goals = ONBOARDING_CHOICE_QUESTIONS.find(
    (question) => question.questionId === 'goals.growth_goals',
  );

  it('선택지를 줄인 instrument 는 줄어든 대로 그려진다', () => {
    if (goals === undefined) throw new Error('missing question');

    renderWithInstrument([
      {
        ...goals,
        options: [{ code: 'emotion_regulation' }, { code: 'intrinsic_motivation' }],
      },
    ]);

    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('서버가 내려준 문구가 copy 모듈보다 우선한다', () => {
    if (goals === undefined) throw new Error('missing question');

    renderWithInstrument([
      {
        ...goals,
        prompt: 'Server prompt wins',
        options: [
          { code: 'emotion_regulation', label: 'Server label wins' },
          { code: 'intrinsic_motivation' },
        ],
      },
    ]);

    expect(screen.getByText('Server prompt wins')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Server label wins' })).toBeDefined();
  });

  it('문항이 하나도 없는 단계는 아무것도 그리지 않는다', () => {
    renderWithInstrument([]);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

describe('Step 5 — 설문 (AC-2-24 · AC-2-25 · D-9)', () => {
  const instrument = DEFAULT_ONBOARDING_INSTRUMENT;

  it('문항 문구와 척도 라벨이 instrument 값에서 온다', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    const first = instrument.survey.items[0];
    if (first === undefined) throw new Error('missing item');

    // 카드 제목(h2)이 문항 문구다. `RadioGroup` legend 는 같은 문구를 스크린리더에만 남긴다.
    expect(await screen.findByRole('heading', { level: 2, name: first.prompt })).toBeDefined();
    for (const scale of instrument.survey.scaleLabels) {
      expect(screen.getByRole('radio', { name: scale.label })).toBeDefined();
    }
  });

  it('척도는 6옵션이고 6번째(비채점)는 별도 안내를 가진다 (C-8 · C13-08)', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    await screen.findByRole('group', { name: onboardingCopy.survey.deckLabel });
    expect(screen.getAllByRole('radio')).toHaveLength(6);
    expect(screen.getByText(onboardingCopy.survey.notScoredCaption)).toBeDefined();
  });

  it('제스처 없이 버튼만으로 10문항 전부에 도달해 응답할 수 있다 (D-9 · WCAG 2.5.1)', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    const nextQuestion = await screen.findByRole('button', {
      name: onboardingCopy.survey.nextQuestion,
    });

    for (const [index, item] of instrument.survey.items.entries()) {
      // 각 카드의 문항 문구가 실제로 보인다 = 그 문항에 도달했다.
      expect(await screen.findByRole('heading', { level: 2, name: item.prompt })).toBeDefined();

      const scale = instrument.survey.scaleLabels[index % 6];
      if (scale === undefined) throw new Error('missing scale');
      fireEvent.click(screen.getByRole('radio', { name: scale.label }));

      if (index < instrument.survey.items.length - 1) {
        fireEvent.click(nextQuestion);
        await waitFor(() => {
          expect(screen.getByText(onboardingCopy.survey.counter(index + 2, 10))).toBeDefined();
        });
      }
    }

    // 10문항을 전부 답했으므로 "남은 문항" 안내가 사라진다.
    await waitFor(() => {
      expect(screen.queryByText(/question[s]? left\./)).toBeNull();
    });
  });

  it('덱 안에서 ArrowRight 로도 다음 카드로 이동한다 (키보드 1급 경로)', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    const deck = await screen.findByRole('group', { name: onboardingCopy.survey.deckLabel });
    fireEvent.keyDown(deck, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(screen.getByText(onboardingCopy.survey.counter(2, 10))).toBeDefined();
    });
  });

  it('응답을 해제할 수 있다', async () => {
    await renderApp({ path: onboardingStepPath('capability-items') });

    const scale = instrument.survey.scaleLabels[0];
    if (scale === undefined) throw new Error('missing scale');

    fireEvent.click(await screen.findByRole('radio', { name: scale.label }));
    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.survey.clearAnswer }));

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: scale.label }).getAttribute('checked')).toBeNull();
    });
  });
});

describe('Trial — 가입 전에는 서버 요청이 0건이다 (AC-2-27 · C-12)', () => {
  it('Step 1~4 를 진행하는 동안 요청 로그가 비어 있다', async () => {
    const harness = await renderApp({ path: ROUTES.onboarding.intro });

    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.intro.start }));
    await expectPath(onboardingStepPath('child-info'));

    await fillChildInfo();
    fireEvent.click(nextButton());
    await expectPath(onboardingStepPath('temperament'));

    fireEvent.click(nextButton());
    await expectPath(onboardingStepPath('books'));

    fireEvent.click(nextButton());
    await expectPath(onboardingStepPath('goals'));

    expect(harness.bundle.requestLog.entries()).toStrictEqual([]);
    expect(findChildDataKeys(harness.bundle.requestLog.entries())).toStrictEqual([]);
  });

  it('응답은 기기 로컬 draft 에만 남고 schema 를 통과한다', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });

    await fillChildInfo('Nova');
    fireEvent.click(nextButton());
    await expectPath(onboardingStepPath('temperament'));

    const stored = readStoredDraft();
    expect(OnboardingDraftSchema.safeParse(stored).success).toBe(true);
    expect(OnboardingDraftSchema.parse(stored).answers.child_info?.firstName).toBe('Nova');
  });

  it('중도 이탈 후 다시 들어오면 저장된 단계로 이어진다 (AC-2-20)', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });
    await fillChildInfo();
    fireEvent.click(nextButton());
    await expectPath(onboardingStepPath('temperament'));

    document.body.innerHTML = '';

    await renderApp({ path: ROUTES.onboarding.intro });
    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.intro.resume }));

    await expectPath(onboardingStepPath('temperament'));
  });

  it('Trial 안내가 나오고 마지막 CTA 가 가입으로 보낸다 (C13-11)', async () => {
    await renderApp({ path: onboardingStepPath('child-info') });

    expect(await screen.findByText(onboardingCopy.notices.trialTitle)).toBeDefined();

    document.body.innerHTML = '';
    await renderApp({ path: onboardingStepPath('capability-items') });

    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.wizard.saveProfile }));
    await expectPath(ROUTES.auth.signUp);
  });
});

describe('제출과 착지 (AC-2-26 · AC-2-28)', () => {
  async function completeSurvey(): Promise<void> {
    const items = DEFAULT_ONBOARDING_INSTRUMENT.survey.items;
    const nextQuestion = await screen.findByRole('button', {
      name: onboardingCopy.survey.nextQuestion,
    });

    for (const [index, item] of items.entries()) {
      await screen.findByRole('heading', { level: 2, name: item.prompt });
      const scale = DEFAULT_ONBOARDING_INSTRUMENT.survey.scaleLabels[3];
      if (scale === undefined) throw new Error('missing scale');
      fireEvent.click(screen.getByRole('radio', { name: scale.label }));

      if (index < items.length - 1) {
        fireEvent.click(nextQuestion);
        await waitFor(() => {
          expect(screen.getByText(onboardingCopy.survey.counter(index + 2, 10))).toBeDefined();
        });
      }
    }
  }

  it('인증 상태에서 5단계를 제출하면 `/onboarding/saved` 로 간다', async () => {
    const harness = await renderApp({
      path: onboardingStepPath('child-info'),
      scenarios: ['me:onboarding-incomplete'],
      signIn: true,
      grantConsent: true,
    });

    await fillChildInfo();
    fireEvent.click(nextButton());
    await expectPath(onboardingStepPath('temperament'));

    fireEvent.click(nextButton());
    await expectPath(onboardingStepPath('books'));

    fireEvent.click(nextButton());
    await expectPath(onboardingStepPath('goals'));

    fireEvent.click(nextButton());
    await expectPath(onboardingStepPath('capability-items'));

    await completeSurvey();
    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.wizard.finish }));

    await expectPath(ROUTES.onboarding.saved);

    // 제출 요청에 5단계 전체 + 10문항이 담긴다 (AC-2-26).
    const submit = harness.bundle.requestLog
      .entries()
      .find((entry) => entry.operation === 'POST /v1/onboarding/submit');
    expect(submit).toBeDefined();

    const payload = submit?.payload as { answers: Record<string, unknown> } | undefined;
    expect(Object.keys(payload?.answers ?? {}).sort()).toStrictEqual([
      'books',
      'capability_items',
      'child_info',
      'goals',
      'temperament',
    ]);

    // 제출 성공 후 로컬 draft 가 삭제된다 (D-3 삭제 시점 ①, AC-2-28).
    expect(readStoredDraft()).toBeNull();
  });

  it('`/onboarding/saved` 의 CTA 는 Home 으로 직결된다 (Stage 2-B 화면을 만들지 않는다)', async () => {
    await renderApp({
      path: ROUTES.onboarding.saved,
      scenarios: ['me:success'],
      signIn: true,
      grantConsent: true,
    });

    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.saved.cta }));
    await expectPath(ROUTES.home);
  });
});

describe('Step 3 책 검색 (AC-2-23 · D-17)', () => {
  it('검색 결과를 목록으로 보여준다', async () => {
    await renderApp({ path: onboardingStepPath('books') });

    fireEvent.change(await screen.findByLabelText(new RegExp(onboardingCopy.books.searchLabel)), {
      target: { value: 'moon' },
    });

    expect(await screen.findByText('Goodnight Moon')).toBeDefined();
  });

  it('결과가 없으면 제목 직접 입력 경로를 연다', async () => {
    await renderApp({ path: onboardingStepPath('books'), scenarios: ['books:empty'] });

    fireEvent.change(await screen.findByLabelText(new RegExp(onboardingCopy.books.searchLabel)), {
      target: { value: 'Moonbeam' },
    });

    const add = await screen.findByRole('button', {
      name: onboardingCopy.books.addTyped('Moonbeam'),
    });
    fireEvent.click(add);

    const picked = await screen.findByRole('list', { name: onboardingCopy.books.selectedLabel });
    expect(within(picked).getByText('Moonbeam')).toBeDefined();
  });
});

describe('Privacy — 동의 기록 전 아동 데이터 0건 (AC-2-13)', () => {
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
