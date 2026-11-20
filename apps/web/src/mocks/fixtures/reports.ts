/**
 * 4주 리포트 fixture — Stage 7 Plan §8 그룹 `reports` · `report-pdf` · `highlight-clips` · Spec §13 · §14 (`S7-A`).
 *
 * ⭐ Figma `110:835` 와 같은 값: 발행 리포트 **`Apr 13 – May 10`** · 다음 리포트 **`Jun 7`** (footer).
 *
 * | 리포트 | 주기 | 기간 | 쓰임 |
 * |---|---|---|---|
 * | `MOCK_REPORT_IDS.latest` | 2 | Apr 13 – May 10 | 카드(`latestReport`) · 상세 `success` — 페르소나 3개(trigger 3값 각 1회 · 220자 1개) · 인용 2 · 클립 2 |
 * | `MOCK_REPORT_IDS.earlier` | 1 | Mar 16 – Apr 12 | 과거 목록 · **긴 `summaryLine`** · 발행 시점 **40자 이름**(동결 `N7-16`) · `previous = null` |
 * | `MOCK_REPORT_IDS.pending` | (현재 주기) | — | 아직 발행 전 — 상세 = `REPORT_NOT_READY` / `REPORT_NOT_ELIGIBLE`. 발행 전이 후 이 id 로 발행된다 |
 *
 * - 문장은 전부 **서버(Mock) 응답 값**이다. 영어 · 진단·판정·비교·달성률 표현 0 · 페르소나 긍정형 · 아이 이름 `Emma`.
 * - 역량 점수는 차트 형상 전용 — 숫자로 표시되지 않는다 (`N7-15`).
 * - 클립: Stage 5 `MOCK_HIGHLIGHT_CLIP_IDS` 재사용 + `label` · `sessionDate` (C7-5). 만료 시각은 `null`(`OAQ-13` 결정 전) —
 *   `highlight-clips:clip-expired` 에서만 두 번째 클립이 **과거 시각**(`MOCK_EXPIRED_AT`)으로 바뀐다.
 * - 실제 아동 데이터 0.
 */
import {
  ReportDetailSchema,
  reportCyclePeriod,
  type Capability,
  type CapabilityScores,
  type ReportDetail,
  type ReportPersonaHistoryEntry,
  type ReportSummary,
} from '@haru/contracts';

import {
  MOCK_CHANGED_PERSONA_COPY,
  MOCK_LONG_CHILD_FIRST_NAME,
  MOCK_PROFILE_ROW_IDS,
} from './child-profile';
import { MOCK_HIGHLIGHT_CLIP_IDS } from './highlight-clips';
import { MOCK_CHILD_FIRST_NAME } from './me';
import { MOCK_PERSONA_COPY } from './profile-result';
import { MOCK_HISTORY_SESSION_IDS } from './sessions';

export const MOCK_REPORT_IDS = {
  latest: 'e7e7e7e7-0000-4000-8000-000000000002',
  earlier: 'e7e7e7e7-0000-4000-8000-000000000001',
  /** 현재 주기의 (아직 발행 전) 리포트 — deep link `report_published` 가 가리킬 id. */
  pending: 'e7e7e7e7-0000-4000-8000-000000000003',
} as const;

/** 주기 1 시작일 = 첫 완료 세션 날짜 (`N7-12`) — 서버 값. */
export const MOCK_FIRST_CYCLE_START = '2026-03-16';

/** 만료가 지난 시각 — Mock 서버 시계(`MOCK_EPOCH_MS` 2026-01-01) **와** 실제 기기 시계 모두에서 과거. */
export const MOCK_EXPIRED_AT = '2025-12-31T00:00:00.000Z';

/**
 * Mock signed URL 의 만료 시각 — **먼 미래 고정값**.
 * Mock 서버 시계는 2026-01-01 에 고정이고 기기 시계는 실제 시각이라, "서버 시각 + 1시간" 은 기기에서 이미 지난 값이 된다
 * (기기가 만료로 판단해 재발급을 반복). 그래서 유효 URL 은 어느 시계로 봐도 미래인 값을 쓴다. 실제 만료 길이는 `P7-BIP-09`·`10`.
 */
export const MOCK_SIGNED_URL_EXPIRES_AT = '2099-12-31T23:59:59.000Z';

/** `REPORT_NOT_READY` (`report-delayed`) 의 `details.retryAfter` — 익일 재생성 예정 (`P7-BIP-06`). */
export const MOCK_REPORT_RETRY_AFTER = '2026-06-09T16:00:00.000Z';

/** Figma `110:835` 발행 리포트 요약 문장 — 서버 문장. */
export const MOCK_LATEST_SUMMARY_LINE =
  'Four weeks of storytimes full of building, guessing and trying again.';

/** 긴 `summaryLine` 1개 (Spec §14 — 과거 목록 2줄 clamp · 상세 말줄임 0 확인용). */
export const MOCK_LONG_SUMMARY_LINE =
  'Your storytimes this cycle were full of building, guessing and starting again, with lots of back-and-forth about how characters felt and what they might try next, and favorite pages came back again and again to talk about once more.';

/** 세 번째 페르소나 — description **220자** (Spec §2.3.2 상한 · §14). */
export const MOCK_REPORT_PERSONA_COPY = {
  name: 'The Curious Page-Turner',
  description:
    'Lately they settle into a story, notice how a character is feeling, and wonder out loud what might happen next. When a plan wobbles they try a fresh idea and keep going with you, one page at a time, until the final page.',
} as const;

export const MOCK_REPORT_PERSONA_ID = 'c6c6c6c6-1111-4111-8111-000000000003';

/** PDF 파일명 — 서버 생성 값. 아이 이름을 넣지 않는다 (로그 안전 — Plan §5.6). */
export function mockReportPdfFileName(summary: ReportSummary): string {
  return `haru-4-week-report-${summary.periodStart}-to-${summary.periodEnd}.pdf`;
}

function scores(values: Readonly<Record<Capability, number | null>>): CapabilityScores {
  return (Object.keys(values) as Capability[]).map((capability) => {
    const score = values[capability];
    return {
      capability,
      score,
      itemCount: score === null ? 0 : 3,
      missingCount: score === null ? 3 : 0,
    };
  });
}

/** 주기 1 리포트 시점 점수 (= 온보딩 기본값과 같은 모양 — ER 3.5 · SD 4.3 · CF 2.5 · IM 3.7). */
const EARLIER_SCORES = scores({
  emotion_regulation: 3.5,
  self_directed_agency: 4.3,
  cognitive_flexibility: 2.5,
  intrinsic_motivation: 3.7,
});

/** 주기 2 리포트 시점 점수 — 4축 모두 이전과 다르다 (오버레이가 눈에 보이게). */
const LATEST_SCORES = scores({
  emotion_regulation: 3.8,
  self_directed_agency: 4.4,
  cognitive_flexibility: 3.1,
  intrinsic_motivation: 4,
});

export function mockReportSummary(
  kind: 'latest' | 'earlier',
  overrides: Partial<ReportSummary> = {},
): ReportSummary {
  const cycleNo = kind === 'latest' ? 2 : 1;
  const { periodStart, periodEnd } = reportCyclePeriod(MOCK_FIRST_CYCLE_START, cycleNo);
  return {
    id: MOCK_REPORT_IDS[kind],
    cycleNo,
    periodStart,
    periodEnd,
    publishedAt: kind === 'latest' ? '2026-05-11T16:00:00.000Z' : '2026-04-13T16:00:00.000Z',
    summaryLine: kind === 'latest' ? MOCK_LATEST_SUMMARY_LINE : MOCK_LONG_SUMMARY_LINE,
    viewed: true,
    ...overrides,
  };
}

const PERSONA_ONBOARDING: ReportPersonaHistoryEntry = {
  personaId: MOCK_PROFILE_ROW_IDS.persona,
  name: MOCK_PERSONA_COPY.name,
  description: MOCK_PERSONA_COPY.description,
  effectiveFrom: '2026-03-16T02:00:00.000Z',
  trigger: 'onboarding_survey',
};

const PERSONA_SESSION: ReportPersonaHistoryEntry = {
  personaId: MOCK_PROFILE_ROW_IDS.changedPersona,
  name: MOCK_CHANGED_PERSONA_COPY.name,
  description: MOCK_CHANGED_PERSONA_COPY.description,
  effectiveFrom: '2026-04-20T02:00:00.000Z',
  trigger: 'session_analysis',
};

const PERSONA_SURVEY_UPDATE: ReportPersonaHistoryEntry = {
  personaId: MOCK_REPORT_PERSONA_ID,
  name: MOCK_REPORT_PERSONA_COPY.name,
  description: MOCK_REPORT_PERSONA_COPY.description,
  effectiveFrom: '2026-05-02T02:00:00.000Z',
  trigger: 'survey_update',
};

/** `success` 페르소나 히스토리 — 오래된 것 먼저, trigger 3값 각 1회 (C7-4b · AC-7-40). */
export const MOCK_PERSONA_HISTORY: readonly ReportPersonaHistoryEntry[] = [
  PERSONA_ONBOARDING,
  PERSONA_SESSION,
  PERSONA_SURVEY_UPDATE,
];

export type ReportDetailVariant = 'standard' | 'persona-unchanged' | 'first-report';

/** 주기 2 리포트(Figma `110:835` 의 발행 리포트) 상세. */
export function createLatestReportDetail(
  summary: ReportSummary,
  variant: ReportDetailVariant = 'standard',
): ReportDetail {
  return ReportDetailSchema.parse({
    summary,
    childDisplayName: MOCK_CHILD_FIRST_NAME,
    capabilityChange: {
      previous: variant === 'first-report' ? null : EARLIER_SCORES,
      current: LATEST_SCORES,
      items: [
        {
          capability: 'self_directed_agency',
          evidence: 'Often turned the page on her own and chose what to read next.',
        },
        {
          capability: 'emotion_regulation',
          evidence: 'Named how characters felt and connected it to her own day.',
        },
        {
          capability: 'cognitive_flexibility',
          evidence: 'Tried a new idea when a plan in the story did not work out.',
        },
        // 근거 문장이 없는 역량 — 화면은 이 행을 그리지 않는다 (AC-7-39)
        { capability: 'intrinsic_motivation', evidence: null },
      ],
    },
    personaHistory: variant === 'persona-unchanged' ? [PERSONA_ONBOARDING] : MOCK_PERSONA_HISTORY,
    dialogueMetrics: {
      sessionCount: 9,
      totalMinutes: 118,
      childUtteranceCount: 146,
      turnTakingCount: 64,
      emotionWordCount: 19,
      recentSignals: [
        'Asked what a character might do next.',
        'Used feeling words like frustrated and proud.',
      ],
    },
    notableQuotes: [
      {
        text: 'Maybe she just needs to rest, like me when I’m frustrated.',
        sessionDate: '2026-05-05',
        bookTitle: 'The Most Magnificent Thing',
      },
      {
        text: 'I would build a bridge so the bear can visit.',
        sessionDate: '2026-04-22',
        bookTitle: null,
      },
    ],
    parentFeedbackSummary: {
      summaryText: 'You often noticed Emma joining in and talking about big feelings.',
      checkTrends: [
        { key: 'engaged', count: 5 },
        { key: 'big_feelings', count: 3 },
        { key: 'asked_questions', count: 2 },
      ],
      frequentTopics: ['feelings', 'building things', 'bedtime'],
    },
    highlightClips: [
      {
        id: MOCK_HIGHLIGHT_CLIP_IDS[0],
        sessionId: MOCK_HISTORY_SESSION_IDS[0],
        durationSeconds: 12,
        expiresAt: null,
        label: 'Talking about feelings',
        sessionDate: '2026-05-05',
      },
      {
        id: MOCK_HIGHLIGHT_CLIP_IDS[1],
        sessionId: MOCK_HISTORY_SESSION_IDS[1],
        durationSeconds: 15,
        expiresAt: null,
        label: 'Guessing what happens next',
        sessionDate: '2026-04-22',
      },
    ],
  });
}

/** 주기 1 리포트 상세 — 첫 리포트(`previous = null`) · 발행 시점 이름 40자(동결) · 클립 0 · 피드백 비어 있음. */
export function createEarlierReportDetail(summary: ReportSummary): ReportDetail {
  return ReportDetailSchema.parse({
    summary,
    childDisplayName: MOCK_LONG_CHILD_FIRST_NAME,
    capabilityChange: {
      previous: null,
      current: EARLIER_SCORES,
      items: [
        { capability: 'self_directed_agency', evidence: 'Picked the book for most storytimes.' },
        { capability: 'emotion_regulation', evidence: null },
        { capability: 'cognitive_flexibility', evidence: null },
        {
          capability: 'intrinsic_motivation',
          evidence: 'Asked to keep reading after the last page.',
        },
      ],
    },
    personaHistory: [PERSONA_ONBOARDING],
    dialogueMetrics: {
      sessionCount: 4,
      totalMinutes: 47,
      childUtteranceCount: 58,
      turnTakingCount: 21,
      emotionWordCount: 0,
      recentSignals: [],
    },
    notableQuotes: [
      {
        text: 'Read it again, the part with the dragon!',
        sessionDate: '2026-03-28',
        bookTitle: null,
      },
    ],
    // 세 블록 모두 비었다 — Spec §2.3.4 빈 문구 확인용
    parentFeedbackSummary: { summaryText: null, checkTrends: [], frequentTopics: [] },
    highlightClips: [],
  });
}
