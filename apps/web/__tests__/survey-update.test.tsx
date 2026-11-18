/**
 * 설문 재응답 — Stage 6 `S6-C` (Spec §2.6 · §10.3 · `C13-S6-3`, AC-6-24 · 25 · 26 · 27 · 28 컴포넌트분).
 *
 * 실제 앱과 같은 조립(`createHarness` + `AppRoutes`)으로 연다. 기대값(프리필 답 · 카드 수 · 단계)은 같은 Mock 번들의
 * `GET …/survey-update` 응답과 instrument 에서 읽는다 — 문항·개수를 테스트에 적지 않는다 (`D-A`).
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { SurveyUpdateState } from '@haru/contracts';
import { useLocation, useNavigate } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { cardsForStep, surveyCardCopy, surveyCards } from '../src/entities/survey';
import { childProfileViewCopy } from '../src/features/child-profile-view';
import { settingsCopy } from '../src/features/settings/copy';
import {
  buildSurveyUpdateSubmitRequest,
  SURVEY_UPDATE_STEPS,
  surveyUpdateCopy as copy,
  surveyUpdateStepFromSlug,
  surveyUpdateStepPath,
} from '../src/features/survey-update';
import { MOCK_CHILD_ID } from '../src/mocks';
import { appCopy } from '../src/shared/copy/app-copy';
import { networkErrorCopy, retryLabel, unknownErrorCopy } from '../src/shared/copy/error-copy';
import { ROUTES } from '../src/shared/config/routes';
import { createHarness, type Harness } from '../src/test/harness';

const STATE = 'GET /v1/children/:childId/survey-update';
const SAVE = 'PUT /v1/children/:childId/survey-update/steps/:step';
const SUBMIT = 'POST /v1/children/:childId/survey-update/submit';
const deck = surveyCardCopy.deck;

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

const pathname = () => screen.getByTestId('pathname').textContent;

/** 앱 안 route 이동 — 카드 화면 밖의 요소가 history 를 바꾼다 (브라우저 back 과 같은 unmount 경로). */
function LeaveProbe() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      data-testid="leave"
      onClick={() => {
        void navigate(ROUTES.settings);
      }}
    />
  );
}

async function renderAt(
  entries: readonly string[],
  scenarios: readonly string[] = [],
): Promise<Harness> {
  const harness = createHarness({ scenarios, initialEntries: [...entries] });
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <LeaveProbe />
      <AppRoutes />
    </Wrapper>,
  );
  await waitFor(() => {
    expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
  });
  return harness;
}

/** 설정 목록 위에 진입 화면을 쌓는다 — 진입 뒤로의 목적지가 설정 목록이다. */
const renderIntro = (scenarios: readonly string[] = []) =>
  renderAt([ROUTES.settings, ROUTES.settingsChildSurvey], scenarios);

/** 서버 상태 — 화면이 아닌 별도 harness 로 읽는다 (같은 seed 라 같은 값이다). */
async function serverState(scenarios: readonly string[] = []): Promise<SurveyUpdateState> {
  const probe = createHarness({ scenarios });
  return probe.bundle.clients.children.getSurveyUpdate({ childId: MOCK_CHILD_ID });
}

function view(): HTMLElement {
  return document.querySelector('.haru-survey-update') as HTMLElement;
}

/** 진입 화면이 서버 상태를 받았다 — CTA 가 `loading` 이 아니다. */
async function introReady(): Promise<void> {
  await waitFor(() => expect(view()?.getAttribute('data-state')).toBe('ready'));
}

async function cardsReady(): Promise<void> {
  await waitFor(() => expect(view().querySelector('[data-state="ready"]')).not.toBeNull());
  await waitFor(() =>
    expect(document.querySelector('.haru-swipe-deck__card--front')).not.toBeNull(),
  );
}

function frontCard(): HTMLElement {
  return document.querySelector('.haru-swipe-deck__card--front') as HTMLElement;
}

function requests(harness: Harness, operation: string) {
  return harness.bundle.requestLog.entries().filter((entry) => entry.operation === operation);
}

const nextCard = () => screen.getByRole('button', { name: deck.nextQuestion });

afterEach(() => {
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

describe('진입 `/settings/child/survey` (Spec §2.6.1)', () => {
  it('설정 행 *Update survey answers* → 진입 화면 (S6-B 의 Not Found 해소)', async () => {
    await renderAt([ROUTES.settings]);
    fireEvent.click(await screen.findByRole('button', { name: settingsCopy.rows.surveyUpdate }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsChildSurvey));
    expect(await screen.findByRole('heading', { level: 1, name: copy.intro.title })).toBeTruthy();
  });

  it('구성 — h1 · 본문 · 소요 시간(instrument 값) · 프리필 안내 · *Start* · 온보딩 전용 안내 0', async () => {
    const state = await serverState();
    const harness = await renderIntro();

    expect(await screen.findByRole('heading', { level: 1, name: copy.intro.title })).toBeTruthy();
    // 문항·draft 의 출처 = `GET …/survey-update` (하드코딩 0 — `D-A`)
    await waitFor(() => expect(requests(harness, STATE).length).toBeGreaterThan(0));
    expect(screen.getByText(copy.intro.body)).toBeTruthy();
    expect(
      await screen.findByText(surveyCardCopy.minutes(state.instrument.estimates.surveyMinutes)),
    ).toBeTruthy();
    expect(screen.getByText(copy.intro.prefilled)).toBeTruthy();
    expect(screen.getByRole('button', { name: copy.intro.start })).toBeTruthy();
    // Trial · 로컬 draft 안내 없음 (`N6-07`)
    expect(screen.queryByText(/stay on this device/i)).toBeNull();
    expect(screen.queryByText(/starting fresh/i)).toBeNull();
  });

  it('뒤로 → 설정 목록', async () => {
    await renderIntro();
    await screen.findByRole('heading', { level: 1, name: copy.intro.title });
    fireEvent.click(screen.getByRole('button', { name: copy.backLabel }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
  });

  it('*Start* → 첫 단계 첫 카드 (replace)', async () => {
    await renderIntro();
    await introReady();
    fireEvent.click(screen.getByRole('button', { name: copy.intro.start }));
    await waitFor(() => expect(pathname()).toBe(surveyUpdateStepPath(SURVEY_UPDATE_STEPS[0]!)));
    await cardsReady();
  });

  it('`survey-update-draft` → *Continue where you left off* → `currentStep` 카드 (AC-6-26)', async () => {
    const state = await serverState(['children:survey-update-draft']);
    await renderIntro(['children:survey-update-draft']);
    await introReady();

    fireEvent.click(screen.getByRole('button', { name: copy.intro.resume }));
    await waitFor(() => expect(pathname()).toBe(surveyUpdateStepPath(state.currentStep)));
    await cardsReady();
    expect(
      screen.getByRole('heading', { level: 1, name: surveyCardCopy.steps[state.currentStep] }),
    ).toBeTruthy();
  });

  it('Loading — CTA `loading`(aria-busy) · 시계 행 미렌더', async () => {
    await renderIntro(['children:loading']);
    const cta = await screen.findByRole('button', { name: copy.intro.start });
    expect(cta.getAttribute('aria-busy')).toBe('true');
    expect(view().getAttribute('data-state')).toBe('loading');
  });

  it('조회 실패 → ErrorState + *Try again* (진입 화면 대신)', async () => {
    await renderIntro(['children:error']);
    await waitFor(() => expect(view().querySelector('[data-state="error"]')).not.toBeNull());
    expect(screen.getByRole('heading', { level: 2, name: unknownErrorCopy.title })).toBeTruthy();
    expect(screen.getByRole('button', { name: retryLabel })).toBeTruthy();
    expect(screen.queryByRole('button', { name: copy.intro.start })).toBeNull();
  });

  it('오프라인 → 네트워크 문구', async () => {
    await renderIntro(['children:offline']);
    expect(
      await screen.findByRole('heading', { level: 2, name: networkErrorCopy.title }),
    ).toBeTruthy();
  });
});

describe('카드 `/settings/child/survey/:step` (Spec §2.6.2 · AC-6-24 · 25)', () => {
  it('프리필 — 서버 draft 의 현재 응답이 선택된 상태 · 카운터 분모 = 재응답 카드 수 · 진행바', async () => {
    const state = await serverState();
    const first = SURVEY_UPDATE_STEPS[0]!;
    await renderAt([ROUTES.settings, surveyUpdateStepPath(first)]);
    await cardsReady();

    const total = surveyCards(state.instrument, SURVEY_UPDATE_STEPS).length;
    expect(within(frontCard()).getByText(deck.counter(1, total))).toBeTruthy();
    // 설정 흐름 전용 접근성 이름 (`D6-9` ④ `VG6-C-09`) — 온보딩 이름이 남지 않는다
    expect(screen.getByRole('progressbar', { name: copy.a11y.progressLabel })).toBeTruthy();
    expect(screen.getByRole('group', { name: copy.a11y.deckLabel })).toBeTruthy();
    expect(screen.queryByRole('progressbar', { name: deck.progressLabel })).toBeNull();
    expect(screen.queryByRole('group', { name: deck.deckLabel })).toBeNull();
    expect(
      screen.getByRole('heading', { level: 1, name: surveyCardCopy.steps[first] }),
    ).toBeTruthy();

    const comfort = state.draftAnswers.reading_together?.storyComfort;
    expect(comfort).toBeDefined();
    const checked = within(frontCard()).getByRole('radio', { checked: true });
    expect(checked.getAttribute('value')).toBe(comfort);
  });

  it('단계 마지막 카드에서 다음 → 단계 저장 PUT 1건(떠나는 단계) · 다음 단계로', async () => {
    const state = await serverState();
    const [first, second] = SURVEY_UPDATE_STEPS;
    const harness = await renderAt([ROUTES.settings, surveyUpdateStepPath(first!)]);
    await cardsReady();

    const count = cardsForStep(surveyCards(state.instrument, SURVEY_UPDATE_STEPS), first!).length;
    for (let index = 0; index < count; index += 1) fireEvent.click(nextCard());

    await waitFor(() => expect(pathname()).toBe(surveyUpdateStepPath(second!)));
    const saves = requests(harness, SAVE);
    expect(saves).toHaveLength(1);
    // Rev 10.1 — 떠나는 단계의 답 + 도착 단계 (`D6-9` ②)
    expect(saves[0]?.payload).toMatchObject({ step: first, currentStep: second });
  });

  it('Rev 10.1 — 뒤 단계로 이동도 도착 단계를 싣는다', async () => {
    const [first, second] = SURVEY_UPDATE_STEPS;
    const harness = await renderAt([ROUTES.settings, surveyUpdateStepPath(second!)]);
    await cardsReady();

    fireEvent.click(screen.getByRole('button', { name: /Previous question|Go back/ }));
    await waitFor(() => expect(pathname()).toBe(surveyUpdateStepPath(first!)));
    const saves = requests(harness, SAVE);
    expect(saves).toHaveLength(1);
    expect(saves[0]?.payload).toMatchObject({ step: second, currentStep: first });
  });

  it('첫 카드 뒤로 → 진입 화면 · 편집이 없으면 저장 0 (Rev 10.1 — 이탈은 미저장 편집만)', async () => {
    const harness = await renderAt([
      ROUTES.settings,
      surveyUpdateStepPath(SURVEY_UPDATE_STEPS[0]!),
    ]);
    await cardsReady();

    fireEvent.click(screen.getByRole('button', { name: deck.back }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsChildSurvey));
    expect(requests(harness, SAVE)).toHaveLength(0);
  });

  it('Rev 10.1 — 첫 카드에서 답을 고친 뒤 뒤로 → 진입: 보던 단계 PUT 1건 (`currentStep` 생략)', async () => {
    const first = SURVEY_UPDATE_STEPS[0]!;
    const harness = await renderAt([ROUTES.settings, surveyUpdateStepPath(first)]);
    await cardsReady();

    const radios = within(frontCard()).getAllByRole('radio');
    const other = radios.find((radio) => !(radio as HTMLInputElement).checked) as HTMLInputElement;
    fireEvent.click(other);
    // 포인터 단일 선택은 자동 전진할 수 있다 — 첫 카드로 돌아와 TopBar 뒤로
    await cardsReady();
    for (let guard = 0; guard < 5 && pathname() !== ROUTES.settingsChildSurvey; guard += 1) {
      fireEvent.click(screen.getByRole('button', { name: /Previous question|Go back/ }));
      await waitFor(() => expect(view()).not.toBeNull());
    }
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsChildSurvey));

    const saves = requests(harness, SAVE);
    expect(saves).toHaveLength(1);
    expect(saves[0]?.payload).toMatchObject({ step: first });
    expect(saves[0]?.payload).not.toHaveProperty('currentStep');
    // 서버 draft — 고친 답 · 복귀 단계 = 보던 단계
    const state = await harness.bundle.clients.children.getSurveyUpdate({ childId: MOCK_CHILD_ID });
    expect(state.currentStep).toBe(first);
    expect(state.draftAnswers.reading_together?.storyComfort).toBe(other.value);
  });

  it('Rev 10.1 — 앱 안 이동(카드 화면 unmount) 시 미저장 편집 PUT 1건 · 편집 없으면 0', async () => {
    const [, second] = SURVEY_UPDATE_STEPS;
    const harness = await renderAt([ROUTES.settings, surveyUpdateStepPath(second!)]);
    await cardsReady();
    const radios = within(frontCard()).queryAllByRole('radio');
    const checkbox = within(frontCard()).queryAllByRole('checkbox');
    const target = (radios.find((radio) => !(radio as HTMLInputElement).checked) ?? checkbox[0]) as
      HTMLInputElement | undefined;
    expect(target).toBeDefined();
    fireEvent.click(target!);

    // 앱 안 이동 — 화면 밖에서 history 를 바꾼다 (브라우저 back 과 같은 unmount 경로)
    fireEvent.click(screen.getByTestId('leave'));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
    const saves = requests(harness, SAVE);
    expect(saves).toHaveLength(1);
    expect(saves[0]?.payload).toMatchObject({ step: second });
    expect(saves[0]?.payload).not.toHaveProperty('currentStep');
  });

  it('Rev 10.1 — `pagehide` 에 미저장 편집이 있으면 best-effort 저장 · 없으면 0', async () => {
    const first = SURVEY_UPDATE_STEPS[0]!;
    const harness = await renderAt([ROUTES.settings, surveyUpdateStepPath(first)]);
    await cardsReady();

    // 편집 없음 → 보내지 않는다
    window.dispatchEvent(new Event('pagehide'));
    expect(requests(harness, SAVE)).toHaveLength(0);

    // 답을 고친다 (자동 전진해도 같은 단계 안 — 화면은 그대로)
    const radios = within(frontCard()).getAllByRole('radio');
    const other = radios.find((radio) => !(radio as HTMLInputElement).checked) as HTMLInputElement;
    fireEvent.click(other);
    window.dispatchEvent(new Event('pagehide'));
    await waitFor(() => expect(requests(harness, SAVE)).toHaveLength(1));
    const save = requests(harness, SAVE)[0];
    expect(save?.payload).toMatchObject({ step: first });
    expect(save?.payload).not.toHaveProperty('currentStep');
  });

  it('고친 답은 단계 저장이 실패해도 메모리에 남는다 — 다음 단계 → 뒤로 와도 그대로 · 이동은 막지 않는다', async () => {
    const state = await serverState();
    const [first, second] = SURVEY_UPDATE_STEPS;
    await renderAt(
      [ROUTES.settings, surveyUpdateStepPath(first!)],
      ['children.savesurveyupdatestep:error'],
    );
    await cardsReady();

    // 첫 카드에서 프리필과 다른 답을 키보드로 고른다 (포인터 선택은 자동 전진)
    const radios = within(frontCard()).getAllByRole('radio');
    const other = radios.find((radio) => !(radio as HTMLInputElement).checked) as HTMLInputElement;
    fireEvent.click(other);
    const chosen = other.value;
    expect(chosen).not.toBe(state.draftAnswers.reading_together?.storyComfort);

    const count = cardsForStep(surveyCards(state.instrument, SURVEY_UPDATE_STEPS), first!).length;
    // 자동 전진이 일어났을 수 있다 — 단계 경계까지 TopBar 로 넘긴다
    for (
      let guard = 0;
      guard < count + 1 && pathname() !== surveyUpdateStepPath(second!);
      guard += 1
    ) {
      fireEvent.click(nextCard());
    }
    await waitFor(() => expect(pathname()).toBe(surveyUpdateStepPath(second!)));
    await cardsReady();
    // 저장 실패 — 시각 변화 0 (Spec §2.6.3)
    expect(screen.queryByRole('alert')).toBeNull();

    // 다시 첫 단계 첫 카드까지 뒤로
    for (
      let guard = 0;
      guard < count + 2 && pathname() !== surveyUpdateStepPath(first!);
      guard += 1
    ) {
      fireEvent.click(screen.getByRole('button', { name: /Previous question|Go back/ }));
    }
    await waitFor(() => expect(pathname()).toBe(surveyUpdateStepPath(first!)));
    await cardsReady();
    while (
      within(frontCard()).queryByText(
        deck.counter(1, surveyCards(state.instrument, SURVEY_UPDATE_STEPS).length),
      ) === null
    ) {
      fireEvent.click(screen.getByRole('button', { name: deck.prevQuestion }));
      await cardsReady();
    }
    const checked = within(frontCard()).getByRole('radio', { checked: true }) as HTMLInputElement;
    expect(checked.value).toBe(chosen);

    // 기기 저장 0 (`N6-07`)
    expect(globalThis.localStorage.length).toBe(0);
    expect(globalThis.sessionStorage.length).toBe(0);
  });

  it('재응답 단계가 아닌 slug(`child-info`) → 진입 화면', async () => {
    await renderAt([ROUTES.settings, `${ROUTES.settingsChildSurvey}/child-info`]);
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsChildSurvey));
  });

  it('카드 조회 실패 → ErrorState + *Try again*', async () => {
    await renderAt(
      [ROUTES.settings, surveyUpdateStepPath(SURVEY_UPDATE_STEPS[0]!)],
      ['children:error'],
    );
    await waitFor(() => expect(view().querySelector('[data-state="error"]')).not.toBeNull());
    expect(screen.getByRole('button', { name: retryLabel })).toBeTruthy();
  });

  it('카드 Loading → 카드 자리 Skeleton', async () => {
    await renderAt(
      [ROUTES.settings, surveyUpdateStepPath(SURVEY_UPDATE_STEPS[0]!)],
      ['children:loading'],
    );
    const status = await screen.findByRole('status', { name: copy.loading });
    expect(status.getAttribute('aria-busy')).toBe('true');
    expect(status.querySelector('.haru-skeleton')).not.toBeNull();
  });
});

/** 마지막 단계의 마지막 카드까지 TopBar 다음으로 간다. */
async function goToLastCard(state: SurveyUpdateState): Promise<void> {
  const last = SURVEY_UPDATE_STEPS[SURVEY_UPDATE_STEPS.length - 1]!;
  const count = cardsForStep(surveyCards(state.instrument, SURVEY_UPDATE_STEPS), last).length;
  await cardsReady();
  for (let index = 0; index < count - 1; index += 1) fireEvent.click(nextCard());
  await screen.findByRole('button', { name: copy.saveAnswers });
}

describe('제출 (Spec §2.6.3 · AC-6-27 · 28)', () => {
  const last = () => surveyUpdateStepPath(SURVEY_UPDATE_STEPS[SURVEY_UPDATE_STEPS.length - 1]!);

  it('*Save answers* → POST 1건 → Toast → `/settings/profile`(replace) · UpdateNote *from your latest answers*', async () => {
    const state = await serverState();
    const harness = await renderAt([ROUTES.settings, last()]);
    await goToLastCard(state);

    const save = screen.getByRole('button', { name: copy.saveAnswers });
    fireEvent.click(save);
    fireEvent.click(save);

    expect(await screen.findByText(copy.savedToast)).toBeTruthy();
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsProfile));
    expect(requests(harness, SUBMIT)).toHaveLength(1);

    // 프로필 캐시 무효화 → 재조회 결과에 재응답 스냅샷 (`survey_update`)
    const note = childProfileViewCopy.revisit.updateNote.survey_update('DATE').split('DATE');
    expect(
      await screen.findByText(
        (text) => text.startsWith(note[0] ?? '') && text.endsWith(note[1] ?? ''),
      ),
    ).toBeTruthy();
  });

  it('제출 실패 → CTA 위 InlineAlert · 답 보존 · 다시 누르면 재시도(같은 답 = 같은 Idempotency-Key) → 성공', async () => {
    const state = await serverState();
    const harness = await renderAt(
      [ROUTES.settings, last()],
      ['children.submitsurveyupdate:retry'],
    );
    await goToLastCard(state);

    fireEvent.click(screen.getByRole('button', { name: copy.saveAnswers }));
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(copy.saveFailed.title)).toBeTruthy();
    expect(within(alert).getByText(copy.saveFailed.description)).toBeTruthy();
    expect(pathname()).toBe(last());

    fireEvent.click(screen.getByRole('button', { name: copy.saveAnswers }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsProfile));
    const submits = requests(harness, SUBMIT);
    expect(submits).toHaveLength(2);
    expect(submits[0]?.payload).toEqual(submits[1]?.payload);
  });

  it('오프라인 → 오프라인 문구 · 화면 유지', async () => {
    const state = await serverState();
    await renderAt([ROUTES.settings, last()], ['children.submitsurveyupdate:offline']);
    await goToLastCard(state);

    fireEvent.click(screen.getByRole('button', { name: copy.saveAnswers }));
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(copy.offline.title)).toBeTruthy();
    expect(pathname()).toBe(last());
  });
});

describe('순수 함수', () => {
  it('slug ↔ 단계 — 재응답 4단계만, `child-info`·알 수 없는 slug = null', () => {
    for (const step of SURVEY_UPDATE_STEPS) {
      const slug = surveyUpdateStepPath(step).split('/').pop() ?? '';
      expect(surveyUpdateStepFromSlug(slug)).toBe(step);
    }
    expect(surveyUpdateStepFromSlug('child-info')).toBeNull();
    expect(surveyUpdateStepFromSlug('nope')).toBeNull();
  });

  it('제출 payload — 프리필 draft 그대로 성공 · 필수 문항 빈칸이면 그 단계 · 역량 문항 빠지면 마지막 단계', async () => {
    const state = await serverState();
    const ok = buildSurveyUpdateSubmitRequest(state.instrument, state.draftAnswers);
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.request.instrument).toEqual({
        code: state.instrument.code,
        version: state.instrument.version,
      });
      expect('child_info' in ok.request.answers).toBe(false);
    }

    const { reading_together: _drop, ...withoutFirst } = state.draftAnswers;
    const missingFirst = buildSurveyUpdateSubmitRequest(state.instrument, withoutFirst);
    expect(missingFirst).toEqual({ ok: false, missing: ['reading_together'] });

    const { capability_items: _items, ...withoutItems } = state.draftAnswers;
    const missingItems = buildSurveyUpdateSubmitRequest(state.instrument, withoutItems);
    expect(missingItems).toEqual({ ok: false, missing: ['capability_items'] });
  });
});
