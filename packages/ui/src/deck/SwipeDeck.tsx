import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import { IconButton } from '../button/IconButton';
import { Icon } from '../icon/Icon';
import { cx } from '../lib/cx';
import { MOTION_DURATION_MS } from '../lib/motion';

/** Figma `179:1781–1783` 은 3장이다. 더 깊은 스택은 Figma 근거가 없어 열지 않는다. */
export type SwipeDeckDepth = 1 | 2 | 3;

/**
 * 이전/다음 버튼 위치.
 *  - `inline` — SwipeDeck 이 덱 아래에 직접 렌더한다 (기본값).
 *  - `none`   — 화면이 같은 동작의 버튼을 TopBar 등 다른 위치에 두는 경우
 *               (Figma `179:1772`/`179:1775`). 이때도 키보드 경로는 덱이 계속 제공한다.
 */
export type SwipeDeckControls = 'inline' | 'none';

export interface SwipeDeckProps<TItem> {
  items: readonly TItem[];
  /** 현재 카드 index (controlled). */
  index: number;
  onIndexChange: (index: number) => void;
  renderItem: (item: TItem, index: number) => ReactNode;
  /** 덱 전체의 접근성 이름. */
  label: string;
  /** 이전 버튼 접근성 이름 (예: "Previous question"). */
  prevLabel: string;
  /** 다음 버튼 접근성 이름 (예: "Next question"). */
  nextLabel: string;
  /** 카드 전환을 알리는 문구 (예: "Question 3 of 10"). 문구는 소비자가 소유한다. */
  statusLabel?: string;
  depth?: SwipeDeckDepth;
  controls?: SwipeDeckControls;
  /**
   * 제스처를 듣는 요소. **기본은 앞 카드**이고, 그 경우 이 prop 을 주지 않는다.
   *
   * 앞 카드 위에 **겹쳐 둔 보조 컨트롤**(예: 카드 모서리에 반씩 걸친 이전/다음 버튼)이 있으면
   * 그 컨트롤이 `pointerdown` 을 가져가 카드의 제스처가 시작되지 않는다. 카드와 그 컨트롤을
   * **모두 포함하는** 요소의 ref 를 넘기면 덱이 그 요소에서 포인터를 듣는다.
   *
   * 제스처 규격(임계값·방향·애니메이션)은 그대로다. 컨트롤의 클릭도 그대로 산다 — 덱은
   * `SWIPE_SLOP_PX` 를 넘기 전에는 포인터를 **캡처하지 않기** 때문이다 (`QA-2-001` 과 같은
   * 규칙): 움직이면 제스처, 제자리에서 떼면 클릭이다.
   *
   * 이 요소에는 앞 카드와 같은 `touch-action: pan-y` 가 필요하다 (소비자 CSS 책임).
   */
  gestureSurfaceRef?: RefObject<HTMLElement | null>;
}

type Direction = 'next' | 'prev';

/**
 * 핸들러가 실제로 쓰는 포인터 속성만. React 합성 이벤트와 native `PointerEvent` 가 **둘 다**
 * 만족하므로 기본 경로(앞 카드의 React 핸들러)와 `gestureSurfaceRef` 경로(native 리스너)가
 * 같은 코드를 쓴다 — 제스처 로직이 두 벌 생기지 않는다.
 */
type PointerLike = Pick<
  PointerEvent,
  'pointerType' | 'button' | 'buttons' | 'clientX' | 'pointerId'
>;

/** 스와이프 확정 임계 — 카드 폭의 25%, 최소 48px. 미만이면 원위치로 되돌아온다 (§4.2 `returning`). */
const SWIPE_THRESHOLD_RATIO = 0.25;
const SWIPE_THRESHOLD_MIN_PX = 48;
/** 덱 끝에서 더 끌 때의 저항. */
const OVERSCROLL_DAMPING = 4;
/**
 * 제스처로 인정하는 최소 이동량. 이 값을 넘기 전까지는 **포인터를 캡처하지 않는다** —
 * `pointerdown` 에서 바로 `setPointerCapture` 를 걸면 후속 `mouseup`·`click` 의 target 이
 * 캡처 요소(= 카드 컨테이너)로 **리타깃**되어 카드 안의 radio·버튼이 마우스로 눌리지 않는다
 * (`QA-2-001`). 캡처는 실제로 끌기 시작한 시점에만 필요하다.
 */
const SWIPE_SLOP_PX = 8;

/** 화살표 키를 자체 처리하는 컨트롤 위에서는 덱이 키를 가로채지 않는다. */
const KEY_OWNING_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [role="radio"], [role="slider"], [role="spinbutton"], [role="tab"], [role="listbox"], [role="menu"], [role="menubar"]';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * SwipeDeck — Stage 2 Design Spec §4.2 (Figma `179:1781–1783`).
 *
 * **구현 방식은 결정 `D-9` 다: CSS `scroll-snap` 을 쓰지 않는다.** `scroll-snap` 은
 * `overflow-x: auto` 컨테이너를 `AppColumn` 안에 만들어야 하는데, 그러면 카드
 * `--shadow-glass-*`(가로 약 28px 번짐)가 직사각형으로 잘린다 (Stage 1 §2.2 · `QA-1-L1`).
 * 여기서는 **Pointer Events + `transform`** 만 쓰며 이 파일에는 `overflow` 선언이 없다.
 *
 * **버튼과 키보드가 1급 경로다** (WCAG 2.5.1). 제스처는 부가 기능이며, 제스처 없이도
 * 이전/다음 버튼(`controls="inline"`)과 `ArrowLeft`/`ArrowRight` 로 모든 카드에 도달한다.
 * 화살표는 덱 안에 포커스가 있을 때 동작한다(덱 자체는 포커스 대상이 아니다 — APG carousel
 * 과 같이 버튼이 기본 경로다). 화살표를 자체 처리하는 컨트롤(RadioGroup 등) 위에서는
 * 그쪽이 우선한다.
 *
 * 뒤 카드는 **빈 표면**으로만 그린다 — 내용을 복제하면 같은 `name` 의 radio 가 문서에
 * 중복되어 폼 동작이 깨지고, 접근성 트리에도 중복이 생긴다. 뒤 카드는 `aria-hidden` 이다.
 */
export function SwipeDeck<TItem>({
  items,
  index,
  onIndexChange,
  renderItem,
  label,
  prevLabel,
  nextLabel,
  statusLabel,
  depth = 3,
  controls = 'inline',
  gestureSurfaceRef,
}: SwipeDeckProps<TItem>) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exit, setExit] = useState<{ direction: Direction; target: number } | null>(null);

  const deckRef = useRef<HTMLElement | null>(null);
  const startXRef = useRef(0);
  const widthRef = useRef(0);
  const draggingRef = useRef(false);
  /** 눌려 있는 포인터. 끌기 전 단계(캡처 없음)를 추적한다. */
  const pressedPointerRef = useRef<number | null>(null);
  // 최신 핸들러를 effect 재구독 없이 참조한다 (useFocusTrap 과 같은 방식).
  const commitRef = useRef(onIndexChange);

  useEffect(() => {
    commitRef.current = onIndexChange;
  }, [onIndexChange]);

  // 진행 애니메이션이 끝나면 index 를 확정한다. reduced-motion 은 애니메이션 자체를
  // 건너뛰므로 여기에 오지 않는다 (§9.2 — 즉시 교체).
  useEffect(() => {
    if (exit === null) return undefined;
    const timer = setTimeout(() => {
      commitRef.current(exit.target);
      setExit(null);
    }, MOTION_DURATION_MS.base);
    return () => {
      clearTimeout(timer);
    };
  }, [exit]);

  const total = items.length;
  const current = items[index];
  const canPrev = index > 0;
  const canNext = index < total - 1;
  const busy = exit !== null;

  function advance(direction: Direction): void {
    if (busy) return;
    const target = direction === 'next' ? index + 1 : index - 1;
    if (target < 0 || target >= total) return;

    setDragX(0);
    setDragging(false);
    draggingRef.current = false;
    pressedPointerRef.current = null;

    if (prefersReducedMotion()) {
      onIndexChange(target);
      return;
    }
    setExit({ direction, target });
  }

  function beginPress(surface: HTMLElement, event: PointerLike): void {
    if (busy || total <= 1) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    startXRef.current = event.clientX;
    widthRef.current = surface.getBoundingClientRect().width;
    pressedPointerRef.current = event.pointerId;
    // 여기서 캡처하지 않는다 (`SWIPE_SLOP_PX` 주석 — 카드 안 컨트롤의 클릭을 지키기 위해).
  }

  function trackPress(surface: HTMLElement, event: PointerLike): void {
    if (pressedPointerRef.current !== event.pointerId) return;
    // 캡처가 없는 구간에서 버튼을 떼고 카드 밖에서 놓으면 pointerup 이 오지 않는다. 마우스는
    // pointerId 가 재사용되므로 버튼을 뗀 이동으로 그 상태를 정리한다. (touch·pen 은 암묵적
    // 캡처가 있어 항상 pointerup·pointercancel 이 온다.)
    if (!draggingRef.current && event.pointerType === 'mouse' && event.buttons === 0) {
      pressedPointerRef.current = null;
      return;
    }

    const raw = event.clientX - startXRef.current;

    if (!draggingRef.current) {
      if (Math.abs(raw) < SWIPE_SLOP_PX) return;
      // 실제로 끌기 시작한 지금 캡처한다. 이후 포인터가 카드를 벗어나도 이동·종료를 받고,
      // 끌기 뒤의 click 은 카드로 리타깃되어 카드 안 컨트롤을 실수로 누르지 않는다.
      draggingRef.current = true;
      setDragging(true);
      surface.setPointerCapture?.(event.pointerId);
    }

    const blocked = (raw < 0 && !canNext) || (raw > 0 && !canPrev);
    setDragX(blocked ? raw / OVERSCROLL_DAMPING : raw);
  }

  function endDrag(surface: HTMLElement, event: PointerLike): void {
    if (pressedPointerRef.current === event.pointerId) pressedPointerRef.current = null;
    // 끌지 않았다면 평범한 클릭·탭이다. 아무것도 소비하지 않는다.
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    if (surface.hasPointerCapture?.(event.pointerId) === true) {
      surface.releasePointerCapture(event.pointerId);
    }

    const threshold = Math.max(widthRef.current * SWIPE_THRESHOLD_RATIO, SWIPE_THRESHOLD_MIN_PX);
    const travelled = dragX;
    setDragX(0);

    if (travelled <= -threshold && canNext) advance('next');
    else if (travelled >= threshold && canPrev) advance('prev');
  }

  /*
    `gestureSurfaceRef` 가 있으면 제스처를 **그 요소에서** 듣는다 (카드 위에 겹친 컨트롤까지
    포함하기 위해). 그 요소는 앞 카드의 조상이므로 카드에서 시작한 포인터도 bubbling 으로
    여기에 온다 — 그래서 이때 앞 카드에는 React 핸들러를 **달지 않는다**(이중 처리 방지).
    등록 방식은 키보드와 같은 ref + native listener 다 (앞 카드는 index 마다 교체되지만
    surface 는 수명이 길다).
  */
  const gestureRef = useRef({ beginPress, trackPress, endDrag });
  useEffect(() => {
    gestureRef.current = { beginPress, trackPress, endDrag };
  });

  useEffect(() => {
    const surface = gestureSurfaceRef?.current ?? null;
    if (surface === null) return undefined;

    const down = (event: PointerEvent): void => {
      gestureRef.current.beginPress(surface, event);
    };
    const move = (event: PointerEvent): void => {
      gestureRef.current.trackPress(surface, event);
    };
    const end = (event: PointerEvent): void => {
      gestureRef.current.endDrag(surface, event);
    };

    surface.addEventListener('pointerdown', down);
    surface.addEventListener('pointermove', move);
    surface.addEventListener('pointerup', end);
    surface.addEventListener('pointercancel', end);

    return () => {
      surface.removeEventListener('pointerdown', down);
      surface.removeEventListener('pointermove', move);
      surface.removeEventListener('pointerup', end);
      surface.removeEventListener('pointercancel', end);
    };
  }, [gestureSurfaceRef]);

  // 키보드 등록은 JSX 핸들러가 아니라 ref + native listener 로 한다.
  // `role="group"` 컨테이너에 핸들러를 직접 달면 비인터랙티브 요소에 조작을 붙이는 형태가 된다.
  const advanceRef = useRef(advance);

  useEffect(() => {
    advanceRef.current = advance;
  });

  useEffect(() => {
    const deck = deckRef.current;
    if (deck === null) return undefined;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      // 화살표를 자체 처리하는 컨트롤(RadioGroup 등) 위에서는 그쪽이 우선이다.
      if (event.target instanceof Element && event.target.closest(KEY_OWNING_SELECTOR)) return;

      event.preventDefault();
      advanceRef.current(event.key === 'ArrowRight' ? 'next' : 'prev');
    };

    deck.addEventListener('keydown', onKeyDown);
    return () => {
      deck.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const behindLevels = Array.from(
    { length: Math.max(0, Math.min(depth - 1, total - 1 - index)) },
    (_unused, offset) => offset + 1,
  );

  /** 기본 경로 — 앞 카드가 제스처 표면이다. `gestureSurfaceRef` 가 그 역할을 맡으면 비운다. */
  const frontCardPointerProps =
    gestureSurfaceRef === undefined
      ? {
          onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
            beginPress(event.currentTarget, event);
          },
          onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
            trackPress(event.currentTarget, event);
          },
          onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
            endDrag(event.currentTarget, event);
          },
          onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => {
            endDrag(event.currentTarget, event);
          },
        }
      : {};

  return (
    <section
      ref={deckRef}
      className={cx('haru-swipe-deck', `haru-swipe-deck--depth-${String(depth)}`)}
      role="group"
      aria-roledescription="card deck"
      aria-label={label}
    >
      <div className="haru-swipe-deck__stack">
        {behindLevels.map((level) => (
          <div
            key={`behind-${String(level)}`}
            className={cx(
              'haru-swipe-deck__card',
              'haru-swipe-deck__card--behind',
              `haru-swipe-deck__card--level-${String(level)}`,
            )}
            aria-hidden="true"
          />
        ))}
        {current === undefined ? null : (
          <div
            key={index}
            className={cx(
              'haru-swipe-deck__card',
              'haru-swipe-deck__card--front',
              dragging && 'haru-swipe-deck__card--dragging',
              exit !== null && `haru-swipe-deck__card--exit-${exit.direction}`,
            )}
            /* 드래그 오프셋은 디자인 값이 아니라 포인터 위치다 (토큰 대상 아님). */
            style={dragX === 0 ? undefined : { ['--deck-drag-x' as string]: `${String(dragX)}px` }}
            inert={busy}
            {...frontCardPointerProps}
          >
            {renderItem(current, index)}
          </div>
        )}
      </div>

      {controls === 'inline' ? (
        <div className="haru-swipe-deck__controls">
          <IconButton
            icon={<Icon name="chevron-left" decorative />}
            label={prevLabel}
            variant="glass"
            disabled={!canPrev || busy}
            onPress={() => {
              advance('prev');
            }}
          />
          <IconButton
            icon={<Icon name="chevron-right" decorative />}
            label={nextLabel}
            variant="glass"
            disabled={!canNext || busy}
            onPress={() => {
              advance('next');
            }}
          />
        </div>
      ) : null}

      <span className="haru-visually-hidden" aria-live="polite">
        {statusLabel}
      </span>
    </section>
  );
}
