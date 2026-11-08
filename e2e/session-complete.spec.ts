/**
 * Stage 4b `S4-H1` · `S4-H1R` — 완료 화면 `29:62` y 0~468 (Stage 4 Spec §2.7 · §2.8, AC-4-57~61 · 104 · 107 · 139~144).
 *
 * 좌표 규칙: **Web y = Figma y − 56** (상태바는 OS 영역). 기대값은 `get_metadata(29:62)` 노드 좌표와
 * `get_design_context(29:62)` 선언값이다. 버블 본체 top = 324(tail 꼭짓점) + 22.627 − 12 = 334.627.
 *
 * `VG-K1S-02`: 세션과 뷰포트를 공유해 `scrollTop` 이 승계되는 경로를 스크롤된 세션에서 직접 재현한다.
 * `R-BASELINE-1`: `Submit` 은 클라이언트 이동 → 이미지 디코드 + settle, Toast 퇴장 후 찍는다. dev 패널은 가린다.
 */
import { expect, test, type Page } from '@playwright/test';

import { FRAME_SNAPSHOT } from '../playwright.config';
import { advanceUntilToastGone } from './support/clock';
import { hideDevPanel } from './support/gallery';
import { logInToHome, requestOperations, settleImages, startSession } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const FIGMA_TOP = 56;
const VIEWPORT = '[data-app-shell-viewport]';
const RECORDED = 'Storytime success! Emma did wonderfully.';
const STICKER_MESSAGE = 'You read together today';
const SUBTEXT = '14 min together · sticker earned';
const BUBBLE = '.haru-session-bubble--complete .haru-bubble';
const SUBTEXT_LINE = '.haru-session-bubble__subtext';
const MISSING_SESSION = '00000000-0000-4000-8000-000000000000';
/** `I88:929;88:758` — Figma 렌더 bottom 431 (+ 본체 top 소수점). Web y = Figma y − 56. */
const BODY_BOTTOM_WITH_SUBTEXT = 431.63 - FIGMA_TOP;
const BODY_BOTTOM_WITHOUT_SUBTEXT = 406.63 - FIGMA_TOP;

/** computed 색 문자열 — Figma 선언값과 대조하는 **기대값**이다 (`R-FIGMA-1` ①). */
const cssColor = (fn: 'rgb' | 'rgba', channels: readonly number[]) =>
  `${fn}(${channels.join(', ')})`;
const GLASS = cssColor('rgba', [255, 255, 255, 0.74]);
const RING = cssColor('rgba', [255, 255, 255, 0.5]);
const PRIMARY = cssColor('rgb', [74, 95, 92]);
const SECONDARY = cssColor('rgb', [125, 146, 145]);
const STICKER_FROM = cssColor('rgb', [208, 204, 161]);
const STICKER_TO = cssColor('rgb', [238, 210, 189]);

async function submitSession(page: Page, scenario?: string): Promise<string> {
  const sessionId = await startSession(page, scenario);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/complete$`));
  await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
  return sessionId;
}

/** 새로고침은 Mock 인증을 지우므로 SPA 이동으로 직접 진입을 재현한다 (Visual Gap H1 §2.4). */
async function spaGoto(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

/** 레이아웃을 건드리지 않고 응답 문구만 바꾼다 — Scenario key 를 늘리지 않는다 (`API_CONTRACTS.md` §5.4). */
async function setSubtext(page: Page, text: string): Promise<void> {
  await page.locator(SUBTEXT_LINE).evaluate((element, value) => {
    element.textContent = value;
  }, text);
}

async function bottom(page: Page, selector: string): Promise<number> {
  const found = await box(page, selector);
  return found.y + found.height;
}

async function box(page: Page, selector: string) {
  const found = await page.locator(selector).first().boundingBox();
  if (found === null) throw new Error(`no box for ${selector}`);
  return found;
}

test.describe('393×852 — Figma `29:62` 대조', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('기하: 닫기 · 제목 · 스티커 · 링 · 아바타 · 버블', async ({ page }) => {
    await submitSession(page);
    await settleImages(page);

    expect(await box(page, '.haru-session-complete__close .haru-icon-button')).toEqual({
      x: 331,
      y: 66 - FIGMA_TOP,
      width: 38,
      height: 38,
    });
    const title = await box(page, 'h1');
    expect(title.y + title.height / 2).toBeCloseTo(85 - FIGMA_TOP, 1);
    expect(await box(page, '.haru-attendance-sticker')).toEqual({
      x: 68,
      y: 100 - FIGMA_TOP,
      width: 257,
      height: 64,
    });
    expect(await box(page, '.haru-attendance-sticker__tile')).toEqual({
      x: 78,
      y: 110 - FIGMA_TOP,
      width: 44,
      height: 44,
    });
    expect(await box(page, '.haru-attendance-sticker__tile .haru-icon')).toEqual({
      x: 89,
      y: 121 - FIGMA_TOP,
      width: 20,
      height: 20,
    });
    const text = await box(page, '.haru-attendance-sticker__text');
    expect(text.x).toBe(134); // 68 + 10 + 44 + 12 = `29:83` x (68 + 66)
    expect(await box(page, '.haru-session-complete__ring')).toEqual({
      x: 121.5,
      y: 172 - FIGMA_TOP,
      width: 150,
      height: 150,
    });
    expect(await box(page, '.haru-session-complete__medallion .haru-character-medallion')).toEqual({
      x: 128.5,
      y: 179 - FIGMA_TOP,
      width: 136,
      height: 136,
    });
    const bubble = await box(page, '.haru-session-bubble--complete .haru-bubble');
    expect(bubble.x).toBe(48);
    expect(bubble.width).toBe(297);
    expect(bubble.y).toBeCloseTo(334.627 - FIGMA_TOP, 1);
  });

  test('선언값: 면 · 타이포 · 그림자 · 그라디언트 (computed)', async ({ page }) => {
    await submitSession(page);
    const read = (selector: string, properties: readonly string[]) =>
      page
        .locator(selector)
        .first()
        .evaluate((element, names) => {
          const style = getComputedStyle(element);
          return names.map((name) => style.getPropertyValue(name));
        }, properties);

    expect((await read('.haru-attendance-sticker', ['background-color']))[0]).toBe(GLASS);
    const [tileImage, tileShadow] = await read('.haru-attendance-sticker__tile', [
      'background-image',
      'box-shadow',
    ]);
    expect(tileImage).toContain('140.268deg');
    expect(tileImage).toContain(STICKER_FROM);
    expect(tileImage).toContain(STICKER_TO);
    expect(tileShadow).toContain('0px 4px 10px');
    expect(tileShadow).toContain('0px 1.5px 0px');

    const [size, line, weight, color] = await read('.haru-session-bubble--complete .haru-text', [
      'font-size',
      'line-height',
      'font-weight',
      'color',
    ]);
    expect([size, line, weight, color]).toEqual(['16px', '22px', '700', PRIMARY]);
    const [ringFill] = await read('.haru-session-complete__ring', ['background-color']);
    expect(ringFill).toBe(RING);

    // AC-4-143: `29:84` Semibold 14 — 제목 스택은 타일 44 안에 있다.
    expect(
      await read('.haru-attendance-sticker__title', ['font-size', 'line-height', 'font-weight']),
    ).toEqual(['14px', '17px', '590']);
    expect((await box(page, '.haru-attendance-sticker__text')).height).toBeLessThanOrEqual(44);

    // AC-4-139: `I88:929;88:760` Regular 13/19 · secondary — `session.css` 22 강제가 먹지 않았다.
    expect(
      await read(SUBTEXT_LINE, [
        'font-size',
        'line-height',
        'font-weight',
        'color',
        'text-align',
        'white-space',
      ]),
    ).toEqual(['13px', '19px', '400', SECONDARY, 'center', 'normal']);
  });

  test('AC-4-139 ③: 보조 줄 기하 — 본체 bottom 431 · 줄 19 · gap 6 · 폭 265', async ({ page }) => {
    await submitSession(page);
    await settleImages(page);
    const main = await box(page, '.haru-session-bubble--complete .haru-text');
    const line = await box(page, SUBTEXT_LINE);
    expect(line.height).toBe(19);
    expect(line.width).toBe(265);
    expect(line.y - (main.y + main.height)).toBeCloseTo(6, 3);
    expect(await bottom(page, BUBBLE)).toBeCloseTo(BODY_BOTTOM_WITH_SUBTEXT, 1);
  });

  for (const [key, hasBubble] of [
    ['subtext-missing', true],
    ['bubble-missing', false],
  ] as const) {
    test(`AC-4-139 ②: \`session-completion:${key}\` — 보조 줄 미렌더`, async ({ page }) => {
      await submitSession(page, `session-completion:${key}`);
      await settleImages(page);
      await expect(page.locator(SUBTEXT_LINE)).toHaveCount(0);
      await expect(page.locator(BUBBLE)).toHaveCount(hasBubble ? 1 : 0);
      if (hasBubble) {
        expect(await bottom(page, BUBBLE)).toBeCloseTo(BODY_BOTTOM_WITHOUT_SUBTEXT, 1);
      }
    });
  }

  test('AC-4-141: 닫기 → 홈 replace · 뒤로가기로 복귀 안 함 · 전이 0', async ({ page }) => {
    await submitSession(page);
    const before = (await requestOperations(page)).filter((op) => op.startsWith('POST')).length;
    await page.getByRole('button', { name: 'Close session' }).click();
    await expect(page).toHaveURL(/\/$/);
    expect((await requestOperations(page)).filter((op) => op.startsWith('POST'))).toHaveLength(
      before,
    );
    await page.goBack();
    await expect(page).not.toHaveURL(/\/complete$/);
  });

  test('AC-4-142: Toast 는 닫기 줄 아래 — 제목·닫기 겹침 0 · 닫기 탭 가능', async ({ page }) => {
    await submitSession(page);
    const toast = page.locator('.haru-toast');
    await expect(toast).toBeVisible();
    await settleImages(page);
    // 측정과 "Toast 가 떠 있다" 확인을 같은 evaluate 에서 한다 (`e2e/toast.spec.ts` 머리 주석).
    const probe = await page.evaluate(() => {
      const rect = (selector: string) => {
        const found = document.querySelector(selector);
        if (found === null) throw new Error(`no ${selector}`);
        return found.getBoundingClientRect();
      };
      const toastBox = rect('.haru-toast');
      const title = rect('h1');
      const close = rect('.haru-session-complete__close button');
      const hit = document.elementFromPoint(close.x + close.width / 2, close.y + close.height / 2);
      return {
        toastTop: toastBox.top,
        titleBottom: title.bottom,
        closeBottom: close.bottom,
        closeHit: hit?.closest('button')?.getAttribute('aria-label') ?? null,
      };
    });
    expect(probe.closeHit).toBe('Close session');
    expect(probe.toastTop).toBeGreaterThanOrEqual(probe.closeBottom);
    expect(probe.toastTop).toBeGreaterThanOrEqual(probe.titleBottom);
    await expect(page.getByRole('status').filter({ hasText: 'Recording submitted' })).toHaveCount(
      1,
    );
  });

  test('AC-4-58 · 59 · 107: 문구가 Mock 응답 값이고 streak 언어가 없다', async ({ page }) => {
    await submitSession(page);
    await expect(page.locator('.haru-session-bubble--complete .haru-text')).toHaveText(RECORDED);
    await expect(page.locator(SUBTEXT_LINE)).toHaveText(SUBTEXT);
    const sticker = page.locator('.haru-attendance-sticker');
    await expect(sticker).toHaveRole('status');
    await expect(sticker.locator('.haru-attendance-sticker__title')).toHaveText(
      'Attendance sticker',
    );
    await expect(sticker.locator('.haru-attendance-sticker__message')).toHaveText(STICKER_MESSAGE);
    await expect(sticker).toHaveCount(1);
    const body = (await page.locator('main').textContent()) ?? '';
    expect(body).not.toMatch(/streak/i);
    expect(body).not.toMatch(/Day \d/);
  });

  test('AC-4-61 · 104: y 468 아래 렌더 요소 0 · 회고 카드 0 · 전이 응답이 있으면 재조회 0', async ({
    page,
  }) => {
    const sessionId = await startSession(page);
    const detailReads = async () =>
      (await requestOperations(page)).filter((op) => op === 'GET /v1/sessions/:sessionId').length;
    const before = await detailReads();
    await page.getByRole('button', { name: 'Start recording' }).click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/complete$`));
    await settleImages(page);
    const below = await page.evaluate((limit) => {
      const root = document.querySelector('main');
      if (root === null) return ['no main'];
      return [...root.querySelectorAll('*')]
        .filter((element) => element.getBoundingClientRect().bottom > limit)
        .map((element) => element.className.toString());
    }, 468 - FIGMA_TOP);
    expect(below).toEqual([]);
    await expect(page.getByText('How was storytime')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Save' })).toHaveCount(0);
    // 전이 응답이 있으면 완료 화면은 다시 조회하지 않는다.
    expect(await detailReads()).toBe(before);
  });

  test('baseline: 완료 화면 전체 프레임', async ({ page }) => {
    await submitSession(page);
    await expect(page.getByRole('status').filter({ hasText: 'Recording submitted' })).toHaveCount(
      0,
      { timeout: 8_000 },
    );
    await settleImages(page);
    await expect(page).toHaveScreenshot('s4-session-complete.png', FRAME_SNAPSHOT);
  });
});

test.describe('320×568 — 좁은 폭', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('가로 넘침 0 · 스티커 257 유지 · 버블 = 컬럼 272', async ({ page }) => {
    await submitSession(page);
    const metrics = await page
      .locator(VIEWPORT)
      .evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(metrics.scroll).toBe(metrics.client);
    expect((await box(page, '.haru-attendance-sticker')).width).toBe(257);
    expect((await box(page, '.haru-session-bubble--complete .haru-bubble')).width).toBe(272);
  });
});

test.describe('AC-4-139 ⑧ · 320 줄바꿈 (`D4-98`)', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('긴 문구는 2줄 · 본체 bottom 394.63 · clamp 0 · 가로 넘침 0', async ({ page }) => {
    await submitSession(page);
    await settleImages(page);
    await setSubtext(page, '14 min together · first sticker earned today');
    expect((await box(page, SUBTEXT_LINE)).height).toBe(38);
    expect(await bottom(page, BUBBLE)).toBeCloseTo(394.63, 1);

    await setSubtext(page, 'x'.repeat(58));
    const overflow = await page
      .locator(SUBTEXT_LINE)
      .evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBe(0);
    const metrics = await page
      .locator(VIEWPORT)
      .evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(metrics.scroll).toBe(metrics.client);
  });
});

test.describe('AC-4-140 · `D4-91` 직접 진입', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('ready 세션 `/complete` → 홈 replace · 전이 0 · 완료 화면 렌더 0', async ({ page }) => {
    const sessionId = await startSession(page);
    const transitions = async () =>
      (await requestOperations(page)).filter((op) => op.includes('/transitions')).length;
    const before = await transitions();
    await spaGoto(page, `/session/${sessionId}/complete`);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Session Complete' })).toHaveCount(0);
    expect(await transitions()).toBe(before);
    await page.goBack();
    await expect(page).not.toHaveURL(/\/complete$/);
  });
});

test.describe('AC-4-144 · 조회 실패 화면 `Back to Home` (`D4-99`, 명세 Visual Gap H1 §8)', () => {
  const PATHS = [`/session/${MISSING_SESSION}`, `/session/${MISSING_SESSION}/complete`] as const;
  const ERRORS = [
    ['없는 세션', undefined],
    ['조회 오류', 'sessions.getDetail:error'],
  ] as const;

  for (const path of PATHS) {
    for (const [label, scenario] of ERRORS) {
      test.describe(`${path} — ${label}`, () => {
        test.use({ viewport: { width: 393, height: 852 } });

        test('`Try again` 유지 · alert 밖 · 자동 포커스 0 · 홈 replace', async ({ page }) => {
          await logInToHome(page, scenario);
          await spaGoto(page, path);
          const home = page.getByRole('button', { name: 'Back to Home' });
          await expect(home).toBeVisible();
          await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
          await expect(page.getByRole('alert').getByText('Back to Home')).toHaveCount(0);
          await expect(home).not.toBeFocused();
          await home.click();
          await expect(page).toHaveURL(/\/$/);
          await page.goBack();
          await expect(page.getByRole('button', { name: 'Back to Home' })).toHaveCount(0);
        });
      });
    }
  }

  for (const { width, height, cardTop, buttonX } of [
    { width: 393, height: 852, cardTop: 300, buttonX: 117.11 },
    { width: 320, height: 568, cardTop: 147, buttonX: 80.61 },
    { width: 320, height: 420, cardTop: 73, buttonX: 80.61 },
  ]) {
    test.describe(`기하 ${String(width)}×${String(height)}`, () => {
      test.use({ viewport: { width, height } });

      test('카드 아래 gap 12 · hug · 높이 ≥ 44 · 스크롤 0 · 두 경로 수치 동일', async ({
        page,
      }) => {
        await logInToHome(page);
        const measured = [];
        for (const path of PATHS) {
          await spaGoto(page, path);
          const button = page.getByRole('button', { name: 'Back to Home' });
          await expect(button).toBeVisible();
          await settleImages(page);
          const card = await box(page, '.haru-session__error > :first-child');
          const found = await button.boundingBox();
          if (found === null) throw new Error('no button');
          measured.push({ card, button: found });
        }
        const [first, second] = measured;
        if (first === undefined || second === undefined) throw new Error('no measure');
        expect(second).toEqual(first);
        expect(first.button.height).toBeGreaterThanOrEqual(44);
        expect(first.button.y - (first.card.y + first.card.height)).toBeCloseTo(12, 1);
        expect(first.card.y).toBeCloseTo(cardTop, -0.5);
        expect(first.button.x).toBeCloseTo(buttonX, 0);
        const metrics = await page
          .locator(VIEWPORT)
          .evaluate((el) => ({ scroll: el.scrollHeight, client: el.clientHeight }));
        expect(metrics.scroll).toBe(metrics.client);
      });
    });
  }
});

test.describe('짧은 세로 — 내용 도달 (`D4-82`)', () => {
  for (const viewport of [
    { width: 393, height: 460 },
    { width: 375, height: 548 },
    { width: 320, height: 568 },
  ]) {
    test.describe(`${String(viewport.width)}×${String(viewport.height)}`, () => {
      test.use({ viewport });

      test('`VG-K1S-02`: 스크롤된 세션에서 넘어와도 맨 위에서 시작하고 끝까지 내려갈 수 있다', async ({
        page,
      }) => {
        await startSession(page);
        await page.getByRole('button', { name: 'Start recording' }).click();
        await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
        const submit = page.getByRole('button', { name: 'Submit' });
        await submit.scrollIntoViewIfNeeded();
        const before = await page.locator(VIEWPORT).evaluate((el) => el.scrollTop);
        expect(before).toBeGreaterThan(0);
        await submit.click();
        await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
        await settleImages(page);

        expect(await page.locator(VIEWPORT).evaluate((el) => el.scrollTop)).toBe(0);
        expect((await box(page, '.haru-session-complete__close .haru-icon-button')).y).toBe(10);

        const bubble = page.locator('.haru-session-bubble--complete .haru-bubble');
        await page.locator(VIEWPORT).evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        });
        const end = await bubble.boundingBox();
        if (end === null) throw new Error('no bubble');
        expect(end.y + end.height).toBeLessThanOrEqual(viewport.height);
      });
    });
  }
});

test.describe('`D4-100` · C-3 스티커 입장', () => {
  test.use({ viewport: { width: 393, height: 852 }, reducedMotion: 'no-preference' });

  const STICKER = '.haru-attendance-sticker';
  const toast = (page: Page) => page.getByRole('status').filter({ hasText: 'Recording submitted' });
  /** 스티커 위에서 지금 재생 중인 애니메이션 수 + computed visibility · 슬롯 높이 · 메달리온 y (한 evaluate 로 잰다). */
  const stickerState = (page: Page) =>
    page.locator(STICKER).evaluate((chip) => {
      const slot = chip.parentElement;
      const medallion = document.querySelector('.haru-session-complete__medallion');
      if (slot === null || medallion === null) throw new Error('no slot');
      return {
        visibility: getComputedStyle(chip).visibility,
        animations: chip.getAnimations().length,
        slotHeight: slot.getBoundingClientRect().height,
        medallionTop: medallion.getBoundingClientRect().top,
        toastUp: document.querySelector('.haru-toast') !== null,
      };
    });

  test('Submit 경로: Toast 중 미시작 → 퇴장 후 재생 · 슬롯 64 · 좌표 불변', async ({ page }) => {
    // Toast 수명은 주입 clock 으로 흘린다 (`QA-4B-003` — `support/clock.ts`)
    await page.clock.install();
    await page.addInitScript(() => {
      // 첫 애니메이션 시작을 놓치지 않도록 페이지 안에서 기록한다.
      document.addEventListener(
        'animationstart',
        (event) => {
          if (!(event.target instanceof Element)) return;
          if (!event.target.classList.contains('haru-attendance-sticker')) return;
          document.documentElement.dataset['c3ToastUp'] = String(
            document.querySelector('.haru-toast') !== null,
          );
        },
        true,
      );
    });
    await submitSession(page);
    await expect(toast(page)).toBeVisible();
    const during = await stickerState(page);
    expect(during).toMatchObject({
      visibility: 'hidden',
      animations: 0,
      slotHeight: 64,
      toastUp: true,
    });

    await advanceUntilToastGone(page, toast(page));
    await expect(page.locator(STICKER)).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-c3-toast-up', 'false');
    // `D4-105`: C-3 delay 만 0 이다 — C-2 는 그대로 120ms.
    await expect(page.locator(STICKER)).toHaveCSS('animation-delay', '0s');
    await expect(page.locator('.haru-session-complete__bubble')).toHaveCSS(
      'animation-delay',
      '0.12s',
    );
    await page.locator(STICKER).evaluate(async (chip) => {
      await Promise.all(chip.getAnimations().map((animation) => animation.finished));
    });
    await expect(page.locator(STICKER)).toHaveCSS('opacity', '1');
    const after = await stickerState(page);
    expect(after.slotHeight).toBe(64);
    expect(after.medallionTop).toBe(during.medallionTop);
    expect(await box(page, STICKER)).toEqual({ x: 68, y: 100 - FIGMA_TOP, width: 257, height: 64 });
  });

  test('재진입: 연출 없이 즉시 표시', async ({ page }) => {
    await page.clock.install();
    const sessionId = await submitSession(page);
    await page.getByRole('button', { name: 'Close session' }).click();
    await expect(page).toHaveURL(/\/$/);
    await advanceUntilToastGone(page, toast(page));
    await spaGoto(page, `/session/${sessionId}/complete`);
    await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
    expect(await stickerState(page)).toMatchObject({ visibility: 'visible', animations: 0 });
    await expect(page.locator(STICKER)).toHaveCSS('opacity', '1');
  });
});

test.describe('prefers-reduced-motion', () => {
  test.use({ viewport: { width: 393, height: 852 }, reducedMotion: 'reduce' });

  test('`D4-106`: Submit 경로 — Toast 중 숨김 → 퇴장 후 연출 없이 표시 · 좌표 불변', async ({
    page,
  }) => {
    const chip = page.locator('.haru-attendance-sticker');
    const toast = page.getByRole('status').filter({ hasText: 'Recording submitted' });
    const state = () =>
      chip.evaluate((element) => ({
        visibility: getComputedStyle(element).visibility,
        animations: element.getAnimations().length,
        toastUp: document.querySelector('.haru-toast') !== null,
      }));

    await page.clock.install();
    await submitSession(page);
    await expect(toast).toBeVisible();
    expect(await state()).toEqual({ visibility: 'hidden', animations: 0, toastUp: true });
    const held = await box(page, '.haru-attendance-sticker');

    await advanceUntilToastGone(page, toast);
    await expect(chip).toBeVisible();
    expect(await state()).toEqual({ visibility: 'visible', animations: 0, toastUp: false });
    await expect(chip).toHaveCSS('opacity', '1');
    expect(await box(page, '.haru-attendance-sticker')).toEqual(held);
  });

  test('`D4-106`: 재진입은 Toast 를 기다리지 않고 즉시 표시', async ({ page }) => {
    const sessionId = await submitSession(page);
    await page.getByRole('button', { name: 'Close session' }).click();
    await expect(page).toHaveURL(/\/$/);
    await spaGoto(page, `/session/${sessionId}/complete`);
    await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
    await expect(page.locator('.haru-attendance-sticker')).toBeVisible();
  });

  test('축하 모션 0 — 최종 상태가 바로 보인다', async ({ page }) => {
    await submitSession(page);
    const animations = await page
      .locator('.haru-session-complete')
      .evaluate((root) => root.getAnimations({ subtree: true }).length);
    expect(animations).toBe(0);
    // 숨김은 Toast 퇴장까지다 (`D4-106`) — 그 동안에도 중간 상태는 없다.
    await expect(page.locator('.haru-attendance-sticker')).toHaveCSS('opacity', '1');
  });
});
