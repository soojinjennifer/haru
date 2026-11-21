/**
 * Stage 8 `S8-G` — 접근성 감사 대상 **route × 대표 상태** (Plan §12.4 · Spec §9.4).
 *
 * 하나의 정류장(stop) = 한 화면 상태. 시트 · 다이얼로그는 부모 route 에서 **열린 상태**로 넣는다.
 * 새로고침은 Mock 인증을 지우므로 로그인 뒤 route 는 앱 안 이동(`spaGoto`)으로 연다
 * (Stage 5~7 `spaGoto` 선례). scenario 는 첫 진입 URL 에만 붙는다.
 *
 * 각 `open` 은 화면이 **정착한 뒤** 돌아온다 — 감사 · 측정이 과도기 프레임을 읽지 않게
 * (`R-BASELINE-1` ① 과 같은 이유).
 */
import { expect, type Page } from '@playwright/test';

import { gotoApp, settle } from './gallery';
import {
  cardCounterIndex,
  completeOnboardingToSaved,
  expectCardIndex,
  fillChildInfo,
  seedChildDraft,
} from './onboarding';
import { firstStartSession, logInToHome, READY_TITLE, settleImages, startSession } from './session';

export interface A11yStop {
  /** 감사 표 · 측정표에 쓰는 이름 (route + 상태). */
  readonly id: string;
  /** Plan §12.4 의 route 표기. */
  readonly route: string;
  /** 시트 · 다이얼로그가 열린 상태면 그 컨테이너 — focus · inert 확인에 쓴다. */
  readonly modal?: 'dialog' | 'alertdialog';
  /** `prefers-reduced-motion` 에서도 돌아가는 것이 승인된 애니메이션(진행 표시) — Spec §9.4. */
  readonly open: (page: Page) => Promise<void>;
}

const REPORT_LATEST = 'e7e7e7e7-0000-4000-8000-000000000002';
const FEEDBACK_SESSION = '77777777-7777-4777-8777-000000000002';

/** 앱 안 이동 — 새로고침 없이 router 가 popstate 를 읽게 한다 (Stage 5 `spaGoto` 선례). */
export async function spaGoto(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

/** 화면 정착 — 이미지 디코드 · 폰트 · 두 프레임. 진행 중 Skeleton 이 없을 때까지. */
export async function settleScreen(page: Page): Promise<void> {
  await expect(page.locator('.haru-skeleton')).toHaveCount(0, { timeout: 10_000 });
  await settleImages(page);
  await settle(page);
}

async function authedRoute(page: Page, path: string, heading: string | RegExp): Promise<void> {
  await logInToHome(page);
  await spaGoto(page, path);
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  await settleScreen(page);
}

async function openSettingsRow(page: Page, row: string | RegExp, url: RegExp): Promise<void> {
  await logInToHome(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await page.getByRole('button', { name: row }).click();
  await expect(page).toHaveURL(url);
  await settleScreen(page);
}

async function publicRoute(page: Page, path: string): Promise<void> {
  await gotoApp(page, path);
  await settleScreen(page);
}

async function signUpTo(page: Page, scenario: string, url: RegExp): Promise<void> {
  await gotoApp(page, `/auth/sign-up?scenario=${scenario}`);
  await page.getByLabel('Your name').fill('Sam Rivera');
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(url);
  await settleScreen(page);
}

async function trialToIntro(page: Page): Promise<void> {
  await gotoApp(page, '/onboarding/start?scenario=me:consent-missing');
  await page.getByRole('button', { name: 'Start the questions' }).click();
  await expect(page).toHaveURL(/\/onboarding\/child-info$/);
  await fillChildInfo(page);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
}

/** 카드 단계로 들어가 `slug` 단계의 첫 카드에서 멈춘다 (단계 사이 카드는 키보드로 답한다). */
async function trialToStep(page: Page, slug: string): Promise<void> {
  await trialToIntro(page);
  await page.getByRole('button', { name: /^(Start|Pick up where you left off)$/ }).click();
  await expect(page).toHaveURL(/\/onboarding\/reading-together$/);
  const nextCard = page.getByRole('button', { name: 'Next question' });

  for (let guard = 0; guard < 40; guard += 1) {
    if (page.url().endsWith(`/onboarding/${slug}`)) break;
    const before = await cardCounterIndex(page);
    if (before === null) throw new Error('card counter not rendered');
    const radio = page.getByRole('radio').first();
    const checkbox = page.getByRole('checkbox').first();
    if ((await radio.count()) > 0) {
      await radio.focus();
      await page.keyboard.press('Space');
    } else if ((await checkbox.count()) > 0) {
      await checkbox.focus();
      await page.keyboard.press('Space');
    }
    await nextCard.click();
    await expectCardIndex(page, before + 1);
  }
  await expect(page).toHaveURL(new RegExp(`/onboarding/${slug}$`));
  await settleScreen(page);
}

async function openRecordings(page: Page): Promise<void> {
  await openSettingsRow(page, 'Data & privacy', /\/settings\/data$/);
  await page.getByRole('button', { name: /Session recordings/ }).click();
  await expect(page).toHaveURL(/\/settings\/data\/recordings$/);
  await expect(page.getByRole('list', { name: 'Session recordings' })).toBeVisible();
  await settleScreen(page);
}

async function openReadingContext(page: Page): Promise<void> {
  await logInToHome(page);
  await firstStartSession(page).click();
  await expect(page.getByRole('dialog', { name: READY_TITLE })).toBeVisible();
  await settleScreen(page);
}

async function startRecording(page: Page): Promise<void> {
  await startSession(page);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await settle(page);
}

/** Plan §12.4 목록 (+ 시트 · 다이얼로그 열린 상태). */
export const A11Y_STOPS: readonly A11yStop[] = [
  // ── 인증 · 동의 ───────────────────────────────────────────────────────────
  { id: 'welcome', route: '/auth/welcome', open: (p) => publicRoute(p, '/auth/welcome') },
  { id: 'sign-up', route: '/auth/sign-up', open: (p) => publicRoute(p, '/auth/sign-up') },
  { id: 'log-in', route: '/auth/log-in', open: (p) => publicRoute(p, '/auth/log-in') },
  {
    id: 'forgot-password',
    route: '/auth/forgot-password',
    open: (p) => publicRoute(p, '/auth/forgot-password'),
  },
  {
    id: 'reset-password',
    route: '/auth/reset-password',
    open: (p) => publicRoute(p, '/auth/reset-password'),
  },
  {
    id: 'consent',
    route: '/auth/consent',
    open: (p) => signUpTo(p, 'me:consent-missing', /\/auth\/consent$/),
  },
  {
    id: 'verify-parent',
    route: '/auth/verify-parent',
    open: (p) => signUpTo(p, 'me:vpc-failed', /\/auth\/verify-parent$/),
  },
  // ── 온보딩 ─────────────────────────────────────────────────────────────────
  {
    id: 'onboarding-start',
    route: '/onboarding/start',
    open: (p) => publicRoute(p, '/onboarding/start'),
  },
  {
    id: 'onboarding-child-info',
    route: '/onboarding/:step (child-info)',
    open: async (p) => {
      await gotoApp(p, '/onboarding/start?scenario=me:consent-missing');
      await p.getByRole('button', { name: 'Start the questions' }).click();
      await expect(p).toHaveURL(/\/onboarding\/child-info$/);
      await settleScreen(p);
    },
  },
  {
    id: 'onboarding-child-info-select-sheet',
    route: '/onboarding/:step (child-info) + Birth year sheet',
    modal: 'dialog',
    open: async (p) => {
      await gotoApp(p, '/onboarding/start?scenario=me:consent-missing');
      await p.getByRole('button', { name: 'Start the questions' }).click();
      await p.getByRole('button', { name: /Birth year/ }).click();
      await expect(p.getByRole('dialog')).toBeVisible();
      await settleScreen(p);
    },
  },
  { id: 'onboarding-intro', route: '/onboarding (intro)', open: trialToIntro },
  {
    id: 'onboarding-reading-together',
    route: '/onboarding/:step (reading-together)',
    open: (p) => trialToStep(p, 'reading-together'),
  },
  {
    id: 'onboarding-books-and-interests',
    route: '/onboarding/:step (books-and-interests)',
    open: (p) => trialToStep(p, 'books-and-interests'),
  },
  {
    id: 'onboarding-growing-together',
    route: '/onboarding/:step (growing-together)',
    open: (p) => trialToStep(p, 'growing-together'),
  },
  {
    id: 'onboarding-capability-items',
    route: '/onboarding/:step (capability-items)',
    open: (p) => trialToStep(p, 'capability-items'),
  },
  {
    id: 'onboarding-saved',
    route: '/onboarding/saved',
    open: async (p) => {
      await completeOnboardingToSaved(p);
      await settleScreen(p);
    },
  },
  {
    id: 'onboarding-profile',
    route: '/onboarding/profile',
    open: (p) => authedRoute(p, '/onboarding/profile', /.+/),
  },
  {
    id: 'onboarding-growth-capability',
    route: '/onboarding/growth-capability',
    open: (p) => authedRoute(p, '/onboarding/growth-capability', /.+/),
  },
  {
    id: 'trial-draft-link',
    route: '/onboarding/:step (child-info) + draft TextLink',
    open: async (p) => {
      await seedChildDraft(p, 'Yuna');
      await gotoApp(p, '/onboarding/child-info');
      await expect(
        p.getByRole('button', { name: 'Remove my answers from this device' }),
      ).toBeVisible();
      await settleScreen(p);
    },
  },
  {
    id: 'trial-draft-dialog',
    route: '/onboarding/:step (child-info) + draft Dialog',
    modal: 'alertdialog',
    open: async (p) => {
      await seedChildDraft(p, 'Yuna');
      await gotoApp(p, '/onboarding/child-info');
      await p.getByRole('button', { name: 'Remove my answers from this device' }).click();
      await expect(p.getByRole('alertdialog')).toBeVisible();
      await settleScreen(p);
    },
  },
  // ── Home · Library · Progress ─────────────────────────────────────────────
  {
    id: 'home',
    route: '/',
    open: async (p) => {
      await logInToHome(p);
      await settleScreen(p);
    },
  },
  {
    id: 'home-reading-context-sheet',
    route: '/ + Reading context sheet',
    modal: 'dialog',
    open: openReadingContext,
  },
  {
    id: 'home-reading-time-list',
    route: '/ + Reading context sheet (time list)',
    modal: 'dialog',
    open: async (p) => {
      await openReadingContext(p);
      const sheet = p.getByRole('dialog', { name: READY_TITLE });
      await sheet.getByText('Pick a time…', { exact: true }).click();
      await sheet.getByRole('button', { name: /^Time/ }).click();
      await expect(p.getByRole('dialog', { name: 'Time' })).toBeVisible();
      await settleScreen(p);
    },
  },
  {
    id: 'library',
    route: '/library',
    open: (p) => authedRoute(p, '/library', /.+/),
  },
  {
    id: 'library-book-detail-sheet',
    route: '/library + Book detail sheet',
    modal: 'dialog',
    open: async (p) => {
      await authedRoute(p, '/library', /.+/);
      await p.locator('.haru-shelf-item--pressable').first().click();
      await expect(p.locator('.haru-sheet--inset-card .haru-prompt-pill').first()).toBeVisible();
      await settleScreen(p);
    },
  },
  { id: 'library-add', route: '/library/add', open: (p) => authedRoute(p, '/library/add', /.+/) },
  {
    id: 'library-gift-requests',
    route: '/library/gift-requests',
    open: (p) => authedRoute(p, '/library/gift-requests', /.+/),
  },
  { id: 'progress', route: '/progress', open: (p) => authedRoute(p, '/progress', /.+/) },
  {
    id: 'progress-report',
    route: '/progress/reports/:reportId',
    open: async (p) => {
      await authedRoute(p, `/progress/reports/${REPORT_LATEST}`, '4-week report');
      await expect(p.locator('.haru-report-detail__body[data-state="ready"]')).toBeVisible();
      await settleScreen(p);
    },
  },
  // ── Session ────────────────────────────────────────────────────────────────
  {
    id: 'session-ready',
    route: '/session/:id (ready)',
    open: async (p) => {
      await startSession(p);
      await settle(p);
    },
  },
  { id: 'session-recording', route: '/session/:id (recording)', open: startRecording },
  {
    id: 'session-paused',
    route: '/session/:id (paused)',
    open: async (p) => {
      await startRecording(p);
      await p.getByRole('button', { name: 'Pause recording' }).click();
      await expect(p.getByRole('button', { name: 'Resume recording' })).toBeVisible();
      await settle(p);
    },
  },
  {
    id: 'session-prompts-popup',
    route: '/session/:id (recording) + Prompts popup',
    open: async (p) => {
      await startRecording(p);
      await p.getByRole('button', { name: 'Prompts', exact: true }).click();
      await expect(p.getByRole('region', { name: 'Try this prompt!' })).toBeVisible();
      await settle(p);
    },
  },
  {
    id: 'session-complete',
    route: '/session/:id/complete',
    open: async (p) => {
      await startRecording(p);
      await p.getByRole('button', { name: 'Submit' }).click();
      await expect(p).toHaveURL(/\/complete$/);
      await expect(p.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
      await settleScreen(p);
    },
  },
  {
    id: 'session-feedback',
    route: '/session/:id/feedback',
    open: async (p) => {
      await logInToHome(p, 'analysis:analysis-completed');
      await spaGoto(p, `/session/${FEEDBACK_SESSION}/feedback`);
      await expect(p.getByRole('heading', { level: 1, name: 'Storytime notes' })).toBeVisible();
      await settleScreen(p);
    },
  },
  // ── Settings ───────────────────────────────────────────────────────────────
  {
    id: 'settings',
    route: '/settings',
    open: async (p) => {
      await logInToHome(p);
      await p.getByRole('button', { name: 'Settings' }).click();
      await expect(p).toHaveURL(/\/settings$/);
      await settleScreen(p);
    },
  },
  {
    id: 'settings-logout-dialog',
    route: '/settings + Log out dialog',
    modal: 'alertdialog',
    open: async (p) => {
      await logInToHome(p);
      await p.getByRole('button', { name: 'Settings' }).click();
      await p.getByRole('button', { name: 'Log out', exact: true }).click();
      await expect(p.getByRole('alertdialog')).toBeVisible();
      await settleScreen(p);
    },
  },
  {
    id: 'settings-profile',
    route: '/settings/profile',
    open: (p) => authedRoute(p, '/settings/profile', /.+/),
  },
  {
    id: 'settings-child',
    route: '/settings/child',
    open: (p) => authedRoute(p, '/settings/child', /.+/),
  },
  {
    id: 'settings-child-survey',
    route: '/settings/child/survey',
    open: (p) => openSettingsRow(p, 'Update survey answers', /\/settings\/child\/survey$/),
  },
  {
    id: 'settings-child-survey-step',
    route: '/settings/child/survey/:step',
    open: async (p) => {
      await openSettingsRow(p, 'Update survey answers', /\/settings\/child\/survey$/);
      await p.getByRole('button', { name: /^(Start|Continue where you left off)$/ }).click();
      await expect(p.locator('.haru-survey-update [data-state="ready"]')).toBeVisible();
      await settleScreen(p);
    },
  },
  {
    id: 'settings-growth-capability',
    route: '/settings/growth-capability',
    open: (p) => authedRoute(p, '/settings/growth-capability', /.+/),
  },
  {
    id: 'settings-data',
    route: '/settings/data',
    open: (p) => openSettingsRow(p, 'Data & privacy', /\/settings\/data$/),
  },
  {
    id: 'settings-data-delete-all-dialog',
    route: '/settings/data + Delete all dialog',
    modal: 'alertdialog',
    open: async (p) => {
      await openSettingsRow(p, 'Data & privacy', /\/settings\/data$/);
      await p
        .getByRole('list', { name: 'Delete data' })
        .getByRole('button', { name: 'Delete all data' })
        .click();
      await expect(p.getByRole('alertdialog')).toBeVisible();
      await settleScreen(p);
    },
  },
  { id: 'settings-data-recordings', route: '/settings/data/recordings', open: openRecordings },
  {
    id: 'settings-data-recordings-dialog',
    route: '/settings/data/recordings + Delete recording dialog',
    modal: 'alertdialog',
    open: async (p) => {
      await openRecordings(p);
      await p
        .getByRole('button', { name: /^Delete recording, / })
        .first()
        .click();
      await expect(p.getByRole('alertdialog')).toBeVisible();
      await settleScreen(p);
    },
  },
  {
    id: 'settings-account',
    route: '/settings/account',
    open: (p) => openSettingsRow(p, 'Account', /\/settings\/account$/),
  },
  {
    id: 'settings-account-dialog',
    route: '/settings/account + Delete account dialog',
    modal: 'alertdialog',
    open: async (p) => {
      await openSettingsRow(p, 'Account', /\/settings\/account$/);
      await p
        .getByRole('list', { name: 'Delete account' })
        .getByRole('button', { name: 'Delete account' })
        .click();
      await expect(p.getByRole('alertdialog')).toBeVisible();
      await settleScreen(p);
    },
  },
  // ── 404 ────────────────────────────────────────────────────────────────────
  { id: 'not-found', route: '404', open: (p) => publicRoute(p, '/this-route-does-not-exist') },
];
