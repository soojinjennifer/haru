import { cx } from '../lib/cx';

export interface PageIndicatorProps {
  count: number;
  /** 0-based 현재 위치. */
  index: number;
  /** 상태를 텍스트로도 전달한다 (예: "2 of 3"). 문구는 앱이 소유한다. */
  label?: string;
}

/**
 * PageIndicator — Design Spec §4.19 (Figma `88:789`).
 *
 * **표시 전용**이다 (결정 `S1-G-1`, approvals §8). dot 은 장식이므로 `aria-hidden` 이고,
 * 상태는 `label` 텍스트가 전달한다. 페이지 이동은 스와이프·버튼이 담당하며 dot 은 누르지 않는다
 * — dot 7 + gap 6 (§4.19) 기하로는 이웃과 겹치지 않는 44 hit area 를 만들 수 없다 (§9.3).
 */
export function PageIndicator({ count, index, label }: PageIndicatorProps) {
  const dots = Array.from({ length: Math.max(count, 0) }, (_, dotIndex) => dotIndex);

  return (
    <div className="haru-page-indicator">
      <span className="haru-page-indicator__dots" aria-hidden="true">
        {dots.map((dotIndex) => (
          <span
            key={dotIndex}
            className={cx(
              'haru-page-indicator__dot',
              dotIndex === index && 'haru-page-indicator__dot--active',
            )}
          />
        ))}
      </span>
      {label === undefined ? null : <span className="haru-visually-hidden">{label}</span>}
    </div>
  );
}
