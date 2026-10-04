import { createElement, type ElementType, type ReactNode } from 'react';

import { cx } from '../lib/cx';

export type AppColumnElement = 'div' | 'main' | 'section' | 'article';

export interface AppColumnProps {
  children: ReactNode;
  as?: AppColumnElement;
  /** 좌우 gutter 적용 여부 (기본 true). */
  padded?: boolean;
  /**
   * gutter 를 제거한다 — 가로 캐러셀이 화면 끝까지 스크롤해야 하는 경우에만 쓴다.
   * Stage 1 에서는 API 만 열어 둔다 (§2.4).
   */
  edgeToEdge?: boolean;
  /**
   * 화면 하단 인셋을 `max(safe-bottom, --layout-cta-bottom-gap)`(44) 로 바꾼다 (`S2-FIX-1`).
   * 기본값 `false` = `--layout-safe-bottom` 만 적용 (웹에서는 0).
   */
  bottomGap?: boolean;
  id?: string;
}

/**
 * AppColumn — Design Spec §2.4 · §7 (Stage 0 #12).
 *
 * 모든 화면은 모바일 레이아웃이며 600px 이상에서는 최대 폭 480px 컬럼을 가운데 정렬한다.
 * 다단 레이아웃을 만들지 않는다.
 */
export function AppColumn({
  children,
  as = 'div',
  padded = true,
  edgeToEdge = false,
  bottomGap = false,
  id,
}: AppColumnProps) {
  return createElement(
    as as ElementType,
    {
      id,
      className: cx(
        'haru-app-column',
        padded && !edgeToEdge && 'haru-app-column--padded',
        edgeToEdge && 'haru-app-column--edge-to-edge',
        bottomGap && 'haru-app-column--bottom-gap',
      ),
    },
    children,
  );
}
