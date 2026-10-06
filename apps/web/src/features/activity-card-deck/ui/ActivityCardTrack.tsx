/**
 * `ActivityCardTrack` — Home 의 **가로 scroll-snap 트랙** (Figma `163:2648`).
 *
 * ── 왜 `SwipeDeck` 이 아닌가 (approvals §12.2) ──
 * Figma 트랙은 `pad 14 + 카드 365 + gap 6 + peek 8 = 393` = 뷰포트 폭이다. 즉 **1 카드 =
 * 1 페이지 스냅**이고 Z축 스택이 아니다. `D-14`(Home 덱에 `SwipeDeck` 재사용) 중 Home 부분이
 * 무효가 되었다. `SwipeDeck` 자체는 **삭제하지 않는다** — Stage 2 온보딩 설문이 계속 쓴다.
 *
 * ── 왜 `packages/ui` 가 아닌가 (audit §16.2) ──
 * `Carousel` 은 코드가 아직 없고 Library 는 **Figma 재대조 전**이다. 두 번째 사용처를 실측으로
 * 확인하기 전에 공유 API 를 정하면 최우선 규칙 4("구현 전 실측")에 걸린다. Library 재대조에서
 * 같은 규약이 확인되면 그때 승격한다.
 *
 * ── 접근성 (`AC-3-18` · WCAG 2.5.1) ──
 * 가로 scroll-snap 은 **네이티브 키보드 경로**가 있다 — 트랙이 포커스를 받으면 ←/→/Home/End
 * 로 스크롤된다. 그래서 제스처 전용이 아니며 좌우 이동 버튼이 필요 없다 (Figma 에도 없다).
 * 다만 브라우저 기본 ←/→ 는 "조금씩" 스크롤하므로 **한 카드 단위로 스냅**하도록 직접 처리한다.
 * 현재 위치는 `aria-live="polite"` status 가 알린다 (dots 는 장식이다).
 */
import { useEffect, useRef, type ReactNode } from 'react';

export interface ActivityCardTrackProps {
  /** 트랙 자체의 접근성 이름 (예: `Tonight's options`). */
  label: string;
  /** 각 카드의 접근성 이름 (예: `Option 1 of 3: …`). */
  itemLabel: (index: number) => string;
  /** 현재 스냅된 카드 번호를 읽어 주는 문구. */
  statusLabel: string;
  index: number;
  onIndexChange: (index: number) => void;
  children: readonly ReactNode[];
}

export function ActivityCardTrack({
  label,
  itemLabel,
  statusLabel,
  index,
  onIndexChange,
  children,
}: ActivityCardTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  /*
    스크롤 위치 → index. `scrollend` 가 있으면 그걸 쓰고, 없으면(Safari) `scroll` 로 받는다.
    스냅 폭은 **측정값**이다 — 토큰 값을 JS 에서 다시 계산하면 CSS 와 어긋날 수 있다.
  */
  useEffect(() => {
    const node = trackRef.current;
    if (node === null) return;

    function readIndex(): void {
      const track = trackRef.current;
      if (track === null) return;

      const first = track.firstElementChild;
      if (!(first instanceof HTMLElement)) return;

      const stride = first.offsetWidth + gapOf(track);
      if (stride <= 0) return;

      const next = Math.max(
        0,
        Math.min(children.length - 1, Math.round(track.scrollLeft / stride)),
      );
      onIndexChange(next);
    }

    const supportsScrollEnd = 'onscrollend' in node;
    const event = supportsScrollEnd ? 'scrollend' : 'scroll';
    node.addEventListener(event, readIndex, { passive: true });

    return () => {
      node.removeEventListener(event, readIndex);
    };
  }, [children.length, onIndexChange]);

  /**
   * 키보드로 한 카드 이동.
   *
   * **index 를 먼저 갱신**한다 — 스크롤은 비동기(smooth)이고 `scrollend` 가 늦게 오므로,
   * 그걸 기다리면 `aria-live` 알림이 조작보다 늦는다. 스크롤 핸들러가 같은 값을 다시 써도
   * 결과가 같다(멱등).
   */
  function goTo(target: number): void {
    onIndexChange(target);

    const track = trackRef.current;
    if (track === null) return;

    const child = track.children[target];
    if (!(child instanceof HTMLElement)) return;

    /*
      `offsetLeft` 는 `offsetParent` 에 따라 기준이 달라진다. 화면 좌표 차이로 계산하면
      기준이 항상 트랙 자신이라 흔들리지 않는다. `scroll-padding-inline-start` 만큼 빼야
      스냅 위치와 정확히 같아진다.
    */
    const padStart = Number.parseFloat(
      globalThis.getComputedStyle?.(track).scrollPaddingInlineStart ?? '0',
    );
    const delta = child.getBoundingClientRect().left - track.getBoundingClientRect().left;
    const left = track.scrollLeft + delta - (Number.isFinite(padStart) ? padStart : 0);

    // jsdom 에는 `Element.scrollTo` 가 없다 — 그래도 동작이 끊기지 않게 직접 대입한다.
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    } else {
      track.scrollLeft = left;
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const last = children.length - 1;
    const target =
      event.key === 'ArrowRight'
        ? Math.min(last, index + 1)
        : event.key === 'ArrowLeft'
          ? Math.max(0, index - 1)
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;

    if (target === null) return;

    event.preventDefault();
    goTo(target);
  }

  return (
    <>
      {/*
        가로 스크롤 영역은 **키보드로 조작 가능해야 한다** (WCAG 2.1.1 · 2.5.1 — axe
        `scrollable-region-focusable`). `jsx-a11y` 의 두 규칙은 "비상호작용 요소에 포커스·키
        핸들러를 달지 말라" 는 일반 규칙이라 스크롤 컨테이너에서 충돌한다 — **이 자리에서만**
        끈다. 좌우 이동 버튼은 Figma 에 없으므로(approvals §12.3) 이 경로가 1급 대체 수단이다.
      */}
      {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div
        ref={trackRef}
        className="haru-activity-track"
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {children.map((child, position) => (
          <div
            // 카드는 위치로 식별된다 — 덱 길이가 3으로 고정이고 재정렬이 없다.
            key={itemLabel(position)}
            className="haru-activity-track__item"
            // 포커스 링을 **스냅된 카드**에 그린다 (트랙 border box 가 그림자 inset 만큼
            // 벌어지므로 UA 기본 링을 쓸 수 없다 — `R-SHADOW-1` #5 · audit §22.7 ①).
            data-active={position === index ? 'true' : undefined}
            role="group"
            aria-label={itemLabel(position)}
          >
            {child}
          </div>
        ))}
      </div>
      {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <p className="haru-visually-hidden" role="status" aria-live="polite">
        {statusLabel}
      </p>
    </>
  );
}

/**
 * `prefers-reduced-motion: reduce` 면 **즉시 이동**한다 (`AC-3-19`).
 * 부드러운 스크롤을 강제하면 모션 민감 사용자에게 의도치 않은 애니메이션이 남는다.
 */
function prefersReducedMotion(): boolean {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/** 트랙의 실제 `column-gap`(px). 계산값이 없으면 0 으로 본다. */
function gapOf(track: HTMLElement): number {
  const gap = globalThis.getComputedStyle?.(track).columnGap ?? '0';
  const value = Number.parseFloat(gap);
  return Number.isFinite(value) ? value : 0;
}
