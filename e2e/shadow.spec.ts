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

import { hideDevPanel } from './support/gallery';

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

/*
 * ───────────────────────────────────────────────────────────────────────────
 * 세로 프로브 — `R-SHADOW-1` #6 (`.claude/rules/frontend.md` §6-1)
 *
 * 위 케이스는 **가로만** 봤다. 그래서 Stage 3 가로 트랙의 결함(카드 **하단** 그림자가
 * 트랙 border box 에 전면 절단)을 잡지 못했다 (approvals §12.15 · audit §22.1).
 * 원인 구조는 같다: `overflow-x: auto` 를 선언하면 세로도 클리핑 박스가 되는데,
 * `block-size` + `align-items: flex-end` 때문에 border box 하단 = 카드 하단이라
 * **그림자 자리가 0px** 이었다.
 *
 * 여기서는 카드 **하단 바깥**의 실제 렌더 픽셀을 본다 — 위 케이스와 같은 방식
 * (`box-shadow` 있음/없음 두 번 렌더 → RGB 채널 차 합 ≥ 8).
 *
 * 프로브 x 는 카드 폭의 25% 지점이다 — 가운데(197)에는 dots 가 있다.
 * 프로브 거리 16px: sticky 하단 바 컨테이너가 카드 하단 **+26** 부터 덮으므로
 * 그보다 안쪽이어야 실제 배경 위의 그림자를 잰다.
 */
const VERTICAL_PROBE_OFFSET_PX = 16;

test.describe('카드 하단 그림자가 가로 트랙 안에서 잘리지 않는다 (R-SHADOW-1 · §12.15)', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);

      // Home 은 인증이 필요하다. 가로 트랙은 `/` 에만 있다.
      await page.goto('/auth/log-in', { waitUntil: 'domcontentloaded' });
      await page.getByLabel('Email').fill('sam@example.com');
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
      await page.getByRole('button', { name: 'Log in', exact: true }).click();

      const loaded = page.locator('.haru-activity-track:not(.haru-activity-track--skeleton)');
      await expect(loaded).toBeVisible();
      await expect.poll(async () => loaded.evaluate((node) => node.clientWidth > 0)).toBe(true);
      await settle(page);

      const card = await page.locator('.haru-activity-card--front').first().boundingBox();
      expect(card).not.toBeNull();

      const probeX = Math.round((card?.x ?? 0) + (card?.width ?? 0) * 0.25);
      const probeY = Math.round((card?.y ?? 0) + (card?.height ?? 0)) + VERTICAL_PROBE_OFFSET_PX;

      const withShadow = await pixelAt(page, probeX, probeY);
      await page.addStyleTag({
        content: '.haru-activity-card--front { box-shadow: none !important; }',
      });
      await settle(page);
      const withoutShadow = await pixelAt(page, probeX, probeY);

      const delta = distance(withShadow, withoutShadow);
      expect(
        delta,
        `카드 하단 +${VERTICAL_PROBE_OFFSET_PX}px (${probeX}, ${probeY}) 에서 그림자가 보이지 않는다 (delta ${delta})`,
      ).toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
    });
  }
});

/*
 * ───────────────────────────────────────────────────────────────────────────
 * 서재 캐러셀 트랙 — `R-SHADOW-1` ⑥ **세로·가로 양축** 프로브 (`L-NEW-01`)
 *
 * `.haru-shelf-track` 은 `AppColumn` 안쪽 `overflow-*` 금지의 **두 번째 예외**다
 * (첫째는 Home 가로 트랙). `overflow-x: auto` 를 선언하면 세로도 클리핑 박스가 되므로
 * 표지 그림자 자리를 트랙 **안쪽**에 넣어야 한다.
 *
 * 번짐은 **픽셀 프로브 실측**이다 (빌드 산출물 CSS · 흰 배경 · dSF 1 · 순백 대비 채널차 합):
 *   `--shadow-cover` = 겹 2개(drop `0 6px 14px ink28%` + inset highlight)
 *   위 **8** · 아래 **20** · 좌우 **14**
 * → `padding-block-start: 8` · `padding-block-end: 20` · 좌우는 gutter(24) bleed 가 흡수한다.
 *
 * 여기서 **네 방향을 모두** 본다. 가로만 보던 탓에 과거 결함(카드 하단 그림자 전면 절단)을
 * 놓쳤고, 세로만 보면 gutter bleed 회귀를 놓친다.
 *   · 위   — `padding-block-start` 가 사라지면 표지 상단 그림자가 트랙 border box 에서 잘린다
 *   · 아래 — 표지 하단 그림자(가장 짙다)가 살아 있다
 *   · 좌   — 첫 열 표지는 앱 컬럼 **leading edge** 에 붙어 있다. bleed 가 없으면 잘린다
 *   · 우   — 셋째 열 표지는 content 를 0.92px 넘는다(Figma 기하). 오른쪽 bleed 가 없으면 잘린다
 */
const SHELF_PROBE = {
  /** 위쪽은 `0 6px` 오프셋 때문에 가장 옅다 — 경계 바로 바깥을 본다. */
  above: 2,
  below: 4,
  /** 표지 제목 글리프가 시작되기 전(`+8`)이라 텍스트가 섞이지 않는다. */
  side: 6,
} as const;

test.describe('서재 캐러셀 표지 그림자가 트랙 안에서 잘리지 않는다 (R-SHADOW-1 · L-NEW-01)', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await hideDevPanel(page);

      // Library 는 인증이 필요하다. 새 `goto` 는 인증을 잃으므로 **SPA 이동**으로 간다.
      await page.goto('/auth/log-in', { waitUntil: 'domcontentloaded' });
      await page.getByLabel('Email').fill('sam@example.com');
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
      await page.getByRole('button', { name: 'Log in', exact: true }).click();
      await expect(page.locator('.haru-activity-track')).toBeVisible();

      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Library' })
        .click();

      const track = page.locator('.haru-shelf-track').first();
      await expect(track).toBeVisible();
      await expect.poll(async () => track.evaluate((node) => node.clientWidth > 0)).toBe(true);
      await settle(page);

      const covers = track.locator('.haru-shelf-page').first().locator('.haru-book-cover');
      const first = await covers.first().boundingBox();
      const last = await covers.last().boundingBox();
      expect(first).not.toBeNull();
      expect(last).not.toBeNull();

      const left = first?.x ?? 0;
      const top = first?.y ?? 0;
      const width = first?.width ?? 0;
      const height = first?.height ?? 0;
      const centerX = Math.round(left + width / 2);
      const middleY = Math.round(top + height / 2);
      const rightEdge = Math.round((last?.x ?? 0) + (last?.width ?? 0));

      const probes = [
        { name: '위', x: centerX, y: Math.round(top) - SHELF_PROBE.above },
        { name: '아래', x: centerX, y: Math.round(top + height) + SHELF_PROBE.below },
        { name: '좌', x: Math.round(left) - SHELF_PROBE.side, y: middleY },
        { name: '우', x: rightEdge + SHELF_PROBE.side - 1, y: middleY },
      ] as const;

      const withShadow = await Promise.all(probes.map((probe) => pixelAt(page, probe.x, probe.y)));
      await page.addStyleTag({
        content: '.haru-book-cover--lg { box-shadow: none !important; }',
      });
      await settle(page);
      const withoutShadow = await Promise.all(
        probes.map((probe) => pixelAt(page, probe.x, probe.y)),
      );

      probes.forEach((probe, index) => {
        const delta = distance(withShadow[index] as Rgb, withoutShadow[index] as Rgb);
        expect(
          delta,
          `${probe.name} (${probe.x}, ${probe.y}) 에서 표지 그림자가 보이지 않는다 (delta ${delta})`,
        ).toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
      });
    });
  }
});
