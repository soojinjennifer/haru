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

interface QueuedToast extends ToastOptions {
  id: number;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** BottomTabBar 가 있는 Layout 이면 하단 offset 에 탭바 높이를 더한다 (§4.12). */
  withTabBar?: boolean;
}

/**
 * ToastProvider — Design Spec §4.12.
 *
 * 앱 컬럼 폭 안 하단에 Toast 하나를 렌더한다. 큐를 두지 않는다(양육자 화면 단순화).
 */
export function ToastProvider({ children, withTabBar = false }: ToastProviderProps) {
  const [toast, setToast] = useState<QueuedToast | null>(null);
  const [open, setOpen] = useState(false);
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

  return (
    <ToastContext.Provider value={controller}>
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
