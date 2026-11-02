/**
 * Stage 4b `S4-G1` — Prompts 칩 → 중앙 팝업 (Figma `296:1257` in `296:1210`, 4b Spec §3.1 · §6 · §9).
 *
 * jsdom 이 계산하지 않는 것만 여기서 본다 — 팝업 기하(AC-4-132: n = 1·5·7 × 320/393, Record Control 침범 0) ·
 * computed 선언값(`R-FIGMA-1`) · 실제 포인터의 바깥 탭 · 키보드 순서 · 시각 baseline. 동작·요청 증거는
 * `apps/web/__tests__/session-prompts.test.tsx` 가 갖는다.
 *
 * 좌표 규칙: **Web y = Figma y − 56**. 팝업 top = ring bottom 322 + 6 = Figma 328 → **272**.
 * 시각 baseline 은 `296:1210`(paused · `03:24` · 팝업 n=5)과 같은 상태를 주입 시계로 고정해 찍는다.
 */
import { expect, test, type Page } from '@playwright/test';

import { FRAME_SNAPSHOT } from '../playwright.config';
import { hideDevPanel } from './support/gallery';
import { requestPayloads, startSession } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const TRANSITIONS = 'POST /v1/sessions/:sessionId/transitions';

/**
 * computed 색 문자열 — Figma 선언값과 대조하는 **기대값**이다 (`session-recording.spec.ts` 와 같은 방식).
 * glass-fill-strong white 90% · fg-primary `#4a5f5c` · fg-secondary `#7d9291` · spring-green `#dbeee7`.
 */
const cssColor = (fn: 'rgb' | 'rgba', channels: readonly number[]) =>
  `${fn}(${channels.join(', ')})`;
const SURFACE_STRONG = cssColor('rgba', [255, 255, 255, 0.9]);
const PRIMARY = cssColor('rgb', [74, 95, 92]);
const SECONDARY = cssColor('rgb', [125, 146, 145]);
const TINTED = cssColor('rgb', [219, 238, 231]);
const POPUP = '.haru-session-prompts';
const VIEWPORT = '[data-app-shell-viewport]';

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

async function boxes(page: Page, selector: string): Promise<Box[]> {
  return page.locator(selector).evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }),
  );
}

async function transitionTargets(page: Page): Promise<unknown[]> {
  const payloads = await requestPayloads(page, TRANSITIONS);
  return payloads.map((payload) => (payload as { to?: unknown }).to);
}

/** `D4-82` — AppShell 뷰포트를 끝까지 내리고 하단 바 위치를 돌려준다. */
async function scrollViewportToEnd(page: Page): Promise<Box> {
  await page.locator(VIEWPORT).evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  return box(page, '.haru-session-actions');
}

async function startRecording(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
}

function chip(page: Page) {
  return page.getByRole('button', { name: 'Prompts', exact: true });
}

function popup(page: Page) {
  return page.getByRole('region', { name: 'Try this prompt!' });
}

/** `session-recording.spec.ts` 와 같은 고정 시계 — 녹음 시작 전에 멈추고 `seconds` 를 한 번에 넘긴다. */
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
  await startRecording(page);
  await page.clock.fastForward(seconds * 1000);
  await page.clock.runFor(100);
}

test.describe('팝업 기하 — Figma `296:1257` (AC-4-132)', () => {
  test('393×852 · n=5: 329×293 @ y272 · 가운데 · pill 297×38 pitch 44 · See all y534 · Record 침범 0', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await chip(page).click();
    await expect(popup(page)).toBeVisible();

    const pop = await box(page, POPUP);
    expect({ y: pop.y, width: pop.width, height: pop.height }).toEqual({
      y: 272, // Figma 328
      width: 329,
      height: 293, // 73 + 44 × 5
    });
    expect(pop.x + pop.width / 2).toBeCloseTo(196.5, 0); // 가운데 (`AD-S4-12` — Figma x34)

    const pills = await boxes(page, `${POPUP} .haru-prompt-pill`);
    expect(pills.map((pill) => pill.y - pop.y)).toEqual([42, 86, 130, 174, 218]); // Figma 상대 y
    for (const pill of pills) expect({ w: pill.width, h: pill.height }).toEqual({ w: 297, h: 38 });
    expect(pills[0]?.x).toBe(pop.x + 16);

    const title = await box(page, `${POPUP} .haru-bubble__content > .haru-text`);
    expect({ y: title.y - pop.y, h: title.height }).toEqual({ y: 14, h: 22 });
    const seeAll = await box(page, `${POPUP} .haru-text-link`);
    expect({ y: seeAll.y - pop.y, h: seeAll.height }).toEqual({ y: 262, h: 17 }); // `300:1308`
    expect(seeAll.x + seeAll.width / 2).toBeCloseTo(pop.x + pop.width / 2, 0);

    const record = await box(page, '.haru-record');
    expect(pop.y + pop.height).toBeLessThanOrEqual(record.y); // 침범 0
  });

  test('393×796 (Figma 콘텐츠 높이) — 바닥 = Record Control top (예산 0, 침범 0)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 796 });
    await startSession(page);
    await startRecording(page);
    await chip(page).click();
    const pop = await box(page, POPUP);
    const record = await box(page, '.haru-record');
    expect(record.y).toBe(565); // Figma 621
    expect(pop.y + pop.height).toBe(565);
  });

  for (const [scenario, shown] of [
    ['session:prompts-1', 1],
    ['session:success', 5],
    ['session:prompts-7', 5],
  ] as const) {
    for (const width of [320, 393] as const) {
      test(`${scenario} · ${width}×852 → pill ${shown} · 높이 73 + 44n · 침범 0 · 내부 스크롤 0`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 852 });
        await startSession(page, scenario);
        await startRecording(page);
        await chip(page).click();
        await expect(popup(page)).toBeVisible();

        const pop = await box(page, POPUP);
        expect(pop.y).toBe(272);
        expect(pop.height).toBe(73 + 44 * shown);
        const column = width === 320 ? 272 : 329;
        expect(pop.width).toBe(column);
        const pills = await boxes(page, `${POPUP} .haru-prompt-pill`);
        expect(pills).toHaveLength(shown);
        for (const pill of pills) expect(pill.height).toBe(38); // 2줄이어도 38 (`D4-58` CP-2)
        const record = await box(page, '.haru-record');
        expect(pop.y + pop.height).toBeLessThanOrEqual(record.y);
        const scroll = await page
          .locator(POPUP)
          .evaluate((node) => ({ client: node.clientHeight, scroll: node.scrollHeight }));
        expect(scroll.scroll).toBe(scroll.client);
        await expect(page.getByRole('button', { name: 'See all prompts' })).toBeVisible();
      });
    }
  }
});

/**
 * 짧은 세로 압축 (`S4-K1`, AC-4-99 ② · `D4-58` CP-7 · 4b Spec §8.2). 측정 = `getBoundingClientRect`.
 *
 * | 높이 | 압축 | ring | 유연 간격 | 팝업(n=5) |
 * |---|---|---|---|---|
 * | ≥ 796 | 없음 | 190 | ≥ 110 | 293 · 스크롤 없음 |
 * | 702~795 | ① | 190 | 16~109 | 199~292 · 목록 스크롤 |
 * | 664~701 | ①② | 152 | 16~53 | 199~236 · 목록 스크롤 |
 * | 628~663 | 바 위로 (`AD-S4-21` · `D4-81`) | 152 | 16 | 199 |
 * | < 628 | ⛔ 사용자 결정 대기 — 바가 잘린다 | 152 | 16 | 199 |
 */
test.describe('짧은 세로 압축 (AC-4-99 ② · `S4-K1`)', () => {
  /** 팝업을 연 recording 화면의 주요 상자. */
  async function measure(page: Page) {
    await startRecording(page);
    await chip(page).click();
    await expect(popup(page)).toBeVisible();
    return {
      pop: await box(page, POPUP),
      list: await box(page, `${POPUP}__list`),
      seeAll: await box(page, `${POPUP}__see-all`),
      record: await box(page, '.haru-record'),
      bar: await box(page, '.haru-session-actions'),
      ring: await box(page, '.haru-session__medallion-ring'),
      status: await box(page, '.haru-session-status'),
      chip: await box(page, '.haru-session__top-row .haru-button'),
      close: await box(page, '.haru-session__top-row .haru-icon-button'),
    };
  }

  for (const [width, height, ring] of [
    [393, 795, 190],
    [393, 759, 190], // 393×852 standalone (safe-area 59 + 34)
    [393, 702, 190],
    [393, 701, 152],
    [393, 700, 152],
    [393, 667, 152],
    [393, 664, 152],
    [320, 700, 152],
    [320, 664, 152],
  ] as const) {
    test(`${width}×${height}: 팝업·Record 겹침 0 · 칩·닫기·바 뷰포트 안 · ring ${ring}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await startSession(page);
      const m = await measure(page);

      expect(m.ring.height).toBe(ring);
      expect(m.pop.y).toBe(76 + ring + 6);
      expect(m.pop.y + m.pop.height).toBeLessThanOrEqual(m.record.y);
      expect(m.status.y + m.status.height + 16).toBeLessThanOrEqual(m.record.y); // 유연 간격 ≥ 16
      expect(m.bar.y + m.bar.height + 18).toBeLessThanOrEqual(height); // 아래 18 까지 전부 보인다
      expect(m.chip.y).toBeGreaterThanOrEqual(0);
      expect(m.close.y).toBeGreaterThanOrEqual(0);
      // 제목·`See all` 은 줄지 않고 목록만 줄어든다 — 예산 안에서 pill 이 잘려도 `See all` 은 보인다
      expect(m.list.height).toBeLessThan(214);
      expect(m.seeAll.y + m.seeAll.height).toBeLessThanOrEqual(m.pop.y + m.pop.height);
      await expect(page.getByRole('button', { name: 'See all prompts' })).toBeInViewport();
    });
  }

  for (const height of [796, 852] as const) {
    test(`393×${height}: 압축 없음 — 목록 overflow visible · Tab 정지점 아님`, async ({ page }) => {
      await page.setViewportSize({ width: 393, height });
      await startSession(page);
      const m = await measure(page);
      expect(m.ring.height).toBe(190);
      expect(m.pop.height).toBe(293);
      const list = page.locator(`${POPUP}__list`);
      await expect(list).toHaveCSS('overflow-y', 'visible');
      await expect(list).not.toHaveAttribute('tabindex');
    });
  }

  test('393×700: 목록만 스크롤 · pill 38 유지 · 넘칠 때만 Tab 정지점 · 포커스 링 inset 4', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 700 });
    await startSession(page);
    await measure(page);
    const list = page.locator(`${POPUP}__list`);
    for (const pill of await boxes(page, `${POPUP} .haru-prompt-pill`)) {
      expect(pill.height).toBe(38);
    }

    const before = await box(page, `${POPUP}__see-all`);
    await list.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    const scrolled = await list.evaluate((node) => ({
      top: node.scrollTop,
      max: node.scrollHeight - node.clientHeight,
    }));
    expect(scrolled.max).toBeGreaterThan(0);
    expect(scrolled.top).toBe(scrolled.max);
    expect(await box(page, `${POPUP}__see-all`)).toEqual(before); // `See all` 은 움직이지 않는다

    await chip(page).focus();
    await page.keyboard.press('Tab');
    await expect(list).toBeFocused();
    await expect(list).toHaveCSS('outline-offset', '-4px');
    await expect(list).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'See all prompts' })).toBeFocused();
  });

  test('393×700 · n=1: 넘치지 않으면 목록은 Tab 정지점이 아니다', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 700 });
    await startSession(page, 'session:prompts-1');
    await measure(page);
    await expect(page.locator(`${POPUP}__list`)).not.toHaveAttribute('tabindex');
  });

  test('paused 도 같은 압축 — 393×667 상태 전이에도 레이아웃이 움직이지 않는다', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 667 });
    await startSession(page);
    const recording = await measure(page);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Pause recording' }).click();
    await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
    expect(await box(page, '.haru-record')).toEqual(recording.record);
    expect(await box(page, '.haru-session__medallion-ring')).toEqual(recording.ring);
    expect(await box(page, '.haru-session-actions')).toEqual(recording.bar);
  });

  /*
   * 내용 최소 664 → `D4-81` 로 바가 올라와 **628** 까지 화면 안이다 (`AD-S4-22`, 아래 묶음 표 — storytime-session.css).
   * 628 미만은 Record(bottom 583)와 겹치지 않고는 올릴 수 없어 세로 스크롤로 닿는다 (`D4-82`, 파일 아래 묶음).
   */
  test('320×568: 칩·팝업은 뷰포트 안 · Record 겹침 0', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await startSession(page);
    const m = await measure(page);
    expect(m.chip.y).toBeGreaterThanOrEqual(0);
    expect(m.close.y).toBeGreaterThanOrEqual(0);
    expect(m.pop.y + m.pop.height).toBeLessThanOrEqual(m.record.y);
    expect(m.pop.y + m.pop.height).toBeLessThanOrEqual(568);
  });

  test('320×568: 하단 바는 스크롤하면 뷰포트 안 (`D4-82`)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await startSession(page);
    expect((await box(page, '.haru-session-actions')).y).toBe(583); // 첫 화면 — 628 기하 그대로
    const bar = await scrollViewportToEnd(page);
    expect(bar.y + bar.height).toBe(568);
  });

  test('393×600: 628 미만에서도 바는 Record 를 덮지 않는다 (아래는 스크롤로 닿는다)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 600 });
    await startSession(page);
    const m = await measure(page);
    expect(m.bar.y).toBe(m.record.y + m.record.height);
  });
});

/* `D4-81` — 646 미만은 바를 위로 올려 탭할 수 있게 한다. Record 433 고정 → 아래 여백 먼저, 그다음 Record ↔ 바 간격. */
test.describe('`D4-81` 하단 바 — 646 미만 (`AD-S4-22`)', () => {
  const BAR = '.haru-session-actions';
  const RECORD = '.haru-record';

  async function expectBarReachable(page: Page, height: number): Promise<void> {
    const bar = await box(page, BAR);
    const record = await box(page, RECORD);
    expect(bar.y + bar.height).toBeLessThanOrEqual(height);
    expect(bar.y).toBeGreaterThanOrEqual(record.y + record.height); // Record 겹침 0
    expect(record.y).toBe(433);
    expect(
      await page.evaluate(() => document.querySelector('[data-app-shell-viewport]')?.scrollTop),
    ).toBe(0);
  }

  for (const [width, height, gap] of [
    [393, 645, 17],
    [393, 628, 0],
    [320, 640, 12],
    [320, 628, 0],
  ] as const) {
    test(`${String(width)}×${String(height)}: ready · recording · 팝업 · paused 전부 화면 안 · 간격 ${String(gap)}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await startSession(page);
      await expectBarReachable(page, height); // ready

      await startRecording(page);
      await expectBarReachable(page, height);
      const bar = await box(page, BAR);
      expect(bar.y - (await box(page, RECORD)).y - 150).toBe(gap);

      await chip(page).click();
      await expect(popup(page)).toBeVisible();
      await expectBarReachable(page, height);

      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Pause recording' }).click();
      await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
      await expectBarReachable(page, height);
    });
  }

  test('320×628: 팝업이 열린 채 Discard 를 실제로 탭할 수 있다', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 628 });
    await startSession(page);
    await startRecording(page);
    await chip(page).click();
    await expect(popup(page)).toBeVisible();
    await page.getByRole('button', { name: 'Discard' }).click();
    await expect(popup(page)).toBeHidden();
    await expect(page.getByRole('alertdialog').or(page.getByRole('dialog'))).toBeVisible();
  });

  test('393×660: 바 전부 보임 · 아래 여백 14 · Record ↔ 바 18 그대로 (`AD-S4-21`)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 660 });
    await startSession(page);
    const bar = await box(page, BAR);
    const record = await box(page, RECORD);
    expect(bar.y - record.y - 150).toBe(18);
    expect(660 - bar.y - bar.height).toBe(14);
  });
});

/*
 * `D4-82` — 콘텐츠 높이 627 이하는 AppShell 뷰포트 세로 스크롤로 Record · Discard · Submit 에 닿는다 (`AD-S4-23`).
 * 628 이상은 넘치는 내용이 없어야 한다 — 스크롤이 생기면 `D4-81` 의 기하가 조용히 어긋난다.
 */
test.describe('`D4-82` 세션 세로 스크롤 — 627 이하', () => {
  const RECORD = '.haru-record';
  const BAR = '.haru-session-actions';

  async function scrollState(page: Page) {
    return page.locator(VIEWPORT).evaluate((node) => ({
      top: node.scrollTop,
      max: node.scrollHeight - node.clientHeight,
      overflowX: node.scrollWidth - node.clientWidth,
    }));
  }

  async function scrollToTop(page: Page): Promise<void> {
    await page.locator(VIEWPORT).evaluate((node) => {
      node.scrollTop = 0;
    });
  }

  for (const [width, height] of [
    [393, 852],
    [393, 796],
    [393, 700],
    [393, 628],
    [320, 628],
  ] as const) {
    test(`${String(width)}×${String(height)}: 스크롤이 생기지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await startSession(page);
      expect(await scrollState(page)).toEqual({ top: 0, max: 0, overflowX: 0 });
      await startRecording(page);
      expect(await scrollState(page)).toEqual({ top: 0, max: 0, overflowX: 0 });
    });
  }

  for (const [width, height] of [
    [393, 627],
    [320, 568],
    [375, 548],
    [393, 460],
  ] as const) {
    test(`${String(width)}×${String(height)}: 628 기하 · 가로 넘침 0 · 끝에서 바 전부 보임 · 녹음 유지`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await startSession(page);

      // ready 첫 화면 — 628 과 같은 기하
      expect((await box(page, RECORD)).y).toBe(433);
      expect((await box(page, BAR)).y).toBe(583);
      expect(await scrollState(page)).toEqual({ top: 0, max: 628 - height, overflowX: 0 });

      await startRecording(page); // 460 은 Record 가 첫 화면 밖 — 스크롤로 닿아야 눌린다
      const bar = await scrollViewportToEnd(page);
      expect(bar.y + bar.height).toBe(height);
      expect(bar.y).toBe(height - 45);
      expect((await box(page, RECORD)).y + 150).toBe(bar.y); // 간격 0 · 겹침 0
      expect((await scrollState(page)).overflowX).toBe(0);
      await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();

      await page.getByRole('button', { name: 'Discard' }).click();
      await expect(page.getByRole('alertdialog').or(page.getByRole('dialog'))).toBeVisible();
    });
  }

  test('320×568: 키보드 이동이 대상을 뷰포트 안으로 데려온다 · 링 자리 포함', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await startSession(page);
    await startRecording(page);
    await scrollToTop(page);

    await page.getByRole('button', { name: 'Close session' }).focus();
    await page.keyboard.press('Tab');
    const pause = page.getByRole('button', { name: 'Pause recording' });
    await expect(pause).toBeFocused();
    await expect.poll(async () => (await box(page, RECORD)).y + 150).toBe(564); // 568 − 링 4

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Discard' })).toBeFocused();
    await expect.poll(async () => (await scrollState(page)).top).toBe(60);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Submit' })).toBeFocused();
    expect((await box(page, BAR)).y + 45).toBe(568);

    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Close session' })).toBeFocused();
    await expect
      .poll(async () => (await box(page, '.haru-session__top-row')).y)
      .toBeGreaterThanOrEqual(0);
  });

  test('320×568: 팝업은 화면과 함께 움직이고 바는 탭할 수 있다', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await startSession(page);
    await startRecording(page);
    await scrollToTop(page);
    await chip(page).click();
    await expect(popup(page)).toBeVisible();
    const before = await box(page, POPUP);
    const record = await box(page, RECORD);

    await scrollViewportToEnd(page);
    expect((await box(page, POPUP)).y).toBe(before.y - 60);
    expect((await box(page, RECORD)).y).toBe(record.y - 60);

    await page.getByRole('button', { name: 'Discard' }).click();
    await expect(popup(page)).toBeHidden();
    await expect(page.getByRole('alertdialog').or(page.getByRole('dialog'))).toBeVisible();
  });

  test('safe-area 주입 20/34 · 320×568: 스크롤 범위에 inset 이 들어가 바가 inset 위에 멈춘다', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await startSession(page);
    await page.addStyleTag({
      content:
        ':root { --layout-safe-top: 20px !important; --layout-safe-bottom: 34px !important; }',
    });
    const bar = await scrollViewportToEnd(page);
    expect(bar.y + bar.height).toBe(568 - 34);
    expect((await scrollState(page)).max).toBe(628 + 20 + 34 - 568);
  });

  test('`@container` 미지원 근사 · 320×568: 압축이 꺼져도 바에 닿는다 (`D4-83` 대체 규칙 없음)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await startSession(page);
    await page.addStyleTag({ content: '.haru-session { container: none !important; }' });
    const bar = await scrollViewportToEnd(page);
    expect(bar.y + bar.height).toBeLessThanOrEqual(568);
  });

  test.describe('터치 — pill 목록과 이중 스크롤', () => {
    test.use({ hasTouch: true, isMobile: true });

    /** 목록 위에서 시작한 touch 제스처 두 번: 첫 번째는 목록을 끝까지, 두 번째는 화면을 끝까지. */
    async function expectChains(page: Page, selector: string, max: number): Promise<void> {
      const client = await page.context().newCDPSession(page);
      const list = await box(page, selector);
      const gesture = async () => {
        await client.send('Input.synthesizeScrollGesture', {
          x: list.x + list.width / 2,
          y: list.y + 40,
          yDistance: -400,
          gestureSourceType: 'touch',
          speed: 1200,
          preventFling: true,
        });
      };
      await gesture();
      await expect
        .poll(() =>
          page
            .locator(selector)
            .evaluate((node) => node.scrollHeight - node.clientHeight - node.scrollTop),
        )
        .toBeLessThanOrEqual(1);
      expect((await scrollState(page)).top).toBe(0); // 첫 제스처는 목록이 소비한다
      await gesture();
      await expect.poll(async () => (await scrollState(page)).top).toBe(max);
    }

    for (const [width, height] of [
      [320, 568],
      [393, 460],
    ] as const) {
      test(`${String(width)}×${String(height)}: ready 목록 끝에서 화면 스크롤로 이어진다`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height });
        await startSession(page);
        await expectChains(page, '.haru-session-bubble__prompts', 628 - height);
      });

      test(`${String(width)}×${String(height)}: 팝업 목록 끝에서 화면 스크롤로 이어진다`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height });
        await startSession(page);
        await startRecording(page);
        await scrollToTop(page);
        await chip(page).click();
        await expect(popup(page)).toBeVisible();
        await expectChains(page, `${POPUP}__list`, 628 - height);
      });
    }
  });
});

/* `D4-78` — ready 버블 pill 목록 내부 스크롤 (`CP-7` ③ 확장, `AD-S4-18`). 660~760 에서 Record · 바가 전부 보인다. */
test.describe('`D4-78` ready pill 목록 내부 스크롤', () => {
  const LIST = '.haru-session-bubble__prompts';

  for (const width of [393, 320] as const) {
    for (const height of [760, 720, 702, 700, 680, 664, 660] as const) {
      test(`${String(width)}×${String(height)}: Record · 바 전부 화면 안 · 버블 아래 14.4 · Submit 도달`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height });
        await startSession(page);
        const bubble = await box(page, '.haru-session-bubble .haru-bubble');
        const record = await box(page, '.haru-record');
        const bar = await box(page, '.haru-session-actions');
        expect(record.y + record.height).toBeLessThanOrEqual(height);
        expect(bar.y + bar.height).toBeLessThanOrEqual(height);
        expect(record.y - bubble.y - bubble.height).toBeCloseTo(14.4, 1);
        await expect(page.getByRole('button', { name: 'Submit' })).toBeInViewport({ ratio: 1 });
        const list = await box(page, LIST);
        expect(list.height).toBeGreaterThanOrEqual(38);
      });
    }
  }

  test('393×700: 목록만 스크롤 · 마지막 pill 까지 닿는다 · 넘칠 때만 Tab 정지점 · 포커스 링 inset 4', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 700 });
    await startSession(page);
    const list = page.locator(LIST);
    await expect(list).toHaveCSS('overflow-y', 'auto');
    const title = await box(page, '.haru-session-bubble .haru-bubble__content > .haru-text');
    await list.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    const last = await box(page, `${LIST} li:last-child`);
    const frame = await box(page, LIST);
    expect(last.y + last.height).toBeLessThanOrEqual(frame.y + frame.height + 0.5);
    expect(await box(page, '.haru-session-bubble .haru-bubble__content > .haru-text')).toEqual(
      title,
    );

    await list.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(list).toBeFocused();
    await expect(list).toHaveCSS('outline-offset', '-4px');
    await expect(list).toHaveCSS('outline-style', 'solid');
  });

  for (const height of [796, 852] as const) {
    test(`393×${String(height)}: 압축 없음 — overflow visible · Tab 정지점 아님 · 버블 내용 높이`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 393, height });
      await startSession(page);
      const list = page.locator(LIST);
      await expect(list).toHaveCSS('overflow-y', 'visible');
      await expect(list).not.toHaveAttribute('tabindex');
      expect((await box(page, '.haru-session-bubble .haru-bubble')).height).toBe(277);
    });
  }
});

/*
 * `D4-79` — 압축 판단은 뷰포트가 아니라 **safe-area 를 뺀 콘텐츠 높이**다. Chromium `env()` 가 0 이라 토큰을 주입한다
 * (실기기 측정 아님 — handoff). 852 − 59 − 34 = 759 → `@media (height)` 였다면 압축이 꺼져 팝업이 Record 를 37 덮는다.
 */
test.describe('`D4-79` 컨테이너 쿼리 — safe-area 59/34', () => {
  test('393×852: 컨테이너 759 · 100cqb = 759 · 압축 켜짐 · 팝업이 Record 를 덮지 않음 · ready 바 safe 영역 안', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await startSession(page);
    await page.addStyleTag({
      content: ':root { --layout-safe-top: 59px; --layout-safe-bottom: 34px; }',
    });
    await expect(page.locator('.haru-session-bubble__prompts')).toHaveCSS('overflow-y', 'auto');

    const container = await page.locator('.haru-session').evaluate((node) => {
      const probe = document.createElement('div');
      probe.style.blockSize = '100cqb';
      probe.style.position = 'absolute';
      node.querySelector('.haru-session__controls')?.append(probe);
      const measured = probe.getBoundingClientRect().height;
      probe.remove();
      const style = getComputedStyle(node);
      return {
        height: node.getBoundingClientRect().height,
        cqb: measured,
        type: style.containerType,
        name: style.containerName,
      };
    });
    expect(container).toEqual({ height: 759, cqb: 759, type: 'size', name: 'haru-session' });

    const bar = await box(page, '.haru-session-actions');
    expect(bar.y + bar.height).toBeLessThanOrEqual(852 - 34);

    await startRecording(page);
    await chip(page).click();
    await expect(popup(page)).toBeVisible();
    const pop = await box(page, POPUP);
    const record = await box(page, '.haru-record');
    expect(pop.y + pop.height).toBeLessThanOrEqual(record.y);
    await expect(page.locator(`${POPUP}__list`)).toHaveCSS('overflow-y', 'auto');
  });
});

test.describe('팝업 선언값 (`R-FIGMA-1` — computed)', () => {
  test('면 white 90% · radius 22 · --shadow-bubble · 제목 16/22 Semibold · pill 면/테두리 · See all 14/17 secondary 밑줄', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await chip(page).click();
    const styles = await page.evaluate((selector) => {
      const pick = (sel: string, keys: readonly string[]) => {
        const node = document.querySelector(sel);
        if (node === null) return null;
        const style = getComputedStyle(node);
        return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key)]));
      };
      return {
        bubble: pick(`${selector} .haru-bubble`, [
          'background-color',
          'border-radius',
          'box-shadow',
          'padding-top',
          'padding-bottom',
          'padding-left',
          'overflow',
        ]),
        title: pick(`${selector} .haru-bubble__content > .haru-text`, [
          'font-size',
          'line-height',
          'font-weight',
          'color',
          'text-align',
        ]),
        pill: pick(`${selector} .haru-prompt-pill`, ['background-color', 'box-shadow']),
        seeAll: pick(`${selector} .haru-text-link`, [
          'font-size',
          'line-height',
          'font-weight',
          'color',
          'text-decoration-line',
        ]),
        z: pick(selector, ['z-index']),
        // `--shadow-bubble` 토큰이 그리는 값 — 같은 문서에서 probe 로 해석한다 (색 표기는 브라우저 정규화)
        shadowToken: (() => {
          const probe = document.createElement('div');
          probe.style.boxShadow = 'var(--shadow-bubble)';
          document.body.append(probe);
          const value = getComputedStyle(probe).boxShadow;
          probe.remove();
          return value;
        })(),
      };
    }, POPUP);
    expect(styles.bubble).toEqual({
      'background-color': SURFACE_STRONG,
      'border-radius': '22px',
      'box-shadow': styles.shadowToken, // drop `0 6 4` 1겹 + inset 2겹 (`V-10`)
      'padding-top': '14px',
      'padding-bottom': '14px',
      'padding-left': '16px',
      overflow: 'visible', // `R-SHADOW-1` — 선언하지 않는다
    });
    expect(styles.shadowToken).toMatch(/0px 6px 4px 0px, .*inset, .*inset$/);
    expect(styles.title).toMatchObject({
      'font-size': '16px',
      'line-height': '22px',
      color: PRIMARY,
      'text-align': 'center',
    });
    expect(Number(styles.title?.['font-weight'])).toBeGreaterThanOrEqual(590);
    expect(styles.pill?.['background-color']).toBe(TINTED); // #dbeee7
    expect(styles.seeAll).toMatchObject({
      'font-size': '14px',
      'line-height': '17px',
      color: SECONDARY, // #7d9291
      'text-decoration-line': 'underline',
    });
    expect(Number(styles.seeAll?.['font-weight'])).toBeGreaterThanOrEqual(590);
    expect(styles.z?.['z-index']).toBe('10');
  });

  test('`See all` 터치 44 — 레이아웃 높이 17 그대로, 위·아래 ±20 지점도 같은 버튼', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await chip(page).click();
    const link = await box(page, `${POPUP} .haru-text-link`);
    const cx = link.x + link.width / 2;
    const cy = link.y + link.height / 2;
    const hits = await page.evaluate(
      ({ x, ys }) =>
        ys.map((y) => document.elementFromPoint(x, y)?.closest('.haru-text-link') !== null),
      { x: cx, ys: [cy - 20, cy, cy + 20] },
    );
    expect(hits).toEqual([true, true, true]);
  });
});

test.describe('비모달 동작 — 실제 포인터 · 키보드 (AC-4-135 · 130)', () => {
  test('바깥 탭(Pause) → 팝업 닫힘 + 일시정지 1건 · 팝업 안 탭은 무시', async ({ page }) => {
    await startSession(page);
    await startRecording(page);
    await chip(page).click();
    await popup(page).locator('.haru-prompt-pill').first().click();
    await expect(popup(page)).toBeVisible();
    await expect(chip(page)).toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('button', { name: 'Pause recording' }).click();
    await expect(popup(page)).toBeHidden();
    await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
    expect(await transitionTargets(page)).toEqual(['recording', 'paused']);
  });

  test('키보드: 칩 Enter → 열림 · 포커스 칩 유지 · Tab → See all → 닫기 · Escape → 닫힘 + 포커스 칩', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await chip(page).focus();
    await page.keyboard.press('Enter');
    await expect(popup(page)).toBeVisible();
    await expect(chip(page)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'See all prompts' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Close session' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(popup(page)).toBeHidden();
    await expect(chip(page)).toBeFocused();
    await expect(chip(page)).toHaveAttribute('aria-expanded', 'false');
    expect(await transitionTargets(page)).toEqual(['recording']);
  });

  test('칩 재탭 → 닫힘 · 녹음 계속(시간 증가)', async ({ page }) => {
    await page.clock.install();
    await startSession(page);
    await startRecording(page);
    await chip(page).click();
    const before = await page.getByRole('timer').textContent();
    await page.clock.runFor(3_000);
    await expect(page.getByRole('timer')).not.toHaveText(before ?? '');
    await chip(page).click();
    await expect(popup(page)).toBeHidden();
    expect(await transitionTargets(page)).toEqual(['recording']);
  });
});

test.describe('팝업 시각 baseline — Figma `296:1210`', () => {
  test('s4-session-prompts — 393×852 · paused `03:24` · 팝업 n=5', async ({ page }) => {
    await page.clock.install();
    await startSession(page);
    await recordFrozen(page, 204);
    await page.getByRole('button', { name: 'Pause recording' }).click();
    await page.clock.runFor(100);
    await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
    // 키보드로 연다 — 포인터 hover 잔상 없이 (Figma 프레임은 포커스·hover 없음)
    await chip(page).focus();
    await page.keyboard.press('Enter');
    await chip(page).evaluate((node) => {
      (node as HTMLElement).blur();
    });
    await page.clock.runFor(500); // 열기 전환(reduce = 즉시) 정착
    await expect(popup(page)).toBeVisible();
    await expect(page.getByRole('timer')).toHaveText('03:24');
    await expect(page).toHaveScreenshot('s4-session-prompts.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });
});

/* ===== Stage 4b `S4-G2` — `See all prompts` → Prompt Drawer `88:960` ================================
 * 동작·요청 증거는 단위 테스트(`session-prompts.test.tsx` `S4-G2` 묶음). 여기는 jsdom 이 계산하지 않는 것:
 * 기하(폭 = 컬럼 100% `AD-S4-7`) · computed 선언값(`R-FIGMA-1`) · 실제 키보드 포커스 · 새 `overflow`
 * 의 세로·가로 경계(`R-SHADOW-1` ⑥) · 시각 baseline.
 */
const SURFACE_DRAWER = cssColor('rgba', [255, 255, 255, 0.85]);
const ARROW = cssColor('rgb', [176, 207, 192]); // #b0cfc0 (palette mint)
const ARROW_DISABLED = cssColor('rgb', [242, 242, 247]); // #f2f2f7
const INK_600 = cssColor('rgb', [94, 115, 112]); // #5e7370
const DRAWER = '.haru-sheet--floating';

function drawer(page: Page) {
  return page.getByRole('dialog', { name: 'Prompts of this session' });
}

async function openDrawer(page: Page): Promise<void> {
  await chip(page).click();
  await expect(popup(page)).toBeVisible();
  await page.getByRole('button', { name: 'See all prompts' }).click();
  await expect(drawer(page)).toBeVisible();
  await expect(popup(page)).toBeHidden();
}

test.describe('Prompt Drawer `88:960` — 기하 (`AD-S4-7`)', () => {
  for (const [width, expected] of [
    [393, 345],
    [320, 272],
    [1024, 432],
  ] as const) {
    test(`${String(width)}×852 → 폭 ${String(expected)} · 가운데 · 아래 gutter 24 · 화면 안`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 852 });
      await startSession(page);
      await startRecording(page);
      await openDrawer(page);
      const sheet = await box(page, DRAWER);
      expect(sheet.width).toBe(expected);
      expect(sheet.x + sheet.width / 2).toBeCloseTo(width / 2, 0);
      expect(sheet.y + sheet.height).toBeCloseTo(852 - 24, 0);
      expect(sheet.y).toBeGreaterThan(0);
      const bar = await box(page, `${DRAWER} .haru-prompt-carousel__bar`);
      expect(bar.height).toBe(40);
      // pill 폭 = 노트 폭 = 본문 100% (`D4-71`) — ≥480 에서 310 cap 빈칸이 돌아오면 여기서 깨진다
      const note = await box(
        page,
        `${DRAWER} .haru-prompt-carousel__track--detail .haru-prompt-carousel__slide:not([aria-hidden]) .haru-prompt-drawer__note`,
      );
      expect(bar.width).toBe(expected - 40);
      expect(bar.width).toBe(note.width);
    });
  }

  test('393×852 · n=5 상세: 핸들 40×4 @+12 · 제목 @+28 · 부제 @+60 · pill @+90 · 노트 ≥158 · dots 72 가운데', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await openDrawer(page);
    const sheet = await box(page, DRAWER);
    const rel = async (selector: string) => {
      const b = await box(page, `${DRAWER} ${selector}`);
      return { ...b, x: b.x - sheet.x, y: b.y - sheet.y };
    };
    const grabber = await rel('.haru-sheet__grabber');
    expect(grabber).toMatchObject({ y: 12, width: 40, height: 4 });
    expect(grabber.x + 20).toBeCloseTo(sheet.width / 2, 0);
    const title = await rel('.haru-sheet__header .haru-text');
    expect(title).toMatchObject({ x: 20, y: 28, height: 22 });
    const subtitle = await rel('.haru-prompt-drawer > .haru-text');
    expect(subtitle).toMatchObject({ x: 20, y: 60, height: 18 });
    const bar = await rel('.haru-prompt-carousel__bar');
    expect(bar).toMatchObject({ x: 20, y: 90, height: 40 });
    const arrows = await boxes(page, `${DRAWER} .haru-prompt-carousel__arrow`);
    for (const arrow of arrows) expect(arrow).toMatchObject({ width: 24, height: 24 });
    expect((arrows[0]?.x ?? 0) - sheet.x).toBe(32); // pill x 20 + px 12
    const note = await rel(
      '.haru-prompt-carousel__track--detail .haru-prompt-carousel__slide:not([aria-hidden]) .haru-prompt-drawer__note',
    );
    expect(note.y).toBe(143); // pill 90 + 40 + 아래 3 + gap 10
    expect(note.height).toBeGreaterThanOrEqual(158);
    expect(note.width).toBe(sheet.width - 40);
    const dots = await rel('.haru-page-indicator__dots');
    expect(dots.width).toBe(72); // 20 + 4×7 + 4×6
    expect(dots.x + dots.width / 2).toBeCloseTo(sheet.width / 2, 0);
    expect(dots.y).toBe(note.y + note.height + 10);
    expect(sheet.height).toBe(dots.y + 7 + 11); // 렌더 기준 dots 아래 11 (`D4-70`)
    expect(sheet.height).toBe(329);
  });
});

test.describe('Prompt Drawer `88:960` — 선언값 (`R-FIGMA-1` — computed)', () => {
  test('면 white 85% + blur 12 · --shadow-glass-rest · radius 28 · padding 10/20/11 · 제목 Bold 17/22 · 부제 13/18 · pill · 화살표 색 · 노트', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await openDrawer(page);
    const styles = await page.evaluate((selector) => {
      const pick = (sel: string, keys: readonly string[]) => {
        const node = document.querySelector(sel);
        if (node === null) return null;
        const style = getComputedStyle(node);
        return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key)]));
      };
      return {
        sheet: pick(selector, [
          'background-color',
          'backdrop-filter',
          'box-shadow',
          'border-top-left-radius',
          'border-bottom-right-radius',
          'padding-top',
          'padding-left',
          'padding-bottom',
          'row-gap',
        ]),
        title: pick(`${selector} .haru-sheet__header .haru-text`, [
          'font-size',
          'line-height',
          'font-weight',
          'color',
        ]),
        subtitle: pick(`${selector} .haru-prompt-drawer > .haru-text`, [
          'font-size',
          'line-height',
          'color',
        ]),
        bar: pick(`${selector} .haru-prompt-carousel__bar`, [
          'background-color',
          'box-shadow',
          'border-top-left-radius',
        ]),
        pillText: pick(`${selector} .haru-prompt-carousel__bar .haru-prompt-pill > .haru-text`, [
          'font-size',
          'line-height',
          'font-weight',
          'color',
        ]),
        previous: pick(`${selector} .haru-prompt-carousel__arrow:first-child`, ['color']),
        next: pick(`${selector} .haru-prompt-carousel__arrow:last-child`, ['color']),
        note: pick(`${selector} .haru-prompt-drawer__note`, [
          'background-color',
          'box-shadow',
          'border-top-left-radius',
          'padding-top',
          'padding-left',
          'padding-bottom',
        ]),
        noteText: pick(`${selector} .haru-prompt-drawer__note .haru-text`, [
          'font-size',
          'line-height',
          'font-weight',
          'color',
        ]),
        shadowToken: (() => {
          const probe = document.createElement('div');
          probe.style.boxShadow = 'var(--shadow-glass-rest)';
          document.body.append(probe);
          const value = getComputedStyle(probe).boxShadow;
          probe.remove();
          return value;
        })(),
      };
    }, DRAWER);
    expect(styles.sheet).toEqual({
      'background-color': SURFACE_DRAWER,
      'backdrop-filter': 'blur(12px)',
      'box-shadow': styles.shadowToken, // drop 3겹 + inset 2겹 (`88:960` 이 전부 렌더)
      'border-top-left-radius': '28px',
      'border-bottom-right-radius': '28px',
      'padding-top': '10px',
      'padding-left': '20px',
      'padding-bottom': '11px',
      'row-gap': '10px',
    });
    expect(styles.shadowToken.match(/inset/g)).toHaveLength(2);
    expect(styles.title).toEqual({
      'font-size': '17px',
      'line-height': '22px',
      'font-weight': '700',
      color: PRIMARY,
    });
    expect(styles.subtitle).toEqual({
      'font-size': '13px',
      'line-height': '18px',
      color: SECONDARY,
    });
    expect(styles.bar?.['background-color']).toBe(TINTED);
    expect(styles.bar?.['box-shadow']).toContain('inset');
    expect(styles.bar?.['border-top-left-radius']).not.toBe('0px');
    expect(styles.pillText).toMatchObject({
      'font-size': '12px',
      'line-height': '12px',
      color: INK_600,
    });
    expect(Number(styles.pillText?.['font-weight'])).toBeGreaterThanOrEqual(590);
    expect(styles.previous?.['color']).toBe(ARROW_DISABLED); // 1번째 페이지
    expect(styles.next?.['color']).toBe(ARROW);
    expect(styles.note).toMatchObject({
      'background-color': cssColor('rgba', [0, 0, 0, 0]), // 면 없음 (투명)
      'border-top-left-radius': '16px',
      'padding-top': '12px',
      'padding-left': '15px',
      'padding-bottom': '13px',
    });
    expect(styles.note?.['box-shadow']).toContain('inset');
    expect(styles.noteText).toMatchObject({
      'font-size': '12px',
      'line-height': '15.6px',
      color: INK_600,
    });
  });

  test('`R-SHADOW-1` ⑥ — 캐러셀 viewport 는 가로만 자른다(clip) · 세로 visible · 보이는 페이지가 세로로 잘리지 않는다', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await openDrawer(page);
    const result = await page.evaluate((selector) => {
      return [...document.querySelectorAll(`${selector} .haru-prompt-carousel__viewport`)].map(
        (viewport) => {
          const style = getComputedStyle(viewport);
          const v = viewport.getBoundingClientRect();
          const slide = viewport.querySelector('.haru-prompt-carousel__slide:not([aria-hidden])');
          const s = slide?.getBoundingClientRect();
          return {
            x: style.overflowX,
            y: style.overflowY,
            vertical: s === undefined ? false : s.top >= v.top && s.bottom <= v.bottom,
            horizontal:
              s === undefined ? false : s.left >= v.left - 0.5 && s.right <= v.right + 0.5,
          };
        },
      );
    }, DRAWER);
    expect(result).toEqual([
      { x: 'clip', y: 'visible', vertical: true, horizontal: true },
      { x: 'clip', y: 'visible', vertical: true, horizontal: true },
    ]);
  });
});

test.describe('Prompt Drawer `88:960` — 키보드 · 포인터 (AC-4-56 · 137)', () => {
  test('키보드: See all Enter → Drawer · 초기 포커스 캐러셀 · → 이동 · Tab 트랩 · Escape → 포커스 칩 · 녹음 계속', async ({
    page,
  }) => {
    await startSession(page, 'session:prompts-7');
    await startRecording(page);
    await chip(page).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'See all prompts' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(drawer(page)).toBeVisible();
    await expect(drawer(page).getByRole('group', { name: 'Prompts' })).toBeFocused();
    await expect(drawer(page).getByText('Prompt 1 of 7')).toBeAttached();
    await page.keyboard.press('ArrowRight');
    await expect(drawer(page).getByText('Prompt 2 of 7')).toBeAttached();
    await page.keyboard.press('Tab');
    await expect(drawer(page).getByRole('button', { name: 'Previous prompt' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(drawer(page).getByRole('button', { name: 'Next prompt' })).toBeFocused();
    await page.keyboard.press('Tab'); // 트랩 — 시트 밖으로 나가지 않는다
    await expect(drawer(page).getByRole('button', { name: 'Previous prompt' })).toBeFocused();
    const before = await page.getByRole('timer').textContent();
    await page.waitForTimeout(1_200);
    expect(await page.getByRole('timer').textContent()).not.toBe(before); // 열린 동안 녹음 계속
    await page.keyboard.press('Escape');
    await expect(drawer(page)).toBeHidden();
    await expect(chip(page)).toBeFocused();
    expect(await transitionTargets(page)).toEqual(['recording']);
  });

  test('포인터: 화살표 hit 44 · 스와이프 → 다음 페이지 · scrim 탭 → 닫힘 + 포커스 칩', async ({
    page,
  }) => {
    await startSession(page, 'session:prompts-7');
    await startRecording(page);
    await openDrawer(page);
    const next = drawer(page).getByRole('button', { name: 'Next prompt' });
    const nb = await next.boundingBox();
    if (nb === null) throw new Error('no next box');
    // 24 박스 중심에서 ±20 (hit 44 의 가장자리 안쪽) 도 같은 버튼이다
    const hits = await page.evaluate(
      ({ cx, cy }) =>
        [
          [cx, cy - 20],
          [cx, cy + 20],
          [cx + 20, cy],
        ].map(
          ([x, y]) =>
            document
              .elementFromPoint(x ?? 0, y ?? 0)
              ?.closest('button')
              ?.getAttribute('aria-label') ?? null,
        ),
      { cx: nb.x + nb.width / 2, cy: nb.y + nb.height / 2 },
    );
    expect(hits).toEqual(['Next prompt', 'Next prompt', 'Next prompt']);
    await next.click();
    await expect(drawer(page).getByText('Prompt 2 of 7')).toBeAttached();
    // 트랙은 translate 로 움직이므로 고정된 viewport 를 잰다
    const note = await box(
      page,
      `${DRAWER} .haru-prompt-carousel__viewport:has(.haru-prompt-carousel__track--detail)`,
    );
    await page.mouse.move(note.x + note.width - 30, note.y + 60);
    await page.mouse.down();
    await page.mouse.move(note.x + 30, note.y + 64, { steps: 4 });
    await page.mouse.up();
    await expect(drawer(page).getByText('Prompt 3 of 7')).toBeAttached();
    await page.mouse.click(10, 10); // scrim
    await expect(drawer(page)).toBeHidden();
    await expect(chip(page)).toBeFocused();
    expect(await transitionTargets(page)).toEqual(['recording']);
  });
});

test.describe('Prompt Drawer 시각 baseline — Figma `88:960`', () => {
  test('s4-prompt-drawer — 393×852 · recording · Drawer 1번째 페이지 (n=5)', async ({ page }) => {
    await page.clock.install();
    await startSession(page);
    await recordFrozen(page, 204);
    await openDrawer(page);
    await page.clock.runFor(500); // 시트 열기 전환(reduce = fade) 정착
    await drawer(page)
      .getByRole('group', { name: 'Prompts' })
      .evaluate((node) => {
        (node as HTMLElement).blur(); // Figma 프레임에는 포커스가 없다
      });
    // 열기 전환(CSS keyframe — 주입 시계 밖)이 끝날 때까지 — 과도기 프레임 금지 (`R-BASELINE-1` ①)
    await page.locator(DRAWER).evaluate(async (node) => {
      await Promise.all(node.getAnimations().map((animation) => animation.finished));
    });
    await expect(page).toHaveScreenshot('s4-prompt-drawer.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });
});
