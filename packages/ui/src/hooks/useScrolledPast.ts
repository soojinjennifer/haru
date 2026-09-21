import { useSyncExternalStore } from 'react';

function subscribeToScroll(onStoreChange: () => void): () => void {
  window.addEventListener('scroll', onStoreChange, { passive: true });
  return () => {
    window.removeEventListener('scroll', onStoreChange);
  };
}

function subscribeToNothing(): () => void {
  return () => {};
}

function getScrollY(): number {
  return window.scrollY;
}

function getServerScrollY(): number {
  return 0;
}

/**
 * 스크롤 위치가 임계값을 넘었는지 구독한다.
 * TopBar 가 투명 → glass 로 전환하는 기준이다 (Design Spec §6.1, RECOMMENDED).
 *
 * 외부 시스템(window) 구독이므로 `useSyncExternalStore` 를 쓴다.
 */
export function useScrolledPast(threshold: number, enabled = true): boolean {
  const scrollY = useSyncExternalStore(
    enabled ? subscribeToScroll : subscribeToNothing,
    getScrollY,
    getServerScrollY,
  );

  return enabled && scrollY > threshold;
}
