/**
 * C-3 스티커 입장 시점 (`D4-100`, `VG-H1R-01`, Visual Gap H1 §9.4 안 E).
 *
 * `Submit` Toast 는 스티커 44/64 를 약 4초 가려 C-3 가 Toast 밑에서 끝나 버린다. 그래서 `Submit` 경로에서만 Toast 가
 * 떠 있는 동안 스티커를 숨겼다가 퇴장이 끝나면 C-3 를 재생한다.
 *
 * ```
 * static  재진입 · 새로고침 · Toast 없는 진입 — 즉시 표시, 연출 없음
 * held    `Submit` 직후, Toast 표시 중 — 숨김
 * play    Toast 퇴장 완료 — C-3 재생. 이후 다른 Toast 가 떠도 `held` 로 돌아가지 않는다
 * ```
 *
 * "반드시 나타난다"의 근거: 끝 신호가 `useToastPresent` 하나다 — 자동 해제 · `dismiss` · 교체 모두 Toast 가 사라지면
 * `false` 가 되고, 교체된 Toast 의 `onDismiss` 처럼 불리지 않는 경로가 없다. 이 훅은 타이머를 갖지 않는다.
 *
 * 경로 판정이 navigation state 만으로 끝나지 않는 이유: state 는 새로고침 뒤에도 history 에 남는다. 진입 시점에
 * Toast 가 있어야 `Submit` 직후다 (Toast 커밋은 이동 커밋보다 늦지 않다 — `toast.show` 가 `navigate` 앞이다).
 *
 * reduced motion 은 여기서 분기하지 않는다 — 시점은 같고 재생 애니메이션만 `no-preference` 안이다 (`D4-106`,
 * `storytime-session.css`). 그때 `play` 는 연출 없는 표시다.
 */
import { useToastPresent } from '@haru/ui';
import { useState } from 'react';
import { useLocation } from 'react-router';

export type StickerEntrance = 'static' | 'held' | 'play';

/** `Submit` 이 완료 화면으로 넘기는 navigation state. */
export const SUBMIT_ENTRY = { via: 'submit' } as const;

function isSubmitEntry(state: unknown): boolean {
  return (
    typeof state === 'object' && state !== null && 'via' in state && state.via === SUBMIT_ENTRY.via
  );
}

export function useStickerEntrance(): StickerEntrance {
  const location = useLocation();
  const toastPresent = useToastPresent();
  const [deferred] = useState(() => toastPresent && isSubmitEntry(location.state));
  const [toastLeft, setToastLeft] = useState(false);

  // 렌더 중 상태 보정 — 한 번 넘어가면 돌아오지 않게 잠근다 (`usePresence` 와 같은 react.dev 패턴).
  if (deferred && !toastPresent && !toastLeft) setToastLeft(true);

  if (!deferred) return 'static';
  return toastLeft ? 'play' : 'held';
}
