import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { usePresence } from '../hooks/usePresence';
import { MOTION_DURATION_MS, TOAST_DURATION_MS } from '../lib/motion';

import { Toast, type ToastAction, type ToastTone } from './Toast';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** ms. `0` 이면 자동 해제하지 않는다. 기본은 액션 유무에 따라 4000 / 6000 (§4.12). */
  duration?: number;
  action?: ToastAction;
  onDismiss?: () => void;
  /** 닫기 버튼 접근성 이름. 액션이 있으면 수동 해제 수단이 필요하다 (§4.12). */
  dismissLabel?: string;
}

export interface ToastController {
  /** 동시 표시는 최대 1개다 — 새 Toast 가 기존 것을 **교체**한다 (§4.12). */
  show: (options: ToastOptions) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastController | null>(null);

/** 하단 탭바 존재를 ToastProvider 에 알리는 등록 창구 (`QA-3-004`). */
interface ToastViewportRegistry {
  retain: () => void;
  release: () => void;
}

const ToastViewportContext = createContext<ToastViewportRegistry | null>(null);

/**
 * "이 화면에는 BottomTabBar 가 있다" 를 ToastProvider 에 **런타임으로** 알린다 (`QA-3-004`).
 *
 * ── 왜 prop 이 아니라 등록인가 ──
 * ToastProvider 는 Toast 를 화면당 1개로 묶기 위해 **앱 조립 지점**(router 바깥)에 한 번
 * 마운트된다. 그 지점은 현재 route 가 탭 화면인지 스택 화면인지 알 수 없다. 그래서 과거
 * `withTabBar` prop 은 **아무도 넘길 수 없는 자리에 있었고**, 탭바 보정 CSS 가 Production 에서
 * 도달 불가 코드였다 (탭 3개 클릭이 Toast 에 막혔다 — approvals §26.2).
 * 반대로 prop 을 참으로 하드코딩하면 탭바가 없는 온보딩·설정 Toast 가 탭바 높이만큼 뜬다.
 * 그래서 **탭바를 실제로 렌더하는 Layout** 이 자기 생명주기 동안만 보정을 요청한다.
 *
 * 참조 수를 세는 이유: route 전환은 "새 Layout 마운트"와 "옛 Layout 정리"가 한 커밋 안에서
 * 일어나고, StrictMode 는 effect 를 mount → unmount → mount 로 두 번 돈다. boolean 이면
 * 순서에 따라 값이 뒤집힐 수 있다.
 */
export function useToastTabBarInset(present = true): void {
  const registry = useContext(ToastViewportContext);

  useEffect(() => {
    if (registry === null || !present) return undefined;

    registry.retain();
    return () => {
      registry.release();
    };
  }, [registry, present]);
}

interface QueuedToast extends ToastOptions {
  id: number;
}

export interface ToastProviderProps {
  children: ReactNode;
}

/**
 * ToastProvider — Design Spec §4.12.
 *
 * 앱 컬럼 폭 안 하단에 Toast 하나를 렌더한다. 큐를 두지 않는다(양육자 화면 단순화).
 *
 * 하단 offset 은 탭바 유무로 갈린다 — 탭 화면은 `useToastTabBarInset` 등록으로 보정된다.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<QueuedToast | null>(null);
  const [open, setOpen] = useState(false);
  const [tabBarCount, setTabBarCount] = useState(0);
  const nextId = useRef(0);
  const { mounted, state } = usePresence(open, MOTION_DURATION_MS.fast);

  const toastRef = useRef<QueuedToast | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const dismiss = useCallback(() => {
    setOpen(false);
  }, []);

  const show = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    setToast({ ...options, id: nextId.current });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open || !toast) return undefined;

    const fallback =
      toast.action === undefined ? TOAST_DURATION_MS.default : TOAST_DURATION_MS.withAction;
    const duration = toast.duration ?? fallback;
    if (duration === 0) return undefined;

    const timer = setTimeout(() => {
      setOpen(false);
    }, duration);
    return () => {
      clearTimeout(timer);
    };
  }, [open, toast]);

  // 열림 → 닫힘 전이에서만 소비자 콜백을 부른다 (퇴장 애니메이션과 무관).
  useEffect(() => {
    if (wasOpen.current && !open) {
      toastRef.current?.onDismiss?.();
    }
    wasOpen.current = open;
  }, [open]);

  const controller = useMemo<ToastController>(() => ({ show, dismiss }), [show, dismiss]);

  const registry = useMemo<ToastViewportRegistry>(
    () => ({
      retain: () => {
        setTabBarCount((count) => count + 1);
      },
      release: () => {
        setTabBarCount((count) => Math.max(0, count - 1));
      },
    }),
    [],
  );

  const withTabBar = tabBarCount > 0;

  return (
    <ToastContext.Provider value={controller}>
      <ToastViewportContext.Provider value={registry}>
        {children}
        {mounted && toast && typeof document !== 'undefined'
          ? createPortal(
              <div
                className={
                  withTabBar
                    ? 'haru-toast-viewport haru-toast-viewport--tabbar'
                    : 'haru-toast-viewport'
                }
              >
                <Toast
                  key={toast.id}
                  message={toast.message}
                  tone={toast.tone ?? 'neutral'}
                  action={toast.action}
                  onDismiss={dismiss}
                  dismissLabel={toast.dismissLabel}
                  state={state}
                />
              </div>,
              document.body,
            )
          : null}
      </ToastViewportContext.Provider>
    </ToastContext.Provider>
  );
}

/** ToastProvider 안에서만 쓸 수 있다. */
export function useToast(): ToastController {
  const controller = useContext(ToastContext);
  if (!controller) {
    throw new Error('[haru/ui] useToast 는 <ToastProvider> 안에서만 쓸 수 있습니다.');
  }
  return controller;
}
