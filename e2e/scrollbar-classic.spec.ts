/**
 * 클래식(항상 보이는) 스크롤바 회귀 — Stage 4b `S4-H4` · AC-4-99 ③ · `QA-4B-004` · `D4-141` · `AD-S4-27`.
 *
 * **이 파일은 `chromium-classic-scrollbar` project 에서만 돈다** (`playwright.config.ts`). 그 project 는 headless 기본
 * 인자 `--hide-scrollbars` 를 빼서 Windows Chrome 기본 · macOS "스크롤 막대 항상 보기" 와 같은 **15px 스크롤바**를
 * 만든다. 기본 project 는 스크롤바 폭이 0 이라 이 결함을 재현할 수 없었다 (QA 프로브 P6).
 *
 * 양축 프로브 (`R-SHADOW-1` ⑥ — 스크롤 박스를 바꿨으면 세로·가로를 함께 본다):
 *   가로 ① 앱 스크롤 박스(`[data-app-shell-viewport]`) `scrollWidth ≤ clientWidth` ② 문서도 가로 넘침 0
 *        ③ 컬럼 중심 = 스크롤 박스 `clientWidth` 중심 ±0.5 (NB-17 ⓐ — 창 기준이 아니다) ④ 컬럼 폭 = `min(clientWidth, 480)`
 *   세로 ⑤ 문서(창)는 세로로 스크롤되지 않는다 — 스크롤 주체는 앱 스크롤 박스 하나다
 * + 실제로 클래식 스크롤바 환경인지(스크롤이 생긴 화면의 `offsetWidth − clientWidth > 0`)를 함께 확인한다 —
 *   설정이 조용히 빠져도 이 파일이 헛돌지 않게.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp, hideDevPanel } from './support/gallery';
import { logInToHome, startSession } from './support/session';

interface Probe {
  clientWidth: number;
  scrollWidth: number;
  gutter: number;
  scrolls: boolean;
  docOverflowX: number;
  docOverflowY: number;
  columnWidth: number;
  columnCenter: number;
  boxCenter: number;
}

async function probe(page: Page): Promise<Probe> {
  return page.evaluate(() => {
    const box = document.querySelector<HTMLElement>('[data-app-shell-viewport]');
    const column = box?.querySelector<HTMLElement>('.haru-app-column');
    if (box === null || column === null || column === undefined) {
      throw new Error('app shell viewport / column not found');
    }
    const boxRect = box.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    const root = document.documentElement;
    return {
      clientWidth: box.clientWidth,
      scrollWidth: box.scrollWidth,
      gutter: box.offsetWidth - box.clientWidth,
      scrolls: box.scrollHeight > box.clientHeight,
      docOverflowX: root.scrollWidth - root.clientWidth,
      docOverflowY: root.scrollHeight - root.clientHeight,
      columnWidth: columnRect.width,
      columnCenter: columnRect.left + columnRect.width / 2,
      boxCenter: boxRect.left + box.clientLeft + box.clientWidth / 2,
    };
  });
}

function expectNoOverflow(result: Probe): void {
  expect(result.scrollWidth, 'app scroll box horizontal overflow').toBeLessThanOrEqual(
    result.clientWidth,
  );
  expect(result.docOverflowX, 'document horizontal overflow').toBeLessThanOrEqual(0);
  expect(result.docOverflowY, 'document must not scroll vertically').toBeLessThanOrEqual(0);
  expect(Math.abs(result.columnCenter - result.boxCenter)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(result.columnWidth - Math.min(result.clientWidth, 480))).toBeLessThanOrEqual(0.5);
  if (result.scrolls) expect(result.gutter, 'classic scrollbar present').toBeGreaterThan(0);
}

const SIZES = [
  { width: 320, height: 568 },
  { width: 320, height: 852 },
  { width: 393, height: 600 },
  { width: 600, height: 800 },
  { width: 1024, height: 500 },
] as const;

const label = (size: { width: number; height: number }) => `${size.width}×${size.height}`;

test.describe('클래식 스크롤바 — 가로 넘침 0 · 컬럼 = clientWidth 가운데 (AC-4-99 ③)', () => {
  // dev Scenario Panel(`position: fixed`, Production 에 없음)이 320 폭에서 `Submit` 을 덮는다 — 레이아웃 기여 0 이라 가린다
  test.beforeEach(async ({ page }) => {
    await hideDevPanel(page);
  });

  test('환경 확인 — 이 project 는 스크롤바 폭이 0 이 아니다 (320×568 Library)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await logInToHome(page);
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Library' })
      .click();
    await expect(page.locator('.haru-library-shelves')).toBeVisible();
    const result = await probe(page);
    expect(result.scrolls).toBe(true);
    expect(result.gutter).toBe(15);
    // 수정 전에는 clientWidth 305 · scrollWidth 320 (넘침 15) 이었다 — `AD-S4-27`: 컬럼 305
    expect(result.clientWidth).toBe(305);
    expect(result.columnWidth).toBe(305);
    expectNoOverflow(result);
  });

  for (const size of SIZES) {
    test(`${label(size)} — Welcome · 온보딩 첫 화면 (Stage 2)`, async ({ page }) => {
      await page.setViewportSize(size);
      await gotoApp(page, '/auth/welcome');
      expectNoOverflow(await probe(page));
      await gotoApp(page, '/onboarding');
      expectNoOverflow(await probe(page));
    });

    test(`${label(size)} — Home · Library (Stage 3 탭)`, async ({ page }) => {
      await page.setViewportSize(size);
      await logInToHome(page);
      expectNoOverflow(await probe(page));
      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Library' })
        .click();
      await expect(page.locator('.haru-library-shelves')).toBeVisible();
      expectNoOverflow(await probe(page));
    });

    test(`${label(size)} — 세션 ready · recording · 완료 (Stage 4)`, async ({ page }) => {
      await page.setViewportSize(size);
      await startSession(page);
      expectNoOverflow(await probe(page));
      await page.getByRole('button', { name: 'Start recording' }).click();
      await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
      expectNoOverflow(await probe(page));
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
      expectNoOverflow(await probe(page));
    });
  }
});

/**
 * `VG-H4-09` · `D4-147` — 클래식 320×568 Home 버블 보조 줄(Figma `nowrap`)이 버블 오른쪽 가장자리를 넘지 않는다.
 *
 * 수정 전: 버블 39–281(폭 242) 인데 보조 줄 글자 끝이 283 → 잉크가 x281·282 에서 배경 위에 그려졌다.
 * 수정 후: 보조 줄 박스 끝 = 버블 끝(오른쪽 padding 만큼 늘려 자름) · 넘치는 분량만 말줄임.
 * `D4-148`(`U-2`): 박스 끝 = 버블 끝 − `--space-2`(8) = 273 — 말줄임 점이 오른쪽 아래 곡선(r22)에 닿지 않는다.
 * 박스 끝 오른쪽(273–284)에 잉크 0 이면 곡선 틈 ≥ 5.33 이 문구와 무관하게 보증된다.
 *
 * 글리프 끝은 Range rect 로 잴 수 없다(말줄임 뒤에도 Range 는 원문 전체 폭을 돌려준다). 그래서
 * ① 박스 기하(박스 끝 ≤ 버블 끝 · `overflow` 가 클립) + ② 픽셀 토글(`R-BASELINE-1` ⑥) — 버블 바로 바깥 띠를
 * 글자를 투명하게 했을 때와 비교해 **같으면** 보조 줄 잉크가 버블 밖에 없다는 뜻이다.
 */
test.describe('클래식 320×568 Home — 버블 보조 줄이 버블 안에 머문다 (`VG-H4-09` · `D4-147` · `D4-148`)', () => {
  test.beforeEach(async ({ page }) => {
    await hideDevPanel(page);
  });

  test('보조 줄 박스 끝 ≤ 버블 끝 · 말줄임 · 버블 밖 잉크 0', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await logInToHome(page);
    const bubble = page.locator('.haru-home-stage__bubble .haru-bubble');
    const hint = bubble.locator('.haru-bubble__hint');
    await expect(hint).toBeVisible();

    const geometry = await hint.evaluate((element) => {
      const bubbleBox = element.closest('.haru-bubble')!.getBoundingClientRect();
      const hintBox = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        bubbleRight: bubbleBox.right,
        hintRight: hintBox.right,
        hintTop: hintBox.top,
        hintBottom: hintBox.bottom,
        overflowX: style.overflowX,
        textOverflow: style.textOverflow,
        whiteSpace: style.whiteSpace,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      };
    });
    // 이 환경이 결함 조건인지 — 컬럼 305 → 버블 242
    expect(geometry.bubbleRight).toBe(281);
    expect(geometry.whiteSpace).toBe('nowrap');
    expect(geometry.hintRight).toBe(geometry.bubbleRight - 8);
    expect(geometry.hintRight).toBe(273);
    expect(geometry.overflowX).toBe('hidden');
    expect(geometry.textOverflow).toBe('ellipsis');
    // 문구(228)가 박스(218)보다 길다 → 말줄임이 실제로 걸린 상태
    expect(geometry.scrollWidth).toBeGreaterThan(geometry.clientWidth);

    const strip = {
      // 박스 끝 ~ 버블 끝 + 4 (273–284) — 박스 끝 오른쪽에 보조 줄 잉크가 없어야 한다
      x: geometry.hintRight,
      y: Math.floor(geometry.hintTop),
      width: geometry.bubbleRight - geometry.hintRight + 4,
      height: Math.ceil(geometry.hintBottom) - Math.floor(geometry.hintTop),
    };
    const withText = await page.screenshot({ clip: strip, animations: 'disabled' });
    await hint.evaluate((element) => {
      element.style.setProperty('color', 'transparent');
    });
    const withoutText = await page.screenshot({ clip: strip, animations: 'disabled' });
    expect(withText.equals(withoutText), 'hint glyph ink right of the clip box (273–284)').toBe(
      true,
    );
  });
});
