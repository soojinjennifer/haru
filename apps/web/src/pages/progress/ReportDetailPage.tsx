import type { ReportHighlightClip } from '@haru/contracts';
import { useParams } from 'react-router';

import { HighlightClipList } from '../../features/highlight-clip-player';
import { ReportDetailView } from '../../features/report-detail';
import { ReportPdfAction } from '../../features/report-pdf';

/**
 * `/progress/reports/:reportId` — 4주 리포트 상세 (Stage 7 `S7-D`, `C13-S7-1` Spec §2.3).
 *
 * Page 는 **Composition 만** 한다 (`rules/frontend.md` §3) — route param 전달 · slot 조립.
 * ⑥ 하이라이트 클립(`clipList`) = `S7-E` `HighlightClipList` (재생 처리는 feature 의 상태 머신이 소유).
 * ⑦ PDF(`pdfAction`) = `S7-F` `ReportPdfAction` — Progress 카드와 같은 컴포넌트 · 같은 기록(`N7-24`).
 */
function renderClipList(clips: readonly ReportHighlightClip[]) {
  return <HighlightClipList clips={clips} />;
}

function renderPdfAction(reportId: string) {
  return <ReportPdfAction reportId={reportId} />;
}

export function ReportDetailPage() {
  const { reportId = '' } = useParams();
  return (
    <ReportDetailView reportId={reportId} clipList={renderClipList} pdfAction={renderPdfAction} />
  );
}
