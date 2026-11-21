/**
 * 탈퇴(`scope='account'`) 요청 상태 문구 — Stage 8 Design Spec §2.5 · §10.2 `VG8-C-12` 원문.
 *
 * 두 화면이 같은 문구를 쓴다 — `/settings/data` 상태 알림(`features/data-management`)과 `/settings/account` 진행 중 알림
 * (`features/account-deletion`). feature 간 import 금지(`rules/architecture.md` §3)라 원문을 이 한 곳에 둔다.
 *
 * - 탈퇴 완료는 `/settings/data` 가 처리하지 않으므로 *the status will show here* 를 쓰지 않는다.
 * - `failed` 에는 action 이 없다 — *Try again* 이 전체 삭제 Dialog 를 열면 범위가 바뀐다. 다시 할 곳(*Account*)을 문장으로 안내.
 * - 아이 이름은 first name 만. 모르면 *your child* 로 쓴다.
 */
function possessive(firstName: string | undefined): string {
  return firstName === undefined ? "your child's" : `${firstName}'s`;
}

export const accountDeletionStatusCopy = {
  progress: {
    title: "We're deleting your account",
    description: (firstName: string | undefined) =>
      `Your account and all of ${possessive(firstName)} data are being deleted. This can take a little while.`,
  },
  failed: {
    title: "We couldn't finish deleting your account",
    description: 'Nothing else changed. You can ask again from Account.',
  },
} as const;
