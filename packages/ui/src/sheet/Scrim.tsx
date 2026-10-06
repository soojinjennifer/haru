import { cx } from '../lib/cx';

import type { PresenceState } from '../hooks/usePresence';

/** overlay 단계 — z-index 토큰을 고른다 (§3.2.5). */
export type ScrimLevel = 'sheet' | 'dialog';

export interface ScrimProps {
  level?: ScrimLevel;
  state?: PresenceState;
  /** 배경 탭으로 닫기. 닫기를 허용하지 않으면 주지 않는다. */
  onClick?: (() => void) | undefined;
}

/**
 * Scrim — Design Spec §4.21 (`--color-scrim` — Figma 실측값, `P-05` 해제).
 *
 * 장식 레이어이므로 접근성 트리에 넣지 않는다. 닫기 기능은 Sheet/Dialog 의
 * `Esc` · 닫기 버튼과 **중복** 제공되는 보조 수단이다(키보드 단독 사용자는 Esc 를 쓴다).
 */
export function Scrim({ level = 'sheet', state = 'open', onClick }: ScrimProps) {
  return (
    // 장식 레이어이며 접근성 트리에 없다. 배경 탭은 마우스·터치 편의 수단이고
    // 키보드 경로는 `Esc` 와 닫기 버튼이 담당한다 (§4.21 · WCAG 2.1.1 충족).
    <div
      className={cx('haru-scrim', `haru-scrim--${level}`, `haru-scrim--${state}`)}
      aria-hidden="true"
      onClick={onClick}
    />
  );
}
