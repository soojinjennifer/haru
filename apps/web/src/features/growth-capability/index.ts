/**
 * `features/growth-capability` 공개 진입점 — Stage 6 발전 역량 한 컴포넌트 2모드
 * (`C13-10` 온보딩 · `C13-S6-4` 설정, Spec §2.3, `D6-6`, `S6-E2`).
 * route 조립(`/onboarding/growth-capability` · `/settings/growth-capability` — `S6-D`)은 `pages` 가 한다.
 */
export { GrowthCapabilityPicker } from './ui/GrowthCapabilityPicker';
export type {
  GrowthCapabilityMode,
  GrowthCapabilityPickerProps,
} from './ui/GrowthCapabilityPicker';
export { growthCapabilityCopy } from './copy';
