/**
 * Stage 7 `S7-A` — Mock 4그룹(`progress` · `reports` · `report-pdf` · `highlight-clips`) + 파일 공유 포트 + 가짜 미디어.
 * Plan rev 2 §8 · AC-7-14~19 · AC-7-82 · AC-7-35 (Mock 부분).
 */
import {
  HaruApiError,
  isReportEligible,
  ReportDetailSchema,
  ReportOverviewSchema,
  ReportPdfStatusSchema,
  ReportSummaryPageSchema,
  SignedMediaUrlSchema,
  WeeklyProgressSchema,
  type ReportOverview,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { isNetworkError } from '../../shared/api/helpers';
import { MOCK_HIGHLIGHT_CLIP_IDS } from '../fixtures/highlight-clips';
import { MOCK_CHILD_FIRST_NAME, MOCK_CHILD_ID } from '../fixtures/me';
import {
  MOCK_EXPIRED_AT,
  MOCK_REPORT_IDS,
  MOCK_REPORT_RETRY_AFTER,
  MOCK_SIGNED_URL_EXPIRES_AT,
} from '../fixtures/reports';
import {
  MOCK_FIGMA_DAILY_MINUTES,
  MOCK_MONTH_CROSSING_WEEK_START,
  MOCK_YEAR_CROSSING_WEEK_START,
} from '../fixtures/weekly-progress';
import { HIGHLIGHT_CLIP_SCENARIO_KEYS } from '../highlight-clips/highlightClipScenarios';
import { createMockPdfBytes } from '../media/mock-pdf';
import { createMockWavBytes, MOCK_WAV_SAMPLE_RATE } from '../media/mock-wav';
import { createMockFileSharePort } from '../platform/MockFileSharePort';
import { PROGRESS_SCENARIO_KEYS } from '../progress/MockProgressApi';
import {
  MOCK_PDF_GENERATING_READS,
  REPORT_PDF_SCENARIO_KEYS,
  REPORT_SCENARIO_KEYS,
} from '../reports/reportScenarios';
import {
  canTransitionReportCycle,
  mockCycleEligibility,
  mockProgressRatio,
  publishCurrentCycle,
  transitionReportCycle,
} from '../reports/reportState';

import { bundle, ik } from './stage4-support';

const CHILD = { childId: MOCK_CHILD_ID };
const LATEST = { reportId: MOCK_REPORT_IDS.latest };
const PENDING = { reportId: MOCK_REPORT_IDS.pending };

async function errorOf(promise: Promise<unknown>): Promise<HaruApiError | 'NETWORK'> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HaruApiError) return error;
    if (isNetworkError(error)) return 'NETWORK';
    throw error;
  }
  throw new Error('expected a failure');
}

async function codeOf(promise: Promise<unknown>): Promise<string> {
  const error = await errorOf(promise);
  return error === 'NETWORK' ? 'NETWORK' : error.code;
}

// ── progress ──────────────────────────────────────────────────────────────

describe('progress — WeeklyProgress (AC-7-14 · Figma 수치 fixture)', () => {
  it('success = Figma `31:102` 수치 1세트 (5 · 62m · 72 · 6 nights · avg 12 · 8/13/—/16/11/20/4)', async () => {
    const week = await bundle().clients.progress.getWeekly(CHILD);
    expect(WeeklyProgressSchema.parse(week)).toStrictEqual(week);
    expect(week.week).toStrictEqual({ start: '2026-05-04', end: '2026-05-10' });
    expect([week.sessionsCount, week.minutesTogether]).toStrictEqual([5, 62]);
    expect(week.readingSummary).toStrictEqual({
      totalMinutes: 72,
      nightsWithSession: 6,
      averageSessionMinutes: 12,
    });
    expect(week.days.map((day) => day.minutes)).toStrictEqual([...MOCK_FIGMA_DAILY_MINUTES]);
    expect(week.days.map((day) => day.date)).toStrictEqual([
      '2026-05-04',
      '2026-05-05',
      '2026-05-06',
      '2026-05-07',
      '2026-05-08',
      '2026-05-09',
      '2026-05-10',
    ]);
    expect(week.growthThemes.map((theme) => theme.stage)).toStrictEqual([
      'strong',
      'growing',
      'emerging',
      'emerging',
    ]);
    expect(week.momentOfWeek?.speakerName).toBe(MOCK_CHILD_FIRST_NAME);
    expect(week.momentOfWeek?.pageRef).toBe(14);
    expect(week.availableWeeks).toStrictEqual(['2026-05-04', MOCK_MONTH_CROSSING_WEEK_START]);
  });

  it.each(PROGRESS_SCENARIO_KEYS.filter((key) => !['error', 'offline'].includes(key)))(
    '%s — 응답이 contracts parse 를 통과한다',
    async (key) => {
      const b = bundle(`progress:${key}`);
      if (key === 'retry') await errorOf(b.clients.progress.getWeekly(CHILD));
      const week = await b.clients.progress.getWeekly(CHILD);
      expect(WeeklyProgressSchema.safeParse(week).success).toBe(true);
    },
  );

  it('empty — 세션 0 · days 전부 null · Moment null · 선택 가능 주 1개', async () => {
    const week = await bundle('progress:empty').clients.progress.getWeekly(CHILD);
    expect(week.sessionsCount).toBe(0);
    expect(week.minutesTogether).toBe(0);
    expect(week.readingSummary.averageSessionMinutes).toBeNull();
    expect(week.days.every((day) => day.minutes === null)).toBe(true);
    expect(week.momentOfWeek).toBeNull();
    expect(week.availableWeeks).toHaveLength(1);
  });

  it('progress-first-week — 선택 가능 주 1개', async () => {
    const week = await bundle('progress:progress-first-week').clients.progress.getWeekly(CHILD);
    expect(week.availableWeeks).toStrictEqual(['2026-05-04']);
    expect(week.sessionsCount).toBeGreaterThan(0);
  });

  it('progress-multi-week — 주 4개(달 넘김 · 연 넘김) · 이전 주 선택 = 다른 fixture', async () => {
    const b = bundle('progress:progress-multi-week');
    const current = await b.clients.progress.getWeekly(CHILD);
    expect(current.availableWeeks).toHaveLength(4);
    expect(current.availableWeeks).toContain(MOCK_MONTH_CROSSING_WEEK_START);
    expect(current.availableWeeks).toContain(MOCK_YEAR_CROSSING_WEEK_START);

    const crossing = await b.clients.progress.getWeekly({
      ...CHILD,
      query: { weekStart: MOCK_YEAR_CROSSING_WEEK_START },
    });
    expect(crossing.week).toStrictEqual({ start: '2025-12-29', end: '2026-01-04' });
    expect(crossing.days[6]?.date).toBe('2026-01-04');
    expect(crossing).not.toStrictEqual(current);
  });

  it('선택 가능 주가 아닌 weekStart → VALIDATION_FAILED(fields weekStart) · 다른 아이 → CHILD_NOT_FOUND', async () => {
    const b = bundle();
    const error = await errorOf(
      b.clients.progress.getWeekly({ ...CHILD, query: { weekStart: '2026-03-02' } }),
    );
    expect(error).toBeInstanceOf(HaruApiError);
    expect((error as HaruApiError).code).toBe('VALIDATION_FAILED');
    expect((error as HaruApiError).details).toStrictEqual({ fields: ['weekStart'] });
    expect(await codeOf(b.clients.progress.getWeekly({ childId: MOCK_REPORT_IDS.latest }))).toBe(
      'CHILD_NOT_FOUND',
    );
  });

  it('error · offline · retry(1회차) — 공통 전달', async () => {
    expect(await codeOf(bundle('progress:error').clients.progress.getWeekly(CHILD))).toBe(
      'INTERNAL_ERROR',
    );
    expect(await codeOf(bundle('progress:offline').clients.progress.getWeekly(CHILD))).toBe(
      'NETWORK',
    );
  });

  it('fixture 에 비교·분모·달성률 표현 0 (`D7-2` · AC-7-66 Mock 부분)', async () => {
    const text = JSON.stringify(
      await bundle('progress:progress-multi-week').clients.progress.getWeekly(CHILD),
    );
    expect(text).not.toMatch(/vs last week|% of|of 7|streak|\+\d+%/i);
  });
});

// ── reports ───────────────────────────────────────────────────────────────

async function overviewOf(scenario: string): Promise<ReportOverview> {
  return bundle(scenario).clients.reports.getOverview(CHILD);
}

describe('reports — overview · list · detail parse (AC-7-14)', () => {
  it.each(REPORT_SCENARIO_KEYS.filter((key) => !['error', 'offline', 'retry'].includes(key)))(
    '%s — overview · list · (발행 리포트) detail 이 parse 된다',
    async (key) => {
      const b = bundle(`reports:${key}`);
      const overview = ReportOverviewSchema.parse(await b.clients.reports.getOverview(CHILD));
      const page = ReportSummaryPageSchema.parse(await b.clients.reports.list(CHILD));
      expect(page.items).toHaveLength(overview.reportCount);
      for (const item of page.items) {
        expect(
          ReportDetailSchema.safeParse(await b.clients.reports.getDetail({ reportId: item.id }))
            .success,
        ).toBe(true);
      }
    },
  );

  it('success = Figma `110:835` 조합 — 발행 Apr 13 – May 10 + 다음 주기 in_progress · next Jun 7 · reportCount 2 (C7-2a)', async () => {
    const overview = await overviewOf('');
    expect(overview.latestReport?.id).toBe(MOCK_REPORT_IDS.latest);
    expect([overview.latestReport?.periodStart, overview.latestReport?.periodEnd]).toStrictEqual([
      '2026-04-13',
      '2026-05-10',
    ]);
    expect(overview.currentCycle.status).toBe('in_progress');
    expect(overview.currentCycle.cycleNo).toBe(3);
    expect(overview.currentCycle.periodStart).toBe('2026-05-11');
    expect(overview.currentCycle.nextReportDate).toBe('2026-06-07');
    expect(overview.reportCount).toBe(2);
    // VG7-A-05 ⓑ — Figma `110:852` 막대 폭 100% 와 같게: 3600초 · 3세션 → ratio 1. 진행 중 주기가 기준을
    // 채웠으므로 eligibility = cycle_in_progress (`N7-14`). "100% 고정 아님"(AC-7-76) 판별은 `report-no-previous`.
    expect(overview.currentCycle.progress.recordedSeconds).toBe(3600);
    expect(overview.currentCycle.progress.recordedSessions).toBe(3);
    expect(overview.currentCycle.progressRatio).toBe(1);
    expect(overview.currentCycle.eligibility).toBe('cycle_in_progress');
  });

  it('empty — 리포트 0 · 첫 주기 insufficient_both · 목록 []', async () => {
    const b = bundle('reports:empty');
    const overview = await b.clients.reports.getOverview(CHILD);
    expect(overview.latestReport).toBeNull();
    expect(overview.reportCount).toBe(0);
    expect(overview.currentCycle).toMatchObject({
      cycleNo: 1,
      status: 'in_progress',
      eligibility: 'insufficient_both',
      progressRatio: 0,
    });
    expect((await b.clients.reports.list(CHILD)).items).toStrictEqual([]);
  });

  it('report-eligible — generating · eligible · 발행 2건(과거 목록 2건) · nextReportDate null', async () => {
    const overview = await overviewOf('reports:report-eligible');
    expect(overview.currentCycle).toMatchObject({
      status: 'generating',
      eligibility: 'eligible',
      nextReportDate: null,
    });
    expect(overview.reportCount).toBe(2);
  });

  it('report-not-eligible — 3599초·3세션 = insufficient_recorded_minutes 이고 Mock 내부 isReportEligible 결과와 같다 (AC-7-15)', async () => {
    const overview = await overviewOf('reports:report-not-eligible');
    const { recordedSeconds, recordedSessions } = overview.currentCycle.progress;
    expect([recordedSeconds, recordedSessions]).toStrictEqual([3599, 3]);
    expect(overview.currentCycle.eligibility).toBe('insufficient_recorded_minutes');
    expect(overview.currentCycle.eligibility).toBe(
      isReportEligible({ recordedSeconds, recordedSessions }),
    );
    expect(overview.latestReport).toBeNull();
  });

  it.each([
    ['report-deferred', 1, '2026-04-13', '2026-06-07'],
    ['report-deferred-first', 0, '2026-03-16', '2026-05-10'],
  ] as const)(
    '%s — deferred(이월·합쳐진 주기) · reportCount %i · 기간 %s – %s · next = periodEnd',
    async (key, count, start, end) => {
      const b = bundle(`reports:${key}`);
      const overview = await b.clients.reports.getOverview(CHILD);
      expect(overview.currentCycle.status).toBe('deferred');
      expect(overview.reportCount).toBe(count);
      expect(overview.latestReport === null).toBe(count === 0);
      expect([overview.currentCycle.periodStart, overview.currentCycle.periodEnd]).toStrictEqual([
        start,
        end,
      ]);
      expect(overview.currentCycle.nextReportDate).toBe(end);
      expect(await codeOf(b.clients.reports.getDetail(PENDING))).toBe('REPORT_NOT_ELIGIBLE');
    },
  );

  it('report-delayed — delayed · 발행 전 리포트 상세 = REPORT_NOT_READY(details.retryAfter)', async () => {
    const b = bundle('reports:report-delayed');
    expect((await b.clients.reports.getOverview(CHILD)).currentCycle.status).toBe('delayed');
    const error = await errorOf(b.clients.reports.getDetail(PENDING));
    expect(error).toBeInstanceOf(HaruApiError);
    expect((error as HaruApiError).code).toBe('REPORT_NOT_READY');
    expect((error as HaruApiError).details).toStrictEqual({ retryAfter: MOCK_REPORT_RETRY_AFTER });
  });

  it('success detail — 페르소나 3개 · trigger 3값 각 1회 · 오래된 것 먼저 · 220자 · 인용 2 · 클립 2 (C7-4b · Spec §14)', async () => {
    const detail = await bundle().clients.reports.getDetail(LATEST);
    expect(detail.personaHistory.map((entry) => entry.trigger)).toStrictEqual([
      'onboarding_survey',
      'session_analysis',
      'survey_update',
    ]);
    const times = detail.personaHistory.map((entry) => entry.effectiveFrom);
    expect([...times].sort()).toStrictEqual(times);
    expect(detail.personaHistory.some((entry) => entry.description.length === 220)).toBe(true);
    expect(detail.notableQuotes).toHaveLength(2);
    expect(detail.highlightClips.map((clip) => clip.id)).toStrictEqual([
      ...MOCK_HIGHLIGHT_CLIP_IDS,
    ]);
    expect(detail.capabilityChange.previous).not.toBeNull();
    expect(detail.capabilityChange.items.some((item) => item.evidence === null)).toBe(true);
    expect(detail.childDisplayName).toBe(MOCK_CHILD_FIRST_NAME);
  });

  it('earlier detail — 발행 시점 이름 40자 동결(`N7-16`) · 긴 summaryLine · previous null · 피드백 빈 블록', async () => {
    const detail = await bundle().clients.reports.getDetail({ reportId: MOCK_REPORT_IDS.earlier });
    expect(detail.childDisplayName).toHaveLength(40);
    expect(detail.summary.summaryLine.length).toBeGreaterThan(200);
    expect(detail.capabilityChange.previous).toBeNull();
    expect(detail.parentFeedbackSummary).toStrictEqual({
      summaryText: null,
      checkTrends: [],
      frequentTopics: [],
    });
  });

  it('report-persona-unchanged — personaHistory 1개 · report-no-previous — previous null · 리포트 1건', async () => {
    const unchanged = await bundle('reports:report-persona-unchanged').clients.reports.getDetail(
      LATEST,
    );
    expect(unchanged.personaHistory).toHaveLength(1);

    const b = bundle('reports:report-no-previous');
    const overview = await b.clients.reports.getOverview(CHILD);
    expect(overview.reportCount).toBe(1);
    expect(overview.latestReport?.cycleNo).toBe(1);
    expect((await b.clients.reports.getDetail(LATEST)).capabilityChange.previous).toBeNull();
    // AC-7-76 판별 장면 (VG7-A-05 ⓑ 로 `success` 에서 이동): 발행 有 + 다음 주기 in_progress 인데 ratio ≠ 1
    expect(overview.currentCycle.status).toBe('in_progress');
    expect(overview.currentCycle.progressRatio).toBeCloseTo(0.4, 10);
    expect(overview.currentCycle.eligibility).toBe('insufficient_both');
  });

  it('모르는 리포트 → RESOURCE_NOT_FOUND · 발행 전 리포트(in_progress) → REPORT_NOT_READY · 다른 아이 → CHILD_NOT_FOUND', async () => {
    const b = bundle();
    expect(
      await codeOf(
        b.clients.reports.getDetail({ reportId: '00000000-0000-4000-8000-000000000000' }),
      ),
    ).toBe('RESOURCE_NOT_FOUND');
    expect(await codeOf(b.clients.reports.getDetail(PENDING))).toBe('REPORT_NOT_READY');
    expect(await codeOf(b.clients.reports.getOverview({ childId: MOCK_REPORT_IDS.latest }))).toBe(
      'CHILD_NOT_FOUND',
    );
    expect(await codeOf(b.clients.reports.markViewed(PENDING))).toBe('RESOURCE_NOT_FOUND');
  });

  it('목록 — 최신 먼저 · limit 1 → nextCursor · 다음 페이지 · 잘못된 cursor → VALIDATION_FAILED', async () => {
    const b = bundle();
    const first = await b.clients.reports.list({ ...CHILD, query: { limit: 1 } });
    expect(first.items.map((item) => item.id)).toStrictEqual([MOCK_REPORT_IDS.latest]);
    expect(first.nextCursor).not.toBeNull();
    const second = await b.clients.reports.list({
      ...CHILD,
      query: { limit: 1, cursor: first.nextCursor ?? undefined },
    });
    expect(second.items.map((item) => item.id)).toStrictEqual([MOCK_REPORT_IDS.earlier]);
    expect(second.nextCursor).toBeNull();
    expect(await codeOf(b.clients.reports.list({ ...CHILD, query: { cursor: 'bogus' } }))).toBe(
      'VALIDATION_FAILED',
    );
  });

  it('error · offline · retry — 공통 전달 (retry = 메서드별 1회차만 실패 후 success 세계)', async () => {
    expect(await codeOf(overviewOf('reports:error'))).toBe('INTERNAL_ERROR');
    expect(await codeOf(overviewOf('reports:offline'))).toBe('NETWORK');
    const b = bundle('reports:retry');
    expect(await codeOf(b.clients.reports.getOverview(CHILD))).toBe('INTERNAL_ERROR');
    expect((await b.clients.reports.getOverview(CHILD)).reportCount).toBe(2);
    expect(await codeOf(b.clients.reports.getDetail(LATEST))).toBe('INTERNAL_ERROR');
    expect(ReportDetailSchema.safeParse(await b.clients.reports.getDetail(LATEST)).success).toBe(
      true,
    );
  });
});

describe('reports — 상태 저장형 (AC-7-16 · AC-7-82)', () => {
  it('viewed: report-published-unviewed → 상세 진입 후 viewed 1회 → list · overview 의 viewed = true · 반복 호출 멱등', async () => {
    const b = bundle('reports:report-published-unviewed');
    expect((await b.clients.reports.getOverview(CHILD)).latestReport?.viewed).toBe(false);
    await b.clients.reports.markViewed(LATEST);
    await b.clients.reports.markViewed(LATEST);
    expect((await b.clients.reports.getOverview(CHILD)).latestReport?.viewed).toBe(true);
    expect((await b.clients.reports.list(CHILD)).items[0]?.viewed).toBe(true);
    expect((await b.clients.reports.getDetail(LATEST)).summary.viewed).toBe(true);
    expect(
      b.requestLog.entries().filter((entry) => entry.operation.endsWith('/viewed')),
    ).toHaveLength(2);
  });

  it('발행 전이 generating → published: latestReport = 새 리포트 · currentCycle = 다음 주기 in_progress · reportCount +1 · list 맨 앞', async () => {
    const b = bundle('reports:report-eligible');
    const before = await b.clients.reports.getOverview(CHILD);
    expect(before.currentCycle.status).toBe('generating');

    const published = publishCurrentCycle(b.reportState, {
      publishedAt: '2026-06-08T16:00:00.000Z',
      nextPendingId: 'e7e7e7e7-0000-4000-8000-000000000004',
    });

    const after = ReportOverviewSchema.parse(await b.clients.reports.getOverview(CHILD));
    expect(after.latestReport?.id).toBe(MOCK_REPORT_IDS.pending);
    expect(after.latestReport).toStrictEqual(published);
    expect(after.reportCount).toBe(before.reportCount + 1);
    expect(after.currentCycle).toMatchObject({
      cycleNo: before.currentCycle.cycleNo + 1,
      periodStart: '2026-06-08',
      periodEnd: '2026-07-05',
      status: 'in_progress',
      progressRatio: 0,
      nextReportDate: '2026-07-05',
    });
    const page = ReportSummaryPageSchema.parse(await b.clients.reports.list(CHILD));
    expect(page.items[0]?.id).toBe(MOCK_REPORT_IDS.pending);
    expect(page.items).toHaveLength(3);
    expect(ReportDetailSchema.safeParse(await b.clients.reports.getDetail(PENDING)).success).toBe(
      true,
    );
  });

  it('허용되지 않은 주기 전이는 거부된다 (in_progress → published · published → *)', () => {
    const b = bundle();
    expect(canTransitionReportCycle('in_progress', 'published')).toBe(false);
    expect(canTransitionReportCycle('published', 'in_progress')).toBe(false);
    expect(canTransitionReportCycle('delayed', 'published')).toBe(true);
    expect(() =>
      publishCurrentCycle(b.reportState, {
        publishedAt: '2026-06-08T16:00:00.000Z',
        nextPendingId: 'x',
      }),
    ).toThrow();
    transitionReportCycle(b.reportState, 'generating');
    transitionReportCycle(b.reportState, 'delayed');
    expect(b.reportState.cycle.nextReportDate).toBeNull();
    expect(() => transitionReportCycle(b.reportState, 'generating')).toThrow();
  });

  it('eligibility · progressRatio — #17 경계 (3599/3600 × 2/3) · in_progress 충족 = cycle_in_progress (`N7-14`)', () => {
    const base = bundle().reportState.cycle;
    const cases: [number, number, string][] = [
      [3599, 2, 'insufficient_both'],
      [3599, 3, 'insufficient_recorded_minutes'],
      [3600, 2, 'insufficient_recorded_sessions'],
      [3600, 3, 'cycle_in_progress'],
    ];
    for (const [recordedSeconds, recordedSessions, expected] of cases) {
      expect(mockCycleEligibility({ ...base, recordedSeconds, recordedSessions })).toBe(expected);
    }
    expect(
      mockCycleEligibility({
        ...base,
        status: 'generating',
        recordedSeconds: 3600,
        recordedSessions: 3,
      }),
    ).toBe('eligible');
    // 저품질 세션 1건 제외 → 3 → 2 (집계 입력이 줄면 결과가 바뀐다 — #17-③)
    expect(
      mockCycleEligibility({
        ...base,
        status: 'deferred',
        recordedSeconds: 3600,
        recordedSessions: 3 - 1,
      }),
    ).toBe('insufficient_recorded_sessions');
    expect(mockProgressRatio(1800, 3)).toBe(0.5);
    expect(mockProgressRatio(7200, 1)).toBeCloseTo(1 / 3, 10);
    expect(mockProgressRatio(7200, 9)).toBe(1);
  });
});

// ── report-pdf ────────────────────────────────────────────────────────────

describe('report-pdf — 요청 · 폴링 (AC-7-14 · AC-7-16)', () => {
  async function pollUntilSettled(b: ReturnType<typeof bundle>, max = 10) {
    const statuses: string[] = [];
    for (let read = 0; read < max; read += 1) {
      const status = ReportPdfStatusSchema.parse(await b.clients.reportPdf.getStatus(LATEST));
      statuses.push(status.status);
      if (status.status === 'ready' || status.status === 'failed') return { statuses, status };
    }
    return { statuses, status: undefined };
  }

  it('success — POST queued → GET generating 1회 → ready(가짜 PDF data URL · 만료 · 파일명)', async () => {
    const b = bundle();
    const queued = await b.clients.reportPdf.request(LATEST, ik('pdf'));
    expect(queued).toStrictEqual({
      status: 'queued',
      downloadUrl: null,
      expiresAt: null,
      fileName: null,
    });
    const { statuses, status } = await pollUntilSettled(b);
    expect(statuses).toStrictEqual(['generating', 'ready']);
    expect(status?.downloadUrl).toMatch(/^data:application\/pdf;base64,/);
    expect(status?.expiresAt).toBe(MOCK_SIGNED_URL_EXPIRES_AT);
    expect(status?.fileName).toBe('haru-4-week-report-2026-04-13-to-2026-05-10.pdf');
    expect(status?.fileName).not.toContain(MOCK_CHILD_FIRST_NAME);
  });

  it('pdf-generating — generating 3회 후 ready', async () => {
    const b = bundle('report-pdf:pdf-generating');
    await b.clients.reportPdf.request(LATEST, ik('pdf'));
    const { statuses } = await pollUntilSettled(b);
    expect(statuses).toStrictEqual([
      ...Array.from({ length: MOCK_PDF_GENERATING_READS }, () => 'generating'),
      'ready',
    ]);
  });

  it('pdf-failed — failed → 재요청(새 key) 시 새 작업 → ready', async () => {
    const b = bundle('report-pdf:pdf-failed');
    await b.clients.reportPdf.request(LATEST, ik('pdf-1'));
    expect((await pollUntilSettled(b)).statuses).toStrictEqual(['failed']);
    expect((await b.clients.reportPdf.request(LATEST, ik('pdf-2'))).status).toBe('queued');
    expect((await pollUntilSettled(b)).statuses).toStrictEqual(['generating', 'ready']);
  });

  it('pdf-timeout — 상한 동안 generating 유지', async () => {
    const b = bundle('report-pdf:pdf-timeout');
    await b.clients.reportPdf.request(LATEST, ik('pdf'));
    const { statuses, status } = await pollUntilSettled(b, 31);
    expect(status).toBeUndefined();
    expect(new Set(statuses)).toStrictEqual(new Set(['generating']));
  });

  it('멱등 — ready 뒤 같은 리포트 재요청(다른 key) = 같은 작업 ready · 같은 key = 최초 응답 재생 · 다른 리포트에 같은 key = IDEMPOTENCY_KEY_REUSED', async () => {
    const b = bundle();
    await b.clients.reportPdf.request(LATEST, ik('first'));
    await pollUntilSettled(b);
    const again = await b.clients.reportPdf.request(LATEST, ik('second'));
    expect(again.status).toBe('ready');
    expect((await b.clients.reportPdf.request(LATEST, ik('first'))).status).toBe('queued');
    expect(
      await codeOf(b.clients.reportPdf.request({ reportId: MOCK_REPORT_IDS.earlier }, ik('first'))),
    ).toBe('IDEMPOTENCY_KEY_REUSED');
  });

  it('발행 전 리포트 → REPORT_NOT_READY · 모르는 리포트 → RESOURCE_NOT_FOUND · 요청 전 GET → RESOURCE_NOT_FOUND · 빈 key → VALIDATION_FAILED', async () => {
    const b = bundle();
    expect(await codeOf(b.clients.reportPdf.request(PENDING, ik('p')))).toBe('REPORT_NOT_READY');
    expect(
      await codeOf(
        b.clients.reportPdf.request({ reportId: '00000000-0000-4000-8000-000000000000' }, ik('u')),
      ),
    ).toBe('RESOURCE_NOT_FOUND');
    expect(await codeOf(b.clients.reportPdf.getStatus(LATEST))).toBe('RESOURCE_NOT_FOUND');
    expect(await codeOf(b.clients.reportPdf.request(LATEST, { idempotencyKey: '' }))).toBe(
      'VALIDATION_FAILED',
    );
  });

  it.each(REPORT_PDF_SCENARIO_KEYS.filter((key) => !['error', 'offline', 'retry'].includes(key)))(
    '%s — 모든 응답이 parse 된다',
    async (key) => {
      const b = bundle(`report-pdf:${key}`);
      ReportPdfStatusSchema.parse(await b.clients.reportPdf.request(LATEST, ik('r')));
      await pollUntilSettled(b, 5);
    },
  );

  it('retry — 요청·조회 각 1회차만 실패 → 같은 key 재시도 성공', async () => {
    const b = bundle('report-pdf:retry');
    expect(await codeOf(b.clients.reportPdf.request(LATEST, ik('r')))).toBe('INTERNAL_ERROR');
    expect((await b.clients.reportPdf.request(LATEST, ik('r'))).status).toBe('queued');
    expect(await codeOf(b.clients.reportPdf.getStatus(LATEST))).toBe('INTERNAL_ERROR');
    expect((await pollUntilSettled(b)).status?.status).toBe('ready');
  });

  it('error · offline — 공통 전달', async () => {
    expect(
      await codeOf(bundle('report-pdf:error').clients.reportPdf.request(LATEST, ik('e'))),
    ).toBe('INTERNAL_ERROR');
    expect(
      await codeOf(bundle('report-pdf:offline').clients.reportPdf.request(LATEST, ik('o'))),
    ).toBe('NETWORK');
  });
});

// ── highlight-clips ───────────────────────────────────────────────────────

describe('highlight-clips — 재생 URL (AC-7-14)', () => {
  const FIRST = { clipId: MOCK_HIGHLIGHT_CLIP_IDS[0] };
  const SECOND = { clipId: MOCK_HIGHLIGHT_CLIP_IDS[1] };

  it('success — 합성 WAV data URL · 먼 미래 만료 · 요청 로그에 URL 없음', async () => {
    const b = bundle();
    const url = SignedMediaUrlSchema.parse(await b.clients.highlightClips.getPlaybackUrl(FIRST));
    expect(url.url).toMatch(/^data:audio\/wav;base64,UklGR/);
    expect(url.expiresAt).toBe(MOCK_SIGNED_URL_EXPIRES_AT);
    expect(JSON.stringify(b.requestLog.entries())).not.toContain('data:');
  });

  it('clip-expired — 두 번째 클립: 상세 expiresAt 과거 + RECORDING_DELETED{expired} · 첫 클립은 재생 가능', async () => {
    const b = bundle('highlight-clips:clip-expired');
    const detail = await b.clients.reports.getDetail(LATEST);
    expect(detail.highlightClips.map((clip) => clip.expiresAt)).toStrictEqual([
      null,
      MOCK_EXPIRED_AT,
    ]);
    const error = await errorOf(b.clients.highlightClips.getPlaybackUrl(SECOND));
    expect((error as HaruApiError).code).toBe('RECORDING_DELETED');
    expect((error as HaruApiError).details).toStrictEqual({ reason: 'expired' });
    expect(
      SignedMediaUrlSchema.safeParse(await b.clients.highlightClips.getPlaybackUrl(FIRST)).success,
    ).toBe(true);
  });

  it('recording-deleted — 모든 클립 RECORDING_DELETED{deleted} · 재시도해도 같다', async () => {
    const b = bundle('highlight-clips:recording-deleted');
    for (const clip of [FIRST, SECOND, FIRST]) {
      const error = await errorOf(b.clients.highlightClips.getPlaybackUrl(clip));
      expect((error as HaruApiError).details).toStrictEqual({ reason: 'deleted' });
    }
  });

  it('clip-url-expired — 클립별 첫 URL 만료(과거 · 빈 오디오) → 두 번째 조회 유효 (재발급 1회)', async () => {
    const b = bundle('highlight-clips:clip-url-expired');
    const first = await b.clients.highlightClips.getPlaybackUrl(FIRST);
    expect(first.expiresAt).toBe(MOCK_EXPIRED_AT);
    expect(first.url).toBe('data:audio/wav;base64,');
    const second = await b.clients.highlightClips.getPlaybackUrl(FIRST);
    expect(second.expiresAt).toBe(MOCK_SIGNED_URL_EXPIRES_AT);
    expect((await b.clients.highlightClips.getPlaybackUrl(SECOND)).expiresAt).toBe(MOCK_EXPIRED_AT);
  });

  it('모르는 클립 → RESOURCE_NOT_FOUND · error · offline 공통', async () => {
    expect(
      await codeOf(
        bundle().clients.highlightClips.getPlaybackUrl({
          clipId: '00000000-0000-4000-8000-000000000000',
        }),
      ),
    ).toBe('RESOURCE_NOT_FOUND');
    expect(
      await codeOf(bundle('highlight-clips:error').clients.highlightClips.getPlaybackUrl(FIRST)),
    ).toBe('INTERNAL_ERROR');
    expect(
      await codeOf(bundle('highlight-clips:offline').clients.highlightClips.getPlaybackUrl(FIRST)),
    ).toBe('NETWORK');
  });

  it.each(
    HIGHLIGHT_CLIP_SCENARIO_KEYS.filter(
      (key) => !['error', 'offline', 'recording-deleted'].includes(key),
    ),
  )('%s — 첫 클립 응답이 parse 된다', async (key) => {
    const b = bundle(`highlight-clips:${key}`);
    if (key === 'retry') await errorOf(b.clients.highlightClips.getPlaybackUrl(FIRST));
    expect(
      SignedMediaUrlSchema.safeParse(await b.clients.highlightClips.getPlaybackUrl(FIRST)).success,
    ).toBe(true);
  });
});

// ── file share port ───────────────────────────────────────────────────────

describe('MockFileSharePort (report-pdf:share-*)', () => {
  const file = new File([createMockPdfBytes()], 'report.pdf', { type: 'application/pdf' });

  it('success — 공유 가능 · shared · 저장은 기록 + delegate', async () => {
    const saved: string[] = [];
    const port = createMockFileSharePort({
      store: bundle().store,
      saveDelegate: { saveFile: (_blob, name) => saved.push(name) },
    });
    expect(port.canShareFile(file)).toBe(true);
    expect(await port.shareFile(file, 'Report')).toBe('shared');
    port.saveFile(file, 'report.pdf');
    expect(saved).toStrictEqual(['report.pdf']);
    expect(port.records().map((record) => record.kind)).toStrictEqual(['share', 'save']);
  });

  it('share-cancelled — cancelled (오류 아님)', async () => {
    const port = createMockFileSharePort({ store: bundle('report-pdf:share-cancelled').store });
    expect(await port.shareFile(file, 'Report')).toBe('cancelled');
  });

  it('share-unsupported — canShareFile false · 공유 호출 시 거절', async () => {
    const port = createMockFileSharePort({ store: bundle('report-pdf:share-unsupported').store });
    expect(port.canShareFile(file)).toBe(false);
    await expect(port.shareFile(file, 'Report')).rejects.toMatchObject({
      name: 'FileShareRejectedError',
      reason: 'NotSupportedError',
    });
  });
});

// ── 가짜 미디어 (AC-7-17) ─────────────────────────────────────────────────

describe('가짜 PDF · WAV — 런타임 생성 · 유효 시그니처', () => {
  it('PDF — `%PDF-` 시작 · `%%EOF` 끝 · xref 오프셋이 실제 객체 위치를 가리킨다', () => {
    const bytes = createMockPdfBytes();
    const text = String.fromCharCode(...bytes);
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
    const startxref = Number(/startxref\n(\d+)/.exec(text)?.[1]);
    expect(text.slice(startxref, startxref + 4)).toBe('xref');
    const offsets = [...text.matchAll(/^(\d{10}) 00000 n $/gm)].map((match) => Number(match[1]));
    offsets.forEach((offset, index) => {
      expect(text.slice(offset).startsWith(`${String(index + 1)} 0 obj`)).toBe(true);
    });
  });

  it('WAV — RIFF/WAVE · PCM 8-bit mono · 길이 = 초 × 표본율 · 결정적', () => {
    const bytes = createMockWavBytes(12);
    const view = new DataView(bytes.buffer);
    const tag = (offset: number) => String.fromCharCode(...bytes.subarray(offset, offset + 4));
    expect([tag(0), tag(8), tag(12), tag(36)]).toStrictEqual(['RIFF', 'WAVE', 'fmt ', 'data']);
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(MOCK_WAV_SAMPLE_RATE);
    expect(view.getUint32(40, true)).toBe(12 * MOCK_WAV_SAMPLE_RATE);
    expect(bytes.length).toBe(44 + 12 * MOCK_WAV_SAMPLE_RATE);
    expect(createMockWavBytes(12)).toStrictEqual(bytes);
  });
});

// ── 결정성 (AC-7-19) ──────────────────────────────────────────────────────

describe('Stage 7 Mock — 결정성', () => {
  async function run(scenario: string): Promise<string> {
    const b = bundle(scenario);
    const out: unknown[] = [];
    out.push(await b.clients.progress.getWeekly(CHILD));
    out.push(await b.clients.reports.getOverview(CHILD));
    out.push(await b.clients.reports.list(CHILD));
    out.push(await b.clients.reports.getDetail(LATEST));
    await b.clients.reports.markViewed(LATEST);
    out.push(await b.clients.reportPdf.request(LATEST, ik('d')));
    out.push(await b.clients.reportPdf.getStatus(LATEST));
    out.push(await b.clients.reportPdf.getStatus(LATEST));
    out.push(await b.clients.highlightClips.getPlaybackUrl({ clipId: MOCK_HIGHLIGHT_CLIP_IDS[0] }));
    out.push(b.requestLog.entries());
    return JSON.stringify(out);
  }

  it.each([
    '',
    'reports:report-published-unviewed',
    'reports:report-persona-unchanged,highlight-clips:clip-url-expired,report-pdf:pdf-generating',
  ])('같은 scenario(%s) 두 번 = 같은 응답 바이트', async (scenario) => {
    expect(await run(scenario)).toBe(await run(scenario));
  });
});
