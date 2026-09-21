import { useEffect, useState } from 'react';

/**
 * Design Spec §4.21 · §4.22 의 overlay state.
 *
 * `opening`(entering)은 **CSS 진입 애니메이션**이 담당한다 — 마운트되는 순간
 * keyframes 가 처음부터 재생되므로 별도의 상태가 필요 없다.
 * JS 가 알아야 하는 것은 "퇴장 애니메이션이 끝날 때까지 마운트를 유지"뿐이다.
 */
export type PresenceState = 'open' | 'closing';

export interface Presence {
  /** DOM 에 렌더할지 여부. 퇴장 애니메이션 동안에도 true 다. */
  mounted: boolean;
  state: PresenceState;
}

/**
 * `open` prop 을 enter / exit 애니메이션이 있는 마운트 상태로 바꾼다.
 * Sheet · Dialog · Toast 가 공유한다.
 */
export function usePresence(open: boolean, exitDurationMs: number): Presence {
  const [previousOpen, setPreviousOpen] = useState(open);
  const [exiting, setExiting] = useState(false);

  // prop 이 바뀐 렌더에서 상태를 맞춘다 (react.dev "Adjusting state when a prop changes").
  // effect 로 미루면 퇴장 애니메이션이 시작되기 전에 언마운트된다.
  if (previousOpen !== open) {
    setPreviousOpen(open);
    setExiting(!open);
  }

  useEffect(() => {
    if (!exiting) return undefined;
    const timer = setTimeout(() => {
      setExiting(false);
    }, exitDurationMs);
    return () => {
      clearTimeout(timer);
    };
  }, [exiting, exitDurationMs]);

  return { mounted: open || exiting, state: open ? 'open' : 'closing' };
}
