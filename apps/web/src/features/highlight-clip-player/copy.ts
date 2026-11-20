/**
 * 하이라이트 클립 플레이어 문구 — Stage 7 Spec §2.5 · §9.1 · §10 클립 행 (`S7-E`, `C13-S7-3`).
 *
 * 영어 · 관찰 언어 · 진단/판정/비교/달성률 표현 0 (Spec §10.5 금칙어). 클립 `label` 은 **서버 캡션**이라 여기에 없다.
 *
 * Spec 에 문장이 없어 이 단위가 정한 SR 전용 문구 (H7-5 판단 — design-agent 확인 요청):
 * `playing` · `paused` (live 알림 — Spec §9.1 "재생 시작·정지" 알림) · `progressLabel` · `progressValue` (progressbar 이름 · 값 문장).
 */
export const highlightClipCopy = {
  /** ⑥ 섹션 제목 (h2) — Spec §2.3 ⑥ · §10. */
  title: 'Highlight clips',

  /** 버튼 접근성 이름 — Spec §9.1. */
  play: (label: string) => `Play clip: ${label}`,
  pause: (label: string) => `Pause clip: ${label}`,
  unavailableButton: (label: string) => `Clip unavailable: ${label}`,

  /** 보이는 보조 문구 — Spec §2.5 · §10 (`N7-17` — 만료/삭제 같은 문구, 만료일 0). */
  unavailable: 'This clip is no longer available.',
  error: "We couldn't play this clip. Tap play to try again.",
  offline: "You're offline. Tap play to try again when you're back.",

  /** SR 전용 live 알림 (보이는 문구 없음). */
  playing: 'Playing.',
  paused: 'Paused.',

  /** progressbar 접근성 이름 — 행마다 다르게 라벨을 붙인다. */
  progressLabel: (label: string) => `Clip progress: ${label}`,
  /** progressbar `aria-valuetext` — 시각 텍스트와 같은 정보를 시간으로 읽힌다 (퍼센트 낭독 0). */
  progressValue: (elapsed: string, total: string) => `${elapsed} of ${total}`,
  /** 시각 시간 텍스트 "0:04 / 0:12" — Spec §2.5. */
  timeText: (elapsed: string, total: string) => `${elapsed} / ${total}`,
} as const;
