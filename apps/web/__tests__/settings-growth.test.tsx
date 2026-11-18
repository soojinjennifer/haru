/**
 * 발전 역량 설정 모드 route — Stage 6 `S6-D` (Spec §2.3 settings · §2.3.1 · §2.4 · §10.2,
 * AC-6-16(Growth focus 행) · 30 · 31 · 32 · 64 의 route 부분).
 *
 * 컴포넌트 동작(설정 모드 구성·저장·실패)은 `growth-capability.test.tsx` 가 컴포넌트를 직접 띄워 본다.
 * 여기서는 **실제 앱 조립**(`createHarness` + `AppRoutes`)으로 설정 목록 행 → route → TopBar → 저장 → 뒤로와
 * 캐시 전파(Plan §5.2)를 본다. 기대값(현재값)은 같은 Mock 번들의 `GET /profile` 응답에서 읽는다.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Capability } from '@haru/contracts';
import { useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { activityCardKeys } from '../src/entities/activity-card';
import { CAPABILITY_AXIS_ORDER, childProfileKeys } from '../src/entities/child-profile';
import { homeKeys } from '../src/entities/home';
import { childProfileViewCopy } from '../src/features/child-profile-view';
import { growthCapabilityCopy as copy } from '../src/features/growth-capability';
import { settingsCopy } from '../src/features/settings/copy';
import { MOCK_CHILD_ID } from '../src/mocks';
import { appCopy } from '../src/shared/copy/app-copy';
import { capabilityCopy } from '../src/shared/copy/capability-copy';
import { networkErrorCopy, retryLabel } from '../src/shared/copy/error-copy';
import { ROUTES } from '../src/shared/config/routes';
import { createHarness, type Harness } from '../src/test/harness';

const GROWTH_PUT = 'PUT /v1/children/:childId/growth-capability';

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

const pathname = () => screen.getByTestId('pathname').textContent;

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
      <AppRoutes />
    </Wrapper>,
  );
  await waitFor(() => {
    expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
  });
  return harness;
}

/** 설정 목록에서 *Growth focus* 행을 눌러 들어온다 — 뒤로 목적지가 설정 목록이다. */
async function openFromSettings(scenarios: readonly string[] = []): Promise<Harness> {
  const harness = await renderAt([ROUTES.settings], scenarios);
  fireEvent.click(await screen.findByRole('button', { name: settingsCopy.rows.growthFocus }));
  await waitFor(() => expect(pathname()).toBe(ROUTES.settingsGrowthCapability));
  return harness;
}

function view(): HTMLElement | null {
  return document.querySelector('.haru-growth-focus');
}

async function ready(): Promise<HTMLElement> {
  await waitFor(() => expect(view()?.querySelector('[data-state="ready"]')).toBeTruthy());
  return view() as HTMLElement;
}

function radio(capability: Capability, meta?: string): HTMLInputElement {
  const name =
    meta === undefined ? capabilityCopy[capability] : `${capabilityCopy[capability]} ${meta}`;
  return screen.getByRole('radio', { name }) as HTMLInputElement;
}

const saveButton = () => screen.getByRole('button', { name: copy.settings.cta });

const puts = (harness: Harness) =>
  harness.bundle.requestLog.entries().filter((entry) => entry.operation === GROWTH_PUT);

async function currentOf(harness: Harness): Promise<Capability> {
  const profile = await harness.bundle.clients.children.getProfile({ childId: MOCK_CHILD_ID });
  if (profile.growthCapability === null) throw new Error('fixture must have a current value');
  return profile.growthCapability;
}

describe('설정 행 *Profile* → `/settings/profile` 재방문 모드 (D6-4 · AC-6-63)', () => {
  it('행 → route · `mode="revisit"` · TopBar "Profile" = 유일한 h1 · CTA `Next` 없음 · 뒤로 → 설정 목록', async () => {
    await renderAt([ROUTES.settings]);
    fireEvent.click(await screen.findByRole('button', { name: settingsCopy.rows.profile }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsProfile));
    await waitFor(() =>
      expect(document.querySelector('.haru-profile-view [data-state="ready"]')).toBeTruthy(),
    );

    expect(document.querySelector('.haru-profile-view')?.getAttribute('data-mode')).toBe('revisit');
    expect(screen.getAllByRole('heading', { level: 1 }).map((node) => node.textContent)).toEqual([
      childProfileViewCopy.revisit.topBarTitle,
    ]);
    expect(screen.queryByRole('button', { name: childProfileViewCopy.onboarding.next })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: childProfileViewCopy.revisit.backLabel }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
  });
});

describe('route `/settings/growth-capability` (S6-D · Spec §2.3 settings)', () => {
  it('설정 행 → route · 같은 컴포넌트 `mode="settings"` · TopBar "Growth focus" = 유일한 h1 · 뒤로 버튼', async () => {
    await openFromSettings();
    const root = await ready();

    expect(root.getAttribute('data-mode')).toBe('settings');
    expect(screen.getAllByRole('heading', { level: 1 }).map((node) => node.textContent)).toEqual([
      copy.settings.topBarTitle,
    ]);
    expect(screen.getByRole('button', { name: copy.settings.backLabel })).toBeTruthy();
    expect(screen.getByText(copy.intro.noSuggestion)).toBeTruthy();
  });

  it('현재값 "Current" 선택 · Save 비활성 · 뒤로 → 설정 목록 · PUT 0', async () => {
    const harness = await openFromSettings();
    await ready();
    const current = await currentOf(harness);

    expect(radio(current, copy.settings.meta).checked).toBe(true);
    expect(saveButton().getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: copy.settings.backLabel }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
    expect(puts(harness)).toHaveLength(0);
  });

  it('바꾼 뒤 뒤로 — 확인 Dialog 없음 (`N6-46`)', async () => {
    const harness = await openFromSettings();
    await ready();
    const current = await currentOf(harness);
    const other = CAPABILITY_AXIS_ORDER.find((capability) => capability !== current) as Capability;

    fireEvent.click(radio(other));
    fireEvent.click(screen.getByRole('button', { name: copy.settings.backLabel }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('저장 → PUT 1건 → Toast → 설정 목록 · 프로필 캐시 = 응답 · Home · 오늘 카드 무효화 (Plan §5.2)', async () => {
    const harness = await openFromSettings();
    await ready();
    const current = await currentOf(harness);
    const other = CAPABILITY_AXIS_ORDER.find((capability) => capability !== current) as Capability;

    // 무효화 대상을 미리 캐시에 둔다 — 저장 성공 후 stale 로 바뀌어야 한다
    harness.queryClient.setQueryData([...homeKeys.all, 'probe'], 1);
    harness.queryClient.setQueryData([...activityCardKeys.all, 'probe'], 1);

    fireEvent.click(radio(other));
    fireEvent.click(saveButton());
    fireEvent.click(saveButton());

    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
    expect(await screen.findByText(copy.settings.savedToast)).toBeTruthy();
    expect(puts(harness).map((entry) => entry.payload)).toEqual([{ capability: other }]);

    const cached = harness.queryClient.getQueryData<{ growthCapability: Capability | null }>(
      childProfileKeys.detail(MOCK_CHILD_ID),
    );
    expect(cached?.growthCapability).toBe(other);
    expect(harness.queryClient.getQueryState([...homeKeys.all, 'probe'])?.isInvalidated).toBe(true);
    expect(
      harness.queryClient.getQueryState([...activityCardKeys.all, 'probe'])?.isInvalidated,
    ).toBe(true);

    // 재진입 — 새 값이 "Current"
    fireEvent.click(await screen.findByRole('button', { name: settingsCopy.rows.growthFocus }));
    await ready();
    expect(radio(other, copy.settings.meta).checked).toBe(true);
  });

  it('저장 실패(offline) → 오프라인 안내 · 선택 보존 · 화면 유지 · 캐시 불변', async () => {
    const harness = await openFromSettings(['children.setgrowthcapability:offline']);
    await ready();
    const current = await currentOf(harness);
    const other = CAPABILITY_AXIS_ORDER.find((capability) => capability !== current) as Capability;

    fireEvent.click(radio(other));
    fireEvent.click(saveButton());
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(copy.offline.title);
    expect(radio(other).checked).toBe(true);
    expect(pathname()).toBe(ROUTES.settingsGrowthCapability);
    expect(
      harness.queryClient.getQueryData<{ growthCapability: Capability | null }>(
        childProfileKeys.detail(MOCK_CHILD_ID),
      )?.growthCapability,
    ).toBe(current);
  });

  it('Loading → Skeleton(aria-busy) → 화면', async () => {
    await openFromSettings(['children:loading']);
    expect(await screen.findByRole('status', { name: copy.loading })).toBeTruthy();
    await ready();
  });

  it('조회 오프라인 → ErrorState(h2, 오프라인 문구) + Try again · Continue to Home 없음', async () => {
    await openFromSettings(['children:offline']);
    await waitFor(() => expect(view()?.querySelector('[data-state="error"]')).toBeTruthy());
    expect(screen.getByRole('heading', { level: 2, name: networkErrorCopy.title })).toBeTruthy();
    expect(screen.getByRole('button', { name: retryLabel })).toBeTruthy();
    expect(screen.queryByRole('button', { name: copy.onboarding.continueToHome })).toBeNull();
  });

  it('`all-scores-missing` — 현재값 없음 → 미선택 · Save 비활성 + 사유', async () => {
    await openFromSettings(['children:all-scores-missing']);
    await ready();
    for (const capability of CAPABILITY_AXIS_ORDER) expect(radio(capability).checked).toBe(false);
    expect(saveButton().getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByText(copy.disabledReason)).toBeTruthy();
  });
});
