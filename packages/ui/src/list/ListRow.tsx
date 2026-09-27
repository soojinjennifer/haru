import type { ReactNode } from 'react';

import { cx } from '../lib/cx';

export interface ListRowProps {
  title: ReactNode;
  /** 보조 1행 (예: 저자). `media` · `meta` 슬롯은 Stage 3 이다 (§4.3). */
  subtitle?: ReactNode;
  /**
   * 행 우측 요소 — chevron · IconButton · Checkbox.
   * `onPress` 를 함께 주면 행 전체가 `<button>` 이 되므로 **인터랙티브 요소를 넣지 않는다**
   * (중첩 버튼 금지). 인터랙티브 trailing 이 필요하면 `onPress` 없이 쓴다.
   */
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** trailing Checkbox 등으로 선택된 행 (§4.3 state `selected`). */
  selected?: boolean;
}

/**
 * ListRow — Stage 2 Design Spec §4.3 (Figma `163:2145`).
 *
 * Stage 2 는 `basic` 변형 하나다: `title` + `subtitle?` + `trailing?`.
 * 행 최소 높이 56 (`--list-row-height-min`) 으로 터치 44 를 넘는다.
 * `onPress` 가 있으면 행 전체가 버튼이 되고 접근성 이름은 title(+subtitle) 이다.
 */
export function ListRow({
  title,
  subtitle,
  trailing,
  onPress,
  disabled = false,
  selected = false,
}: ListRowProps) {
  const body = (
    <>
      <span className="haru-list-row__text">
        <span className="haru-list-row__title">{title}</span>
        {subtitle === undefined ? null : (
          <span className="haru-list-row__subtitle">{subtitle}</span>
        )}
      </span>
      {trailing === undefined ? null : <span className="haru-list-row__trailing">{trailing}</span>}
    </>
  );

  return (
    <li
      className={cx(
        'haru-list-row',
        selected && 'haru-list-row--selected',
        disabled && 'haru-list-row--disabled',
      )}
    >
      {onPress === undefined ? (
        <div className="haru-list-row__content">{body}</div>
      ) : (
        <button
          type="button"
          className="haru-list-row__content haru-list-row__content--pressable haru-focus-ring"
          disabled={disabled}
          aria-current={selected ? true : undefined}
          onClick={onPress}
        >
          {body}
        </button>
      )}
    </li>
  );
}
