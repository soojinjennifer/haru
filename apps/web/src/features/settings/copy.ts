/**
 * 설정 화면 문구 — Design Spec §2.14 (`C13-12`), 결정 **D-7**.
 *
 * - 사용자 노출 언어는 영어다.
 * - 진단·판정·비교 표현을 쓰지 않는다.
 * - Stage 2 의 목록 항목은 **로그아웃 1행**이다. 데이터 관리 · 탈퇴 · 동의 이력은 Stage 8,
 *   알림 설정은 Stage 3, 아이 프로필 수정은 Stage 6 이다 (`C-16`).
 */
export const settingsCopy = {
  /** TopBar 제목 — Design Spec §2.14. */
  title: 'Settings',
  /** Home 헤더의 설정 아이콘 접근성 이름 (Figma `26:44`). */
  entryLabel: 'Settings',
  backLabel: 'Back',
  /** 1행짜리 목록의 접근성 이름. 화면에 보이는 제목이 따로 없다. */
  menuLabel: 'Account',

  logOut: {
    /** 목록 행 라벨. 빨간색으로만 구분하지 않는다 — destructive 신호는 Dialog 가 전달한다. */
    rowLabel: 'Log out',
    /** ConfirmDialog — 결정 D-7. */
    confirmTitle: 'Log out?',
    /** 되돌릴 수 없는 로컬 삭제를 미리 알린다 (D-3 삭제 시점 ②). */
    confirmDescription: 'Onboarding answers saved on this device will be removed.',
    confirmLabel: 'Log out',
    cancelLabel: 'Cancel',
    /** `AuthGateway.signOut()` 이 실패했을 때. 로컬 정리는 이미 끝난 상태다. */
    errorTitle: "We couldn't finish logging out",
    errorDescription: 'Saved answers on this device were removed. You can try again.',
  },
} as const;
