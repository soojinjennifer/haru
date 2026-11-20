/**
 * 4주 리포트 카드 분기 — Stage 7 Spec §2.2 · Plan §5.1 rev 2 (`M7-6` → C7-2a · `N7-35` ⓐ · `N7-36` ⓐ, AC-7-30).
 *
 * 카드 = **`latestReport`(有/無) × `currentCycle.status`(5값) 조합 10칸**. 배타 상태가 아니다.
 *
 * | status \ latestReport | 有 | 無 |
 * |---|---|---|
 * | `in_progress` | **published** (Figma `110:835` — 발행 리포트 + 다음 주기 막대 + Next report on) | **first-cycle** |
 * | `published` (방어 — C7-2a ③) | published (in_progress 와 같게) | first-cycle |
 * | `generating` | generating (이전 리포트는 과거 목록 — `N7-35` ⓐ) | generating |
 * | `deferred` | deferred (〃) | deferred |
 * | `delayed` | delayed (〃) | delayed |
 *
 * 입력 = 응답 값만 (`latestReport` · `currentCycle.status` · `progressRatio` · `nextReportDate` · 기간). eligibility 재판정 0,
 * eligibility 세부 사유는 분기에 쓰지 않는다 (Spec §2.2 — 사유별 문구 0). 막대 값 = 서버 `progressRatio` 그대로(`N7-36` ⓐ —
 * 발행 카드에서도 **다음 주기** ratio, 100% 고정 아님 · AC-7-76).
 */
import type { ReportOverview, ReportSummary } from '@haru/contracts';

export type ReportCardView =
  | {
      kind: 'published';
      report: ReportSummary;
      progressRatio: number;
      nextReportDate: string | null;
    }
  | { kind: 'first-cycle'; progressRatio: number; nextReportDate: string | null }
  | { kind: 'generating'; periodStart: string; periodEnd: string }
  | { kind: 'deferred'; progressRatio: number; nextReportDate: string | null }
  | { kind: 'delayed' };

export type ReportCardOverviewInput = Pick<ReportOverview, 'latestReport'> & {
  currentCycle: Pick<
    ReportOverview['currentCycle'],
    'status' | 'progressRatio' | 'nextReportDate' | 'periodStart' | 'periodEnd'
  >;
};

export function resolveReportCardView(overview: ReportCardOverviewInput): ReportCardView {
  const { latestReport, currentCycle } = overview;
  const { progressRatio, nextReportDate } = currentCycle;

  switch (currentCycle.status) {
    case 'generating':
      return {
        kind: 'generating',
        periodStart: currentCycle.periodStart,
        periodEnd: currentCycle.periodEnd,
      };
    case 'deferred':
      return { kind: 'deferred', progressRatio, nextReportDate };
    case 'delayed':
      return { kind: 'delayed' };
    case 'in_progress':
    case 'published':
      return latestReport === null
        ? { kind: 'first-cycle', progressRatio, nextReportDate }
        : { kind: 'published', report: latestReport, progressRatio, nextReportDate };
  }
}

/**
 * 과거 리포트 목록 표시 규칙 — Spec §2.4 · AC-7-34 (`N7-35` ⓐ):
 * - 카드가 `latestReport` 를 보여 주면 `reportCount ≥ 2` 일 때만, 목록에서 그 리포트를 **제외**.
 * - 카드가 보여 주지 않으면(첫 주기·생성 중·이월·지연) `reportCount ≥ 1` 이면 표시 · 제외 0.
 * - 0건 = 미렌더.
 */
export interface PastReportListRule {
  visible: boolean;
  excludeId: string | null;
}

export function resolvePastReportListRule(
  view: ReportCardView,
  reportCount: number,
): PastReportListRule {
  if (view.kind === 'published') {
    return { visible: reportCount >= 2, excludeId: view.report.id };
  }
  return { visible: reportCount >= 1, excludeId: null };
}
