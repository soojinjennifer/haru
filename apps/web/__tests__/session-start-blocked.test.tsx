/**
 * Stage 4b `S4-H4` — 시작을 막는 응답 (`QA-4B-001` · `QA-4B-002`, `D4-145` CP-15 ⓐ · NB-16 · NB-18 · `D4-146`).
 *
 * AC-4-35 화면 부분 — `SESSION_ALREADY_ACTIVE`:
 *   `ready` → 그 세션 화면(일반 시작과 같은 push · 새 생성 0) · `recording`/`paused` → 기존 문구(이동 0) ·
 *   Detail 조회 실패 → 기존 일반 실패 문구 · 재탭 → 같은 결과(탭마다 생성 1 · Detail 1).
 * AC-4-36 화면 부분 — `ONBOARDING_INCOMPLETE`:
 *   `me` 재조회 1건 → 기존 Route Guard 가 온보딩으로 · 어긋남(`me` 가 여전히 `completed`) → 기존 문구만 · 루프 0.
 *
 * 두 경로(Home Activity Card 시트 · 서재 책 시트)를 같은 Mock 으로 본다. 증거 = Mock 요청 로그.
 * 프레임 단위(T1~T5 — 버튼 `loading` 연속 · 오류 0 프레임 · 전체 화면 Spinner 0)는 `e2e/session-start-blocked.spec.ts`.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { activityDeckCopy } from '../src/features/activity-card-deck';
import { storytimeSessionCopy } from '../src/features/storytime-session';
import { MOCK_ACTIVE_SESSION_ID } from '../src/mocks';
import type { MockErrorCodes } from '../src/mocks';
import { ROUTES } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { ERROR_COPY } from '../src/shared/copy/error-copy';
import { libraryCopy } from '../src/shared/copy/library-copy';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const ALREADY = ERROR_COPY.SESSION_ALREADY_ACTIVE;
const ONBOARDING = ERROR_COPY.ONBOARDING_INCOMPLETE;

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

async function renderApp(
  options: { scenarios?: readonly string[]; path?: string; errorCodes?: MockErrorCodes } = {},
): Promise<Harness> {
  const harness = createHarness({
    initialEntries: [options.path ?? ROUTES.home],
    ...(options.scenarios === undefined ? {} : { scenarios: options.scenarios }),
    ...(options.errorCodes === undefined ? {} : { errorCodes: options.errorCodes }),
  });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  return harness;
}

function count(harness: Harness, operation: string): number {
  return harness.bundle.requestLog.entries().filter((entry) => entry.operation === operation)
    .length;
}

const CREATE = 'POST /v1/sessions';
const DETAIL = 'GET /v1/sessions/:sessionId';
const ME = 'GET /v1/me';

function pathname(): string {
  return screen.getByTestId('pathname').textContent ?? '';
}

/**
 * `QA-4B-006` · `D4-153` — 첫 화면을 기본 1000ms 창 하나로 기다리지 않는다. 진입 직후 Route Guard 가 `me`
 * 조회 동안 Spinner 를 그리고, 판정이 끝나야 화면이 마운트된다(+ 화면 query). 단계마다 기본 창을 따로 준다:
 * ① 여기 = Guard 판정 종료 ② 각 테스트의 원래 대기. 단언은 그대로이고 timeout 값은 바꾸지 않는다.
 * 세션 화면의 상세 대기 Spinner(`.haru-session--pending`)도 이름이 `Loading` 이라 Guard 의 것만 센다.
 */
async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(
      screen
        .queryAllByRole('status', { name: appCopy.guard.loadingLabel })
        .filter((node) => node.closest('.haru-session') === null),
    ).toHaveLength(0);
  });
}

/**
 * `QA-4B-006` · `D4-153` — 시작 요청 뒤 화면 결과는 **요청 둘 이상**(생성 → 열린 세션 Detail · 또는 생성 →
 * `me` 재조회)을 거친다. 기본 1000ms 창 하나에 몰지 않고 중간 요청 도달을 먼저 기다린다 (각 테스트의 `waitFor`).
 * 세션 화면 진입은 `D4-150` 과 같다: ① 경로 ② 상세 query 대기(pending Spinner) 종료 ③ 원래 단언.
 */
async function waitForSessionDetail(): Promise<void> {
  await waitFor(() => {
    expect(document.querySelector('.haru-session:not(.haru-session--pending)')).not.toBeNull();
  });
}

/** Home → Start Session → Bedtime → Continue. 시트를 돌려준다 (이동하면 사라진다). */
async function confirmFromHome(): Promise<HTMLElement> {
  await waitForGuard();
  await waitFor(() => {
    expect(
      document.querySelector('.haru-activity-track:not(.haru-activity-track--skeleton)'),
    ).not.toBeNull();
  });
  const front = document.querySelector('.haru-activity-card-flip__face--front') as HTMLElement;
  fireEvent.click(
    within(front).getByRole('button', { name: activityDeckCopy.card.startSession.label }),
  );
  const sheet = await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.title });
  fireEvent.click(
    within(sheet).getByRole('radio', { name: activityDeckCopy.readingContext.options.bedtime }),
  );
  tapContinue(sheet);
  return sheet;
}

function tapContinue(sheet: HTMLElement): void {
  fireEvent.click(
    within(sheet).getByRole('button', { name: activityDeckCopy.readingContext.confirm }),
  );
}

/** 서재 → 첫 책 상세 시트 → Start Session. */
async function startFromLibrary(): Promise<HTMLElement> {
  await waitForGuard();
  await waitFor(() => {
    expect(document.querySelector('.haru-shelf-item--pressable')).not.toBeNull();
  });
  fireEvent.click(document.querySelector('.haru-shelf-item--pressable') as HTMLElement);
  const sheet = await screen.findByRole('dialog');
  tapStart(sheet);
  return sheet;
}

function tapStart(sheet: HTMLElement): void {
  fireEvent.click(
    within(sheet).getByRole('button', { name: libraryCopy.bookSheet.startSession.label }),
  );
}

function toastText(): string | null {
  return document.querySelector('.haru-toast')?.textContent ?? null;
}

afterEach(() => {
  globalThis.localStorage.clear();
  vi.restoreAllMocks();
});

describe('AC-4-35 화면 부분 — Home Activity Card 시트 (`SESSION_ALREADY_ACTIVE`)', () => {
  it('열린 세션이 `ready` → 그 세션 ready 화면으로 이동한다 · 생성 요청 1 · 오류 안내 0', async () => {
    const harness = await renderApp({ scenarios: ['sessions:session-already-active-ready'] });
    await confirmFromHome();
    await waitFor(() => {
      expect(pathname()).toBe(`/session/${MOCK_ACTIVE_SESSION_ID}`);
    });
    await waitForSessionDetail();
    await screen.findByRole('button', { name: storytimeSessionCopy.record.start });
    expect(count(harness, CREATE)).toBe(1);
    expect(screen.queryByText(activityDeckCopy.card.startFailed)).toBeNull();
    expect(screen.queryByText(ALREADY.title)).toBeNull();
  });

  for (const key of ['session-already-active', 'session-already-active-paused'] as const) {
    it(`\`${key}\` → 시트 안 기존 \`SESSION_ALREADY_ACTIVE\` 제목·설명 · 이동 0 · 재탭 = 같은 결과`, async () => {
      const harness = await renderApp({ scenarios: [`sessions:${key}`] });
      const sheet = await confirmFromHome();
      await waitFor(() => {
        expect(count(harness, DETAIL)).toBe(1);
      });

      const alert = await within(sheet).findByRole('alert');
      expect(within(alert).getByText(ALREADY.title)).toBeTruthy();
      expect(within(alert).getByText(ALREADY.description)).toBeTruthy();
      expect(within(sheet).queryByText(activityDeckCopy.card.startFailed)).toBeNull();
      expect(pathname()).toBe(ROUTES.home);
      expect(count(harness, CREATE)).toBe(1);
      expect(count(harness, DETAIL)).toBe(1);
      // 선택은 그대로다 (기존 실패 규칙)
      const bedtime = within(sheet).getByRole('radio', {
        name: activityDeckCopy.readingContext.options.bedtime,
      }) as HTMLInputElement;
      expect(bedtime.checked).toBe(true);

      tapContinue(sheet);
      await waitFor(() => {
        expect(count(harness, DETAIL)).toBe(2);
      });
      expect(await within(sheet).findByText(ALREADY.title)).toBeTruthy();
      expect(count(harness, CREATE)).toBe(2);
      expect(pathname()).toBe(ROUTES.home);
    });
  }

  it('Detail 조회 실패 → 기존 일반 실패 문구 · 이동 0 (`D4-146` Q4)', async () => {
    const harness = await renderApp({
      scenarios: ['sessions:session-already-active', 'sessions.getdetail:error'],
    });
    const sheet = await confirmFromHome();
    await waitFor(() => {
      expect(count(harness, DETAIL)).toBe(1);
    });
    expect(await within(sheet).findByText(activityDeckCopy.card.startFailed)).toBeTruthy();
    expect(within(sheet).queryByText(ALREADY.title)).toBeNull();
    expect(count(harness, DETAIL)).toBe(1);
    expect(pathname()).toBe(ROUTES.home);
  });

  it('안내가 나타날 때 시트 안에서 그 안내를 **한 번** 보이게 스크롤한다 (`D4-146` Q2 ⓑ)', async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const harness = await renderApp({ scenarios: ['sessions:session-already-active'] });
    const sheet = await confirmFromHome();
    await waitFor(() => {
      expect(count(harness, DETAIL)).toBe(1);
    });
    const alert = await within(sheet).findByRole('alert');
    await waitFor(() => {
      expect(scroll).toHaveBeenCalledTimes(1);
    });
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest' });
    expect((scroll.mock.contexts[0] as HTMLElement).contains(alert)).toBe(true);
    // 다시 그려져도(같은 안내 유지) 더 스크롤하지 않는다
    fireEvent.click(
      within(sheet).getByRole('radio', { name: activityDeckCopy.readingContext.options.now }),
    );
    expect(scroll).toHaveBeenCalledTimes(1);
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  it('기존 일반 실패 문구에도 같은 스크롤이 적용된다', async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    await renderApp({ scenarios: ['sessions.create:error'] });
    const sheet = await confirmFromHome();
    await within(sheet).findByText(activityDeckCopy.card.startFailed);
    expect(scroll).toHaveBeenCalledTimes(1);
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });
});

describe('AC-4-35 화면 부분 — 서재 책 시트 (`SESSION_ALREADY_ACTIVE`)', () => {
  it('열린 세션이 `ready` → 그 세션 ready 화면으로 이동 · Toast 0', async () => {
    const harness = await renderApp({
      path: ROUTES.library,
      scenarios: ['sessions:session-already-active-ready'],
    });
    await startFromLibrary();
    await waitFor(() => {
      expect(pathname()).toBe(`/session/${MOCK_ACTIVE_SESSION_ID}`);
    });
    await waitForSessionDetail();
    await screen.findByRole('button', { name: storytimeSessionCopy.record.start });
    expect(count(harness, CREATE)).toBe(1);
    expect(toastText()).toBeNull();
  });

  for (const key of ['session-already-active', 'session-already-active-paused'] as const) {
    it(`\`${key}\` → Toast 한 칸 = \`제목. 설명\` (Q1 ⓐ) · 시트 유지 · 이동 0`, async () => {
      const harness = await renderApp({ path: ROUTES.library, scenarios: [`sessions:${key}`] });
      const sheet = await startFromLibrary();
      await waitFor(() => {
        expect(count(harness, DETAIL)).toBe(1);
      });
      await waitFor(() => {
        expect(toastText()).toBe(`${ALREADY.title}. ${ALREADY.description}`);
      });
      expect(pathname()).toBe(ROUTES.library);
      expect(sheet.isConnected).toBe(true);
      expect(count(harness, DETAIL)).toBe(1);

      tapStart(sheet);
      await waitFor(() => {
        expect(count(harness, DETAIL)).toBe(2);
      });
      expect(count(harness, CREATE)).toBe(2);
      expect(pathname()).toBe(ROUTES.library);
    });
  }

  it('Detail 조회 실패 → 기존 `startFailed` Toast', async () => {
    const harness = await renderApp({
      path: ROUTES.library,
      scenarios: ['sessions:session-already-active', 'sessions.getdetail:error'],
    });
    await startFromLibrary();
    await waitFor(() => {
      expect(count(harness, DETAIL)).toBe(1);
    });
    await waitFor(() => {
      expect(toastText()).toBe(libraryCopy.bookSheet.startFailed);
    });
  });
});

describe('AC-4-36 화면 부분 — 세션 endpoint `ONBOARDING_INCOMPLETE` (NB-16)', () => {
  it('Home: `me` 재조회 1건 → 기존 Route Guard 가 온보딩 구간으로 보낸다 · 오류 안내 0', async () => {
    const harness = await renderApp({ scenarios: ['sessions:onboarding-incomplete'] });
    await waitFor(() => {
      expect(count(harness, ME)).toBeGreaterThan(0);
    });
    const before = count(harness, ME);
    await confirmFromHome();
    await waitFor(() => {
      expect(count(harness, ME) - before).toBe(1);
    });
    await waitFor(() => {
      expect(pathname()).toMatch(/^\/onboarding(\/|$)/);
    });
    expect(count(harness, ME) - before).toBe(1);
    expect(screen.queryByText(activityDeckCopy.card.startFailed)).toBeNull();
    expect(screen.queryByText(ONBOARDING.title)).toBeNull();
  });

  it('서재: 같은 이동 · Toast 0', async () => {
    const harness = await renderApp({
      path: ROUTES.library,
      scenarios: ['sessions:onboarding-incomplete'],
    });
    await waitFor(() => {
      expect(count(harness, ME)).toBeGreaterThan(0);
    });
    const before = count(harness, ME);
    await startFromLibrary();
    await waitFor(() => {
      expect(count(harness, ME) - before).toBe(1);
    });
    await waitFor(() => {
      expect(pathname()).toMatch(/^\/onboarding(\/|$)/);
    });
    expect(count(harness, ME) - before).toBe(1);
    expect(toastText()).toBeNull();
  });

  it('어긋남(다시 받은 `me` 가 `completed`) → Home 시트에 기존 문구 · 이동 0 · 탭마다 재조회 1건(루프 0)', async () => {
    const harness = await renderApp({
      scenarios: ['sessions.create:error'],
      errorCodes: { 'sessions.create': 'ONBOARDING_INCOMPLETE' },
    });
    await waitFor(() => {
      expect(count(harness, ME)).toBeGreaterThan(0);
    });
    const before = count(harness, ME);
    const sheet = await confirmFromHome();
    await waitFor(() => {
      expect(count(harness, ME) - before).toBe(1);
    });
    const alert = await within(sheet).findByRole('alert');
    expect(within(alert).getByText(ONBOARDING.title)).toBeTruthy();
    expect(within(alert).getByText(ONBOARDING.description)).toBeTruthy();
    expect(pathname()).toBe(ROUTES.home);
    expect(count(harness, ME) - before).toBe(1);

    tapContinue(sheet);
    await waitFor(() => {
      expect(count(harness, CREATE)).toBe(2);
    });
    await waitFor(() => {
      expect(count(harness, ME) - before).toBe(2);
    });
    await within(sheet).findByText(ONBOARDING.title);
    // 조금 더 기다려도 재조회가 저절로 반복되지 않는다
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(count(harness, ME) - before).toBe(2);
    expect(pathname()).toBe(ROUTES.home);
  });

  it('어긋남 — 서재 Toast = 기존 `ONBOARDING_INCOMPLETE` `제목. 설명`', async () => {
    const harness = await renderApp({
      path: ROUTES.library,
      scenarios: ['sessions.create:error'],
      errorCodes: { 'sessions.create': 'ONBOARDING_INCOMPLETE' },
    });
    await waitFor(() => {
      expect(count(harness, ME)).toBeGreaterThan(0);
    });
    const before = count(harness, ME);
    await startFromLibrary();
    await waitFor(() => {
      expect(count(harness, ME) - before).toBe(1);
    });
    await waitFor(() => {
      expect(toastText()).toBe(`${ONBOARDING.title}. ${ONBOARDING.description}`);
    });
    expect(pathname()).toBe(ROUTES.library);
  });
});
