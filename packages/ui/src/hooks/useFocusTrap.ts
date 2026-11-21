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

/**
 * Tab 순서에 실제로 오르는 요소 — 같은 `name` 의 radio 묶음은 **하나**만 Tab 정지점이다
 * (선택된 것, 없으면 첫 번째). 묶음 전체를 넣으면 "마지막 요소" 판정이 Tab 순서와 어긋나
 * focus 가 컨테이너 밖으로 새어 나간다 — Stage 8 `S8-G` 감사 실측: 연도 선택 시트에서 Tab
 * 한 번에 focus 가 body 로, Shift+Tab 으로 배경 화면 `Next` 로 빠졌다 (AC-8-48).
 */
function tabStops(container: HTMLElement): HTMLElement[] {
  const focusable = focusableElements(container);
  const radioStop = new Map<string, HTMLElement>();
  for (const element of focusable) {
    if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || element.name === '')
      continue;
    const current = radioStop.get(element.name);
    if (current === undefined || (element.checked && !(current as HTMLInputElement).checked)) {
      radioStop.set(element.name, element);
    }
  }
  return focusable.filter(
    (element) =>
      !(element instanceof HTMLInputElement) ||
      element.type !== 'radio' ||
      element.name === '' ||
      radioStop.get(element.name) === element,
  );
}

/** 지금 focus 가 있는 Tab 정지점 — radio 묶음 안이면 그 묶음의 정지점. */
function currentStop(stops: readonly HTMLElement[], active: Element | null): HTMLElement | null {
  if (!(active instanceof HTMLElement)) return null;
  if (stops.includes(active)) return active;
  if (active instanceof HTMLInputElement && active.type === 'radio' && active.name !== '') {
    return (
      stops.find(
        (stop) =>
          stop instanceof HTMLInputElement && stop.type === 'radio' && stop.name === active.name,
      ) ?? null
    );
  }
  return null;
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

      const stops = tabStops(container);
      if (stops.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = stops[0] as HTMLElement;
      const last = stops[stops.length - 1] as HTMLElement;
      const activeElement = document.activeElement;
      const current = currentStop(stops, activeElement);

      if (event.shiftKey && (current === first || !container.contains(activeElement))) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && (current === last || !container.contains(activeElement))) {
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
