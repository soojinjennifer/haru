import type { CSSProperties } from 'react';

import { cx } from '../lib/cx';

/** Design Spec §4.18 — `accent`(teal) · `neutral`. */
export type ProgressBarTone = 'accent' | 'neutral';

/** Design Spec §4.18 — 6 / 8 (`--progress-height-sm` / `-md`). */
export type ProgressBarSize = 'sm' | 'md';

interface ProgressBarBaseProps {
  /** 현재 값. `null` 이면 indeterminate 상태가 된다 (§4.18). */
  value: number | null;
  max?: number;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
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

/** 기본 — `role="progressbar"` 로 값을 접근성 트리에 노출한다. 접근성 이름 필수. */
interface ProgressBarAnnouncedProps extends ProgressBarBaseProps {
  decorative?: false;
  /** 접근성 이름 — 필수. */
  label: string;
}

/**
 * **장식 모드** — Stage 7 Plan §5.7 · `M7-11` (AC-7-31).
 *
 * `role="progressbar"` 는 `aria-valuenow` 로 SR 이 **퍼센트를 읽는다** → 숫자 미노출 결정(`N7-05` · `N7-15`)과
 * 충돌한다. 같은 정보를 옆 텍스트(단계 라벨 · *Next report on …*)가 전달하는 자리에서는 막대를
 * `aria-hidden` 으로 접근성 트리에서 뺀다. 이 모드에서는 role · aria-value* 를 **만들지 않으므로** 이름도 받지 않는다.
 */
interface ProgressBarDecorativeProps extends ProgressBarBaseProps {
  decorative: true;
  label?: undefined;
  valueText?: undefined;
}

export type ProgressBarProps = ProgressBarAnnouncedProps | ProgressBarDecorativeProps;

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
 *
 * **채움 색 override** (Stage 7 `T7-2`) — prop 이 아니라 CSS 변수 `--progress-fill-color` 하나다.
 * 호출 측 CSS 가 조상에 선언하면 fill 이 그 색을 쓰고, 없으면 기존 `--color-progress-fill` 그대로다
 * (`ProgressBar.css` fallback — 미지정 시 DOM · 렌더 불변, AC-7-81).
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
  decorative = false,
}: ProgressBarProps) {
  const indeterminate = value === null;
  const safeMax = max > 0 ? max : 1;
  const current = indeterminate ? 0 : clamp(value, safeMax);
  const percent = indeterminate ? 0 : (current / safeMax) * 100;

  const usableSegments =
    segments === undefined || segments.length < 2 || segments.some((part) => part <= 0)
      ? undefined
      : segments;

  const accessibility = decorative
    ? {}
    : {
        role: 'progressbar' as const,
        'aria-label': label,
        'aria-valuemin': indeterminate ? undefined : 0,
        'aria-valuemax': indeterminate ? undefined : safeMax,
        'aria-valuenow': indeterminate ? undefined : current,
        'aria-valuetext': indeterminate ? undefined : valueText,
      };

  return (
    <div
      className={cx('haru-progress', `haru-progress--${size}`, `haru-progress--${tone}`)}
      // 장식 모드만 속성을 단다 — 기본 모드의 DOM 은 Stage 6 와 같다 (AC-7-81).
      aria-hidden={decorative ? true : undefined}
    >
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
