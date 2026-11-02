/**
 * Stage 4b `S4-F2` — recording `298:1262` · paused `298:1340` (4b Spec §2.1~§2.5 · Plan §13).
 *
 * **Mock + MockRecorderAdapter** 위에서 녹음 시작 → 경과 시간 증가 → 일시정지 → 재개 → `Submit` / `Discard`
 * 전 흐름을 실제 브라우저로 간다 (dev 서버 = `mock` 모드 — 녹음기·저장소가 Mock 이다). jsdom 이 계산하지
 * 않는 것만 여기서 본다 — 기하 · computed 스타일 · 로컬 전환 시간 · 시각 baseline. 단위 증거(요청 순서 ·
 * 로컬 2시점 측정 · 다이얼로그 키보드)는 `apps/web/__tests__/session-recording.test.tsx` 가 갖는다.
 *
 * 좌표 규칙: **Web y = Figma y − 56** (상태바는 OS 영역). Record · 바는 화면 아래에 앵커된다.
 *
 * `R-BASELINE-1`: 세션 화면은 클라이언트 이동으로 들어온다 → `startSession()` 이 이미지 디코드 + settle.
 * 시간 숫자는 **주입 시계**로 고정한다 — `page.clock` 을 녹음 시작 직후 멈추고(`pauseAt`) 204초를 한 번에
 * 넘긴다(`fastForward`) → `03:24`(시안 값). 멈춘 시계에서는 rAF 가 돌지 않으므로 `settle()` 대신
 * `runFor` 로 프레임을 진행시킨다 (다음 1초 tick 경계는 넘지 않는다). dev 패널은 `hideDevPanel`.
 */
import { expect, test, type Page } from '@playwright/test';

import { FRAME_SNAPSHOT, REGION_SNAPSHOT } from '../playwright.config';
import { demo, GALLERY, gotoStable, hideDevPanel } from './support/gallery';
import { requestOperations, requestPayloads, startSession } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const TRANSITIONS = 'POST /v1/sessions/:sessionId/transitions';

/**
 * computed 색 문자열 — Figma 선언값과 대조한다 (`R-FIGMA-1` ①). 화면 코드가 아니라 **기대값**이다.
 * fg-primary `#4a5f5c` · fg-secondary `#7d9291` · teal `#85bfb6` · gray-2 `#aeaeb2` · glass white 74%.
 */
const cssColor = (fn: 'rgb' | 'rgba', channels: readonly number[]) =>
  `${fn}(${channels.join(', ')})`;
const css = {
  rgb: (r: number, g: number, b: number) => cssColor('rgb', [r, g, b]),
  rgba: (r: number, g: number, b: number, a: number) => cssColor('rgba', [r, g, b, a]),
};
const PRIMARY = css.rgb(74, 95, 92);
const SECONDARY = css.rgb(125, 146, 145);
const TEAL = css.rgb(133, 191, 182);
const GRAY_2 = css.rgb(174, 174, 178);
const GLASS = css.rgba(255, 255, 255, 0.74);
const TRANSPARENT = css.rgba(0, 0, 0, 0);

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

async function transitionTargets(page: Page): Promise<unknown[]> {
  const payloads = await requestPayloads(page, TRANSITIONS);
  return payloads.map((payload) => (payload as { to?: unknown }).to);
}

async function startRecording(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
}

/**
 * 시계를 **녹음 시작 전에** 멈춘 뒤 녹음을 시작하고 `seconds` 를 한 번에 넘긴다 — 녹음 구간 시작 시각 =
 * 멈춘 시각이므로 tick 1회가 정확히 `seconds` 를 그린다 (`03:24`). 이 뒤에는 시계가 흐르지 않는다
 * (rAF 도 멈춘다 — `frames()` 로 진행). `pauseAt` 은 과거 시각을 거절하므로 가까운 미래로 재시도한다
 * (부하가 걸린 전체 실행에서 `now + 1` 이 이미 지나간 사례 — F2-5).
 */
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
  await frames(page);
}

async function frames(page: Page): Promise<void> {
  await page.clock.runFor(100);
}

test.describe('recording 기하 — Figma `298:1262` (393×852)', () => {
  test('상단 줄(칩 · 닫기) · 책 칩 · 상태 블록 · Record · 바가 Figma 좌표에 놓인다 (AC-4-125)', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);

    const chip = await box(page, '.haru-session__top-row .haru-button--sm');
    expect({ x: chip.x, y: chip.y, height: chip.height }).toEqual({ x: 24, y: 10, height: 36 }); // Figma (24, 66)
    expect(Math.abs(chip.width - 117)).toBeLessThanOrEqual(3); // 글리프 폭 — 렌더 폰트 의존
    const close = await box(page, '.haru-session__top-row .haru-icon-button');
    expect(close).toEqual({ x: 331, y: 10, width: 38, height: 38 });

    const book = await box(page, '.haru-session-book-chip');
    expect(book.y).toBe(281); // Figma 337
    expect(book.height).toBe(40);
    expect(book.x + book.width / 2).toBeCloseTo(196.5, 0); // 가운데 (`AD-S4-13`)

    const status = await box(page, '.haru-session-status');
    expect(status.y).toBe(344); // Figma 400 = 책 칩 bottom + 23
    expect(status.height).toBe(111); // 32 + 10 + 41 + 10 + 18
    expect(status.x + status.width / 2).toBeCloseTo(196.5, 0);
    const pill = await box(page, '.haru-session-status__pill');
    expect(pill.height).toBe(32);
    const time = await box(page, '.haru-session-status__time');
    expect({ y: time.y, height: time.height }).toEqual({ y: 386, height: 41 });

    const record = await box(page, '.haru-record');
    expect(record).toEqual({ x: 121.5, y: 621, width: 150, height: 150 });
    const bar = await box(page, '.haru-session-actions');
    expect(bar).toEqual({ x: 57, y: 789, width: 279, height: 45 });
  });

  test('선언값 (`R-FIGMA-1` — computed): 칩 · 책 칩 · pill · 시간 · 보조 줄', async ({ page }) => {
    await startSession(page);
    await startRecording(page);
    const styles = await page.evaluate(() => {
      const pick = (selector: string, keys: readonly string[]) => {
        const node = document.querySelector(selector);
        if (node === null) return null;
        const style = getComputedStyle(node);
        return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key)]));
      };
      return {
        chip: pick('.haru-session__top-row .haru-button--sm', [
          'padding-left',
          'padding-right',
          'border-radius',
          'background-color',
          'color',
          'font-size',
          'font-weight',
        ]),
        chipIcon: pick('.haru-session__top-row .haru-button--sm .haru-icon', ['width', 'height']),
        chipStroke: pick('.haru-session__top-row .haru-button--sm svg', ['stroke-width']),
        book: pick('.haru-session-book-chip', ['padding-left', 'background-color', 'box-shadow']),
        cover: pick('.haru-session-book-chip__cover', ['width', 'height', 'border-radius']),
        bookTitle: pick('.haru-session-book-chip__title', ['font-size', 'font-weight', 'color']),
        pill: pick('.haru-session-status__pill', [
          'background-color',
          'box-shadow',
          'padding-left',
        ]),
        dot: pick('.haru-session-status__dot', ['width', 'background-color']),
        time: pick('.haru-session-status__time', [
          'font-size',
          'line-height',
          'font-weight',
          'color',
          'font-variant-numeric',
        ]),
        hint: pick('.haru-session-status__hint', ['font-size', 'line-height', 'color']),
      };
    });
    expect(styles.chip).toMatchObject({
      'padding-left': '14px',
      'padding-right': '16px',
      'background-color': GLASS,
      color: PRIMARY,
      'font-size': '15px',
      'font-weight': '590',
    });
    expect(styles.chipIcon).toEqual({ width: '18px', height: '18px' });
    expect(styles.chipStroke).toEqual({ 'stroke-width': '2px' });
    expect(styles.book).toMatchObject({
      'padding-left': '15px',
      'background-color': GLASS,
    });
    expect(styles.book?.['box-shadow']).toContain('0px 6px 4px 0px');
    expect(styles.cover).toEqual({ width: '16px', height: '22px', 'border-radius': '3px' });
    expect(styles.bookTitle).toMatchObject({
      'font-size': '13px',
      'font-weight': '590',
      color: PRIMARY,
    });
    expect(styles.pill).toEqual({
      'background-color': GLASS,
      'box-shadow': 'none',
      'padding-left': '14px',
    });
    expect(styles.dot).toEqual({ width: '8px', 'background-color': TEAL });
    expect(styles.time).toEqual({
      'font-size': '48px',
      'line-height': '41px',
      'font-weight': '700',
      color: PRIMARY,
      'font-variant-numeric': 'tabular-nums',
    });
    expect(styles.hint).toEqual({
      'font-size': '13px',
      'line-height': '18px',
      color: SECONDARY,
    });
  });

  test('칩 터치 타깃 = 세로 44 (`::before` −4) · 확장 영역이 메달리온 링(76)과 겹치지 않는다', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    const hit = await page.evaluate(() => {
      const chip = document.querySelector('.haru-session__top-row .haru-button--sm');
      if (chip === null) return null;
      const rect = chip.getBoundingClientRect();
      const before = getComputedStyle(chip, '::before');
      const top = rect.top + Number.parseFloat(before.top);
      const bottom = rect.bottom - Number.parseFloat(before.bottom);
      return { top, bottom, height: bottom - top };
    });
    expect(hit).toEqual({ top: 6, bottom: 50, height: 44 });
  });
});

test.describe('paused — Figma `298:1340` (AC-4-42 · 127 · 128)', () => {
  test('같은 y · paused 문구 · 빈 dot · 시간 secondary · Record = `Tap to resume` · 책 칩 가운데', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await page.getByRole('button', { name: 'Pause recording' }).click();
    await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();

    expect((await box(page, '.haru-session-status')).y).toBe(344);
    expect((await box(page, '.haru-session-book-chip')).y).toBe(281);
    const book = await box(page, '.haru-session-book-chip');
    expect(book.x + book.width / 2).toBeCloseTo(196.5, 0); // Figma x80 + 233/2
    await expect(page.locator('.haru-session-status__label')).toHaveText('Paused');
    await expect(page.locator('.haru-session-status__hint')).toHaveText(
      'Tap the button to keep recording',
    );
    await expect(page.locator('.haru-record__caption')).toHaveText('Tap to resume');
    const dot = await page.locator('.haru-session-status__dot').evaluate((node) => {
      const style = getComputedStyle(node);
      return { background: style.backgroundColor, stroke: style.boxShadow };
    });
    expect(dot).toEqual({
      background: TRANSPARENT,
      stroke: `${SECONDARY} 0px 0px 0px 1.5px inset`,
    });
    const timeColor = await page
      .locator('.haru-session-status__time')
      .evaluate((node) => getComputedStyle(node).color);
    expect(timeColor).toBe(SECONDARY);
    // 별도 Resume 버튼 0 — 재개 수단은 Record Control 하나 (`D4-51`)
    await expect(page.getByRole('button', { name: /^Resume$/ })).toHaveCount(0);
  });
});

test.describe('전 흐름 — 녹음 → 시간 증가 → 일시정지 → 재개 → Submit / Discard (Mock · MockRecorderAdapter)', () => {
  test('Submit: 전이 recording · paused · recording · completed(user_done) · Toast · 완료 경로', async ({
    page,
  }) => {
    const sessionId = await startSession(page);
    await startRecording(page);
    // 실제 시계 — 경과 시간이 오른다
    await expect(page.getByRole('timer')).toHaveText('00:02', { timeout: 5_000 });

    await page.getByRole('button', { name: 'Pause recording' }).click();
    await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
    const frozen = await page.getByRole('timer').textContent();
    await page.waitForTimeout(1_500); // paused 동안 시간 고정 (AC-4-43 화면)
    await expect(page.getByRole('timer')).toHaveText(frozen ?? '');

    await page.getByRole('button', { name: 'Resume recording' }).click();
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/complete$`));
    await expect(page.getByRole('status').filter({ hasText: 'Recording submitted' })).toBeVisible();
    await expect
      .poll(async () => transitionTargets(page))
      .toEqual(['recording', 'paused', 'recording', 'completed']);
    const payloads = await requestPayloads(page, TRANSITIONS);
    expect(payloads.at(-1)).toMatchObject({ to: 'completed', completedReason: 'user_done' });
  });

  test('Discard: 다이얼로그 → 취소(요청 0) → 다시 → 확인 → abandoned 1건 → `/` · Toast 0', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    await page.getByRole('button', { name: 'Discard' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Discard this recording?' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Keep recording' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Discard' })).toBeFocused();
    expect(await transitionTargets(page)).toEqual(['recording']);

    await page.getByRole('button', { name: 'Discard' }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Discard', exact: true })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(async () => transitionTargets(page)).toEqual(['recording', 'abandoned']);
    expect(await requestOperations(page)).not.toContain('POST /v1/recordings');
    await expect(page.getByText('Recording submitted')).toHaveCount(0);
  });

  test('닫기(recording) = 같은 다이얼로그 · 취소 → 포커스 닫기 (`D4-56`, AC-4-129)', async ({
    page,
  }) => {
    await startSession(page);
    await startRecording(page);
    const close = page.getByRole('button', { name: 'Close session' });
    await close.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alertdialog', { name: 'Discard this recording?' })).toBeVisible();
    await page.getByRole('button', { name: 'Keep recording' }).click();
    await expect(close).toBeFocused();
    expect(await transitionTargets(page)).toEqual(['recording']);
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  });

  test('AC-4-51 — 상태 전환(로컬) ≤ 1s: 시작 · 일시정지 · 재개', async ({ page }) => {
    await startSession(page);
    const measure = (from: string, to: string) =>
      page.evaluate(
        ([fromLabel, toLabel]) =>
          new Promise<number>((resolve, reject) => {
            const button = document.querySelector<HTMLButtonElement>(
              `.haru-record[aria-label="${fromLabel}"]`,
            );
            if (button === null) {
              reject(new Error(`no ${fromLabel}`));
              return;
            }
            const observer = new MutationObserver(() => {
              if (button.getAttribute('aria-label') === toLabel) {
                observer.disconnect();
                resolve(performance.now() - started);
              }
            });
            observer.observe(button, { attributes: true });
            const started = performance.now();
            button.click();
          }),
        [from, to] as const,
      );
    const start = await measure('Start recording', 'Pause recording');
    const pause = await measure('Pause recording', 'Resume recording');
    const resume = await measure('Resume recording', 'Pause recording');
    for (const elapsed of [start, pause, resume]) expect(elapsed).toBeLessThanOrEqual(1_000);
    test.info().annotations.push({
      type: 'AC-4-51',
      description: `start ${start.toFixed(0)}ms · pause ${pause.toFixed(0)}ms · resume ${resume.toFixed(0)}ms (Chromium · Mock)`,
    });
  });
});

test.describe('모션 배분 (4b Spec §6 · Stage 4 Spec §6.3) — recording = 메달리온 링 breathing 하나', () => {
  test('no-preference: recording 에서만 링 breathing · Record 링·dot 정지 / paused 모션 0 / reduce 면 0', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await startSession(page);
    await startRecording(page);
    const animations = () =>
      page.evaluate(() => {
        const name = (selector: string) => {
          const node = document.querySelector(selector);
          return node === null ? null : getComputedStyle(node).animationName;
        };
        return {
          ring: name('.haru-session__medallion-ring'),
          recordOuter: name('.haru-record__ring--outer'),
          dot: name('.haru-session-status__dot'),
        };
      });
    expect(await animations()).toEqual({
      ring: 'haru-session-breathing',
      recordOuter: 'none',
      dot: 'none',
    });
    await page.getByRole('button', { name: 'Pause recording' }).click();
    await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
    expect(await animations()).toEqual({ ring: 'none', recordOuter: 'none', dot: 'none' });
    await page.getByRole('button', { name: 'Resume recording' }).click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect((await animations()).ring).toBe('none');
  });
});

test.describe('책 칩 예외 (AC-4-126, `session:book-*`)', () => {
  test('`book-missing` → 칩 0 · 상태 블록 y 불변(344)', async ({ page }) => {
    await startSession(page, 'session:book-missing');
    await startRecording(page);
    await expect(page.locator('.haru-session-book-chip')).toHaveCount(0);
    expect((await box(page, '.haru-session-status')).y).toBe(344);
  });

  for (const width of [320, 393] as const) {
    test(`${width}px — \`book-long-title\` → 1줄 말줄임 · 컬럼 안 · 높이 40`, async ({ page }) => {
      await page.setViewportSize({ width, height: 852 });
      await startSession(page, 'session:book-long-title');
      await startRecording(page);
      const chip = await box(page, '.haru-session-book-chip');
      expect(chip.height).toBe(40);
      expect(chip.x).toBeGreaterThanOrEqual(24);
      expect(chip.x + chip.width).toBeLessThanOrEqual(width - 24);
      const overflow = await page.locator('.haru-session-book-chip__title').evaluate((node) => ({
        clipped: node.scrollWidth > node.clientWidth,
        ellipsis: getComputedStyle(node).textOverflow,
      }));
      expect(overflow).toEqual({ clipped: true, ellipsis: 'ellipsis' });
    });
  }
});

test.describe('recording · paused 시각 baseline — Figma `298:1262` · `298:1340`', () => {
  test('s4-session-recording — 393×852 · `03:24`', async ({ page }) => {
    await page.clock.install();
    await startSession(page);
    await recordFrozen(page, 204);
    await expect(page.getByRole('timer')).toHaveText('03:24');
    await expect(page).toHaveScreenshot('s4-session-recording.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });

  test('s4-session-paused — 393×852 · `03:24`', async ({ page }) => {
    await page.clock.install();
    await startSession(page);
    await recordFrozen(page, 204);
    await page.getByRole('button', { name: 'Pause recording' }).click();
    await frames(page);
    await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
    await expect(page.getByRole('timer')).toHaveText('03:24');
    await frames(page);
    await expect(page).toHaveScreenshot('s4-session-paused.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });

  test('s4-session-recording-320 — 320×852 (칩 · 닫기 · 책 칩 컬럼 안)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 852 });
    await page.clock.install();
    await startSession(page);
    await recordFrozen(page, 204);
    await expect(page.getByRole('timer')).toHaveText('03:24');
    await expect(page).toHaveScreenshot('s4-session-recording-320.png', {
      fullPage: false,
      ...FRAME_SNAPSHOT,
    });
  });

  test('s4-session-discard-dialog — recording 위 확인 다이얼로그 (명세, Figma 없음 — `AD-S4-4`·`AD-S4-15`)', async ({
    page,
  }) => {
    await page.clock.install();
    await startSession(page);
    await recordFrozen(page, 204);
    await page.getByRole('button', { name: 'Close session' }).click();
    await frames(page);
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await page.clock.runFor(500); // 다이얼로그 등장 모션(reduce = fade) 완료
    await expect(dialog).toHaveScreenshot('s4-session-discard-dialog.png', REGION_SNAPSHOT);
  });
});

/**
 * dev gallery 의 sticky 상단 내비게이션(`.haru-dev-nav`)은 영역 클립이 뷰포트 위로 스크롤될 때 블록 위를
 * 덮는다 — dev 전용 UI 이므로 baseline 에 담지 않는다 (`R-BASELINE-1` ②, `visibility` 로 가린다).
 */
async function hideDevNav(page: Page): Promise<void> {
  await page.addStyleTag({ content: '.haru-dev-nav { visibility: hidden !important; }' });
}

test.describe('RecordControl 5변형 · Button sm — dev gallery (AC-4-138)', () => {
  test('s4-record-control — idle · recording · paused · disabled · permission-denied', async ({
    page,
  }) => {
    await gotoStable(page, GALLERY.components);
    await hideDevNav(page);
    const block = demo(page, 's4-record-control');
    const computed = await block.locator('.haru-record').evaluateAll((nodes) =>
      nodes.map((node) => {
        const core = node.querySelector('.haru-record__core');
        const ring = node.querySelector('.haru-record__ring--outer');
        return {
          label: node.getAttribute('aria-label'),
          disabled: node.getAttribute('aria-disabled'),
          opacity: getComputedStyle(node).opacity,
          core: core === null ? null : getComputedStyle(core).backgroundColor,
          coreShadow: core === null ? null : getComputedStyle(core).boxShadow !== 'none',
          ring: ring === null ? null : getComputedStyle(ring).borderTopColor,
          caption: node.querySelector('.haru-record__caption')?.textContent ?? null,
        };
      }),
    );
    const teal = TEAL;
    const gray2 = GRAY_2;
    expect(computed).toEqual([
      {
        label: 'Start recording',
        disabled: null,
        opacity: '1',
        core: teal,
        coreShadow: true,
        ring: teal,
        caption: 'Tap to recording',
      },
      {
        label: 'Pause recording',
        disabled: null,
        opacity: '1',
        core: teal,
        coreShadow: true,
        ring: teal,
        caption: null,
      },
      {
        label: 'Resume recording',
        disabled: null,
        opacity: '1',
        core: teal,
        coreShadow: true,
        ring: teal,
        caption: 'Tap to resume',
      },
      {
        label: 'Start recording',
        disabled: 'true',
        opacity: '0.5',
        core: teal,
        coreShadow: false,
        ring: teal,
        caption: 'Tap to recording',
      },
      {
        label: 'Microphone is off',
        disabled: null,
        opacity: '1',
        core: gray2,
        coreShadow: true,
        ring: gray2,
        caption: 'Mic is off',
      },
    ]);
    await expect(block).toHaveScreenshot('s4-record-control.png', REGION_SNAPSHOT);
  });

  test('s4-button-sm — Prompts 칩', async ({ page }) => {
    await gotoStable(page, GALLERY.components);
    await hideDevNav(page);
    await expect(demo(page, 's4-button-sm')).toHaveScreenshot('s4-button-sm.png', REGION_SNAPSHOT);
  });
});
