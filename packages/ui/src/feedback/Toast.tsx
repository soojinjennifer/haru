import { IconButton } from '../button/IconButton';
import { Icon } from '../icon/Icon';
import { cx } from '../lib/cx';
import { Text } from '../text/Text';

/** Design Spec §4.12. */
export type ToastTone = 'neutral' | 'success' | 'error';

/**
 * Design Spec §4.12 의 `entering` · `visible` · `exiting` 대응.
 * `entering` 은 마운트 직후 CSS 진입 애니메이션이 담당하므로 상태 값이 따로 없다.
 */
export type ToastState = 'open' | 'closing';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastProps {
  message: string;
  tone?: ToastTone;
  action?: ToastAction | undefined;
  onDismiss?: (() => void) | undefined;
  /** 닫기 버튼 접근성 이름 — 액션이 있으면 수동 해제 수단이 필요하다 (§4.12). */
  dismissLabel?: string | undefined;
  state?: ToastState;
}

/**
 * Toast — Design Spec §4.12 (Figma 없음 → 명세).
 *
 * 포커스를 빼앗지 않는다. `error` tone 만 `aria-live="assertive"` 다.
 * 오류를 Toast 로만 알리지 않는다 — 화면 안 ErrorState/InlineAlert 를 함께 쓴다 (§5.5).
 */
export function Toast({
  message,
  tone = 'neutral',
  action,
  onDismiss,
  dismissLabel,
  state = 'open',
}: ToastProps) {
  return (
    <div
      className={cx('haru-toast', `haru-toast--${tone}`, `haru-toast--${state}`)}
      role="status"
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <Text variant="footnote" tone="primary">
        {message}
      </Text>
      {action === undefined ? null : (
        <button
          type="button"
          className="haru-toast__action haru-focus-ring"
          onClick={action.onPress}
        >
          <Text as="span" variant="footnote" weight="semibold" tone="primary">
            {action.label}
          </Text>
        </button>
      )}
      {onDismiss === undefined || dismissLabel === undefined ? null : (
        <IconButton
          variant="plain"
          icon={<Icon name="x" size="md" decorative />}
          label={dismissLabel}
          onPress={onDismiss}
        />
      )}
    </div>
  );
}
