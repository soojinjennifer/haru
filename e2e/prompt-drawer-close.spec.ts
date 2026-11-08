/**
 * Stage 4b `S4-G2M` — Prompt Drawer 닫힘 모션 (`D4-137` · `D4-138`, 4b Spec §20).
 *
 * §20.8 검증 7개 중 브라우저가 필요한 것 (①~⑥). ⑦ 은 `apps/web/__tests__/stage4-motion-guards.test.ts`,
 * 닫힘 중 `onClose` 호출 수는 `packages/ui/src/sheet/__tests__/Sheet.test.tsx` 가 갖는다.
 *
 * 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)
 *  - **끝 값**: `.haru-sheet--closing` 이 붙는 순간(MutationObserver — 언마운트 타이머 240ms 안) 시트의
 *    `haru-sheet-out` 애니메이션을 **끝 − 0.01ms 로 seek** 해 keyframe 끝 값을, `finish()` 해 **정적 값**을
 *    `getBoundingClientRect().top` · computed `transform` 으로 읽는다. 둘이 같아야 되튐 0 이다.
 *  - **자연 재생**: 실제 시계에서 rAF 마다 top 을 샘플링 — 단조 증가(되튐 0) · 애니메이션이 끝난 프레임은 화면 밖.
 *  - **언마운트 프레임**: 주입 시계로 언마운트 타이머를 세우고 끝 상태(모든 시트·scrim 애니메이션 finish, 나머지
 *    애니메이션 pause)에서 하단 120px 띠를 찍은 뒤, 타이머를 진행해 언마운트 후 같은 띠를 다시 찍어 채널 차를 센다.
 *
 * `R-BASELINE-1`: 새 baseline 없음 — 전부 수치 단정이다. dev 패널은 `hideDevPanel`.
 */
import { expect, test, type Page } from '@playwright/test';

import { hideDevPanel } from './support/gallery';
import { decodePng } from './support/pixels';
import { firstStartSession, logInToHome, READY_TITLE, startSession } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const DRAWER = '.haru-sheet--floating';
/** `--sheet-floating-inset-block-end` = gutter 24 + safe-area 0 (테스트 환경) */
const FLOATING_INSET = 24;
/** `--sheet-floating-exit-shadow-reach` = `--shadow-glass-rest` 위쪽 번짐 28 (`D4-139`) */
const EXIT_SHADOW_REACH = 28;
/** floating 닫힘 추가 거리 = inset + 그림자 번짐 */
const FLOATING_EXIT_EXTRA = FLOATING_INSET + EXIT_SHADOW_REACH;

function drawer(page: Page) {
  return page.getByRole('dialog', { name: 'Prompts of this session' });
}

function chip(page: Page) {
  return page.getByRole('button', { name: 'Prompts', exact: true });
}

async function startRecording(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
}

/** 시트 열기 애니메이션(CSS — 주입 시계 밖)이 끝날 때까지. */
async function openAnimationsDone(page: Page, selector: string): Promise<void> {
  await page.locator(selector).evaluate(async (node) => {
    await Promise.all(node.getAnimations().map((animation) => animation.finished));
  });
}

async function openDrawer(page: Page): Promise<void> {
  await chip(page).click();
  await expect(page.getByRole('region', { name: 'Try this prompt!' })).toBeVisible();
  await page.getByRole('button', { name: 'See all prompts' }).click();
  await expect(drawer(page)).toBeVisible();
  await openAnimationsDone(page, DRAWER);
}

interface ClosingEnd {
  innerHeight: number;
  height: number;
  /** keyframe 끝(끝 − 0.01ms seek) 시점 top */
  keyframeEndTop: number;
  /** 애니메이션 finish 뒤 = 정적 `.haru-sheet--closing` 값 */
  staticTop: number;
  /** 정적 computed transform 의 translateY */
  staticTranslateY: number;
  animationNames: string[];
  inert: boolean;
  ariaModal: string | null;
}

/**
 * `selector` 시트에 `.haru-sheet--closing` 이 붙는 순간의 끝 상태를 잰다 (언마운트 240ms 전).
 * 돌려준 함수를 `await` 하기 전에 닫기를 트리거한다.
 */
async function watchClosingEnd(page: Page, selector: string): Promise<() => Promise<ClosingEnd>> {
  await page.evaluate((sel) => {
    const target = document.querySelector(sel);
    if (target === null) throw new Error(`no ${sel}`);
    const holder = window as unknown as { __closingEnd?: Promise<unknown> };
    holder.__closingEnd = new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        if (!target.classList.contains('haru-sheet--closing')) return;
        observer.disconnect();
        const element = target as HTMLElement;
        const animations = element.getAnimations() as CSSAnimation[];
        const exit = animations.find((animation) => animation.animationName === 'haru-sheet-out');
        let keyframeEndTop = Number.NaN;
        if (exit !== undefined) {
          const duration = Number(exit.effect?.getComputedTiming().duration ?? 0);
          exit.pause();
          exit.currentTime = duration - 0.01;
          keyframeEndTop = element.getBoundingClientRect().top;
        }
        for (const animation of animations) animation.finish();
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        resolve({
          innerHeight: window.innerHeight,
          height: element.offsetHeight,
          keyframeEndTop,
          staticTop: element.getBoundingClientRect().top,
          staticTranslateY: matrix.m42,
          animationNames: animations.map((animation) => animation.animationName),
          inert: element.hasAttribute('inert'),
          ariaModal: element.getAttribute('aria-modal'),
        });
      });
      observer.observe(target, { attributes: true, attributeFilter: ['class'] });
    });
  }, selector);
  return () =>
    page.evaluate(() => (window as unknown as { __closingEnd: Promise<ClosingEnd> }).__closingEnd);
}

interface Frame {
  top: number;
  closing: boolean;
  running: number;
  transform: string;
  opacity: number;
  chipFocused: boolean;
}

/** 실제 시계에서 시트가 사라질 때까지 rAF 마다 샘플링한다. 돌려준 함수를 `await` 하기 전에 닫는다. */
async function sampleUntilGone(page: Page, selector: string): Promise<() => Promise<Frame[]>> {
  await chip(page).evaluate((node) => {
    node.setAttribute('data-e2e-chip', '');
  });
  await page.evaluate((sel) => {
    const holder = window as unknown as { __frames?: Promise<unknown> };
    holder.__frames = new Promise((resolve) => {
      const frames: Frame[] = [];
      const tick = () => {
        const element = document.querySelector<HTMLElement>(sel);
        if (element === null) {
          resolve(frames);
          return;
        }
        const style = getComputedStyle(element);
        frames.push({
          top: element.getBoundingClientRect().top,
          closing: element.classList.contains('haru-sheet--closing'),
          running: element.getAnimations().filter((animation) => animation.playState === 'running')
            .length,
          transform: style.transform,
          opacity: Number(style.opacity),
          chipFocused: document.activeElement?.hasAttribute('data-e2e-chip') === true,
        });
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, selector);
  return async () => {
    const frames = await page.evaluate(
      () => (window as unknown as { __frames: Promise<Frame[]> }).__frames,
    );
    return frames.filter((frame) => frame.closing);
  };
}

/* ===== ① 끝 위치 · 정적 값 되튐 0 ========================================================= */

test.describe('§20.8 ① — floating 닫힘 끝 = 화면 밖 (no-preference · safe-area 0)', () => {
  for (const [width, height] of [
    [393, 852],
    [320, 568],
    [1024, 768],
  ] as const) {
    test(`${String(width)}×${String(height)}: keyframe 끝 · 정적 값 top ≥ innerHeight · translateY = 높이 + 24 + 28`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.setViewportSize({ width, height });
      await startSession(page);
      await startRecording(page);
      await openDrawer(page);
      const end = await watchClosingEnd(page, DRAWER);
      await page.keyboard.press('Escape');
      const result = await end();
      test.info().annotations.push({ type: 'closing-end', description: JSON.stringify(result) });

      expect(result.animationNames).toContain('haru-sheet-out');
      expect(result.keyframeEndTop).toBeGreaterThanOrEqual(result.innerHeight - 0.5);
      expect(result.staticTop).toBeGreaterThanOrEqual(result.innerHeight);
      expect(result.staticTranslateY).toBeCloseTo(result.height + FLOATING_EXIT_EXTRA, 0);
      // 그림자까지 화면 밖 (`D4-139`) — 카드 top 이 번짐만큼 더 아래
      expect(result.staticTop).toBeGreaterThanOrEqual(result.innerHeight + EXIT_SHADOW_REACH - 0.5);
      // 되튐 0 — keyframe 끝과 정적 값이 같은 자리
      expect(Math.abs(result.staticTop - result.keyframeEndTop)).toBeLessThan(0.5);
      await expect(drawer(page)).toBeHidden();
    });
  }

  test('393×852 자연 재생 (rAF): top 단조 증가 · 애니메이션이 끝난 프레임은 화면 밖', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await startSession(page);
    await startRecording(page);
    await openDrawer(page);
    const frames = await sampleUntilGone(page, DRAWER);
    await page.keyboard.press('Escape');
    const closing = await frames();
    const innerHeight = await page.evaluate(() => window.innerHeight);
    test.info().annotations.push({
      type: 'frames',
      description: JSON.stringify(closing.map((frame) => [Math.round(frame.top), frame.running])),
    });

    expect(closing.length).toBeGreaterThan(3);
    for (let index = 1; index < closing.length; index += 1) {
      expect(closing[index]?.top ?? 0).toBeGreaterThanOrEqual((closing[index - 1]?.top ?? 0) - 0.5);
    }
    for (const frame of closing.filter((item) => item.running === 0)) {
      expect(frame.top).toBeGreaterThanOrEqual(innerHeight);
    }
    // ⑤ 닫힘 시작 프레임에 포커스 = Prompts 칩 (AC-4-137 ③)
    expect(closing[0]?.chipFocused).toBe(true);
  });
});

/* ===== ② 다른 variant 불변 ================================================================== */

test.describe('§20.8 ② — 다른 variant 닫힘 끝 = translateY(100%) 그대로', () => {
  test('bottom (Reading Context 시트) — translateY = 높이 · 닫힘 중 inert · aria-modal 없음', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await logInToHome(page);
    await firstStartSession(page).click();
    await expect(page.getByRole('dialog', { name: READY_TITLE })).toBeVisible();
    await openAnimationsDone(page, '.haru-sheet--bottom');
    const end = await watchClosingEnd(page, '.haru-sheet--bottom');
    await page.keyboard.press('Escape');
    const result = await end();
    test.info().annotations.push({ type: 'closing-end', description: JSON.stringify(result) });

    expect(result.staticTranslateY).toBeCloseTo(result.height, 0);
    expect(Math.abs(result.staticTop - result.keyframeEndTop)).toBeLessThan(0.5);
    expect(result.inert).toBe(true);
    expect(result.ariaModal).toBeNull();
  });

  test('inset-card (Library 서가 시트) — translateY = 높이 · 닫힘 중 inert · aria-modal 없음', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await logInToHome(page);
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Library' })
      .click();
    await expect(page.locator('.haru-library-shelves')).toBeVisible();
    await page.getByRole('button', { name: 'See all Our curated shelf' }).click();
    await expect(page.locator('.haru-sheet--inset-card')).toBeVisible();
    await openAnimationsDone(page, '.haru-sheet--inset-card');
    const end = await watchClosingEnd(page, '.haru-sheet--inset-card');
    await page.keyboard.press('Escape');
    const result = await end();
    test.info().annotations.push({ type: 'closing-end', description: JSON.stringify(result) });

    expect(result.staticTranslateY).toBeCloseTo(result.height, 0);
    expect(Math.abs(result.staticTop - result.keyframeEndTop)).toBeLessThan(0.5);
    expect(result.inert).toBe(true);
    expect(result.ariaModal).toBeNull();
  });
});

/* ===== ③ 언마운트 프레임 · ⑥ 닫힘 중 상호작용 (주입 시계로 언마운트 타이머 정지) ================= */

/** 녹음 시작 전에 시계를 멈춘다 (`session-prompts.spec.ts` `recordFrozen` 과 같은 방식). */
async function recordWithPausedClock(page: Page): Promise<void> {
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
  await page.clock.runFor(1_000);
}

const STRIP = 120;

async function bottomStrip(page: Page): Promise<Uint8Array> {
  const { width, height } = page.viewportSize() ?? { width: 393, height: 852 };
  const png = await page.screenshot({
    clip: { x: 0, y: height - STRIP, width, height: STRIP },
    animations: 'allow',
  });
  return decodePng(png).data;
}

interface StripDiff {
  /** 채널 차 최댓값 */
  max: number;
  /** 채널 차 > 5 픽셀 수 */
  over: number;
  /** 채널 차 > 5 가 있는 행 — 뷰포트 바닥에서 몇 번째 행인가 (1 = 맨 아래) */
  rowsFromBottom: number[];
}

function diffStrips(before: Uint8Array, after: Uint8Array, width: number): StripDiff {
  let over = 0;
  let max = 0;
  const rows = new Set<number>();
  for (let index = 0; index < before.length; index += 4) {
    const delta = Math.max(
      Math.abs((before[index] ?? 0) - (after[index] ?? 0)),
      Math.abs((before[index + 1] ?? 0) - (after[index + 1] ?? 0)),
      Math.abs((before[index + 2] ?? 0) - (after[index + 2] ?? 0)),
    );
    max = Math.max(max, delta);
    if (delta > 5) {
      over += 1;
      rows.add(STRIP - Math.floor(index / 4 / width));
    }
  }
  return { max, over, rowsFromBottom: [...rows].sort((a, b) => a - b) };
}

/**
 * 끝 상태(언마운트 직전) 띠 · 같은 상태에서 **시트 `box-shadow` 만 끈** 띠 · 언마운트 직후 띠를 찍어 비교한다.
 * 그림자를 끄면 차이가 0 이 되는가 = 차이의 원인이 그림자 잔여인가 (`R-BASELINE-1` ⑥ 런타임 토글).
 */
async function unmountStrips(
  page: Page,
  width: number,
  height: number,
): Promise<{ withShadow: StripDiff; shadowOff: StripDiff }> {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width, height });
  await page.clock.install();
  await startSession(page);
  await recordWithPausedClock(page);
  await openDrawer(page);
  await page.keyboard.press('Escape');
  await expect(page.locator(`${DRAWER}.haru-sheet--closing`)).toBeAttached();
  // 끝 상태로 고정: 시트·scrim 은 finish, 나머지(링 breathing 등)는 그 자리에서 pause
  await page.evaluate(() => {
    for (const node of document.querySelectorAll('.haru-sheet, .haru-scrim')) {
      for (const animation of node.getAnimations()) animation.finish();
    }
    for (const animation of document.getAnimations()) {
      if (animation.playState === 'running') animation.pause();
    }
  });
  const before = await bottomStrip(page);
  await page.locator(DRAWER).evaluate((node) => {
    (node as HTMLElement).style.boxShadow = 'none';
  });
  const beforeNoShadow = await bottomStrip(page);
  await page.clock.runFor(300);
  await expect(page.locator(DRAWER)).toHaveCount(0);
  const after = await bottomStrip(page);
  return {
    withShadow: diffStrips(before, after, width),
    shadowOff: diffStrips(beforeNoShadow, after, width),
  };
}

const UNMOUNT_VIEWPORTS = [
  [393, 852],
  [320, 568],
  [1024, 768],
] as const;

test.describe('§20.8 ③ — 언마운트 직전 ↔ 직후 하단 120px 띠 (그림자 잔여)', () => {
  for (const [width, height] of UNMOUNT_VIEWPORTS) {
    /*
     * 기준 5 (`VISUAL_THRESHOLD_FRAME` 0.02 ≈ 5.3) — 바꾸지 않는다.
     * `S4-G2M` 실측: inset 만 더했을 때 393 max 7 · 320 / 1024 max 8, 뷰포트 맨 아래 2행 (그림자 위쪽 번짐 잔여).
     * `D4-139` 로 닫힘 거리에 번짐(`--sheet-floating-exit-shadow-reach`)을 더해 해소했다 (handoff `S4-G2MF`).
     */
    test(`${String(width)}×${String(height)}: 채널 차 ≤ 5 (VISUAL_THRESHOLD_FRAME 0.02 ≈ 5.3)`, async ({
      page,
    }) => {
      const { withShadow } = await unmountStrips(page, width, height);
      test.info().annotations.push({
        type: 'unmount-strip',
        description: JSON.stringify({ width, height, ...withShadow }),
      });
      expect(withShadow.max, JSON.stringify(withShadow)).toBeLessThanOrEqual(5);
    });

    test(`${String(width)}×${String(height)}: 원인 분해 — 시트 그림자를 끄면 차이 0 · 차이는 바닥 4행 안`, async ({
      page,
    }) => {
      const { withShadow, shadowOff } = await unmountStrips(page, width, height);
      test.info().annotations.push({
        type: 'unmount-strip',
        description: JSON.stringify({ width, height, withShadow, shadowOff }),
      });
      expect(shadowOff).toEqual({ max: 0, over: 0, rowsFromBottom: [] });
      expect(Math.max(0, ...withShadow.rowsFromBottom)).toBeLessThanOrEqual(4);
    });
  }
});

test.describe('§20.8 ⑥ — 닫힘 중 (240ms): inert · 모달 아님 · 탭 흡수 · 녹음 불변 · 팝업 Escape', () => {
  test('393×852: 칩 Enter 팝업 → Escape 로 닫힘 · 화살표 무반응 · scrim 연속 탭 · Record 자리 탭 → 일시정지 0', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.clock.install();
    await startSession(page, 'session:prompts-7');
    await recordWithPausedClock(page);
    await openDrawer(page);
    const next = await drawer(page).getByRole('button', { name: 'Next prompt' }).boundingBox();
    const record = await page.getByRole('button', { name: 'Pause recording' }).boundingBox();
    if (next === null || record === null) throw new Error('no boxes');

    await page.keyboard.press('Escape');
    const sheet = page.locator(`${DRAWER}.haru-sheet--closing`);
    await expect(sheet).toBeAttached();
    // 시트를 제자리(닫힘 시작 위치)에 세운다 — 화살표가 원래 좌표에 있게
    await sheet.evaluate((node) => {
      for (const animation of node.getAnimations()) {
        animation.pause();
        animation.currentTime = 0;
      }
    });
    await expect(sheet).toHaveAttribute('inert', '');
    await expect(page.locator('[aria-modal="true"]')).toHaveCount(0);
    await expect(chip(page)).toBeFocused();

    // 칩(포커스)에서 키보드로 팝업을 다시 열면, 사라지는 시트가 Escape 를 가져가지 않는다 (`modalOpen()` 양보 0)
    await page.keyboard.press('Enter');
    await expect(page.getByRole('region', { name: 'Try this prompt!' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('region', { name: 'Try this prompt!' })).toBeHidden();
    await expect(chip(page)).toBeFocused();

    const nextCenter = { x: next.x + next.width / 2, y: next.y + next.height / 2 };
    const hit = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.className.toString() ?? '',
      nextCenter,
    );
    expect(hit).toContain('haru-scrim');
    await page.mouse.click(nextCenter.x, nextCenter.y);
    await expect(sheet.getByText('Prompt 1 of 7')).toBeAttached();
    await expect(sheet.getByText('Prompt 2 of 7')).toHaveCount(0);

    await page.mouse.click(10, 10); // scrim
    await page.mouse.click(10, 10);
    await page.mouse.click(record.x + record.width / 2, record.y + record.height / 2);
    await page.mouse.click(record.x + record.width / 2, record.y + record.height / 2);
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeAttached();

    await page.clock.runFor(300);
    await expect(page.locator(DRAWER)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  });
});

/* ===== ④ reduce ============================================================================ */

test.describe('§20.8 ④ — `prefers-reduced-motion: reduce` 닫힘 = opacity 만', () => {
  test('393×852: 모든 닫힘 프레임 transform none · top 고정 · opacity 1 → 0 단조 감소', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await openDrawer(page);
    const frames = await sampleUntilGone(page, DRAWER);
    await page.keyboard.press('Escape');
    const closing = await frames();
    test.info().annotations.push({
      type: 'frames',
      description: JSON.stringify(closing.map((frame) => [frame.transform, frame.opacity])),
    });

    expect(closing.length).toBeGreaterThan(3);
    expect(new Set(closing.map((frame) => frame.transform))).toEqual(new Set(['none']));
    expect(new Set(closing.map((frame) => Math.round(frame.top)))).toHaveProperty('size', 1);
    for (let index = 1; index < closing.length; index += 1) {
      expect(closing[index]?.opacity ?? 1).toBeLessThanOrEqual(
        (closing[index - 1]?.opacity ?? 1) + 1e-6,
      );
    }
    expect(closing[closing.length - 1]?.opacity ?? 1).toBeLessThan(0.3);
    expect(closing[0]?.chipFocused).toBe(true);
  });
});
