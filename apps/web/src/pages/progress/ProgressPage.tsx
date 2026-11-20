import { ProgressOverview } from '../../features/progress-overview';
import { ReportPdfAction } from '../../features/report-pdf';

/**
 * `/progress` — Stage 7 `S7-C` (Figma `31:102` 주간 관찰 + `110:835` 4주 리포트 카드, `D7-1`).
 *
 * Stage 3 의 준비 안내(`EmptyState` 1개 — `D-2`)를 **대체**했다 (AC-7-03).
 *
 * Page 는 **Composition 만** 한다 (`rules/frontend.md` §3) — API 호출·상태 전이·Mock 데이터 0.
 * 4주 리포트 카드의 PDF 버튼은 `features/report-pdf` 를 여기서 slot(`pdfAction`)으로 꽂는다 — `S7-F`
 * (feature 간 import 0 — Plan §5.1). 상세 ⑦ 과 같은 컴포넌트 · 같은 기록(`reportKeys.pdf`)이다 (`N7-24`).
 */
function renderPdfAction(reportId: string) {
  return <ReportPdfAction reportId={reportId} />;
}

export function ProgressPage() {
  return <ProgressOverview pdfAction={renderPdfAction} />;
}
