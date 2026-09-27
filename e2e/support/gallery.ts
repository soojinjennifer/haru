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

/** Design Spec §10.2 의 시각 비교 블록. `data-demo` 로 표시되어 있다. */
export function demo(page: Page, id: string) {
  return page.locator(`[data-demo="${id}"]`);
}
