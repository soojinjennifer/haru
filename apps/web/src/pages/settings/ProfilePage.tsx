/**
 * `/settings/profile` — 프로필 결과 · 재방문 모드 (Stage 6 `C13-09`, Spec §2.2 · `D6-4`).
 *
 * TopBar 는 router 가 `ProfileTopBar` 로 씌운다. Page 는 조립만 한다.
 */
import { ProfileResultView } from '../../features/child-profile-view';

export function ProfilePage() {
  return <ProfileResultView mode="revisit" />;
}
