/**
 * 발전 역량 한 컴포넌트 2모드 — Stage 6 `S6-E2` (Spec §2.3 · §2.3.1 · §2.3.2 · §3.2 · §9.1 · §10.2,
 * AC-6-53(profile → growth → Home 구간) · 54 · 55 · 61 · 62 · 64 · 65 의 컴포넌트 부분).
 *
 * - 온보딩 모드는 실제 앱과 같은 조립(`createHarness` + `AppRoutes`)으로 route 를 직접 연다.
 * - 설정 모드는 **컴포넌트를 직접** 같은 조립 안에 띄운다 — route 연결(`S6-D`)은 `settings-growth.test.tsx` 가 본다.
 * 기대값(제시값·점수)은 같은 Mock 번들의 `GET /profile` 응답에서 읽는다.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { Capability, ChildProfile } from '@haru/contracts';
import { Route, Routes, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { CAPABILITY_AXIS_ORDER } from '../src/entities/child-profile';
import { childProfileViewCopy } from '../src/features/child-profile-view';
import {
  GrowthCapabilityPicker,
  growthCapabilityCopy as copy,
} from '../src/features/growth-capability';
import { MOCK_CHILD_ID } from '../src/mocks';
import { appCopy } from '../src/shared/copy/app-copy';
import { capabilityCopy } from '../src/shared/copy/capability-copy';
import { networkErrorCopy, retryLabel, unknownErrorCopy } from '../src/shared/copy/error-copy';
import { ROUTES } from '../src/shared/config/routes';
import { createHarness } from '../src/test/harness';

const GROWTH_PUT = 'PUT /v1/children/:childId/growth-capability';
const SETTINGS_PATH = '/__test/settings-growth';

afterEach(() => {
  vi.restoreAllMocks();
});

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
  });
}

async function signedInHarness(path: string, scenarios: readonly string[]) {
  const harness = createHarness({ scenarios, initialEntries: [path] });
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
  return harness;
}

async function renderOnboarding(
  scenarios: readonly string[] = [],
  path = ROUTES.onboarding.growthCapability,
) {
  const harness = await signedInHarness(path, scenarios);
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  await waitForGuard();
  return harness;
}

/** 설정 모드 — 앞 화면(`/settings`) 위에 쌓아 `navigate(-1)` 목적지를 만든다. */
async function renderSettings(scenarios: readonly string[] = []) {
  const harness = createHarness({ scenarios, initialEntries: [ROUTES.settings, SETTINGS_PATH] });
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <Routes>
        <Route path={ROUTES.settings} element={<span>settings list</span>} />
        <Route path={SETTINGS_PATH} element={<GrowthCapabilityPicker mode="settings" />} />
      </Routes>
    </Wrapper>,
  );
  return harness;
}

async function profileOf(
  harness: Awaited<ReturnType<typeof signedInHarness>>,
): Promise<ChildProfile> {
  return harness.bundle.clients.children.getProfile({ childId: MOCK_CHILD_ID });
}

function view(): HTMLElement {
  return document.querySelector('.haru-growth-focus') as HTMLElement;
}

async function ready(): Promise<HTMLElement> {
  await waitFor(() => expect(view().querySelector('[data-state="ready"]')).not.toBeNull());
  return view();
}

function radio(capability: Capability, meta?: string): HTMLInputElement {
  const name =
    meta === undefined ? capabilityCopy[capability] : `${capabilityCopy[capability]} ${meta}`;
  return screen.getByRole('radio', { name }) as HTMLInputElement;
}

function cta(label: string): HTMLButtonElement {
  return screen.getByRole('button', { name: label }) as HTMLButtonElement;
}

function puts(harness: Awaited<ReturnType<typeof signedInHarness>>) {
  return harness.bundle.requestLog.entries().filter((entry) => entry.operation === GROWTH_PUT);
}

const pathname = () => screen.getByTestId('pathname').textContent;

describe('온보딩 모드 `/onboarding/growth-capability` (Spec §2.3 · AC-6-61)', () => {
  it('구성: TopBar 뒤로(제목 없음) · h1 · 제안 문구 · 차트(축 탭) · RadioGroup · 설명 · 변경 안내 · CTA', async () => {
    const harness = await renderOnboarding();
    const root = await ready();
    const profile = await profileOf(harness);
    const suggested = profile.growthCapability;
    if (suggested === null) throw new Error('fixture must suggest');

    // h1 은 본문 하나 — TopBar 는 제목 없이 뒤로만 (Spec §2.3)
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.map((node) => node.textContent)).toEqual([copy.onboarding.title]);
    expect(screen.getByRole('button', { name: copy.onboarding.backLabel })).toBeTruthy();
    expect(screen.getByText(copy.intro.suggested)).toBeTruthy();

    // 차트 = selectable · role img 1개 · 축 버튼은 aria-hidden + tabIndex −1 (선택 수단 1벌)
    expect(screen.getAllByRole('img')).toHaveLength(1);
    const axisButtons = [...root.querySelectorAll<HTMLButtonElement>('button.haru-diamond__label')];
    expect(axisButtons).toHaveLength(4);
    for (const button of axisButtons) {
      expect(button.tabIndex).toBe(-1);
      expect(button.getAttribute('aria-hidden')).toBe('true');
    }

    // RadioGroup — 그룹 이름 · 4옵션 · 축 순서 · 제시값 미리 선택 + "Suggested" (접근성 이름 포함)
    const group = screen.getByRole('group', { name: copy.legend });
    expect(within(group).getAllByRole('radio')).toHaveLength(4);
    expect(
      [...group.querySelectorAll('.haru-radio-group__label')].map((node) => node.textContent),
    ).toEqual(CAPABILITY_AXIS_ORDER.map((capability) => capabilityCopy[capability]));
    expect(radio(suggested, copy.onboarding.meta).checked).toBe(true);
    expect(group.querySelectorAll('.haru-radio-group__meta')).toHaveLength(1);

    // 선택 설명(live) · 변경 안내 · CTA 활성 · 사유 없음
    const live = root.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe(copy.descriptions[suggested]);
    expect(screen.getByText(copy.onboarding.changeLater)).toBeTruthy();
    expect(cta(copy.onboarding.cta).getAttribute('aria-disabled')).toBeNull();
    expect(screen.queryByText(copy.disabledReason)).toBeNull();
    // 숫자 0 (`N6-29`)
    expect(root.textContent).not.toMatch(/\d/);
  });

  it('축 탭 = RadioGroup 과 같은 state · "Suggested" 는 원래 옵션에 남는다 · 차트 선택 표시', async () => {
    const harness = await renderOnboarding();
    const root = await ready();
    const suggested = (await profileOf(harness)).growthCapability as Capability;
    const other = CAPABILITY_AXIS_ORDER.find(
      (capability) => capability !== suggested,
    ) as Capability;

    fireEvent.click(
      root.querySelector(`button.haru-diamond__label[data-axis="${other}"]`) as Element,
    );
    expect(radio(other).checked).toBe(true);
    expect(radio(suggested, copy.onboarding.meta).checked).toBe(false);
    expect(root.querySelector('[aria-live="polite"]')?.textContent).toBe(copy.descriptions[other]);
    expect(
      root.querySelector(`.haru-diamond__label--selected[data-axis="${other}"]`),
    ).not.toBeNull();
    expect(root.querySelector(`.haru-diamond__ring[data-axis="${other}"]`)).not.toBeNull();

    // 목록으로 되돌리면 차트도 따라온다
    fireEvent.click(radio(suggested, copy.onboarding.meta));
    expect(
      root.querySelector(`.haru-diamond__label--selected[data-axis="${suggested}"]`),
    ).not.toBeNull();
  });

  it('확정 → PUT(선택값) → Home (replace) · 프로필 캐시 = 응답 (AC-6-53 · 62)', async () => {
    const harness = await renderOnboarding();
    await ready();
    const suggested = (await profileOf(harness)).growthCapability as Capability;
    const other = CAPABILITY_AXIS_ORDER.find(
      (capability) => capability !== suggested,
    ) as Capability;

    fireEvent.click(radio(other));
    fireEvent.click(cta(copy.onboarding.cta));
    await waitFor(() => expect(pathname()).toBe(ROUTES.home));
    expect(puts(harness).map((entry) => entry.payload)).toEqual([{ capability: other }]);
    expect((await profileOf(harness)).growthCapability).toBe(other);
  });

  it('제시값 그대로 확정해도 PUT 1건 (서버가 확정 기록을 남긴다)', async () => {
    const harness = await renderOnboarding();
    await ready();
    fireEvent.click(cta(copy.onboarding.cta));
    await waitFor(() => expect(pathname()).toBe(ROUTES.home));
    expect(puts(harness)).toHaveLength(1);
  });

  it('제안 없음 `all-scores-missing` — 미선택 시작 · 무제안 문구 · CTA aria-disabled + 사유 연결 · 누름 무시', async () => {
    const harness = await renderOnboarding(['children:all-scores-missing']);
    const root = await ready();
    expect((await profileOf(harness)).growthCapability).toBeNull();

    expect(screen.getByText(copy.intro.noSuggestion)).toBeTruthy();
    expect(screen.getAllByRole('radio').every((node) => !(node as HTMLInputElement).checked)).toBe(
      true,
    );
    expect(root.querySelectorAll('.haru-radio-group__meta')).toHaveLength(0);
    const button = cta(copy.onboarding.cta);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    const reason = screen.getByText(copy.disabledReason);
    expect(button.getAttribute('aria-describedby')).toBe(reason.id);
    fireEvent.click(button);
    expect(puts(harness)).toHaveLength(0);
    expect(pathname()).toBe(ROUTES.onboarding.growthCapability);
  });

  it('null 축 역량도 선택·저장 가능 (`N6-11` ⓐ) — 선택하면 사유가 사라지고 CTA 활성', async () => {
    const harness = await renderOnboarding(['children:all-scores-missing']);
    await ready();
    fireEvent.click(radio('cognitive_flexibility'));
    expect(screen.queryByText(copy.disabledReason)).toBeNull();
    const button = cta(copy.onboarding.cta);
    expect(button.getAttribute('aria-disabled')).toBeNull();
    expect(button.getAttribute('aria-describedby')).toBeNull();
    fireEvent.click(button);
    await waitFor(() => expect(pathname()).toBe(ROUTES.home));
    expect(puts(harness).map((entry) => entry.payload)).toEqual([
      { capability: 'cognitive_flexibility' },
    ]);
  });

  it('변형 B — null 축 선택 시 차트 링이 외곽 끝점에 그려진다', async () => {
    await renderOnboarding(['children:scores-partially-missing']);
    const root = await ready();
    fireEvent.click(radio('cognitive_flexibility'));
    expect(
      root.querySelector('.haru-diamond__ring[data-axis="cognitive_flexibility"]'),
    ).not.toBeNull();
  });

  it('저장 실패 — 선택 보존 · CTA 위 InlineAlert(error) · 다시 누르면 재시도 → Home (AC-6-62)', async () => {
    const harness = await renderOnboarding(['children.setgrowthcapability:retry']);
    const root = await ready();
    const suggested = (await profileOf(harness)).growthCapability as Capability;
    const other = CAPABILITY_AXIS_ORDER.find(
      (capability) => capability !== suggested,
    ) as Capability;

    fireEvent.click(radio(other));
    fireEvent.click(cta(copy.onboarding.cta));
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(copy.saveFailed.title)).toBeTruthy();
    expect(within(alert).getByText(copy.saveFailed.description)).toBeTruthy();
    expect(radio(other).checked).toBe(true);
    expect(pathname()).toBe(ROUTES.onboarding.growthCapability);
    // InlineAlert 는 CTA 위
    const alertNode = root.querySelector('.haru-alert') as Element;
    expect(
      alertNode.compareDocumentPosition(cta(copy.onboarding.cta)) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.click(cta(copy.onboarding.cta));
    await waitFor(() => expect(pathname()).toBe(ROUTES.home));
    expect(puts(harness)).toHaveLength(2);
  });

  it('저장 실패 → 다른 역량을 고르면 안내가 사라진다 (선택 보존 원칙 유지)', async () => {
    await renderOnboarding(['children.setgrowthcapability:error']);
    await ready();
    fireEvent.click(cta(copy.onboarding.cta));
    await screen.findByRole('alert');
    fireEvent.click(radio('intrinsic_motivation'));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(radio('intrinsic_motivation').checked).toBe(true);
  });

  it('저장 오프라인 — 전용 문구 (기존 networkErrorCopy 아님)', async () => {
    await renderOnboarding(['children.setgrowthcapability:offline']);
    await ready();
    fireEvent.click(cta(copy.onboarding.cta));
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(copy.offline.title)).toBeTruthy();
    expect(within(alert).queryByText(networkErrorCopy.title)).toBeNull();
  });

  it('Loading — Skeleton (aria-busy · 이름 1개 · 차트 자리 · 행 4)', async () => {
    await renderOnboarding(['children:loading']);
    const status = await screen.findByRole('status', { name: copy.loading });
    expect(status.getAttribute('aria-busy')).toBe('true');
    expect(view().querySelector('.haru-growth-focus__chart-skeleton')).not.toBeNull();
    expect(view().querySelectorAll('.haru-growth-focus__row-skeleton')).toHaveLength(4);
  });

  it('조회 실패 — ErrorState(h1) + Try again + Continue to Home → Home (`N6-37` · AC-6-55)', async () => {
    await renderOnboarding(['children:error']);
    await waitFor(() => expect(view().querySelector('[data-state="error"]')).not.toBeNull());
    expect(screen.getByRole('heading', { level: 1, name: unknownErrorCopy.title })).toBeTruthy();
    expect(screen.getByRole('button', { name: retryLabel })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: copy.onboarding.continueToHome }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.home));
  });

  it('뒤로 → `/onboarding/profile` (`N6-24` ⓐ · AC-6-65)', async () => {
    await renderOnboarding();
    await ready();
    fireEvent.click(screen.getByRole('button', { name: copy.onboarding.backLabel }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.onboarding.profile));
  });
});

describe('흐름 profile → growth → Home (AC-6-53 · H6-2.4 ① 해소)', () => {
  it('프로필 Next → 발전 역량 화면이 열린다 (`:step` 에 잡히지 않는다)', async () => {
    await renderOnboarding([], ROUTES.onboarding.profile);
    await waitFor(() =>
      expect(document.querySelector('.haru-profile-view [data-state="ready"]')).not.toBeNull(),
    );
    fireEvent.click(screen.getByRole('button', { name: childProfileViewCopy.onboarding.next }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.onboarding.growthCapability));
    await ready();
    expect(screen.getByRole('heading', { level: 1, name: copy.onboarding.title })).toBeTruthy();
  });
});

describe('설정 모드 (Spec §2.3 settings · AC-6-30 · 64 — route 는 `settings-growth.test.tsx`)', () => {
  it('본문 제목 없음 · 무제안 안내 문장(`D6-8` 보충) · 현재값 선택 + "Current" · 변경 안내·Suggested 0 · Save 비활성(사유 문장 없음)', async () => {
    const harness = await renderSettings();
    const root = await ready();
    const current = (await profileOf(harness)).growthCapability as Capability;

    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0);
    expect(screen.getByText(copy.intro.noSuggestion)).toBeTruthy();
    expect(screen.queryByText(copy.intro.suggested)).toBeNull();
    expect(radio(current, copy.settings.meta).checked).toBe(true);
    expect(root.textContent).not.toContain(copy.onboarding.meta);
    expect(screen.queryByText(copy.onboarding.changeLater)).toBeNull();
    const save = cta(copy.settings.cta);
    expect(save.getAttribute('aria-disabled')).toBe('true');
    expect(screen.queryByText(copy.disabledReason)).toBeNull();
    fireEvent.click(save);
    expect(puts(harness)).toHaveLength(0);
  });

  it('바꾸면 Save 활성 · "Current" 는 원래 옵션 · 저장 → Toast "Saved" → 뒤로 (AC-6-31)', async () => {
    // 설정 목록에서 들어온 앱 안 기록이 있다 (MemoryRouter 는 window.history 를 쓰지 않는다) → 뒤로 = 이전 화면.
    // 기록이 없을 때의 부모 replace 는 Stage 8 `VG6-D-12` (`stage8-cleanup.test.tsx` · e2e) 가 본다.
    vi.spyOn(globalThis.history, 'state', 'get').mockReturnValue({ idx: 1 });
    const harness = await renderSettings();
    await ready();
    const current = (await profileOf(harness)).growthCapability as Capability;
    const other = CAPABILITY_AXIS_ORDER.find((capability) => capability !== current) as Capability;

    fireEvent.click(radio(other));
    expect(radio(current, copy.settings.meta).checked).toBe(false);
    const save = cta(copy.settings.cta);
    expect(save.getAttribute('aria-disabled')).toBeNull();
    fireEvent.click(save);
    await waitFor(() => expect(pathname()).toBe(ROUTES.settings));
    expect(await screen.findByText(copy.settings.savedToast)).toBeTruthy();
    expect(puts(harness).map((entry) => entry.payload)).toEqual([{ capability: other }]);
    expect((await profileOf(harness)).growthCapability).toBe(other);
  });

  it('원래 값으로 되돌리면 다시 비활성', async () => {
    const harness = await renderSettings();
    await ready();
    const current = (await profileOf(harness)).growthCapability as Capability;
    const other = CAPABILITY_AXIS_ORDER.find((capability) => capability !== current) as Capability;
    fireEvent.click(radio(other));
    fireEvent.click(radio(current, copy.settings.meta));
    expect(cta(copy.settings.cta).getAttribute('aria-disabled')).toBe('true');
  });

  it('저장 실패 — 이전 값 유지(캐시 불변) · 선택 보존 · 안내 (AC-6-31)', async () => {
    const harness = await renderSettings(['children.setgrowthcapability:error']);
    await ready();
    const current = (await profileOf(harness)).growthCapability as Capability;
    const other = CAPABILITY_AXIS_ORDER.find((capability) => capability !== current) as Capability;
    fireEvent.click(radio(other));
    fireEvent.click(cta(copy.settings.cta));
    await screen.findByRole('alert');
    expect(radio(other).checked).toBe(true);
    expect(radio(current, copy.settings.meta)).toBeTruthy();
    expect(pathname()).toBe(SETTINGS_PATH);
  });

  it('조회 실패 — ErrorState(h2) + Try again 만 (Continue to Home 없음)', async () => {
    await renderSettings(['children:error']);
    await waitFor(() => expect(view().querySelector('[data-state="error"]')).not.toBeNull());
    expect(screen.getByRole('heading', { level: 2, name: unknownErrorCopy.title })).toBeTruthy();
    expect(screen.queryByRole('button', { name: copy.onboarding.continueToHome })).toBeNull();
  });
});

describe('feature copy 금칙어 · 숫자 (Spec §10.5 · AC-6-33 · 42)', () => {
  const FORBIDDEN =
    /diagnos|score|rating|level|grade|assess|weak|strong|\blow\b|high|lowest|below|behind|average|normal|better|worse|peers|fail|invalid|error|!/i;

  function strings(value: unknown): string[] {
    if (typeof value === 'string') return [value];
    if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(strings);
    return [];
  }

  it('growthCapabilityCopy 전부 금칙어 0 · 숫자 0', () => {
    const all = strings(copy);
    expect(all.length).toBeGreaterThan(15);
    for (const text of all) {
      expect(text).not.toMatch(FORBIDDEN);
      expect(text).not.toMatch(/\d/);
    }
  });
});
