/**
 * Design Spec §9.1 모션 규격의 JS 대응값 (ms).
 *
 * CSS 는 `--motion-duration-*` 토큰을 직접 쓴다. 이 상수는 **타이머가 필요한 곳**
 * (Toast 자동 해제, Sheet/Dialog 퇴장 후 unmount)에서만 쓰며, 토큰 값이 바뀌면
 * 이 표를 함께 갱신한다 (값의 단일 기준은 `packages/design-tokens/src/semantic/motion.css`).
 */
export const MOTION_DURATION_MS = {
  instant: 100,
  fast: 180,
  base: 240,
  slow: 400,
  pulse: 1200,
} as const;

/**
 * Toast 기본 표시 시간 — Design Spec §4.12.
 * 액션이 있으면 키보드 사용자가 도달할 수 있도록 6000ms 이상을 유지한다.
 */
export const TOAST_DURATION_MS = {
  default: 4000,
  withAction: 6000,
} as const;
