/**
 * `/progress/reports/:reportId` 문구 — Stage 7 Spec §10.3 · §2.9 · §9.1 · §9.2 (`S7-D`, `C13-S7-1` · `C13-S7-7` · `C13-S7-9`).
 *
 * 영어 · 관찰 언어 · 진단/판정/비교/점수 표현 0 (Spec §10.5 금칙어). 리포트 본문 문장(`summaryLine` · `evidence` ·
 * persona · 신호 · 요약 · 인용)은 **서버 값**이라 여기에 없다 — 이 모듈은 제목 · 라벨 · 상태 안내만 소유한다.
 *
 * 이름 슬롯 = `ReportDetail.childDisplayName` (발행 시점 동결 — `N7-16`). 대문자 eyebrow 는 copy 가 만든다.
 * 회고 체크 라벨은 `entities/reflection` 의 같은 모듈을 쓴다 (`N7-43` — 여기에 다시 정의하지 않는다).
 */
import type { CapabilitySnapshotSource } from '@haru/contracts';

function upper(name: string): string {
  return name.toLocaleUpperCase('en-US');
}

export const reportDetailCopy = {
  /** TopBar 제목 (h1) · Back. */
  topBarTitle: '4-week report',
  backLabel: 'Back',

  growth: {
    title: 'Growth themes',
    legendPrevious: 'Earlier',
    legendCurrent: 'This report',
    /**
     * 다이아몬드 대체 텍스트 (Spec §9.2) — **증감·방향 판정 0**. previous ↔ current 를 비교해 말로 바꾸지 않는다
     * (`N7-15` · `N7-39`). 근거 문장은 아래 `dl` 이 시각·SR 모두 제공한다.
     */
    summaryLead: (firstName: string) => `Growth themes for ${firstName} in this report.`,
    summaryPrevious: 'The dashed outline shows the previous report.',
    summaryNotObserved: (list: string) => `Not observed yet: ${list}.`,
  },

  persona: {
    title: (firstName: string) => `${firstName}'s storytime persona`,
    since: (monthDay: string) => `SINCE ${upper(monthDay)}`,
    now: 'NOW',
    unchanged: (firstName: string) => `${firstName}'s persona stayed the same through this report.`,
    /** `trigger` (C7-4b = `CapabilitySnapshotSource`) → 출처 문구 3종 (`N7-42`). */
    source: {
      onboarding_survey: 'From your answers',
      survey_update: 'From your updated answers',
      session_analysis: 'From your storytimes',
    } satisfies Readonly<Record<CapabilitySnapshotSource, string>>,
  },

  dialogue: {
    title: 'How you talked together',
    storytimes: 'Storytimes',
    timeTogether: 'Time together',
    childSaid: (firstName: string) => `Things ${firstName} said`,
    turns: 'Back-and-forth turns',
    feelingWords: 'Feeling words',
    signalsLabel: 'LATELY WE NOTICED',
  },

  quotes: {
    eyebrow: (firstName: string) => `IN ${upper(firstName)}'S WORDS`,
    /** 상세 인용 출처 — `May 5 · The Most Magnificent Thing` · 책 제목 없으면 날짜만 (Spec §3.6). */
    source: (monthDay: string, bookTitle: string | null) =>
      bookTitle === null ? monthDay : `${monthDay} · ${bookTitle}`,
  },

  feedback: {
    title: 'What you noticed',
    checkedLabel: 'WHAT YOU CHECKED',
    /** 시각 메타 `3×` (SR 은 `aria-hidden`) — 횟수 관찰 (Spec §2.3.4). */
    countMeta: (count: number) => `${String(count)}×`,
    /** SR 전용 — *"Calmer at bedtime, 3 times"* (Spec §9.1). 앞 쉼표는 라벨과 이어 읽기 위한 것. */
    countSpoken: (count: number) => `, ${String(count)} ${count === 1 ? 'time' : 'times'}`,
    topicsLabel: 'TOPICS THAT CAME UP',
    /** 서버 문자열 나열 — 쉼표 결합만 화면 포맷이다. */
    topicsJoin: ', ',
    empty: "You didn't leave notes during this report.",
  },

  notReady: {
    title: "This report isn't ready yet.",
    description: "We'll let you know when it is.",
  },
  notFound: {
    title: "We couldn't find this report.",
  },
  backToProgress: 'Back to Progress',
  loading: 'Loading',
} as const;
