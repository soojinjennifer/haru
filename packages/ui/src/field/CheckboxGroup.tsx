import { useId, type ReactNode } from 'react';

import { cx } from '../lib/cx';

export interface CheckboxGroupProps {
  /** 그룹 이름. `<legend>` 로 렌더된다 (§4.14). */
  legend: string;
  children: ReactNode;
  required?: boolean;
  /** 그룹 단위 에러 메시지. */
  error?: string;
}

/**
 * CheckboxGroup — Design Spec §4.14.
 *
 * `<fieldset>` + `<legend>` 로 그룹 이름을 전달한다.
 * 동의 그룹 같은 도메인 조합은 Feature(Stage 2)가 담당한다.
 */
export function CheckboxGroup({ legend, children, required = false, error }: CheckboxGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <fieldset
      className={cx('haru-checkbox-group', error && 'haru-checkbox-group--error')}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="haru-checkbox-group__legend">{legend}</legend>
      <div className="haru-checkbox-group__items">{children}</div>
      {error ? (
        <p className="haru-checkbox-group__message" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
