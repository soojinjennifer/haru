/**
 * Stage 8 `S8-F` — 앱 공통 정리 (Plan rev 2.2 `S8-F` · AC-8-40 · AC-8-97 · AC-8-98 · AC-8-99).
 *
 * ① `N8-31` ⓐ (`D8-2` ①) — 화면 밖에서 끝난 전체 삭제: `?scenario=data-management:deletion-completed-offscreen` 은 Mock 서버에
 *    이미 `completed` 인 `all_data` 요청을 두고, 브라우저 조립 지점이 그 요청 id 를 **기기에 표시**(로컬 주입)한다. 앱 시작 · 로그인
 *    후 감시자 1곳이 완료를 감지해 로컬 정리 + Toast 1회 → Guard 가 `/onboarding/start` 로.
 * ② `VG6-D-12` — 앱 안 기록 없이 들어온 하위 화면의 Back = 논리적 부모로 replace (Spec §6.3).
 *
 * 새로고침은 Mock 인증을 지운다 — 로그인 후 앱 안 이동만 쓴다. deep link 는 `history.pushState({})`(앱 안 기록 표식 0)로 흉내 낸다.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp, hideDevPanel } from './support/gallery';
import { seedChildDraft } from './support/onboarding';
import { logInToHome, requestOperations } from './support/session';

const POLL_OP = 'GET /v1/data-deletion-requests/:id';
const MARKER_KEY = 'haru.data-deletion.pending.v1';
const DRAFT_KEY = 'haru.onboarding.draft.v1';
const CARD_KEY = 'haru.activity-card.v1';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const count = async (page: Page, operation: string) =>
  (await requestOperations(page)).filter((entry) => entry === operation).length;

/** SPA 경로 이동을 전부 기록한다 (pushState · replaceState). 정리 전에 온보딩 resume 화면이 그려졌는지 본다. */
async function recordPaths(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const paths: string[] = [];
    (globalThis as unknown as { __HARU_PATHS__: string[] }).__HARU_PATHS__ = paths;
    for (const name of ['pushState', 'replaceState'] as const) {
      const original = history[name].bind(history);
      history[name] = (data: unknown, unused: string, url?: string | URL | null) => {
        original(data, unused, url);
        paths.push(location.pathname);
      };
    }
  });
}

// ── ① 화면 밖 완료 (AC-8-97 · 98 · 99) ─────────────────────────────────────────

test('화면 밖 완료 — 기기 표시(요청 id 만) → 로그인 → 감시자 정리(draft · 카드 캐시 · 표시 0) → Toast 1회 → `/onboarding/start` · resume 화면 0', async ({
  page,
}) => {
  await recordPaths(page);
  await seedChildDraft(page);
  await page.addInitScript((key: string) => {
    globalThis.localStorage.setItem(key, '{"schemaVersion":1}');
  }, CARD_KEY);
  await gotoApp(
    page,
    `/auth/log-in?scenario=${encodeURIComponent('data-management:deletion-completed-offscreen')}`,
  );

  // 표시 = 요청 id · scope · 시각 3필드 (PII 0 — 아이 이름 · 이메일 · 경로 0)
  const marker = await page.evaluate((key) => localStorage.getItem(key), MARKER_KEY);
  expect(marker).not.toBeNull();
  const parsed = JSON.parse(marker ?? '{}') as Record<string, unknown>;
  expect(Object.keys(parsed).sort()).toStrictEqual(['requestId', 'savedAt', 'scope']);
  expect(parsed['scope']).toBe('all_data');
  expect(marker).not.toMatch(/Yuna|Emma|@|\/settings|\/onboarding/);
  // 미인증 동안은 조회 0
  expect(await count(page, POLL_OP)).toBe(0);

  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();

  await expect(page).toHaveURL(/\/onboarding\/start$/);
  await expect(page.getByText('Your data was deleted.')).toHaveCount(1);
  const stored = await page.evaluate(
    ([marker, draft, card]) => ({
      marker: localStorage.getItem(marker),
      draft: localStorage.getItem(draft),
      card: localStorage.getItem(card),
    }),
    [MARKER_KEY, DRAFT_KEY, CARD_KEY] as const,
  );
  expect(stored).toStrictEqual({ marker: null, draft: null, card: null });
  expect(await count(page, POLL_OP)).toBe(1);
  // 정리 전에 draft resume 경로(`/onboarding/child-info`)로 간 적이 없다 — Guard 가 기존 pending 으로 기다렸다
  const paths = await page.evaluate(
    () => (globalThis as unknown as { __HARU_PATHS__: string[] }).__HARU_PATHS__,
  );
  expect(
    paths.filter((path) => path.startsWith('/onboarding/') && path !== '/onboarding/start'),
  ).toStrictEqual([]);
  // 더 묻지 않는다 (감시 종료)
  await page.waitForTimeout(6_000);
  expect(await count(page, POLL_OP)).toBe(1);
});

// ── ② Back fallback (AC-8-40) ──────────────────────────────────────────────

async function deepLink(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

for (const [path, parent, heading] of [
  ['/settings/data/recordings', /\/settings\/data$/, 'Data & privacy'],
  ['/settings/data', /\/settings$/, 'Settings'],
  ['/settings/account', /\/settings$/, 'Settings'],
  ['/settings/profile', /\/settings$/, 'Settings'],
  ['/settings/growth-capability', /\/settings$/, 'Settings'],
  ['/settings', /\/$/, null],
  ['/library/add', /\/library$/, null],
] as const) {
  test(`앱 안 기록 없이 ${path} → Back = 논리적 부모 replace (VG6-D-12 · AC-8-40)`, async ({
    page,
  }) => {
    await logInToHome(page);
    await deepLink(page, path);
    await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}$`));
    await page.getByRole('button', { name: /^(Back|Go back)$/ }).click();
    await expect(page).toHaveURL(parent);
    if (heading !== null) {
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    }
    // replace — 브라우저 뒤로 가기가 떠난 화면으로 되돌아가지 않는다 (루프 0)
    await page.goBack();
    await expect(page).not.toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}$`));
  });
}

test('앱 안 기록 있음 → Back = 이전 화면 (설정 → 데이터 관리 → Back = 설정)', async ({ page }) => {
  await logInToHome(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Data & privacy' }).click();
  await expect(page).toHaveURL(/\/settings\/data$/);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('미인증 직접 진입 `/auth/sign-up` → Back = `/auth/welcome` (앱 밖으로 나가지 않는다)', async ({
  page,
}) => {
  await gotoApp(page, '/auth/sign-up');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/welcome$/);
});

// ── ③ `VG6-H-09` A 섹션 라벨 리듬 실측 (AC-8-41) ────────────────────────────────

interface SectionGeometry {
  label: string;
  /** 앞 내용 아래 → 라벨 글자 상자 중심 (앞 형제가 없으면 null). */
  toCenter: number | null;
  /** 라벨 글자 상자 중심 → 내용 위. */
  toContent: number;
  /** 섹션 간격 (부모 flex row-gap). */
  parentGap: number;
}

async function sectionGeometry(page: Page): Promise<SectionGeometry[]> {
  return page.locator('.haru-section').evaluateAll((sections) =>
    sections.map((section) => {
      const label = section.children[0] as HTMLElement;
      const content = section.children[1] as HTMLElement;
      const l = label.getBoundingClientRect();
      const center = (l.top + l.bottom) / 2;
      const previous = section.previousElementSibling as HTMLElement | null;
      return {
        label: label.textContent ?? '',
        toCenter: previous === null ? null : center - previous.getBoundingClientRect().bottom,
        toContent: content.getBoundingClientRect().top - center,
        parentGap: parseFloat(getComputedStyle(section.parentElement as HTMLElement).rowGap),
      };
    }),
  );
}

/** 라벨 상자(caption-1 줄 16) 기준: 글자 중심 → 내용 = 8 + 10 = 18 · 앞 내용 → 글자 중심 = 섹션 gap + 7 + 8. */
function expectRhythm(sections: SectionGeometry[]): void {
  expect(sections.length).toBeGreaterThan(0);
  for (const section of sections) {
    expect(section.toContent, section.label).toBe(18);
    if (section.toCenter !== null)
      expect(section.toCenter, section.label).toBe(section.parentGap + 15);
  }
}

test('VG6-H-09 A — Step 1(Trial) ABOUT YOU · AT HOME = 53 / 35 (섹션 gap 20) · YOUR CHILD 아이콘 헤더 = ⓑ-2 현행', async ({
  page,
}) => {
  await seedChildDraft(page);
  await gotoApp(page, '/onboarding/child-info');
  const sections = await sectionGeometry(page);
  expect(sections.map((section) => section.label)).toStrictEqual(['ABOUT YOU', 'AT HOME']);
  expectRhythm(sections);
  expect(sections.every((section) => section.parentGap === 20)).toBe(true);
  // 35 · 53 (Figma) — 앞 내용 아래 → 글자 중심 35 · → 내용 53
  expect(sections.map((section) => section.toCenter)).toStrictEqual([35, 35]);
  // ⓑ-2: 편집 아이콘 헤더 행은 recipe 밖 (hit 44 가 카드를 침범하지 않는다)
  await expect(page.locator('.haru-child-section-header')).toHaveCount(1);
  expect(
    await page
      .locator('.haru-child-section-header')
      .evaluate((node) => node.closest('.haru-section')),
  ).toBeNull();
});

test('VG6-H-09 A — 설정 아이 정보 · 설정 목록 · 데이터 관리 · 계정 = 같은 recipe (글자 중심 → 내용 18)', async ({
  page,
}) => {
  await logInToHome(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.locator('.haru-section')).toHaveCount(2);
  const menu = await sectionGeometry(page);
  expect(menu.map((section) => section.label)).toStrictEqual(['YOUR CHILD', 'ACCOUNT']);
  expectRhythm(menu);

  await page.getByRole('button', { name: 'Data & privacy' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Data & privacy' })).toBeVisible();
  await expect(page.getByText('DELETE DATA', { exact: true })).toBeVisible();
  expectRhythm(await sectionGeometry(page));
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/\/settings$/);

  await page.getByRole('button', { name: 'Account' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Account' })).toBeVisible();
  await expect(page.getByText('DELETE ACCOUNT', { exact: true })).toBeVisible();
  expectRhythm(await sectionGeometry(page));
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/\/settings$/);

  await page.getByRole('button', { name: 'Child info' }).click();
  await expect(page).toHaveURL(/\/settings\/child$/);
  await expect(page.getByText('AT HOME', { exact: true })).toBeVisible();
  await expect(page.locator('.haru-section')).toHaveCount(2);
  const child = await sectionGeometry(page);
  expect(child.map((section) => section.label)).toStrictEqual(['YOUR CHILD', 'AT HOME']);
  expectRhythm(child);
  expect(child[1]?.toCenter).toBe(35);
});
