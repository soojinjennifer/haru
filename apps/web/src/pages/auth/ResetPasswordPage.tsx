/**
 * `/auth/reset-password` — Design Spec §2.5 (`C13-01`, Figma 없음 → 명세).
 *
 * 메일 링크로 진입한다 (`?token=…`). TopBar 에 뒤로 가기가 없다 — 돌아갈 화면이 없기 때문이다.
 */
import { useToast } from '@haru/ui';
import { useNavigate, useSearchParams } from 'react-router';

import { authCopy, ResetPasswordForm } from '../../features/auth';
import { ROUTES } from '../../shared/config/routes';

/** 재설정 링크가 실어 오는 쿼리 파라미터 이름. 실제 발급은 Backend 몫이다 (P2-BIP-02). */
export const RESET_TOKEN_PARAM = 'token';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  return (
    <div className="flex flex-1 flex-col pt-6">
      <ResetPasswordForm
        token={searchParams.get(RESET_TOKEN_PARAM)}
        onUpdated={() => {
          toast.show({ message: authCopy.resetPassword.successToast, tone: 'success' });
          void navigate(ROUTES.auth.logIn, { replace: true });
        }}
        onRequestNewLink={() => {
          void navigate(ROUTES.auth.forgotPassword, { replace: true });
        }}
      />
    </div>
  );
}
