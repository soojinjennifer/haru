/**
 * Stage 4b `S4-H3` — 업로드 · 48h · 7일 · 14일 안내 (AC-4-149 ~ 151 · 153, 4b Spec §18.3 ~ §18.5) +
 * `D4-123` 브라우저 Mock 기기 seed + `D4-125` (`VG-H2R-01` loading 이음매 · `VG-H2R-02` 포커스 스크롤).
 *
 * jsdom 이 보지 못하는 것만 본다 — 실제 브라우저 조립(`apiClients.ts` 의 seed → 런타임 시작)으로 앱 시작 안내가 뜨는지 ·
 * Home 7일 배너의 높이 · 줄 수 · 밀림(393 · 320 · 600) · 오프라인 배너 우선 → 온라인 복귀 시 재표시 ·
 * Chromium 렌더 타이밍에서의 `aria-busy` 끊김 · 짧은 세로에서 포커스 이동이 화면을 움직이지 않는지.
 * 순서·보류·문구 출처 증거는 `apps/web/__tests__/session-notices.test.tsx` · `recording-notices.test.ts`.
 *
 * 새 baseline 없음 — 배너 문구에 **실행 날짜**(기기 시계 + 14일)가 들어가 매일 바뀐다 (`R-BASELINE-1`). 기하는 수치로 단정한다.
 */
import { expect, test, type Page } from '@playwright/test';

import { advanceUntil, advanceUntilToastGone, advanceUntilToastText } from './support/clock';
import { gotoApp, hideDevPanel } from './support/gallery';
import {
  logInToHome,
  READY_TITLE,
  requestOperations,
  requestPayloads,
  startSession,
} from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const RECOVERED = 'We saved what was recorded before HARU closed.';
const STALLED = "Your recording hasn't uploaded yet. It's still saved on this device.";
const EXPIRED = "A recording that couldn't upload in 14 days was removed from this device.";
const RETENTION =
  /^Go online before [A-Z][a-z]{2} \d{1,2}(, \d{4})? or your recording will be removed\.$/;
const OFFLINE_TOAST = "You're offline. Your recording stays on this device.";

const BANNER = '.haru-app-shell__bar-top .haru-alert--banner';

/** 앱을 연다 — 런타임은 앱 시작 시 seed → 시작한다 (로그인 화면에서도 안내가 뜬다, H2F-4 ②). */
async function openApp(page: Page, scenario: string): Promise<void> {
  await gotoApp(page, `/auth/log-in?scenario=${encodeURIComponent(scenario)}`);
}

function uploadOps(ops: readonly string[]): string[] {
  return ops.filter((op) => /recordings|upload-tokens|TUS/.test(op));
}

test.describe('`D4-123` — 브라우저 seed 로 앱 시작 Toast 를 재현한다', () => {
  test('`recorder:crash-recovered` → 복구 Toast 1회 · 전이 `completed(recovered_after_crash)`', async ({
    page,
  }) => {
    await openApp(page, 'recorder:crash-recovered');
    await expect(page.locator('.haru-toast')).toHaveText(RECOVERED);
    await expect(page.locator('.haru-toast')).toHaveClass(/haru-toast--neutral/);
    await expect
      .poll(async () =>
        (await requestPayloads(page, 'POST /v1/sessions/:sessionId/transitions')).map(
          (payload) => (payload as { completedReason?: string }).completedReason,
        ),
      )
      .toEqual(['recovered_after_crash']);
  });

  test('`recorder:local-retention-exceeded` → 14일 Toast 1회 · action 0 · 서버 요청 0 (AC-4-151)', async ({
    page,
  }) => {
    await openApp(page, 'recorder:local-retention-exceeded');
    const toast = page.locator('.haru-toast');
    await expect(toast).toHaveText(EXPIRED);
    await expect(toast.getByRole('button')).toHaveCount(0);
    expect(uploadOps(await requestOperations(page))).toEqual([]);
  });

  test('`recordings:upload-stalled-48h` → 48h Toast + `Try again` → 업로드 경로 요청 증가 · Toast 닫힘 (AC-4-149 ③)', async ({
    page,
  }) => {
    await openApp(page, 'recordings:upload-stalled-48h');
    const toast = page.locator('.haru-toast');
    await expect(toast).toContainText(STALLED);
    await expect(toast.getByRole('button', { name: 'Dismiss' })).toBeVisible();
    // 시작 직후 큐의 첫 시도가 끝날 때까지
    await expect
      .poll(async () => uploadOps(await requestOperations(page)).length)
      .toBeGreaterThan(0);
    await page.waitForTimeout(300);
    const before = uploadOps(await requestOperations(page)).length;
    await toast.getByRole('button', { name: 'Try again' }).click();
    await expect
      .poll(async () => uploadOps(await requestOperations(page)).length)
      .toBeGreaterThan(before);
    await expect(page.locator('.haru-toast')).toHaveCount(0);
  });

  test('`recordings:upload-stalled-48h` + 오프라인 → `Try again` 요청 0 + 오프라인 안내 (AC-4-149 ④)', async ({
    page,
    context,
  }) => {
    await openApp(page, 'recordings:upload-stalled-48h');
    const toast = page.locator('.haru-toast');
    await expect(toast).toContainText(STALLED);
    await context.setOffline(true);
    await page.waitForTimeout(300);
    const before = uploadOps(await requestOperations(page)).length;
    await toast.getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator('.haru-toast')).toHaveText(OFFLINE_TOAST);
    await page.waitForTimeout(300);
    expect(uploadOps(await requestOperations(page)).length).toBe(before);
    await context.setOffline(false);
  });

  test('14일 + 48h 를 함께 고르면 한 번에 1개 — 14일 Toast 가 사라진 뒤 48h (AC-4-153 ②③)', async ({
    page,
  }) => {
    // 14일 Toast 퇴장 → 48h 는 주입 clock 으로 흘린다 (`QA-4B-003` — `support/clock.ts`)
    await page.clock.install();
    await openApp(page, 'recorder:local-retention-exceeded,recordings:upload-stalled-48h');
    const toast = page.locator('.haru-toast');
    await expect(toast).toHaveText(EXPIRED);
    await expect(page.locator('.haru-toast')).toHaveCount(1);
    await advanceUntil(
      page,
      async () => ((await toast.textContent()) ?? '').includes(STALLED),
      'toast 48h after 14-day',
    );
    await expect(page.locator('.haru-toast')).toHaveCount(1);
  });
});

interface BannerProbe {
  top: number;
  height: number;
  lines: number;
  buttons: string[];
  role: string | null;
  barBottom: number;
  characterTop: number;
  bubbleTop: number;
}

async function probeBanner(page: Page): Promise<BannerProbe> {
  return page.evaluate((selector) => {
    const node = document.querySelector(selector);
    const bar = document.querySelector('.haru-app-shell__bar-top');
    const character = document.querySelector('.haru-home-stage__character');
    const bubble = document.querySelector('.haru-home-stage__bubble');
    if (node === null || bar === null || character === null || bubble === null) {
      throw new Error('banner probe target missing');
    }
    const title = node.querySelector('.haru-alert__body > *');
    if (title === null) throw new Error('banner title missing');
    const range = document.createRange();
    range.selectNodeContents(title);
    const tops = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
    return {
      top: node.getBoundingClientRect().top,
      height: node.getBoundingClientRect().height,
      lines: tops.size,
      buttons: [...node.querySelectorAll('button')].map((b) => b.getAttribute('aria-label') ?? ''),
      role: node.getAttribute('role'),
      barBottom: bar.getBoundingClientRect().bottom,
      characterTop: character.getBoundingClientRect().top,
      bubbleTop: bubble.getBoundingClientRect().top,
    };
  }, BANNER);
}

async function stageTops(page: Page): Promise<{ characterTop: number; bubbleTop: number }> {
  return page.evaluate(() => {
    const character = document.querySelector('.haru-home-stage__character');
    const bubble = document.querySelector('.haru-home-stage__bubble');
    if (character === null || bubble === null) throw new Error('stage missing');
    return {
      characterTop: character.getBoundingClientRect().top,
      bubbleTop: bubble.getBoundingClientRect().top,
    };
  });
}

test.describe('AC-4-150 — Home 7일 보관 배너 (`D4-120` Q10 · Q11 · Q12, `AD-S4-25` 후보)', () => {
  /*
   * 4b Spec §18.5 ⓒ 산술: 1줄 54 · 2줄 74 · 3줄 94. 밀림 = 배너 높이 (버블·캐릭터가 그만큼 내려간다).
   * 실측값은 handoff `# S4-H3` 에 기록한다 — 여기서는 산술과의 일치 · 상한(94, `G-01` 이하)을 단정한다.
   */
  for (const width of [393, 320, 600] as const) {
    test(`${width}×852 — 문장 1개 + 닫기 · 높이 = 34 + 20×줄 · 밀림 = 높이 · ≤ 94`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 852 });
      await logInToHome(page);
      const without = await stageTops(page);

      await logInToHome(page, 'recorder:local-retention-notice');
      const banner = page.locator(BANNER);
      await expect(banner).toBeVisible();
      await expect(banner.locator('.haru-alert__body > *')).toHaveText(RETENTION);
      const probe = await probeBanner(page);
      test.info().annotations.push({
        type: 'measure',
        description: JSON.stringify({ width, ...probe, without }),
      });

      expect(probe.role).toBe('alert');
      expect(probe.buttons).toEqual(['Dismiss']);
      expect(probe.top).toBeGreaterThanOrEqual(48);
      expect(probe.height).toBe(34 + 20 * probe.lines);
      expect(probe.height).toBeLessThanOrEqual(94);
      expect(probe.characterTop - without.characterTop).toBe(probe.height);
      expect(probe.bubbleTop - without.bubbleTop).toBe(probe.height);
    });
  }

  test('닫기 → 사라지고 버블·캐릭터가 제자리로 (밀림 0)', async ({ page }) => {
    await logInToHome(page);
    const without = await stageTops(page);
    await logInToHome(page, 'recorder:local-retention-notice');
    const banner = page.locator(BANNER);
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: 'Dismiss' }).click();
    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect.poll(() => stageTops(page)).toEqual(without);
  });

  test('오프라인 캐시 배너와 같은 슬롯 — 오프라인 배너 1개만 (Q11)', async ({ page }) => {
    await logInToHome(page, 'activity-cards:offline-cached-card,recorder:local-retention-notice');
    await expect(page.locator(BANNER)).toHaveText('Go online to start a session');
    await expect(page.locator(BANNER)).toHaveCount(1);
    await expect(page.locator('.haru-alert--warning')).toHaveCount(0);
    // 온라인 복귀 시 재표시(닫기 기록 소비 0)는 상태 파생이라 단위 테스트가 본다 — Mock 의 이 key 는 실제 연결과 무관하게
    // Activity Card 조회를 계속 끊는다.
  });
});

test.describe('`D4-125` — `VG-H2R-01` · `VG-H2R-02`', () => {
  /** 버튼 `aria-busy` 가 켜진 횟수 (oldValue 가 비었던 기록 수). 끊김 없으면 1. */
  async function watchBusy(page: Page, selector: string): Promise<void> {
    await page.evaluate((target) => {
      const button = document.querySelector(target);
      if (button === null) throw new Error('no button');
      const store = globalThis as { __busyStarts?: number };
      store.__busyStarts = 0;
      new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.oldValue === null) store.__busyStarts = (store.__busyStarts ?? 0) + 1;
        }
      }).observe(button, {
        attributes: true,
        attributeFilter: ['aria-busy'],
        attributeOldValue: true,
      });
    }, selector);
  }

  test('Home 확인 탭 → 판정 → 생성 → 이동까지 `aria-busy` 끊김 0 (`VG-H2R-01`)', async ({
    page,
  }) => {
    await logInToHome(page);
    await page
      .locator('.haru-activity-card-flip__face--front')
      .first()
      .getByRole('button', { name: 'Start Session' })
      .click();
    const sheet = page.getByRole('dialog', { name: READY_TITLE });
    await sheet.getByText('Bedtime', { exact: true }).click();
    const confirm = sheet.getByRole('button', { name: 'Continue' });
    await confirm.evaluate((node) => node.setAttribute('data-busy-probe', ''));
    await watchBusy(page, '[data-busy-probe]');
    await confirm.click();
    await expect(page).toHaveURL(/\/session\/[0-9a-f-]+$/);
    expect(await page.evaluate(() => (globalThis as { __busyStarts?: number }).__busyStarts)).toBe(
      1,
    );
  });

  test('320×568 — 자동 시트를 닫아도 화면이 스크롤되지 않는다 (`VG-H2R-02`)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await logInToHome(page, 'recorder:mic-permission-blocked');
    await page
      .locator('.haru-activity-card-flip__face--front')
      .first()
      .getByRole('button', { name: 'Start Session' })
      .click();
    const ready = page.getByRole('dialog', { name: READY_TITLE });
    await ready.getByText('Bedtime', { exact: true }).click();
    await ready.getByRole('button', { name: 'Continue' }).click();
    const sheet = page.getByRole('dialog', { name: 'Your microphone is off' });
    await expect(sheet).toBeVisible();
    const before = await page.locator('.haru-record').boundingBox();
    await sheet.getByRole('button', { name: 'Not now' }).click();
    await expect(sheet).toHaveCount(0);
    await expect(page.locator('.haru-record')).toBeFocused();
    const after = await page.locator('.haru-record').boundingBox();
    expect(after?.y).toBe(before?.y);
  });
});

test.describe('`S4-H3R` — `D4-132` · `D4-134` (`VG-H3-01` · `VG-H3-02` · `VG-H3-04`)', () => {
  interface ToastSegment {
    text: string;
    path: string;
    from: number;
    to: number | null;
  }

  /**
   * 화면의 Toast 문구 변화를 시각과 함께 적는다 — 같은 노드에서 문구만 바뀌는 교체도 잡는다.
   * 문서 전체 subtree 를 보는 `MutationObserver` 라 4ms 교체(`VG-H3-02`)도 놓치지 않는다.
   */
  async function watchToasts(page: Page): Promise<void> {
    await page.addInitScript(() => {
      const store = globalThis as { __toastLog?: ToastSegment[] };
      store.__toastLog = [];
      let current: string | null = null;
      const sample = (): void => {
        const node = document.querySelector('.haru-toast');
        const text = node?.textContent ?? null;
        if (text === current) return;
        const now = performance.now();
        const log = store.__toastLog ?? [];
        const open = log.at(-1);
        if (open !== undefined && open.to === null) open.to = now;
        if (text !== null) log.push({ text, path: location.pathname, from: now, to: null });
        current = text;
      };
      new MutationObserver(sample).observe(document, {
        subtree: true,
        childList: true,
        characterData: true,
      });
    });
  }

  async function toastLog(page: Page): Promise<ToastSegment[]> {
    return page.evaluate(() => (globalThis as { __toastLog?: ToastSegment[] }).__toastLog ?? []);
  }

  test('`VG-H3-02` — 녹음 중 보류된 복구 안내는 `Submit` 후 완료 Toast 가 사라진 뒤 4초 보인다', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    // Toast 수명은 주입 clock 으로 흘린다 (`QA-4B-003` — `support/clock.ts`). `__toastLog` 의 시각도 같은 clock 이다.
    await page.clock.install();
    await watchToasts(page);
    // 48h(6초)가 떠 있는 동안 녹음을 시작해 크래시 복구 안내를 보류시킨다 (`D4-120` Q13 · Q14 순서 48h → 복구).
    await startSession(page, 'recorder:crash-recovered,recordings:upload-stalled-48h');
    const toast = page.locator('.haru-toast');
    await expect(toast).toContainText(STALLED);
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
    // 48h 가 사라진 뒤 녹음 중에는 아무 Toast 도 뜨지 않는다 (보류)
    await advanceUntilToastGone(page, toast);
    await page.clock.runFor(1_000);
    await expect(toast).toHaveCount(0);

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/\/session\/[0-9a-f-]+\/complete$/);
    await expect(toast).toHaveText('Recording submitted');
    await advanceUntilToastText(page, toast, RECOVERED);
    await advanceUntilToastGone(page, toast);

    const log = await toastLog(page);
    const submitted = log.filter((segment) => segment.text === 'Recording submitted');
    const recovered = log.filter((segment) => segment.text === RECOVERED);
    expect(submitted).toHaveLength(1);
    expect(recovered).toHaveLength(1);
    const [done] = submitted;
    const [notice] = recovered;
    if (done === undefined || notice === undefined || done.to === null || notice.to === null) {
      throw new Error('toast segments incomplete');
    }
    // 세션 화면이 아니라 완료 화면에서 · 완료 Toast 가 **사라진 뒤** 에 · 기본 4초 동안 (DOM 체류 = 타이머 + 퇴장)
    expect(notice.path).toMatch(/\/complete$/);
    expect(notice.from).toBeGreaterThanOrEqual(done.to);
    expect(notice.to - notice.from).toBeGreaterThanOrEqual(4_000);
  });

  test('`VG-H3-02` — Discard → Home 경로도 보류 안내가 Home 에서 1회 보인다', async ({ page }) => {
    test.setTimeout(90_000);
    await page.clock.install();
    await watchToasts(page);
    await startSession(page, 'recorder:crash-recovered,recordings:upload-stalled-48h');
    const toast = page.locator('.haru-toast');
    await expect(toast).toContainText(STALLED);
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
    await advanceUntilToastGone(page, toast);
    await page.getByRole('button', { name: 'Discard' }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Discard', exact: true })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await advanceUntilToastText(page, toast, RECOVERED);
    await advanceUntilToastGone(page, toast);
    const recovered = (await toastLog(page)).filter((segment) => segment.text === RECOVERED);
    expect(recovered).toHaveLength(1);
    expect(recovered[0]?.path).toBe('/');
  });

  for (const [width, height] of [
    [393, 86],
    [320, 104],
  ] as const) {
    test(`\`VG-H3-01\` ${width}×852 — 48h Toast \`Dismiss\` 는 38×38 (줄지 않음) · Toast 높이 ${height}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 852 });
      await openApp(page, 'recordings:upload-stalled-48h');
      const toast = page.locator('.haru-toast');
      await expect(toast).toContainText(STALLED);
      const close = await toast.getByRole('button', { name: 'Dismiss' }).boundingBox();
      expect(close?.width).toBe(38);
      expect(close?.height).toBe(38);
      expect((await toast.boundingBox())?.height).toBe(height);
    });
  }

  test('`VG-H3-04` — 7일 배너를 키보드로 닫으면 포커스는 다음 Tab 대상(버블 닫기) — `BODY` 아님', async ({
    page,
  }) => {
    await logInToHome(page, 'recorder:local-retention-notice');
    const banner = page.locator(BANNER);
    const close = banner.getByRole('button', { name: 'Dismiss' });
    // 기대 대상 = 닫기 전 그 버튼에서 Tab 했을 때 가는 곳
    await close.focus();
    await page.keyboard.press('Tab');
    const expected = await page.evaluate(() => {
      const node = document.activeElement as HTMLElement;
      node.setAttribute('data-next-probe', '');
      return node.getAttribute('aria-label');
    });
    expect(expected).toBe('Dismiss');
    await close.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(page.locator('[data-next-probe]')).toBeFocused();
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  });
});
