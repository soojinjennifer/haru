import type { CSSProperties } from 'react';

import { cx } from '../lib/cx';

/** Design Spec §4.18 — `accent`(teal) · `neutral`. */
export type ProgressBarTone = 'accent' | 'neutral';

/** Design Spec §4.18 — 6 / 8 (`--progress-height-sm` / `-md`). */
export type ProgressBarSize = 'sm' | 'md';

export interface ProgressBarProps {
  /** 현재 값. `null` 이면 indeterminate 상태가 된다 (§4.18). */
  value: number | null;
  max?: number;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
  /** 접근성 이름 — 필수. */
  label: string;
  /** 값을 색 외에 텍스트("1 / 10")로도 전달한다 (§4.18). */
  showValue?: boolean;
}

function clamp(value: number, max: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > max) return max;
  return value;
}

/**
 * ProgressBar — Design Spec §4.18.
 *
 * 도메인 로직을 갖지 않는다. 값 계산·표시 문구는 호출부가 정한다.
 */
export function ProgressBar({
  value,
  max = 100,
  tone = 'accent',
  size = 'sm',
  label,
  showValue = false,
}: ProgressBarProps) {
  const indeterminate = value === null;
  const safeMax = max > 0 ? max : 1;
  const current = indeterminate ? 0 : clamp(value, safeMax);
  const percent = indeterminate ? 0 : (current / safeMax) * 100;

  const fillStyle = { '--haru-progress-fill-size': `${percent}%` } as CSSProperties;

  return (
    <div className={cx('haru-progress', `haru-progress--${size}`, `haru-progress--${tone}`)}>
      <div
        className={cx(
          'haru-progress__track',
          indeterminate && 'haru-progress__track--indeterminate',
        )}
        role="progressbar"
        aria-label={label}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : safeMax}
        aria-valuenow={indeterminate ? undefined : current}
      >
        <div className="haru-progress__fill" style={fillStyle} />
      </div>
      {showValue && !indeterminate ? (
        <span className="haru-progress__value">
          {current} / {safeMax}
        </span>
      ) : null}
    </div>
  );
}
