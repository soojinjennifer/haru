/**
 * `/progress` 문구 — Stage 7 Spec §10.1 · §10.2 (`S7-C`). 영어 · 관찰 언어 · 진단/판정/비교/달성률 0.
 *
 * Stage 3 준비 안내(`shared/copy/progress-copy.ts` — `D-2`)를 **대체**했다 (AC-7-03). 제목 *Progress* 는 여기로 옮겼다.
 *
 * `D7-2` 적용:
 * - ① *"+18% vs last week"* 문구 없음 (계약에도 필드 없음)
 * - ② *"6 of 7 nights"* → *"6 nights"* (분모 0)
 * - ③ *strong / growing / emerging* 유지 (Figma 소문자)
 * `N7-06`: *"· we'll email it too."* 제거. `N7-05`: 진행도 숫자(분자/분모·%) 문구 0.
 *
 * 금칙어 점검 (Spec §10.5) — `vs` · `% of` · ` of 7` · `streak` · score · level · average 판정어 0.
 * 예외(승인): *strong* (`D7-2` ③) · *avg* (`D7-2` ② — Figma 문구 유지분, 세션 길이 관찰).
 */
import type { GrowthThemeStage } from '@haru/contracts';

export const progressOverviewCopy = {
  /** TopBar 제목 (기존 탭 이름 — Figma `31:117`). */
  title: 'Progress',

  weekPicker: {
    /** 데이터가 아직 없을 때의 정적 라벨 (Spec §2.9). */
    thisWeek: 'This week',
    /** chip 접근성 이름 (Spec §3.2 · §10.1). */
    changeLabel: (range: string) => `Week: ${range}. Change week`,
    sheetTitle: 'Choose a week',
    legend: 'Week',
    /** 첫 옵션(= 서버 `availableWeeks[0]`)의 meta. */
    thisWeekMeta: 'This week',
  },

  stats: {
    sessions: (count: number) => (count === 1 ? 'session' : 'sessions'),
    together: 'together',
  },

  reading: {
    title: "This week's reading",
    nights: (count: number) => (count === 1 ? '1 night' : `${String(count)} nights`),
    /** `averageSessionMinutes ≠ null` 일 때만 붙는다. */
    average: (minutes: number) => ` · avg ${String(minutes)} min`,
    none: 'No storytimes yet this week.',
    barsLabel: 'Minutes read each day this week',
    barMinutes: (weekday: string, minutes: number) =>
      `${weekday}, ${String(minutes)} ${minutes === 1 ? 'minute' : 'minutes'}`,
    barNone: (weekday: string) => `${weekday}, no storytime`,
    /** 기록 없음 막대의 값 라벨 (Figma `163:2579`). */
    noValue: '—',
  },

  growth: {
    title: 'Growth themes',
    stage: {
      strong: 'strong',
      growing: 'growing',
      emerging: 'emerging',
    } satisfies Readonly<Record<GrowthThemeStage, string>>,
  },

  moment: {
    eyebrow: 'MOMENT OF THE WEEK',
    /** `Tue · The Most Magnificent Thing, p.14` (Figma `163:2636`). */
    source: (weekday: string, bookTitle: string, pageRef: number | null) =>
      `${weekday} · ${bookTitle}${pageRef === null ? '' : `, p.${String(pageRef)}`}`,
  },

  reportCard: {
    title: '4-week full report',
    published: {
      description: (range: string) =>
        `${range} · a deeper read on the four themes, with the moments behind them.`,
      note: 'Covers the last four weeks of sessions.',
    },
    firstCycle: {
      description:
        'Your first 4-week report is on its way. It gathers the moments from your storytimes together.',
      note: 'Recorded storytimes count toward it.',
    },
    generating: {
      description: (range: string) => `${range} · We're putting your report together.`,
      note: 'This can take a little while.',
    },
    deferred: {
      description:
        "There weren't quite enough recorded storytimes for a full report this time, so they'll carry into the next one.",
      note: 'Recorded storytimes count toward it.',
    },
    delayed: {
      description:
        "Your report is taking a little longer than usual. We'll let you know when it's ready.",
    },
    /** Figma `110:861` 에서 *"· we'll email it too."* 제거 (`N7-06` · `AD7-3`). */
    nextReport: (date: string) => `Next report on ${date}`,
  },

  pastReports: {
    sectionLabel: 'PAST REPORTS',
    heading: 'Past reports',
    listLabel: 'Past reports',
    showEarlier: 'Show earlier reports',
    errorTitle: "We couldn't load your past reports.",
  },

  loading: 'Loading',
} as const;
