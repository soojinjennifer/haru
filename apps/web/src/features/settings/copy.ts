/**
 * 설정 화면 문구 — Design Spec §2.14 (`C13-12`), 결정 **D-7**.
 *
 * - 사용자 노출 언어는 영어다.
 * - 진단·판정·비교 표현을 쓰지 않는다.
 * - Stage 6 `C13-S6-1` (Spec §2.4 · §10.3, `N6-38`): **2그룹 5행** — `YOUR CHILD`(Profile · Child info ·
 *   Update survey answers · Growth focus) · `ACCOUNT`(Log out). 알림·데이터 관리·탈퇴·동의 이력 행 없음
 *   (알림 = `D-18` 디자이너 대기, 데이터 관리·탈퇴 = Stage 8 — `ACCOUNT` 그룹에 붙는다).
 * - Stage 8 `C13-S8-1` (Spec §2.1 · §10.1, `Q8-02` ⓐ): `ACCOUNT` = *Data & privacy* · *Account* (이동 행) → *Log out* (동작 행).
 *   동의 이력 행 없음 (`N8-06` ⓑ).
 */
export const settingsCopy = {
  /** TopBar 제목 — Design Spec §2.14. */
  title: 'Settings',
  /** Home 헤더의 설정 아이콘 접근성 이름 (Figma `26:44`). */
  entryLabel: 'Settings',
  backLabel: 'Back',
  /**
   * 목록 그룹 — 시각 SectionLabel(대문자, Spec §10.3) + `ListGroup` 접근성 이름(Spec §2.4).
   */
  groups: {
    child: { sectionLabel: 'YOUR CHILD', listLabel: 'Your child' },
    account: { sectionLabel: 'ACCOUNT', listLabel: 'Account' },
  },
  /** 그룹 `YOUR CHILD` 의 행 (Spec §10.3). */
  rows: {
    profile: 'Profile',
    childInfo: 'Child info',
    surveyUpdate: 'Update survey answers',
    growthFocus: 'Growth focus',
  },
  /** 그룹 `ACCOUNT` 의 이동 행 (Stage 8 Spec §10.1, `Q8-02` ⓐ) — Log out 은 `logOut.rowLabel`. */
  accountRows: {
    dataPrivacy: 'Data & privacy',
    account: 'Account',
  },

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
