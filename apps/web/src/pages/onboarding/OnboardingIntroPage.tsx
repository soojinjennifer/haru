/**
 * `/onboarding` — Design Spec §2.8 (Figma `179:1748`).
 *
 * Page 는 **조립만** 한다: 세션으로 Trial 여부만 판단해 넘긴다. draft 읽기·전이는 feature 가 한다.
 */
import { useAuthSession } from '../../shared/auth';
import { OnboardingIntro } from '../../features/onboarding-survey';

export function OnboardingIntroPage() {
  const session = useAuthSession();

  return <OnboardingIntro isTrial={session === null} />;
}
