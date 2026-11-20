/**
 * 리포트 PDF 문구 — Stage 7 Spec §2.6 · §9.1 · §10.4 (`S7-F`, `C13-S7-4`).
 *
 * 영어 · 관찰 언어 · 진단/판정/비교/달성률 표현 0 (Spec §10.5 금칙어 — *Error* · *fail* 단어 0, *couldn't* 로 서술).
 * *Download PDF* 는 Figma `110:859` 원문.
 *
 * Spec 에 문장이 없어 이 단위가 정한 문구 (H7-6 판단 — design-agent 확인 요청): `shareTitle` (OS 공유 시트 제목).
 */
export const reportPdfCopy = {
  /** idle 버튼 — Figma `110:859`. */
  download: 'Download PDF',
  /** requesting · generating — 버튼 아래 caption-2 (`role="status"`). */
  preparing: 'Preparing your PDF. This can take up to a minute.',
  /** ready 버튼 2개. */
  save: 'Save PDF',
  share: 'Share',
  /** ready 도달 SR 알림 (보이는 문구 없음 — Spec §9.1). */
  ready: 'Your PDF is ready.',
  /** 공유 거절(`NotAllowedError`) — ready 유지 + caption-2. */
  shareUnavailable: "Sharing isn't available here. Save the PDF instead.",
  failed: { title: "We couldn't prepare the PDF.", description: 'Please try again.' },
  timeout: {
    title: 'Your PDF is taking longer than usual.',
    description: 'Try again in a little while.',
  },
  offline: { title: "You're offline.", description: "Try again when you're back online." },
  retry: 'Try again',
  /** OS 공유 시트 제목 (`navigator.share({ title })`). 아이 이름 · 기간 0. */
  shareTitle: 'HARU 4-week report',
} as const;
