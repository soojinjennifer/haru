import { useCallback, useSyncExternalStore } from 'react';

import { useScrollContainerRef } from '../layout/ScrollContainerContext';

function noopSubscribe(): () => void {
  return () => {};
}

/**
 * 스크롤 위치가 임계값을 넘었는지 구독한다.
 * TopBar 가 투명 → glass 로 전환하는 기준이다 (Stage 1 Design Spec §6.1).
 *
 * 구독 대상은 **`ScrollContainerProvider` 가 준 컨테이너**다 — 결정 `D-13`.
 * 앱의 스크롤 주체는 `window` 가 아니라 `AppShell` 뷰포트 div 이므로, provider 가 있으면
 * 그 요소의 `scroll` 을, 없으면 `window` 를 구독한다 (갤러리·테스트 폴백).
 *
 * `getSnapshot` 은 **boolean 을 반환**한다(결정 `D-13`). 스크롤 좌표를 그대로 돌려주면
 * 스크롤마다 스냅샷이 바뀌어 임계값 근처가 아니어도 리렌더가 발생한다.
 */
export function useScrolledPast(threshold: number, enabled = true): boolean {
  const containerRef = useScrollContainerRef();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!enabled) return noopSubscribe();
      const target: EventTarget = containerRef?.current ?? window;
      target.addEventListener('scroll', onStoreChange, { passive: true });
      return () => {
        target.removeEventListener('scroll', onStoreChange);
      };
    },
    [containerRef, enabled],
  );

  const getSnapshot = useCallback((): boolean => {
    if (!enabled) return false;
    const element = containerRef?.current ?? null;
    const scrollTop = element === null ? window.scrollY : element.scrollTop;
    return scrollTop > threshold;
  }, [containerRef, enabled, threshold]);

  const getServerSnapshot = useCallback((): boolean => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
