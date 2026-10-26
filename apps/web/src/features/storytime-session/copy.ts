/**
 * `features/storytime-session` 사용자 노출 문구 — 영어 1차 (`rules/frontend.md` §8).
 *
 * | 키 | 근거 |
 * |---|---|
 * | `close` | 4b Spec §3.4 · §9.1 제안 `Close session` — `S4B-Q9` 채택 (`D4-58` NB-8) |
 * | `record.*` | Stage 4 Spec §2.6.3 · §9 — 접근성 이름은 **동작**(`Start recording`/`Pause recording`), 시각 라벨은 Figma `140:2854` 원문 |
 * | `actions.discard` · `submit` | Figma `163:1618` · `163:1620` 원문 (`D4-12`) |
 * | `actions.groupLabel` · `actions.readyReason` · `closeFailed` · `states.*` | ⚠️ **시안·Spec 에 문구가 없다** — development-agent 초안 (승인 대상, handoff F1-8) |
 *
 * 캐릭터 버블 인사·Prompt 는 여기에 없다 — **서버(Mock) 응답 값만** 표시한다 (`rules/architecture.md` §8).
 */
export const storytimeSessionCopy = {
  close: 'Close session',
  record: {
    start: 'Start recording',
    pause: 'Pause recording',
    /** Figma `140:2854` — `Record` 변형 시각 라벨. 접근성 이름이 아니다. */
    caption: 'Tap to recording',
  },
  actions: {
    groupLabel: 'Session actions',
    discard: 'Discard',
    submit: 'Submit',
    /** ready 에서 두 버튼이 비활성인 이유 — `aria-describedby` 로만 읽힌다 (AC-4-111 ②). */
    readyReason: 'Available after you start recording.',
  },
  /** ready 닫기 요청이 실패했을 때 (AC-4-136 ④) — 화면에 머문다. */
  closeFailed: "We couldn't close this session. Please try again.",
  states: {
    errorTitle: "We couldn't open this session.",
    retry: 'Try again',
  },
} as const;
