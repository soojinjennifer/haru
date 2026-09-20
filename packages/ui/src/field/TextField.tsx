import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cx } from '../lib/cx';

/** Design Spec §4.13 — 행 안에서 쓰는 입력 타입. */
export type TextFieldType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';

export interface TextFieldTrailingAction {
  /** 예: "Show" (Figma `76:428`). */
  label: string;
  onPress: () => void;
}

export interface TextFieldProps {
  /** 항상 보이는 라벨. placeholder 로 대체하지 않는다 (§4.13). */
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: TextFieldType;
  /** 행 우측 텍스트 버튼 (hit area 44 — §9.3). */
  trailingAction?: TextFieldTrailingAction;
  /** 행 우측 표시 요소 (예: Tag). 인터랙티브 요소를 넣지 않는다. */
  trailingAccessory?: ReactNode;
  helperText?: string;
  /** 값이 있으면 error 상태 — 경계색 + 아이콘 + 메시지 3중 표시 (§4 공통 규칙 6). */
  errorText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete'];
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
}

/**
 * TextField — Design Spec §4.13.
 *
 * `FieldGroup` 카드 안의 한 행이다. state: rest · focus · filled · error · disabled · readOnly.
 */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  trailingAction,
  trailingAccessory,
  helperText,
  errorText,
  disabled = false,
  readOnly = false,
  required = false,
  id,
  name,
  autoComplete,
  inputMode,
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const describedBy =
    cx(errorText ? errorId : undefined, helperText ? helperId : undefined) || undefined;

  return (
    <div
      className={cx(
        'haru-text-field',
        errorText && 'haru-text-field--error',
        disabled && 'haru-text-field--disabled',
      )}
    >
      <div className="haru-text-field__row">
        <div className="haru-text-field__main">
          <label className="haru-text-field__label" htmlFor={inputId}>
            {label}
            {required ? (
              <span className="haru-text-field__required" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
          <input
            id={inputId}
            className="haru-text-field__input"
            type={type}
            value={value}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-required={required || undefined}
            aria-invalid={errorText ? true : undefined}
            aria-describedby={describedBy}
            autoComplete={autoComplete}
            inputMode={inputMode}
            onChange={(event) => {
              onChange(event.target.value);
            }}
          />
        </div>
        {trailingAccessory ? (
          <div className="haru-text-field__accessory">{trailingAccessory}</div>
        ) : null}
        {errorText ? (
          <span className="haru-text-field__error-icon" aria-hidden="true">
            {/* Design Spec §4.13 — trailing `triangle-alert` 아이콘. Icon(§4.2)은 Stage 1-D2. */}
            <svg viewBox="0 0 16 16" focusable="false">
              <path
                d="M8 1.8 15 14H1L8 1.8Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M8 6v3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="8" cy="11.6" r="0.8" fill="currentColor" />
            </svg>
          </span>
        ) : null}
        {trailingAction ? (
          <button
            type="button"
            className="haru-text-field__action haru-focus-ring"
            disabled={disabled}
            onClick={trailingAction.onPress}
          >
            {trailingAction.label}
          </button>
        ) : null}
      </div>
      {helperText ? (
        <p className="haru-text-field__helper" id={helperId}>
          {helperText}
        </p>
      ) : null}
      {errorText ? (
        <p className="haru-text-field__message" id={errorId}>
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
