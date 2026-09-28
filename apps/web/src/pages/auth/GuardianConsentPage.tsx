/**
 * `/auth/consent` — Design Spec §2.6 (`C13-02`, Figma 없음 → 명세).
 *
 * Page 는 **조립만** 한다: `me` 에서 동의 상태를, 세션에서 가입 경로를 읽어 재동의 여부와
 * `source` 를 정하고 폼에 넘긴다. 기록 이후 이동은 `ROUTES.home` 으로 보내고
 * **Route Guard 가 판정한다** (동의가 끝나면 VPC 또는 온보딩으로).
 *
 * 가입 경로가 필요한 이유는 `consent_events.source` 가 `signup_email` 과 `signup_oauth` 를
 * 구분하기 때문이다 (`S2-CONSENT-1`). 판정 자체는 `consentSourceFor` 순수 함수가 한다.
 */
import { useNavigate } from 'react-router';

import { useMe } from '../../entities/me';
import { consentSourceFor, GuardianConsentForm, isReconsent } from '../../features/consent';
import { useAuthSession } from '../../shared/auth';
import { ROUTES } from '../../shared/config/routes';

export function GuardianConsentPage() {
  const navigate = useNavigate();
  const { me } = useMe();
  const session = useAuthSession();

  // Guard 가 이 화면으로 보냈다면 `me` 는 이미 해석된 상태다. 방어적으로 기본값을 둔다.
  const status = me?.consentStatus;

  return (
    <GuardianConsentForm
      source={consentSourceFor(status, session?.provider)}
      reconsent={status !== undefined && isReconsent(status)}
      onRecorded={() => {
        void navigate(ROUTES.home, { replace: true });
      }}
    />
  );
}
