/**
 * `/settings/account` — 계정 (Stage 8 `C13-S8-6`, Spec §2.6). TopBar 는 router 가 `AccountTopBar` 로 씌운다.
 * Page 는 Composition 만 한다 (rules/frontend §3). 보호자 이메일 표시 · 탈퇴 흐름(확인 · 요청 · 로컬 정리 · 세션 종료 · 이동)은
 * `features/account-deletion` 이 소유한다.
 */
import { AccountSettings } from '../../features/account-deletion';

export function AccountPage() {
  return <AccountSettings />;
}
