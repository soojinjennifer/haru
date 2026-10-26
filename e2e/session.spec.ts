/**
 * Stage 4b `S4-F1` — 세션 ready 화면 (Figma `300:1309` = `28:51` + 닫기 `300:1318`) · 진입.
 *
 * jsdom 이 계산하지 않는 것만 여기서 본다 — 기하 · computed 스타일 · 픽셀 · 키보드 · 시각 baseline.
 * 동작·요청 순서의 단위 증거는 `apps/web/__tests__/session-ready.test.tsx` 가 갖는다.
 *
 * 좌표 규칙: **Web y = Figma y − 56** (상태바 56 은 OS 영역). 아래 묶음(Record · 바)은 화면 **아래**에
 * 앵커되므로 393×852 에서 Figma 좌표와 **같다** (Record 621 · 바 789).
 *
 * `R-BASELINE-1`: 세션 화면은 클라이언트 이동으로 들어오므로 `startSession()` 이 이미지 디코드 +
 * `settle()` 을 기다린다 · dev 패널은 `hideDevPanel` · 전역 `reducedMotion: 'reduce'` 라 pulse 는
 * 정지값(= Figma .35)으로 찍힌다 · 인사는 고정 fixture.
 */
import { expect, test, type Page } from '@playwright/test';

import { FRAME_SNAPSHOT, REGION_SNAPSHOT } from '../playwright.config';
import { hideDevPanel, settle } from './support/gallery';
import { decodePng, pixelAt } from './support/pixels';
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

/** 버블 본체 · 제목 줄 · pill 높이들 (식 대조용). */
async function bubbleMetrics(page: Page) {
  return page.evaluate(() => {
    const body = document.querySelector('.haru-session-bubble .haru-bubble');
    if (body === null) return null;
    const title = body.querySelector('.haru-bubble__content > .haru-text');
    const pills = [...body.querySelectorAll('.haru-prompt-pill')].map(
      (pill) => pill.getBoundingClientRect().height,
    );
    const rect = body.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      titleHeight: title === null ? null : title.getBoundingClientRect().height,
      titleText: title?.textContent ?? null,
      titleOverflows: title === null ? false : title.scrollWidth > title.clientWidth,
      pills,
    };
  });
}

test.describe('ready 기하 — Figma `300:1309` (393×852)', () => {
  test('닫기 · 메달리온 · 버블 · Record · 바가 Figma 좌표에 놓인다', async ({ page }) => {
    await startSession(page);

    const close = await box(page, '.haru-session__top-row .haru-icon-button');
    expect(close).toEqual({ x: 331, y: 10, width: 38, height: 38 }); // Figma (331, 66)

    const ring = await box(page, '.haru-session__medallion');
    expect(ring.width).toBe(190);
    expect(ring.y).toBe(76); // Figma 132
    expect(ring.x).toBeCloseTo(101.5, 0);
    const avatar = await box(page, '.haru-session__medallion .haru-character-medallion');
    expect(avatar).toMatchObject({ width: 174, height: 174, y: 84 }); // Figma 140

    const bubble = await bubbleMetrics(page);
    expect(bubble).not.toBeNull();
    if (bubble === null) return;
    expect(bubble.top).toBeCloseTo(337.627 - 56, 0);
    expect(bubble.width).toBe(329);
    expect(bubble.left).toBe(32); // 가운데 (Figma x34 의 +2 = `AD-S4-9`)

    const record = await box(page, '.haru-record');
    expect(record).toEqual({ x: 121.5, y: 621, width: 150, height: 150 });
    expect(bubble.bottom).toBeLessThanOrEqual(record.y); // Record 침범 0

    const bar = await box(page, '.haru-session-actions');
    expect(bar).toEqual({ x: 57, y: 789, width: 279, height: 45 });
    const buttons = await page.locator('.haru-session-actions .haru-button').evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { x: rect.x, width: rect.width };
      }),
    );
    expect(buttons).toEqual([
      { x: 57, width: 135 },
      { x: 201, width: 135 },
    ]);
  });

  test('tail 꼭짓점이 본체 위로 ~10.6 돌출한다 (Figma `88:842` — 픽셀 프로브)', async ({
    page,
  }) => {
    await startSession(page);
    const bubble = await bubbleMetrics(page);
    if (bubble === null) throw new Error('no bubble');
    const centerX = Math.round(bubble.left + bubble.width / 2);
    const png = decodePng(
      await page.screenshot({ clip: { x: centerX - 1, y: 250, width: 3, height: 40 } }),
    );
    // 가운데 열에서 처음으로 거의 흰색(≥ 245)이 되는 행 = tail 면. 그 위는 메달리온 링 그림자·배경이다.
    let firstWhite = -1;
    for (let row = 0; row < png.height; row += 1) {
      const { r, g, b } = pixelAt(png, 1, row);
      if (Math.min(r, g, b) >= 245) {
        firstWhite = 250 + row;
        break;
      }
    }
    const overhang = bubble.top - firstWhite;
    // 기하 꼭짓점 10.627 · 안티앨리어싱으로 첫 "흰" 행은 1~2px 아래다 (Figma 렌더 실측: 꼭짓점 327 → 흰 행 329).
    expect(overhang).toBeGreaterThanOrEqual(8);
    expect(overhang).toBeLessThanOrEqual(11);
  });
});

test.describe('AC-4-118 — 하단 바 = 열 가운데 (`D4-19`, `AD-S4-5` · `AD-S4-10`)', () => {
  for (const viewport of [
    { width: 320, height: 852, buttonWidth: 131.5 },
    { width: 393, height: 852, buttonWidth: 135 },
    { width: 600, height: 852, buttonWidth: 135 },
  ] as const) {
    test(`${viewport.width}px — 좌우 여백이 같고 우측이 잘리지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await startSession(page);
      const geometry = await page.evaluate(() => {
        const column = document.querySelector('.haru-app-column');
        const bar = document.querySelector('.haru-session-actions');
        if (column === null || bar === null) throw new Error('missing nodes');
        const style = getComputedStyle(column);
        const c = column.getBoundingClientRect();
        const contentLeft = c.left + parseFloat(style.paddingLeft);
        const contentRight = c.right - parseFloat(style.paddingRight);
        const b = bar.getBoundingClientRect();
        const buttons = [...bar.querySelectorAll('.haru-button')].map(
          (node) => node.getBoundingClientRect().width,
        );
        return {
          left: b.left - contentLeft,
          right: contentRight - b.right,
          barRight: b.right,
          contentRight,
          buttons,
        };
      });
      expect(Math.abs(geometry.left - geometry.right)).toBeLessThanOrEqual(0.5);
      expect(geometry.barRight).toBeLessThanOrEqual(geometry.contentRight + 0.01);
      for (const width of geometry.buttons) expect(width).toBeCloseTo(viewport.buttonWidth, 1);
    });
  }
});

test.describe('AC-4-111 · 117 — ready 비활성 = 전역 opacity .5 하나 (`D4-18`)', () => {
  test('Discard · Submit: opacity 0.5 · 면/라벨 색은 활성과 같다 · 포커스 가능 · 사유 연결 · 요청 0', async ({
    page,
  }) => {
    await startSession(page);
    const read = () =>
      page.locator('.haru-session-actions .haru-button').evaluateAll((nodes) =>
        nodes.map((node) => {
          const style = getComputedStyle(node);
          return {
            opacity: style.opacity,
            background: style.backgroundColor,
            color: style.color,
            borderStyle: style.borderStyle,
            ariaDisabled: node.getAttribute('aria-disabled'),
            describedBy: document.getElementById(node.getAttribute('aria-describedby') ?? '')
              ?.textContent,
          };
        }),
      );
    /* 면 색이 **토큰 값 그대로**인지 — 같은 토큰을 칠한 탐침 요소와 비교한다 (색 리터럴을 쓰지 않는다). */
    const tokenColors = await page.evaluate(() =>
      ['--color-action-neutral-bg', '--color-action-primary-bg', '--color-fg-on-accent'].map(
        (token) => {
          const probe = document.createElement('span');
          probe.style.color = `var(${token})`;
          document.body.append(probe);
          const value = getComputedStyle(probe).color;
          probe.remove();
          return value;
        },
      ),
    );
    const [neutralBg, accentBg, onAccent] = tokenColors;

    const ready = await read();
    expect(ready).toEqual([
      {
        opacity: '0.5',
        background: neutralBg, // `--color-action-neutral-bg` = gray-2 (가값 P-25)
        color: onAccent,
        borderStyle: 'none',
        ariaDisabled: 'true',
        describedBy: 'Available after you start recording.',
      },
      {
        opacity: '0.5',
        background: accentBg, // teal (`D-01`)
        color: onAccent,
        borderStyle: 'none',
        ariaDisabled: 'true',
        describedBy: 'Available after you start recording.',
      },
    ]);

    // 키보드로 도달한다 (native disabled 아님)
    const discard = page.getByRole('button', { name: 'Discard' });
    await discard.focus();
    await expect(discard).toBeFocused();

    const before = (await requestOperations(page)).filter((op) => op.includes('transitions'));
    // `aria-disabled` 는 Playwright 가 "비활성" 으로 보고 기다리므로 강제로 누른다 — 누름이 무시되는지가 검증 대상이다.
    await discard.click({ force: true });
    await page.getByRole('button', { name: 'Submit' }).click({ force: true });
    await page.keyboard.press('Enter');
    const after = (await requestOperations(page)).filter((op) => op.includes('transitions'));
    expect(after).toEqual(before);

    /* 활성(녹음 시작 후)과 비교 — **바뀌는 것은 opacity 하나**다 (비활성 전용 색·테두리 0건, AC-4-117 ①②). */
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
    const active = await read();
    expect(active.map((item) => item.opacity)).toEqual(['1', '1']);
    expect(
      active.map(({ background, color, borderStyle }) => ({ background, color, borderStyle })),
    ).toEqual(
      ready.map(({ background, color, borderStyle }) => ({ background, color, borderStyle })),
    );
  });

  test('Record 를 누르면 같은 노드가 Pause 로 바뀌고 바는 활성 · 재마운트 0 (AC-4-111 ④)', async ({
    page,
  }) => {
    await startSession(page);
    await page.evaluate(() => {
      document.querySelector('.haru-record')?.setAttribute('data-e2e-mark', 'record');
      document.querySelector('.haru-session-actions')?.setAttribute('data-e2e-mark', 'bar');
    });
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
    await expect(page.locator('[data-e2e-mark="record"]')).toHaveAttribute(
      'aria-label',
      'Pause recording',
    );
    await expect(page.locator('[data-e2e-mark="bar"] .haru-button').first()).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
    const opacity = await page
      .locator('.haru-session-actions .haru-button')
      .first()
      .evaluate((node) => getComputedStyle(node).opacity);
    expect(opacity).toBe('1');
    await expect
      .poll(async () => requestPayloads(page, 'POST /v1/sessions/:sessionId/transitions'))
      .toHaveLength(1);
    const transitions = await requestPayloads(page, 'POST /v1/sessions/:sessionId/transitions');
    expect(transitions[0]).toMatchObject({ to: 'recording' });
  });
});

test.describe('AC-4-120 · 121 · 122 — 버블 높이 식 · 1줄 clamp (`D4-21` · `D4-22`)', () => {
  /** `h = (제목 있으면 21 + 22 + 6, 없으면 21) + 6n + Σpill` — n 은 렌더된 pill 수(≤5). */
  function expected(metrics: NonNullable<Awaited<ReturnType<typeof bubbleMetrics>>>) {
    const n = metrics.pills.length;
    const sum = metrics.pills.reduce((total, height) => total + height, 0);
    return (metrics.titleHeight === null ? 21 : 21 + 22 + 6) + 6 * n + sum;
  }

  const COMBOS: readonly { greeting: string; prompts: string }[] = [
    { greeting: 'success', prompts: 'prompts-1' },
    { greeting: 'success', prompts: 'prompts-3' },
    { greeting: 'success', prompts: 'success' },
    { greeting: 'success', prompts: 'prompts-7' },
    { greeting: 'greeting-missing', prompts: 'prompts-1' },
    { greeting: 'greeting-missing', prompts: 'prompts-3' },
    { greeting: 'greeting-missing', prompts: 'success' },
    { greeting: 'greeting-missing', prompts: 'prompts-7' },
  ];

  for (const combo of COMBOS) {
    test(`인사 ${combo.greeting} × ${combo.prompts} — 측정 높이 = 식`, async ({ page }) => {
      await startSession(page, `session-greeting:${combo.greeting},session:${combo.prompts}`);
      const metrics = await bubbleMetrics(page);
      expect(metrics).not.toBeNull();
      if (metrics === null) return;
      if (metrics.titleHeight !== null) expect(metrics.titleHeight).toBe(22);
      expect(metrics.height).toBeCloseTo(expected(metrics), 0);
      const record = await box(page, '.haru-record');
      expect(metrics.bottom).toBeLessThanOrEqual(record.y);
    });
  }

  test('n = 0 (`prompts-empty`) — 인사가 있어도 버블을 렌더하지 않는다', async ({ page }) => {
    await startSession(page, 'session:prompts-empty');
    expect(await bubbleMetrics(page)).toBeNull();
  });

  test('인사 없음 → 같은 Prompt 에서 정확히 28 짧아진다 (제목 22 + gap 6)', async ({ page }) => {
    await startSession(page);
    const withTitle = await bubbleMetrics(page);
    await page.goto('about:blank');
    await startSession(page, 'session-greeting:greeting-missing');
    const without = await bubbleMetrics(page);
    if (withTitle === null || without === null) throw new Error('no bubble');
    expect(withTitle.pills).toEqual(without.pills);
    expect(withTitle.height - without.height).toBeCloseTo(28, 1);
  });

  for (const width of [320, 393] as const) {
    test(`${width}px — 긴 인사도 제목 1줄(≤22) · 말줄임 · 버블 높이 식 유지 · Record 침범 0`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 852 });
      await startSession(page, 'session-greeting:greeting-long');
      const metrics = await bubbleMetrics(page);
      if (metrics === null) throw new Error('no bubble');
      expect(metrics.titleText).toBe('Ready for a cozy bedtime story together tonight?');
      expect(metrics.titleHeight).toBeLessThanOrEqual(22);
      expect(metrics.titleOverflows).toBe(true); // clamp 가 실제로 걸렸다
      expect(metrics.height).toBeCloseTo(expected(metrics), 0);
      const record = await box(page, '.haru-record');
      expect(metrics.bottom).toBeLessThanOrEqual(record.y);
    });
  }

  test('`greeting-tight` 는 393 에서 말줄임 없이 1줄 · 320 에서만 말줄임', async ({ page }) => {
    await startSession(page, 'session-greeting:greeting-tight');
    const wide = await bubbleMetrics(page);
    expect(wide?.titleOverflows).toBe(false);
    await page.setViewportSize({ width: 320, height: 852 });
    await settle(page);
    const narrow = await bubbleMetrics(page);
    expect(narrow?.titleOverflows).toBe(true);
    expect(narrow?.titleHeight).toBe(22);
  });
});

test.describe('AC-4-136 — ready 닫기 (`D4-57`)', () => {
  test('확인 없이 `ready → abandoned` 1건 → `/` · 닫기 터치 44', async ({ page }) => {
    await startSession(page);
    const close = page.getByRole('button', { name: 'Close session' });
    const hit = await close.evaluate((node) => {
      const before = getComputedStyle(node, '::before');
      const rect = node.getBoundingClientRect();
      return { inset: before.inset, width: rect.width };
    });
    expect(hit.width).toBe(38);
    expect(hit.inset).toBe('-3px'); // 38 → 44 (IconButton `::before`)

    await close.click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
    await expect
      .poll(async () => requestPayloads(page, 'POST /v1/sessions/:sessionId/transitions'))
      .toHaveLength(1);
    const transitions = await requestPayloads(page, 'POST /v1/sessions/:sessionId/transitions');
    expect(transitions).toHaveLength(1);
    expect(transitions[0]).toMatchObject({ to: 'abandoned' });
  });

  test('실패하면 화면에 머물고 Toast 로 알린다 (`sessions.transition:error`)', async ({ page }) => {
    await startSession(page, 'sessions.transition:error');
    await page.getByRole('button', { name: 'Close session' }).click();
    await expect(page.getByText("We couldn't close this session. Please try again.")).toBeVisible();
    await expect(page).toHaveURL(/\/session\//);
  });
});

test.describe('진입 — Reading Context 시트 (AC-4-86 · AC-3-25) · 오프라인 캐시 (AC-4-123)', () => {
  test('키보드: Enter 로 열고 · 첫 포커스가 시트 안 · Escape 로 닫히면 Start Session 으로 복귀', async ({
    page,
  }) => {
    await logInToHome(page);
    const start = firstStartSession(page);
    await start.focus();
    await page.keyboard.press('Enter');
    const sheet = page.getByRole('dialog', { name: READY_TITLE });
    await expect(sheet).toBeVisible();
    const inside = await page.evaluate(
      () => document.activeElement?.closest('[role="dialog"]') !== null,
    );
    expect(inside).toBe(true);
    // 화살표로 라디오 이동 + Space 선택
    await sheet.getByRole('radio').first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(sheet.getByRole('radio', { name: 'Bedtime' })).toBeChecked();
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(start).toBeFocused();
    expect((await requestOperations(page)).filter((op) => op.includes('selection'))).toEqual([]);
  });

  test('오프라인 캐시: Start Session = aria-disabled · opacity .5 · 사유 = 배너 제목 · 요청 0', async ({
    page,
  }) => {
    await logInToHome(page, 'activity-cards:offline-cached-card');
    const start = firstStartSession(page);
    const state = await start.evaluate((node) => ({
      ariaDisabled: node.getAttribute('aria-disabled'),
      disabled: (node as HTMLButtonElement).disabled,
      opacity: getComputedStyle(node).opacity,
      reason: document.getElementById(node.getAttribute('aria-describedby') ?? '')?.textContent,
    }));
    expect(state).toEqual({
      ariaDisabled: 'true',
      disabled: false,
      opacity: '0.5',
      reason: 'Go online to start a session',
    });
    await start.click({ force: true });
    await start.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const ops = await requestOperations(page);
    expect(ops.filter((op) => op.includes('selection') || op === 'POST /v1/sessions')).toEqual([]);
  });
});

test.describe('ready 시각 baseline — Figma `300:1309`', () => {
  test('s4-session-ready — 393×852 전체 프레임', async ({ page }) => {
    await startSession(page);
    await expect(page).toHaveScreenshot('s4-session-ready.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });

  test('s4-session-ready-320 — 320×852 (버블 272 · 바 131.5×2)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 852 });
    await startSession(page);
    await expect(page).toHaveScreenshot('s4-session-ready-320.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });

  test('s4-session-ready-no-greeting — 인사 없음 (`D4-22`, 241)', async ({ page }) => {
    await startSession(page, 'session-greeting:greeting-missing');
    await expect(page.locator('.haru-session-bubble')).toHaveScreenshot(
      's4-session-ready-no-greeting.png',
      REGION_SNAPSHOT,
    );
  });

  test('s4-session-ready-long-greeting — 1줄 clamp 회귀 (제약 위반 입력)', async ({ page }) => {
    await startSession(page, 'session-greeting:greeting-long');
    await expect(page.locator('.haru-session-bubble')).toHaveScreenshot(
      's4-session-ready-long-greeting.png',
      REGION_SNAPSHOT,
    );
  });

  test('s4-session-ready-reminder — 5분 리마인드 = 제목 줄만 교체 (`S4-F1R`, `D4-59`)', async ({
    page,
  }) => {
    // 녹음 상태 머신의 5분 타이머(`D4-46`)를 실시간 대기 없이 넘긴다 — 시계는 자연 진행 + 한 번 점프.
    await page.clock.install();
    await startSession(page);
    const before = await bubbleMetrics(page);
    await page.clock.fastForward('05:01');
    const title = page.locator('.haru-session-bubble .haru-bubble__content > .haru-text');
    await expect(title).toHaveText('Ready when you are!');
    await settle(page);
    const after = await bubbleMetrics(page);
    // 제목 줄만 바뀐다 — 버블 기하 · pill 높이 불변, 1줄(22)
    expect(after?.height).toBe(before?.height);
    expect(after?.top).toBe(before?.top);
    expect(after?.pills).toStrictEqual(before?.pills);
    expect(after?.titleHeight).toBe(22);
    await expect(page).toHaveScreenshot('s4-session-ready-reminder.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });

  test('s4-reading-context-sheet — Reading Context 시트 (명세 C13-15, Figma 없음)', async ({
    page,
  }) => {
    await logInToHome(page);
    await firstStartSession(page).click();
    const sheet = page.getByRole('dialog', { name: READY_TITLE });
    await expect(sheet).toBeVisible();
    // 누른 자리에 포인터가 남아 행 hover 가 baseline 에 굳지 않게 치운다 (`R-BASELINE-1` ①).
    await page.mouse.move(0, 0);
    await settleImages(page);
    await expect(sheet).toHaveScreenshot('s4-reading-context-sheet.png', REGION_SNAPSHOT);
  });
});
