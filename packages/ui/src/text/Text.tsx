import { createElement, type ReactNode } from 'react';

import { cx } from '../lib/cx';

/** Design Spec §4.1 — Figma `17:298` 의 11 스타일. */
export type TextVariant =
  | 'large-title'
  | 'title-1'
  | 'title-2'
  | 'title-3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption-1'
  | 'caption-2';

/** Design Spec §4.1 — `--color-fg-*` 매핑. `inherit` 은 부모 색을 그대로 쓴다. */
export type TextTone =
  'primary' | 'strong' | 'secondary' | 'tertiary' | 'on-accent' | 'link' | 'disabled' | 'inherit';

/** 스타일 기본 weight 를 덮어쓸 때만 쓴다 (§4.1). */
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';

/** 의미 태그. 시각 크기(variant)와 heading 레벨을 분리한다 (§4.1). */
export type TextElement = 'p' | 'span' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type TextAlign = 'start' | 'center' | 'end';

/** 말줄임 줄 수. `none` 이면 줄 수 제한이 없다. */
export type TextTruncate = 'none' | 1 | 2 | 3;

export interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  tone?: TextTone;
  /** 스타일 기본 weight override. */
  weight?: TextWeight;
  as?: TextElement;
  align?: TextAlign;
  truncate?: TextTruncate;
  /** 숫자를 등폭으로 정렬한다 (tabular-nums). */
  numeric?: boolean;
  /** `aria-labelledby` 등으로 연결할 때 쓴다. */
  id?: string | undefined;
  /** `as="label"` 일 때만 의미가 있다. */
  htmlFor?: string | undefined;
}

/**
 * Text — Design Spec §4.1.
 *
 * 표시 전용(state 없음)이며 고정 높이 컨테이너를 만들지 않는다.
 * 문구는 항상 prop 으로 받는다 (`packages/ui` 는 copy 를 소유하지 않는다 — §4 공통 규칙 9).
 */
export function Text({
  children,
  variant = 'body',
  tone = 'inherit',
  weight,
  as = 'p',
  align,
  truncate = 'none',
  numeric = false,
  id,
  htmlFor,
}: TextProps) {
  return createElement(
    as,
    {
      id,
      htmlFor: as === 'label' ? htmlFor : undefined,
      className: cx(
        'haru-text',
        `haru-text--${variant}`,
        `haru-text--tone-${tone}`,
        weight && `haru-text--weight-${weight}`,
        align && `haru-text--align-${align}`,
        truncate !== 'none' && `haru-text--truncate-${truncate}`,
        numeric && 'haru-text--numeric',
      ),
    },
    children,
  );
}
