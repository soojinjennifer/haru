/**
 * 미가입 기기 draft 삭제 문구 — Stage 8 Design Spec §2.7 · §10.5 (`C13-S8-7` · `QA-2R-004`, `Q8-14` 승인 원문).
 *
 * - 서버에 데이터가 없다(C-12)는 사실을 문구로 전달한다 — *Nothing was sent to HARU.*
 * - 아이 이름은 first name 만. draft 에 이름이 없으면 *your child* 로 쓴다.
 */
export const deviceDataCopy = {
  link: 'Remove my answers from this device',
  dialog: {
    title: 'Remove answers from this device?',
    description: (firstName: string | undefined) =>
      `Your answers about ${firstName === undefined || firstName.trim() === '' ? 'your child' : firstName.trim()} will be removed from this device. Nothing was sent to HARU.`,
    confirmLabel: 'Remove',
    cancelLabel: 'Keep',
  },
  /** 삭제 후 `/onboarding` (replace) 위 Toast neutral 1회. */
  removedToast: 'Removed from this device.',
} as const;
