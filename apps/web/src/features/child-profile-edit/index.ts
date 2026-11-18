/** `features/child-profile-edit` 공개 진입점 — 아이 정보 수정 `/settings/child` (Stage 6 `C13-S6-2`). */
export { childInfoEditCopy } from './copy';
export { ChildInfoEditForm } from './ui/ChildInfoEditForm';
export type { ChildInfoEditFormProps } from './ui/ChildInfoEditForm';
export { useChildInfoEditBack } from './model/backRequest';
export {
  buildUpdateChildBody,
  childInfoFormFromChild,
  serverFieldErrors,
} from './model/childInfoEdit';
