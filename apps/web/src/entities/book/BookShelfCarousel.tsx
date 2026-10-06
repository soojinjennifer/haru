/**
 * `BookShelfCarousel` — 서재 캐러셀 (Library Design Spec §3.3 · §8.2, Figma `113:1992` `[실측]`).
 *
 * ```
 * 블록 345×216 = 선반 192 + 간격 15(→16 흡수) + dots 7 (+2)
 * 열 x = 0 / 35.0574% / 69.2528%  ·  표지 폭 31.0145%  ·  3-up
 * ```
 *
 * ── snap 단위 = **페이지(3권)** (§3.3) ──
 * 근거: dots 가 **3개**이고 active 가 첫 번째다 `[실측]`. 열 offset 이 페이지 안에서만 성립하는
 * 퍼센트 값(35.06% / 69.25%)이므로 **항목 단위 snap 은 Figma 기하를 깨뜨린다**.
 * 페이지 수는 `ceil(items / 3)` 로 **데이터에서 파생**한다 — "dots 3개 = 9권" 은 `[추정]` 이므로
 * 고정값으로 쓰지 않는다. 페이지가 1개면 dots 를 표시하지 않는다 (§7.4 `shelf-partial`).
 *
 * ── 1~2권 (§7.4) ──
 * 퍼센트 그리드의 1·2번째 열만 채우고 **3번째는 비운다** — 자리를 접지 않는다. Figma 는 항상
 * 3-up 이라 1~2권 레이아웃이 **없고**, 열 폭·offset 을 유지하는 쪽이 Figma 기하를 지킨다.
 *
 * ── 접근성 (§9.4 · WCAG 2.5.1) ──
 * 가로 scroll-snap 은 네이티브 키보드 경로가 있다 — 트랙이 포커스를 받으면 ←/→/Home/End 로
 * 움직인다. 브라우저 기본 ←/→ 는 "조금씩" 스크롤하므로 **페이지 단위로 스냅**하도록 직접
 * 처리한다. 좌우 이동 버튼은 **Figma 에 없으므로 만들지 않는다**. dots 는 장식이고
 * (`PageIndicator` — `S1-G-1`) 현재 위치는 `aria-live="polite"` status 가 알린다.
 */
import { PageIndicator } from '@haru/ui';
import { useEffect, useRef, type ReactNode } from 'react';

/** Figma 가 3-up 이다 `[실측 113:1992]` — 페이지 한 장의 칸 수. */
export const SHELF_PAGE_SIZE = 3;

export interface BookShelfCarouselProps {
  /** 트랙 자체의 접근성 이름 (예: 섹션 제목). */
  label: string;
  /** 현재 페이지를 읽어 주는 문구. */
  statusLabel: string;
  /** 0-based 현재 페이지. */
  index: number;
  onIndexChange: (index: number) => void;
  /** 칸 내용 — 보통 `BookShelfItem` 이다. 3개 단위로 페이지가 된다. */
  items: readonly ReactNode[];
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    pages.push(items.slice(start, start + size));
  }
  return pages;
}

export function BookShelfCarousel({
  label,
  statusLabel,
  index,
  onIndexChange,
  items,
}: BookShelfCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pages = chunk(items, SHELF_PAGE_SIZE);

  /*
    스크롤 위치 → 페이지 index. `scrollend` 가 있으면 그걸 쓰고 없으면(Safari) `scroll` 로 받는다.
    스냅 폭은 **측정값**이다 — 토큰 값을 JS 에서 다시 계산하면 CSS 와 어긋날 수 있다
    (`ActivityCardTrack` 선례).
  */
  useEffect(() => {
    const node = trackRef.current;
    if (node === null) return;

    function readIndex(): void {
      const track = trackRef.current;
      if (track === null) return;

      const first = track.firstElementChild;
      if (!(first instanceof HTMLElement)) return;

      // 스냅 간격 = 페이지 폭 + 페이지 사이 `column-gap`(= gutter). 측정값만 쓴다.
      const stride = first.offsetWidth + gapOf(track);
      if (stride <= 0) return;

      onIndexChange(Math.max(0, Math.min(pages.length - 1, Math.round(track.scrollLeft / stride))));
    }

    const event = 'onscrollend' in node ? 'scrollend' : 'scroll';
    node.addEventListener(event, readIndex, { passive: true });

    return () => {
      node.removeEventListener(event, readIndex);
    };
  }, [pages.length, onIndexChange]);

  /** index 를 **먼저** 갱신한다 — `aria-live` 알림이 조작보다 늦지 않게 (`ActivityCardTrack` 선례). */
  function goTo(target: number): void {
    onIndexChange(target);

    const track = trackRef.current;
    if (track === null) return;

    const child = track.children[target];
    if (!(child instanceof HTMLElement)) return;

    /*
      `offsetLeft` 는 `offsetParent` 기준이 달라질 수 있다. 화면 좌표 차이로 계산하면 기준이
      항상 트랙 자신이라 흔들리지 않는다. `scroll-padding-inline-start` 만큼 빼야 스냅 위치와
      정확히 같아진다.
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
    const last = pages.length - 1;
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
    <div className="haru-shelf-carousel">
      {/*
        가로 스크롤 영역은 **키보드로 조작 가능해야 한다** (WCAG 2.1.1 · 2.5.1 — axe
        `scrollable-region-focusable`). `jsx-a11y` 의 두 규칙은 "비상호작용 요소에 포커스·키
        핸들러를 달지 말라" 는 일반 규칙이라 스크롤 컨테이너에서 충돌한다 — **이 자리에서만** 끈다.
      */}
      {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div
        ref={trackRef}
        className="haru-shelf-track"
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {pages.map((page, position) => (
          <div
            // 페이지는 위치로 식별된다 — 재정렬이 없다.
            key={position}
            className="haru-shelf-page"
            // 포커스 링을 **스냅된 페이지**에 그린다 — 트랙 border box 가 그림자 inset 만큼
            // 벌어지므로 UA 기본 링을 쓸 수 없다 (`R-SHADOW-1` ⑤).
            data-active={position === index ? 'true' : undefined}
          >
            {page.map((item, slot) => (
              <div key={slot} className="haru-shelf-page__slot">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      {pages.length > 1 ? (
        <>
          <PageIndicator count={pages.length} index={index} />
          <p className="haru-visually-hidden" role="status" aria-live="polite">
            {statusLabel}
          </p>
        </>
      ) : null}
    </div>
  );
}

/** 트랙의 실제 `column-gap`(px). 계산값이 없으면 0 으로 본다 (`ActivityCardTrack` 선례). */
function gapOf(track: HTMLElement): number {
  const value = Number.parseFloat(globalThis.getComputedStyle?.(track).columnGap ?? '0');
  return Number.isFinite(value) ? value : 0;
}

/** `prefers-reduced-motion: reduce` 면 **즉시 이동**한다 (`ActivityCardTrack` 과 같은 규칙). */
function prefersReducedMotion(): boolean {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}
