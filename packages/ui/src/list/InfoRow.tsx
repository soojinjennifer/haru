import type { ReactNode } from 'react';

export interface InfoRowProps {
  /** 장식 아이콘. 접근성 트리에서 숨겨지며 정보는 텍스트가 전달한다 (§4.4). */
  icon: ReactNode;
  children: ReactNode;
}

/**
 * InfoRow — Stage 2 Design Spec §4.4 (Figma `179:1759` · `179:1764`).
 *
 * glass pill 1행이다. 표시 전용이며 state 가 없다.
 * 고정 높이를 두지 않는다 — 텍스트 200% 에서도 세로로 늘어나야 한다 (§10).
 */
export function InfoRow({ icon, children }: InfoRowProps) {
  return (
    <div className="haru-info-row">
      <span className="haru-info-row__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="haru-info-row__text">{children}</span>
    </div>
  );
}
