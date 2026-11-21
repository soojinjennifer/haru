/**
 * 세션 녹음 목록 문구 — Stage 8 Design Spec §10.3 (`C13-S8-3` · §2.4-①, `Q8-14` 승인 원문).
 *
 * - 영어 · 진단 · 판정 · 비교 0 · **기한 · 수치 리터럴 0** — 보관 일수는 응답 `rawAudioDays` 를 받는 함수로만 (AC-8-15 · AC-8-19).
 * - 행 상태는 **문구**로 전달한다 (색 · Tag 0 — `Q8-05` ⓐ, WCAG 1.4.1).
 * - `failure.*` = Spec §10.3 `VG8-B-07` 원문 — 제목은 기존 오류 문구(`errorCopyForCode` · `networkErrorCopy`)를 쓰고,
 *   설명만 이 파일이 만든다. `{title}` = 행 제목(책 제목 | *Storytime*) · `{date}` = 행에 보이는 날짜 라벨(`dateLabel`).
 *   같은 책 녹음이 여러 행일 수 있어 제목만으로는 행을 특정할 수 없다 — *Delete* 접근성 이름과 같은 식별자를 쓴다.
 */
function pluralDays(days: number): string {
  return days === 1 ? '1 day' : `${String(days)} days`;
}

export const recordingDeletionCopy = {
  /** TopBar 제목 = h1. */
  title: 'Session recordings',
  backLabel: 'Back',
  loading: 'Loading',
  /** 범위 안내 1문장 — `N8-03` ⓐ. 빈 상태에서는 렌더하지 않는다 (Spec §2.3.3). */
  scope:
    'Deleting a recording removes the audio and its highlight clip. Your conversation notes stay.',
  listLabel: 'Session recordings',
  /** `book = null` 행의 제목. */
  untitled: 'Storytime',
  /** `{Mon D} · {m} min`. */
  subtitle: (date: string, minutes: number) => `${date} · ${String(minutes)} min`,
  /** 행 상태 meta (Spec §2.3.1). */
  status: {
    uploaded: 'Saved',
    pending: 'Uploading',
    failed: 'Not uploaded yet',
    expired: (rawAudioDays: number) => `Removed after ${pluralDays(rawAudioDays)}`,
    deleted: 'Deleted',
  },
  deleteLabel: 'Delete',
  /** 접근성 이름 — 시각 라벨 *Delete* 를 포함한다 (WCAG 2.5.3 label-in-name, Spec §2.3.2). */
  deleteName: (title: string, date: string) => `Delete recording, ${title}, ${date}`,
  empty: {
    title: 'No recordings to manage',
    description: 'Recordings from storytime will show up here.',
  },
  /** 삭제 성공 live 1회 (Spec §9.1). */
  deletedAnnouncement: 'Recording deleted.',
  dialog: {
    title: 'Delete this recording?',
    description:
      "The audio and its highlight clip will be deleted. Your conversation notes stay. This can't be undone.",
    confirmLabel: 'Delete recording',
    cancelLabel: 'Keep',
  },
  showMore: 'Show more',
  failure: {
    /** 실패 InlineAlert 설명 (Spec §10.3 `VG8-B-07`). */
    notDeleted: (title: string, date: string) =>
      `Your recording of ${title} from ${date} wasn't deleted. You can try again.`,
    /** 오프라인 InlineAlert 설명 (Spec §10.3 `VG8-B-07`) — 연결 회복 전이라 재시도 안내는 넣지 않는다. */
    notSent: (title: string, date: string) =>
      `Nothing was sent. Your recording of ${title} from ${date} wasn't deleted.`,
  },
} as const;
