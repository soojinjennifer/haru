/**
 * `/onboarding` — 재구성 Design Spec §2 (Figma `179:1748`).
 *
 * **설문 카드 소개**다 — 프로필 입력(`/onboarding/child-info`)이 끝난 뒤에 온다.
 * Page 는 **조립만** 한다: 세션으로 Trial 여부만 판단해 넘긴다.
 */
import { useAuthSession } from '../../shared/auth';
import { OnboardingIntro } from '../../features/onboarding-survey';

export function OnboardingIntroPage() {
  const session = useAuthSession();

  return <OnboardingIntro variant="survey" isTrial={session === null} />;
}
