/**
 * `/onboarding` — 재구성 Design Spec §2 (Figma `179:1748`).
 *
 * **설문 카드 소개**다 — 프로필 입력(`/onboarding/child-info`)이 끝난 뒤에 온다.
 * Page 는 **조립만** 한다: 세션으로 Trial 여부만 판단해 넘긴다.
 *
 * Trial 안내 아래 기기 draft 삭제 TextLink (Stage 8 `C13-S8-7` · `QA-2R-004`, `Q8-12` ⓓ) 를 여기서 조합한다 —
 * `features/onboarding-survey` 와 `features/device-data` 는 서로 import 하지 않는다 (rules/architecture §3).
 */
import { useAuthSession } from '../../shared/auth';
import { DeviceDraftRemoval } from '../../features/device-data';
import { OnboardingIntro } from '../../features/onboarding-survey';

export function OnboardingIntroPage() {
  const session = useAuthSession();

  return (
    <OnboardingIntro
      variant="survey"
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
