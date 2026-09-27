/**
 * `/auth/verify-parent` — Design Spec §2.7 (`C13-03`, **내용 없는 슬롯**).
 *
 * Page 는 조립만 한다: `me.parentVerification.status` 를 읽어 슬롯에 넘기고,
 * "Continue" 는 `ROUTES.home` 으로 보내 **Route Guard 가 판정**하게 한다.
 * `pending` · `failed` 인 동안 Guard 가 다시 이 화면으로 돌려보내므로 온보딩 진입이
 * 막히고 아동 데이터 쓰기가 0건이 된다 (AC-2-17).
 *
 * "Try again" 은 `me` 재조회다 — VPC 검증 endpoint 는 contracts 에 없고
 * 실제 확인 방식은 법무 `L-01` · `BACKEND_INTEGRATION_PENDING`(P2-BIP-05) 이다.
 */
import { useNavigate } from 'react-router';

import { useMe } from '../../entities/me';
import { VpcStep } from '../../features/consent';
import { ROUTES } from '../../shared/config/routes';

export function ParentVerificationPage() {
  const navigate = useNavigate();
  const { me, isPending, refetch } = useMe();

  return (
    <VpcStep
      status={me?.parentVerification.status ?? 'not_required'}
      retrying={isPending}
      onContinue={() => {
        void navigate(ROUTES.home, { replace: true });
      }}
      onRetry={refetch}
    />
  );
}
