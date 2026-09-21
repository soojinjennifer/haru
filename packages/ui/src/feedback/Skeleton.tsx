import { cx } from '../lib/cx';

/** Design Spec §4.9 — 로딩 자리표시자 모양. */
export type SkeletonShape = 'text' | 'rect' | 'circle' | 'card';

export type SkeletonLines = 1 | 2 | 3 | 4 | 5;

export interface SkeletonProps {
  shape?: SkeletonShape;
  /** `shape="text"` 일 때의 줄 수. 마지막 줄은 폭 60% 다 (§4.9). */
  lines?: SkeletonLines;
}

/**
 * Skeleton — Design Spec §4.9 (Figma 없음 → 명세, `가값 P-10`).
 *
 * 스크린리더에는 노출하지 않는다(`aria-hidden`). 로딩 안내는 **컨테이너**가
 * `aria-busy="true"` 와 `role="status"` 로 한 번만 전달한다 (§4.9 · §5.1).
 * shimmer gradient 는 쓰지 않는다 — opacity pulse 만 (`--animate-skeleton`).
 */
export function Skeleton({ shape = 'text', lines = 1 }: SkeletonProps) {
  if (shape === 'text') {
    return (
      <span className="haru-skeleton haru-skeleton--text" aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={cx(
              'haru-skeleton__line',
              index === lines - 1 && lines > 1 && 'haru-skeleton__line--last',
            )}
          />
        ))}
      </span>
    );
  }

  return <span className={cx('haru-skeleton', `haru-skeleton--${shape}`)} aria-hidden="true" />;
}
