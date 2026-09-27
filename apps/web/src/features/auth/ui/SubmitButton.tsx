/**
 * 폼 하단 주 CTA — 스크롤 컨테이너 **내부** 마지막 블록이다 (Stage 1 §2.2 키보드 가림 방지).
 * 위쪽 여백은 `flex-1` spacer 가 만든다 — 고정 높이 컨테이너를 만들지 않는다.
 */
import { Button } from '@haru/ui';
import type { ReactNode } from 'react';

export interface SubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export function SubmitButton({ children, loading = false, disabled = false }: SubmitButtonProps) {
  return (
    <div className="mt-auto flex flex-col pt-10">
      <Button
        type="submit"
        variant="accent"
        size="lg"
        fullWidth
        loading={loading}
        disabled={disabled}
      >
        {children}
      </Button>
    </div>
  );
}
