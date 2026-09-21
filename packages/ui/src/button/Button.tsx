import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';

import { Spinner } from '../feedback/Spinner';
import { cx } from '../lib/cx';

/** Design Spec §4.4 — Figma `17:20` (Glass / Accent). */
export type ButtonVariant = 'accent' | 'glass';

/** Design Spec §4.4 — 45 / 56 (`--button-height-md` / `-lg`). */
export type ButtonSize = 'md' | 'lg';

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style' | 'children' | 'onClick' | 'type' | 'disabled'
>;

export interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 라벨 앞 아이콘. 장식이므로 `aria-hidden` 컨테이너에 렌더된다. */
  leadingIcon?: ReactNode;
  /** 라벨 뒤 아이콘. 장식이므로 `aria-hidden` 컨테이너에 렌더된다. */
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  /** 진행 중. 라벨 폭을 유지한 채 인디케이터를 표시하고 누름을 무시한다 (§4.4). */
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  /** 누름 핸들러. Design Spec §4.4 prop 이름을 따른다 (`onClick` 은 노출하지 않는다). */
  onPress?: () => void;
  /**
   * 버튼 요소 참조. Dialog 초기 포커스(§4.22)처럼 **포커스 이동이 필요한 곳**에서만 쓴다.
   * React 19 에서 ref 는 일반 prop 이다.
   */
  ref?: Ref<HTMLButtonElement>;
  /** 라벨. 아이콘만 쓰는 용도는 금지 — IconButton 을 쓴다 (§4.4). */
  children: ReactNode;
}

/**
 * Button — Design Spec §4.4.
 *
 * state: rest · hover · pressed · disabled · focus · loading.
 * `loading` 중에는 포커스를 유지해야 하므로 native `disabled` 을 쓰지 않고 누름만 무시한다.
 */
export function Button({
  variant = 'accent',
  size = 'md',
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  onPress,
  ref,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={cx(
        'haru-button',
        'haru-focus-ring',
        `haru-button--${variant}`,
        `haru-button--${size}`,
        fullWidth && 'haru-button--full',
        loading && 'haru-button--loading',
      )}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      onClick={() => {
        if (loading) return;
        onPress?.();
      }}
    >
      <span className="haru-button__content">
        {leadingIcon ? (
          <span className="haru-button__icon" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}
        <span className="haru-button__label">{children}</span>
        {trailingIcon ? (
          <span className="haru-button__icon" aria-hidden="true">
            {trailingIcon}
          </span>
        ) : null}
      </span>
      {loading ? (
        <span className="haru-button__indicator">
          {/* 버튼이 `aria-busy` 를 갖고 있으므로 Spinner 는 장식이다 (§4.9). */}
          <Spinner size="sm" tone="inherit" decorative />
        </span>
      ) : null}
    </button>
  );
}
