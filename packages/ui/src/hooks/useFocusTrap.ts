import { useEffect, useRef, type RefObject } from 'react';

/** 포커스 가능한 요소 선택자. `tabindex="-1"` 과 숨김 요소는 아래에서 걸러낸다. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]',
].join(',');

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getAttribute('tabindex') !== '-1' && !element.hasAttribute('aria-hidden'),
  );
}

export interface FocusTrapOptions {
  /** 트랩을 켤지 여부. */
  active: boolean;
  /** `Esc` 키 처리 (Design Spec §4.21 · §4.22). */
  onEscape?: (() => void) | undefined;
  /** 열릴 때 포커스를 받을 요소. 없으면 컨테이너 안 첫 포커스 대상. */
  initialFocus?: RefObject<HTMLElement | null> | undefined;
}

/**
 * Modal focus trap — Design Spec §4.21 · §4.22.
 *
 * 열릴 때 초기 포커스를 옮기고, Tab / Shift+Tab 을 컨테이너 안에서 순환시키며,
 * 닫힐 때 직전 포커스 위치(트리거)로 되돌린다.
 */
export function useFocusTrap<T extends HTMLElement>(
  options: FocusTrapOptions,
): RefObject<T | null> {
  const { active, onEscape, initialFocus } = options;
  const containerRef = useRef<T | null>(null);
  const escapeRef = useRef(onEscape);

  // 최신 핸들러를 effect 재구독 없이 참조한다 (ref 쓰기는 렌더 중이 아니라 effect 에서).
  useEffect(() => {
    escapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const target = initialFocus?.current ?? focusableElements(container)[0] ?? container;
    if (target === container && !container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '-1');
    }
    target.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        escapeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = focusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === first || !container.contains(activeElement))) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && (activeElement === last || !container.contains(activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [active, initialFocus]);

  return containerRef;
}
