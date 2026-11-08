/**
 * 실시계 대신 **주입 clock** 으로 Toast 수명을 흘린다 — Stage 4b `S4-H4` · `QA-4B-003` · AC-4-156 (`D4-142`).
 *
 * ── 왜 ──
 * Toast 퇴장은 `setTimeout`(4~6s, `D4-136`) + 퇴장 180ms 다. 이것을 실시계로 8~10초 기다리던 테스트가 단독 전체 실행에서
 * 간헐 실패했다. 판별(handoff `S4-H4` ④):
 *   ① 실패 순간 **앱과 무관한** 페이지 `setInterval` 심장박동도 함께 멈췄다(QA P12 v1) — 제품 코드는 남의 interval 을
 *      멈출 수 없다
 *   ② 같은 동안 렌더 프레임도 0 이었는데(trace screencast 7.6s 공백) CDP 조회(locator 13회 · `evaluate`)는 응답했다 —
 *      페이지 JS 가 막힌 것이 아니라 **타이머·프레임 작업만 미뤄졌다**(OS·브라우저 스케줄링)
 *   ③ 타이머 억제 해제 인자(`--disable-background-timer-throttling` · `--disable-renderer-backgrounding` ·
 *      `--disable-backgrounding-occluded-windows`)는 Playwright 가 **이미 기본으로** 넣는다(playwright-core 1.63
 *      `chromiumSwitches`) — 더할 인자가 없다
 *   → 테스트 환경 요인. 그래서 **기다리는 방식**을 바꾼다: 시간을 테스트가 직접 앞당긴다(`page.clock.runFor`).
 *     `runFor` 는 CDP 로 페이지 안에서 가짜 타이머를 실행하므로 페이지의 실제 타이머가 미뤄져도 결과가 같다.
 *
 * 쓰는 테스트는 **페이지를 열기 전에** `page.clock.install()` 을 부른다(설치 전 걸린 실제 타이머는 앞당길 수 없다).
 * 고정 ms sleep 을 쓰지 않는다 — 조건이 맞는 순간 멈춘다(상태 기반).
 */
import { expect, type Locator, type Page } from '@playwright/test';

/** 한 번에 앞당기는 시간. Toast 퇴장 180ms 보다 작게 — 다음 Toast 가 뜨는 순간을 건너뛰지 않는다. */
const STEP_MS = 100;
/** Toast 최대 수명(6s, `D4-136`) + 퇴장 + 다음 Toast 대기열을 넉넉히 덮는 가짜 시간 상한. */
const DEFAULT_MAX_MS = 15_000;

/**
 * 조건이 참이 될 때까지 가짜 시간을 `STEP_MS` 씩 앞당긴다. 상한까지 참이 안 되면 실패한다.
 * 한 걸음마다 CDP 왕복이 있어 그 사이 React 커밋(MessageChannel)·effect 가 돈다.
 */
export async function advanceUntil(
  page: Page,
  condition: () => Promise<boolean>,
  label: string,
  maxMs: number = DEFAULT_MAX_MS,
): Promise<void> {
  for (let elapsed = 0; elapsed <= maxMs; elapsed += STEP_MS) {
    if (await condition()) return;
    await page.clock.runFor(STEP_MS);
  }
  expect(await condition(), `${label} (fake clock advanced ${String(maxMs)}ms)`).toBe(true);
}

/** Toast 가 모두 사라질 때까지 (자동 해제 타이머 + 퇴장). */
export async function advanceUntilToastGone(
  page: Page,
  toast: Locator = page.locator('.haru-toast'),
  maxMs?: number,
): Promise<void> {
  await advanceUntil(page, async () => (await toast.count()) === 0, 'toast gone', maxMs);
}

/** 이 문구의 Toast 가 뜰 때까지 (앞 Toast 퇴장 → 보류 안내 등). */
export async function advanceUntilToastText(
  page: Page,
  toast: Locator,
  text: string,
  maxMs?: number,
): Promise<void> {
  await advanceUntil(
    page,
    async () =>
      (await toast.count()) === 1 &&
      ((await toast.textContent()) ?? '').replace(/\s+/g, ' ').trim() === text,
    `toast "${text}"`,
    maxMs,
  );
}
