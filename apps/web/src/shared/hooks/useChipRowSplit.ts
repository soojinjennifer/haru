import { useCallback } from 'react';

/**
 * 첫 줄이 아닌 칩에 붙는 표시. 칩 묶음의 CSS(`reflection.css` · `entities/child/child.css`)가 이 칩의 위쪽 hit slop 만
 * 줄 사이 중간선까지로 줄인다.
 *
 * Stage 6 `S6-G` G-1a (`D6-9` ④): 아이 정보 언어 칩도 같은 분할을 쓰므로 `features/reflection/ui` 에서 **이동만** 했다
 * (feature 간 import 금지 — `rules/architecture.md` §3). 동작 변화 0.
 */
export const CHIP_ROW_FOLLOWS_ATTR = 'data-chip-row-follows';

/**
 * 칩 줄 사이 hit 영역 분할 (`D5-6`, 사용자 결정 2026-11-08).
 *
 * 칩은 시각 31/33 에 세로 hit slop 으로 44 를 만든다. 줄 간격이 7 이라 윗줄 아래 slop 과 아랫줄 위 slop 이
 * 겹치고, DOM 뒤쪽(아랫줄)이 위에 그려지므로 겹친 띠 전체를 아랫줄이 가져갔다.
 *
 * 분할: **첫 줄이 아닌 칩**의 위쪽 slop 을 줄 간격의 절반(중간선)까지로 줄인다. 아래쪽 slop 은 그대로 두고
 * 아랫줄이 위에 그려지므로, 겹친 띠는 정확히 중간선에서 나뉜다 — 윗줄 = 중간선 위, 아랫줄 = 중간선 아래.
 * 첫 줄 위쪽과 마지막 줄 아래쪽(겹침 없음)은 44 그대로다. 보이는 배치는 바뀌지 않는다.
 *
 * 어느 칩이 첫 줄인지는 줄바꿈(폭 · 선택에 따른 칩 폭 ±2)에 따라 달라서 CSS 로 고를 수 없다 → 렌더 후 잰다.
 * `offsetTop`(transform 영향 없음 — 누름 scale 중에도 같다)을 첫 칩과 비교한다. `items-start` 라 같은 줄의
 * 칩 top 은 같다. 측정 전·ResizeObserver 없는 환경에서는 표시가 없어 기존 동작(겹침)으로 남는다.
 *
 * 표시는 React 가 관리하지 않는 DOM 속성이다 — 칩 컴포넌트(`@haru/ui`)에 도메인 prop 을 늘리지 않기 위해서다.
 */
export function useChipRowSplit(): (group: HTMLElement | null) => (() => void) | undefined {
  return useCallback((group: HTMLElement | null) => {
    if (group === null) return undefined;
    const mark = () => {
      const chips = [...group.children].filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      const firstTop = chips[0]?.offsetTop;
      if (firstTop === undefined) return;
      for (const chip of chips) {
        // 같은 줄 = 같은 top. 줄 간격(≥ 38)에 비해 1px 미만 오차만 허용한다.
        if (chip.offsetTop - firstTop >= 1) chip.setAttribute(CHIP_ROW_FOLLOWS_ATTR, '');
        else chip.removeAttribute(CHIP_ROW_FOLLOWS_ATTR);
      }
    };
    mark();
    if (typeof ResizeObserver !== 'function') return undefined;
    // 그룹(폭 · 줄 수)과 각 칩(선택 시 33 ↔ 31)의 크기 변화가 줄바꿈을 바꿀 수 있다.
    const observer = new ResizeObserver(mark);
    observer.observe(group);
    for (const child of group.children) observer.observe(child);
    return () => {
      observer.disconnect();
    };
  }, []);
}
