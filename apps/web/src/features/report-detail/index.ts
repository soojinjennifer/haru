/**
 * `features/report-detail` 공개 진입점 — Stage 7 `S7-D` (`/progress/reports/:reportId`, `C13-S7-1` · `C13-S7-7`).
 * 클립 플레이어(`S7-E`) · PDF(`S7-F`) 는 이 feature 가 import 하지 않는다 — page 가 slot 으로 꽂는다.
 */
export { reportDetailCopy } from './copy';
export { ReportDetailView } from './ui/ReportDetailView';
export type { ReportDetailViewProps } from './ui/ReportDetailView';
export {
  checkTrendRows,
  dialogueRows,
  evidenceRows,
  growthSummary,
  personaTimeline,
  previousDiamondValues,
  quoteSource,
} from './model/reportDetailView';
