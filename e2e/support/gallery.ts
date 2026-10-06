/**
 * E2E 공통 도우미 — gallery 경로와 "결정적 상태" 대기.
 *
 * 시각 비교 전에 항상 같은 조건을 만든다.
 *   ① 폰트 로드 완료 (`document.fonts.ready`) — 글리프 교체로 인한 레이아웃 흔들림 제거
 *   ② 이미지·CSS 적용 후 한 프레임 대기
 * 애니메이션 정지는 Playwright 의 `animations: 'disabled'` 와 `reducedMotion: 'reduce'` 가 맡는다.
 */
import type { Page } from '@playwright/test';

export const GALLERY = {
  tokens: '/__dev/ui/tokens',
  components: '/__dev/ui/components',
  states: '/__dev/ui/states',
  responsive: '/__dev/ui/responsive',
  a11y: '/__dev/ui/a11y',
  frame: '/__dev/ui/frame',
} as const;

/**
 * dev 화면 루트. gallery 는 동적 import 로 들어오므로 `domcontentloaded` 만으로는
 * 아직 React 가 그리기 전이다 — 이 요소를 기다려야 DOM 조회가 헛돌지 않는다.
 */
const DEV_ROOT = '.haru-dev-root';

export async function gotoStable(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.locator(DEV_ROOT).waitFor({ state: 'attached' });
  await settle(page);
}

export async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  });
}

/**
 * **앱 화면**(dev gallery 가 아닌 실제 route)을 연다.
 *
 * gallery 는 `.haru-dev-root` 를 기다리지만 앱 화면에는 그 요소가 없다.
 * `main` 랜드마크가 붙어야 React 가 그린 것이다.
 */
export async function gotoApp(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.locator('main').waitFor({ state: 'attached' });
  await settle(page);
}

/** `?scenario=` 로 Mock scenario 를 지정해 연다 (URL 이 1순위 — Plan §16 D-5). */
export async function gotoScenario(page: Page, path: string, scenario: string): Promise<void> {
  await gotoStable(page, `${path}?scenario=${encodeURIComponent(scenario)}`);
}

/**
 * 시각 baseline 에서 **dev Scenario Panel 을 제외**한다 (사용자 결정 2026-10-06).
 *
 * 패널은 `import.meta.env.DEV` 가드 뒤에만 있고 `assert:no-mocks` 가 Production 산출물 0건을
 * 보증한다 — 즉 **Production 화면에 존재하지 않는 UI** 다. 그것이 baseline 에 함께 찍히면
 * 기준 이미지가 제품이 아닌 것을 담는다. 그래서 **찍을 때만** 가린다.
 *
 * 고치는 층은 **테스트 레이어**다. Production·dev 코드의 동작을 바꾸지 않는다 — 패널은 여전히
 * 렌더되고 DOM 에 있으며 클릭된다(`scenarios.spec.ts` · `tabs.spec.ts` 가 그걸 검증한다).
 * 바꾸는 것은 이 파일이 주입한 스타일시트가 적용된 **시각 스펙의 페이지뿐**이다.
 *
 * `display: none` 이 아니라 **`visibility: hidden`** 인 이유:
 *   ① 요소를 트리에서 빼지 않으므로 `:has(.haru-app-shell__bar-bottom)` 같은 선택자와
 *      DOM 조회가 보는 구조가 그대로다.
 *   ② 패널은 `position: fixed` 라 레이아웃 기여가 0 이다 — 가려도 다른 요소가 움직이지 않는다.
 *   ③ 그림자(`--shadow-rest`)까지 함께 사라진다. `e2e/shadow.spec.ts` 의 프로브가 같은 수단을
 *      쓰는 선례가 있다.
 *
 * `addInitScript` 라서 **그 페이지의 모든 이동에 적용된다**. 시각 스펙은 한 테스트 안에서
 * 여러 번 이동하므로(로그인 → Home) 한 번 거는 것으로 충분해야 한다.
 */
export async function hideDevPanel(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const apply = (): void => {
      const style = document.createElement('style');
      style.setAttribute('data-e2e', 'hide-dev-panel');
      style.textContent = '.haru-dev-panel { visibility: hidden !important; }';
      document.head.append(style);
    };

    if (document.head === null) {
      document.addEventListener('DOMContentLoaded', apply, { once: true });
    } else {
      apply();
    }
  });
}

/** Design Spec §10.2 의 시각 비교 블록. `data-demo` 로 표시되어 있다. */
export function demo(page: Page, id: string) {
  return page.locator(`[data-demo="${id}"]`);
}
