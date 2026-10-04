import { useId, type ReactNode } from 'react';

import { cx } from '../lib/cx';

import { CheckboxMarks } from './Checkbox';

/**
 * 표시 변형.
 * - `plain` — `children` 으로 `Checkbox` 를 직접 조립한다 (동의 그룹 등).
 * - `card` — 행 카드 목록. `RadioGroup variant="card"` 와 **같은 기하**이고 컨트롤만 사각이다
 *   (Stage 2 온보딩 재구성 Design Spec §3.6 · §8.1).
 */
export type CheckboxGroupVariant = 'plain' | 'card';

export interface CheckboxCardOption {
  /** 저장되는 값. */
  value: string;
  label: string;
  /**
   * 다른 선택지와 함께 고를 수 없는 선택지 ("아직 모르겠다" 류).
   * **목록 끝에 구분선과 함께 분리 렌더된다** (§3.7). 배타 규칙 자체(선택 시 나머지 해제)는
   * 호출부의 순수 함수가 판단한다 — 이 컴포넌트는 표시만 한다.
   */
  exclusive?: boolean;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /** 그룹 이름. `<legend>` 로 렌더된다 (§4.14). */
  legend: string;
  /** `variant="plain"` 의 내용. `options` 를 줄 때는 쓰지 않는다. */
  children?: ReactNode;
  variant?: CheckboxGroupVariant;
  /** `variant="card"` 의 선택지 목록. 순서는 호출부가 정한다. */
  options?: readonly CheckboxCardOption[];
  /** 선택된 값 목록. */
  values?: readonly string[];
  /** 행을 누르면 그 값으로 호출된다 (토글 결과 계산은 호출부가 한다). */
  onToggle?: (value: string) => void;
  required?: boolean;
  /** 그룹 단위 에러 메시지. */
  error?: string;
  /** 그룹에 딸린 보조 설명 요소의 id. `error` 가 있으면 함께 전달된다. */
  describedBy?: string | undefined;
}

/**
 * CheckboxGroup — Design Spec §4.14 + Stage 2 재구성 §8.1(`variant="card"`).
 *
 * `<fieldset>` + `<legend>` 로 그룹 이름을 전달한다. `aria-required` 는 `role="group"` 에서
 * 유효하지 않으므로 두지 않는다 — 필수성은 보조 문구가 전달한다 (§15).
 *
 * `variant="card"` 는 native `<input type="checkbox">` 를 행 `<label>` 로 감싼다. 행 전체가
 * 클릭 영역이고 높이는 최소 44(컨트롤 22 + 상하 12 = 46)다 (§9.3).
 */
export function CheckboxGroup({
  legend,
  children,
  variant = 'plain',
  options,
  values,
  onToggle,
  required = false,
  error,
  describedBy,
}: CheckboxGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const described = [describedBy, error ? errorId : undefined].filter(Boolean).join(' ');
  const selected = values ?? [];

  function renderOption(option: CheckboxCardOption, separated: boolean) {
    const checked = selected.includes(option.value);

    return (
      <label
        key={option.value}
        className={cx(
          'haru-checkbox-group__option',
          'haru-focus-ring-within',
          checked && 'haru-checkbox-group__option--selected',
          separated && 'haru-checkbox-group__option--separated',
          option.disabled === true && 'haru-checkbox-group__option--disabled',
        )}
      >
        <span className="haru-checkbox__control">
          <input
            className="haru-checkbox__input"
            type="checkbox"
            value={option.value}
            checked={checked}
            disabled={option.disabled ?? false}
            onChange={() => {
              onToggle?.(option.value);
            }}
          />
          <CheckboxMarks />
        </span>
        <span className="haru-checkbox-group__label">{option.label}</span>
      </label>
    );
  }

  function cardItems(list: readonly CheckboxCardOption[]): ReactNode {
    const plain = list.filter((option) => option.exclusive !== true);
    const exclusive = list.filter((option) => option.exclusive === true);

    return (
      <>
        {plain.map((option) => renderOption(option, false))}
        {exclusive.map((option) => renderOption(option, true))}
      </>
    );
  }

  return (
    <fieldset
      className={cx(
        'haru-checkbox-group',
        `haru-checkbox-group--${variant}`,
        error && 'haru-checkbox-group--error',
      )}
      aria-invalid={error ? true : undefined}
      aria-describedby={described.length > 0 ? described : undefined}
      {...(variant === 'card' ? {} : { 'aria-required': required || undefined })}
    >
      <legend className="haru-checkbox-group__legend">{legend}</legend>
      <div className="haru-checkbox-group__items">
        {options === undefined ? children : cardItems(options)}
      </div>
      {error ? (
        <p className="haru-checkbox-group__message" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
