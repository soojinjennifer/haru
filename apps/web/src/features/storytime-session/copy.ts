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
 * | `record.micOff` | 4b Spec §9.1 `Microphone is off` — `S4B-Q9` 채택 (`D4-58` NB-8) |
 * | `record.micOffCaption` | Figma `298:1245` PermissionDenied 변형 시각 라벨 `Mic is off` |
 * | `micSheet.notNow` | 4b Spec §7.3 원문. (`micSheet.talkWithoutRecording` 은 `D4-119` CP-11 로 폐기 — 4b Spec §18.2 ④) |
 * | `record.consentReason` · `micSheet.title` · `micSheet.description` · `actions.conversationReason` · `notices.background.*` · `connectivity.*` · `autoTimeout` | development-agent 초안(`S4-H2`) → **`D4-115` 승인**. `notices.dismiss` = 기존 `Dismiss`(home-overview · onboarding-survey) 재사용 |
 * | `recovered` · `conversationSubmitted` | development-agent 초안(`S4-H2F`) → **`D4-122` 승인**. `recovered` = 크래시 복구 Toast (`D4-117`, AC-4-65) · `conversationSubmitted` = 대화 전용 `Submit` Toast (`D4-118`) |
 * | `micSheet.conversationDescription` | development-agent 초안(`S4-H2R`) → **`D4-126` 승인**. 대화 전용 세션의 시트 문단 (`N4B-28` · 4b Spec §18.2 ③) |
 * | `uploads.stalled` · `uploads.retentionNotice` · `uploads.retentionExpired` | development-agent 초안(`S4-H3`) → **`D4-129` 승인**. 48h Toast · Home 7일 배너 · 14일 Toast (4b Spec §18.3 · §18.4, `D4-119` CP-13). `Try again` = `states.retry` · 닫기 = `notices.dismiss` · 오프라인 = `connectivity.offline` 재사용 |
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
    /** `permission-denied` 변형의 접근성 이름 (4b Spec §9.1) — 탭하면 안내 시트가 열린다. */
    micOff: 'Microphone is off',
    /** Figma `298:1245` — `PermissionDenied` 변형 시각 라벨. */
    micOffCaption: 'Mic is off',
    /** 승인 `D4-115` — 동의가 없어 `disabled` 일 때 `aria-describedby` 사유 (4b Spec §9.1 "사유 — 예: 동의 필요"). */
    consentReason: 'Recording needs your consent first.',
  },
  /**
   * 마이크 거부 안내 시트 (4b Spec §7.3 · §18.2, C13-4B-4 · `AD-S4-16`). Web 은 설정 딥링크가 없어 안내 문단만 둔다.
   * `title` · `description` = 승인 `D4-115` — `description` 은 **녹음 세션**(ready·paused 에서 거부)용이다.
   * `conversationDescription` = **대화 전용 세션**용 (권한 거부 · 장치 없음 공통 — `D4-120` Q16).
   * 버튼은 `notNow` 1개 (`D4-119` CP-11 — `Talk without recording` 폐기).
   */
  micSheet: {
    title: 'Your microphone is off',
    description:
      'To record, allow microphone access for this site in your browser settings, then come back to this screen.',
    /** 승인 `D4-126` — 4b Spec §18.2 ③ 조건 ①~⑤. */
    conversationDescription:
      'This session continues without recording. To record, turn on the microphone and start a new session.',
    notNow: 'Not now',
  },
  /** 공지 슬롯 (4b Spec §7.2, `AD-S4-14`). 승인 `D4-115` — `D4-26` "화면을 켜 두어야 녹음이 보장된다" 수준의 조건 없는 안내. */
  notices: {
    background: {
      title: 'Keep HARU on screen while you record',
      description: 'On the web, recording may stop if you switch apps or lock your screen.',
      /** 공지 슬롯이 들어가지 않는 짧은 세로에서 대신 뜨는 Toast (§7.2). */
      toast: 'Keep HARU on screen while you record. Recording may stop if you switch apps.',
    },
    dismiss: 'Dismiss',
  },
  /** 세션 화면 오프라인 Toast (4b Spec §7.1 — 끊김 1회 + 복구 1회). 승인 `D4-115`. */
  connectivity: {
    offline: "You're offline. Your recording stays on this device.",
    online: "You're back online.",
  },
  /** 30분 자동 종료 Toast (상위 Spec §7.3 `Toast tone="neutral"`, AC-4-64). 승인 `D4-115`. */
  autoTimeout: (limit: string) => `We saved your session at ${limit}.`,
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
  /** 승인 `D4-122` — 대화 전용 세션 `Submit` 후 Toast (`D4-118`). 녹음이 없으므로 `Recording submitted` 를 쓰지 않는다. */
  conversationSubmitted: 'Session submitted',
  /** 승인 `D4-122` — 앱 시작 시 끝나지 못한 녹음을 복구했을 때 Toast 1회 (`D4-117`, AC-4-65). 건수와 무관한 한 문장. */
  recovered: 'We saved what was recorded before HARU closed.',
  /**
   * 업로드 · 보관 안내 (`S4-H3`, 4b Spec §18.3). 문구 원칙: `failed` · `error` 0, 로컬 보존 사실을 알린다(상위 §7.2).
   * 건수와 무관한 한 문장 (`D4-117` 과 같은 방식 — 여러 녹음이 해당해도 안내 1개).
   */
  uploads: {
    /** 승인 `D4-129` — 48h 미확정 Toast (`Toast neutral` + `Try again`). 큐는 계속 재시도 중이다. */
    stalled: "Your recording hasn't uploaded yet. It's still saved on this device.",
    /**
     * 승인 `D4-129` — Home 7일 배너 제목 (한 문장 + 닫기, `Try again` 없음 — `D4-120` Q10). `date` = 절대 날짜
     * (`shared/lib/date-format` — `Nov 17`, Q12). 사용자가 할 일 = 온라인에서 HARU 를 여는 것 (§18.5 ②).
     */
    retentionNotice: (date: string) =>
      `Go online before ${date} or your recording will be removed.`,
    /** 승인 `D4-129` — 14일 삭제 통지 Toast (action 없음). 이미 일어난 사건이다. */
    retentionExpired: "A recording that couldn't upload in 14 days was removed from this device.",
  },
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
    /** 승인 `D4-115` — 대화 전용 ready 에서 `Discard` 만 비활성인 이유 (`D4-58` CP-6). */
    conversationReason: 'There is no recording to discard in this session.',
  },
  /** ready 닫기 요청이 실패했을 때 (AC-4-136 ④) — 화면에 머문다. */
  closeFailed: "We couldn't close this session. Please try again.",
  states: {
    errorTitle: "We couldn't open this session.",
    retry: 'Try again',
    backHome: 'Back to Home',
  },
} as const;
