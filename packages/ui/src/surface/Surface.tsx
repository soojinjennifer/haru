import { createElement, type ElementType, type ReactNode } from 'react';

import { cx } from '../lib/cx';

/**
 * Design Spec §4.3 — 그림자 단계. `none` 은 그림자를 쓰지 않는다.
 *
 * `bubble` (Stage 6 Spec §3.4 `T6-9`) — `--shadow-bubble`(drop 1겹 `0 6 4` + inset 2겹). Figma `163:2607`
 * 데이터 카드 인스턴스가 실제로 렌더하는 그림자다 (`V-10` 선례). 새 값이 아니라 기존 토큰 매핑이다.
 * 번짐 좌우 4 · 위 0 · 아래 10 이라 스크롤 뷰포트 안 카드에도 inset 이 필요 없다 (`R-SHADOW-1`, Spec §9.5).
 */
export type SurfaceMaterial = 'rest' | 'raised' | 'pressed' | 'bubble' | 'none';

/**
 * Design Spec §4.3 — 채움. glass 74% / strong 90% / solid 불투명.
 *
 * `card` (Stage 7 `T7-3`) — white **82%** + blur 12 (`--color-surface-card`). Figma `163:2551` 주간 카드 ·
 * `110:835` 리포트 카드의 선언값이다 (Spec §0.3 — Activity Card 앞면 `163:2649` 와 같은 값). 새 값이 아니라
 * 기존 토큰 매핑이며, glass · strong 과 같은 불투명 fallback 규칙을 따른다.
 */
export type SurfaceFill =
  'glass' | 'strong' | 'card' | 'solid' | 'subtle' | 'tinted' | 'note' | 'none';

/** Design Spec §3.2.3 radius 6단계. */
export type SurfaceRadius = 'indicator' | 'control' | 'field' | 'surface' | 'card' | 'pill';

/** space scale (§3.2.3). `none` 이면 padding 이 없다. */
export type SurfacePadding =
  'none' | '0-5' | '1' | '1-5' | '2' | '2-5' | '3' | '3-5' | '4' | '5' | '6' | '8';

/** 클릭 가능한 Surface 는 반드시 `button` 또는 `a` 로 렌더한다 (§4.3 접근성). */
export type SurfaceElement =
  'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'ul' | 'li' | 'button' | 'a';

export interface SurfaceProps {
  children: ReactNode;
  as?: SurfaceElement;
  material?: SurfaceMaterial;
  fill?: SurfaceFill;
  radius?: SurfaceRadius;
  padding?: SurfacePadding;
  /** hover / pressed 전환을 켠다. 켤 때는 `as="button"` 또는 `as="a"` 여야 한다. */
  interactive?: boolean;
  /** `as="a"` 일 때의 목적지. */
  href?: string;
  /** `as="button"` · `as="a"` 일 때의 누름 핸들러. */
  onPress?: () => void;
  /** 접근성 이름이 필요한 경우(예: 링크 카드). */
  label?: string;
  id?: string;
}

/**
 * Surface — Design Spec §4.3.
 *
 * Glass 는 gradient 배경 위 **1단계만** 쓰고 중첩하지 않는다.
 * `backdrop-filter` 미지원 · `prefers-reduced-transparency: reduce` 에서는
 * 불투명 fallback 으로 대체된다 (§4.3-③).
 */
export function Surface({
  children,
  as = 'div',
  material = 'rest',
  fill = 'glass',
  radius = 'surface',
  padding = 'none',
  interactive = false,
  href,
  onPress,
  label,
  id,
}: SurfaceProps) {
  const props: Record<string, unknown> = {
    id,
    className: cx(
      'haru-surface',
      `haru-surface--material-${material}`,
      `haru-surface--fill-${fill}`,
      `haru-surface--radius-${radius}`,
      padding !== 'none' && `haru-surface--padding-${padding}`,
      interactive && 'haru-surface--interactive',
      (as === 'button' || as === 'a') && 'haru-focus-ring',
    ),
  };

  if (label) props['aria-label'] = label;
  if (as === 'button') {
    props['type'] = 'button';
    props['onClick'] = onPress;
  }
  if (as === 'a') {
    props['href'] = href;
    props['onClick'] = onPress;
  }

  return createElement(as as ElementType, props, children);
}
