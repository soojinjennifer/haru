/**
 * `entities/child-profile` 공개 진입점 — Stage 6 아이 프로필 · 아이 정보 수정 · 발전 역량 · 설문 재응답
 * (Plan §5.1 · §5.2). 화면 컴포넌트(`PersonaCard` · 역량 순서·라벨 매핑)는 `S6-E1` 에서 추가했다.
 */
export { childProfileKeys, surveyUpdateKeys } from './childProfileKeys';
export type { ChildProfileQueryKey, SurveyUpdateStateQueryKey } from './childProfileKeys';
export { useChildProfile } from './useChildProfile';
export type { UseChildProfileResult } from './useChildProfile';
export { useCurrentChildProfile } from './useCurrentChildProfile';
export type { CurrentChildProfileState, UseCurrentChildProfile } from './useCurrentChildProfile';
export { useUpdateChild } from './useUpdateChild';
export type { UpdateChildMutation } from './useUpdateChild';
export { useSetGrowthCapability } from './useSetGrowthCapability';
export type { SetGrowthCapabilityMutation } from './useSetGrowthCapability';
export { useSurveyUpdateState } from './useSurveyUpdateState';
export type { UseSurveyUpdateStateResult } from './useSurveyUpdateState';
export { useSaveSurveyUpdateStep, useSurveyUpdatePageHideSave } from './useSaveSurveyUpdateStep';
export type { SaveSurveyUpdateStepMutation } from './useSaveSurveyUpdateStep';
export { useSubmitSurveyUpdate } from './useSubmitSurveyUpdate';
export type { SubmitSurveyUpdateMutation } from './useSubmitSurveyUpdate';

/* ===== Stage 6 `S6-E1` — 프로필 표시 Domain (Spec §3.3~§3.5 · §3.7 · §9.2) ===== */
export { childProfileCopy, joinCapabilityList } from './copy';
export {
  buildCapabilitySummary,
  CAPABILITY_AXIS_ORDER,
  CAPABILITY_SCORE_MAX,
  toCapabilityAxes,
} from './capabilityAxes';
export type {
  CapabilityDiamondAxes,
  CapabilitySummaryContext,
  CapabilitySummaryInput,
} from './capabilityAxes';
export { CapabilityDiamond } from './CapabilityDiamond';
export type { CapabilityDiamondProps } from './CapabilityDiamond';
export { CapabilityTagList } from './CapabilityTagList';
export type { CapabilityTagListProps } from './CapabilityTagList';
export { PersonaCard } from './PersonaCard';
export type { PersonaCardProps } from './PersonaCard';
export { ProfileCard } from './ProfileCard';
export type { ProfileCardProps } from './ProfileCard';
