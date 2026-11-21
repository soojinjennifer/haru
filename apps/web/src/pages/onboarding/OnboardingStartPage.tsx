/**
 * `/onboarding/start` — 재구성 Design Spec §2 (Figma `243:1147`).
 *
 * 동의 직후 첫 화면이며 **프로필 입력 소개**다. Page 는 **조립만** 한다: 세션으로 Trial
 * 여부만 판단해 넘긴다. draft 읽기·전이는 feature 가 한다.
 *
 * Trial 안내 아래 기기 draft 삭제 TextLink (Stage 8 `C13-S8-7` · `VG8-D-07` — `D8-2` ③, Spec §2.7) — `/onboarding` · Step 1 과
 * **같은 규칙**(draft 응답 있음 + 미인증 · 안내와 한 묶음 · 간격 `P-41` · 문구 · Dialog · 이동). `243:1147` 디자이너 영역 변경 0
 * (C13-11 안내 영역 안). `features/onboarding-survey` 와 `features/device-data` 는 서로 import 하지 않는다 (rules/architecture §3).
 */
import { useAuthSession } from '../../shared/auth';
import { DeviceDraftRemoval } from '../../features/device-data';
import { OnboardingIntro } from '../../features/onboarding-survey';

export function OnboardingStartPage() {
  const session = useAuthSession();

  return (
    <OnboardingIntro
      variant="profile"
      isTrial={session === null}
      trialNoticeFooter={(draft) =>
        draft.hasAnswers ? (
          <DeviceDraftRemoval
            hasDraft
            childFirstName={draft.childFirstName}
            onRemove={draft.clear}
          />
        ) : null
      }
    />
  );
}
