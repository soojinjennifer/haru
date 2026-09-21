import { useId, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { usePresence } from '../hooks/usePresence';
import { cx } from '../lib/cx';
import { MOTION_DURATION_MS } from '../lib/motion';
import { Scrim } from '../sheet/Scrim';
import { Text } from '../text/Text';

/** Design Spec §4.22 — `destructive` 는 확인 버튼을 강조 테두리 방식으로 바꾼다. */
export type DialogVariant = 'default' | 'destructive';

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string | undefined;
  /** 본문 아래 영역 (버튼 등). */
  children?: ReactNode;
  /** `Esc` · 배경 탭으로 닫을 때 호출된다. */
  onClose?: () => void;
  variant?: DialogVariant;
  /** 되돌릴 수 없는 확인은 `alertdialog` 다 (§4.22). */
  role?: 'dialog' | 'alertdialog';
  initialFocus?: RefObject<HTMLElement | null>;
  /** false 면 Esc·배경 탭으로 닫히지 않는다. */
  dismissible?: boolean;
}

/**
 * Dialog — Design Spec §4.22 (Figma 없음 → 명세).
 *
 * focus trap · `aria-modal` · `Esc` · 배경 스크롤 잠금을 제공한다.
 * 정보 전달용으로 쓰지 않는다 — 되돌릴 수 없는 행동 확인에만 쓴다 (§5.6).
 */
export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
  variant = 'default',
  role = 'dialog',
  initialFocus,
  dismissible = true,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { mounted, state } = usePresence(open, MOTION_DURATION_MS.fast);
  const containerRef = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: dismissible ? onClose : undefined,
    initialFocus,
  });
  useBodyScrollLock(open);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="haru-dialog-root">
      <Scrim level="dialog" state={state} onClick={dismissible ? onClose : undefined} />
      <div className="haru-dialog-layer">
        <div
          ref={containerRef}
          className={cx('haru-dialog', `haru-dialog--${variant}`, `haru-dialog--${state}`)}
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description === undefined ? undefined : descriptionId}
        >
          <Text as="h2" id={titleId} variant="headline" tone="primary" align="center">
            {title}
          </Text>
          {description === undefined ? null : (
            <Text id={descriptionId} variant="subheadline" tone="secondary" align="center">
              {description}
            </Text>
          )}
          {children === undefined ? null : <div className="haru-dialog__footer">{children}</div>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
