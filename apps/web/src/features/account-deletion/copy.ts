/**
 * 계정 · 탈퇴 문구 — Stage 8 Design Spec §10.4 (`C13-S8-6` · §2.4-③ · §2.6, `Q8-14` 승인 원문).
 *
 * - 영어 · 진단 · 판정 · 비교 0 · 기한 · 수치 0 (`N8-04` ⓐ).
 * - 아이 이름은 first name 만. 모르면 *your child* 로 쓴다 (`data-management` 와 같은 규칙).
 * - 보호자 이메일은 **화면 값**(`Me.caregiver.email`)이며 이 파일에 없다 — Toast · 로그 문구에 넣지 않는다 (Plan §5.5 · AC-8-93).
 */
function possessive(firstName: string | undefined): string {
  return firstName === undefined ? "your child's" : `${firstName}'s`;
}

export const accountDeletionCopy = {
  loading: 'Loading',
  signedIn: {
    sectionLabel: 'SIGNED IN AS',
    listLabel: 'Signed in as',
  },
  deleteAccount: {
    sectionLabel: 'DELETE ACCOUNT',
    listLabel: 'Delete account',
    /** 영향 안내 (§10.4). */
    notice: (firstName: string | undefined) =>
      `Deleting your account also deletes all of ${possessive(firstName)} data and signs you out on this device.`,
    rowLabel: 'Delete account',
    /** 요청 오프라인 — 기존 `networkErrorCopy` 제목 + 이 설명 (Spec §10.2 *Nothing was sent.* 패턴). 요청 0. */
    notSent: 'Nothing was sent.',
    /**
     * 탈퇴 요청 실패(오프라인 아님) 설명 (Spec §10.4 `VG8-D-03`) — 제목은 기존 `errorCopyForCode`.
     * 파괴적 요청 실패는 무엇이 바뀌었는가를 먼저 말한다 (`VG8-C-05` 와 같은 축).
     */
    notDeleted: 'Nothing was deleted. You can try again.',
    /**
     * 진행 중 전체 삭제가 있어 서버가 `DELETION_ALREADY_REQUESTED` 를 준 경우 (Spec §2.6 · `Q8-09` ⓐ) — InlineAlert info.
     * 제목 + 설명 2줄 표면 (Spec §10.4 `VG8-D-04` — 단어 변경 0, 제목은 마침표 없음).
     */
    alreadyRequested: {
      title: 'Your data is already being deleted',
      description: 'You can delete your account after it finishes.',
    },
  },
  /** ConfirmDialog ③ (Spec §2.4 · §10.4 — `N8-08` ⓐ 확인 1회 · `N8-02` ⓐ 계정 + 전체 데이터). */
  dialog: {
    title: 'Delete your account?',
    description: (firstName: string | undefined) =>
      `Your account and all of ${possessive(firstName)} data will be deleted. This can't be undone.`,
    confirmLabel: 'Delete account',
    cancelLabel: 'Cancel',
  },
  /** 탈퇴 후 `/auth/welcome` 위 Toast neutral 1회 (Spec §2.6 · `Q8-11` ⓐ). */
  deletedToast: 'Your account was deleted.',
} as const;
