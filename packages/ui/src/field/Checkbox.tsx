import { useEffect, useId, useRef, type ReactNode } from 'react';

import { cx } from '../lib/cx';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 라벨. 행 전체가 클릭 영역이 된다 (§4.14). */
  label: ReactNode;
  description?: string;
  /** 부분 선택. native `indeterminate` 로 설정되어 `aria-checked="mixed"` 가 된다. */
  indeterminate?: boolean;
  required?: boolean;
  /** 값이 있으면 error 상태 — 경계색 + 메시지 (§4 공통 규칙 6). */
  error?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

/**
 * Checkbox — Design Spec §4.14.
 *
 * native `<input type="checkbox">` 를 그대로 쓰고 시각만 대체한다.
 * 라벨을 감싸므로 라벨·설명 클릭으로도 토글되며 행 최소 높이는 44 다 (§9.3).
 */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  indeterminate = false,
  required = false,
  error,
  disabled = false,
  id,
  name,
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const describedBy =
    cx(error ? errorId : undefined, description ? descriptionId : undefined) || undefined;

  return (
    <div className={cx('haru-checkbox', error && 'haru-checkbox--error')}>
      <label className={cx('haru-checkbox__row', disabled && 'haru-checkbox__row--disabled')}>
        <span className="haru-checkbox__control">
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            className="haru-checkbox__input haru-focus-ring"
            type="checkbox"
            checked={checked}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => {
              onChange(event.target.checked);
            }}
          />
          <span className="haru-checkbox__mark" aria-hidden="true">
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
          <span className="haru-checkbox__dash" aria-hidden="true" />
        </span>
        <span className="haru-checkbox__text">
          <span className="haru-checkbox__label">{label}</span>
          {description ? (
            <span className="haru-checkbox__description" id={descriptionId}>
              {description}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p className="haru-checkbox__message" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
