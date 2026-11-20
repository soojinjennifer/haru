import { describe, expect, it } from 'vitest';

import {
  CAPABILITY_SNAPSHOT_SOURCES,
  CapabilityScoresSchema,
  ERROR_CODES,
  GROWTH_THEME_STAGES,
  GrowthThemeStageSchema,
  HighlightClipSummarySchema,
  REPORT_CYCLE_DAYS,
  REPORT_PDF_POLL_INTERVAL_MS,
  REPORT_PDF_POLL_TIMEOUT_MS,
  RecordingDeletedDetailsSchema,
  ReportDetailSchema,
  ReportHighlightClipSchema,
  ReportNotReadyDetailsSchema,
  ReportOverviewSchema,
  ReportPdfStatusSchema,
  ReportSummaryPageSchema,
  ReportSummarySchema,
  WeeklyProgressQuerySchema,
  WeeklyProgressSchema,
  calendarDaysBetween,
  isReportEligible,
  reportCycleIndex,
  reportCyclePeriod,
  shiftCalendarDate,
} from '../index.js';

/**
 * Stage 7 `S7-A` — 4-Week Report · Weekly Progress · PDF · Highlight Clip contracts
 * (Plan rev 2 §7 C7-1~C7-12 · C7-2a · C7-4b, AC-7-04~13).
 */

const ID = (n: number) => `a7a7a7a7-0000-4000-8000-${String(n).padStart(12, '0')}`;

const days = [8, 13, null, 16, 11, 20, 4].map((minutes, index) => ({
  date: `2026-05-${String(4 + index).padStart(2, '0')}`,
  minutes,
}));

const growthThemes = [
  { capability: 'self_directed_agency', stage: 'strong', level: 0.78 },
  { capability: 'emotion_regulation', stage: 'growing', level: 0.54 },
  { capability: 'cognitive_flexibility', stage: 'emerging', level: 0.32 },
  { capability: 'intrinsic_motivation', stage: 'emerging', level: 0.3 },
];

function weekly(overrides: Record<string, unknown> = {}) {
  return {
    week: { start: '2026-05-04', end: '2026-05-10' },
    availableWeeks: ['2026-05-04', '2026-04-27'],
    sessionsCount: 5,
    minutesTogether: 62,
    readingSummary: { totalMinutes: 72, nightsWithSession: 6, averageSessionMinutes: 12 },
    days,
    growthThemes,
    momentOfWeek: {
      quote: 'A quote.',
      speakerName: 'Emma',
      sessionDate: '2026-05-05',
      bookTitle: 'A Book',
      pageRef: 14,
    },
    ...overrides,
  };
}

const summary = {
  id: ID(1),
  cycleNo: 2,
  periodStart: '2026-04-13',
  periodEnd: '2026-05-10',
  publishedAt: '2026-05-11T09:00:00.000Z',
  summaryLine: 'A summary line.',
  viewed: false,
};

const scores = [
  { capability: 'emotion_regulation', score: 3.5, itemCount: 2, missingCount: 0 },
  { capability: 'self_directed_agency', score: 4.3, itemCount: 3, missingCount: 0 },
  { capability: 'cognitive_flexibility', score: null, itemCount: 0, missingCount: 2 },
  { capability: 'intrinsic_motivation', score: 3.7, itemCount: 3, missingCount: 0 },
];

const persona = (trigger: string) => ({
  personaId: ID(10),
  name: 'The Quiet Noticer',
  description: 'Takes their time with a page.',
  effectiveFrom: '2026-03-16T00:00:00.000Z',
  trigger,
});

function detail(overrides: Record<string, unknown> = {}) {
  return {
    summary,
    childDisplayName: 'Emma',
    capabilityChange: {
      previous: scores,
      current: scores,
      items: scores.map(({ capability }) => ({ capability, evidence: 'Evidence.' })),
    },
    personaHistory: [persona('onboarding_survey')],
    dialogueMetrics: {
      sessionCount: 9,
      totalMinutes: 118,
      childUtteranceCount: 140,
      turnTakingCount: 62,
      emotionWordCount: 18,
      recentSignals: ['A signal.'],
    },
    notableQuotes: [{ text: 'A quote.', sessionDate: '2026-04-21', bookTitle: null }],
    parentFeedbackSummary: {
      summaryText: null,
      checkTrends: [{ key: 'engaged', count: 3 }],
      frequentTopics: ['bedtime'],
    },
    highlightClips: [],
    ...overrides,
  };
}

const cycle = {
  cycleNo: 3,
  periodStart: '2026-05-11',
  periodEnd: '2026-06-07',
  status: 'in_progress',
  eligibility: 'cycle_in_progress',
  progressRatio: 0.4,
  nextReportDate: '2026-06-07',
  progress: {
    recordedSeconds: 1440,
    requiredSeconds: 3600,
    recordedSessions: 2,
    requiredSessions: 3,
  },
};

describe('C7-1 WeeklyProgress (AC-7-04)', () => {
  it('Figma `31:102` 수치 fixture 가 parse 된다', () => {
    expect(WeeklyProgressSchema.safeParse(weekly()).success).toBe(true);
  });

  it('momentOfWeek · averageSessionMinutes · days[].minutes · pageRef 는 null 허용', () => {
    const empty = weekly({
      momentOfWeek: null,
      readingSummary: { totalMinutes: 0, nightsWithSession: 0, averageSessionMinutes: null },
      days: days.map((day) => ({ ...day, minutes: null })),
    });
    expect(WeeklyProgressSchema.safeParse(empty).success).toBe(true);
    const noPage = weekly({ momentOfWeek: { ...weekly().momentOfWeek, pageRef: null } });
    expect(WeeklyProgressSchema.safeParse(noPage).success).toBe(true);
  });

  it.each([
    ['days 6개', { days: days.slice(0, 6) }],
    ['days 8개', { days: [...days, days[0]] }],
    ['growthThemes 3개', { growthThemes: growthThemes.slice(0, 3) }],
    ['growthThemes 중복 역량', { growthThemes: [...growthThemes.slice(0, 3), growthThemes[0]] }],
    [
      'level > 1',
      { growthThemes: [{ ...growthThemes[0], level: 1.01 }, ...growthThemes.slice(1)] },
    ],
    [
      'level < 0',
      { growthThemes: [{ ...growthThemes[0], level: -0.1 }, ...growthThemes.slice(1)] },
    ],
    [
      'nightsWithSession 8',
      { readingSummary: { totalMinutes: 1, nightsWithSession: 8, averageSessionMinutes: 1 } },
    ],
    ['availableWeeks 0개', { availableWeeks: [] }],
    ['음수 분', { minutesTogether: -1 }],
  ])('%s → 거부', (_name, override) => {
    expect(WeeklyProgressSchema.safeParse(weekly(override)).success).toBe(false);
  });

  it.each([
    'week',
    'availableWeeks',
    'sessionsCount',
    'minutesTogether',
    'readingSummary',
    'days',
    'growthThemes',
    'momentOfWeek',
  ])('필수 key `%s` 누락 → 거부', (key) => {
    const value: Record<string, unknown> = weekly();
    delete value[key];
    expect(WeeklyProgressSchema.safeParse(value).success).toBe(false);
  });

  it('비교·분모 필드가 없다 — `D7-2` ①② (`vs last week` · `of 7` 류 key 0)', () => {
    const keys = Object.keys(WeeklyProgressSchema.shape);
    expect(keys.join(' ')).not.toMatch(/vs|previous|lastWeek|percent|ratio|streak|ofSeven/i);
    expect(Object.keys(WeeklyProgressSchema.shape.readingSummary.shape)).toStrictEqual([
      'totalMinutes',
      'nightsWithSession',
      'averageSessionMinutes',
    ]);
  });

  it('weekStart query 는 생략 가능 · 날짜만 허용', () => {
    expect(WeeklyProgressQuerySchema.safeParse({}).success).toBe(true);
    expect(WeeklyProgressQuerySchema.safeParse({ weekStart: '2026-05-04' }).success).toBe(true);
    expect(WeeklyProgressQuerySchema.safeParse({ weekStart: '2026-05-04T00:00:00Z' }).success).toBe(
      false,
    );
  });
});

describe('C7-1a GrowthThemeStage (AC-7-05)', () => {
  it('3값 스냅샷', () => {
    expect(GROWTH_THEME_STAGES).toStrictEqual(['emerging', 'growing', 'strong']);
    expect(GrowthThemeStageSchema.options).toStrictEqual(['emerging', 'growing', 'strong']);
  });

  it.each(['weak', 'low', 'high', 'advanced', ''])('미정의 값 `%s` 거부', (value) => {
    expect(GrowthThemeStageSchema.safeParse(value).success).toBe(false);
  });
});

describe('C7-2 · C7-2a ReportOverview (AC-7-06)', () => {
  it('latestReport 有 + 다음 주기 in_progress (Figma `110:835` 조합) parse', () => {
    expect(
      ReportOverviewSchema.safeParse({ currentCycle: cycle, latestReport: summary, reportCount: 2 })
        .success,
    ).toBe(true);
  });

  it('latestReport null · nextReportDate null 허용', () => {
    const value = {
      currentCycle: {
        ...cycle,
        status: 'generating',
        eligibility: 'eligible',
        nextReportDate: null,
      },
      latestReport: null,
      reportCount: 0,
    };
    expect(ReportOverviewSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ['progressRatio 1.01', { progressRatio: 1.01 }],
    ['progressRatio −0.01', { progressRatio: -0.01 }],
    ['status 미정의', { status: 'ready' }],
    ['eligibility 미정의', { eligibility: 'almost' }],
    ['requiredSessions 0', { progress: { ...cycle.progress, requiredSessions: 0 } }],
  ])('%s → 거부', (_name, override) => {
    const value = { currentCycle: { ...cycle, ...override }, latestReport: null, reportCount: 0 };
    expect(ReportOverviewSchema.safeParse(value).success).toBe(false);
  });

  it('초안의 latestSnapshot · archive 필드가 없다 (`N7-04` · C7-3)', () => {
    expect(Object.keys(ReportOverviewSchema.shape)).toStrictEqual([
      'currentCycle',
      'latestReport',
      'reportCount',
    ]);
  });
});

describe('C7-3 ReportSummary · Paginated (AC-7-07)', () => {
  it('요약 · 페이지 parse', () => {
    expect(ReportSummarySchema.safeParse(summary).success).toBe(true);
    expect(ReportSummaryPageSchema.safeParse({ items: [summary], nextCursor: null }).success).toBe(
      true,
    );
    expect(ReportSummaryPageSchema.safeParse({ items: [], nextCursor: 'c2' }).success).toBe(true);
  });

  it('cycleNo 0 · 빈 summaryLine 거부', () => {
    expect(ReportSummarySchema.safeParse({ ...summary, cycleNo: 0 }).success).toBe(false);
    expect(ReportSummarySchema.safeParse({ ...summary, summaryLine: '' }).success).toBe(false);
  });
});

describe('C7-4 · C7-4b ReportDetail (AC-7-08)', () => {
  it('기본 parse · previous null · clips 0..n', () => {
    expect(ReportDetailSchema.safeParse(detail()).success).toBe(true);
    const first = detail({ capabilityChange: { ...detail().capabilityChange, previous: null } });
    expect(ReportDetailSchema.safeParse(first).success).toBe(true);
    const clip = {
      id: ID(20),
      sessionId: ID(21),
      durationSeconds: 12,
      expiresAt: null,
      label: 'Talking about feelings',
      sessionDate: '2026-04-21',
    };
    expect(
      ReportDetailSchema.safeParse(detail({ highlightClips: [clip, { ...clip, id: ID(22) }] }))
        .success,
    ).toBe(true);
  });

  it.each([
    ['notableQuotes 0개', { notableQuotes: [] }],
    [
      'notableQuotes 3개',
      {
        notableQuotes: [1, 2, 3].map(() => ({
          text: 'q',
          sessionDate: '2026-04-21',
          bookTitle: null,
        })),
      },
    ],
    ['personaHistory 0개', { personaHistory: [] }],
    [
      'checkTrends 미정의 key',
      {
        parentFeedbackSummary: {
          summaryText: null,
          checkTrends: [{ key: 'sleepy', count: 1 }],
          frequentTopics: [],
        },
      },
    ],
  ])('%s → 거부', (_name, override) => {
    expect(ReportDetailSchema.safeParse(detail(override)).success).toBe(false);
  });

  it('personaHistory[].trigger = CapabilitySnapshotSource 3값 (C7-4b — 재사용, 신규 enum 0)', () => {
    for (const trigger of CAPABILITY_SNAPSHOT_SOURCES) {
      expect(
        ReportDetailSchema.safeParse(detail({ personaHistory: [persona(trigger)] })).success,
      ).toBe(true);
    }
    const shape = ReportDetailSchema.shape.personaHistory.element.shape;
    expect(shape.trigger.options).toStrictEqual([...CAPABILITY_SNAPSHOT_SOURCES]);
  });

  it.each(['report', 'manual', ''])('trigger 미정의 값 `%s` 거부', (trigger) => {
    expect(
      ReportDetailSchema.safeParse(detail({ personaHistory: [persona(trigger)] })).success,
    ).toBe(false);
  });

  it('trigger 누락 거부', () => {
    const { trigger: _omit, ...rest } = persona('survey_update');
    expect(ReportDetailSchema.safeParse(detail({ personaHistory: [rest] })).success).toBe(false);
  });

  it('CapabilityScores — 4역량 각 1행 (중복·누락 거부) · 결측 null 허용', () => {
    expect(CapabilityScoresSchema.safeParse(scores).success).toBe(true);
    expect(CapabilityScoresSchema.safeParse(scores.slice(0, 3)).success).toBe(false);
    expect(CapabilityScoresSchema.safeParse([...scores.slice(0, 3), scores[0]]).success).toBe(
      false,
    );
  });

  it('점수 증감 필드(deltas)가 없다 — 숫자 미노출 `N7-15`', () => {
    expect(Object.keys(ReportDetailSchema.shape.capabilityChange.shape)).toStrictEqual([
      'previous',
      'current',
      'items',
    ]);
  });

  it('REPORT_NOT_READY details.retryAfter 는 선택', () => {
    expect(ReportNotReadyDetailsSchema.safeParse({}).success).toBe(true);
    expect(
      ReportNotReadyDetailsSchema.safeParse({ retryAfter: '2026-05-12T09:00:00.000Z' }).success,
    ).toBe(true);
    expect(ReportNotReadyDetailsSchema.safeParse({ retryAfter: 'tomorrow' }).success).toBe(false);
  });
});

describe('C7-5 ReportHighlightClip (AC-7-10)', () => {
  const stage5 = { id: ID(30), sessionId: ID(31), durationSeconds: 15, expiresAt: null };

  it('Stage 5 HighlightClipSummary fixture 를 확장 필드와 함께 parse', () => {
    expect(HighlightClipSummarySchema.safeParse(stage5).success).toBe(true);
    expect(
      ReportHighlightClipSchema.safeParse({
        ...stage5,
        label: 'Talking about feelings',
        sessionDate: '2026-04-21',
      }).success,
    ).toBe(true);
  });

  it('확장 필드 누락 → 거부', () => {
    expect(ReportHighlightClipSchema.safeParse(stage5).success).toBe(false);
  });

  it('C7-8 RECORDING_DELETED details.reason = deleted | expired (선택)', () => {
    expect(RecordingDeletedDetailsSchema.safeParse({}).success).toBe(true);
    expect(RecordingDeletedDetailsSchema.safeParse({ reason: 'deleted' }).success).toBe(true);
    expect(RecordingDeletedDetailsSchema.safeParse({ reason: 'expired' }).success).toBe(true);
    expect(RecordingDeletedDetailsSchema.safeParse({ reason: 'gone' }).success).toBe(false);
  });
});

describe('C7-6 · C7-6a ReportPdfStatus (AC-7-09)', () => {
  const ready = {
    status: 'ready',
    downloadUrl: 'data:application/pdf;base64,JVBERi0=',
    expiresAt: '2026-05-11T10:00:00.000Z',
    fileName: 'haru-report.pdf',
  };
  const pending = { status: 'generating', downloadUrl: null, expiresAt: null, fileName: null };

  it('ready = url · expiresAt · fileName 모두 있으면 통과', () => {
    expect(ReportPdfStatusSchema.safeParse(ready).success).toBe(true);
  });

  it.each(['downloadUrl', 'expiresAt', 'fileName'])('ready 인데 %s null → 거부', (key) => {
    expect(ReportPdfStatusSchema.safeParse({ ...ready, [key]: null }).success).toBe(false);
  });

  it.each(['queued', 'generating', 'failed'])('%s 는 null 허용', (status) => {
    expect(ReportPdfStatusSchema.safeParse({ ...pending, status }).success).toBe(true);
  });

  it('미정의 status 거부', () => {
    expect(ReportPdfStatusSchema.safeParse({ ...pending, status: 'done' }).success).toBe(false);
  });

  it('폴링 상수 2s / 60s', () => {
    expect(REPORT_PDF_POLL_INTERVAL_MS).toBe(2000);
    expect(REPORT_PDF_POLL_TIMEOUT_MS).toBe(60000);
  });
});

describe('C7-11 reportCycleIndex (AC-7-11)', () => {
  it('27일째 = 주기 1 · 28일째 = 주기 2', () => {
    expect(reportCycleIndex('2026-03-16', '2026-03-16')).toBe(1);
    expect(reportCycleIndex('2026-03-16', shiftCalendarDate('2026-03-16', 27))).toBe(1);
    expect(reportCycleIndex('2026-03-16', shiftCalendarDate('2026-03-16', 28))).toBe(2);
    expect(reportCycleIndex('2026-03-16', '2026-05-10')).toBe(2);
    expect(reportCycleIndex('2026-03-16', '2026-05-11')).toBe(3);
  });

  it('윤년 2월 29일을 하루로 센다', () => {
    expect(calendarDaysBetween('2028-02-01', '2028-03-01')).toBe(29);
    expect(calendarDaysBetween('2026-02-01', '2026-03-01')).toBe(28);
    expect(reportCyclePeriod('2028-02-01', 1)).toStrictEqual({
      periodStart: '2028-02-01',
      periodEnd: '2028-02-28',
    });
    expect(reportCyclePeriod('2028-02-01', 2).periodStart).toBe('2028-02-29');
    expect(reportCycleIndex('2028-02-01', '2028-02-29')).toBe(2);
  });

  it('연 넘김 · 주기 기간 = 28일', () => {
    expect(shiftCalendarDate('2025-12-29', 6)).toBe('2026-01-04');
    const { periodStart, periodEnd } = reportCyclePeriod('2026-03-16', 3);
    expect(periodStart).toBe('2026-05-11');
    expect(periodEnd).toBe('2026-06-07');
    expect(calendarDaysBetween(periodStart, periodEnd)).toBe(REPORT_CYCLE_DAYS - 1);
  });

  it('잘못된 입력 → RangeError', () => {
    expect(() => reportCycleIndex('2026-03-16', '2026-03-15')).toThrow(RangeError);
    expect(() => shiftCalendarDate('2026-02-30', 1)).toThrow(RangeError);
    expect(() => shiftCalendarDate('2026/02/01', 1)).toThrow(RangeError);
    expect(() => reportCyclePeriod('2026-03-16', 0)).toThrow(RangeError);
  });

  it('isReportEligible 은 그대로 — cycle_in_progress 를 반환하지 않는다 (#17 경계 유지)', () => {
    expect(isReportEligible({ recordedSeconds: 3599, recordedSessions: 3 })).toBe(
      'insufficient_recorded_minutes',
    );
    expect(isReportEligible({ recordedSeconds: 3600, recordedSessions: 3 })).toBe('eligible');
  });
});

describe('C7-10 error code 신규 0 (AC-7-12)', () => {
  it('29종 유지 · 리포트 관련 기존 code 존재', () => {
    expect(ERROR_CODES).toHaveLength(29);
    for (const code of [
      'REPORT_NOT_ELIGIBLE',
      'REPORT_NOT_READY',
      'PDF_NOT_READY',
      'RECORDING_DELETED',
      'PROVIDER_UNAVAILABLE',
      'RESOURCE_NOT_FOUND',
      'CHILD_NOT_FOUND',
      'VALIDATION_FAILED',
    ]) {
      expect(ERROR_CODES).toContain(code);
    }
  });
});
