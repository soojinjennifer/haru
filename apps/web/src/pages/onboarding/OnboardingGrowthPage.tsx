/**
 * `/onboarding/growth-capability` — 발전 역량 제시 · 온보딩 모드 (Stage 6 `C13-10`, Spec §2.3).
 *
 * TopBar(뒤로만 → 프로필)는 router 가 `OnboardingGrowthTopBar` 로 씌운다. Page 는 조립만 한다.
 */
import { GrowthCapabilityPicker } from '../../features/growth-capability';

export function OnboardingGrowthPage() {
  return <GrowthCapabilityPicker mode="onboarding" />;
}
