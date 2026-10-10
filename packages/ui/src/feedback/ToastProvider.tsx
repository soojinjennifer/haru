import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
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

/** 화면 상단 고정 영역(TopBar 슬롯)을 ToastProvider 에 알리는 등록 창구. */
interface ToastViewportRegistry {
  retain: (element: HTMLElement) => void;
  release: (element: HTMLElement) => void;
}

const ToastViewportContext = createContext<ToastViewportRegistry | null>(null);

/**
 * "이 화면 상단에는 TopBar 가 있고, 높이는 이만큼이다" 를 ToastProvider 에 **런타임으로**
 * 알린다 (사용자 결정 2026-10-10 — Toast 상단 이동).
 *
 * ── 왜 prop 이 아니라 등록인가 ──
 * ToastProvider 는 Toast 를 화면당 1개로 묶기 위해 **앱 조립 지점**(router 바깥)에 한 번
 * 마운트된다. 그 지점은 현재 route 에 TopBar 가 있는지, 몇 px 인지 알 수 없다. 과거
 * `withTabBar` prop 은 **아무도 넘길 수 없는 자리에 있었고**, 보정 CSS 가 Production 에서
 * 도달 불가 코드였다 (하단 Toast 가 탭 3개 클릭을 막았다 — `QA-3-004`, approvals §26.2).
 * 반대로 값을 하드코딩하면 TopBar 가 없는 화면의 Toast 가 그만큼 떠 버린다.
 * 그래서 **TopBar 슬롯을 실제로 렌더하는 Layout** 이 자기 생명주기 동안만 보정을 요청한다.
 *
 * ── 왜 토큰 상수가 아니라 실측인가 ──
 * TopBar 슬롯 높이는 화면마다 다르다 (2026-10-10 실측: `/auth/log-in` **40** · `/` **48** —
 * Home 은 `.haru-home-top-bar` 가 상단 여백 10 을 더하고 `--topbar-height` 는 40 이다).
 * 토큰 하나로 고정하면 더 높은 화면에서 **또 가려지고**, 최대값으로 고정하면 낮은 화면에서
 * Toast 가 공중에 뜬다. 등록된 요소를 재면 새 화면이 생겨도 스스로 맞는다.
 *
 * ── 왜 Set + max 인가 ──
 * route 전환은 "새 Layout 마운트"와 "옛 Layout 정리"가 한 커밋 안에서 일어나고, StrictMode 는
 * effect 를 mount → unmount → mount 로 두 번 돈다. 단일 값이면 순서에 따라 뒤집힌다. 겹치는
 * 순간에는 **큰 쪽**을 쓴다 — 과보정은 Toast 가 조금 아래에 뜨는 것으로 끝나지만, 과소보정은
 * 곧바로 TopBar 가림(= 클릭 불능)이다.
 *
 * @param ref TopBar 슬롯 요소. `null` 이면(= TopBar 없음) 등록하지 않는다.
 */
export function useToastTopBarInset(ref: RefObject<HTMLElement | null>): void {
  const registry = useContext(ToastViewportContext);

  useEffect(() => {
    const element = ref.current;
    if (registry === null || element === null) return undefined;

    registry.retain(element);
    return () => {
      registry.release(element);
    };
  }, [registry, ref]);
}

interface QueuedToast extends ToastOptions {
  id: number;
}

export interface ToastProviderProps {
  children: ReactNode;
}

/** 등록된 TopBar 슬롯의 측정 결과. `count` 0 = TopBar 없는 화면. */
interface TopBarInset {
  count: number;
  blockSize: number;
}

const NO_TOP_BAR: TopBarInset = { count: 0, blockSize: 0 };

/**
 * ToastProvider — Design Spec §4.12 (배치는 사용자 결정 2026-10-10 로 **상단**).
 *
 * 앱 컬럼 폭 안 **상단**에 Toast 하나를 렌더한다. 큐를 두지 않는다(양육자 화면 단순화).
 *
 * 상단 offset 은 TopBar 유무로 갈린다 — TopBar 슬롯이 있는 화면은 `useToastTopBarInset`
 * 등록으로 그 **실측 높이만큼** 내려간다.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<QueuedToast | null>(null);
  const [open, setOpen] = useState(false);
  const [topBar, setTopBar] = useState<TopBarInset>(NO_TOP_BAR);
  const topBarsRef = useRef<Set<HTMLElement>>(new Set());
  const observerRef = useRef<ResizeObserver | null>(null);
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

  /**
   * 등록된 TopBar 슬롯 중 **가장 높은 것**을 Toast 상단 보정값으로 쓴다.
   *
   * 값이 같으면 state 객체를 그대로 두어 불필요한 리렌더를 만들지 않는다 —
   * `ResizeObserver` 는 스크롤·배경 전환 같은 무관한 변화에도 콜백을 부를 수 있다.
   */
  const measureTopBar = useCallback(() => {
    let blockSize = 0;
    for (const element of topBarsRef.current) {
      blockSize = Math.max(blockSize, element.getBoundingClientRect().height);
    }
    const count = topBarsRef.current.size;

    setTopBar((previous) =>
      previous.count === count && previous.blockSize === blockSize
        ? previous
        : { count, blockSize },
    );
  }, []);

  const registry = useMemo<ToastViewportRegistry>(
    () => ({
      retain: (element) => {
        topBarsRef.current.add(element);
        /*
          폰트 교체·칩 문구 변경으로 TopBar 높이가 **React 리렌더 없이** 바뀔 수 있다.
          `ResizeObserver` 가 없는 환경(jsdom)에서는 등록 시점 1회 측정으로 떨어지고,
          CSS 가 `--topbar-height` 로 대체한다 (`Toast.css`).
        */
        if (observerRef.current === null && typeof ResizeObserver === 'function') {
          observerRef.current = new ResizeObserver(() => {
            measureTopBar();
          });
        }
        observerRef.current?.observe(element);
        measureTopBar();
      },
      release: (element) => {
        topBarsRef.current.delete(element);
        observerRef.current?.unobserve(element);
        measureTopBar();
      },
    }),
    [measureTopBar],
  );

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    [],
  );

  const withTopBar = topBar.count > 0;
  /*
    실측값은 **디자인 값이 아니라 레이아웃 측정 결과**이므로 토큰으로 표현할 수 없다
    (화면마다 다르다 — `useToastTopBarInset` 주석의 실측 표). 0 이면 넘기지 않아
    CSS 쪽 `--topbar-height` fallback 이 살아 있게 한다.
  */
  const viewportStyle =
    topBar.blockSize > 0
      ? ({ '--toast-top-bar-block-size': `${String(topBar.blockSize)}px` } as CSSProperties)
      : undefined;

  return (
    <ToastContext.Provider value={controller}>
      <ToastViewportContext.Provider value={registry}>
        {children}
        {mounted && toast && typeof document !== 'undefined'
          ? createPortal(
              <div
                className={
                  withTopBar
                    ? 'haru-toast-viewport haru-toast-viewport--below-top-bar'
                    : 'haru-toast-viewport'
                }
                {...(viewportStyle === undefined ? {} : { style: viewportStyle })}
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
