/**
 * Home skeleton · 설정 · 로그아웃 — **AC-2-29** · **AC-2-39** · **AC-2-40** · **AC-2-41**
 * (+ AC-2-13 요청 로그, AC-2-38 문구 규칙).
 *
 * 결정 **#33**(Home 은 골격) · **C13-12**(설정 = 로그아웃 1행) · **D-7**(ConfirmDialog) ·
 * **D-3**(로그아웃 시 로컬 draft 삭제 — 삭제 시점 ②).
 *
 * 클릭은 `fireEvent` 로 한다 — 이 저장소는 `@testing-library/user-event` 를 쓰지 않는다
 * (신규 의존 추가는 승인 사항이다). 실제 포인터·키 입력은 `e2e/home.spec.ts` 가 덮는다.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ONBOARDING_DRAFT_SCHEMA_VERSION,
  ONBOARDING_INSTRUMENT_CODE,
  ONBOARDING_INSTRUMENT_VERSION,
  type OnboardingDraft,
} from '@haru/contracts';

import { AppProviders } from '../src/app/providers/AppProviders';
import { createQueryClient } from '../src/app/providers/QueryProvider';
import { AppRoutes } from '../src/app/router';
import { settingsCopy } from '../src/features/settings/copy';
import { SettingsMenu } from '../src/features/settings/ui/SettingsMenu';
import { createMockApiClientsBundle } from '../src/mocks';
import { findChildDataKeys } from '../src/mocks/request-log';
import { createImmediateTimer } from '../src/shared/api/helpers';
import { ROUTES } from '../src/shared/config/routes';
import { homeCopy } from '../src/shared/copy/home-copy';
import { createFixedClock } from '../src/shared/lib/clock';
import {
  createOnboardingDraftStore,
  ONBOARDING_DRAFT_STORAGE_KEY,
} from '../src/shared/lib/onboarding-draft';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const NOW = Date.UTC(2026, 8, 26, 12, 0, 0);

const DRAFT: OnboardingDraft = {
  schemaVersion: ONBOARDING_DRAFT_SCHEMA_VERSION,
  instrument: { code: ONBOARDING_INSTRUMENT_CODE, version: ONBOARDING_INSTRUMENT_VERSION },
  currentStep: 'books_and_interests',
  answers: { child_info: { firstName: 'Nova' } },
  updatedAt: new Date(NOW).toISOString(),
};

/** 현재 경로를 노출해 Guard 리다이렉트 결과를 관찰한다. */
function LocationProbe() {
  const location = useLocation();

  return <span data-testid="pathname">{location.pathname}</span>;
}

/** 로그인한 상태로 앱을 띄운다 — 기본 `me` 는 온보딩까지 완료된 사용자다. */
async function renderSignedIn(path: string = ROUTES.home): Promise<Harness> {
  const harness = createHarness({ initialEntries: [path] });
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

async function expectPath(expected: string): Promise<void> {
  await waitFor(() => {
    expect(screen.getByTestId('pathname').textContent).toBe(expected);
  });
}

/** 이 기기에 남아 있는 온보딩 draft 를 seed 한다 (Trial 응답 = 아동 데이터). */
function seedDraft(): void {
  createOnboardingDraftStore({ clock: createFixedClock(NOW) }).write(DRAFT);
}

async function openLogOutDialog(): Promise<HTMLElement> {
  fireEvent.click(await screen.findByRole('button', { name: settingsCopy.logOut.rowLabel }));

  return screen.findByRole('alertdialog');
}

function haruStorageKeys(): string[] {
  const storage = globalThis.localStorage;

  return Array.from({ length: storage.length }, (_unused, index) => storage.key(index)).filter(
    (key): key is string => key !== null && key.startsWith('haru.'),
  );
}

afterEach(() => {
  globalThis.localStorage.clear();
});

describe('`/` Home skeleton (AC-2-39 · #33)', () => {
  it('온보딩을 마친 사용자가 `/` 에 착지한다', async () => {
    await renderSignedIn();

    await expectPath(ROUTES.home);
    expect(
      await screen.findByRole('heading', { level: 1, name: homeCopy.empty.title }),
    ).toBeDefined();
  });

  it('워드마크와 설정 아이콘만 있는 헤더다', async () => {
    await renderSignedIn();

    const header = await screen.findByRole('banner');
    expect(within(header).getByText(homeCopy.wordmark)).toBeDefined();
    expect(within(header).getByRole('button', { name: settingsCopy.entryLabel })).toBeDefined();
    // streak chip(`26:40`)·뒤로가기 등 다른 조작은 없다.
    expect(within(header).getAllByRole('button')).toHaveLength(1);
  });

  it('본문은 CTA 없는 EmptyState 다', async () => {
    await renderSignedIn();

    expect(await screen.findByText(homeCopy.empty.description)).toBeDefined();
    // 화면 전체에서 조작 가능한 것은 헤더의 설정 아이콘 하나뿐이다.
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('Activity Card · streak · 캐릭터 · BottomTabBar 를 마운트하지 않는다 (Stage 3)', async () => {
    await renderSignedIn();
    await screen.findByRole('banner');

    // BottomTabBar 는 `navigation` 랜드마크다.
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(document.querySelector('.haru-tab-bar')).toBeNull();
    expect(document.querySelector('.haru-deck')).toBeNull();
    expect(document.querySelector('.haru-bubble')).toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('contract 호출이 0건이다 — Home 은 `GET /v1/me` 밖의 요청을 만들지 않는다', async () => {
    const harness = await renderSignedIn();
    await screen.findByRole('banner');

    const operations = harness.bundle.requestLog.entries().map((entry) => entry.operation);

    expect(operations.filter((operation) => operation.includes('/v1/children'))).toStrictEqual([]);
    expect(operations.filter((operation) => operation.includes('activity'))).toStrictEqual([]);
    expect(operations.filter((operation) => operation.includes('home'))).toStrictEqual([]);
  });
});

describe('`/settings` (AC-2-40 · C13-12)', () => {
  it('Home 의 설정 아이콘이 `/settings` 로 보낸다', async () => {
    await renderSignedIn();

    fireEvent.click(await screen.findByRole('button', { name: settingsCopy.entryLabel }));

    await expectPath(ROUTES.settings);
    expect(screen.getByRole('heading', { level: 1, name: settingsCopy.title })).toBeDefined();
  });

  it('목록 항목이 로그아웃 1행뿐이다', async () => {
    await renderSignedIn(ROUTES.settings);

    const list = await screen.findByRole('list', { name: settingsCopy.menuLabel });
    const items = within(list).getAllByRole('listitem');

    expect(items).toHaveLength(1);
    expect(within(items[0] as HTMLElement).getByRole('button').textContent).toContain(
      settingsCopy.logOut.rowLabel,
    );
  });

  it('데이터 관리 · 탈퇴 · 동의 이력 · 알림 설정 행이 없다 (Stage 3 · 6 · 8)', async () => {
    await renderSignedIn(ROUTES.settings);
    await screen.findByRole('list', { name: settingsCopy.menuLabel });

    for (const label of [
      /delete account/i,
      /manage data/i,
      /consent history/i,
      /notification/i,
      /child profile/i,
    ]) {
      expect(screen.queryByText(label)).toBeNull();
    }
  });
});

describe('로그아웃 (AC-2-29 · AC-2-41 · D-7 · D-3)', () => {
  it('행을 눌러도 바로 로그아웃하지 않고 확인 Dialog 를 띄운다', async () => {
    seedDraft();
    await renderSignedIn(ROUTES.settings);

    const dialog = await openLogOutDialog();

    expect(within(dialog).getByText(settingsCopy.logOut.confirmTitle)).toBeDefined();
    // 되돌릴 수 없는 로컬 삭제를 미리 알린다 (D-7).
    expect(within(dialog).getByText(settingsCopy.logOut.confirmDescription)).toBeDefined();
    // 아직 아무것도 지우지 않았다.
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).not.toBeNull();
    await expectPath(ROUTES.settings);
  });

  it('destructive 라 초기 포커스가 취소다', async () => {
    await renderSignedIn(ROUTES.settings);

    const dialog = await openLogOutDialog();

    await waitFor(() => {
      expect(document.activeElement).toBe(
        within(dialog).getByRole('button', { name: settingsCopy.logOut.cancelLabel }),
      );
    });
  });

  it('취소하면 세션도 로컬 draft 도 그대로다', async () => {
    seedDraft();
    await renderSignedIn(ROUTES.settings);

    const dialog = await openLogOutDialog();
    fireEvent.click(within(dialog).getByRole('button', { name: settingsCopy.logOut.cancelLabel }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).not.toBeNull();
    await expectPath(ROUTES.settings);
  });

  it('확인하면 로컬 draft · Query 캐시가 비고 Guard 가 `/auth/welcome` 으로 보낸다', async () => {
    seedDraft();
    const harness = await renderSignedIn(ROUTES.settings);

    // 로그아웃 전에는 `GET /v1/me` 응답이 캐시에 있다.
    await waitFor(() => {
      expect(harness.queryClient.getQueryCache().getAll().length).toBeGreaterThan(0);
    });

    const dialog = await openLogOutDialog();
    fireEvent.click(within(dialog).getByRole('button', { name: settingsCopy.logOut.confirmLabel }));

    await expectPath(ROUTES.auth.welcome);

    // AC-2-29 — 저장소 전수 검사: HARU 가 쓴 키가 하나도 남지 않는다.
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
    expect(haruStorageKeys()).toStrictEqual([]);
    // 캐시에 **남은 데이터**가 0건이다. Welcome 화면의 `useMe` 가 곧바로 비활성 observer 를
    // 다시 등록하므로 "항목 수 0" 이 아니라 "보관된 응답 0" 으로 확인한다.
    expect(
      harness.queryClient
        .getQueryCache()
        .getAll()
        .filter((query) => query.state.data !== undefined),
    ).toStrictEqual([]);
  });

  it('로그아웃 요청에 아동 데이터가 실리지 않는다 (AC-2-13)', async () => {
    seedDraft();
    const harness = await renderSignedIn(ROUTES.settings);

    const dialog = await openLogOutDialog();
    fireEvent.click(within(dialog).getByRole('button', { name: settingsCopy.logOut.confirmLabel }));
    await expectPath(ROUTES.auth.welcome);

    const signOutEntries = harness.bundle.requestLog
      .entries()
      .filter((entry) => entry.operation === 'AuthGateway.signOut');

    expect(signOutEntries).toHaveLength(1);
    expect(findChildDataKeys(signOutEntries)).toStrictEqual([]);
  });

  it('`signOut()` 이 실패해도 로컬 draft 는 지우고 안내를 보여준다', async () => {
    seedDraft();

    const bundle = createMockApiClientsBundle({ timer: createImmediateTimer() });
    await bundle.authGateway.signInWithEmail({ ...CREDENTIALS });

    const failingGateway = {
      ...bundle.authGateway,
      signOut: () => Promise.reject(new Error('offline')),
    };

    render(
      <MemoryRouter initialEntries={[ROUTES.settings]}>
        <AppProviders
          clients={bundle.clients}
          authGateway={failingGateway}
          queryClient={createQueryClient()}
        >
          <SettingsMenu />
        </AppProviders>
      </MemoryRouter>,
    );

    const dialog = await openLogOutDialog();
    fireEvent.click(within(dialog).getByRole('button', { name: settingsCopy.logOut.confirmLabel }));

    expect(await screen.findByText(settingsCopy.logOut.errorTitle)).toBeDefined();
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
  });
});

describe('문구 규칙 (AC-2-38)', () => {
  it('Home · 설정 문구에 진단 · 판정 · 비교 표현이 없다', () => {
    const texts = [
      homeCopy.wordmark,
      ...Object.values(homeCopy.empty),
      settingsCopy.title,
      settingsCopy.menuLabel,
      ...Object.values(settingsCopy.logOut),
    ];

    for (const text of texts) {
      expect(text).not.toMatch(
        /\b(diagnos|assessment|evaluate|evaluation|score|percentile|compared? (to|with)|better than|worse than)\b/i,
      );
    }
  });
});
