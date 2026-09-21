import { useId, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { usePresence } from '../hooks/usePresence';
import { cx } from '../lib/cx';
import { MOTION_DURATION_MS } from '../lib/motion';
import { Text } from '../text/Text';

import { Scrim } from './Scrim';

/** Design Spec §4.21 — `full` 은 전체 높이. */
export type SheetVariant = 'bottom' | 'full';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: SheetVariant;
  /** 헤더 우측 슬롯 (닫기 IconButton 등). */
  trailing?: ReactNode;
  /** 열릴 때 포커스를 받을 요소. 없으면 시트 안 첫 포커스 대상. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** false 면 Esc·배경 탭으로 닫히지 않는다. */
  dismissible?: boolean;
}

/**
 * Sheet — Design Spec §4.21.
 *
 * `role="dialog"` + `aria-modal` + focus trap + `Esc` + 배경 스크롤 잠금.
 * 닫힐 때 포커스는 트리거로 되돌아간다 (`useFocusTrap`).
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  variant = 'bottom',
  trailing,
  initialFocus,
  dismissible = true,
}: SheetProps) {
  const titleId = useId();
  const { mounted, state } = usePresence(open, MOTION_DURATION_MS.base);
  const containerRef = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: dismissible ? onClose : undefined,
    initialFocus,
  });
  useBodyScrollLock(open);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="haru-sheet-root">
      <Scrim level="sheet" state={state} onClick={dismissible ? onClose : undefined} />
      <div
        ref={containerRef}
        className={cx('haru-sheet', `haru-sheet--${variant}`, `haru-sheet--${state}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <span className="haru-sheet__grabber" aria-hidden="true" />
        <div className="haru-sheet__header">
          <Text as="h2" id={titleId} variant="headline" tone="primary">
            {title}
          </Text>
          {trailing === undefined ? null : <div className="haru-sheet__trailing">{trailing}</div>}
        </div>
        <div className="haru-sheet__content">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
