/**
 * Guard 통합 테스트 — `useMe()` + `resolveGuardDecision` 이 실제 Mock 위에서 동작하는가.
 * AC-2-43 · AC-2-44 · AC-2-07 · AC-2-17.
 */
import { HaruApiError, type AuthSession } from '@haru/contracts';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '../../../app/providers/AppProviders';
import { createQueryClient } from '../../../app/providers/QueryProvider';
import type { ApiClients } from '../../../shared/api/types';
import type { AuthGateway } from '../../../shared/auth';
import { ROUTES } from '../../../shared/config/routes';
import { createHarness } from '../../../test/harness';
import { RouteGuard } from '../RouteGuard';

/** 현재 경로를 화면에 노출해 리다이렉트 결과를 관찰한다. */
function LocationProbe() {
  const location = useLocation();

  return <span data-testid="pathname">{location.pathname}</span>;
}

function GuardedTree() {
  return (
    <>
      <LocationProbe />
      <Routes>
        <Route
          path="*"
          element={
            <RouteGuard>
              <p>guarded content</p>
            </RouteGuard>
          }
        />
      </Routes>
    </>
  );
}

async function expectPath(expected: string): Promise<void> {
  await waitFor(() => {
    expect(screen.getByTestId('pathname').textContent).toBe(expected);
  });
}

describe('Guard 판정 — Mock me scenario 별 착지 경로', () => {
  it.each([
    ['me:consent-missing', ROUTES.auth.consent],
    ['me:vpc-pending', ROUTES.auth.verifyParent],
    ['me:vpc-failed', ROUTES.auth.verifyParent],
    // 로컬 draft 가 없으므로 프로필 안내로 간다 (`§11.19` 7-2).
    ['me:onboarding-incomplete', ROUTES.onboarding.start],
  ])('%s → %s', async (scenario, expected) => {
    const { bundle, wrapper: Wrapper } = createHarness({
      scenarios: [scenario],
      initialEntries: [ROUTES.home],
    });

    await bundle.authGateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });

    render(
      <Wrapper>
        <GuardedTree />
      </Wrapper>,
    );

    await expectPath(expected);
  });

  it('me:success 면 요청 경로를 그대로 허용한다', async () => {
    const { bundle, wrapper: Wrapper } = createHarness({ initialEntries: [ROUTES.home] });

    await bundle.authGateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });

    render(
      <Wrapper>
        <GuardedTree />
      </Wrapper>,
    );

    expect(await screen.findByText('guarded content')).toBeDefined();
    await expectPath(ROUTES.home);
  });

  it('미인증이면 Welcome 으로 보낸다', async () => {
    const { wrapper: Wrapper } = createHarness({ initialEntries: [ROUTES.home] });

    render(
      <Wrapper>
        <GuardedTree />
      </Wrapper>,
    );

    await expectPath(ROUTES.auth.welcome);
  });

  it('미인증이어도 Trial 온보딩 경로는 허용한다 (AC-2-45)', async () => {
    const { wrapper: Wrapper } = createHarness({ initialEntries: ['/onboarding/child-info'] });

    render(
      <Wrapper>
        <GuardedTree />
      </Wrapper>,
    );

    expect(await screen.findByText('guarded content')).toBeDefined();
    await expectPath('/onboarding/child-info');
  });
});

describe('세션 만료 2회 실패 → /auth/log-in (AC-2-07)', () => {
  const SESSION: AuthSession = {
    userId: '11111111-1111-4111-8111-111111111111',
    accessToken: 'mock-access-token-1',
    expiresAt: '2026-01-01T01:00:00.000Z',
    provider: 'email',
  };

  /** refresh 가 불가능한 Gateway — `withAuthRefresh` 의 "2회 실패" 경로를 만든다. */
  function createExpiringGateway(): AuthGateway {
    let session: AuthSession | null = SESSION;
    const listeners = new Set<(next: AuthSession | null) => void>();

    return {
      getSession: () => Promise.resolve(session),
      onChange: (listener) => {
        listeners.add(listener);
        listener(session);
        return () => listeners.delete(listener);
      },
      signUpWithEmail: () => Promise.resolve({ session }),
      signInWithEmail: () => Promise.resolve({ session }),
      signInWithProvider: () => Promise.resolve({ session }),
      requestPasswordReset: () => Promise.resolve(),
      updatePassword: () => Promise.resolve(),
      refreshSession: () => Promise.resolve(null),
      signOut: () => {
        session = null;
        for (const listener of listeners) listener(null);
        return Promise.resolve();
      },
    };
  }

  const clients: ApiClients = {
    health: { get: () => Promise.reject(new Error('not used')) },
    me: {
      get: () => Promise.reject(new HaruApiError('AUTH_TOKEN_EXPIRED', 'expired')),
      update: () => Promise.reject(new Error('not used')),
    },
    consents: {
      getCurrentDocuments: () => Promise.reject(new Error('not used')),
      record: () => Promise.reject(new Error('not used')),
    },
    onboarding: {
      getState: () => Promise.reject(new Error('not used')),
      saveStep: () => Promise.reject(new Error('not used')),
      submit: () => Promise.reject(new Error('not used')),
    },
    books: {
      search: () => Promise.reject(new Error('not used')),
      getPrompts: () => Promise.reject(new Error('not used')),
    },
    home: { getSummary: () => Promise.reject(new Error('not used')) },
    activities: {
      getTodayCard: () => Promise.reject(new Error('not used')),
      selectOption: () => Promise.reject(new Error('not used')),
    },
    library: {
      getOverview: () => Promise.reject(new Error('not used')),
      getList: () => Promise.reject(new Error('not used')),
      addOwnBook: () => Promise.reject(new Error('not used')),
      getGiftRequests: () => Promise.reject(new Error('not used')),
      createGiftRequest: () => Promise.reject(new Error('not used')),
      saveBook: () => Promise.reject(new Error('not used')),
      unsaveBook: () => Promise.reject(new Error('not used')),
    },
    sessions: {
      create: () => Promise.reject(new Error('not used')),
      getDetail: () => Promise.reject(new Error('not used')),
      transition: () => Promise.reject(new Error('not used')),
      list: () => Promise.reject(new Error('not used')),
    },
    recordings: {
      init: () => Promise.reject(new Error('not used')),
      refreshTokens: () => Promise.reject(new Error('not used')),
      complete: () => Promise.reject(new Error('not used')),
      status: () => Promise.reject(new Error('not used')),
    },
    uploadTransport: {
      uploadPart: () => Promise.reject(new Error('not used')),
      resume: () => Promise.reject(new Error('not used')),
      abort: () => Promise.reject(new Error('not used')),
    },
    notifications: {
      getPreferences: () => Promise.reject(new Error('not used')),
      updatePreferences: () => Promise.reject(new Error('not used')),
      registerPushDevice: () => Promise.reject(new Error('not used')),
      deletePushDevice: () => Promise.reject(new Error('not used')),
    },
    reflections: {
      submit: () => Promise.reject(new Error('not used')),
    },
    analysis: {
      getStatus: () => Promise.reject(new Error('not used')),
    },
    children: {
      getProfile: () => Promise.reject(new Error('not used')),
      update: () => Promise.reject(new Error('not used')),
      setGrowthCapability: () => Promise.reject(new Error('not used')),
      getSurveyUpdate: () => Promise.reject(new Error('not used')),
      saveSurveyUpdateStep: () => Promise.reject(new Error('not used')),
      submitSurveyUpdate: () => Promise.reject(new Error('not used')),
    },
    progress: { getWeekly: () => Promise.reject(new Error('not used')) },
    reports: {
      getOverview: () => Promise.reject(new Error('not used')),
      list: () => Promise.reject(new Error('not used')),
      getDetail: () => Promise.reject(new Error('not used')),
      markViewed: () => Promise.reject(new Error('not used')),
    },
    reportPdf: {
      request: () => Promise.reject(new Error('not used')),
      getStatus: () => Promise.reject(new Error('not used')),
    },
    highlightClips: { getPlaybackUrl: () => Promise.reject(new Error('not used')) },
    dataManagement: {
      summary: () => Promise.reject(new Error('not used')),
      listRecordingSessions: () => Promise.reject(new Error('not used')),
      deleteSessionRecording: () => Promise.reject(new Error('not used')),
      createDeletionRequest: () => Promise.reject(new Error('not used')),
      getDeletionRequest: () => Promise.reject(new Error('not used')),
    },
    account: { deleteAccount: () => Promise.reject(new Error('not used')) },
  };

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[ROUTES.home]}>
        <AppProviders
          clients={clients}
          authGateway={createExpiringGateway()}
          queryClient={createQueryClient()}
        >
          {children}
        </AppProviders>
      </MemoryRouter>
    );
  }

  it('refresh 까지 실패하면 signOut 하고 로그인 화면으로 보낸다', async () => {
    const Wrapper = wrapper;

    render(
      <Wrapper>
        <GuardedTree />
      </Wrapper>,
    );

    await expectPath(ROUTES.auth.logIn);
  });
});
