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
  /**
   * track 을 여러 구간으로 나눈다. 배열 값은 **구간의 상대 길이**이고 합이 전체다
   * (Stage 2 재구성 Design Spec §3.3 — 단계별 카드 수 비율). 왼쪽 구간부터 채워진다.
   * 비율 배열은 호출부가 데이터에서 파생해 넘긴다 — 컴포넌트는 숫자의 의미를 모른다.
   */
  segments?: readonly number[];
  /** 스크린리더에 읽히는 값 문구 (`aria-valuetext`). 없으면 숫자 값만 읽힌다. */
  valueText?: string | undefined;
}

function clamp(value: number, max: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > max) return max;
  return value;
}

function fillStyleOf(percent: number): CSSProperties {
  return { '--progress-fill-size': `${percent}%` } as CSSProperties;
}

/**
 * ProgressBar — Design Spec §4.18.
 *
 * 도메인 로직을 갖지 않는다. 값 계산·표시 문구·구간 비율은 호출부가 정한다.
 */
export function ProgressBar({
  value,
  max = 100,
  tone = 'accent',
  size = 'sm',
  label,
  showValue = false,
  segments,
  valueText,
}: ProgressBarProps) {
  const indeterminate = value === null;
  const safeMax = max > 0 ? max : 1;
  const current = indeterminate ? 0 : clamp(value, safeMax);
  const percent = indeterminate ? 0 : (current / safeMax) * 100;

  const usableSegments =
    segments === undefined || segments.length < 2 || segments.some((part) => part <= 0)
      ? undefined
      : segments;

  const accessibility = {
    role: 'progressbar' as const,
    'aria-label': label,
    'aria-valuemin': indeterminate ? undefined : 0,
    'aria-valuemax': indeterminate ? undefined : safeMax,
    'aria-valuenow': indeterminate ? undefined : current,
    'aria-valuetext': indeterminate ? undefined : valueText,
  };

  return (
    <div className={cx('haru-progress', `haru-progress--${size}`, `haru-progress--${tone}`)}>
      {usableSegments === undefined ? (
        <div
          className={cx(
            'haru-progress__track',
            indeterminate && 'haru-progress__track--indeterminate',
          )}
          {...accessibility}
        >
          <div className="haru-progress__fill" style={fillStyleOf(percent)} />
        </div>
      ) : (
        <div className="haru-progress__segments" {...accessibility}>
          {usableSegments.map((part, index) => {
            const total = usableSegments.reduce((sum, item) => sum + item, 0);
            const before = usableSegments.slice(0, index).reduce((sum, item) => sum + item, 0);
            const filled = (current / safeMax) * total;
            const ratio = clamp((filled - before) / part, 1);

            return (
              <div
                /* 구간은 비율 배열의 자리로만 식별된다 — 단계 이름을 모른다. */
                key={`${String(index)}-${String(part)}`}
                className="haru-progress__track"
                style={{ flexGrow: part } as CSSProperties}
              >
                <div className="haru-progress__fill" style={fillStyleOf(ratio * 100)} />
              </div>
            );
          })}
        </div>
      )}
      {showValue && !indeterminate ? (
        <span className="haru-progress__value">
          {current} / {safeMax}
        </span>
      ) : null}
    </div>
  );
}
