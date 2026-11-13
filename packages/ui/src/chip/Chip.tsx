import type { ReactNode } from 'react';

import { cx } from '../lib/cx';

/**
 * Design Spec §4.16 — `filled`(선택됨) · `outline`(미선택) · `glass`(필터).
 * `select` — Figma `90:626` Select 와 1:1 (Stage 5 Spec §3.2 · `N5-26`·`N5-27`): check 아이콘 없음 · 라벨 Medium ·
 * 미선택(`90:624`)만 1px border(border-box 33) · 선택(`90:625`)은 border 없이 31. 기존 변형은 바뀌지 않는다.
 */
export type ChipVariant = 'filled' | 'outline' | 'glass' | 'select';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onToggle?: (selected: boolean) => void;
  variant?: ChipVariant;
  disabled?: boolean;
  /**
   * 값을 바꿀 수 없지만 모습은 그대로다 — `aria-disabled` + 누름 무시, opacity 변경 없음 (Stage 5 Spec §2.2 S2 · S6).
   * 포커스는 유지한다 (native `disabled` 가 아니다).
   */
  readOnly?: boolean;
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
  readOnly = false,
  leadingIcon,
}: ChipProps) {
  // `select` 변형은 Figma 에 check 아이콘이 없다 (`N5-26`) — 선택 표시는 채움/테두리 모양 + `aria-pressed`.
  const showCheck = selected && variant !== 'select';
  return (
    <button
      type="button"
      className={cx(
        'haru-chip',
        'haru-focus-ring',
        `haru-chip--${variant}`,
        selected && 'haru-chip--selected',
        readOnly && 'haru-chip--readonly',
      )}
      aria-pressed={selected}
      disabled={disabled}
      aria-disabled={disabled || readOnly || undefined}
      onClick={() => {
        if (readOnly) return;
        onToggle?.(!selected);
      }}
    >
      {showCheck ? (
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
      ) : leadingIcon && !selected ? (
        <span className="haru-chip__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className="haru-chip__label">{label}</span>
    </button>
  );
}
