/**
 * 프로필 결과 2모드 — Stage 6 `S6-E1` (Spec §2.1 · §2.2 · §3.1~§3.6 · §9.2,
 * AC-6-34 · 35 · 36(온보딩 표시 0) · 37 · 38 · 53(saved → profile 구간) · 55 · 56 · 57 · 58 · 59 · 60 · 63 의 컴포넌트 부분).
 *
 * 실제 앱과 같은 조립(`createHarness` — Mock 번들 · Router · Guard)으로 route 를 직접 연다.
 * 기대값은 **같은 Mock 번들의 `GET /profile` 응답**에서 읽는다 — 화면이 응답 값을 그대로 쓰는지를 본다.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { Capability, ChildProfile } from '@haru/contracts';
import { diamondPercent, diamondPointOnAxis, diamondRadiusFraction } from '@haru/ui';
import { useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { CAPABILITY_AXIS_ORDER, childProfileCopy } from '../src/entities/child-profile';
import { childProfileViewCopy as copy } from '../src/features/child-profile-view';
import { onboardingCopy } from '../src/features/onboarding-survey/copy';
import { MOCK_CHILD_ID } from '../src/mocks';
import { appCopy } from '../src/shared/copy/app-copy';
import { capabilityCopy } from '../src/shared/copy/capability-copy';
import { networkErrorCopy, retryLabel, unknownErrorCopy } from '../src/shared/copy/error-copy';
import { ROUTES } from '../src/shared/config/routes';
import { formatMonthDay } from '../src/shared/lib/date-format';
import { createHarness } from '../src/test/harness';

/** 지나간 경로 전부 — 중간에 거쳐 간 경로도 기록한다. */
const visited: string[] = [];

function LocationProbe() {
  const location = useLocation();
  visited.push(location.pathname);
  return <span data-testid="pathname">{location.pathname}</span>;
}

async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
  });
}

async function renderAt(path: string, scenarios: readonly string[] = []) {
  const harness = createHarness({ scenarios, initialEntries: [path] });
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
  await waitForGuard();
  return harness;
}

/** 화면과 같은 번들의 응답 — 기대값의 출처. 화면이 먼저 조회한 뒤 읽는다(상태 seed 는 번들당 1회). */
async function profileOf(harness: Awaited<ReturnType<typeof renderAt>>): Promise<ChildProfile> {
  return harness.bundle.clients.children.getProfile({ childId: MOCK_CHILD_ID });
}

function view(): HTMLElement {
  return document.querySelector('.haru-profile-view') as HTMLElement;
}

async function ready(): Promise<HTMLElement> {
  await waitFor(() => expect(view().querySelector('[data-state="ready"]')).not.toBeNull());
  return view();
}

const label = (capability: Capability) => capabilityCopy[capability];

describe('온보딩 모드 `/onboarding/profile` (Spec §2.1)', () => {
  it('구성: h1(firstName 만) · 판정 아님 안내 · 차트 카드 · 강점/edge · 페르소나 · Next — TopBar·뒤로 없음', async () => {
    const harness = await renderAt(ROUTES.onboarding.profile);
    const root = await ready();
    const profile = await profileOf(harness);
    const { firstName, lastName } = profile.child;

    expect(
      screen.getByRole('heading', { level: 1, name: copy.onboarding.title(firstName) }),
    ).toBeTruthy();
    expect(screen.getByText(copy.onboarding.notice(firstName))).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 2, name: copy.onboarding.chartTitle }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 2, name: childProfileCopy.highlights.heading }),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: profile.persona.name })).toBeTruthy();
    // lastName 표시 0 (AC-6-56)
    if (lastName !== undefined && lastName.length > 0) {
      expect(root.textContent).not.toContain(lastName);
    }
    // 뒤로 없음 (`N6-24` ⓐ)
    expect(screen.queryByRole('button', { name: copy.revisit.backLabel })).toBeNull();
    expect(screen.getByRole('button', { name: copy.onboarding.next })).toBeTruthy();
    // 비교·백분위·등급 0 — 숫자가 화면에 없다 (AC-6-56 · 57)
    expect(root.textContent).not.toMatch(/\d/);
  });

  it('차트: 축 순서 고정 · 꼭짓점 = 응답 점수 기하 · summary = 승인 문장 (AC-6-57)', async () => {
    const harness = await renderAt(ROUTES.onboarding.profile);
    const root = await ready();
    const profile = await profileOf(harness);
    const strengths = profile.strengths.map(label).join(' and ');
    const edges = profile.growingEdges.map(label).join(' and ');

    const chart = screen.getByRole('img', {
      name: `Starting point for ${profile.child.firstName}. What we saw most: ${strengths}. Where we'll look next: ${edges}.`,
    });
    expect(chart).toBeTruthy();

    const labels = [...root.querySelectorAll('.haru-diamond__label')].map(
      (node) => node.textContent,
    );
    expect(labels).toEqual([
      'Self-Direction',
      'Emotion Regulation',
      'Cognitive Flexibility',
      'Intrinsic Motivation',
    ]);

    CAPABILITY_AXIS_ORDER.forEach((capability, index) => {
      const score = profile.latestSnapshot.scores.find((entry) => entry.capability === capability);
      const expected = diamondPercent(
        diamondPointOnAxis(index, diamondRadiusFraction(score?.score ?? 0, 5)),
      );
      const vertex = root.querySelector(`circle.haru-diamond__vertex[data-axis="${capability}"]`);
      expect([vertex?.getAttribute('cx'), vertex?.getAttribute('cy')]).toEqual([
        expected.x,
        expected.y,
      ]);
    });
  });

  it('강점 · growing edge · 페르소나 = 응답 값 그대로 · 응답 순서 그대로 (AC-6-59)', async () => {
    const harness = await renderAt(ROUTES.onboarding.profile);
    const root = await ready();
    const profile = await profileOf(harness);

    const lists = [...root.querySelectorAll('ul')].map((list) =>
      [...list.querySelectorAll('li')].map((item) => item.textContent),
    );
    expect(lists).toEqual([profile.strengths.map(label), profile.growingEdges.map(label)]);
    expect(screen.getByText(profile.persona.description)).toBeTruthy();
    expect(
      screen.getByText(childProfileCopy.persona.eyebrow(profile.child.firstName)),
    ).toBeTruthy();
  });

  /*
   * `S6-E2` 가 발전 역량 route 를 등록했다 — 이동 후 **그 경로에 머문다**(`:step` 위저드로 빠지지 않는다,
   * H6-2.4 ① 해소). 화면 내용은 `growth-capability.test.tsx` 가 본다.
   */
  it('Next → `/onboarding/growth-capability` (push) 에 머문다', async () => {
    await renderAt(ROUTES.onboarding.profile);
    await ready();
    visited.length = 0;
    fireEvent.click(screen.getByRole('button', { name: copy.onboarding.next }));
    await waitFor(() =>
      expect(screen.getByTestId('pathname').textContent).toBe(ROUTES.onboarding.growthCapability),
    );
    await waitFor(() =>
      expect(document.querySelector('.haru-growth-focus [data-state="ready"]')).not.toBeNull(),
    );
    expect(visited.at(-1)).toBe(ROUTES.onboarding.growthCapability);
  });

  it('업데이트 표시 0 — 온보딩 모드 (AC-6-36)', async () => {
    await renderAt(ROUTES.onboarding.profile, ['children:profile-updated']);
    const root = await ready();
    expect(root.textContent).not.toMatch(/Updated/);
  });
});

describe('null 변형 (`D-2` 시각 · AC-6-38 · 58)', () => {
  it('변형 C `all-scores-missing` — 축 4개 유지 · 면/꼭짓점 0 · 캡션 · 빈 묶음 문장 · CTA 활성', async () => {
    const harness = await renderAt(ROUTES.onboarding.profile, ['children:all-scores-missing']);
    const root = await ready();
    const profile = await profileOf(harness);

    expect(root.querySelectorAll('.haru-diamond__label')).toHaveLength(4);
    expect(root.querySelectorAll('.haru-diamond__axis--missing')).toHaveLength(4);
    expect(root.querySelectorAll('circle.haru-diamond__vertex')).toHaveLength(0);
    expect(root.querySelectorAll('.haru-diamond__area-fill')).toHaveLength(0);
    expect(screen.getByText(copy.chartEmptyCaption)).toBeTruthy();
    expect(screen.getAllByText(childProfileCopy.chart.missingLabel)).toHaveLength(4);
    expect(screen.getAllByText(childProfileCopy.highlights.empty)).toHaveLength(2);
    expect(
      screen.getByRole('img', {
        name: `Starting point for ${profile.child.firstName}. Not observed yet: Self-Direction, Emotion Regulation, Cognitive Flexibility, and Intrinsic Motivation.`,
      }),
    ).toBeTruthy();
    const next = screen.getByRole('button', { name: copy.onboarding.next }) as HTMLButtonElement;
    expect(next.disabled).toBe(false);
  });

  it('변형 B `scores-partially-missing` — null 축만 점선·캡션, 나머지 꼭짓점 3 · summary 에 미관찰 축', async () => {
    await renderAt(ROUTES.onboarding.profile, ['children:scores-partially-missing']);
    const root = await ready();

    const missing = [...root.querySelectorAll('.haru-diamond__axis--missing')].map((line) =>
      line.getAttribute('data-axis'),
    );
    expect(missing).toEqual(['cognitive_flexibility']);
    expect(root.querySelectorAll('circle.haru-diamond__vertex')).toHaveLength(3);
    expect(screen.queryByText(copy.chartEmptyCaption)).toBeNull();
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(
      /Not observed yet: Cognitive Flexibility\.$/,
    );
  });
});

describe('페르소나 fallback (AC-6-37 · 60)', () => {
  it('`persona-fallback` — 일반과 같은 구조 · isFallback 노출 0', async () => {
    const harness = await renderAt(ROUTES.onboarding.profile, ['children:persona-fallback']);
    const root = await ready();
    const profile = await profileOf(harness);
    expect(profile.persona.isFallback).toBe(true);
    expect(screen.getByRole('heading', { level: 2, name: profile.persona.name })).toBeTruthy();
    expect(screen.getByText(profile.persona.description)).toBeTruthy();
    expect(root.textContent).not.toMatch(/fallback/i);
    expect(root.querySelector('.haru-alert')).toBeNull();
  });
});

describe('상태 (Spec §2.7 · §3.6 · AC-6-55)', () => {
  it('Loading — Skeleton 컨테이너 aria-busy + 이름 1개', async () => {
    await renderAt(ROUTES.onboarding.profile, ['children:loading']);
    const status = await screen.findByRole('status', { name: copy.loading });
    expect(status.getAttribute('aria-busy')).toBe('true');
    expect(view().querySelector('.haru-profile-view__chart-skeleton')).not.toBeNull();
  });

  it('조회 실패 (온보딩) — ErrorState + Try again + Continue to Home → Home replace (`N6-37`)', async () => {
    await renderAt(ROUTES.onboarding.profile, ['children:error']);
    await waitFor(() => expect(view().querySelector('[data-state="error"]')).not.toBeNull());
    expect(screen.getByRole('heading', { level: 1, name: unknownErrorCopy.title })).toBeTruthy();
    expect(screen.getByRole('button', { name: retryLabel })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: copy.onboarding.continueToHome }));
    await waitFor(() => expect(screen.getByTestId('pathname').textContent).toBe(ROUTES.home));
  });

  it('오프라인 (온보딩) — offline 문구', async () => {
    await renderAt(ROUTES.onboarding.profile, ['children:offline']);
    await waitFor(() => expect(view().querySelector('[data-state="error"]')).not.toBeNull());
    expect(screen.getByText(networkErrorCopy.title)).toBeTruthy();
    expect(screen.getByRole('button', { name: copy.onboarding.continueToHome })).toBeTruthy();
  });

  it('retry — 실패 후 Try again 으로 성공', async () => {
    await renderAt(ROUTES.onboarding.profile, ['children:retry']);
    await waitFor(() => expect(view().querySelector('[data-state="error"]')).not.toBeNull());
    fireEvent.click(screen.getByRole('button', { name: retryLabel }));
    await ready();
  });
});

describe('재방문 모드 `/settings/profile` (Spec §2.2 · AC-6-63)', () => {
  it('TopBar "Profile" = h1 · 뒤로 · 차트 제목 "Where … right now" · CTA·링크 없음', async () => {
    const harness = await renderAt(ROUTES.settingsProfile);
    const root = await ready();
    const profile = await profileOf(harness);
    const { firstName } = profile.child;

    expect(screen.getByRole('heading', { level: 1, name: copy.revisit.topBarTitle })).toBeTruthy();
    expect(screen.getByRole('button', { name: copy.revisit.backLabel })).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 2, name: copy.revisit.chartTitle(firstName) }),
    ).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(
      new RegExp(`^Where ${firstName} is right now\\. `),
    );
    expect(screen.queryByRole('button', { name: copy.onboarding.next })).toBeNull();
    expect(within(root).queryAllByRole('link')).toHaveLength(0);
  });

  it('조회 실패 (재방문) — ErrorState + Try again 만 (Continue to Home 없음)', async () => {
    await renderAt(ROUTES.settingsProfile, ['children:error']);
    await waitFor(() => expect(view().querySelector('[data-state="error"]')).not.toBeNull());
    expect(screen.getByRole('button', { name: retryLabel })).toBeTruthy();
    expect(screen.queryByRole('button', { name: copy.onboarding.continueToHome })).toBeNull();
  });

  it('`profile-updated` — 갱신 스냅샷 점수가 차트에 반영 (AC-6-34)', async () => {
    const harness = await renderAt(ROUTES.settingsProfile, ['children:profile-updated']);
    const root = await ready();
    const profile = await profileOf(harness);
    expect(profile.latestSnapshot.source).toBe('session_analysis');

    CAPABILITY_AXIS_ORDER.forEach((capability, index) => {
      const score = profile.latestSnapshot.scores.find((entry) => entry.capability === capability);
      const expected = diamondPercent(
        diamondPointOnAxis(index, diamondRadiusFraction(score?.score ?? 0, 5)),
      );
      const vertex = root.querySelector(`circle.haru-diamond__vertex[data-axis="${capability}"]`);
      expect(vertex?.getAttribute('cy')).toBe(expected.y);
      expect(vertex?.getAttribute('cx')).toBe(expected.x);
    });
  });

  it.each([
    ['children:profile-updated', 'session_analysis'],
    ['children:survey-update-submitted', 'survey_update'],
  ] as const)(
    'UpdateNote `%s` — 카드 위 한 줄 · source 별 문구 · 날짜 = formatMonthDay (AC-6-36 · Spec §2.2)',
    async (scenario, source) => {
      const harness = await renderAt(ROUTES.settingsProfile, [scenario]);
      const root = await ready();
      const profile = await profileOf(harness);
      expect(profile.latestSnapshot.source).toBe(source);
      const at = profile.profileUpdatedAt;
      if (at === null) throw new Error('fixture must have profileUpdatedAt');

      const note = root.querySelector('[data-update-note]') as HTMLElement;
      expect(note.textContent).toBe(
        copy.revisit.updateNote[source](formatMonthDay(Date.parse(at), Date.now())),
      );
      // 장식 아이콘 · live 아님 · 첫 카드보다 위
      expect(note.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
      expect(note.closest('[aria-live]')).toBeNull();
      const firstCard = root.querySelector('section') as Element;
      expect(
        note.compareDocumentPosition(firstCard) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    },
  );

  it.each(['children:empty', 'children:success'])(
    'UpdateNote 0 — `%s` (profileUpdatedAt null · 온보딩 스냅샷)',
    async (scenario) => {
      const harness = await renderAt(ROUTES.settingsProfile, [scenario]);
      const root = await ready();
      expect((await profileOf(harness)).profileUpdatedAt).toBeNull();
      expect(root.querySelector('[data-update-note]')).toBeNull();
      expect(root.textContent).not.toMatch(/Updated/);
    },
  );

  it('`persona-changed` — 새 name · description 응답 그대로 · "New" 배지 0 (AC-6-35)', async () => {
    const harness = await renderAt(ROUTES.settingsProfile, ['children:persona-changed']);
    const root = await ready();
    const profile = await profileOf(harness);
    expect(screen.getByRole('heading', { level: 2, name: profile.persona.name })).toBeTruthy();
    expect(screen.getByText(profile.persona.description)).toBeTruthy();
    expect(root.textContent).not.toMatch(/\bNew\b/);
  });
});

describe('`/onboarding/saved` CTA (Plan R-7 · AC-6-53 구간)', () => {
  it('Get started → `/onboarding/profile` (화면 불변, 목적지만 변경)', async () => {
    await renderAt(ROUTES.onboarding.saved);
    fireEvent.click(await screen.findByRole('button', { name: onboardingCopy.saved.cta }));
    await waitFor(() =>
      expect(screen.getByTestId('pathname').textContent).toBe(ROUTES.onboarding.profile),
    );
    await ready();
  });
});

describe('feature copy 금칙어 · 숫자 (Spec §10.5)', () => {
  const FORBIDDEN =
    /diagnos|score|rating|level|grade|assess|weak|strong|\blow\b|high|lowest|below|behind|average|normal|better|worse|peers|fail|invalid|error|!/i;

  function strings(value: unknown): string[] {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [String((value as (name: string) => string)('Emma'))];
    if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(strings);
    return [];
  }

  it('childProfileViewCopy 전부 금칙어 0 · 숫자 0', () => {
    const all = strings(copy);
    expect(all.length).toBeGreaterThan(8);
    for (const text of all) {
      expect(text).not.toMatch(FORBIDDEN);
      expect(text).not.toMatch(/\d/);
    }
  });
});
