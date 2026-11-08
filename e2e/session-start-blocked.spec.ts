/**
 * Stage 4b `S4-H4` — 시작을 막는 응답의 **프레임 기준** (Spec §21.2 T1~T6 · `D4-145` · `D4-146`).
 *
 * 탭부터 도착(또는 안내)까지 **rAF 마다** 기록한다: `[role=alert]` 수 · `.haru-toast` 수 · 시작 버튼 `aria-busy` ·
 * 시트 존재 · `location.pathname` · `main` 존재 · Route Guard 전체 화면 Spinner(버튼 밖 `.haru-spinner`).
 *   T1 이동/안내 전까지 버튼 `loading` 이 끊기지 않는다
 *   T2 이동하는 경우 오류 표시 0 프레임
 *   T3 시트를 먼저 닫지 않는다 (Home 경로에서 시트 없는 Home 프레임 0)
 *   T5 온보딩 이동 중 Guard 전체 화면 Spinner 0 프레임 (`me` 를 비우지 않는다)
 * + 320×568 에서 `recording` 안내가 뜨는 순간 시트 안에서 보인다 (`D4-146` Q2 ⓑ).
 * 요청 증거 = dev Mock 요청 로그.
 */
import { expect, test, type Page } from '@playwright/test';

import { firstStartSession, logInToHome, READY_TITLE, requestOperations } from './support/session';

const ACTIVE_ID = '99999999-9999-4999-8999-000000000001';
const ALREADY_TITLE = 'A storytime is already open';
const ALREADY_BODY = 'Continue the open storytime, or finish it before starting a new one.';

interface Frame {
  t: number;
  path: string;
  alerts: number;
  toasts: number;
  busy: boolean | null;
  sheet: boolean;
  main: boolean;
  guardSpinner: number;
}

/** rAF 기록기 — `__s4h4.start()` 로 켜고 `__s4h4.frames` 로 읽는다. 모든 이동에 남도록 init script. */
async function installFrameRecorder(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const frames: unknown[] = [];
    let on = false;
    let tapped = false;
    // 기록은 **탭이 닿은 뒤** 프레임부터 — 켠 뒤 클릭 전 프레임(버튼이 아직 보통 상태)은 기준 밖이다
    document.addEventListener(
      'pointerdown',
      () => {
        if (on) tapped = true;
      },
      true,
    );
    const tick = (): void => {
      if (on && tapped) {
        // 시작 버튼 `loading` = 시트 안에 `aria-busy` 버튼이 있다 (`loading` 중에는 Spinner 라벨이 붙어 문구로 찾지 않는다)
        const sheet = document.querySelector('.haru-sheet');
        frames.push({
          t: performance.now() | 0,
          path: location.pathname,
          alerts: document.querySelectorAll('[role="alert"]').length,
          toasts: document.querySelectorAll('.haru-toast').length,
          busy:
            sheet === null ? null : sheet.querySelector('.haru-button[aria-busy="true"]') !== null,
          sheet: sheet !== null,
          main: document.querySelector('main') !== null,
          guardSpinner: [...document.querySelectorAll('.haru-spinner')].filter(
            (node) =>
              node.closest('.haru-button') === null && node.closest('.haru-session') === null,
          ).length,
        });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    (globalThis as unknown as { __s4h4: unknown }).__s4h4 = {
      frames,
      start: () => {
        on = true;
      },
    };
  });
}

async function startRecording(page: Page): Promise<void> {
  await page.evaluate(() => {
    (globalThis as unknown as { __s4h4: { start: () => void } }).__s4h4.start();
  });
}

async function frames(page: Page): Promise<Frame[]> {
  return page.evaluate(
    () => (globalThis as unknown as { __s4h4: { frames: Frame[] } }).__s4h4.frames,
  );
}

async function openReadingContext(page: Page) {
  await firstStartSession(page).click();
  const sheet = page.getByRole('dialog', { name: READY_TITLE });
  await sheet.getByText('Bedtime', { exact: true }).click();
  return sheet;
}

async function openLibrarySheet(page: Page) {
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Library' })
    .click();
  await expect(page.locator('.haru-library-shelves')).toBeVisible();
  await page.locator('.haru-shelf-item--pressable').first().click();
  const sheet = page.locator('.haru-sheet--inset-card');
  await expect(sheet).toBeVisible();
  return sheet;
}

/** 증거 — 경로별 기록 프레임 수 · busy 프레임 수 (reporter annotation). */
function annotate(list: readonly Frame[]): void {
  const byPath: Record<string, { frames: number; busy: number }> = {};
  for (const frame of list) {
    const entry = (byPath[frame.path] ??= { frames: 0, busy: 0 });
    entry.frames += 1;
    if (frame.busy === true) entry.busy += 1;
  }
  test.info().annotations.push({ type: 'frames', description: JSON.stringify(byPath) });
}

function count(ops: readonly string[], op: string): number {
  return ops.filter((entry) => entry === op).length;
}

/**
 * 출발 화면에 있는 동안(이동 전) 프레임. Mock 응답이 즉시라 이동이 **탭과 같은 프레임 안**에 끝나면 0 개일 수 있다 —
 * 그때 T1 · T3 은 위반할 프레임이 없어 성립한다(검사는 "위반 프레임 0").
 */
function before(list: readonly Frame[], origin: string): Frame[] {
  return list.filter((frame) => frame.path === origin);
}

test.describe('`S4-H4` AC-4-35 — 열린 세션이 `ready` 면 그 세션 화면으로 (Spec §21.2)', () => {
  test('Home 시트 — T1·T2·T3 · 생성 1 · 같은 push', async ({ page }) => {
    await installFrameRecorder(page);
    await logInToHome(page, 'sessions:session-already-active-ready');
    const sheet = await openReadingContext(page);
    const historyBefore = await page.evaluate(() => history.length);
    await startRecording(page);
    await sheet.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(new RegExp(`/session/${ACTIVE_ID}$`));
    await expect(page.getByRole('button', { name: 'Start recording' })).toBeVisible();

    const list = await frames(page);
    annotate(list);
    const home = before(list, '/');
    expect(home.filter((frame) => frame.busy !== true)).toStrictEqual([]); // T1
    expect(list.filter((frame) => frame.alerts > 0 || frame.toasts > 0)).toStrictEqual([]); // T2
    expect(home.filter((frame) => !frame.sheet)).toStrictEqual([]); // T3
    const ops = await requestOperations(page);
    expect(count(ops, 'POST /v1/sessions')).toBe(1);
    // 일반 시작과 같은 push (`D4-146`) — 기록이 1 늘어난다
    expect(await page.evaluate(() => history.length)).toBe(historyBefore + 1);
  });

  test('서재 시트 — T1·T2 · 생성 1', async ({ page }) => {
    await installFrameRecorder(page);
    await logInToHome(page, 'sessions:session-already-active-ready');
    const sheet = await openLibrarySheet(page);
    await startRecording(page);
    await sheet.getByRole('button', { name: 'Start Session' }).click();
    await expect(page).toHaveURL(new RegExp(`/session/${ACTIVE_ID}$`));
    await expect(page.getByRole('button', { name: 'Start recording' })).toBeVisible();

    const list = await frames(page);
    annotate(list);
    const library = before(list, '/library');
    expect(library.filter((frame) => frame.busy !== true)).toStrictEqual([]);
    expect(list.filter((frame) => frame.alerts > 0 || frame.toasts > 0)).toStrictEqual([]);
    expect(count(await requestOperations(page), 'POST /v1/sessions')).toBe(1);
  });
});

test.describe('`S4-H4` AC-4-35 — 열린 세션이 `recording`/`paused` 면 안내만', () => {
  for (const key of ['session-already-active', 'session-already-active-paused']) {
    test(`Home 시트 \`${key}\` — 기존 문구 · 이동 0 · 녹음 시작 0`, async ({ page }) => {
      await logInToHome(page, `sessions:${key}`);
      const sheet = await openReadingContext(page);
      await sheet.getByRole('button', { name: 'Continue' }).click();
      const alert = sheet.getByRole('alert');
      await expect(alert).toContainText(ALREADY_TITLE);
      await expect(alert).toContainText(ALREADY_BODY);
      await expect(sheet).not.toContainText("We couldn't start the session");
      await expect(page).toHaveURL(/\/$/);
      const ops = await requestOperations(page);
      expect(count(ops, 'GET /v1/sessions/:sessionId')).toBe(1);
      expect(ops.filter((op) => op.includes('transitions') || op.includes('recordings'))).toEqual(
        [],
      );
    });
  }

  test('서재 시트 — Toast 한 칸 `제목. 설명` · 이동 0', async ({ page }) => {
    await logInToHome(page, 'sessions:session-already-active');
    const sheet = await openLibrarySheet(page);
    await sheet.getByRole('button', { name: 'Start Session' }).click();
    await expect(page.locator('.haru-toast')).toHaveText(`${ALREADY_TITLE}. ${ALREADY_BODY}`);
    await expect(page).toHaveURL(/\/library$/);
    await expect(sheet).toBeVisible();
  });

  test('320×568 — 안내가 뜨는 순간 시트 안에서 전부 보인다 (`D4-146` Q2 ⓑ)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await logInToHome(page, 'sessions:session-already-active');
    const sheet = await openReadingContext(page);
    await sheet.getByRole('button', { name: 'Continue' }).click();
    const alert = sheet.getByRole('alert');
    await expect(alert).toContainText(ALREADY_BODY);
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const node = document.querySelector('.haru-sheet [role="alert"]');
          const box = node?.closest('.haru-sheet__content');
          if (node === null || node === undefined || box === null || box === undefined) return null;
          const a = node.getBoundingClientRect();
          const b = box.getBoundingClientRect();
          return a.top >= b.top - 0.5 && a.bottom <= b.bottom + 0.5;
        }),
      )
      .toBe(true);
    // Continue 는 그대로 보인다
    await expect(sheet.getByRole('button', { name: 'Continue' })).toBeInViewport();
  });
});

test.describe('`S4-H4` AC-4-36 — `ONBOARDING_INCOMPLETE` → `me` 재조회 → Route Guard 이동 (NB-16)', () => {
  test('Home 시트 — `me` 1건 · T1·T2·T5 · 온보딩 도착', async ({ page }) => {
    await installFrameRecorder(page);
    await logInToHome(page, 'sessions:onboarding-incomplete');
    const sheet = await openReadingContext(page);
    const meBefore = count(await requestOperations(page), 'GET /v1/me');
    await startRecording(page);
    await sheet.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/onboarding(\/|$)/);
    await page.locator('main').waitFor({ state: 'attached' });

    const list = await frames(page);
    annotate(list);
    const home = before(list, '/');
    expect(home.filter((frame) => frame.busy !== true)).toStrictEqual([]); // T1
    expect(list.filter((frame) => frame.alerts > 0 || frame.toasts > 0)).toStrictEqual([]); // T2
    expect(home.filter((frame) => !frame.sheet)).toStrictEqual([]); // T3
    expect(list.filter((frame) => frame.guardSpinner > 0)).toStrictEqual([]); // T5
    const ops = await requestOperations(page);
    expect(count(ops, 'GET /v1/me') - meBefore).toBe(1);
  });

  test('서재 시트 — 같은 이동 · Toast 0', async ({ page }) => {
    await installFrameRecorder(page);
    await logInToHome(page, 'sessions:onboarding-incomplete');
    const sheet = await openLibrarySheet(page);
    await startRecording(page);
    await sheet.getByRole('button', { name: 'Start Session' }).click();
    await expect(page).toHaveURL(/\/onboarding(\/|$)/);
    const list = await frames(page);
    annotate(list);
    expect(before(list, '/library').filter((frame) => frame.busy !== true)).toStrictEqual([]);
    expect(list.filter((frame) => frame.alerts > 0 || frame.toasts > 0)).toStrictEqual([]);
    expect(list.filter((frame) => frame.guardSpinner > 0)).toStrictEqual([]);
  });
});
