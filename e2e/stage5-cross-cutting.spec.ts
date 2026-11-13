/**
 * Stage 5 `S5-D` 횡단 검증 — 회고 카드(완료 화면 하단) · 피드백 화면 (Plan §12 `S5-D`, AC-5-44 · 46 · 49).
 *
 * 화면별 spec(`reflection-card.spec.ts` · `session-feedback.spec.ts`)이 기하·상태·폴링·반응형을 갖는다. 여기서는
 * 두 화면을 **가로질러** 보는 것만 둔다:
 *  - copy: 렌더된 DOM 에 금칙어 0 (모든 Stage 5 상태)
 *  - privacy: 브라우저 콘솔 · pageerror 에 note · 피드백 문구 · 아이 이름 0 (제출 실패 · 오프라인 · 서버 완료 전 경로)
 *  - 접근성: 포커스 순서 (Spec §9.1) · 피드백 화면 터치 타깃 · `prefers-reduced-motion` · 대비 픽셀 프로브 (Spec §9.2)
 *
 * 대비는 **computed 글자색**과 **글자를 지운 뒤 찍은 면 색(중앙값)**으로 잰다 — 글리프 픽셀은 안티앨리어싱 혼합이라
 * 실제보다 낮게 나온다 (`week-summary-chip.spec.ts` 선례). 측정값은 annotation 으로 남긴다.
 * `R-BASELINE-1`: 이 spec 은 baseline 을 만들지 않는다. dev 패널은 가린다.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

import { hideDevPanel, settle } from './support/gallery';
import { contrastRatio, decodePng, parseCssRgb, type Rgb } from './support/pixels';
import { logInToHome, settleImages } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

/** Mock 지난 세션 — `…0001` = `analyzed`(회고 카드 직접 진입) · `…0002` = `analyzing`(피드백 화면). */
const COMPLETE = '/session/77777777-7777-4777-8777-000000000001/complete';
const FEEDBACK = '/session/77777777-7777-4777-8777-000000000002/feedback';
const MISSING_FEEDBACK = '/session/99999999-9999-4999-8999-999999999999/feedback';
const CARD = '.haru-reflection-card';
const SLOT = '.haru-session-feedback__state';
const CHILD = 'Emma';
const NOTE = 'private-s5d-console-probe';
const FEEDBACK_TEXT = 'Today brought lots of feeling words, and a new one — proud.';
const NOTE_LABEL = 'Anything to talk about this time? (optional)';

const FORBIDDEN = /diagnos|delay|behind|normal|score|worse|better than|peers/i;

async function spaGoto(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function openCard(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await spaGoto(page, COMPLETE);
  await expect(
    page.getByRole('region', { name: `How was storytime with ${CHILD}?` }),
  ).toBeVisible();
  await settleImages(page);
}

async function openFeedback(page: Page, scenario?: string, path: string = FEEDBACK) {
  await logInToHome(page, scenario);
  await spaGoto(page, path);
  await expect(page.getByRole('heading', { level: 1, name: 'Storytime notes' })).toBeVisible();
}

/** 콘솔 · 처리되지 않은 오류를 모은다. */
function collectLogs(page: Page): string[] {
  const logs: string[] = [];
  page.on('console', (message) => logs.push(message.text()));
  page.on('pageerror', (error) =>
    logs.push(`${error.name}: ${error.message}\n${error.stack ?? ''}`),
  );
  return logs;
}

/* ===== copy (AC-5-44) ===================================================== */

const CARD_SCENARIOS = [undefined, 'session-completion:reflection-submitted'] as const;
const FEEDBACK_STATES: readonly { scenario?: string; path?: string; state: string }[] = [
  { scenario: 'analysis:analysis-pending', state: 'pending' },
  { scenario: 'analysis:analysis-completed', state: 'analyzed' },
  { scenario: 'analysis:analysis-low-quality', state: 'low-quality' },
  { scenario: 'analysis:analysis-failed', state: 'failed' },
  { scenario: 'analysis:analysis-not-available', state: 'not-available' },
  { scenario: 'analysis:recording-deleted', state: 'not-available' },
  { scenario: 'analysis:error', state: 'error' },
  { scenario: 'analysis:offline', state: 'offline' },
  { path: MISSING_FEEDBACK, state: 'not-found' },
];

test.describe('copy — 렌더된 문구에 진단·판정·비교 표현 0 (AC-5-44)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  for (const scenario of CARD_SCENARIOS) {
    test(`회고 카드 ${scenario ?? '기본'}`, async ({ page }) => {
      await openCard(page, scenario);
      const text = await page.locator(CARD).evaluate((card) => {
        const labels = [...card.querySelectorAll('[aria-label], [placeholder]')].flatMap((el) => [
          el.getAttribute('aria-label') ?? '',
          el.getAttribute('placeholder') ?? '',
        ]);
        return [card.textContent ?? '', ...labels].join('\n');
      });
      expect(text).not.toMatch(FORBIDDEN);
    });
  }

  test('회고 카드 Toast — 실패 · 오프라인 · 이미 저장됨 · 저장됨', async ({ page }) => {
    const toasts: string[] = [];
    for (const scenario of [
      'reflections:error',
      'reflections:offline',
      'reflections:reflection-already-submitted',
      'reflections:success',
    ]) {
      await openCard(page, scenario);
      await page.getByRole('radio', { name: '3 stars' }).click();
      await page.getByRole('button', { name: 'Save' }).click();
      const toast = page.locator('.haru-toast').last();
      await expect(toast).toBeVisible();
      toasts.push((await toast.textContent()) ?? '');
    }
    expect(toasts.filter((text) => text.trim().length > 0)).toHaveLength(4);
    expect(toasts.join('\n')).not.toMatch(FORBIDDEN);
  });

  for (const item of FEEDBACK_STATES) {
    test(`피드백 화면 ${item.scenario ?? item.path ?? ''} → ${item.state}`, async ({ page }) => {
      await openFeedback(page, item.scenario, item.path);
      await expect(page.locator(SLOT)).toHaveAttribute('data-state', item.state);
      const text = (await page.locator('.haru-session-feedback').textContent()) ?? '';
      expect(text.trim().length).toBeGreaterThan(0);
      expect(text).not.toMatch(FORBIDDEN);
      // 전사 · 지표 수치 0 (AC-5-45) — 화면 어디에도 숫자가 없다.
      expect(text).not.toMatch(/\d/);
    });
  }
});

/* ===== privacy — 콘솔 (AC-5-46) =========================================== */

test.describe('privacy — 콘솔 · pageerror 에 note · 아이 이름 · 피드백 문구 0 (AC-5-46)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  for (const scenario of [
    'reflections:error',
    'reflections:offline',
    'reflections:invalid-transition',
    'reflections:retry',
  ]) {
    test(`회고 제출 ${scenario} → 다시 누름`, async ({ page }) => {
      const logs = collectLogs(page);
      await openCard(page, scenario);
      const note = page.getByRole('textbox', { name: NOTE_LABEL });
      await note.fill(NOTE);
      const save = page.getByRole('button', { name: 'Save' });
      await save.click();
      await expect(page.locator('.haru-toast').last()).toBeVisible();
      await expect(note).toHaveValue(NOTE);
      // 두 번째 시도 — invalid-transition · retry 는 성공해 홈으로, error · offline 은 다시 실패한다.
      await save.click();
      await settle(page);
      const joined = logs.join('\n');
      expect(joined).not.toContain(NOTE);
      expect(joined).not.toContain(CHILD);
    });
  }

  test('피드백 화면 pending → analyzed 폴링 경로', async ({ page }) => {
    const logs = collectLogs(page);
    await page.clock.install();
    await openFeedback(page, 'analysis:analysis-pending-then-completed');
    await page.clock.runFor(31_000);
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'analyzed');
    await expect(page.locator(`${SLOT} .haru-bubble`)).toHaveText(FEEDBACK_TEXT);
    const joined = logs.join('\n');
    expect(joined).not.toContain(FEEDBACK_TEXT);
    expect(joined).not.toContain(CHILD);
  });
});

/* ===== 접근성 — 포커스 순서 (Spec §9.1, AC-5-49) ========================= */

async function tabSequence(page: Page, start: Locator, steps: number): Promise<string[]> {
  await start.focus();
  const names: string[] = [];
  for (let index = 0; index <= steps; index += 1) {
    if (index > 0) await page.keyboard.press('Tab');
    names.push(
      await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (element === null) return '(none)';
        const role = element.getAttribute('role') ?? element.tagName.toLowerCase();
        const name =
          element.getAttribute('aria-label') ??
          (element.textContent ?? '').trim() ??
          element.getAttribute('placeholder') ??
          '';
        return `${role}:${name}`;
      }),
    );
  }
  return names;
}

test.describe('접근성 — 포커스 순서 · 이름 (Spec §9.1, AC-5-49)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('회고 카드: 닫기 → 별(roving 1 정지) → 칩 5 → 입력 → Save', async ({ page }) => {
    await openCard(page);
    const close = page.getByRole('button', { name: 'Close session' });
    const order = await tabSequence(page, close, 8);
    expect(order).toEqual([
      'button:Close session',
      'radio:1 star',
      'button:Engaged',
      'button:Big feelings',
      'button:Ask Questions',
      'button:Stay Focus',
      'button:Tricky today',
      `input:${NOTE_LABEL}`,
      'button:Save',
    ]);
    // 이름: 카드 region = 제목 · 별 radiogroup · 칩 group 이름 = 제목 (Spec §9.1)
    await expect(page.getByRole('radiogroup')).toHaveCount(1);
    await expect(page.getByRole('group', { name: `How was storytime with ${CHILD}?` })).toHaveCount(
      1,
    );
    await expect(page.getByRole('button', { name: 'Save' })).toHaveAccessibleDescription(
      'Choose stars, a tag, or add a note to save.',
    );
  });

  test('피드백 화면 (error): 닫기 → Try again · 포커스 링이 보인다', async ({ page }) => {
    await openFeedback(page, 'analysis:error');
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'error');
    const close = page.getByRole('button', { name: 'Close', exact: true });
    const order = await tabSequence(page, close, 1);
    expect(order).toEqual(['button:Close', 'button:Try again']);
    const outline = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement;
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: style.outlineWidth, shadow: style.boxShadow };
    });
    expect(outline.style !== 'none' || outline.shadow !== 'none').toBe(true);
  });

  test('피드백 화면 (not-found): 닫기 → Go home', async ({ page }) => {
    await openFeedback(page, undefined, MISSING_FEEDBACK);
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'not-found');
    const order = await tabSequence(
      page,
      page.getByRole('button', { name: 'Close', exact: true }),
      1,
    );
    expect(order).toEqual(['button:Close', 'button:Go home']);
  });
});

/* ===== 접근성 — 피드백 화면 터치 타깃 ===================================== */

test.describe('접근성 — 피드백 화면 터치 타깃 44 (5점 hit-test)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  for (const item of [
    { scenario: 'analysis:error', path: FEEDBACK, state: 'error' },
    { scenario: undefined, path: MISSING_FEEDBACK, state: 'not-found' },
  ]) {
    test(`${item.state}: 닫기(시각 38 + hit 44) · 상태 버튼 미달 0`, async ({ page }) => {
      await openFeedback(page, item.scenario, item.path);
      await expect(page.locator(SLOT)).toHaveAttribute('data-state', item.state);
      await settleImages(page);
      const misses = await page.evaluate(() => {
        const half = 21.5;
        const root = document.querySelector('.haru-session-feedback');
        if (root === null) throw new Error('no screen');
        return [...root.querySelectorAll<HTMLElement>('button')].map((element) => {
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
          const name = element.getAttribute('aria-label') ?? (element.textContent ?? '').trim();
          const missed = points
            .filter(([, x, y]) => {
              const hit = document.elementFromPoint(x, y);
              return !(hit !== null && (hit === element || element.contains(hit)));
            })
            .map(([label]) => label);
          return `${name}:${missed.join('')}`;
        });
      });
      expect(misses).toEqual(['Close:', item.state === 'error' ? 'Try again:' : 'Go home:']);
    });
  }
});

/* ===== 접근성 — prefers-reduced-motion ===================================== */

test.describe('접근성 — prefers-reduced-motion: reduce (AC-5-49)', () => {
  test.use({ viewport: { width: 393, height: 852 }, reducedMotion: 'reduce' });

  test('피드백 버블 등장(play) 애니메이션 0 · 별 색 전환 0', async ({ page }) => {
    await page.clock.install();
    await openFeedback(page, 'analysis:analysis-pending-then-completed');
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'pending');
    await page.clock.runFor(31_000);
    await expect(page.locator(SLOT)).toHaveAttribute('data-state', 'analyzed');
    const animated = await page.evaluate(
      (slot) =>
        [...document.querySelectorAll(`${slot}, ${slot} *`)]
          .map((element) => getComputedStyle(element).animationName)
          .filter((name) => name !== 'none'),
      SLOT,
    );
    expect(animated).toEqual([]);
  });

  test('회고 카드 — 애니메이션 0 · 별 transition 0', async ({ page }) => {
    await openCard(page);
    const motion = await page.evaluate((card) => {
      const elements = [...document.querySelectorAll(`${card}, ${card} *`)];
      return {
        animations: elements
          .map((element) => getComputedStyle(element).animationName)
          .filter((name) => name !== 'none'),
        starTransitions: [
          ...document.querySelectorAll(`${card} [role="radio"], ${card} [role="radio"] *`),
        ]
          .map((element) => getComputedStyle(element).transitionDuration)
          .filter((duration) => duration.split(',').some((part) => parseFloat(part) > 0)),
      };
    }, CARD);
    expect(motion).toEqual({ animations: [], starTransitions: [] });
  });
});

/* ===== 접근성 — 대비 픽셀 프로브 (Spec §9.2, AC-5-49) ===================== */

const INK_OFF_STYLE =
  '.e2e-ink-off, .e2e-ink-off *, .e2e-ink-off::placeholder {' +
  ' color: transparent !important; -webkit-text-fill-color: transparent !important;' +
  ' text-shadow: none !important; }';

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function composite(fg: string, bg: Rgb): Rgb {
  const parts = fg.match(/-?[\d.]+/g) ?? [];
  const alpha = parts.length >= 4 ? Number(parts[3]) : 1;
  const ink = parseCssRgb(fg);
  return {
    r: Math.round(ink.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(ink.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(ink.b * alpha + bg.b * (1 - alpha)),
  };
}

/** 글자색(computed) ↔ 글자를 지운 면(중앙값) 대비. `placeholder` 면 `::placeholder` 색을 쓴다. */
async function measureContrast(
  page: Page,
  target: Locator,
  options: { placeholder?: boolean } = {},
): Promise<number> {
  await target.scrollIntoViewIfNeeded();
  const fg = await target.evaluate(
    (element, placeholder) => getComputedStyle(element, placeholder ? '::placeholder' : null).color,
    options.placeholder === true,
  );
  await page.evaluate((css) => {
    if (document.querySelector('style[data-e2e="ink-off"]') !== null) return;
    const style = document.createElement('style');
    style.setAttribute('data-e2e', 'ink-off');
    style.textContent = css;
    document.head.append(style);
  }, INK_OFF_STYLE);
  await target.evaluate((element) => element.classList.add('e2e-ink-off'));
  // 누름·선택 전환(transition)이 끝난 면을 잰다 — 중간 프레임이면 면 색이 섞인다.
  await target.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations({ subtree: true }).map((animation) => animation.finished),
    );
  });
  await settle(page);
  const box = await target.boundingBox();
  if (box === null) throw new Error('no box');
  const inset = 3;
  const png = await page.screenshot({
    clip: {
      x: box.x + inset,
      y: box.y + inset,
      width: Math.max(1, box.width - inset * 2),
      height: Math.max(1, box.height - inset * 2),
    },
  });
  await target.evaluate((element) => element.classList.remove('e2e-ink-off'));
  const image = decodePng(png);
  const r: number[] = [];
  const g: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < image.data.length; i += 4) {
    r.push(image.data[i] ?? 0);
    g.push(image.data[i + 1] ?? 0);
    b.push(image.data[i + 2] ?? 0);
  }
  const surface = { r: median(r), g: median(g), b: median(b) };
  return contrastRatio(composite(fg, surface), surface);
}

test.describe('접근성 — 대비 (Spec §9.2 · 가값 P-28 · 수용 예외 D-01)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('회고 카드: 제목 · 칩 미선택 라벨 AA · placeholder = P-28 범위 · Save 흰 라벨 = D-01', async ({
    page,
  }) => {
    await openCard(page);
    const card = page.locator(CARD);
    const title = await measureContrast(page, card.locator('.haru-reflection-card__title'));
    const chip = await measureContrast(page, card.getByRole('button', { name: 'Engaged' }));
    const placeholder = await measureContrast(
      page,
      card.getByRole('textbox', { name: NOTE_LABEL }),
      {
        placeholder: true,
      },
    );
    await card.getByRole('radio', { name: '3 stars' }).click();
    await card.getByRole('button', { name: 'Engaged' }).click();
    const chipSelected = await measureContrast(page, card.getByRole('button', { name: 'Engaged' }));
    const save = await measureContrast(page, card.getByRole('button', { name: 'Save' }));
    test.info().annotations.push({
      type: 'contrast',
      description: JSON.stringify({ title, chip, placeholder, chipSelected, save }),
    });
    expect(title).toBeGreaterThanOrEqual(4.5);
    expect(chip).toBeGreaterThanOrEqual(4.5);
    // P-28 (Spec §9.2 계산 2.28~2.35) — 가값. 이 범위를 벗어나면 가값 기록을 다시 봐야 한다.
    expect(placeholder).toBeGreaterThan(2.0);
    expect(placeholder).toBeLessThan(2.7);
    // D-01 (Accent 흰 라벨 2.07) — 칩 선택 · Save
    expect(chipSelected).toBeCloseTo(2.07, 1);
    expect(save).toBeCloseTo(2.07, 1);
  });

  for (const item of [
    { scenario: 'analysis:analysis-pending', state: 'pending' },
    { scenario: 'analysis:analysis-low-quality', state: 'low-quality' },
    { scenario: 'analysis:error', state: 'error' },
  ]) {
    test(`피드백 화면 ${item.state}: 제목 h1 · 상태 제목 AA (설명 줄은 기록)`, async ({ page }) => {
      await openFeedback(page, item.scenario);
      await expect(page.locator(SLOT)).toHaveAttribute('data-state', item.state);
      await settleImages(page);
      const h1 = await measureContrast(page, page.locator('.haru-session-feedback h1'));
      const body =
        item.state === 'error'
          ? page.locator(`${SLOT} .haru-state`)
          : page.locator(`${SLOT} .haru-alert__body`);
      // ErrorState 는 첫 자식이 배지(아이콘)다 — 글자 줄은 그 다음부터.
      const first = item.state === 'error' ? 1 : 0;
      const stateTitle = await measureContrast(page, body.locator('> *').nth(first));
      const description = await measureContrast(page, body.locator('> *').nth(first + 1));
      const measured: Record<string, number> = { h1, stateTitle, description };
      if (item.state === 'low-quality') {
        measured['bubble'] = await measureContrast(
          page,
          page.locator(`${SLOT} .haru-bubble`).first(),
        );
      }
      test.info().annotations.push({ type: 'contrast', description: JSON.stringify(measured) });
      expect(h1).toBeGreaterThanOrEqual(4.5);
      expect(stateTitle).toBeGreaterThanOrEqual(4.5);
      expect(description).toBeGreaterThan(1);
    });
  }
});
