import type { ReactNode } from 'react';

import { cx } from '../lib/cx';

export interface FieldGroupProps {
  /** `TextField` 행들. Figma `76:417` 의 boxcount 는 variant 가 아니라 composition 이다 (§4.13). */
  children: ReactNode;
  /** 그룹 단위 에러 메시지. 개별 행 에러는 `TextField.errorText` 를 쓴다. */
  error?: string;
}

/**
 * FieldGroup — Design Spec §4.13.
 *
 * 입력 행을 담는 카드. 행 사이에만 1px 구분선을 둔다.
 */
export function FieldGroup({ children, error }: FieldGroupProps) {
  return (
    <div className={cx('haru-field-group', error && 'haru-field-group--error')}>
      <div className="haru-field-group__rows">{children}</div>
      {error ? (
        <p className="haru-field-group__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
