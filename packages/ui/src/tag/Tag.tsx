import type { ReactNode } from 'react';

import { cx } from '../lib/cx';

/**
 * Design Spec §4.15 — capability 키가 아니라 tone 이름이다.
 * `packages/ui` 는 도메인(역량 enum)을 알지 않는다 (§4 공통 규칙 10, AC-1-25).
 */
export type TagTone = 'agency' | 'emotion' | 'flexibility' | 'motivation' | 'neutral';

/** Design Spec §4.15 — 26 / 19 (`--tag-height-sm` / `-xs`). */
export type TagSize = 'sm' | 'xs';

export interface TagProps {
  label: string;
  tone?: TagTone;
  /**
   * 보이는 `label` 이 축약형일 때의 접근성 이름 (예: 보이는 글자 `3yr 4mo` ↔ 접근성 이름
   * `3 years 4 months` — Stage 2 재구성 Design Spec §4.3). 주면 보이는 글자는
   * `aria-hidden` 이 되고 이 문구가 읽힌다. **tag 자체를 숨기지 않는다.**
   */
  accessibleLabel?: string;
  size?: TagSize;
  /** 장식 아이콘. `aria-hidden` 컨테이너에 렌더된다. */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

/**
 * Tag — Design Spec §4.15.
 *
 * 표시 전용(state 없음). 누를 수 있는 요소는 Tag 가 아니라 Chip(§4.16)이다.
 * 색만으로 정보를 전달하지 않도록 라벨 텍스트를 항상 함께 렌더한다.
 */
export function Tag({
  label,
  accessibleLabel,
  tone = 'neutral',
  size = 'sm',
  leadingIcon,
  trailingIcon,
}: TagProps) {
  return (
    <span className={cx('haru-tag', `haru-tag--${tone}`, `haru-tag--${size}`)}>
      {leadingIcon ? (
        <span className="haru-tag__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span
        className="haru-tag__label"
        aria-hidden={accessibleLabel === undefined ? undefined : true}
      >
        {label}
      </span>
      {accessibleLabel === undefined ? null : (
        <span className="haru-visually-hidden">{accessibleLabel}</span>
      )}
      {trailingIcon ? (
        <span className="haru-tag__icon" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </span>
  );
}
