/**
 * `/onboarding/profile` — 프로필 결과 · 온보딩 모드 (Stage 6 `C13-09`, Spec §2.1).
 *
 * `StackLayout`, TopBar 없음 (뒤로 없음 — `N6-24` ⓐ). Page 는 조립만 한다.
 */
import { ProfileResultView } from '../../features/child-profile-view';

export function OnboardingProfilePage() {
  return <ProfileResultView mode="onboarding" />;
}
