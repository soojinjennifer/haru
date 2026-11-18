/**
 * 프로필 결과 화면 문구 — Stage 6 Spec §10.1 (`C13-09`, `D6-8`).
 *
 * - 사용자 노출 언어는 영어. 진단·판정·비교 표현 0 (Spec §10.5 금칙어 점검).
 * - 아이 이름은 `child.firstName` 만 (`lastName` 표시 0 — AC-6-56).
 * - 페르소나·강점·growing edge 는 API 응답 값이다 — 여기에 두지 않는다.
 * - 차트 summary · 축 캡션 · 강점 라벨은 `entities/child-profile` copy 가 소유한다 (두 모드 공용 Domain).
 */
export const childProfileViewCopy = {
  onboarding: {
    title: (firstName: string) => `Here's where we're starting with ${firstName}`,
    /** "판정 아님" 안내 (PRD §7.3). */
    notice: (firstName: string) =>
      `This isn't a measure of ${firstName}. It's a starting point from what you noticed, and it will change as you read together.`,
    chartTitle: 'Starting point',
    next: 'Next',
    /** 조회 실패 시 보조 링크 — 온보딩 끝에서 막히지 않게 (`N6-37`). */
    continueToHome: 'Continue to Home',
  },
  revisit: {
    /** TopBar 제목 = h1. 이름을 쓰지 않는다 (Spec §11.2). */
    topBarTitle: 'Profile',
    backLabel: 'Back',
    chartTitle: (firstName: string) => `Where ${firstName} is right now`,
    /**
     * FR-15 업데이트 표시 (UpdateNote, Spec §2.2 · `N6-03` ⓐ · `N6-42`) — `latestSnapshot.source` 로 문구를 고른다
     * (UI copy 선택일 뿐 — 생성·가공 아님). `onboarding_survey` 는 표시 0 이라 문구가 없다.
     * `date` = `formatMonthDay` 결과 (`Nov 14`).
     */
    updateNote: {
      session_analysis: (date: string) => `Updated ${date} from your recent storytimes`,
      survey_update: (date: string) => `Updated ${date} from your latest answers`,
    },
  },
  /** 변형 C(4축 미관찰) 캡션 — 차트 카드 안 차트 아래. */
  chartEmptyCaption: "We'll draw this together as you read.",
  loading: 'Loading',
} as const;
