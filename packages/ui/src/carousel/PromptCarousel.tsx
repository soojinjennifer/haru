import {
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';

import { Icon } from '../icon/Icon';
import { cx } from '../lib/cx';
import { PageIndicator } from '../progress/PageIndicator';

/** 한 페이지 = pill 줄의 라벨 + (선택) 그 아래 상세. 도메인 값은 소비자가 렌더해 넘긴다. */
export interface PromptCarouselPage {
  key: string;
  label: ReactNode;
  /** 없으면 그 페이지의 상세 자리는 비어 있다 — placeholder 를 만들지 않는다. */
  detail?: ReactNode;
}

export interface PromptCarouselProps {
  pages: readonly PromptCarouselPage[];
  /** 0-based 현재 페이지 (controlled). */
  index: number;
  onIndexChange: (index: number) => void;
  /** 캐러셀 그룹의 접근성 이름. */
  label: string;
  previousLabel: string;
  nextLabel: string;
  /** 위치 문구 (예: "Prompt 2 of 7") — 문구는 소비자가 소유한다. */
  positionLabel: (index: number, count: number) => string;
  /** 캐러셀 루트(`tabIndex=-1`) — 시트의 초기 포커스 대상으로 쓴다. */
  ref?: Ref<HTMLDivElement>;
}

/** 이보다 짧은 가로 이동은 스와이프가 아니다 (탭·세로 스크롤 오인 방지). */
const SWIPE_MIN_PX = 40;

/**
 * PromptCarousel — Stage 4 Design Spec §3.2 · §4 #2 (Figma `88:960` 안 `88:708` + `88:897`, 변형 `86:324`).
 *
 * ```
 * root (group, aria-roledescription=carousel) · 세로 gap 10
 * ├ bar  310×40 pill — 면 #dbeee7 · 1px 테두리 · px12 py8   [‹ 24] [라벨 트랙] [› 24]
 * ├ 상세 트랙 (선택)
 * └ PageIndicator (개수 = 페이지 수)
 * ```
 *
 * - **1 페이지 = 라벨 + 상세** 를 함께 넘긴다. 라벨·상세 트랙은 같은 `index` 로 함께 움직인다.
 * - 화살표는 **pill 안에 고정**된다(Figma `86:324` arrow 변형) — 트랙과 함께 밀려나지 않아 포커스가 남는다.
 *   첫/끝 페이지에서 흐림(`--color-carousel-arrow-disabled`) + `aria-disabled` — native `disabled` 는
 *   누른 버튼에서 포커스를 빼앗으므로 쓰지 않는다. 터치 44 는 `::before`.
 * - 이동 수단: 화살표 버튼(WCAG 2.5.1 의 제스처 대안) · 가로 스와이프(Pointer Events) · `ArrowLeft/Right`.
 * - 보이지 않는 페이지는 `inert` + `aria-hidden`. 페이지 변경 낭독(`aria-live`)은 쓰지 않는다 —
 *   위치는 PageIndicator 의 시각 숨김 텍스트가 전달한다.
 * - 도메인을 모른다 — 라벨·상세는 소비자가 렌더한다 (`packages/ui` 경계).
 */
export function PromptCarousel({
  pages,
  index,
  onIndexChange,
  label,
  previousLabel,
  nextLabel,
  positionLabel,
  ref,
}: PromptCarouselProps) {
  const count = pages.length;
  const current = Math.min(Math.max(index, 0), Math.max(count - 1, 0));
  const first = current <= 0;
  const last = current >= count - 1;
  const swipeStart = useRef<{ id: number; x: number; y: number } | null>(null);

  const go = (next: number) => {
    if (next < 0 || next > count - 1 || next === current) return;
    onIndexChange(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(current - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(current + 1);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    swipeStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) <= Math.abs(dy)) return;
    go(dx < 0 ? current + 1 : current - 1);
  };

  const trackStyle = { '--prompt-carousel-index': current } as CSSProperties;
  const hasDetail = pages.some((page) => page.detail !== undefined);

  const slides = (part: 'label' | 'detail') =>
    pages.map((page, pageIndex) => {
      const hidden = pageIndex !== current;
      return (
        <div
          key={page.key}
          className="haru-prompt-carousel__slide"
          aria-hidden={hidden || undefined}
          inert={hidden}
        >
          {part === 'label' ? page.label : page.detail}
        </div>
      );
    });

  return (
    /*
      캐러셀 그룹은 화살표 키·스와이프로 조작된다(WCAG 2.1.1 · 2.5.1 의 버튼 대안은 화살표 버튼). `jsx-a11y` 의
      "비상호작용 요소에 키·포인터 핸들러 금지" 일반 규칙과 충돌한다 — `BookShelfCarousel` 선례처럼 **이 자리에서만** 끈다.
    */
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={ref}
      className="haru-prompt-carousel"
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipeStart.current = null;
      }}
    >
      <div className="haru-prompt-carousel__bar">
        <button
          type="button"
          className={cx('haru-prompt-carousel__arrow', 'haru-focus-ring')}
          aria-label={previousLabel}
          aria-disabled={first || undefined}
          onClick={() => {
            go(current - 1);
          }}
        >
          <Icon name="haru:carousel-previous" size="lg" decorative />
        </button>
        <div className="haru-prompt-carousel__viewport">
          <div className="haru-prompt-carousel__track" style={trackStyle}>
            {slides('label')}
          </div>
        </div>
        <button
          type="button"
          className={cx('haru-prompt-carousel__arrow', 'haru-focus-ring')}
          aria-label={nextLabel}
          aria-disabled={last || undefined}
          onClick={() => {
            go(current + 1);
          }}
        >
          <Icon name="haru:carousel-next" size="lg" decorative />
        </button>
      </div>
      {hasDetail ? (
        <div className="haru-prompt-carousel__viewport">
          <div
            className="haru-prompt-carousel__track haru-prompt-carousel__track--detail"
            style={trackStyle}
          >
            {slides('detail')}
          </div>
        </div>
      ) : null}
      <div className="haru-prompt-carousel__indicator">
        <PageIndicator count={count} index={current} label={positionLabel(current, count)} />
      </div>
    </div>
  );
}
