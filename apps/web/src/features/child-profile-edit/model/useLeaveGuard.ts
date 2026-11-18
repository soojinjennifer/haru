/**
 * 변경 후 이탈 확인 (`N6-14` ⓐ → `D6-3`, Spec §2.5 · AC-6-23) — TopBar 뒤로 · **브라우저 back**.
 *
 * ── 왜 history sentinel 인가 ──
 * 앱은 `BrowserRouter`(선언형)라 React Router `useBlocker`(data router 전용)를 쓸 수 없다. data router 로
 * 바꾸는 것은 Architecture 변경이다. 그래서 **변경이 생긴 순간 현재 history 항목을 한 번 복제**(sentinel)한다:
 * 사용자가 back 을 누르면 sentinel 만 빠지고 URL·화면은 그대로이며, 그 popstate 를 잡아 확인 Dialog 를 띄운다.
 *
 * ── 왜 React Router `navigate` 가 아니라 `window.history.pushState` 인가 ──
 * `RouteErrorBoundary` 가 `key={location.key}` 라 **RR 이동은 화면을 재마운트**한다 — 입력 중이던 필드의
 * 포커스·상태가 사라진다. sentinel 은 RR 의 `history.state`(같은 `key`·`idx`)를 그대로 복제하므로 popstate 뒤에도
 * `location.key` 가 같고 재마운트가 없다.
 *
 * ── 적용 조건 ──
 * 라우터가 `window.location` 을 반영할 때만(= BrowserRouter) sentinel 을 쓴다. `MemoryRouter`(단위 테스트)에서는
 * window history 가 라우터와 무관하므로 끄고, TopBar 뒤로 확인만 동작한다. 브라우저 back 은 e2e 가 검증한다.
 *
 * 저장소에 아무것도 쓰지 않는다 — `history.state` 는 RR 의 값을 그대로 복제할 뿐 입력값을 담지 않는다 (AC-6-21).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

export interface LeaveGuard {
  /** 확인 Dialog 표시 여부. */
  promptOpen: boolean;
  /** TopBar 뒤로 — 변경이 있으면 확인, 없으면 바로 나간다. */
  requestBack: () => void;
  /** 확인 Dialog "Keep editing". */
  keepEditing: () => void;
  /** 확인 Dialog "Discard" · 저장 성공 — 이 화면을 떠난다 (sentinel 포함). */
  leave: () => void;
}

export function useLeaveGuard(dirty: boolean): LeaveGuard {
  const navigate = useNavigate();
  const location = useLocation();
  const [promptOpen, setPromptOpen] = useState(false);
  /** 현재 sentinel 항목 위에 있는가. */
  const sentinel = useRef(false);
  const dirtyRef = useRef(dirty);

  // 렌더 중에 ref 를 쓰지 않는다 (`react-hooks/refs`).
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  const browserBacked =
    typeof window !== 'undefined' && window.location.pathname === location.pathname;

  const pushSentinel = useCallback(() => {
    if (!browserBacked || sentinel.current) return;
    window.history.pushState(window.history.state, '', window.location.href);
    sentinel.current = true;
  }, [browserBacked]);

  useEffect(() => {
    if (dirty) pushSentinel();
  }, [dirty, pushSentinel]);

  const leave = useCallback(() => {
    setPromptOpen(false);
    const steps = sentinel.current ? 2 : 1;
    sentinel.current = false;
    void navigate(-steps);
  }, [navigate]);

  useEffect(() => {
    if (!browserBacked) return undefined;

    const onPop = () => {
      if (!sentinel.current) return;
      // sentinel 이 빠졌다 — 사용자는 아직 이 화면(원래 항목)에 있다.
      sentinel.current = false;
      if (dirtyRef.current) {
        setPromptOpen(true);
        return;
      }
      // 변경을 되돌린 상태 — 확인 없이 나가던 길을 마저 간다.
      void navigate(-1);
    };

    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
    };
  }, [browserBacked, navigate]);

  const requestBack = useCallback(() => {
    if (dirtyRef.current) {
      setPromptOpen(true);
      return;
    }
    leave();
  }, [leave]);

  const keepEditing = useCallback(() => {
    setPromptOpen(false);
    // 브라우저 back 으로 sentinel 이 빠졌으면 다시 깐다 — 다음 back 도 확인을 거친다.
    if (dirtyRef.current) pushSentinel();
  }, [pushSentinel]);

  return { promptOpen, requestBack, keepEditing, leave };
}
