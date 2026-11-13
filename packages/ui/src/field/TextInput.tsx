import type { FocusEventHandler, Ref } from 'react';

import { cx } from '../lib/cx';

export interface TextInputProps {
  value: string;
  onChange?: (value: string) => void;
  /** 보이는 placeholder. 접근성 이름으로 쓰지 않는다 — `aria-label` 을 따로 준다. */
  placeholder?: string;
  /** 보이는 라벨이 없으므로 필수다 (Stage 5 Spec §3.3 · §9.1). */
  'aria-label': string;
  'aria-describedby'?: string;
  maxLength?: number;
  readOnly?: boolean;
  name?: string;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  ref?: Ref<HTMLInputElement>;
}

/**
 * TextInput — Stage 5 Design Spec §3.3 (Figma `91:715`).
 *
 * 라벨 없는 **한 줄** outline 입력 (`N5-25`). `TextField`(`76:417`, 라벨 + 값 2단 · 행 42)와 구조가 달라
 * 별도 컴포넌트다. 높이 40 = padding 12 + 줄 16 + 12 · radius 16 · 1px `--color-border-subtle` · 면 없음.
 */
export function TextInput({
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
  'aria-describedby': describedBy,
  maxLength,
  readOnly = false,
  name,
  onFocus,
  ref,
}: TextInputProps) {
  return (
    <input
      ref={ref}
      type="text"
      name={name}
      className={cx('haru-text-input', 'haru-focus-ring')}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      maxLength={maxLength}
      readOnly={readOnly}
      autoComplete="off"
      onFocus={onFocus}
      onChange={(event) => {
        onChange?.(event.target.value);
      }}
    />
  );
}
