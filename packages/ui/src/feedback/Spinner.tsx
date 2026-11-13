import { cx } from '../lib/cx';

/** Design Spec §4.9 — 16 / 24 / 32. */
export type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerTone = 'default' | 'on-accent' | 'inherit';

export interface SpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  /** 스크린리더용 진행 문구. */
  label?: string;
  /**
   * 부모가 이미 `aria-busy` 로 상태를 알리는 경우(Button `loading` 등)에 쓴다.
   * `role="status"` 대신 `aria-hidden` 으로 렌더해 중복 안내를 막는다 (§4.9).
   */
  decorative?: boolean;
  /**
   * `'auto'`(기본) = `role="status"` + `aria-live="polite"` 그대로. `'none'` = role · aria-live 를 붙이지 않는다 —
   * 부모가 이미 live region 일 때 중첩을 막는다 (Stage 5 `D5-12`, `InlineAlert` · `ErrorState` `announce` 와 같은 방식).
   * `decorative` 와 달리 라벨 텍스트는 접근성 트리에 남는다 (부모 live region 이 읽는다). `decorative` 가 우선한다.
   */
  announce?: 'auto' | 'none';
}

/**
 * Spinner — Design Spec §4.9 (Figma 없음 → 명세, `가값 P-10`).
 *
 * 원형 stroke 2px 의 270° arc 가 회전한다.
 * `prefers-reduced-motion: reduce` 에서는 회전을 멈추고 라벨 텍스트를 보이게 한다 (§9.2).
 */
export function Spinner({
  size = 'md',
  tone = 'default',
  label = 'Loading',
  decorative = false,
  announce = 'auto',
}: SpinnerProps) {
  const a11yProps = decorative
    ? ({ 'aria-hidden': true } as const)
    : announce === 'none'
      ? {}
      : ({ role: 'status', 'aria-live': 'polite' } as const);

  return (
    <span
      className={cx('haru-spinner', `haru-spinner--${size}`, `haru-spinner--tone-${tone}`)}
      {...a11yProps}
    >
      <svg className="haru-spinner__arc" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {/* r=10 → 둘레 62.83, 270° = 47.12 (§4.9 "270° arc") */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="47.12 62.83"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="haru-spinner__label">{label}</span>
    </span>
  );
}
