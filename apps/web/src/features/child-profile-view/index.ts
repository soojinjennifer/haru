/**
 * `features/child-profile-view` 공개 진입점 — Stage 6 프로필 결과 2모드 (`C13-09`, Spec §2.1 · §2.2, `S6-E1`).
 * route `/onboarding/profile` · `/settings/profile` 의 조립은 `pages` 가 한다.
 */
export { ProfileResultView } from './ui/ProfileResultView';
export type { ProfileResultMode, ProfileResultViewProps } from './ui/ProfileResultView';
export { childProfileViewCopy } from './copy';
export { useProfileResult } from './model/useProfileResult';
export type { ProfileResultState, UseProfileResult } from './model/useProfileResult';
