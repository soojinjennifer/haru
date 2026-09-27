/**
 * `/auth/sign-up` — Design Spec §2.2 (Figma `179:1724`, **보호자 영역만** — 허용 차이 `AD-S2-1`).
 *
 * 가입 성공 후 이동은 `ROUTES.home` 로 보내고 **Route Guard 가 판정**한다.
 * 동의 기록이 없으면 Guard 가 `/auth/consent` 로 보낸다 (C-2, `resolveGuardDecision` 3번 규칙).
 */
import { useNavigate } from 'react-router';

import { SignUpForm } from '../../features/auth';
import { ROUTES } from '../../shared/config/routes';

export function SignUpPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col pt-6">
      <SignUpForm
        onSignedUp={() => {
          void navigate(ROUTES.home, { replace: true });
        }}
      />
    </div>
  );
}
