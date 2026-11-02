import { useLayoutEffect, useRef, useState } from 'react';

/**
 * 세션 pill 목록이 넘치는가 (`S4-K1` · `D4-78`, Spec §9.3) — 뷰포트 높이가 바뀌면 다시 잰다. `active` 동안만
 * (닫힌 팝업은 `display: none`). 넘칠 때만 목록을 Tab 정지점으로 만들기 위해 쓴다 (`scrollable-region-focusable`).
 */
export function useListOverflows(active: boolean) {
  const listRef = useRef<HTMLUListElement | null>(null);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!active || list === null) return undefined;
    const measure = () => {
      setOverflows(list.scrollHeight > list.clientHeight);
    };
    measure();
    if (typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => {
      observer.disconnect();
    };
  }, [active]);

  return { listRef, overflows: active && overflows };
}
