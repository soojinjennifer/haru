/**
 * 아이 정보 수정 화면 문구 — Stage 6 Spec §10.4 (`C13-S6-2`).
 *
 * - 사용자 노출 언어는 영어. 진단·판정·비교 표현 금지 (Spec §10.5 금칙어).
 * - 필드·섹션 라벨·선택지는 Step 1 copy 재사용(`shared/copy/child-copy`, `N6-27` ⓐ) — 여기 다시 적지 않는다.
 * - 아이 이름은 `firstName` 만 쓴다.
 */
export const childInfoEditCopy = {
  /** TopBar 제목 = h1 (Spec §10.4). */
  title: 'Child info',
  backLabel: 'Back',
  save: 'Save',
  savedToast: 'Saved',
  loading: 'Loading',

  saveFailed: {
    title: "We couldn't save the changes right now",
    description: 'Your edits are still here. Try again.',
  },
  offline: {
    title: "You're offline",
    description: "Your edits are still here. Try again when you're back online.",
  },

  leave: {
    title: 'Discard changes?',
    description: (firstName: string) => `Your edits to ${firstName}'s info won't be saved.`,
    confirm: 'Discard',
    cancel: 'Keep editing',
  },

  /**
   * 서버 `VALIDATION_FAILED`(`details.fields`)의 필드 오류 — Spec §2.5 는 "해당 필드 error 문구" 만 정하고
   * 문구를 정하지 않았다. 생년월은 기존 범위 문구(`childCopy.ageOutOfRange`)를 쓰고, 나머지 필드는 이 문장 1개.
   * **확정 (사용자 결정 `D6-9` ④ `VG6-B-11`, 2026-11-18)** — Spec §10.4 기록은 design-agent 몫.
   */
  fieldInvalid: 'Please check this and try again.',
} as const;
