/**
 * `features/storytime-session` 사용자 노출 문구 — 영어 1차 (`rules/frontend.md` §8).
 *
 * | 키 | 근거 |
 * |---|---|
 * | `close` | 4b Spec §3.4 · §9.1 제안 `Close session` — `S4B-Q9` 채택 (`D4-58` NB-8) |
 * | `record.*` | Stage 4 Spec §2.6.3 · §9 — 접근성 이름은 **동작**(`Start recording`/`Pause recording`), 시각 라벨은 Figma `140:2854` 원문 |
 * | `actions.discard` · `submit` | Figma `163:1618` · `163:1620` 원문 (`D4-12`) |
 * | `actions.groupLabel` · `actions.readyReason` · `closeFailed` · `states.*` | development-agent 초안 → **`D4-60` 승인** |
 * | `record.resume` | 4b Spec §9.1 `Resume recording` — `S4B-Q9` 채택 (`D4-58` NB-8) |
 * | `record.resumeCaption` · `status.*` · `prompts` | Figma `298:1227` · `298:1321`/`298:1399` · `298:1325`/`298:1401` · `298:1314` 시안 원문 (`D4-51`) |
 * | `noPrompts` | 4b Spec §3.1 n=0 권고 문구 `No prompts for this session` — `S4B-Q4` ⓐ 채택 (`D4-58` NB-2) |
 * | `discardDialog.*` | Stage 4 Design Spec §2.5.3 ③ (`D4-17`·`D4-56` — 닫기도 같은 다이얼로그). ⚠️ Spec 이 "승인 대상" 으로 남긴 문구 |
 * | `complete.title` | Figma `29:75` 원문 |
 * | `states.backHome` | `Back to Home` — 세션 조회 실패 화면 출구 (`D4-96`·`D4-99`, Figma 없음) |
 * | `submitted` | `Recording submitted` — Orchestrator 채택 `T-A` (stage-4-approvals §1 "Toast 문구", 변경 가능) |
 *
 * 캐릭터 버블 인사·Prompt 는 여기에 없다 — **서버(Mock) 응답 값만** 표시한다 (`rules/architecture.md` §8).
 */
export const storytimeSessionCopy = {
  close: 'Close session',
  record: {
    start: 'Start recording',
    pause: 'Pause recording',
    /** paused 변형의 접근성 이름 — 동작을 읽는다 (4b Spec §9.1). */
    resume: 'Resume recording',
    /** Figma `140:2854` — `Record` 변형 시각 라벨. 접근성 이름이 아니다. */
    caption: 'Tap to recording',
    /** Figma `298:1227` — `Paused` 변형 시각 라벨. */
    resumeCaption: 'Tap to resume',
  },
  /** 상태 블록 (`298:1320` / `298:1398`). 시간 상한은 contracts `MAX_RECORDED_SECONDS` 에서 만든다. */
  status: {
    recording: 'Recording',
    paused: 'Paused',
    upTo: (limit: string) => `Up to ${limit}`,
    pausedHint: 'Tap the button to keep recording',
  },
  /** 좌상단 Prompts 칩 (`298:1314`) — 보이는 라벨 = 접근성 이름. */
  prompts: 'Prompts',
  /** Prompt 0개일 때 칩 비활성 사유 — 4b Spec §3.1 n=0 (`S4B-Q4` ⓐ, `D4-58` NB-2). `aria-describedby` 로만 읽힌다. */
  noPrompts: 'No prompts for this session',
  /** `Discard` · recording/paused 닫기가 함께 쓰는 확인 다이얼로그 (`D4-17` · `D4-56`). */
  discardDialog: {
    title: 'Discard this recording?',
    description: "This recording will be removed from this device and won't be saved.",
    confirm: 'Discard',
    cancel: 'Keep recording',
  },
  /** `Submit` 후 Toast (`D4-12`). 완료 화면으로 이동하면서 뜬다. */
  submitted: 'Recording submitted',
  /** 완료 화면 (`29:62`). 버블·스티커 문구는 서버 값이라 여기에 없다. */
  complete: {
    title: 'Session Complete',
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
    backHome: 'Back to Home',
  },
} as const;
