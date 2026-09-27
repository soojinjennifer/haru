/**
 * 카드 그림자 클리핑 회귀 방지 — Stage 1 QA 이후 발견된 결함(`QA-1-L1`).
 *
 * 증상: 카드·Sheet·Dialog 의 그림자가 배경으로 번지지 않고 **직사각형으로 잘렸다**.
 * 원인: 스크롤 컨테이너(`overflow-y: auto`)가 앱 컬럼 **안쪽**에 있었다. `overflow-y` 가
 * `visible` 이 아니면 CSS 규격상 `overflow-x` 도 `visible` 로 남을 수 없어 그 요소가
 * 가로 클리핑 박스가 되고, 그 폭이 카드 폭과 같아 그림자가 카드 옆에서 잘렸다.
 *
 * 여기서 두 가지를 본다.
 *  ① 구조 — 카드의 조상 중 가로를 자르는 요소는 **뷰포트 폭 이상**이어야 한다 (컬럼 바깥).
 *  ② 픽셀 — 카드 바깥(gutter)의 실제 렌더 픽셀이 그림자 때문에 어두워져야 한다.
 *     같은 지점을 `box-shadow: none` 으로 다시 그려 비교하므로 배경 gradient 와 무관하다.
 *
 * 구조가 되돌아가면 ①이, 그림자 토큰이 지워지거나 다시 잘리면 ②가 실패한다.
 */
import { inflateSync } from 'node:zlib';

import { expect, test, type Page } from '@playwright/test';

/** Design Spec §7.2 의 4개 폭. */
const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
  { width: 1024, height: 768 },
] as const;

/** 앱 Layout(`/`) 과 dev 레이아웃 프레임(`/__dev/ui/frame`) 둘 다 같은 규칙을 따라야 한다. */
const SCREENS = [
  // Stage 2-AUTH 부터 `/` 는 Route Guard 가 미인증 사용자를 `/auth/welcome` 로 보낸다.
  // Welcome 에는 Surface 카드가 없으므로, StackLayout 안에 카드가 있는 화면을 쓴다
  // (`/auth/reset-password` 는 토큰이 없으면 ErrorState 카드를 렌더한다).
  { name: 'app `/auth/reset-password` (StackLayout)', path: '/auth/reset-password' },
  { name: 'dev frame (TabLayout 구조)', path: '/__dev/ui/frame' },
] as const;

/** 카드 좌우에서 그림자를 재는 거리. `0 28px 56px` 는 가로로 약 28px 번진다. */
const PROBE_OFFSET_PX = 6;

/**
 * 그림자 유무로 픽셀이 달라져야 하는 최소 폭(RGB 채널 합 기준).
 * 실측: 잘렸을 때 0–2, 정상일 때 20–35. 사이 값을 임계값으로 둔다.
 */
const MIN_SHADOW_DELTA = 8;

interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** 1×1 PNG 한 장을 RGB 로 푼다 (외부 의존성 없이 `node:zlib` 만 쓴다). */
function decodeSinglePixel(png: Buffer): Rgb {
  const chunks: Buffer[] = [];
  let offset = 8; // PNG signature

  while (offset + 8 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }

  // 1×1 이므로 스캔라인은 [filter, R, G, B(, A)] 하나뿐이다.
  const raw = inflateSync(Buffer.concat(chunks));
  return { r: raw[1] as number, g: raw[2] as number, b: raw[3] as number };
}

async function pixelAt(page: Page, x: number, y: number): Promise<Rgb> {
  return decodeSinglePixel(await page.screenshot({ clip: { x, y, width: 1, height: 1 } }));
}

const distance = (a: Rgb, b: Rgb): number =>
  Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  });
}

/** 첫 번째 카드(Surface)의 위치와, 그 카드를 가로로 자르는 조상 목록. */
async function measureCard(page: Page) {
  return page.evaluate(() => {
    const card = document.querySelector('.haru-surface');
    if (card === null) throw new Error('Surface 카드를 찾지 못했다');

    const clippers: { tag: string; className: string; clientWidth: number }[] = [];
    for (let node = card.parentElement; node !== null; node = node.parentElement) {
      if (window.getComputedStyle(node).overflowX !== 'visible') {
        clippers.push({
          tag: node.tagName.toLowerCase(),
          className: node.getAttribute('class') ?? '',
          clientWidth: node.clientWidth,
        });
      }
    }

    const rect = card.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      clippers,
      viewportWidth: window.innerWidth,
    };
  });
}

for (const screen of SCREENS) {
  test.describe(`카드 그림자가 앱 컬럼 밖으로 번진다 — ${screen.name}`, () => {
    for (const viewport of VIEWPORTS) {
      test(`${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(screen.path, { waitUntil: 'domcontentloaded' });
        await page.locator('.haru-surface').first().waitFor();
        await settle(page);

        const card = await measureCard(page);

        // ① 가로를 자르는 조상은 뷰포트 폭 이상이어야 한다 (= 앱 컬럼 바깥).
        expect(card.clippers.length).toBeGreaterThan(0); // 스크롤 컨테이너 자체는 있어야 한다
        for (const clipper of card.clippers) {
          expect(
            clipper.clientWidth,
            `앱 컬럼 안쪽 클리핑: <${clipper.tag} class="${clipper.className}"> (${clipper.clientWidth}px)`,
          ).toBeGreaterThanOrEqual(card.viewportWidth);
        }

        // ② 카드 좌우 바깥 픽셀이 그림자 때문에 어두워진다.
        const probeY = Math.round(card.top + (card.bottom - card.top) * 0.9);
        const probes = [card.left - PROBE_OFFSET_PX, card.right + PROBE_OFFSET_PX - 1];

        const withShadow = await Promise.all(probes.map((x) => pixelAt(page, x, probeY)));
        await page.addStyleTag({ content: '.haru-surface { box-shadow: none !important; }' });
        await settle(page);
        const withoutShadow = await Promise.all(probes.map((x) => pixelAt(page, x, probeY)));

        probes.forEach((x, index) => {
          const delta = distance(withShadow[index] as Rgb, withoutShadow[index] as Rgb);
          expect(
            delta,
            `x=${x} 에서 그림자가 보이지 않는다 (delta ${delta})`,
          ).toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
        });
      });
    }
  });
}
