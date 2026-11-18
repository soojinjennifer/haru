/**
 * `/settings/growth-capability` — 발전 역량 · 설정 모드 (Stage 6 `C13-S6-4`, Spec §2.3 · `D6-6` · `S6-D`).
 *
 * 온보딩(`/onboarding/growth-capability`)과 **같은 컴포넌트**를 `mode="settings"` 로 연결만 한다.
 * TopBar("Growth focus" = h1, 뒤로 `navigate(-1)`)는 router 가 `GrowthCapabilityTopBar` 로 씌운다. Page 는 조립만 한다.
 */
import { GrowthCapabilityPicker } from '../../features/growth-capability';

export function GrowthCapabilityPage() {
  return <GrowthCapabilityPicker mode="settings" />;
}
