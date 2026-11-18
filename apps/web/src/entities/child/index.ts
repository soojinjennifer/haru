/**
 * `entities/child` 공개 진입점 — 아이 기본 정보 입력 묶음 (Stage 6 `R-11`, Spec §3.7 `N6-41`).
 * 온보딩 Step 1(`features/onboarding-survey`)과 아이 정보 수정(`features/child-profile-edit`)이 함께 쓴다.
 */
export {
  ChildIdentityFields,
  ChildLanguageFields,
  ChildReadingRoutineField,
} from './ChildInfoFields';
export type { ChildInfoFieldsErrors, ChildInfoFieldsProps } from './ChildInfoFields';
