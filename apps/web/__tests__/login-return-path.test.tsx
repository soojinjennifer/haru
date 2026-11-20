/**
 * 로그인 후 원래 경로로 복귀 — Stage 7 **AC-7-46** (`D7-6` ⑨).
 *
 * 실제 router + Route Guard + Mock Adapter. 미인증으로 보호된 deep link 를 열면 Guard 가 경로를 기억하고,
 * 로그인 성공 흐름이 Home 대신 그 경로로 보낸다. 기존 흐름(복귀 경로 없음 → Home · 동의 게이트 · 로그아웃 후 로그인 →
 * Home)은 그대로여야 한다. 경로는 콘솔에 남지 않는다.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { authCopy } from '../src/features/auth/copy';
import { settingsCopy } from '../src/features/settings';
import { MOCK_REPORT_IDS } from '../src/mocks/fixtures/reports';
import { progressReportPath, ROUTES } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { AUTH_RETURN_STATE } from '../src/shared/lib/in-app-history';
import { returnPathStore } from '../src/shared/lib/return-path';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const REPORT_PATH = progressReportPath(MOCK_REPORT_IDS.latest);

function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <span data-testid="location">{`${location.pathname}${location.search}`}</span>
      <span data-testid="location-state">{JSON.stringify(location.state ?? null)}</span>
    </>
  );
}

function locationState(): unknown {
  return JSON.parse(screen.getByTestId('location-state').textContent ?? 'null');
}

let consoleCalls: unknown[][];

beforeEach(() => {
  consoleCalls = [];
  for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
    vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      consoleCalls.push(args);
    });
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderAt(path: string, scenarios: readonly string[] = []): Harness {
  const harness = createHarness({ initialEntries: [path], scenarios });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  return harness;
}

async function expectLocation(expected: string): Promise<void> {
  await waitFor(() => {
    expect(screen.getByTestId('location').textContent).toBe(expected);
  });
}

async function logInFromLogInPage(): Promise<void> {
  fireEvent.change(await screen.findByLabelText(authCopy.logIn.emailLabel), {
    target: { value: CREDENTIALS.email },
  });
  fireEvent.change(screen.getByLabelText(authCopy.logIn.passwordLabel), {
    target: { value: CREDENTIALS.password },
  });
  fireEvent.click(screen.getByRole('button', { name: authCopy.logIn.submit }));
}

describe('미인증 deep link → 로그인 → 원래 경로 (AC-7-46)', () => {
  it('`/progress/reports/:id` → Welcome → Log in → 리포트 상세 (Home 아님)', async () => {
    renderAt(REPORT_PATH);
    await expectLocation(ROUTES.auth.welcome);
    expect(returnPathStore.peek()).toBe(REPORT_PATH);

    fireEvent.click(await screen.findByRole('button', { name: authCopy.welcome.logIn }));
    await expectLocation(ROUTES.auth.logIn);
    await logInFromLogInPage();

    await expectLocation(REPORT_PATH);
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: appCopy.guard.loadingLabel })).toBeNull();
    });
    // 도달하면 지운다 — 다음 로그인은 Home 기본값
    await waitFor(() => {
      expect(returnPathStore.peek()).toBeNull();
    });
  });

  it('복귀 이동은 로그인 복귀 표식(router state)을 싣는다 — 상세 Back = `/progress` 판정용 (D7-7)', async () => {
    renderAt(REPORT_PATH);
    await expectLocation(ROUTES.auth.welcome);
    fireEvent.click(await screen.findByRole('button', { name: authCopy.welcome.logIn }));
    await expectLocation(ROUTES.auth.logIn);
    await logInFromLogInPage();
    await expectLocation(REPORT_PATH);
    expect(locationState()).toEqual(AUTH_RETURN_STATE);
  });

  it('query 를 포함한 보호 경로도 그대로 복귀한다 (`/progress?week=…`)', async () => {
    renderAt(`${ROUTES.progress}?week=2026-05-04`);
    await expectLocation(ROUTES.auth.welcome);
    fireEvent.click(await screen.findByRole('button', { name: authCopy.welcome.logIn }));
    await logInFromLogInPage();
    await expectLocation(`${ROUTES.progress}?week=2026-05-04`);
  });

  it('화면이 직접 이동하지 않는 로그인 성공(소셜 경로) — Guard 규칙 6 이 기억한 경로로 보낸다', async () => {
    const harness = renderAt(REPORT_PATH);
    await expectLocation(ROUTES.auth.welcome);
    // 소셜 로그인처럼 화면이 직접 이동하지 않는 성공 — Guard 규칙 6 이 목적지를 정한다
    await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
    await harness.queryClient.invalidateQueries();
    await expectLocation(REPORT_PATH);
    // Guard 복귀 이동도 같은 표식을 싣는다 (D7-7) — 브라우저에서는 이 경로가 LogInPage 이동보다 먼저 일어난다
    expect(locationState()).toEqual(AUTH_RETURN_STATE);
  });

  it('경로 · 리포트 id 를 콘솔에 남기지 않는다', async () => {
    renderAt(REPORT_PATH);
    await expectLocation(ROUTES.auth.welcome);
    fireEvent.click(await screen.findByRole('button', { name: authCopy.welcome.logIn }));
    await logInFromLogInPage();
    await expectLocation(REPORT_PATH);
    const logged = JSON.stringify(consoleCalls);
    expect(logged.includes(MOCK_REPORT_IDS.latest)).toBe(false);
    expect(logged.includes('/progress/reports')).toBe(false);
  });
});

describe('기존 흐름 유지 (Stage 2)', () => {
  it('복귀 경로 없음 — `/auth/log-in` 에서 로그인 → Home', async () => {
    renderAt(ROUTES.auth.logIn);
    await logInFromLogInPage();
    await expectLocation(ROUTES.home);
    // Home 이동에는 복귀 표식을 싣지 않는다 (D7-7 — Stage 2 이동 그대로)
    expect(locationState()).toBeNull();
  });

  it('동의 누락이면 복귀 경로보다 동의 게이트가 먼저다', async () => {
    renderAt(REPORT_PATH, ['me:consent-missing']);
    await expectLocation(ROUTES.auth.welcome);
    fireEvent.click(await screen.findByRole('button', { name: authCopy.welcome.logIn }));
    await logInFromLogInPage();
    await expectLocation(ROUTES.auth.consent);
  });

  it('온보딩 미완료면 온보딩 입구가 먼저다', async () => {
    renderAt(REPORT_PATH, ['me:onboarding-incomplete']);
    await expectLocation(ROUTES.auth.welcome);
    fireEvent.click(await screen.findByRole('button', { name: authCopy.welcome.logIn }));
    await logInFromLogInPage();
    await expectLocation(ROUTES.onboarding.start);
  });

  it('로그아웃은 복귀 경로로 기억하지 않는다 — 다시 로그인하면 Home', async () => {
    const harness = createHarness({ initialEntries: [ROUTES.settings] });
    await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
    const Wrapper = harness.wrapper;
    render(
      <Wrapper>
        <LocationProbe />
        <AppRoutes />
      </Wrapper>,
    );
    fireEvent.click(await screen.findByRole('button', { name: settingsCopy.logOut.rowLabel }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: settingsCopy.logOut.confirmLabel }));
    await expectLocation(ROUTES.auth.welcome);
    expect(returnPathStore.peek()).toBeNull();

    fireEvent.click(await screen.findByRole('button', { name: authCopy.welcome.logIn }));
    await logInFromLogInPage();
    await expectLocation(ROUTES.home);
  });
});
