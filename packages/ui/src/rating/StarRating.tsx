import { useRef, type KeyboardEvent } from 'react';

import { HARU_ICONS } from '../icon/haru';
import { cx } from '../lib/cx';

const RatingGlyph = HARU_ICONS['haru:rating-star'];

export interface StarRatingProps {
  /** 0 = 미선택(초기), 1..max = 선택한 별 수. */
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  /** 각 별의 접근성 이름 — 문구는 소비자 copy 모듈이 준다 (예: `1 star` · `5 stars`). */
  getStarLabel: (star: number) => string;
  /** 포커스는 받지만 값을 바꿀 수 없다 (`aria-readonly`) — 제출된 값 표시. */
  readOnly?: boolean;
  /** 조작 불가 (`aria-disabled`). 포커스는 유지한다 — native `disabled` 를 쓰지 않는다. */
  disabled?: boolean;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/**
 * StarRating — Stage 5 Design Spec §3.1 (Figma `91:693`).
 *
 * - 의미: `radiogroup` + 별마다 `radio` (`aria-checked` = 선택한 값의 별 하나). roving tabindex.
 *   ←/↓ 하나 줄임 · →/↑ 하나 늘림 · Home/End — 이동이 곧 선택이다. 같은 별 재탭 = 변화 없음 (`N5-18` ⓐ).
 * - 시각: 별 30, 간격 8, 가운데 정렬. 각 별 버튼은 **38 폭**(30 + 간격 8)이라 이웃과 겹치지 않고 글리프 간격이
 *   정확히 8 이 된다. 세로는 행 높이 30 을 유지하고 `::before` hit slop 으로 44 를 만든다 — 가로 38 은 44 미달이며
 *   가값 `P-29` 다 (Spec M-5).
 * - 색: 채움 `--color-rating-filled` · 빈 `--color-rating-empty` (`T5-1`). 채움/빈 구분이 색뿐이라 SR 은
 *   `aria-checked` 로 보완한다 (Spec §9.2, `P-02`).
 */
export function StarRating({
  value,
  max = 5,
  onChange,
  getStarLabel,
  readOnly = false,
  disabled = false,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
}: StarRatingProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const locked = readOnly || disabled;
  const stars = Array.from({ length: max }, (_, index) => index + 1);
  /** roving tabindex — 선택한 별, 없으면 첫 별. */
  const tabStop = value >= 1 && value <= max ? value : 1;

  function select(next: number, moveFocus: boolean) {
    const clamped = Math.min(max, Math.max(1, next));
    if (moveFocus) refs.current[clamped - 1]?.focus();
    if (locked || clamped === value) return;
    onChange?.(clamped);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, star: number) {
    const current = value >= 1 ? value : 0;
    const base = locked ? star : current;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        select(base + 1, true);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        select(Math.max(1, base - 1), true);
        break;
      case 'Home':
        event.preventDefault();
        select(1, true);
        break;
      case 'End':
        event.preventDefault();
        select(max, true);
        break;
      default:
        break;
    }
  }

  return (
    <div
      className={cx('haru-star-rating', locked && 'haru-star-rating--locked')}
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
    >
      {stars.map((star) => (
        <button
          key={star}
          ref={(element) => {
            refs.current[star - 1] = element;
          }}
          type="button"
          role="radio"
          className="haru-star-rating__star haru-focus-ring"
          aria-checked={star === value}
          aria-label={getStarLabel(star)}
          tabIndex={star === tabStop ? 0 : -1}
          data-filled={star <= value}
          onClick={() => {
            select(star, false);
          }}
          onKeyDown={(event) => {
            onKeyDown(event, star);
          }}
        >
          <span className="haru-star-rating__glyph" aria-hidden="true">
            <RatingGlyph />
          </span>
        </button>
      ))}
    </div>
  );
}
