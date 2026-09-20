import type { ReactNode } from 'react';

import { cx } from '../lib/cx';

/** Design Spec §4.16 — `filled`(선택됨) · `outline`(미선택) · `glass`(필터). */
export type ChipVariant = 'filled' | 'outline' | 'glass';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onToggle?: (selected: boolean) => void;
  variant?: ChipVariant;
  disabled?: boolean;
  /** 미선택 상태의 장식 아이콘. 선택되면 check 아이콘으로 대체된다 (§4.16). */
  leadingIcon?: ReactNode;
}

/**
 * Chip — Design Spec §4.16.
 *
 * 단일 토글이므로 `<button aria-pressed>` 로 렌더한다.
 * 선택 표시는 색 + leading check 아이콘 병행이다 (WCAG 1.4.1).
 * 시각 높이 31 을 유지한 채 세로 hit slop 으로 터치 타깃 44 를 확보한다 (§9.3).
 */
export function Chip({
  label,
  selected = false,
  onToggle,
  variant = 'outline',
  disabled = false,
  leadingIcon,
}: ChipProps) {
  return (
    <button
      type="button"
      className={cx(
        'haru-chip',
        'haru-focus-ring',
        `haru-chip--${variant}`,
        selected && 'haru-chip--selected',
      )}
      aria-pressed={selected}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={() => {
        onToggle?.(!selected);
      }}
    >
      {selected ? (
        <span className="haru-chip__check" aria-hidden="true">
          <svg viewBox="0 0 16 16" focusable="false">
            <path
              d="M3.2 8.4 6.5 11.7 12.8 5.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : leadingIcon ? (
        <span className="haru-chip__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className="haru-chip__label">{label}</span>
    </button>
  );
}
