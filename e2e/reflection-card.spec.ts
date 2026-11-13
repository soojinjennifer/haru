/**
 * Stage 5 `S5-B` — 회고 카드 `91:691` (Stage 5 Spec §0.2 · §2.1 · §2.2 · §8 · §9.3, AC-5-17 · 18 · 20~32).
 *
 * 좌표 규칙: **Web y = Figma y − 56** (상태바는 OS 영역). 카드 = (11, 521) 370×302 → 웹 (11.5, 465).
 * 하위 좌표는 Spec §0.2 의 선언값(padding 20/20/18/20 · gap 14 · 제목 줄 20 · 별 30 · 칩 행 73 · 입력 40 · 버튼 45).
 * `R-SHADOW-1` ⑥: 카드 그림자(`--shadow-bubble` 1겹, 번짐 좌우 4 · 아래 10)를 **세로·가로** 양쪽에서 픽셀로 잰다.
 * `R-BASELINE-1`: dev 패널은 가린다. 완료 화면 전체 프레임 baseline 은 `session-complete.spec.ts` 가 갖는다.
 */
import { inflateSync } from 'node:zlib';

import { expect, test, type Page } from '@playwright/test';

import { hideDevPanel, settle } from './support/gallery';
import {
  READY_TITLE,
  firstStartSession,
  logInToHome,
  requestPayloads,
  settleImages,
  startSession,
} from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const FIGMA_TOP = 56;
const VIEWPORT = '[data-app-shell-viewport]';
const CARD = '.haru-reflection-card';
const SUBMIT_OPERATION = 'POST /v1/sessions/:sessionId/reflection';
/** Mock 지난 세션 (`analyzed`) — 직접 진입(재진입) 경로 (`H5-1.4`). */
const HISTORY_SESSION = '77777777-7777-4777-8777-000000000001';
const TITLE = 'How was storytime with Emma?';

/** computed 색 문자열 — Figma 선언값과 대조하는 **기대값**이다 (`R-FIGMA-1` ①, `session-complete.spec.ts` 선례). */
const cssColor = (fn: 'rgb' | 'rgba', channels: readonly number[]) =>
  `${fn}(${channels.join(', ')})`;
const SURFACE_STRONG = cssColor('rgba', [255, 255, 255, 0.9]);
const PRIMARY = cssColor('rgb', [74, 95, 92]);
const STROKE = cssColor('rgba', [94, 115, 112, 0.18]);
const TRANSPARENT = cssColor('rgba', [0, 0, 0, 0]);
const STAR_FILLED = cssColor('rgb', [208, 204, 161]);
const STAR_EMPTY = cssColor('rgb', [214, 222, 220]);

async function submitSession(page: Page, scenario?: string): Promise<string> {
  const sessionId = await startSession(page, scenario);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/complete$`));
  await expect(page.getByRole('region', { name: TITLE })).toBeVisible();
  return sessionId;
}

/** 새로고침은 Mock 인증을 지우므로 SPA 이동으로 직접 진입을 재현한다 (`session-complete.spec.ts` 와 같다). */
async function spaGoto(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function box(page: Page, selector: string) {
  const found = await page.locator(selector).first().boundingBox();
  if (found === null) throw new Error(`no box for ${selector}`);
  return found;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** 1×1 PNG 를 RGB 로 푼다 (`shadow.spec.ts` 와 같은 방식 — `node:zlib` 만). */
function decodeSinglePixel(png: Buffer): Rgb {
  const chunks: Buffer[] = [];
  let offset = 8;
  while (offset + 8 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  return { r: raw[1] as number, g: raw[2] as number, b: raw[3] as number };
}

async function pixelAt(page: Page, x: number, y: number): Promise<Rgb> {
  return decodeSinglePixel(await page.screenshot({ clip: { x, y, width: 1, height: 1 } }));
}

const distance = (a: Rgb, b: Rgb): number =>
  Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);

test.describe('393×852 — Figma `91:691` 대조 (AC-5-17 · 18)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('기하: 카드 (11.5, 465) 370×302 · 제목 · 별 · 칩 2행 · 입력 40 · Save 45 · 스크롤 0', async ({
    page,
  }) => {
    await submitSession(page);
    await settleImages(page);

    const card = await box(page, CARD);
    expect(card.x).toBeCloseTo(11.5, 1);
    expect(card.y).toBeCloseTo(521 - FIGMA_TOP, 1);
    expect(card.width).toBe(370);
    expect(card.height).toBeCloseTo(302, 1);

    const title = await box(page, '.haru-reflection-card__title');
    expect(title.y - card.y).toBeCloseTo(20, 1);
    expect(title.height).toBe(20);
    const stars = await box(page, '.haru-star-rating');
    expect(stars.y - card.y).toBeCloseTo(20 + 20 + 14, 1);
    expect(stars.height).toBe(30);
    // `91:694` 첫 별 = 행 안 x 74 (= (330 − 182) / 2) → 카드 x + 20 + 74.
    const firstStar = await box(page, '.haru-star-rating__glyph');
    expect(firstStar.x - card.x).toBeCloseTo(20 + 74, 1);
    expect(firstStar.width).toBe(30);
    const glyphs = await page.locator('.haru-star-rating__glyph').all();
    const second = await glyphs[1]?.boundingBox();
    expect((second?.x ?? 0) - (firstStar.x + firstStar.width)).toBeCloseTo(8, 1);

    const checks = await box(page, '.haru-reflection-card__checks');
    expect(checks.y - card.y).toBeCloseTo(20 + 20 + 14 + 30 + 14, 1);
    expect(checks.height).toBeCloseTo(73, 1);
    const chipRows = await page
      .locator(`${CARD} .haru-chip`)
      .evaluateAll((chips) => [...new Set(chips.map((chip) => chip.getBoundingClientRect().top))]);
    expect(chipRows).toHaveLength(2);
    expect((chipRows[1] ?? 0) - (chipRows[0] ?? 0)).toBeCloseTo(33 + 7, 1);
    // 칩 폭 · 행 안 시작 x — Figma 선언(라벨 12.5, `VG5B-1` ⓑ) 77 / 97 / 111 · 93 / 101, 1행 15.5 · 2행 64.5.
    // 같은 12.5 에서도 브라우저 글리프 폭이 Figma 와 칩마다 −1.4 ~ +1.6 다르다(라벨 폭 차이, padding 12×2 · border 1×2
    // 는 같다) → 칩 폭 ±2 · 행 시작 ±1.5 로 잰다. 12 였을 때는 −2.3 ~ −3.9 · 행 시작 +4.7 / +3.6 이었다.
    const chipBoxes = await page.locator(`${CARD} .haru-chip`).evaluateAll((chips) =>
      chips.map((chip) => {
        const rect = chip.getBoundingClientRect();
        return { x: rect.x, width: rect.width };
      }),
    );
    const FIGMA_CHIP_WIDTHS = [77, 97, 111, 93, 101];
    expect(chipBoxes).toHaveLength(FIGMA_CHIP_WIDTHS.length);
    chipBoxes.forEach((chip, index) => {
      expect(Math.abs(chip.width - (FIGMA_CHIP_WIDTHS[index] ?? 0))).toBeLessThanOrEqual(2);
    });
    expect(Math.abs((chipBoxes[0]?.x ?? 0) - checks.x - 15.5)).toBeLessThanOrEqual(1.5);
    expect(Math.abs((chipBoxes[3]?.x ?? 0) - checks.x - 64.5)).toBeLessThanOrEqual(1.5);

    const input = await box(page, '.haru-text-input');
    expect(input.y - card.y).toBeCloseTo(20 + 20 + 14 + 30 + 14 + 73 + 14, 1);
    expect(input.height).toBe(40);
    expect(input.width).toBe(330);
    const save = await box(page, `${CARD} .haru-button`);
    expect(card.y + card.height - (save.y + save.height)).toBeCloseTo(18, 1);
    expect(save.height).toBe(45);
    expect(save.width).toBe(330);

    // 393×852 에서 콘텐츠가 프레임 안에 들어간다 — 스크롤 0 (Spec §0.3)
    const metrics = await page.locator(VIEWPORT).evaluate((el) => ({
      scrollH: el.scrollHeight,
      clientH: el.clientHeight,
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
    }));
    expect(metrics.scrollH).toBe(metrics.clientH);
    expect(metrics.scrollW).toBe(metrics.clientW);
  });

  test('선언값 (computed — `R-FIGMA-1` ④): 면 · radius 30 · 그림자 · overflow clip · 제목 · 칩 · 입력 · 별 색', async ({
    page,
  }) => {
    await submitSession(page);
    const read = (selector: string, properties: readonly string[]) =>
      page
        .locator(selector)
        .first()
        .evaluate((element, names) => {
          const style = getComputedStyle(element);
          return names.map((name) => style.getPropertyValue(name));
        }, properties);

    const [fill, radius, shadow, overflow, blur] = await read(CARD, [
      'background-color',
      'border-top-left-radius',
      'box-shadow',
      'overflow',
      'backdrop-filter',
    ]);
    expect(fill).toBe(SURFACE_STRONG);
    expect(radius).toBe('30px');
    expect(overflow).toBe('clip');
    expect(blur).toBe('none');
    // `--shadow-bubble` — drop `0 6 4` 1겹 + inset 2겹 (`V-10`)
    expect(shadow).toContain('0px 6px 4px 0px');
    expect(shadow).toContain('inset');

    expect(
      await read('.haru-reflection-card__title', [
        'font-size',
        'font-weight',
        'line-height',
        'color',
        'text-align',
      ]),
    ).toEqual(['17px', '700', '20px', PRIMARY, 'center']);

    // 칩 Select: 미선택 = 1px border → 33 · 선택 = border 없음 → 31 · Medium 510 · check 없음
    const unselected = page.getByRole('button', { name: 'Engaged' });
    expect(
      await unselected.evaluate((el) => {
        const style = getComputedStyle(el);
        return [
          style.fontSize,
          style.fontWeight,
          style.borderTopWidth,
          el.getBoundingClientRect().height,
        ];
      }),
    ).toEqual(['12.5px', '510', '1px', 33]);
    await unselected.click();
    expect(
      await unselected.evaluate((el) => [
        getComputedStyle(el).borderTopWidth,
        el.getBoundingClientRect().height,
        el.querySelector('.haru-chip__check') === null,
      ]),
    ).toEqual(['0px', 31, true]);

    expect(
      await read('.haru-text-input', [
        'border-top-width',
        'border-top-color',
        'border-top-left-radius',
        'font-size',
        'padding-left',
        'background-color',
      ]),
    ).toEqual(['1px', STROKE, '16px', '13px', '14px', TRANSPARENT]);

    // 별 — 빈 `#D6DEDC` (`T5-1`) · 채움 `#D0CCA1`
    expect((await read('.haru-star-rating__star', ['color']))[0]).toBe(STAR_EMPTY);
    await page.getByRole('radio', { name: '4 stars' }).click();
    const colors = await page
      .locator('.haru-star-rating__star')
      .evaluateAll((stars) => stars.map((star) => getComputedStyle(star).color));
    expect(colors).toEqual([STAR_FILLED, STAR_FILLED, STAR_FILLED, STAR_FILLED, STAR_EMPTY]);
  });

  test('`R-SHADOW-1`: 카드 그림자 — 아래(세로)·왼쪽(가로) 프로브에서 보인다 · `Save` 그림자는 카드 경계에서 끊긴다', async ({
    page,
  }) => {
    await submitSession(page);
    await settleImages(page);
    await page.waitForTimeout(400);
    const card = await box(page, CARD);
    const below = {
      x: Math.round(card.x + card.width / 2),
      y: Math.round(card.y + card.height) + 5,
    };
    const left = { x: Math.floor(card.x) - 2, y: Math.round(card.y + card.height * 0.6) };

    const withShadow = await Promise.all([below, left].map((p) => pixelAt(page, p.x, p.y)));
    await page.addStyleTag({ content: `${CARD} { box-shadow: none !important; }` });
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    const withoutShadow = await Promise.all([below, left].map((p) => pixelAt(page, p.x, p.y)));
    expect(distance(withShadow[0] as Rgb, withoutShadow[0] as Rgb)).toBeGreaterThanOrEqual(4);
    expect(distance(withShadow[1] as Rgb, withoutShadow[1] as Rgb)).toBeGreaterThanOrEqual(2);

    // 카드 그림자를 뺀 상태에서 `Save` 그림자(아래 26)는 카드 아래 경계 밖에 0 — Figma `overflow: clip` 그대로
    const justBelow = {
      x: Math.round(card.x + card.width / 2),
      y: Math.ceil(card.y + card.height) + 1,
    };
    const saveOn = await pixelAt(page, justBelow.x, justBelow.y);
    await page.addStyleTag({ content: `${CARD} .haru-button { box-shadow: none !important; }` });
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    const saveOff = await pixelAt(page, justBelow.x, justBelow.y);
    expect(distance(saveOn, saveOff)).toBe(0);
  });
});

test.describe('동작 (AC-5-20 · 23 · 24 · 25 · 29)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('입력 → Save: 요청 body = 입력 · IK 는 Mock 이 받는다 · 성공 Toast + 홈 replace', async ({
    page,
  }) => {
    const sessionId = await submitSession(page);
    const save = page.getByRole('button', { name: 'Save' });
    await expect(save).toHaveAttribute('aria-disabled', 'true');
    // Playwright 는 `aria-disabled` 를 비활성으로 보고 누르지 않는다 — 포커스 가능한 blocked 상태를 실제로 눌러 본다.
    await save.click({ force: true });
    expect(await requestPayloads(page, SUBMIT_OPERATION)).toHaveLength(0);

    // 키보드로 별 선택 (radiogroup roving)
    await page.getByRole('radio', { name: '1 star' }).focus();
    await page.keyboard.press('End');
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('radio', { name: '4 stars' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await page.getByRole('button', { name: 'Engaged' }).click();
    await page.getByRole('button', { name: 'Ask Questions' }).click();
    await page
      .getByRole('textbox', { name: 'Anything to talk about this time? (optional)' })
      .fill('  Talk about the moon  ');
    await expect(save).not.toHaveAttribute('aria-disabled', 'true');
    await save.click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('status').filter({ hasText: 'Thanks — saved.' })).toHaveCount(1);
    expect(await requestPayloads(page, SUBMIT_OPERATION)).toEqual([
      { sessionId, rating: 4, checks: ['engaged', 'asked_questions'], note: 'Talk about the moon' },
    ]);
    await page.goBack();
    await expect(page).not.toHaveURL(/\/complete$/);
  });

  test('닫기 = 건너뛰기 — 입력이 있어도 확인 없이 홈 · 회고 요청 0 (`N5-06` · `N5-23`)', async ({
    page,
  }) => {
    await submitSession(page);
    await page.getByRole('radio', { name: '3 stars' }).click();
    await page.getByRole('button', { name: 'Close session' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await requestPayloads(page, SUBMIT_OPERATION)).toHaveLength(0);
  });

  test('오프라인 → 회고 전용 Toast · 입력 보존 · 저장소에 note 0 (AC-5-27)', async ({ page }) => {
    await submitSession(page, 'reflections:offline');
    const note = page.getByRole('textbox', {
      name: 'Anything to talk about this time? (optional)',
    });
    await note.fill('private-note-e2e');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: "You're offline — your notes are still here." }),
    ).toHaveCount(1);
    await expect(note).toHaveValue('private-note-e2e');
    const stored = await page.evaluate(async () => {
      const values = [
        ...Object.values({ ...window.localStorage }),
        ...Object.values({ ...window.sessionStorage }),
      ];
      const databases = (await indexedDB.databases()).map((db) => db.name ?? '');
      return { values: values.join('\n'), databases };
    });
    expect(stored.values).not.toContain('private-note-e2e');
  });

  test('재진입 `session-completion:reflection-submitted` → 읽기 전용 (AC-5-30)', async ({
    page,
  }) => {
    await logInToHome(page, 'session-completion:reflection-submitted');
    await spaGoto(page, `/session/${HISTORY_SESSION}/complete`);
    const card = page.getByRole('region', { name: TITLE });
    await expect(card).toHaveAttribute('data-state', 'submitted');
    await expect(page.getByRole('radio', { name: '4 stars' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Engaged' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Ask Questions' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
    await page.getByRole('button', { name: 'Tricky today' }).click({ force: true });
    await expect(page.getByRole('button', { name: 'Tricky today' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(await requestPayloads(page, SUBMIT_OPERATION)).toHaveLength(0);
  });
});

test.describe('반응형 (AC-5-32 · Spec §8)', () => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 393, height: 667 },
    { width: 600, height: 900 },
    { width: 1024, height: 768 },
  ]) {
    test.describe(`${String(viewport.width)}×${String(viewport.height)}`, () => {
      test.use({ viewport });

      test('가로 넘침 0 · 카드 폭 = min(370, 컬럼 − 22) · 스크롤로 Save 도달 · 카드 아래 12 · 스크롤 끝 아래 그림자 보임', async ({
        page,
      }) => {
        await submitSession(page);
        await settleImages(page);
        const metrics = await page
          .locator(VIEWPORT)
          .evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
        expect(metrics.scroll).toBe(metrics.client);
        const column = Math.min(viewport.width, 480);
        const card = await box(page, CARD);
        expect(card.width).toBe(Math.min(370, column - 22));
        expect(card.x + card.width / 2).toBeCloseTo(viewport.width / 2, 0);

        const save = page.getByRole('button', { name: 'Save' });
        await save.scrollIntoViewIfNeeded();
        await expect(save).toBeInViewport();
        const end = await page.locator(VIEWPORT).evaluate((el) => {
          el.scrollTop = el.scrollHeight;
          const cardBox = el.querySelector('.haru-reflection-card')?.getBoundingClientRect();
          const columnBox = el.querySelector('.haru-app-column')?.getBoundingClientRect();
          const viewportBox = el.getBoundingClientRect();
          return {
            cardBottom: cardBox?.bottom ?? 0,
            columnBottom: columnBox?.bottom ?? 0,
            viewportBottom: viewportBox.top + el.clientHeight,
          };
        });
        // 카드 아래 여백 = `--space-3` 12 (`D5-15` · `AD-S5-3`, Spec §13 — Figma 29 는 웹 852 에서 보이지 않는다)
        expect(end.columnBottom - end.cardBottom).toBeGreaterThanOrEqual(12);
        // `R-SHADOW-1` ⑥ 세로: 스크롤 끝에서 카드 그림자 아래 번짐 10 이 뷰포트 클립 안에 있다 (여유 2)
        expect(end.viewportBottom - end.cardBottom).toBeGreaterThanOrEqual(10);
        await settle(page);
        const card2 = await box(page, CARD);
        const below = {
          x: Math.round(card2.x + card2.width / 2),
          y: Math.round(card2.y + card2.height) + 5,
        };
        const withShadow = await pixelAt(page, below.x, below.y);
        await page.addStyleTag({ content: `${CARD} { box-shadow: none !important; }` });
        await settle(page);
        const withoutShadow = await pixelAt(page, below.x, below.y);
        expect(distance(withShadow, withoutShadow)).toBeGreaterThanOrEqual(4);
      });
    });
  }
});

test.describe('완료 경로별 카드 (AC-5-31)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('대화 전용(`conversation_only`) 완료 → 카드 표시 · 제출 가능', async ({ page }) => {
    await logInToHome(page, 'recorder:mic-permission-denied');
    await firstStartSession(page).click();
    const sheet = page.getByRole('dialog', { name: READY_TITLE });
    await sheet.getByText('Bedtime', { exact: true }).click();
    await sheet.getByRole('button', { name: 'Continue' }).click();
    const micSheet = page.getByRole('dialog', { name: 'Your microphone is off' });
    await micSheet.getByRole('button', { name: 'Not now' }).click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/\/complete$/);
    await expect(page.getByRole('region', { name: TITLE })).toBeVisible();
    await page.getByRole('button', { name: 'Big feelings' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(await requestPayloads(page, SUBMIT_OPERATION)).toHaveLength(1);
  });

  test('30분 자동 종료(`auto_timeout`) 완료 → 카드 표시', async ({ page }) => {
    await page.clock.install();
    const sessionId = await startSession(page);
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
    await page.clock.fastForward(1_800_000);
    await page.clock.runFor(500);
    await expect(page).toHaveURL(new RegExp(`/session/${sessionId}/complete$`));
    await expect(page.getByRole('region', { name: TITLE })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});

/**
 * 터치 타깃 44 (실제 hit-test — `session-regression.spec.ts` `probeTouchTargets` 와 같은 5점 방식).
 *
 * Figma 기하가 44 를 허용하지 않는 지점이 3종 있다 — 현재 상태를 고정해 늘어나면 깨지게 한다. 처리는 사용자 결정
 * (`D5-4` · `D5-5` · `D5-6`)으로 정해졌다:
 *  - 별 5 — 가로 38 (간격 8 안에서 겹침 0 이 최대) → 좌·우 점만 이웃 별. 가값 `P-29` (`D5-4`)
 *  - 입력 — 높이 40 (Figma `91:715`) → 위·아래 점이 카드 면
 *  - 칩 윗줄 중 아랫줄과 x 가 겹치는 2개 — 행 간격 7 이라 아래 점(박스 아래 +5)이 중간선(+3.5) 너머 아랫줄 몫이다.
 *    겹친 띠는 `D5-6` 으로 중간선에서 나눴다(아래 테스트). 아래 점이 아랫줄인 것은 분할 **결과**이며 기대값이다.
 *    같은 이유로 아랫줄 `Stay Focus` · `Tricky today` 의 위 점(박스 위 −5)은 중간선(−3.5) 너머 윗줄 몫이다 (수정 전에는
 *    아랫줄이 겹친 띠를 전부 가져가 이 점이 통과했다).
 * 입력 40 은 `D5-5` 로 허용 차이 등록(`AD-S5-1`) — 위·아래 점 미달이 기대값이다.
 */
test.describe('터치 타깃 (AC-5-32 · Spec §3.1 · §3.2)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('카드 안 인터랙티브 요소의 5점 hit-test — 미달은 알려진 3종뿐', async ({ page }) => {
    await submitSession(page);
    await settleImages(page);
    const misses = await page.evaluate((selector) => {
      const half = 21.5;
      const card = document.querySelector(selector);
      if (card === null) throw new Error('no card');
      return [...card.querySelectorAll<HTMLElement>('button, input')].map((element) => {
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
    }, CARD);
    expect(misses).toEqual([
      '1 star:we',
      '2 stars:we',
      '3 stars:we',
      '4 stars:we',
      '5 stars:we',
      'Engaged:',
      'Big feelings:s',
      'Ask Questions:s',
      'Stay Focus:n',
      'Tricky today:n',
      'Anything to talk about this time? (optional):ns',
      'Save:',
    ]);
  });

  /*
   * `D5-6` (사용자 결정 2026-11-08) — 윗줄 아래 slop 과 아랫줄 위 slop 이 겹친 띠를 **줄 사이 중간선**에서 나눈다.
   * 중간선 = 아랫줄 top − 줄 간격/2. 두 줄 칩이 x 로 겹치는 열에서 중간선 ±1 을 찍어 각자 자기 절반을 갖는지 본다.
   * 수정 전에는 중간선 −1 (윗줄 몫)도 아랫줄이 가져갔다. 겹침이 없는 바깥(첫 줄 위 · 마지막 줄 아래)은 44 그대로.
   * 미선택(33, border 1) · 선택(31, border 0) 칩이 섞인 경우도 같은 중간선이어야 한다.
   */
  for (const selected of [[], ['Big feelings', 'Stay Focus']] as const) {
    const label = selected.length === 0 ? '미선택' : `선택 ${selected.join(' · ')}`;
    test(`칩 줄 사이 hit 영역 = 중간선에서 분할 (${label})`, async ({ page }) => {
      await submitSession(page);
      await settleImages(page);
      for (const name of selected) await page.getByRole('button', { name }).click();
      await page.mouse.move(0, 0);
      const probes = await page.evaluate((selector) => {
        const card = document.querySelector(selector);
        if (card === null) throw new Error('no card');
        const chips = [...card.querySelectorAll<HTMLElement>('.haru-chip')];
        const gap = Number.parseFloat(
          getComputedStyle(card).getPropertyValue('--reflection-chip-gap'),
        );
        const firstTop = chips[0]?.getBoundingClientRect().top ?? 0;
        const top = chips.filter((chip) => chip.getBoundingClientRect().top === firstTop);
        const bottom = chips.filter((chip) => chip.getBoundingClientRect().top !== firstTop);
        const bottomTop = bottom[0]?.getBoundingClientRect().top ?? 0;
        const midline = bottomTop - gap / 2;
        const owner = (x: number, y: number) => {
          const hit = document.elementFromPoint(x, y);
          return chips.find((chip) => hit !== null && chip.contains(hit))?.textContent ?? null;
        };
        const rows: string[] = [];
        for (const upper of top) {
          const u = upper.getBoundingClientRect();
          for (const lower of bottom) {
            const l = lower.getBoundingClientRect();
            const left = Math.max(u.left, l.left);
            const right = Math.min(u.right, l.right);
            if (right - left < 2) continue;
            const x = (left + right) / 2;
            rows.push(
              [
                upper.textContent,
                lower.textContent,
                owner(x, midline - 1),
                owner(x, midline + 1),
                // 바깥 끝은 44 그대로 — 윗줄 위 5 · 아랫줄 아래 5 (5점 hit-test 의 n · s 와 같은 거리)
                owner(u.left + u.width / 2, u.top - 5),
                owner(l.left + l.width / 2, l.bottom + 5),
              ].join(' | '),
            );
          }
        }
        return {
          gap,
          midlineOffset: midline - Math.max(...top.map((c) => c.getBoundingClientRect().bottom)),
          rows,
        };
      }, CARD);
      expect(probes.gap).toBe(7);
      // 아랫줄 top − 윗줄(가장 높은 칩) bottom = 7 → 중간선 = 윗줄 bottom + 3.5
      expect(probes.midlineOffset).toBeCloseTo(3.5, 1);
      expect(probes.rows).toEqual([
        'Engaged | Stay Focus | Engaged | Stay Focus | Engaged | Stay Focus',
        'Big feelings | Stay Focus | Big feelings | Stay Focus | Big feelings | Stay Focus',
        'Big feelings | Tricky today | Big feelings | Tricky today | Big feelings | Tricky today',
        'Ask Questions | Tricky today | Ask Questions | Tricky today | Ask Questions | Tricky today',
      ]);
    });
  }
});
