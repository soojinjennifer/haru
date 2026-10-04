/**
 * `/onboarding/start` — 재구성 Design Spec §2 (Figma `243:1147`).
 *
 * 동의 직후 첫 화면이며 **프로필 입력 소개**다. Page 는 **조립만** 한다: 세션으로 Trial
 * 여부만 판단해 넘긴다. draft 읽기·전이는 feature 가 한다.
 */
import { useAuthSession } from '../../shared/auth';
import { OnboardingIntro } from '../../features/onboarding-survey';

export function OnboardingStartPage() {
  const session = useAuthSession();

  return <OnboardingIntro variant="profile" isTrial={session === null} />;
}
