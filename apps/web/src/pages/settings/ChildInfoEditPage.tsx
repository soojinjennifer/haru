/**
 * `/settings/child` — 아이 정보 수정 (Stage 6 `C13-S6-2`, Spec §2.5).
 *
 * TopBar 는 router 가 `ChildInfoEditTopBar` 로 씌운다. Page 는 조립만 한다 (rules/frontend §3).
 */
import { ChildInfoEditForm } from '../../features/child-profile-edit';

export function ChildInfoEditPage() {
  return <ChildInfoEditForm />;
}
