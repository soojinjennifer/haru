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
 *   - 전체 프레임(`FRAME`) — 레이아웃 회귀 전용. 상한은 2026-10-08 부터 **50** 이다
 *     (`VISUAL_MAX_DIFF_PIXELS` 주석에 근거).
 *
 * **픽셀당** 색 차이 임계값은 2026-10-08 부터 두 종류 모두 `0.02` 다
 * (`VISUAL_THRESHOLD_REGION` · `VISUAL_THRESHOLD_FRAME` — 값이 같을 뿐 별개 상수다).
 */
export const VISUAL_MAX_DIFF_PIXEL_RATIO = 0.002;
/**
 * 전체 프레임 baseline 의 절대 픽셀 상한 (기본값) — **200 → 50** (사용자 결정 2026-10-08).
 *
 * 200 은 "폰트 힌팅·안티에일리어싱 누적 차이를 흡수한다" 는 근거로 정해졌다. 그 역할은 이제
 * `VISUAL_THRESHOLD_FRAME`(`0.02`)이 **더 정확하게** 한다 — 임계값이 픽셀당 색 차이를 먼저
 * 걸러내므로, 개수 상한이 저대비 노이즈를 흡수할 필요가 없다.
 *
 * 실측 근거 (2026-10-08, 이 환경 · `VISUAL_THRESHOLD_FRAME` 적용 후):
 *   - 전체 프레임 baseline 의 **렌더 노이즈 바닥 0px**
 *   - 코드 변경에서 온 리샘플 노이즈의 **최악 사례 5px**(`s3-home` 의 BookCover 재샘플 —
 *     변화 픽셀 1108개 중 `0.02` 를 넘긴 것이 5개)
 *
 * 50 은 그 최악 사례의 **10배 여유**이며, 통과 사각을 약 14×14 블록에서 **7×7 블록**으로
 * 줄인다. 영역 쪽 상한(`VISUAL_MAX_DIFF_PIXELS_REGION` = 20)과는 별개 상수다.
 */
export const VISUAL_MAX_DIFF_PIXELS = 50;
/** 영역 클립 baseline 의 절대 픽셀 상한 (D-12). */
export const VISUAL_MAX_DIFF_PIXELS_REGION = 20;

/**
 * 영역 클립 baseline 의 **픽셀당** 색 차이 임계값 (사용자 승인 2026-10-05).
 *
 * ⚠ `threshold` 와 `maxDiffPixels` 는 AND 가 아니라 **직렬**이다 — `threshold` 가 먼저 픽셀을
 * 걸러내고, 살아남은 픽셀만 개수 상한과 비교된다. 그래서 Playwright 기본값 **0.2** 를 쓰면
 * 개수 상한(20)이 아무리 빡빡해도 **저대비 회귀는 아예 세어지지 않는다**.
 *
 * 실측 근거 (Stage 3 카드 그림자 클리핑 수정 — approvals §12.15 · handoff §S6):
 * 그림자가 새로 그려져 **픽셀의 4~31% 가 바뀐 영역 baseline 7종 중 6종이 통과**했다.
 * `v6-bubble` 은 **68.72%** 가 다른데도 통과했다 (`V-10` 이전 `--shadow-rest` 3겹 시절 이미지가
 * 박혀 있었다) — 그림자 회귀에 대한 **검출력이 0** 이었다.
 *
 * 값 선정: 실제 그림자 변화의 최소 픽셀 변화량은 채널당 ~19 였고, 노이즈 수준 변화
 * (`s3-home-card-save-saved`, backdrop-filter 재래스터화)는 채널당 ~2.3 이었다. `0.02` 는
 * pixelmatch YIQ 기준 채널당 약 **5.3** 에 해당해 그 사이를 가른다.
 *
 * ⚠ **CI 이식성**: 렌더 노이즈 바닥은 **이 환경에서 실측 0** 이었다(코드 변경 없이 같은
 * baseline 을 2회 재생성 → 변화 픽셀 0개). 다른 macOS·CI 러너에서는 0 이 아닐 수 있다.
 * **CI 에서 flake 가 나면 값을 올리기 전에 노이즈 바닥을 먼저 실측한다** — 임계값을 먼저
 * 올리면 위와 같은 검출력 공백이 조용히 돌아온다.
 *
 * `FRAME_SNAPSHOT` 은 **같은 값을 따로 쓴다** — `VISUAL_THRESHOLD_FRAME` 참조.
 */
export const VISUAL_THRESHOLD_REGION = 0.02;

/**
 * 전체 프레임 baseline 의 **픽셀당** 색 차이 임계값 (사용자 결정 2026-10-08).
 *
 * 2026-10-05 에는 영역 쪽만 조이고 전체 프레임은 Playwright 기본값 `0.2` 로 남겼다
 * (`R-BASELINE-1` ④ 가 "전체 프레임 쪽 검출 공백은 Stage 8 회귀 설계에서 다시 본다" 로 남긴
 * 항목). **그 공백이 실제 결과를 냈다**: `0.2` 는 채널당 약 53 까지 세지 않으므로,
 * dev Scenario Panel 이 통째로 찍힌 `frame-1024` baseline 이 **살아남은 픽셀 143개**(당시
 * 상한 200)로 계속 통과하고 있었다. Production 에 없는 UI 가 기준 이미지에 박힌 채였다.
 *
 * 실측 (2026-10-08, 이 환경):
 *   - **렌더 노이즈 바닥 0px** — 코드 변경 없이 전체 시각 스펙을 2회 재생성했더니 baseline
 *     68종이 **바이트 단위로 동일**했다. 두 실행은 브라우저 프로세스가 서로 다르다.
 *   - **검출해야 할 것** — `frame-1024` 의 dev 패널은 채널당 최대 **127**,
 *     `0.02` 에서 살아남는 픽셀 **8481개**(현재 상한 50 의 **169배**) → 확실히 FAIL 한다.
 *   - **걸러야 할 것** — 이미지 리샘플·안티에일리어싱 띠는 채널당 **≤6**. 전체 프레임 중
 *     가장 큰 사례(`s3-home` 의 BookCover 재샘플, 1108px 변화)가 `0.02` 에서 **5개**만
 *     남는다 (현재 상한 50 의 **1/10**).
 *
 * 그래서 `0.02`(pixelmatch 기준 채널당 약 **5.3**)가 두 무리 **사이**를 가른다. 더 느슨한
 * 값은 검출력을 깎고, 더 빡빡한 값은 노이즈 쪽 여유만 깎는다 — `0.002` 는 같은 `s3-home`
 * 에서 **868개**가 남아 어느 상한으로도 **오탐**이 된다.
 *
 * ⚠ 영역 쪽과 값이 같은 것은 **우연이 아니라 측정 결과가 같은 경계를 가리켰기 때문**이다.
 * 둘은 서로 다른 상수이며 한쪽을 바꿔도 다른 쪽은 따라가지 않는다.
 *
 * ⚠ **CI 이식성**: 위 여유(검출 169배 / 노이즈 1/10)는 이 머신 실측이다. 다른 러너의 폰트
 * 힌팅 차이는 노이즈가 아니라 **글리프 모양 차이**라 채널당 5.3 을 쉽게 넘는다. 그런 러너에서는
 * 임계값을 올리지 말고 **플랫폼별 baseline**(`snapshotPathTemplate` 의 `{platform}`)을 새로
 * 만든다 — 임계값을 올리면 위와 같은 검출 공백이 조용히 돌아온다.
 */
export const VISUAL_THRESHOLD_FRAME = 0.02;

/** 영역 클립 baseline 비교 옵션 — `expect(locator).toHaveScreenshot(name, REGION_SNAPSHOT)`. */
export const REGION_SNAPSHOT = {
  maxDiffPixelRatio: VISUAL_MAX_DIFF_PIXEL_RATIO,
  maxDiffPixels: VISUAL_MAX_DIFF_PIXELS_REGION,
  threshold: VISUAL_THRESHOLD_REGION,
} as const;

/**
 * 전체 프레임 baseline 비교 옵션.
 *
 * ⚠ `threshold` 와 `maxDiffPixels` 는 AND 가 아니라 **직렬**이다 — `threshold` 가 먼저 픽셀을
 * 걸러내고 **살아남은 수**만 상한 50 과 비교된다. 상한 50 은 노이즈 흡수용이 아니라
 * (실측 노이즈 0, 최악 사례 5) **다른 러너를 위한 10배 여유**다. 남는 사각: 전체 프레임에서
 * 채널당 5.3 이상 바뀐 픽셀이 **50개 이하**(약 7×7 블록)인 회귀는 여전히 통과한다 —
 * 컴포넌트 단위 정밀도는 `REGION_SNAPSHOT`(상한 20)이 맡는다.
 */
export const FRAME_SNAPSHOT = {
  maxDiffPixelRatio: VISUAL_MAX_DIFF_PIXEL_RATIO,
  maxDiffPixels: VISUAL_MAX_DIFF_PIXELS,
  threshold: VISUAL_THRESHOLD_FRAME,
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
      // 기본값은 전체 프레임 쪽과 같게 둔다 — 옵션을 빠뜨린 호출이 Playwright 기본 `0.2`
      // (채널당 ~53 까지 세지 않음)로 조용히 떨어지지 않게 한다.
      maxDiffPixelRatio: VISUAL_MAX_DIFF_PIXEL_RATIO,
      maxDiffPixels: VISUAL_MAX_DIFF_PIXELS,
      threshold: VISUAL_THRESHOLD_FRAME,
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
