import { SettingsMenu } from '../../features/settings';

/**
 * `/settings` — Design Spec §2.14 (`C13-12`).
 *
 * Stage 2 의 목록은 **로그아웃 1행**이다. 데이터 관리 · 탈퇴 · 동의 이력 보기는 Stage 8,
 * 알림 설정은 Stage 3, 아이 프로필 수정 · 설문 재응답은 Stage 6 이다 (`C-16`).
 *
 * Page 는 Composition 만 한다 (rules/frontend §3).
 */
export function SettingsPage() {
  return <SettingsMenu />;
}
