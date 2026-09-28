import { useId } from 'react';

import { cx } from '../lib/cx';

/** Design Spec §4.17 — `card`(설문) · `list`(간단 목록). */
export type RadioGroupVariant = 'card' | 'list';

/**
 * 옵션 표시 변형.
 * `muted` 는 설문의 비채점 옵션 같은 "구분이 필요한 항목"을 위한 슬롯이며,
 * 실제 시각 구분 방식은 Stage 2 결정이다 (§4.17 도메인 주의).
 */
export type RadioOptionVariant = 'default' | 'muted';

export interface RadioOption {
  value: string;
  label: string;
  variant?: RadioOptionVariant;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** 그룹 이름. `<legend>` 로 렌더되어 접근성 이름이 된다 (§4.17). */
  legend: string;
  options: readonly RadioOption[];
  /** 선택된 값. 선택 없음은 `null`. */
  value: string | null;
  onChange: (value: string) => void;
  /** native radio 그룹 이름. 화살표 키 이동이 이 이름 기준으로 동작한다. */
  name: string;
  variant?: RadioGroupVariant;
  /** 그룹 단위 에러 메시지. */
  error?: string;
  disabled?: boolean;
  /**
   * 그룹 전체에 딸린 보조 설명 요소의 id (Stage 2 Design Spec §2.10 Step 5 —
   * 비채점 옵션 caption 을 스크린리더에 연결한다). `error` 가 있으면 함께 전달된다.
   */
  describedBy?: string | undefined;
  /**
   * 응답이 필수인 그룹 (Stage 2 Design Spec §2.9 — 문항별 시각 "Required" 표식을 두지 않는
   * 단계에서 접근성을 갚는 경로다). `true` 면 `aria-required="true"` 를 둔다.
   *
   * `aria-required` 는 `role="group"`(fieldset 기본값) 에서는 허용되지 않고 `radiogroup`
   * 에서만 유효하므로, 이 경우에만 fieldset 에 `role="radiogroup"` 을 함께 둔다.
   * 시각 변화는 없다 — `required` 시각 슬롯은 만들지 않는다 (§2.9).
   */
  required?: boolean;
}

/**
 * RadioGroup — Design Spec §4.17.
 *
 * native `<input type="radio">` 를 같은 `name` 으로 묶어 브라우저의 화살표 키 이동과
 * roving focus 를 그대로 쓴다. 행 최소 높이는 44 로 확장한다 (§9.3).
 */
export function RadioGroup({
  legend,
  options,
  value,
  onChange,
  name,
  variant = 'card',
  error,
  disabled = false,
  describedBy,
  required = false,
}: RadioGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const described = [describedBy, error ? errorId : undefined].filter(Boolean).join(' ');

  return (
    <fieldset
      className={cx('haru-radio-group', `haru-radio-group--${variant}`)}
      disabled={disabled}
      role={required ? 'radiogroup' : undefined}
      aria-required={required ? true : undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={described.length > 0 ? described : undefined}
    >
      <legend className="haru-radio-group__legend">{legend}</legend>
      <div className="haru-radio-group__options">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cx(
                'haru-radio-group__option',
                'haru-focus-ring-within',
                `haru-radio-group__option--${option.variant ?? 'default'}`,
                selected && 'haru-radio-group__option--selected',
                option.disabled && 'haru-radio-group__option--disabled',
              )}
            >
              <input
                className="haru-radio-group__input"
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                disabled={option.disabled ?? false}
                onChange={() => {
                  onChange(option.value);
                }}
              />
              <span className="haru-radio-group__label">{option.label}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="haru-radio-group__message" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
