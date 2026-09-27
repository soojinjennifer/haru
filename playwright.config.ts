/**
 * HARU E2E · 시각 비교 설정 — Stage 1 Plan §12 (E2E 행) · §16.1 D-10 · Design Spec §10.2.
 *
 * **결정성**이 이 설정의 목적이다. 시각 baseline 이 흔들리면 AC-1-24 비교가 무의미해진다.
 *   - 브라우저 1종 (Playwright 번들 Chromium — 설치된 Chrome 채널을 쓰지 않는다)
 *   - `deviceScaleFactor: 1` 고정, viewport 393×852 (Figma 기준 frame)
 *   - `prefers-reduced-motion: reduce` 기본 (모션 정지) + `animations: 'disabled'`
 *   - `workers: 1` — dev 서버 부하로 인한 렌더 타이밍 편차 제거
 *   - 폰트는 self-host 이므로 `document.fonts.ready` 대기로 충분하다 (외부 CDN 요청 0 — AC-1-14)
 *
 * 대상은 **dev 서버**다. UI gallery 는 dev 전용이며 Production 빌드에는 존재하지 않는다 (AC-1-42).
 */
import { defineConfig } from '@playwright/test';

/** dev 기본 포트(5173)와 겹치지 않는 고정 포트. `strictPort` 로 조용한 포트 이동을 막는다. */
const PORT = 4319;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * 시각 비교 임계값 — `S1-D2-6`(approvals §8) 확정값을 **결정 `D-12` 로 2종으로 나눈다**
 * (stage-2-approvals §4).
 *
 * 비율은 두 종류 모두 0.2% 이고, **절대 픽셀 상한만 용도에 따라 다르다**(둘 다 만족해야 통과).
 *   - 영역 클립(`REGION`) — Figma 대조용. 블록이 작으므로 상한 **20**.
 *     `S1-D2-6` 의 한계(작은 블록에서도 200px 변화를 통과시킴)를 여기서 해소한다.
 *   - 전체 프레임(`FRAME`) — 레이아웃 회귀 전용. 폰트 힌팅·안티에일리어싱 누적 차이를
 *     흡수해야 하므로 상한 **200** 을 유지한다.
 */
export const VISUAL_MAX_DIFF_PIXEL_RATIO = 0.002;
/** 전체 프레임 baseline 의 절대 픽셀 상한 (기본값). */
export const VISUAL_MAX_DIFF_PIXELS = 200;
/** 영역 클립 baseline 의 절대 픽셀 상한 (D-12). */
export const VISUAL_MAX_DIFF_PIXELS_REGION = 20;

/** 영역 클립 baseline 비교 옵션 — `expect(locator).toHaveScreenshot(name, REGION_SNAPSHOT)`. */
export const REGION_SNAPSHOT = {
  maxDiffPixelRatio: VISUAL_MAX_DIFF_PIXEL_RATIO,
  maxDiffPixels: VISUAL_MAX_DIFF_PIXELS_REGION,
} as const;

/** 전체 프레임 baseline 비교 옵션. */
export const FRAME_SNAPSHOT = {
  maxDiffPixelRatio: VISUAL_MAX_DIFF_PIXEL_RATIO,
  maxDiffPixels: VISUAL_MAX_DIFF_PIXELS,
} as const;

export default defineConfig({
  testDir: './e2e',
  // 플랫폼별 렌더 차이를 섞지 않는다. 다른 OS 에서는 baseline 을 새로 만든다.
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{testFileName}/{arg}{ext}',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: process.env['CI'] !== undefined,
  reporter: process.env['CI'] !== undefined ? [['list'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,

  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: VISUAL_MAX_DIFF_PIXEL_RATIO,
      maxDiffPixels: VISUAL_MAX_DIFF_PIXELS,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },

  use: {
    baseURL: BASE_URL,
    browserName: 'chromium',
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
  },

  projects: [{ name: 'chromium' }],

  webServer: {
    command: `pnpm --filter @haru/web run dev --port ${PORT} --strictPort --host 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: process.env['CI'] === undefined,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
