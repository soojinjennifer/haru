import type { ReactNode } from 'react';

import { cx } from '../lib/cx';

/** Design Spec §4.4 — `inline` 은 폭이 좁으면 자동으로 `stacked` 가 된다. */
export type ButtonGroupLayout = 'inline' | 'stacked';

export interface ButtonGroupProps {
  /** 주 동작 (Figma `86:372` 의 accent "Start Session"). */
  primary: ReactNode;
  /** 보조 동작 (Figma `86:372` 의 glass "Save"). 없으면 primary 만 렌더한다. */
  secondary?: ReactNode;
  layout?: ButtonGroupLayout;
}

/**
 * ButtonGroup — Design Spec §4.4.
 *
 * 자체 스타일(색·그림자)을 갖지 않는다. 배치(gap · flex · 자동 stack)만 담당한다.
 * DOM 순서는 Figma `86:372` 을 따라 secondary → primary 이며 layout 에 따라 바뀌지 않는다.
 */
export function ButtonGroup({ primary, secondary, layout = 'inline' }: ButtonGroupProps) {
  return (
    <div className="haru-button-group">
      <div className={cx('haru-button-group__row', `haru-button-group__row--${layout}`)}>
        {secondary}
        {primary}
      </div>
    </div>
  );
}
