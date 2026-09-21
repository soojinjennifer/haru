import { useRef } from 'react';

import { Button } from '../button/Button';

import { Dialog } from './Dialog';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** 되돌릴 수 없는 행동. 확인 버튼이 강조 테두리 방식이 되고 초기 포커스는 취소다. */
  destructive?: boolean;
  /** 확인 처리 중 — 확인 버튼이 loading 상태가 된다. */
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmDialog — Design Spec §4.22.
 *
 * `role="alertdialog"`, `Esc` = 취소, 초기 포커스 = destructive 면 취소 / 아니면 확인.
 * 사용처: Stage 2 로그아웃 · Stage 4 녹음 폐기 · Stage 8 삭제·탈퇴.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dialog
      open={open}
      title={title}
      description={description}
      role="alertdialog"
      variant={destructive ? 'destructive' : 'default'}
      onClose={onCancel}
      initialFocus={destructive ? cancelRef : confirmRef}
    >
      <div className="haru-dialog__actions">
        <div className="haru-dialog__action haru-dialog__action--confirm">
          <Button
            ref={confirmRef}
            variant={destructive ? 'glass' : 'accent'}
            size="md"
            fullWidth
            loading={confirming}
            onPress={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
        <div className="haru-dialog__action">
          <Button ref={cancelRef} variant="glass" size="md" fullWidth onPress={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
