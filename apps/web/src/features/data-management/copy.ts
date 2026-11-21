/**
 * 데이터 관리 문구 — Stage 8 Design Spec §10.2 (`C13-S8-2` · `C13-S8-5`, `Q8-14` 승인 원문).
 *
 * - 사용자 노출 언어는 영어 · 진단 · 판정 · 비교 표현 0 · **기한 · 수치 리터럴 0** (`N8-04` ⓐ).
 * - 보관 일수는 **응답 값(`retentionPolicy.rawAudioDays`)을 받는 함수**로만 만든다 — `90` 리터럴 0 (AC-8-15).
 * - 아이 이름은 first name 만. 모르면 *your child* 로 쓴다.
 */
import { accountDeletionStatusCopy } from '../../shared/copy/deletion-status-copy';

function pluralDays(days: number): string {
  return days === 1 ? '1 day' : `${String(days)} days`;
}

function possessive(firstName: string | undefined): string {
  return firstName === undefined ? "your child's" : `${firstName}'s`;
}

export const dataManagementCopy = {
  /** TopBar 제목 = h1 (Spec §10.2). */
  title: 'Data & privacy',
  backLabel: 'Back',
  loading: 'Loading',
  recordings: {
    sectionLabel: 'RECORDINGS',
    listLabel: 'Recordings',
    /** 보관 정책 문장 — `N8-03` ⓐ (전사 · 지표 유지). */
    retention: (rawAudioDays: number) =>
      `Storytime recordings are kept for ${pluralDays(rawAudioDays)}, then removed automatically. Conversation notes and growth signals stay so your reports keep working.`,
    rowTitle: 'Session recordings',
    /** `recordingsCount` = 삭제 가능한 녹음 수 (`VG8-A-04`). */
    rowSubtitle: (count: number) =>
      count === 0 ? 'No recordings' : count === 1 ? '1 recording' : `${String(count)} recordings`,
  },
  deleteData: {
    sectionLabel: 'DELETE DATA',
    listLabel: 'Delete data',
    /** 영향 안내 — `N8-02` ⓐ (계정은 유지). */
    notice: (firstName: string | undefined) =>
      `This deletes ${possessive(firstName)} profile, recordings, notes, and reports from HARU. Your account stays, so you can start again.`,
    rowLabel: 'Delete all data',
    /** 요청 오프라인 — 기존 `networkErrorCopy` 제목 + 이 설명 (Spec §10.2 *Nothing was sent.*). 요청 0. */
    notSent: 'Nothing was sent.',
    /** 요청 실패(오프라인 아님) 설명 (Spec §10.2 `VG8-C-05`) — 제목은 기존 `errorCopyForCode`. */
    notDeleted: 'Nothing was deleted. You can try again.',
  },
  /** ConfirmDialog ② (Spec §2.4 · §10.4 — `N8-08` ⓐ 확인 1회 · 계정은 유지 `N8-02` ⓐ). */
  dialog: {
    title: (firstName: string | undefined) => `Delete all of ${possessive(firstName)} data?`,
    description:
      "Profile, recordings, notes, and reports will be deleted. Your account stays. This can't be undone.",
    confirmLabel: 'Delete all data',
    cancelLabel: 'Cancel',
  },
  /** 진행 중 삭제 요청 상태 (Spec §2.5 — `received` · `processing` · `DELETION_ALREADY_REQUESTED`). 진행률 · 수치 0 (`Q8-08` ⓐ). */
  progress: {
    title: "We're deleting your data",
    description:
      'This can take a little while. You can leave this screen — the status will show here.',
  },
  /** 서버 status = `failed` (Spec §2.5) — *Try again* = ConfirmDialog ② 재진입. */
  failed: {
    title: "We couldn't finish deleting your data",
    description: 'Nothing else changed. You can ask again.',
    action: 'Try again',
  },
  /** 탈퇴(`scope='account'`) 진행 중 (Spec §2.5 `VG8-C-12`) — 원문은 `/settings/account` 와 공유(`shared/copy`). action 0. */
  accountProgress: accountDeletionStatusCopy.progress,
  /** 탈퇴(`scope='account'`) 실패 (Spec §2.5 `VG8-C-12`) — action 0 (전체 삭제 Dialog 재진입 = 범위가 바뀐다). */
  accountFailed: accountDeletionStatusCopy.failed,
  /** `completed` → 로컬 정리 → Guard 이동 → 도착 화면 Toast success 1회 (Spec §2.5 · §10.2). */
  completedToast: 'Your data was deleted.',
} as const;
