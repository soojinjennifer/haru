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

/*
 * ───────────────────────────────────────────────────────────────────────────
 * ⭐ `Sheet contentShadowInset` 의 **첫 실사용처** — `LibraryShelfSheet` ("See all")
 *
 * `.haru-sheet__content { overflow-y: auto }` 는 **기존 선언**이고(Stage 2) "See all" 은 전체
 * 목록이라 실제로 스크롤한다 → 그 박스가 `ListGroup` 의 `--shadow-bubble` 을 자른다.
 *
 * 번짐은 **픽셀 프로브 실측**이다 (빌드 산출물 `apps/web/dist/assets/index-*.css` · 흰 배경 ·
 * `deviceScaleFactor: 1` · 순백 대비 채널차 합):
 *
 *   | 임계값 | 위 | 아래 | 좌 | 우 |
 *   |---|---|---|---|---|
 *   | Δ≥1 | **0** | **10** | **4** | **4** |
 *   | Δ≥8 | 0 | 8 | 2 | 2 |
 *
 *   프로파일(아래) `35,35,32,31,28,19,16,10,4,3,0,…` — 10px 에서 완전히 사라진다.
 *   `--shadow-bubble` 은 drop **1겹**(`0 6px 4px`)이라 **누락할 겹이 없고** 산술과 일치한다
 *   (아래 6+4=10 · 위 −6+4<0 → 0 · 좌우 ±4).
 *   방법 검정: 같은 방법으로 `--shadow-glass-rest`(3겹)를 재면 아래 **78** · 위 **22** ·
 *   좌우 **50** 이 나와 기존 기록을 재현한다.
 *
 * **보정 전/후 실증 — 실제 시트에서 측정했다** (`R-SHADOW-1` ② · ⑥, 393×852 · 끝까지 스크롤):
 *
 *   | | 아래 +0..+12 (목록 하단 기준) | 우 +0..+6 |
 *   |---|---|---|
 *   | 보정 **있음** | `55 47 39 31 28 25 16 16 10 4 3 0 0` → **10px 복원** | `0 16 10 4 3 0 0` → **4px 복원** |
 *   | 보정 **없음** | `22 0 0 0 0 0 0 0 0 0 0 0 0` → **완전 절단** | `0 0 0 0 0 0 0` → **완전 절단** |
 *
 *   (`아래+0` 은 상자 **안쪽** 마지막 픽셀이라 inset 겹 때문에 0 이 아니다 — 두 경우 모두.)
 *   아래 두 테스트가 그 양쪽을 고정한다.
 * 보정이 지워지면 "보정 있음" 이 실패하고, 프로브가 무의미해지면(= 아무 조건에서나 통과하면)
 * "보정 없음" 이 실패한다.
 */
const SHEET_PROBE = { below: 4, side: 2 } as const;

interface ProbeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Shelf 시트를 열고 본문을 **끝까지 스크롤**한 뒤 목록 상자 좌표를 돌려준다. */
async function openShelfSheetAtBottom(page: Page) {
  await page.goto('/auth/log-in', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.locator('.haru-activity-track')).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Library' })
    .click();
  await expect(page.locator('.haru-library-shelves')).toBeVisible();

  // 큐레이션은 9권이라 시트 본문이 **실제로** 스크롤한다.
  await page.getByRole('button', { name: 'See all Our curated shelf' }).click();
  const sheet = page.locator('.haru-sheet--inset-card');
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('.haru-list-row').first()).toBeVisible();
  await settle(page);

  const scrollable = await scrollSheetContentToBottom(page);
  expect(
    scrollable,
    '시트 본문이 스크롤하지 않으면 이 테스트는 아무것도 보지 못한다',
  ).toBeGreaterThan(0);

  const box = await sheet.locator('.haru-list-group').boundingBox();
  expect(box).not.toBeNull();
  return box as ProbeBox;
}

/**
 * 시트 본문을 **끝까지** 내린다.
 *
 * ⚠️ 한 번만 대입하면 안 된다 — 스타일을 바꿔 내용 높이가 줄면 Chrome 의 **scroll
 * anchoring** 이 `scrollTop` 을 되돌려, 목록 하단이 클립 선에서 2~3px 떨어진 채로 측정된다
 * (실측: 보정 제거 직후 Δ 프로파일이 `55,16,7,2,0…` 로 3px 남았다). 프레임마다 다시 대입해
 * **최댓값에 도달한 것을 단언**한다.
 */
async function scrollSheetContentToBottom(page: Page): Promise<number> {
  const scrollable = await page.evaluate(async () => {
    const content = document.querySelector('.haru-sheet__content');
    if (content === null) throw new Error('시트 본문을 찾지 못했다');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      content.scrollTop = content.scrollHeight;
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });
    }
    return {
      max: content.scrollHeight - content.clientHeight,
      top: Math.round(content.scrollTop),
    };
  });

  expect(scrollable.top, '본문이 끝까지 내려가지 않았다 (scroll anchoring)').toBe(scrollable.max);
  await settle(page);
  return scrollable.max;
}

/** 목록 상자 아래·우측 바깥에서 그림자 Δ 를 잰다. */
async function measureSheetShadow(page: Page, box: ProbeBox) {
  const probes = [
    {
      name: '아래',
      x: Math.round(box.x + box.width / 2),
      y: Math.round(box.y + box.height) - 1 + SHEET_PROBE.below,
    },
    {
      name: '우',
      x: Math.round(box.x + box.width) - 1 + SHEET_PROBE.side,
      y: Math.round(box.y + box.height / 2),
    },
  ] as const;

  const withShadow = await Promise.all(probes.map((probe) => pixelAt(page, probe.x, probe.y)));
  await page.addStyleTag({
    content: '.haru-sheet .haru-list-group { box-shadow: none !important; }',
  });
  await settle(page);
  const withoutShadow = await Promise.all(probes.map((probe) => pixelAt(page, probe.x, probe.y)));

  return probes.map((probe, index) => ({
    name: probe.name,
    x: probe.x,
    y: probe.y,
    delta: distance(withShadow[index] as Rgb, withoutShadow[index] as Rgb),
  }));
}

test.describe('시트 본문 그림자 inset — 보정 **있음** (R-SHADOW-1 · 첫 실사용처)', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await hideDevPanel(page);

      const box = await openShelfSheetAtBottom(page);
      const results = await measureSheetShadow(page, box);

      for (const result of results) {
        expect(
          result.delta,
          `${result.name} (${result.x}, ${result.y}) 에서 목록 그림자가 보이지 않는다 (delta ${result.delta})`,
        ).toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
      }
    });
  }
});

test.describe('시트 본문 그림자 inset — 보정 **없음** 이면 전면 절단된다 (프로브가 실제로 문다)', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await hideDevPanel(page);

      await openShelfSheetAtBottom(page);

      /*
        보정을 **런타임에 되돌린다** (`R-BASELINE-1` ⑥ 의 토글 방식). padding 과 음수 margin
        짝을 지우면 `overflow-y: auto` 박스의 경계가 곧 목록의 경계가 되어 그림자가 사라진다.
      */
      await page.addStyleTag({
        content:
          '.haru-sheet__content--shadow-inset { padding: 0 !important; margin: 0 !important; }',
      });
      await scrollSheetContentToBottom(page);

      const reBox = await page.locator('.haru-sheet .haru-list-group').boundingBox();
      expect(reBox).not.toBeNull();
      const results = await measureSheetShadow(page, reBox as ProbeBox);

      for (const result of results) {
        expect(
          result.delta,
          `${result.name} (${result.x}, ${result.y}) 에서 그림자가 **보였다** — 보정 없이도 통과하면 프로브가 무의미하다 (delta ${result.delta})`,
        ).toBeLessThan(MIN_SHADOW_DELTA);
      }
    });
  }
});

/*
 * ───────────────────────────────────────────────────────────────────────────
 * ⭐ `BookDetailSheet` **뒷면 목록** — 뒤집기로 생긴 새 `overflow` 박스
 *   (사용자 결정 2026-10-09 `L-R2B-02`, `R-SHADOW-1` ② · ⑥)
 *
 * 뒷면의 `[pill, 코칭 노트]` 목록은 앞면 높이를 넘으면 **자기 안에서** 스크롤한다
 * (`.haru-book-sheet__notes`). 그 박스의 하단 클립 선은 **마지막 항목의 하단과 정확히
 * 겹치므로**, 자식에 drop shadow 가 하나라도 생기면 즉시 전면 절단된다.
 *
 * ── 실측 ① 지금 이 안의 자식은 **그림자를 갖지 않는다** ──
 * `PromptPill--tinted` 는 면(배경)뿐이고 `CoachingNote` 는 `Surface material="none"`
 * (= `box-shadow: none`) 이다. 뒷면 전 자식의 `getComputedStyle().boxShadow` 가 **전부
 * `none`** 이고, 마지막 항목 **네 방향** 픽셀 프로브도 **전부 Δ=0** 이다
 * (아래/위/좌/우 각 8~14px, 393×852, dev 서버 · dSF 1):
 *
 *   below `0,0,0,0,0,0,0,0,0,0,0,0,0,0` · above `0×8` · left `0×8` · right `0×8`
 *
 * **추정하지 않았다** — 소스에서 "그림자가 없다" 를 읽은 뒤 브라우저에서 다시 쟀다.
 *
 * ── 실측 ② 그래도 **아래 자리(10)를 미리 만든다** ──
 * `--shadow-bubble` 번짐 = 아래 **10** · 위 0 · 좌우 **4** (2라운드-2 재측정값, 1겹이라
 * 빠뜨릴 겹이 없다). 그 값을 담은 기존 토큰(`--sheet-content-shadow-inset-block-end`)을
 * `padding-block-end` 로 쓴다. 스크롤 박스의 padding 은 **스크롤 영역에 포함**되므로 음수
 * margin 이 필요 없다 — 더하면 박스가 뒷면 밖으로 10px 삐져나와 `.haru-sheet__content`
 * (또 다른 클리핑 박스)에 잘린다.
 *
 * ── 보정 전/후 (pill 에 `--shadow-bubble` 을 **주입**해 측정) ──
 *
 *   | | 마지막 pill 아래 −1…+12 |
 *   |---|---|
 *   | 보정 **있음** | `22 32 32 29 28 25 16 15 10 4 3 0 0 0` → **10px 복원** |
 *   | 보정 **없음** | `22 0 0 0 0 0 0 0 0 0 0 0 0 0` → **완전 절단** |
 *
 *   (`−1` 은 상자 **안쪽** 마지막 픽셀이라 두 경우 모두 0 이 아니다.)
 *   주입해서 재는 이유: 실제 자식이 그림자를 갖지 않으므로 **자리가 작동하는지**는 그렇게만
 *   증명된다. 세 번째 테스트가 "자식에 drop shadow 가 없다" 를 고정하므로, 누군가 그림자를
 *   더하면 그 테스트가 먼저 실패하고 **좌우 자리**(아래 참고)를 함께 설계하게 된다.
 *
 * ── 좌우는 여기서 해결할 수 없다 (기록) ──
 * 주입 상태에서 우측 프로파일은 보정 유무와 **무관하게** `3,0,0,…` 이다. 목록 상자는 본문
 * 폭을 꽉 채우므로 폭을 넓히면 `.haru-sheet__content` 가 자른다. 본문 폭을 꽉 채우는 그림자
 * 상자가 실제로 생기면 `Sheet contentShadowInset`(= `.haru-sheet__content` 에 좌우 4 + 음수
 * margin)을 함께 켜야 한다 — `LibraryShelfSheet` 와 같은 처리다.
 */
const NOTES_SHADOW_PROBE_PX = 4;

/** 책 시트를 **앞면**으로 연다. */
async function openBookSheetFront(page: Page): Promise<void> {
  await page.goto('/auth/log-in', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.locator('.haru-activity-track')).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Library' })
    .click();
  await expect(page.locator('.haru-library-shelves')).toBeVisible();

  await page.locator('.haru-shelf-item--pressable').first().click();
  const sheet = page.locator('.haru-sheet--inset-card');
  await expect(sheet).toBeVisible();
  // Prompt 가 와야 뒷면이 존재한다 (노트가 있을 때만 뒤집을 수 있다).
  await expect(sheet.locator('.haru-prompt-pill').first()).toBeVisible();
  /*
    ⚠️ 측정 함정 — 시트 면은 반투명이라 **뒤쪽 서재 그림**이 비친다. 표지 이미지가 아직
    도착하는 중이면 두 번의 1×1 촬영 사이에 배경이 바뀌어 Δ 가 통째로 오염된다
    (실측: 전 구간 Δ 30~60). `networkidle` 까지 기다린 뒤에 잰다.
  */
  await page.waitForLoadState('networkidle');
  await settle(page);
}

/** 책 시트를 열고 **뒷면**으로 뒤집는다. */
async function openBookSheetBack(page: Page): Promise<void> {
  await openBookSheetFront(page);
  await page.getByRole('button', { name: 'Show prompts and coaching notes' }).click();
  await settle(page);
}

/**
 * 뒷면 목록을 **끝까지** 내린다 — Shelf 시트와 같은 scroll anchoring 함정이 있다
 * (보정을 지우면 내용 높이가 줄어 Chrome 이 `scrollTop` 을 되돌린다).
 */
async function scrollNotesToBottom(page: Page): Promise<number> {
  const scrollable = await page.evaluate(async () => {
    const notes = document.querySelector('.haru-book-sheet__notes');
    if (notes === null) throw new Error('뒷면 목록을 찾지 못했다');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      notes.scrollTop = notes.scrollHeight;
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });
    }
    return {
      max: notes.scrollHeight - notes.clientHeight,
      top: Math.round(notes.scrollTop),
    };
  });

  expect(scrollable.top, '뒷면 목록이 끝까지 내려가지 않았다 (scroll anchoring)').toBe(
    scrollable.max,
  );
  await settle(page);
  return scrollable.max;
}

/** 마지막 pill 에 `--shadow-bubble` 을 주입하고 상자 **아래** Δ 를 잰다. */
async function measureInjectedNoteShadow(page: Page): Promise<number> {
  await page.addStyleTag({
    content: '.haru-book-sheet__note-item .haru-prompt-pill { box-shadow: var(--shadow-bubble); }',
  });
  const scrollable = await scrollNotesToBottom(page);
  expect(
    scrollable,
    '뒷면 목록이 스크롤하지 않으면 이 테스트는 아무것도 보지 못한다',
  ).toBeGreaterThan(0);

  const box = await page
    .locator('.haru-book-sheet__note-item .haru-prompt-pill')
    .last()
    .boundingBox();
  expect(box).not.toBeNull();

  const probe = {
    x: Math.round((box?.x ?? 0) + (box?.width ?? 0) / 2),
    y: Math.round((box?.y ?? 0) + (box?.height ?? 0)) - 1 + NOTES_SHADOW_PROBE_PX,
  };

  const withShadow = await pixelAt(page, probe.x, probe.y);
  await page.addStyleTag({
    content: '.haru-book-sheet__note-item .haru-prompt-pill { box-shadow: none !important; }',
  });
  await settle(page);
  const withoutShadow = await pixelAt(page, probe.x, probe.y);

  return distance(withShadow, withoutShadow);
}

test.describe('뒷면 목록 그림자 자리 — 보정 **있음** (R-SHADOW-1 · `L-R2B-02`)', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await hideDevPanel(page);

      await openBookSheetBack(page);
      const delta = await measureInjectedNoteShadow(page);

      expect(
        delta,
        `마지막 항목 아래 +${NOTES_SHADOW_PROBE_PX}px 에서 그림자가 보이지 않는다 (delta ${delta})`,
      ).toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
    });
  }
});

test.describe('뒷면 목록 그림자 자리 — 보정 **없음** 이면 전면 절단된다', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await hideDevPanel(page);

      await openBookSheetBack(page);
      /* 자리를 **런타임에 되돌린다** — 스크롤 박스의 클립 선이 곧 목록의 끝이 된다. */
      await page.addStyleTag({
        content: '.haru-book-sheet__notes { padding-block-end: 0 !important; }',
      });
      const delta = await measureInjectedNoteShadow(page);

      expect(
        delta,
        `그림자가 **보였다** — 자리 없이도 통과하면 프로브가 무의미하다 (delta ${delta})`,
      ).toBeLessThan(MIN_SHADOW_DELTA);
    });
  }
});

test('뒷면 목록 안에는 drop shadow 자식이 **없다** (좌우 자리는 이 상자에서 만들 수 없다)', async ({
  page,
}) => {
  await hideDevPanel(page);
  await openBookSheetBack(page);

  const shadows = await page.evaluate(() => {
    const back = document.querySelector('.haru-book-sheet__face--back');
    if (back === null) throw new Error('뒷면을 찾지 못했다');

    return [...back.querySelectorAll('*')]
      .map((node) => ({
        className: node.getAttribute('class') ?? '',
        boxShadow: getComputedStyle(node).boxShadow,
      }))
      .filter((entry) => entry.boxShadow !== 'none' && !entry.boxShadow.includes('inset'));
  });

  /*
    실패하면 이 상자에 **좌우 자리가 없다**는 사실이 함께 드러난다 — 폭을 넓히면
    `.haru-sheet__content` 가 자르므로 `Sheet contentShadowInset` 을 함께 켜야 한다
    (`LibraryShelfSheet` 와 같은 처리). 위 주석의 우측 프로파일(`3,0,0,…`)이 근거다.
  */
  expect(shadows, JSON.stringify(shadows)).toStrictEqual([]);
});

/*
 * ───────────────────────────────────────────────────────────────────────────
 * ⭐ `BookDetailSheet` **앞면 표지** 좌우 그림자 자리
 *   (사용자 결정 2026-10-09 ③, `R-SHADOW-1` ② · ③ · ⑥)
 *
 * ── 고친 결함 ──
 * 표지는 `--shadow-cover` 자리를 `padding/margin` 으로 만들어 두는데(`library.css`
 * `.haru-book-sheet__cover`), 그 좌측 14px 가 **시트 본문 밖**이라 두 클리핑 박스
 * (`.haru-sheet__content` 의 `overflow: auto`, `.haru-book-sheet__flip` 의 `overflow-x: clip`)
 * 에 **전면 절단**되어 있었다. 2라운드-2 부터 있던 결함이다.
 *   실측 (393×852 · dSF 1 · dev 서버 · 표지 좌측 1…20px):
 *     보정 전 `0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0` → 번짐 **0** (완전 절단)
 *     보정 후 `52 46 38 33 30 22 16 13 13 9 9 6 3 3 0 …` → 번짐 **14** (우측과 대칭)
 *
 * ── 번짐 **재측정** (추정하지 않았다 — `R-SHADOW-1` ③) ──
 * `--shadow-cover` 는 drop **1겹**(`0 6px 14px ink28%`) + inset 1겹이라 빠뜨릴 겹이 없다.
 * 같은 표지의 **우측**(= 잘리지 않는 쪽) 프로파일이 `52 46 41 34 30 25 19 16 13 9 9 6 3 3 0 …`
 * 로 **14** 이고, offset-x 가 0 이라 좌우가 대칭이다. 그래서 자리 값도 **14** 다 —
 * 1라운드가 등록한 좌우 4(`--shadow-bubble` 기준)로는 10px 이 모자란다.
 *   아래 **20** · 위 **8** 도 같은 패스에서 쟀고(아래 `99 91 86 … 3 3 0`), 그 자리는
 *   `.haru-book-sheet__cover` 가 이미 갖는다. ⚠️ **위 8 은 지금도 잘린다** — 자리를
 *   만들려면 본문 **위쪽**에도 inset 이 필요하고 그건 이번 결정 범위(좌우) 밖이다.
 *
 * ── ⚠️ 전제: 지금 이 표지에는 drop shadow 가 **없다** ──
 * `BookCover md` 는 그림자를 갖지 않고(`book.css`), Home 에서만 `activity-card.css` 가
 * `--activity-card-cover-shadow` 를 덮는다. 시트 표지는 그 범위 밖이라 `box-shadow: none`
 * 이다 (아래 마지막 테스트가 이 사실을 고정한다). 그래서 자리의 작동 여부는 **주입해서**
 * 잰다 — 뒷면 목록과 같은 방식이다. 표지에 그림자가 생기는 날 자리는 이미 준비되어 있다.
 */
const COVER_PROBE_PX = 4;
const COVER_SHADOW_ON =
  '.haru-book-sheet__cover .haru-book-cover { box-shadow: var(--shadow-cover) !important; }';
const COVER_SHADOW_OFF =
  '.haru-book-sheet__cover .haru-book-cover { box-shadow: none !important; }';

/** 표지 **좌측** 바깥에서 Δ 를 잰다 (그림자를 주입한 상태 ↔ 없는 상태). */
async function measureCoverLeftShadow(page: Page): Promise<number> {
  await page.addStyleTag({ content: COVER_SHADOW_ON });
  await settle(page);

  const box = await page.locator('.haru-book-sheet__cover .haru-book-cover').boundingBox();
  expect(box).not.toBeNull();
  const probe = {
    x: Math.round(box?.x ?? 0) - 1 - COVER_PROBE_PX,
    y: Math.round((box?.y ?? 0) + (box?.height ?? 0) / 2),
  };

  const withShadow = await pixelAt(page, probe.x, probe.y);
  await page.addStyleTag({ content: COVER_SHADOW_OFF });
  await settle(page);
  const withoutShadow = await pixelAt(page, probe.x, probe.y);

  return distance(withShadow, withoutShadow);
}

test.describe('표지 그림자 자리 — 보정 **있음** (`contentShadowInset="cover"` + flip 상자)', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await hideDevPanel(page);

      await openBookSheetFront(page);
      const delta = await measureCoverLeftShadow(page);

      expect(
        delta,
        `표지 좌측 −${COVER_PROBE_PX}px 에서 그림자가 보이지 않는다 (delta ${delta})`,
      ).toBeGreaterThanOrEqual(MIN_SHADOW_DELTA);
    });
  }
});

test.describe('표지 그림자 자리 — 보정 **없음** 이면 전면 절단된다 (2라운드-3 상태)', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await hideDevPanel(page);

      await openBookSheetFront(page);
      /* 두 박스의 자리를 **런타임에 되돌린다** (`R-BASELINE-1` ⑥ 토글). */
      await page.addStyleTag({
        content: `
          .haru-sheet__content--shadow-inset-cover { padding-inline: 0 !important; margin-inline: 0 !important; }
          .haru-book-sheet__flip { padding-inline: 0 !important; margin-inline: 0 !important; }
        `,
      });
      const delta = await measureCoverLeftShadow(page);

      expect(
        delta,
        `그림자가 **보였다** — 자리 없이도 통과하면 프로브가 무의미하다 (delta ${delta})`,
      ).toBeLessThan(MIN_SHADOW_DELTA);
    });
  }
});

test('안쪽 clip 박스(`__flip`)만 되돌려도 다시 잘린다 — 두 박스가 **같은 선**이어야 한다', async ({
  page,
}) => {
  await hideDevPanel(page);
  await openBookSheetFront(page);
  /*
    `Sheet contentShadowInset="cover"` 는 **그대로 둔다**. 그래도 안쪽의 `overflow-x: clip`
    상자가 먼저 자르므로 그림자가 사라진다 — 바깥만 켜는 수정은 무효라는 증거다.
  */
  await page.addStyleTag({
    content:
      '.haru-book-sheet__flip { padding-inline: 0 !important; margin-inline: 0 !important; }',
  });
  const delta = await measureCoverLeftShadow(page);

  expect(delta, `바깥 박스만 켜고도 그림자가 보였다 (delta ${delta})`).toBeLessThan(
    MIN_SHADOW_DELTA,
  );
});

test('시트 표지에는 지금 drop shadow 가 **없다** (자리는 주입해서 잰다)', async ({ page }) => {
  await hideDevPanel(page);
  await openBookSheetFront(page);

  const shadow = await page.evaluate(() => {
    const cover = document.querySelector('.haru-book-sheet__cover .haru-book-cover');
    if (cover === null) throw new Error('시트 표지를 찾지 못했다');
    return getComputedStyle(cover).boxShadow;
  });

  /*
    이 단언이 실패하면 **좋은 쪽의 변화**다 — 표지에 Figma `85:536` 의 `--shadow-cover` 가
    생겼다는 뜻이고, 자리는 이미 준비되어 있으므로 위 두 테스트를 주입 없이 재도록 바꾸면 된다.
    (Figma 에는 그림자가 있는데 구현에 없다는 사실 자체는 **승인 대기 보고 항목**이다.)
  */
  expect(shadow).toBe('none');
});
