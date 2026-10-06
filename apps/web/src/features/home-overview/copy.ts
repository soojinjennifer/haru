/**
 * Home 화면 문구 — Stage 3 Design Spec §2.2 · §5.7 · §5.9.
 *
 * 규칙 (`rules/frontend.md` §8 · Design Spec §10)
 *  - 사용자 노출 언어는 영어.
 *  - **진단·판정·비교 표현 금지.** `streak` · `goal` · `on track` · `behind` · `missed` ·
 *    `{n}/7` · `%` 를 쓰지 않는다.
 *  - 캐릭터 버블·추천 이유·코칭 문장·Prompt 는 **서버 응답 값만** 표시하므로 여기에 없다.
 *    이 모듈에는 **화면이 소유하는 문구**(라벨·안내)만 둔다.
 */
export const homeOverviewCopy = {
  /** 워드마크 (Figma `26:39`) — 앱 이름 그대로다. */
  wordmark: 'HARU',

  /**
   * 캐릭터 버블의 **보조 한 줄** (Figma `I261:1293;50:173` 슬롯).
   *
   * Figma 문구 `Tap me to say hi` 는 **채택하지 않았다** — Stage 3 에 캐릭터 탭 동작이 없어
   * 거짓 어포던스가 된다 (`A-7`, approvals §12.8). 주 문구는 서버 값(`characterLine`)이지만
   * 이 줄은 **화면이 소유하는 고정 안내**이므로 copy 모듈에 둔다 — 문구가 바뀌어도 화면 코드를
   * 건드리지 않는다.
   */
  bubbleHint: 'Please select the book and start session',

  /**
   * 버블 닫기 버튼의 접근성 이름.
   *
   * **신규 문구가 아니다** — `onboarding-survey` 의 안내 닫기(`notices.dismiss`)와 **같은
   * 문자열**이다. feature 간 copy import 은 금지(`AC-3-03`)라 값을 여기에 다시 선언한다.
   * (더 구체적인 이름(`Dismiss message` 등)은 **새 문구**라 임의로 만들지 않았다 — 보고 항목.)
   */
  bubbleDismiss: 'Dismiss',

  /** `WeekSummaryChip` (§5.7) — 이번 주 세션 수 1개만. 목표·연속·비율 표현을 쓰지 않는다. */
  weekSummary: {
    label: (count: number): string => (count === 0 ? 'None yet this week' : `${count} this week`),
    accessibleLabel: (count: number): string =>
      count === 1 ? '1 storytime this week' : `${count} storytimes this week`,
  },

  /*
   * 진행 중 세션 안내 문구는 **여기에 없다** — `V-15`(approvals §12.14)로 `ActiveSessionNotice`
   * 를 제거했고, 그 상태는 **서버가 만든 `characterLine`** 이 말한다. 화면이 조건부로 문구를
   * 만들지 않는다 (`rules/frontend.md` §8).
   */
} as const;
