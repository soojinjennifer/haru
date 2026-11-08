/**
 * dev 측정판 보강 — Stage 4b `S4-H4` · AC-4-154 · AC-4-155 (`D4-144`). **dev route** (Production 에 없다 — `assert:no-mocks`).
 *
 * 실기기 측정값 자체는 사용자가 잰다(`D4-143` — AC-4-50 · AC-4-146 판정). 여기서는 측정판이 **도는지**만 본다:
 * Chromium 가짜 마이크(`--use-fake-device-for-media-stream`)로 ⑧ 5회 → 표 5행 + 끝점별 중위값, ⑨ → 실제
 * `resolveSessionMode` 판정 · 트랙 상태 · 감싸기 원복. 측정 동안 페이지 `console` 출력 0 (🔒).
 */
import { expect, test, type ConsoleMessage } from '@playwright/test';

import { settle } from '../../../../../e2e/support/gallery';

test.use({
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  },
  permissions: ['microphone'],
});

/**
 * 측정판(페이지 스크립트)이 낸 메시지만 남긴다 — 🔒 의도는 "측정판이 콘솔에 아무것도(PII 포함) 남기지 않는다".
 *
 * 제외 ① 개발 서버 자체 메시지: Vite 연결(`/@vite/client`) · React DevTools 안내(`react-dom` deps).
 * 제외 ② **스크립트 위치가 없는 브라우저 발신 메시지** (`D4-149` · `OBS-4B-9`): 브라우저가 스스로 내는 경고는
 *   `location()` 이 **문서 URL 자체 · line 0 · column 0** 이다. 실측(2026-11-07, 4319 dev 서버 실행 중
 *   design-tokens 재빌드 후) — Inter preload 미사용 경고 `{ url: '…/__dev/ui/recording-measure', line: 0, column: 0 }`.
 *   스크립트가 부른 `console.*` 는 그 모듈 URL(`/src/…` · `/@fs/…` · deps)과 실제 줄 번호를 갖는다 → 계속 잡힌다.
 *   위치가 빈 메시지(`url: ''`)는 제외하지 않는다(좁히지 않는다). 메시지 **문구**로 거르지 않는 이유: 다른 브라우저
 *   경고가 같은 경로로 또 새어 들어오지 않게 하면서, 측정판 출력은 문구와 무관하게 잡기 위해서다.
 */
function fromMeasureBoard(message: ConsoleMessage, documentUrl: string): boolean {
  const text = message.text();
  if (text.startsWith('[vite]') || text.includes('React DevTools')) return false;
  const { url, lineNumber, columnNumber } = message.location();
  const browserOrigin = url === documentUrl && lineNumber === 0 && columnNumber === 0;
  return !browserOrigin;
}

test('`S4-H4` 측정판 — ⑧ 시작 지연 5회 표 + 중위값 · ⑨ 판정 스트림 해제', async ({ page }) => {
  test.setTimeout(60_000);
  const logged: string[] = [];
  page.on('console', (message) => {
    if (fromMeasureBoard(message, page.url())) logged.push(`${message.type()}: ${message.text()}`);
  });
  // QA R2-9 주입: 측정판 모듈(RecordingMeasurePage.tsx) 응답 끝에 console.warn 1줄 추가 — 작업 트리는 바꾸지 않는다
  await page.route(/\/src\/dev\/recording-measure\/RecordingMeasurePage\.tsx/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({ response, body: `${body}\nconsole.warn('QA-R2-9 injected measure-board output');\n` });
  });
  // 이 dev 화면은 `.haru-dev-root` 가 두 겹이라(gallery 셸 + 측정판) `gotoStable` 의 strict 대기를 쓰지 않는다
  await page.goto('/__dev/ui/recording-measure', { waitUntil: 'domcontentloaded' });
  await page.locator('#measure-start-latency-run').waitFor();
  await settle(page);

  const run = page.locator('#measure-start-latency-run');
  for (let index = 1; index <= 5; index += 1) {
    await expect(run).toBeEnabled({ timeout: 15_000 });
    await run.click();
    await expect(page.locator('[data-measure-run]')).toHaveCount(index, { timeout: 15_000 });
  }
  await expect(run).toBeDisabled(); // 5회를 채우면 멈춘다

  const rows = page.locator('[data-measure-run]');
  for (let index = 0; index < 5; index += 1) {
    const cells = rows.nth(index).locator('td');
    await expect(cells.nth(1)).toHaveText(/^\d+ ms$/);
    await expect(cells.nth(2)).toHaveText(/^\d+ ms$/);
    await expect(cells.nth(3)).toHaveText('—');
  }
  const median = page.locator('[data-measure-median] td');
  await expect(median.nth(0)).toHaveText(/^\d+(\.\d+)? ms$/);
  await expect(median.nth(1)).toHaveText(/^\d+(\.\d+)? ms$/);
  await expect(page.locator('#measure-start-latency-env')).toContainText('timeslice 1000 ms');
  await expect(page.locator('#measure-start-latency-env')).toContainText('mimeType audio/');

  await page.locator('#measure-stream-release').click();
  const result = page.locator('#measure-stream-release-result');
  await expect(result).toContainText('판정 recorded', { timeout: 15_000 });
  await expect(result).toContainText('감싸기 원복 yes');
  // 권한이 이미 허용(`permissions: ['microphone']`)이면 판정은 상태만 읽고 스트림을 열지 않는다 — 열었다면 +1s 에 전부 ended
  const text = (await result.textContent()) ?? '';
  const opened = Number(/스트림 (\d+)/.exec(text)?.[1] ?? 'NaN');
  expect(Number.isNaN(opened)).toBe(false);
  if (opened > 0) {
    expect(
      /\+1s ([^모]*)/
        .exec(text)?.[1]
        ?.split(', ')
        .every((t) => t.endsWith(':ended')),
    ).toBe(true);
  } else {
    await expect(result).toContainText('판정이 마이크를 열지 않았다');
  }
  // 측정판 밖에는 감싸기가 남지 않는다
  expect(
    await page.evaluate(() => navigator.mediaDevices.getUserMedia.name !== 'watchedGetUserMedia'),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => (MediaRecorder.prototype.start as unknown as { name: string }).name !== 'watchedStart',
    ),
  ).toBe(true);
  // 표가 320 폭에서도 가로로 넘치지 않는다 (Spec §21.4)
  await page.setViewportSize({ width: 320, height: 568 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(0);
  expect(logged).toStrictEqual([]);
});
