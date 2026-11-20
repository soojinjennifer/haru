/**
 * 리포트 상세 ⑥ 하이라이트 클립 플레이어 — Stage 7 `S7-E` (`C13-S7-3`, Spec §2.5 · §9.1, FR-18). Figma 없음.
 *
 *  ① 실제 Chromium 재생 — 합성 WAV `data:` URL(Mock) · 탭 전 조회 0 · 재생/일시정지 · 진행 (AC-7-49 · 54)
 *  ② 동시 재생 1 (AC-7-50) · URL 재발급 1회 (AC-7-51) · 불가 상태 (AC-7-52) · 오류/오프라인
 *  ③ 이탈 · 숨김 → 정지 + src 제거 · 콘솔에 URL/라벨/이름 0 (AC-7-53 · 64)
 *  ④ 접근성 — 버튼 이름 · 44 열 · aria-disabled 포커스 가능
 *  ⑤ `R-SHADOW-1` — 버튼 그림자(`--shadow-bubble`) **세로·가로** 프로브 · 클리핑 조상 = AppShell 뷰포트 1개
 *  ⑥ baseline 6 상태 (`R-BASELINE-1` — dev 패널 가림 · settle · 재생 위치 결정성은 play 스텁)
 */
import { inflateSync } from 'node:zlib';

import { expect, test, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';

import { hideDevPanel, settle } from './support/gallery';
import { logInToHome, requestOperations, settleImages } from './support/session';

const LATEST = 'e7e7e7e7-0000-4000-8000-000000000002';
const READY = '.haru-report-detail__body[data-state="ready"]';
const PLAYBACK_OP = 'GET /v1/highlight-clips/:clipId/playback-url';
const FIRST = 'Talking about feelings';
const SECOND = 'Guessing what happens next';
const CLIPS_CARD = '.haru-surface:has([data-section="clips"])';

async function deepLink(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function openClips(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await deepLink(page, `/progress/reports/${LATEST}`);
  await expect(page.locator(READY)).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Highlight clips' })).toBeVisible();
  await settleImages(page);
}

async function playbackCount(page: Page): Promise<number> {
  return (await requestOperations(page)).filter((op) => op === PLAYBACK_OP).length;
}

function audioState(page: Page) {
  return page.locator('audio').evaluate((node) => {
    const audio = node as HTMLAudioElement;
    return {
      paused: audio.paused,
      hasSrc: audio.hasAttribute('src'),
      wav: (audio.getAttribute('src') ?? '').startsWith('data:audio/wav;base64,UklGR'),
      currentTime: audio.currentTime,
      duration: audio.duration,
      readyState: audio.readyState,
      preload: audio.getAttribute('preload'),
    };
  });
}

function row(page: Page, label: string) {
  return page.locator('.haru-clip-row').filter({ hasText: label });
}

// ── ① 재생 ─────────────────────────────────────────────────────────────────

test('탭 전 URL 조회 0 · preload none → 재생(실제 Chromium) → 진행 · 일시정지 → 재개는 조회 0 (AC-7-49 · 54)', async ({
  page,
}) => {
  await openClips(page);
  await expect(page.locator('.haru-clip-row')).toHaveCount(2);
  expect(await playbackCount(page)).toBe(0);
  expect(await audioState(page)).toMatchObject({ hasSrc: false, preload: 'none', paused: true });
  await expect(row(page, FIRST).getByText('0:00 / 0:12')).toBeVisible();
  await expect(row(page, SECOND).getByText('0:00 / 0:15')).toBeVisible();
  await expect(row(page, FIRST).getByText('May 5', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect(page.getByRole('button', { name: `Pause clip: ${FIRST}` })).toBeVisible();
  expect(await playbackCount(page)).toBe(1);
  // 실제 디코드 · 재생 시작 — 합성 WAV 12초가 열렸다. ⚠️ 이 헤드리스 러너는 오디오 출력 장치가 없어
  // 재생 시계가 0.064s 에서 멈춘다(H7-5 실측) → 시간 진행은 **실제 seek 의 timeupdate** 로 확인한다.
  await expect.poll(async () => (await audioState(page)).readyState).toBeGreaterThanOrEqual(3);
  expect(await audioState(page)).toMatchObject({ paused: false, wav: true, duration: 12 });

  await page.locator('audio').evaluate((node) => {
    (node as HTMLAudioElement).currentTime = 4;
  });
  const bar = row(page, FIRST).getByRole('progressbar', { name: `Clip progress: ${FIRST}` });
  await expect(bar).toHaveAttribute('aria-valuetext', '0:04 of 0:12');
  await expect(row(page, FIRST).getByText('0:04 / 0:12')).toBeVisible();
  await expect(row(page, FIRST).locator('[aria-live="polite"]')).toHaveText('Playing.');

  await page.getByRole('button', { name: `Pause clip: ${FIRST}` }).click();
  await expect(page.getByRole('button', { name: `Play clip: ${FIRST}` })).toBeVisible();
  await expect(row(page, FIRST).locator('[aria-live="polite"]')).toHaveText('Paused.');
  expect((await audioState(page)).paused).toBe(true);

  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect(page.getByRole('button', { name: `Pause clip: ${FIRST}` })).toBeVisible();
  expect(await playbackCount(page)).toBe(1);
});

test('끝까지 재생 → play 아이콘 · 0:00 (Spec §2.5 ended)', async ({ page }) => {
  await openClips(page);
  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect(page.getByRole('button', { name: `Pause clip: ${FIRST}` })).toBeVisible();
  // 12초를 기다리지 않는다 — 끝으로 seek 해 실제 `ended` 를 받는다 (헤드리스 재생 시계 정지 — H7-5)
  await expect.poll(async () => (await audioState(page)).readyState).toBeGreaterThanOrEqual(1);
  await page.locator('audio').evaluate((node) => {
    const audio = node as HTMLAudioElement;
    audio.currentTime = audio.duration;
  });
  await expect(page.getByRole('button', { name: `Play clip: ${FIRST}` })).toBeVisible({
    timeout: 5_000,
  });
  await expect(row(page, FIRST).getByText('0:00 / 0:12')).toBeVisible();
});

// ── ② 동시 재생 · 재발급 · 불가 · 오류 ─────────────────────────────────────

test('둘째 클립 재생 → 첫 클립 정지 · 오디오 요소 1개 · 재생 중인 소리 1개 (AC-7-50)', async ({
  page,
}) => {
  await openClips(page);
  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect(page.getByRole('button', { name: `Pause clip: ${FIRST}` })).toBeVisible();
  await page.getByRole('button', { name: `Play clip: ${SECOND}` }).click();
  await expect(page.getByRole('button', { name: `Pause clip: ${SECOND}` })).toBeVisible();
  await expect(page.getByRole('button', { name: `Play clip: ${FIRST}` })).toBeVisible();
  await expect(page.locator('audio')).toHaveCount(1);
  const playingMedia = await page.evaluate(
    () =>
      [...document.querySelectorAll('audio, video')].filter((m) => !(m as HTMLMediaElement).paused)
        .length,
  );
  expect(playingMedia).toBe(1);
  expect(await playbackCount(page)).toBe(2);
});

test('`clip-url-expired` — 첫 URL 만료 → 재발급 1회 → 재생 (AC-7-51)', async ({ page }) => {
  await openClips(page, 'highlight-clips:clip-url-expired');
  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect(page.getByRole('button', { name: `Pause clip: ${FIRST}` })).toBeVisible();
  expect(await playbackCount(page)).toBe(2);
  // 재발급된 URL = 실제 12초 WAV (만료 URL 의 빈 오디오가 아니다)
  await expect.poll(async () => (await audioState(page)).readyState).toBeGreaterThanOrEqual(1);
  expect(await audioState(page)).toMatchObject({ paused: false, wav: true, duration: 12 });
});

test('`recording-deleted` → 불가 문구 · 버튼 aria-disabled(포커스 가능) · 진행 숨김 · 재시도 0 (AC-7-52)', async ({
  page,
}) => {
  await openClips(page, 'highlight-clips:recording-deleted');
  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  const button = page.getByRole('button', { name: `Clip unavailable: ${FIRST}` });
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await expect(row(page, FIRST).getByText('This clip is no longer available.')).toBeVisible();
  await expect(row(page, FIRST).getByRole('progressbar')).toHaveCount(0);
  // Playwright 는 aria-disabled 를 비활성으로 보고 click 을 기다린다 — 사용자 탭과 같은 click 이벤트를 직접 보낸다
  await button.dispatchEvent('click');
  await settle(page);
  expect(await playbackCount(page)).toBe(1);
  await button.focus();
  await expect(button).toBeFocused();
});

test('`clip-expired` → 둘째 클립은 조회 전부터 불가 · 요청 0 (N7-17)', async ({ page }) => {
  await openClips(page, 'highlight-clips:clip-expired');
  await expect(page.getByRole('button', { name: `Clip unavailable: ${SECOND}` })).toBeVisible();
  await expect(row(page, SECOND).getByText('This clip is no longer available.')).toBeVisible();
  expect(await playbackCount(page)).toBe(0);
});

test('`offline` → 오프라인 문구 · 다시 탭 = 재시도 · `error` → 일반 문구', async ({ page }) => {
  await openClips(page, 'highlight-clips:offline');
  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect(
    row(page, FIRST).getByText("You're offline. Tap play to try again when you're back."),
  ).toBeVisible();
  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect.poll(() => playbackCount(page)).toBe(2);
});

test('`error` → 일반 오류 문구 (Spec §2.5)', async ({ page }) => {
  await openClips(page, 'highlight-clips:error');
  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect(
    row(page, FIRST).getByText("We couldn't play this clip. Tap play to try again."),
  ).toBeVisible();
});

// ── ③ 이탈 · 숨김 · Privacy ──────────────────────────────────────────────

test('Back(화면 이탈) → 정지 + src 제거 (AC-7-53)', async ({ page }) => {
  await openClips(page);
  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect(page.getByRole('button', { name: `Pause clip: ${FIRST}` })).toBeVisible();
  const handle = await page.locator('audio').elementHandle();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(/\/progress$/);
  // URL 은 라우터 전이 시작 때 바뀌고 언마운트(effect 정리)는 그 뒤 커밋이다 — 정착을 기다린다
  await expect
    .poll(() =>
      handle?.evaluate((node) => ({
        paused: (node as HTMLAudioElement).paused,
        hasSrc: node.hasAttribute('src'),
      })),
    )
    .toStrictEqual({ paused: true, hasSrc: false });
});

test('문서 숨김(탭 전환) → 정지 + src 제거 · 행 paused (AC-7-53)', async ({ page }) => {
  await openClips(page);
  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect(page.getByRole('button', { name: `Pause clip: ${FIRST}` })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByRole('button', { name: `Play clip: ${FIRST}` })).toBeVisible();
  expect(await audioState(page)).toMatchObject({ paused: true, hasSrc: false });
});

test('콘솔 · 에러 로그에 클립 URL · 라벨 · 아이 이름 · 클립 id 0 (AC-7-53 · 64)', async ({
  page,
}) => {
  const messages: string[] = [];
  page.on('console', (message) => {
    messages.push(message.text());
  });
  page.on('pageerror', (error) => {
    messages.push(error.message);
  });
  await openClips(page, 'highlight-clips:clip-url-expired');
  await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
  await expect(page.getByRole('button', { name: `Pause clip: ${FIRST}` })).toBeVisible();
  await page.getByRole('button', { name: `Play clip: ${SECOND}` }).click();
  await expect(page.getByRole('button', { name: `Pause clip: ${SECOND}` })).toBeVisible();
  expect(
    messages.filter((text) => /data:audio|c1c1c1c1|Talking about|Guessing what|Emma/.test(text)),
  ).toStrictEqual([]);
});

// ── ④ 접근성 ──────────────────────────────────────────────────────────────

test('행 grid 44 열 · 버튼 hit 44 · 보이는 시간 텍스트는 SR 에서 숨김 (Spec §2.5 · §9.4)', async ({
  page,
}) => {
  await openClips(page);
  const geometry = await page
    .locator('.haru-clip-row')
    .first()
    .evaluate((node) => {
      const button = node.querySelector('.haru-icon-button') as HTMLElement;
      const before = getComputedStyle(button, '::before');
      const rect = button.getBoundingClientRect();
      return {
        column: getComputedStyle(node).gridTemplateColumns.split(' ')[0],
        button: Math.round(rect.width),
        hit: Math.round(rect.width - 2 * Number.parseFloat(before.left)),
        timeHidden: node.querySelector('.haru-clip-row__progress > [aria-hidden="true"]') !== null,
      };
    });
  expect(geometry).toStrictEqual({ column: '44px', button: 38, hit: 44, timeHidden: true });
});

/** 행 안 버튼 중심 y(행 top 기준) · live 문구 줄 높이 — `VG7-E-05` ⓑ · `VG7-E-04`. */
function rowGeometry(page: Page, label: string) {
  return row(page, label).evaluate((node) => {
    const li = node.getBoundingClientRect();
    const button = (node.querySelector('.haru-icon-button') as HTMLElement).getBoundingClientRect();
    const message = node.querySelector('.haru-clip-row__message') as HTMLElement;
    return {
      buttonCenter: Math.round((button.top + button.height / 2 - li.top) * 10) / 10,
      messageLine: getComputedStyle(message).lineHeight,
      messageHeight: Math.round(message.getBoundingClientRect().height),
    };
  });
}

test('재생 버튼은 어느 상태에서도 움직이지 않는다 · 문구 줄 높이 16 (`VG7-E-05` ⓑ · `VG7-E-04`, D7-6 ⑤)', async ({
  page,
}) => {
  await openClips(page);
  const idle = await rowGeometry(page, FIRST);
  const idleSecond = await rowGeometry(page, SECOND);

  for (const [scenario, text] of [
    ['highlight-clips:error', "We couldn't play this clip. Tap play to try again."],
    ['highlight-clips:offline', "You're offline. Tap play to try again when you're back."],
  ] as const) {
    await openClips(page, scenario);
    await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
    await expect(row(page, FIRST).getByText(text)).toBeVisible();
    const after = await rowGeometry(page, FIRST);
    expect(after.buttonCenter, scenario).toBe(idle.buttonCenter);
    expect(after.messageLine, scenario).toBe('16px');
    // 393 에서 2줄 = 32 (body 22 상속이면 44)
    expect(after.messageHeight % 16, scenario).toBe(0);
  }

  await openClips(page, 'highlight-clips:clip-expired');
  const unavailable = await rowGeometry(page, SECOND);
  expect(unavailable.messageLine).toBe('16px');
  test.info().annotations.push({
    type: 'clip-button-center',
    description: JSON.stringify({ idle, idleSecond, unavailable }),
  });
  // 불가 = 문구가 진행 자리(3행)를 대신한다 — 진행 행 높이를 유지해 버튼 이동 0
  expect(unavailable.buttonCenter).toBe(idleSecond.buttonCenter);
});

// ── ⑤ R-SHADOW-1 ──────────────────────────────────────────────────────────

interface Rgb {
  r: number;
  g: number;
  b: number;
}

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

const CLIP_BUTTON = '.haru-clip-row .haru-icon-button';

for (const viewport of [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
] as const) {
  test(`클립 버튼 그림자 ${String(viewport.width)}px — 좌 · 우 · 아래 번짐 · 클리핑 조상 1개 (R-SHADOW-1 세로·가로)`, async ({
    page,
  }) => {
    await hideDevPanel(page);
    await page.setViewportSize(viewport);
    await openClips(page);
    const box = await page
      .locator(CLIP_BUTTON)
      .first()
      .evaluate((node) => {
        node.scrollIntoView({ block: 'center' });
        const clippers: string[] = [];
        for (let el = node.parentElement; el !== null; el = el.parentElement) {
          const style = getComputedStyle(el);
          if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
            clippers.push(`${el.getAttribute('class') ?? el.tagName}:${String(el.clientWidth)}`);
          }
        }
        const rect = node.getBoundingClientRect();
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          clippers,
          viewportWidth: window.innerWidth,
        };
      });
    await settle(page);
    expect(box.clippers).toHaveLength(1);
    expect(Number(box.clippers[0]?.split(':').pop())).toBeGreaterThanOrEqual(box.viewportWidth);

    // `--shadow-bubble` 번짐 좌우 4 · 아래 10 → 좌우 2px · 아래 3 / 7px
    const midY = Math.round((box.top + box.bottom) / 2);
    const midX = Math.round((box.left + box.right) / 2);
    const points = [
      { x: box.left - 2, y: midY },
      { x: box.right + 1, y: midY },
      { x: midX, y: box.bottom + 2 },
      { x: midX, y: box.bottom + 6 },
    ];
    const before: Rgb[] = [];
    for (const point of points) before.push(await pixelAt(page, point.x, point.y));
    await page.addStyleTag({ content: `${CLIP_BUTTON} { box-shadow: none !important; }` });
    await settle(page);
    const deltas: number[] = [];
    for (const [index, point] of points.entries()) {
      deltas.push(distance(before[index] as Rgb, await pixelAt(page, point.x, point.y)));
    }
    test.info().annotations.push({
      type: 'shadow-deltas',
      description: JSON.stringify({ box, deltas }),
    });
    const [left, right, below3, below7] = deltas;
    expect(left, '왼쪽 2px').toBeGreaterThan(0);
    expect(right, '오른쪽 2px').toBeGreaterThan(0);
    expect(below3, '아래 3px').toBeGreaterThan(0);
    expect(below7, '아래 7px').toBeGreaterThan(0);
  });
}

// ── ⑥ baseline ───────────────────────────────────────────────────────────

/**
 * 재생 위치를 결정적으로 — 실제 재생 대신 `play()` 를 스텁한다 (resolve | 영원히 대기).
 * 상태 머신 · 렌더 경로는 그대로이고 소리 · 시간 진행만 없다.
 */
async function stubPlay(page: Page, mode: 'resolve' | 'pending'): Promise<void> {
  await page.addInitScript((kind) => {
    HTMLMediaElement.prototype.play = function play() {
      return kind === 'resolve' ? Promise.resolve() : new Promise<void>(() => undefined);
    };
  }, mode);
}

async function seekStub(page: Page, seconds: number): Promise<void> {
  await page.locator('audio').evaluate((node, value) => {
    Object.defineProperty(node, 'currentTime', { configurable: true, get: () => value });
    node.dispatchEvent(new Event('timeupdate'));
  }, seconds);
}

async function snapCard(page: Page, name: string): Promise<void> {
  const card = page.locator(CLIPS_CARD);
  await card.scrollIntoViewIfNeeded();
  // 누른 버튼 위에 포인터가 남으면 hover 그림자가 담긴다 — 스크롤 위치에 따라 담기기도 · 안 담기기도 했다
  // (S7-F 에서 ⑦ 추가로 스크롤이 바뀌자 error · offline baseline 이 hover → rest 로 갈렸다, H7-6.6). 포인터를 치운다.
  await page.mouse.move(0, 0);
  await settle(page);
  await expect(card).toHaveScreenshot(name, REGION_SNAPSHOT);
}

test.describe('baseline — 플레이어 6 상태 (R-BASELINE-1, C13-S7-3)', () => {
  test.beforeEach(async ({ page }) => {
    await hideDevPanel(page);
    await page.setViewportSize({ width: 393, height: 852 });
  });

  test('s7-clips-idle', async ({ page }) => {
    await openClips(page);
    await snapCard(page, 's7-clips-idle.png');
  });

  test('s7-clips-loading — URL 받음 · 재생 시작 대기 (Spinner, reduced-motion 정지)', async ({
    page,
  }) => {
    await stubPlay(page, 'pending');
    await openClips(page);
    await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
    await expect(page.getByRole('button', { name: `Play clip: ${FIRST}` })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await snapCard(page, 's7-clips-loading.png');
  });

  test('s7-clips-playing — 0:04', async ({ page }) => {
    await stubPlay(page, 'resolve');
    await openClips(page);
    await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
    await expect(page.getByRole('button', { name: `Pause clip: ${FIRST}` })).toBeVisible();
    await seekStub(page, 4);
    await expect(row(page, FIRST).getByText('0:04 / 0:12')).toBeVisible();
    await snapCard(page, 's7-clips-playing.png');
  });

  test('s7-clips-paused — 0:04', async ({ page }) => {
    await stubPlay(page, 'resolve');
    await openClips(page);
    await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
    await expect(page.getByRole('button', { name: `Pause clip: ${FIRST}` })).toBeVisible();
    await seekStub(page, 4);
    await page.getByRole('button', { name: `Pause clip: ${FIRST}` }).click();
    await expect(page.getByRole('button', { name: `Play clip: ${FIRST}` })).toBeVisible();
    await expect(row(page, FIRST).getByText('0:04 / 0:12')).toBeVisible();
    await page.mouse.move(0, 0);
    await page.locator('body').evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    await snapCard(page, 's7-clips-paused.png');
  });

  test('s7-clips-unavailable — 둘째 클립 보관 만료 (`clip-expired`)', async ({ page }) => {
    await openClips(page, 'highlight-clips:clip-expired');
    await snapCard(page, 's7-clips-unavailable.png');
  });

  for (const [name, scenario, text] of [
    [
      's7-clips-error',
      'highlight-clips:error',
      "We couldn't play this clip. Tap play to try again.",
    ],
    [
      's7-clips-offline',
      'highlight-clips:offline',
      "You're offline. Tap play to try again when you're back.",
    ],
  ] as const) {
    test(name, async ({ page }) => {
      await openClips(page, scenario);
      await page.getByRole('button', { name: `Play clip: ${FIRST}` }).click();
      await expect(row(page, FIRST).getByText(text)).toBeVisible();
      await page.locator('body').evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
      });
      await snapCard(page, `${name}.png`);
    });
  }
});
