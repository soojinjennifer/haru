import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cx } from '../lib/cx';

/** Design Spec §4.13 — 행 안에서 쓰는 입력 타입. */
export type TextFieldType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';

export interface TextFieldTrailingAction {
  /** 예: "Show" (Figma `76:428`). 토글이면 라벨 자체가 상태를 전달한다 (Show ↔ Hide). */
  label: string;
  onPress: () => void;
  /**
   * 토글 버튼일 때의 누름 상태 → `aria-pressed`.
   * 결정 `D-14` 보완 ② — 밑줄 제거(`P-17`)로 줄어든 시각 단서를 접근성 상태로 보완한다.
   */
  pressed?: boolean;
  /**
   * 화면에 보이는 `label` 이 짧아 단독으로 뜻이 통하지 않을 때의 접근성 이름
   * (예: 보이는 글자 "Show" ↔ 접근성 이름 "Show password" — Design Spec §10 비밀번호 토글).
   * 주지 않으면 `label` 이 그대로 접근성 이름이다.
   */
  accessibleLabel?: string;
}

export interface TextFieldProps {
  /** 항상 보이는 라벨. placeholder 로 대체하지 않는다 (§4.13). */
  label: string;
  /**
   * 라벨을 **시각적으로만** 숨긴다 — 접근성 이름은 그대로 `label` 이다.
   * 바로 옆에 같은 말을 하는 제목이 이미 있어 라벨이 중복될 때만 쓴다
   * (Stage 2 재구성 Design Spec §6.4 — `placeholder` 를 라벨 대신 쓰지 않기 위한 경로다).
   */
  labelHidden?: boolean;
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
  labelHidden = false,
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
          <label
            className={cx('haru-text-field__label', labelHidden && 'haru-visually-hidden')}
            htmlFor={inputId}
          >
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
            aria-pressed={trailingAction.pressed}
            aria-label={trailingAction.accessibleLabel}
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
