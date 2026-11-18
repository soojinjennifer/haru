/**
 * 설문 재응답 문구 — Stage 6 Spec §10.3 (`C13-S6-3`).
 *
 * - 사용자 노출 언어는 영어. 진단·판정·비교 표현 금지 (Spec §10.5 금칙어).
 * - 카드·카운터·단계 제목·선택지 문구는 온보딩과 **같은 copy**(`entities/survey` 의 `surveyCardCopy`)를 쓴다 —
 *   여기 다시 적지 않는다 (Spec §2.6.2 "온보딩과 동일 컴포넌트·동일 규칙").
 * - 소요 시간 수치는 instrument `estimates` 에서 온다 (Spec §10.3 ⚠️ — 온보딩 copy 키 `minutes` 재사용).
 */
export const surveyUpdateCopy = {
  /** 진입 화면 TopBar 뒤로 — 설정 하위 화면들과 같은 라벨. */
  backLabel: 'Back',
  loading: 'Loading',

  /**
   * 카드 덱 · 진행바 접근성 이름 — **설정 재응답 흐름만** (`D6-9` ④ `VG6-C-09`). 온보딩은 `surveyCardCopy.deck` 의
   * *Onboarding questions* / *Onboarding progress* 그대로. 화면에 보이지 않는다(스크린리더 이름).
   */
  a11y: {
    deckLabel: 'Survey questions',
    progressLabel: 'Survey progress',
  },

  intro: {
    title: 'Update your answers',
    body: 'Your earlier answers are already filled in. Change anything that looks different now.',
    prefilled: 'Your earlier answers are filled in',
    start: 'Start',
    resume: 'Continue where you left off',
  },

  /** 마지막 카드 CTA — 온보딩 마지막 카드와 같은 컴포넌트, 라벨만 다르다 (Spec §2.6.2 · `N6-48`). */
  saveAnswers: 'Save answers',
  savedToast: 'Your answers are saved',

  saveFailed: {
    title: "We couldn't save your answers right now",
    description: 'Your answers are still here. Try again.',
  },
  offline: {
    title: "You're offline",
    description: "Your answers are still here. Try again when you're back online.",
  },
} as const;
