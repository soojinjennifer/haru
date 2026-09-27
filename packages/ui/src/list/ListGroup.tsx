import type { ReactNode } from 'react';

import { cx } from '../lib/cx';

export interface ListGroupProps {
  /** `ListRow` 들. 각 행이 `<li>` 로 렌더된다. */
  children: ReactNode;
  /** 목록 자체의 접근성 이름 (화면에 보이는 제목이 따로 있으면 생략한다). */
  label?: string;
}

/**
 * ListGroup — Stage 2 Design Spec §4.3 (Figma `163:2145`).
 *
 * 행을 담는 카드 셸이다. 좌우 여백(16)은 **그룹이 갖는다** — Figma 실측의 "행 내부 좌우 16"
 * 과 같은 값이며, 행이 다시 같은 여백을 갖지 않게 해 총 여백이 32 로 커지는 것을 막는다.
 * 행 사이 1px 구분선은 행끼리 인접할 때만 그린다(첫·끝 없음).
 * 목록이 1행이어도 카드 형태를 유지한다 (`/settings` 는 Stage 3·6·8 에서 행이 늘어난다).
 */
export function ListGroup({ children, label }: ListGroupProps) {
  return (
    <div className={cx('haru-list-group')}>
      <ul className="haru-list-group__list" aria-label={label}>
        {children}
      </ul>
    </div>
  );
}
