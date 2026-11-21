/**
 * Stage 4b `S4-K2` — 회귀 · 시각 (AC-4-97 · 98 · 99 · 100). `S4-K1` 이 끝내지 않은 것만 본다.
 *
 *  - **AC-4-97** 터치 타깃 ≥ 44 — 세션 화면 상태마다 **보이는 인터랙티브 요소 전부**를 실제 hit-test 로 잰다.
 *    요소 가운데에서 ±21.5 의 8점 + 가운데가 전부 **같은 요소**로 해석돼야 44×44 hit area 다 (`::before` 확장 포함).
 *    4b 신규 UI(마이크 시트 · 공지 슬롯 · Discard 다이얼로그 · 완료 · 조회 실패 · 7일 배너 · 48h Toast)를 함께 쓴다.
 *  - **AC-4-98** reduce — 세션 상태마다 실행 중인 애니메이션 중 **무한 반복 0** · **이동(transform 류) 0**.
 *    소스 1:1 대조는 `apps/web/__tests__/stage4-motion-guards.test.ts`.
 *  - **AC-4-99** 320 / 393 / 600 / 1024 — 앱 컬럼 ≤ 480 가운데 · 가로 넘침 0 · 요소가 컬럼 안 · 852 에서 세로 스크롤 0.
 *  - **AC-4-100** computed `overflow` 목록 (Tailwind 유틸리티 포함 — `R-FIGMA-1` ④) + 4b 신규 그림자 양축 프로브.
 *
 * `R-BASELINE-1`: 새 baseline 없음 — 전부 수치 단정이다. dev 패널은 `hideDevPanel`.
 */
import { inflateSync } from 'node:zlib';

import { expect, test, type Locator, type Page } from '@playwright/test';

import { advanceUntilToastGone } from './support/clock';
import { gotoApp, hideDevPanel, settle } from './support/gallery';
import { firstStartSession, logInToHome, READY_TITLE, startSession } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const VIEWPORT = '[data-app-shell-viewport]';

async function startRecording(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
}

async function openPopup(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Prompts', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Try this prompt!' })).toBeVisible();
  await settle(page);
}

async function openDrawer(page: Page): Promise<void> {
  await openPopup(page);
  await page.getByRole('button', { name: 'See all prompts' }).click();
  await expect(page.getByRole('dialog', { name: 'Prompts of this session' })).toBeVisible();
  await expect(page.locator('.haru-scrim')).toHaveCount(1);
  await settle(page);
}

async function submitToComplete(page: Page): Promise<void> {
  await startRecording(page);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/\/complete$/);
  await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
  // 제출 Toast 가 사라진 뒤 (완료 화면 단독) — 주입 clock 으로 흘린다 (`QA-4B-003`, 호출 테스트가 clock 을 설치한다)
  await advanceUntilToastGone(page);
  await settle(page);
}

/** 시계를 멈추고 녹음 → Mock 녹음기의 백그라운드 경고(3번째 청크 뒤)가 공지 슬롯에 뜰 때까지. */
async function recordUntilNotice(page: Page): Promise<void> {
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
  await page.clock.runFor(5_000);
  await expect(page.locator('.haru-session__notice')).toBeVisible();
  await page.clock.runFor(300);
}

async function startFromHome(page: Page, scenario: string): Promise<void> {
  await logInToHome(page, scenario);
  await firstStartSession(page).click();
  const sheet = page.getByRole('dialog', { name: READY_TITLE });
  await sheet.getByText('Bedtime', { exact: true }).click();
  await sheet.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/session\/[0-9a-f-]+$/);
  await expect(page.locator('.haru-record')).toBeVisible();
}

/* ===== AC-4-97 — 실제 hit area ============================================================== */

interface HitResult {
  name: string;
  width: number;
  height: number;
  misses: string[];
  corners: string[];
}

/**
 * `scope` 안의 보이는 인터랙티브 요소마다 가운데 · 상하좌우 ±21.5 의 5점을 hit-test 한다 — 두 축 모두 44 이상이면
 * 통과다. 모서리 4점(±21.5, ±21.5)은 **기록만** 한다: `IconButton` 의 hit 확장(`::before`)은 Stage 1 부터
 * `--radius-pill` 원형 44 라 모서리가 원 밖이다(설계 — a11y gallery `button · Back` 44x44 와 같은 기준).
 * 모달이 열려 있으면 scope 를 그 모달로 둔다 (뒤 화면은 탭 대상이 아니다).
 */
async function probeTouchTargets(page: Page, scope: string): Promise<HitResult[]> {
  return page.evaluate((scopeSelector) => {
    const half = 21.5;
    const roots = [...document.querySelectorAll(scopeSelector)];
    const interactive = roots.flatMap((root) => [
      ...root.querySelectorAll<HTMLElement>(
        'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [tabindex="0"]',
      ),
    ]);
    const unique = [...new Set(interactive)].filter((element) => {
      if (element.closest('.haru-dev-panel, [inert], [aria-hidden="true"]') !== null) return false;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const style = getComputedStyle(element);
      return style.visibility !== 'hidden' && style.display !== 'none';
    });
    return unique.map((element) => {
      const rect = element.getBoundingClientRect();
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const points: [string, number, number][] = [
        ['c', cx, cy],
        ['n', cx, cy - half],
        ['s', cx, cy + half],
        ['w', cx - half, cy],
        ['e', cx + half, cy],
      ];
      const cornerPoints: [string, number, number][] = [
        ['nw', cx - half, cy - half],
        ['ne', cx + half, cy - half],
        ['sw', cx - half, cy + half],
        ['se', cx + half, cy + half],
      ];
      const missed = (x: number, y: number): string | null => {
        const hit = document.elementFromPoint(x, y);
        if (hit !== null && (hit === element || element.contains(hit))) return null;
        return hit === null ? 'null' : `${hit.tagName.toLowerCase()}.${hit.className.toString()}`;
      };
      const missesOf = (list: readonly [string, number, number][]) =>
        list
          .map(([label, x, y]) => [label, missed(x, y)] as const)
          .filter(([, hit]) => hit !== null)
          .map(([label, hit]) => `${label}→${hit ?? ''}`);
      const name =
        element.getAttribute('aria-label') ??
        (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40) ??
        element.tagName;
      return {
        name: `${element.tagName.toLowerCase()} · ${name || element.className}`,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
        misses: missesOf(points),
        corners: missesOf(cornerPoints),
      };
    });
  }, scope);
}

function record(results: readonly HitResult[]): void {
  test.info().annotations.push({ type: 'touch', description: JSON.stringify(results) });
}

function failures(results: readonly HitResult[]): string[] {
  return results.filter((row) => row.misses.length > 0).map((row) => row.name);
}

/** `Previous prompt` 가운데에서 좌우로 0.5 씩 hit-test 해 같은 버튼이 받는 가로 폭을 잰다 (`K2-D1` · `VG-FIN-02`). */
async function previousHitExtent(
  page: Page,
): Promise<{ left: number; right: number; width: number; blocker: string }> {
  return page.getByRole('button', { name: 'Previous prompt' }).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const owns = (x: number, y: number) => {
      const hit = document.elementFromPoint(x, y);
      return hit !== null && (hit === element || element.contains(hit));
    };
    let right = 0;
    while (right < 30 && owns(cx + right + 0.5, cy)) right += 0.5;
    let left = 0;
    while (left < 30 && owns(cx - left - 0.5, cy)) left += 0.5;
    const blocker = document.elementFromPoint(cx + right + 0.5, cy);
    return { left, right, width: left + right, blocker: blocker?.className.toString() ?? '' };
  });
}

const SESSION = 'body';

test.describe('AC-4-97 — 터치 타깃 ≥ 44 (실제 hit-test · 세션 상태별)', () => {
  test('ready — 닫기 · Record · Discard · Submit', async ({ page }) => {
    await startSession(page);
    const results = await probeTouchTargets(page, SESSION);
    record(results);
    expect(results.map((row) => row.name)).toEqual(
      expect.arrayContaining([
        'button · Close session',
        'button · Tap to recording, Start recording',
        'button · Discard',
        'button · Submit',
      ]),
    );
    expect(failures(results)).toStrictEqual([]);
  });

  test('recording + Prompts 팝업 — 칩 · 닫기 · See all · Pause · Discard · Submit', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await openPopup(page);
    const results = await probeTouchTargets(page, SESSION);
    record(results);
    expect(results.map((row) => row.name)).toEqual(
      expect.arrayContaining([
        'button · Prompts',
        'button · Close session',
        'button · See all prompts',
        'button · Pause recording',
      ]),
    );
    expect(failures(results)).toStrictEqual([]);
  });

  test('paused — Resume', async ({ page }) => {
    await startSession(page);
    await startRecording(page);
    await page.getByRole('button', { name: 'Pause recording' }).click();
    await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
    const results = await probeTouchTargets(page, SESSION);
    record(results);
    expect(failures(results)).toStrictEqual([]);
  });

  test('Prompt Drawer — Next prompt (화살표) · 그 밖의 시트 버튼', async ({ page }) => {
    await startSession(page, 'session:prompts-7');
    await startRecording(page);
    await openDrawer(page);
    const results = await probeTouchTargets(page, '.haru-sheet');
    record(results);
    expect(results.map((row) => row.name)).toEqual(
      expect.arrayContaining(['button · Previous prompt', 'button · Next prompt']),
    );
    expect(failures(results)).toStrictEqual([]);
  });

  /*
   * `K2-D1` → `S4-K2F` (`D4-135`) — 1번째 페이지의 `Previous prompt`(24×24) 오른쪽 hit 확장을 bar 안
   * 요약 트랙(`translate` 로 화살표 위 층 — 배지 · pill · `__slide`)이 덮어 가로 hit 33.5 였다. 표시 전용 트랙에
   * `pointer-events: none` 을 주어 복원했다(`PromptCarousel.css` — 배지·pill 만 끄면 33.5 그대로, 실측). 그 선언을
   * 되돌리면 이 테스트가 실패한다. 기존 S4-G2 테스트는 `Next prompt` 만 쟀다.
   */
  test('K2-D1 — Prompt Drawer `Previous prompt` 가로 hit ≥ 44 (표시 전용 요약 트랙이 탭을 받지 않는다)', async ({
    page,
  }) => {
    await startSession(page, 'session:prompts-7');
    await startRecording(page);
    await openDrawer(page);
    const extent = await previousHitExtent(page);
    test.info().annotations.push({ type: 'K2-D1', description: JSON.stringify(extent) });
    expect(extent.width, JSON.stringify(extent)).toBeGreaterThanOrEqual(44);
  });

  /*
   * `VG-FIN-02` — 수정 전 결함은 **1~5쪽 전부** 33.5 였다(`stage-4b-visual-gap-final.md` §2). 위 테스트는 1쪽(비활성
   * 화살표)만 재므로, 화살표가 **활성**인 페이지를 함께 잰다: 2쪽(배지 있음) · 끝 페이지(n=5 의 5쪽 — 배지가 없어
   * 막는 요소가 문구였다). 페이지별 쌓임이 바뀌는 회귀를 잡는다. `pointer-events: none` 을 되돌리면 33.5 로 실패한다.
   */
  for (const [scenario, pageNumber, total] of [
    ['session:prompts-7', 2, 7],
    [undefined, 5, 5],
  ] as const) {
    test(`VG-FIN-02 — 활성 ${String(pageNumber)}/${String(total)}쪽 \`Previous prompt\` 가로 hit ≥ 44`, async ({
      page,
    }) => {
      await startSession(page, scenario);
      await startRecording(page);
      await openDrawer(page);
      const next = page.getByRole('button', { name: 'Next prompt' });
      for (let index = 1; index < pageNumber; index += 1) await next.click();
      const sheet = page.getByRole('dialog', { name: 'Prompts of this session' });
      await expect(
        sheet.getByText(`Prompt ${String(pageNumber)} of ${String(total)}`),
      ).toBeAttached();
      // 트랙 이동(reduce 에서도 즉시가 아닐 수 있다)이 끝난 뒤 잰다
      await page.locator('.haru-sheet--floating').evaluate(async (node) => {
        await Promise.all(
          node.getAnimations({ subtree: true }).map((animation) => animation.finished),
        );
      });
      await settle(page);
      const previous = page.getByRole('button', { name: 'Previous prompt' });
      await expect(previous).not.toHaveAttribute('aria-disabled', 'true');
      const extent = await previousHitExtent(page);
      test.info().annotations.push({ type: 'VG-FIN-02', description: JSON.stringify(extent) });
      expect(extent.width, JSON.stringify(extent)).toBeGreaterThanOrEqual(44);
    });
  }

  test('Discard 확인 다이얼로그 — Keep recording · Discard', async ({ page }) => {
    await startSession(page);
    await startRecording(page);
    await page.getByRole('button', { name: 'Discard' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await settle(page);
    const results = await probeTouchTargets(page, '[role="alertdialog"]');
    record(results);
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(failures(results)).toStrictEqual([]);
  });

  test('마이크 시트 (4b `S4-H2`) — Not now · 뒤 Record `Mic is off` (`D8-5`)', async ({ page }) => {
    await startSession(page, 'recorder:mic-permission-revoked');
    await page.getByRole('button', { name: 'Start recording' }).click();
    const sheet = page.getByRole('dialog', { name: 'Your microphone is off' });
    await expect(sheet).toBeVisible();
    await settle(page);
    const inSheet = await probeTouchTargets(page, '.haru-sheet');
    record(inSheet);
    expect(inSheet.map((row) => row.name)).toContain('button · Not now');
    expect(failures(inSheet)).toStrictEqual([]);

    await sheet.getByRole('button', { name: 'Not now' }).click();
    await expect(sheet).toHaveCount(0);
    await settle(page);
    const after = await probeTouchTargets(page, SESSION);
    record(after);
    expect(after.map((row) => row.name)).toContain('button · Mic is off');
    expect(failures(after)).toStrictEqual([]);
  });

  test('대화 전용 시트 (4b `S4-H2R`) — Not now', async ({ page }) => {
    await startFromHome(page, 'recorder:mic-permission-blocked');
    const sheet = page.getByRole('dialog', { name: 'Your microphone is off' });
    await expect(sheet).toBeVisible();
    await settle(page);
    const results = await probeTouchTargets(page, '.haru-sheet');
    record(results);
    expect(results.map((row) => row.name)).toContain('button · Not now');
    expect(failures(results)).toStrictEqual([]);
  });

  test('공지 슬롯 (4b `S4-H2`) — Dismiss', async ({ page }) => {
    await page.clock.install();
    await startSession(page, 'recorder:web-background-warning');
    await recordUntilNotice(page);
    const results = await probeTouchTargets(page, '.haru-session__notice');
    record(results);
    expect(results.map((row) => row.name)).toContain('button · Dismiss');
    expect(failures(results)).toStrictEqual([]);
  });

  test('완료 화면 (4b `S4-H1`) — 닫기', async ({ page }) => {
    await page.clock.install();
    await startSession(page);
    await submitToComplete(page);
    // Stage 5: 완료 화면 아래에 회고 카드가 들어왔다 — 카드의 터치 타깃은 `reflection-card.spec.ts` 가 따로 잰다.
    // 여기 범위는 Stage 4 완료 화면(카드 밖) 그대로다.
    const results = await probeTouchTargets(
      page,
      '.haru-session-complete > :not(.haru-reflection-card)',
    );
    record(results);
    expect(results.map((row) => row.name)).toContain('button · Close session');
    expect(failures(results)).toStrictEqual([]);
  });

  test('조회 실패 (4b `D4-99`) — Try again · Back to Home', async ({ page }) => {
    await logInToHome(page, 'sessions.getDetail:error');
    await page.evaluate(() => {
      window.history.pushState({}, '', '/session/00000000-0000-4000-8000-000000000000');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(page.getByRole('button', { name: 'Back to Home' })).toBeVisible();
    await settle(page);
    const results = await probeTouchTargets(page, SESSION);
    record(results);
    expect(results.map((row) => row.name)).toEqual(
      expect.arrayContaining(['button · Try again', 'button · Back to Home']),
    );
    expect(failures(results)).toStrictEqual([]);
  });

  test('7일 배너 (4b `S4-H3`, Home) — Dismiss', async ({ page }) => {
    await logInToHome(page, 'recorder:local-retention-notice');
    const banner = page.locator('.haru-app-shell__bar-top .haru-alert--banner');
    await expect(banner).toBeVisible();
    await settle(page);
    const results = await probeTouchTargets(page, '.haru-app-shell__bar-top .haru-alert--banner');
    record(results);
    expect(results.map((row) => row.name)).toContain('button · Dismiss');
    expect(failures(results)).toStrictEqual([]);
  });

  for (const width of [393, 320] as const) {
    test(`48h Toast (4b \`S4-H3\`) ${String(width)} — Try again · Dismiss`, async ({ page }) => {
      await page.setViewportSize({ width, height: 852 });
      await gotoApp(page, '/auth/log-in?scenario=recordings%3Aupload-stalled-48h');
      const toast = page.locator('.haru-toast');
      await expect(toast).toBeVisible();
      await settle(page);
      const results = await probeTouchTargets(page, '.haru-toast');
      record(results);
      expect(results.map((row) => row.name)).toEqual(
        expect.arrayContaining(['button · Try again', 'button · Dismiss']),
      );
      expect(failures(results)).toStrictEqual([]);
    });
  }
});

/* ===== AC-4-98 — reduce 에서 무한·이동 모션 0 ================================================= */

interface RunningMotion {
  name: string;
  target: string;
  infinite: boolean;
  moves: boolean;
}

async function runningMotions(page: Page): Promise<RunningMotion[]> {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => animation.playState === 'running')
      .map((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        const frames = effect?.getKeyframes() ?? [];
        const moves = frames.some((frame) =>
          ['transform', 'translate', 'scale', 'rotate'].some((property) => {
            const value = (frame as Record<string, unknown>)[property];
            return typeof value === 'string' && value !== 'none' && value !== '';
          }),
        );
        const target = effect?.target;
        return {
          name:
            (animation as CSSAnimation).animationName ??
            (animation as CSSTransition).transitionProperty ??
            'unknown',
          target: target instanceof Element ? target.className.toString() : '',
          infinite: effect?.getComputedTiming().iterations === Infinity,
          moves,
        };
      }),
  );
}

test.describe('AC-4-98 — `prefers-reduced-motion: reduce` 에서 무한 · 이동 모션 0 (런타임)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('ready → recording(+팝업 · 공지 슬롯) → paused → Drawer → 완료: 매 상태 0', async ({
    page,
  }) => {
    const seen: Record<string, RunningMotion[]> = {};
    await page.clock.install();
    await startSession(page, 'recorder:web-background-warning');
    seen['ready'] = await runningMotions(page);
    await recordUntilNotice(page);
    seen['recording+notice'] = await runningMotions(page);
    await page.clock.resume();
    await openPopup(page);
    seen['recording+popup'] = await runningMotions(page);
    await page.getByRole('button', { name: 'Pause recording' }).click();
    await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
    seen['paused'] = await runningMotions(page);
    await page.getByRole('button', { name: 'Resume recording' }).click();
    await openDrawer(page);
    seen['drawer'] = await runningMotions(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('.haru-scrim')).toHaveCount(0);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
    seen['complete+toast'] = await runningMotions(page);
    test.info().annotations.push({ type: 'motions', description: JSON.stringify(seen) });

    for (const [state, motions] of Object.entries(seen)) {
      expect(
        motions.filter((motion) => motion.infinite || motion.moves),
        state,
      ).toStrictEqual([]);
    }
  });

  test('no-preference 대조 — 같은 측정이 recording 의 링 breathing 을 잡는다 (프로브가 실제로 문다)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await startSession(page);
    await startRecording(page);
    const motions = await runningMotions(page);
    expect(motions.filter((motion) => motion.infinite).map((motion) => motion.name)).toContain(
      'haru-session-breathing',
    );
  });
});

/* ===== AC-4-99 — 320 / 393 / 600 / 1024 ===================================================== */

interface LayoutProbe {
  column: { x: number; width: number };
  docOverflowX: number;
  viewportOverflowX: number;
  viewportOverflowY: number;
  outside: string[];
}

async function probeLayout(page: Page, selectors: readonly string[]): Promise<LayoutProbe> {
  return page.evaluate(
    ({ viewport, targets }) => {
      const column = document.querySelector('.haru-app-column');
      const shell = document.querySelector(viewport);
      if (column === null || shell === null) throw new Error('column / viewport 없음');
      const columnRect = column.getBoundingClientRect();
      const outside = targets.flatMap((selector) =>
        [...document.querySelectorAll(selector)]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return (
              rect.width > 0 &&
              (rect.left < columnRect.left - 0.5 || rect.right > columnRect.right + 0.5)
            );
          })
          .map(() => selector),
      );
      return {
        column: { x: columnRect.x, width: columnRect.width },
        docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        viewportOverflowX: shell.scrollWidth - shell.clientWidth,
        viewportOverflowY: shell.scrollHeight - shell.clientHeight,
        outside,
      };
    },
    { viewport: VIEWPORT, targets: selectors },
  );
}

const SESSION_PARTS = [
  '.haru-session__top-row .haru-icon-button',
  '.haru-session__medallion-ring',
  '.haru-record',
  '.haru-session-actions .haru-button',
  '.haru-session-bubble .haru-bubble',
  '.haru-session-prompts',
  '.haru-session-book-chip',
  '.haru-session-status',
] as const;

const COMPLETE_PARTS = [
  '.haru-session__top-row .haru-icon-button',
  '.haru-session-complete__ring',
  '.haru-attendance-sticker',
  '.haru-session-bubble--complete .haru-bubble',
] as const;

/** 개정 AC-4-99 ④ 의 세로 넘침 0 기준 높이 (`D5-15`). 이보다 낮으면 스크롤 허용. */
const NO_VERTICAL_SCROLL_MIN_HEIGHT = 852;

function expectColumn(probe: LayoutProbe, width: number, height: number, state: string): void {
  const column = Math.min(width, 480);
  expect(probe.column.width, `${state} 컬럼 폭`).toBe(column);
  const left = probe.column.x;
  const right = width - (probe.column.x + probe.column.width);
  expect(Math.abs(left - right), `${state} 가운데`).toBeLessThanOrEqual(0.5);
  expect(probe.docOverflowX, `${state} 문서 가로 넘침`).toBeLessThanOrEqual(0);
  expect(probe.viewportOverflowX, `${state} 뷰포트 가로 넘침`).toBe(0);
  expect(probe.outside, `${state} 컬럼 밖 요소`).toStrictEqual([]);
  /*
   * 세로 축 — 개정 AC-4-99 ④ (`D5-15`, 2026-11-11): 320/393/600/1024 × **852** 에서 `firstName` ≤ 40자
   * 기준 세로 넘침 0. **852 미만은 스크롤을 허용**한다 (예: 320×796 은 넘친다 — Stage 5 Spec §13.2 실측).
   * 그래서 단정은 852 이상 높이에서만 한다. 852 미만 크기(1024×768 등)를 추가해도 세로는 단정하지 않는다.
   * (`QA-5-005` 정리 — 이전 주석 "796 이상은 스크롤이 없다" 는 거짓 불변식이었다.)
   */
  if (height >= NO_VERTICAL_SCROLL_MIN_HEIGHT) {
    expect(probe.viewportOverflowY, `${state} 세로 넘침`).toBe(0);
  }
}

test.describe('AC-4-99 — 앱 컬럼 480 가운데 · 가로 넘침 0 · 요소 컬럼 안 (세션 · 완료)', () => {
  for (const { width, height } of [
    { width: 320, height: 852 },
    { width: 393, height: 852 },
    { width: 600, height: 852 },
    { width: 1024, height: 852 },
    { width: 1024, height: 768 },
  ] as const) {
    test(`${String(width)}×${String(height)} — ready · recording+팝업 · paused · 완료`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await startSession(page);
      expectColumn(await probeLayout(page, SESSION_PARTS), width, height, 'ready');
      await startRecording(page);
      await openPopup(page);
      expectColumn(await probeLayout(page, SESSION_PARTS), width, height, 'recording+popup');
      await page.getByRole('button', { name: 'Pause recording' }).click();
      await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
      expectColumn(await probeLayout(page, SESSION_PARTS), width, height, 'paused');
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
      await settle(page);
      expectColumn(await probeLayout(page, COMPLETE_PARTS), width, height, 'complete');
    });
  }
});

/* ===== AC-4-100 — computed overflow 목록 + 4b 신규 그림자 양축 프로브 =========================== */

async function overflowOwners(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const owners = new Set<string>();
    for (const element of document.querySelectorAll<HTMLElement>('body *')) {
      if (element.closest('.haru-dev-panel') !== null) continue;
      const style = getComputedStyle(element);
      if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
      if (element instanceof SVGElement || ['IMG', 'svg', 'VIDEO'].includes(element.tagName))
        continue;
      const own = (node: Element | null): string | null =>
        node === null
          ? null
          : ([...node.classList].find((name) => name.startsWith('haru-')) ?? null);
      const generic = ['haru-text', 'haru-visually-hidden'];
      const mine = own(element);
      const parent = element.parentElement?.closest('[class*="haru-"]') ?? null;
      const id = element.hasAttribute('data-app-shell-viewport')
        ? '[data-app-shell-viewport]'
        : mine !== null && generic.includes(mine)
          ? `.${own(parent) ?? '?'} .${mine}`
          : `.${mine ?? element.tagName}`;
      owners.add(`${id} ${style.overflowX}/${style.overflowY}`);
    }
    return [...owners].sort();
  });
}

test.describe('AC-4-100 — 세션 화면 computed `overflow` (`R-SHADOW-1` · `R-FIGMA-1` ④)', () => {
  test('393×852 · 393×700 · 320×568 — 상태별 overflow 박스 목록', async ({ page }) => {
    const seen: Record<string, string[]> = {};
    await page.clock.install();
    await startSession(page, 'recorder:web-background-warning');
    seen['852 ready'] = await overflowOwners(page);
    await recordUntilNotice(page);
    await page.clock.resume();
    await openPopup(page);
    seen['852 recording+popup+notice'] = await overflowOwners(page);
    await page.setViewportSize({ width: 393, height: 700 });
    await settle(page);
    seen['700 recording+popup'] = await overflowOwners(page);
    await page.setViewportSize({ width: 320, height: 568 });
    await settle(page);
    seen['568 recording+popup'] = await overflowOwners(page);
    await page.setViewportSize({ width: 393, height: 852 });
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
    await advanceUntilToastGone(page);
    await settle(page);
    seen['852 complete'] = await overflowOwners(page);
    test.info().annotations.push({ type: 'overflow', description: JSON.stringify(seen) });
    /*
     * 전부 근거가 있는 박스다 — 새 박스가 생기면 깨진다 (근거 주석 + 양축 프로브를 붙이고 여기에 더한다).
     *  - 뷰포트 auto/auto — `AppShell` Tailwind `overflow-y-auto`(`D4-82`) · 양축 프로브 `shadow.spec.ts` D4-82
     *  - `__list` auto — 짧은 세로 ③(`S4-K1`) · 양축 프로브 `shadow.spec.ts` S4-K1
     *  - 메달리온 hidden — 원형 이미지 crop(`entities/character`, Stage 3) · 안에 그림자 요소 없음
     *  - 책 칩 제목 · 스티커 제목/부제 · pill/버블 제목 `.haru-text` — 1줄 말줄임, 글자만
     *  - 하단 바 `.haru-visually-hidden` — 스크린리더 전용 사유 문구
     */
    const BASE = ['.haru-character-medallion hidden/hidden', '[data-app-shell-viewport] auto/auto'];
    const LIVE = [
      ...BASE,
      '.haru-prompt-pill .haru-text hidden/hidden',
      '.haru-session-actions .haru-visually-hidden hidden/hidden',
      '.haru-session-book-chip__title hidden/hidden',
    ];
    expect(seen).toStrictEqual({
      '852 ready': [
        '.haru-bubble__content .haru-text hidden/hidden',
        ...BASE,
        '.haru-prompt-pill .haru-text hidden/hidden',
        '.haru-session-actions .haru-visually-hidden hidden/hidden',
      ].sort(),
      '852 recording+popup+notice': [...LIVE].sort(),
      '700 recording+popup': [...LIVE, '.haru-session-prompts__list auto/auto'].sort(),
      '568 recording+popup': [...LIVE, '.haru-session-prompts__list auto/auto'].sort(),
      /*
       * Stage 5 `S5-B` 회고 카드 3건 + `D5-15` 제목 1건 (근거: `features/reflection/reflection.css` 머리 주석 · `e2e/reflection-card.spec.ts`
       * `R-SHADOW-1` 양축 프로브):
       *  - 카드 clip — Figma `91:691` `overflow: clip` 선언 그대로 (`Save` 그림자 8px 절단도 Figma 와 같다)
       *  - `.haru-text-input` clip — `<input>` UA 기본값, 그림자 없음
       *  - 카드 `.haru-visually-hidden` — SR 전용 문구 (`Save` 비활성 이유)
       *  - 제목 hidden — 2줄 말줄임 clamp (`D5-15` · `AD-S5-4`, Spec §13), 글자만 · 그림자 요소 없음
       *    (`e2e/reflection-title-overflow.spec.ts`)
       */
      '852 complete': [
        ...BASE,
        '.haru-attendance-sticker__message hidden/hidden',
        '.haru-attendance-sticker__title hidden/hidden',
        '.haru-reflection-card .haru-visually-hidden hidden/hidden',
        '.haru-reflection-card clip/clip',
        '.haru-reflection-card__title hidden/hidden',
        '.haru-text-input clip/clip',
      ].sort(),
    });
  });
});

/* 4b 신규 UI 그림자 — 박스 바로 아래 · 오른쪽 픽셀이 그림자를 지우면 달라지는지 (양축). */

const MIN_SHADOW_DELTA = 2;

function decodePixel(png: Buffer): [number, number, number] {
  let offset = 8;
  const idat: Buffer[] = [];
  let colorType = 6;
  while (offset + 8 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const body = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') colorType = body[9] ?? 6;
    if (type === 'IDAT') idat.push(body);
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  // 1×1 — 필터 바이트 다음 RGB(A). 필터 0/1/2/3/4 모두 첫 픽셀은 원값 (+0 기준)
  void colorType;
  return [raw[1] ?? 0, raw[2] ?? 0, raw[3] ?? 0];
}

async function pixel(page: Page, x: number, y: number): Promise<[number, number, number]> {
  return decodePixel(await page.screenshot({ clip: { x, y, width: 1, height: 1 } }));
}

async function shadowProbe(page: Page, target: Locator, selector: string) {
  const rect = await target.boundingBox();
  if (rect === null) throw new Error(`${selector} 없음`);
  const shadow = await target.evaluate((node) => getComputedStyle(node).boxShadow);
  const points = {
    below: { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height + 1) },
    right: { x: Math.round(rect.x + rect.width + 1), y: Math.round(rect.y + rect.height / 2) },
  };
  const before = {
    below: await pixel(page, points.below.x, points.below.y),
    right: await pixel(page, points.right.x, points.right.y),
  };
  await page.addStyleTag({ content: `${selector} { box-shadow: none !important; }` });
  await settle(page);
  const after = {
    below: await pixel(page, points.below.x, points.below.y),
    right: await pixel(page, points.right.x, points.right.y),
  };
  const delta = (a: number[], b: number[]) =>
    Math.max(...a.map((value, index) => Math.abs(value - (b[index] ?? 0))));
  return {
    shadow,
    rect,
    below: delta(before.below, after.below),
    right: delta(before.right, after.right),
  };
}

test.describe('AC-4-100 — 4b 신규 UI 그림자 양축 프로브', () => {
  test('공지 슬롯 (393×852 recording) — 세션 뷰포트(overflow-y auto) 안', async ({ page }) => {
    await page.clock.install();
    await startSession(page, 'recorder:web-background-warning');
    await recordUntilNotice(page);
    await page.clock.resume();
    const selector = '.haru-session__notice .haru-alert';
    const probe = await shadowProbe(page, page.locator(selector).first(), selector);
    test.info().annotations.push({ type: 'shadow', description: JSON.stringify(probe) });
    // drop shadow 0겹 → 자를 그림자가 없다 (`R-SHADOW-1` 비대상). 그림자를 더하면 이 단정이 깨져 프로브를 요구한다.
    expect(probe.shadow).toBe('none');
    expect(probe.rect.x).toBe(24);
    expect(probe.rect.width).toBe(345);
  });

  test('7일 배너 (Home 393×852)', async ({ page }) => {
    await logInToHome(page, 'recorder:local-retention-notice');
    const selector = '.haru-app-shell__bar-top .haru-alert--banner';
    await expect(page.locator(selector)).toBeVisible();
    await settle(page);
    const probe = await shadowProbe(page, page.locator(selector), selector);
    test.info().annotations.push({ type: 'shadow', description: JSON.stringify(probe) });
    expect(probe.shadow).toBe('none');
  });

  test('48h Toast (393×852)', async ({ page }) => {
    await gotoApp(page, '/auth/log-in?scenario=recordings%3Aupload-stalled-48h');
    const selector = '.haru-toast';
    await expect(page.locator(selector)).toBeVisible();
    await settle(page);
    const probe = await shadowProbe(page, page.locator(selector), selector);
    test.info().annotations.push({ type: 'shadow', description: JSON.stringify(probe) });
    // `--shadow-glass-rest` 계열 — fixed portal 이라 overflow 박스 밖이다. 아래 · 오른쪽 모두 번짐이 보인다.
    expect(probe.shadow).toContain('28px 56px');
    expect(probe.below).toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
    expect(probe.right).toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
  });
});
