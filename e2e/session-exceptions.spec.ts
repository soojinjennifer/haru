/**
 * Stage 4b `S4-H2` — 예외·안내 UI (4b Spec §7 · AC-4-63 · 64 · 70 · 134).
 * `S4-H2R` — Start Session 권한 판정 → 대화 전용 (AC-4-63 재정의 · 145 · 147 · 148, 4b Spec §18.2) ·
 * `D4-121` 세션 화면 Toast 가 상단 줄 아래 (`VG-H2-02`).
 *
 * jsdom 이 계산하지 않는 것만 본다 — 공지 슬롯이 **Figma 요소를 움직이지 않는다**(§7.2) · 짧은 세로에서는
 * 슬롯 대신 Toast · 브라우저 실제 `offline`/`online` 이벤트 → Toast · 시트/공지 시각 baseline.
 * 요청 순서·문구 출처 증거는 `apps/web/__tests__/session-exceptions.test.tsx` 가 갖는다.
 *
 * `R-BASELINE-1`: 세션은 클라이언트 이동으로 들어온다 → `startSession()` 이 이미지 디코드 + settle.
 * 시계는 `page.clock` 으로 멈춘 뒤 필요한 만큼만 진행한다 (`session-recording.spec.ts` 와 같은 방식).
 * dev 패널은 `hideDevPanel`.
 */
import { expect, test, type Page } from '@playwright/test';

import { FRAME_SNAPSHOT, REGION_SNAPSHOT } from '../playwright.config';
import { hideDevPanel, settle } from './support/gallery';
import {
  firstStartSession,
  logInToHome,
  READY_TITLE,
  requestOperations,
  requestPayloads,
  settleImages,
  startSession,
} from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const NOTICE_TITLE = 'Keep HARU on screen while you record';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function box(page: Page, selector: string): Promise<Box> {
  const found = await page.locator(selector).first().boundingBox();
  if (found === null) throw new Error(`no box for ${selector}`);
  return found;
}

/** 시계를 멈춘 뒤 녹음을 시작하고 `seconds` 를 넘긴다 — Mock 녹음기는 3번째 청크 뒤 백그라운드 알림을 낸다. */
async function recordFrozen(page: Page, seconds: number): Promise<void> {
  for (let attempt = 0; ; attempt += 1) {
    const now = await page.evaluate(() => Date.now());
    try {
      await page.clock.pauseAt(now + 250);
      break;
    } catch (error) {
      if (attempt >= 5) throw error;
    }
  }
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.clock.fastForward(seconds * 1000);
  await page.clock.runFor(100);
}

test.describe('공지 슬롯 — Web 백그라운드 경고 (§7.2 · AC-4-70)', () => {
  test('393×852: 슬롯은 상태 블록과 Record 사이 · Figma 요소 좌표 불변', async ({ page }) => {
    await page.clock.install();
    await startSession(page, 'recorder:web-background-warning');
    await recordFrozen(page, 0);
    // `fastForward` 는 다시 걸린 타이머를 한 번만 부른다 — 청크(1초 간격)를 차례로 내려면 `runFor` 다
    await page.clock.runFor(5_000);
    const notice = page.locator('.haru-session__notice');
    await expect(notice).toContainText(NOTICE_TITLE);
    await page.clock.runFor(300);

    const status = await box(page, '.haru-session-status');
    const record = await box(page, '.haru-record');
    const book = await box(page, '.haru-session-book-chip');
    const slot = await box(page, '.haru-session__notice');
    // `session-recording.spec.ts` 의 Figma 좌표와 같다 — 공지가 있어도 움직이지 않는다
    expect(book.y).toBe(281);
    expect(status.y).toBe(344);
    expect(record).toEqual({ x: 121.5, y: 621, width: 150, height: 150 });
    expect(slot.y).toBeGreaterThanOrEqual(status.y + status.height);
    expect(slot.y + slot.height).toBeLessThanOrEqual(record.y);
    expect(slot.x).toBe(24);
    expect(slot.width).toBe(345);
    await expect(page.locator('.haru-toast')).toHaveCount(0);

    await expect(page).toHaveScreenshot('s4-session-background-notice.png', FRAME_SNAPSHOT);
  });

  test('393×700 (압축): 슬롯이 들어가지 않으면 Toast 로 알린다 · Record 위치 불변', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 700 });
    await startSession(page, 'recorder:web-background-warning');
    const recordBefore = await box(page, '.haru-record');
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
    await expect(page.locator('.haru-toast')).toContainText(NOTICE_TITLE);
    await expect(page.locator('.haru-session__notice')).toHaveCount(0);
    expect(await box(page, '.haru-record')).toEqual(recordBefore);
  });

  test('`Dismiss` → 슬롯 제거, 녹음 계속', async ({ page }) => {
    await startSession(page, 'recorder:web-background-warning');
    await page.getByRole('button', { name: 'Start recording' }).click();
    const notice = page.locator('.haru-session__notice');
    await expect(notice).toContainText(NOTICE_TITLE);
    await notice.getByRole('button', { name: 'Dismiss' }).click();
    await expect(notice).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  });
});

test.describe('마이크 거부 안내 시트 (§7.3 · AC-4-148 · AC-4-134)', () => {
  // `S4-H2R` 이후 녹음 세션의 거부 = Start 때 허용 → Record 탭에서 거부 (`mic-permission-revoked`)
  test('녹음 세션 거부 → 시트 자동 · `permission-denied` 변형 · `Not now` → 포커스 Record', async ({
    page,
  }) => {
    await startSession(page, 'recorder:mic-permission-revoked');
    await page.getByRole('button', { name: 'Start recording' }).click();
    const sheet = page.getByRole('dialog', { name: 'Your microphone is off' });
    await expect(sheet).toBeVisible();
    // `D4-119` CP-11 — 버튼은 `Not now` 하나
    await expect(sheet.getByRole('button')).toHaveText(['Not now']);
    await expect(page.locator('.haru-record')).toHaveClass(/haru-record--permission-denied/);
    await expect(page.locator('.haru-scrim')).toHaveCount(1);
    await settle(page); // 시트 등장 모션이 끝난 뒤 (`R-BASELINE-1` ①)
    await expect(sheet).toHaveScreenshot('s4-session-mic-sheet.png', REGION_SNAPSHOT);

    await sheet.getByRole('button', { name: 'Not now' }).click();
    await expect(sheet).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Microphone is off' })).toBeFocused();
  });
});

test.describe('오프라인 Toast (§7.1)', () => {
  test('브라우저 offline → Toast · online → Toast · Record 위치 불변', async ({
    page,
    context,
  }) => {
    await startSession(page);
    const record = await box(page, '.haru-record');
    await context.setOffline(true);
    await expect(page.locator('.haru-toast')).toContainText("You're offline.");
    expect(await box(page, '.haru-record')).toEqual(record);
    await context.setOffline(false);
    await expect(page.locator('.haru-toast')).toContainText("You're back online.");
  });
});

test.describe('30분 자동 종료 (AC-4-64)', () => {
  test('누적 30분 → Toast + 완료 화면', async ({ page }) => {
    await page.clock.install();
    const sessionId = await startSession(page);
    await recordFrozen(page, 1);
    await page.clock.fastForward(1_800_000);
    await page.clock.runFor(500);
    await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/complete$`));
    await expect(page.locator('.haru-toast')).toContainText('We saved your session at 30:00.');
  });
});

/** Home → Start Session → Reading Context 확인 → 세션 화면 (대화 전용이면 `Start recording` 이 없다). */
async function startFromHome(page: Page, scenario: string): Promise<void> {
  await logInToHome(page, scenario);
  await firstStartSession(page).click();
  const sheet = page.getByRole('dialog', { name: READY_TITLE });
  await sheet.getByText('Bedtime', { exact: true }).click();
  await sheet.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/session\/[0-9a-f-]+$/);
  await expect(page.locator('.haru-record')).toBeVisible();
}

const CONVERSATION_TEXT =
  'This session continues without recording. To record, turn on the microphone and start a new session.';

test.describe('`S4-H2R` — Start Session 권한 판정 → 대화 전용 (AC-4-145 · AC-4-147)', () => {
  for (const scenario of [
    'recorder:mic-permission-denied',
    'recorder:mic-permission-blocked',
    'recorder:mic-unavailable',
  ]) {
    test(`${scenario}: body mode=conversation_only · 순서 selection → sessions · 시트 자동 1회 · 포커스 Record`, async ({
      page,
    }) => {
      await startFromHome(page, scenario);
      const [created] = (await requestPayloads(page, 'POST /v1/sessions')) as {
        mode: string;
        activityCardOptionId: string | null;
        bookId: string | null;
      }[];
      expect(created?.mode).toBe('conversation_only');
      expect(created?.activityCardOptionId).not.toBeNull();
      expect(created?.bookId).not.toBeNull();
      const order = (await requestOperations(page)).filter(
        (op) => op.endsWith('/selection') || op === 'POST /v1/sessions',
      );
      expect(order).toEqual(['POST /v1/activity-cards/:cardId/selection', 'POST /v1/sessions']);

      const sheet = page.getByRole('dialog', { name: 'Your microphone is off' });
      await expect(sheet).toBeVisible();
      await expect(sheet).toContainText(CONVERSATION_TEXT);
      await expect(page.locator('.haru-record')).toHaveClass(/haru-record--permission-denied/);
      await sheet.getByRole('button', { name: 'Not now' }).click();
      await expect(sheet).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Microphone is off' })).toBeFocused();
      expect((await requestOperations(page)).filter((op) => op.includes('/transitions'))).toEqual(
        [],
      );
    });
  }

  test('대화 전용 시트 시각 (393) · 320 문단 줄 수', async ({ page }) => {
    await startFromHome(page, 'recorder:mic-permission-blocked');
    await settleImages(page);
    const sheet = page.getByRole('dialog', { name: 'Your microphone is off' });
    await expect(sheet).toBeVisible();
    await settle(page); // 시트 등장 모션이 끝난 뒤 (`R-BASELINE-1` ①)
    await expect(sheet).toHaveScreenshot('s4-session-mic-sheet-conversation.png', REGION_SNAPSHOT);

    await page.setViewportSize({ width: 320, height: 568 });
    await settle(page);
    const paragraph = sheet.locator('.haru-sheet__content .haru-text');
    const lines = await paragraph.evaluate((node) => {
      const lineHeight = Number.parseFloat(getComputedStyle(node).lineHeight);
      return Math.round(node.getBoundingClientRect().height / lineHeight);
    });
    // 4b Spec §18.2 ③ ⑤ — 320 에서 3줄 이내 권장 · 시트가 화면을 넘지 않는다
    expect(lines).toBeLessThanOrEqual(3);
    const sheetBox = await box(page, '.haru-sheet');
    expect(sheetBox.y).toBeGreaterThanOrEqual(0);
  });
});

test.describe('`D4-121` — 세션 화면 Toast 는 상단 줄 아래 (`VG-H2-02`)', () => {
  test('ready offline Toast 가 닫기를 덮지 않는다 — 닫기 중심 탭 = 닫기 · Toast top ≥ 상단 줄 bottom', async ({
    page,
    context,
  }) => {
    await startSession(page);
    await context.setOffline(true);
    const toast = page.locator('.haru-toast');
    await expect(toast).toContainText("You're offline.");
    await settle(page);
    const row = await box(page, '.haru-session__top-row');
    const close = await box(page, '.haru-session__top-row .haru-icon-button');
    const toastBox = await box(page, '.haru-toast');
    expect(toastBox.y).toBeGreaterThanOrEqual(row.y + row.height);
    const hit = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('button')?.getAttribute('aria-label'),
      { x: close.x + close.width / 2, y: close.y + close.height / 2 },
    );
    expect(hit).toBe('Close session');
    await context.setOffline(false);
  });

  test('recording: Prompts 칩 · 닫기 둘 다 Toast 에 가려지지 않는다', async ({ page, context }) => {
    await startSession(page);
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
    await context.setOffline(true);
    await expect(page.locator('.haru-toast')).toContainText("You're offline.");
    await settle(page);
    for (const selector of [
      '.haru-session__top-row > .haru-button',
      '.haru-session__top-row .haru-icon-button',
    ]) {
      const target = await box(page, selector);
      const covered = await page.evaluate(
        ({ x, y }) => (document.elementFromPoint(x, y)?.closest('.haru-toast') ?? null) !== null,
        { x: target.x + target.width / 2, y: target.y + target.height / 2 },
      );
      expect(covered, selector).toBe(false);
    }
    await context.setOffline(false);
  });
});
