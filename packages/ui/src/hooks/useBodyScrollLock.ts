import { useEffect } from 'react';

/** 중첩 overlay 가 서로의 잠금을 풀지 않도록 잠금 수를 센다. */
let lockCount = 0;
let previousOverflow = '';

/**
 * Sheet / Dialog 가 열려 있는 동안 배경 스크롤을 잠근다 (Design Spec §4.21).
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return undefined;

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [active]);
}
