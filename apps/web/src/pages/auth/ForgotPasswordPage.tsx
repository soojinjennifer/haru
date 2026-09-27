/**
 * `/auth/forgot-password` — Design Spec §2.4 (`C13-01`, Figma 없음 → 명세).
 */
import { useNavigate } from 'react-router';

import { ForgotPasswordForm } from '../../features/auth';
import { ROUTES } from '../../shared/config/routes';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col pt-6">
      <ForgotPasswordForm
        onBackToLogIn={() => {
          void navigate(ROUTES.auth.logIn);
        }}
      />
    </div>
  );
}
