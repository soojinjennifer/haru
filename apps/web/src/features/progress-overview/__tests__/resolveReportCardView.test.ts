/**
 * 4주 리포트 카드 분기표 **10칸** — `latestReport`(有/無) × `currentCycle.status`(5값) (AC-7-30 · C7-2a · `N7-35` ⓐ · `N7-36` ⓐ).
 * + 과거 목록 표시 규칙 (AC-7-34).
 */
import { ReportStatusSchema, type ReportStatus, type ReportSummary } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import {
  resolvePastReportListRule,
  resolveReportCardView,
  type ReportCardOverviewInput,
  type ReportCardView,
} from '../model/resolveReportCardView';

const LATEST: ReportSummary = {
  id: '11111111-1111-4111-8111-111111111111',
  cycleNo: 2,
  periodStart: '2026-04-13',
  periodEnd: '2026-05-10',
  publishedAt: '2026-05-11T09:00:00Z',
  summaryLine: 'A calm month of stories.',
  viewed: true,
};

function input(latest: ReportSummary | null, status: ReportStatus): ReportCardOverviewInput {
  return {
    latestReport: latest,
    currentCycle: {
      status,
      progressRatio: 0.4,
      nextReportDate: status === 'generating' || status === 'delayed' ? null : '2026-06-07',
      periodStart: '2026-05-11',
      periodEnd: '2026-06-07',
    },
  };
}

const EXPECTED: Record<
  ReportStatus,
  { withLatest: ReportCardView['kind']; withoutLatest: ReportCardView['kind'] }
> = {
  in_progress: { withLatest: 'published', withoutLatest: 'first-cycle' },
  // C7-2a ③ — 정상 응답에서 오지 않지만 오면 in_progress 와 같게
  published: { withLatest: 'published', withoutLatest: 'first-cycle' },
  generating: { withLatest: 'generating', withoutLatest: 'generating' },
  deferred: { withLatest: 'deferred', withoutLatest: 'deferred' },
  delayed: { withLatest: 'delayed', withoutLatest: 'delayed' },
};

const REPORT_STATUSES = ReportStatusSchema.options;

describe('resolveReportCardView — 10칸 (AC-7-30)', () => {
  it('분기표가 ReportStatus 5값을 전부 덮는다', () => {
    expect(Object.keys(EXPECTED).sort()).toStrictEqual([...REPORT_STATUSES].sort());
  });

  for (const status of REPORT_STATUSES) {
    it(`${status} × latestReport 有 → ${EXPECTED[status].withLatest}`, () => {
      expect(resolveReportCardView(input(LATEST, status)).kind).toBe(EXPECTED[status].withLatest);
    });
    it(`${status} × latestReport 無 → ${EXPECTED[status].withoutLatest}`, () => {
      expect(resolveReportCardView(input(null, status)).kind).toBe(EXPECTED[status].withoutLatest);
    });
  }

  it('발행 카드 = latestReport + **다음 주기** progressRatio · nextReportDate (100% 고정 아님 — N7-36 ⓐ · AC-7-76)', () => {
    expect(resolveReportCardView(input(LATEST, 'in_progress'))).toStrictEqual({
      kind: 'published',
      report: LATEST,
      progressRatio: 0.4,
      nextReportDate: '2026-06-07',
    });
  });

  it('생성 중 · 이월 · 지연은 이전 발행 리포트를 담지 않는다 (N7-35 ⓐ)', () => {
    for (const status of ['generating', 'deferred', 'delayed'] as const) {
      expect(resolveReportCardView(input(LATEST, status))).not.toHaveProperty('report');
    }
  });

  it('생성 중 = 현재 주기 기간 · 막대 값 없음 / 지연 = 막대·날짜 없음 (C7-2a ⑤)', () => {
    expect(resolveReportCardView(input(null, 'generating'))).toStrictEqual({
      kind: 'generating',
      periodStart: '2026-05-11',
      periodEnd: '2026-06-07',
    });
    expect(resolveReportCardView(input(null, 'delayed'))).toStrictEqual({ kind: 'delayed' });
  });
});

describe('resolvePastReportListRule — AC-7-34 (N7-35 ⓐ)', () => {
  const published = resolveReportCardView(input(LATEST, 'in_progress'));
  const generating = resolveReportCardView(input(LATEST, 'generating'));
  const first = resolveReportCardView(input(null, 'in_progress'));

  it('카드가 latestReport 를 보여 주면 reportCount ≥ 2 · 그 리포트 제외', () => {
    expect(resolvePastReportListRule(published, 1)).toStrictEqual({
      visible: false,
      excludeId: LATEST.id,
    });
    expect(resolvePastReportListRule(published, 2)).toStrictEqual({
      visible: true,
      excludeId: LATEST.id,
    });
  });

  it('카드가 보여 주지 않으면 reportCount ≥ 1 · 제외 0', () => {
    expect(resolvePastReportListRule(generating, 1)).toStrictEqual({
      visible: true,
      excludeId: null,
    });
    expect(resolvePastReportListRule(first, 0)).toStrictEqual({ visible: false, excludeId: null });
  });
});
