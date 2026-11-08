/**
 * 세션 화면(ready · recording · paused) Toast — 문구 전용 Toast 표시 시간만 줄인다 (`D4-128`, 2026-11-04 사용자 결정).
 *
 * - 문구 전용(버튼 없음) = **3000ms** (`SESSION_TOAST_DURATION_MS`). y64 Toast 가 메달리온 상단과 겹치므로(`AD-S4-14`)
 *   짧게 보이고 사라진다.
 * - 버튼 있는 Toast = 손대지 않는다 → `packages/ui` 기본 `TOAST_DURATION_MS.withAction`(6000, 키보드 도달).
 * - 호출부가 `duration` 을 직접 넘기면 그 값을 그대로 쓴다.
 * - Home · 완료 화면 · 그 밖의 route 는 `packages/ui` 기본 4000 그대로다. 그래서 `Submit` · 30분 자동 종료 Toast
 *   (띄운 직후 완료 화면으로 이동해 **완료 화면에서 보인다**)는 이 훅을 쓰지 않는다.
 *
 * `packages/ui` 의 `TOAST_DURATION_MS` 기본값은 바꾸지 않는다 — 세션 화면 한정 결정이라 소유는 이 feature 다.
 */
import { useToast, type ToastController, type ToastOptions } from '@haru/ui';
import { useMemo } from 'react';

/** `D4-128` — 세션 화면 문구 전용 Toast 표시 시간 (ms). */
export const SESSION_TOAST_DURATION_MS = 3000;

export function useSessionToast(): ToastController {
  const toast = useToast();
  return useMemo<ToastController>(
    () => ({
      show: (options: ToastOptions) => {
        toast.show(
          options.action === undefined && options.duration === undefined
            ? { ...options, duration: SESSION_TOAST_DURATION_MS }
            : options,
        );
      },
      dismiss: toast.dismiss,
    }),
    [toast],
  );
}
