/**
 * `reports` · `report-pdf` scenario 그룹 — Stage 7 Plan §8 rev 2 · `docs/API_CONTRACTS.md` §5.3 · §5.4 (Rev 11).
 *
 * `reports` 그룹의 key 는 **상태 seed** 다 (`reportState.ts` 의 `seedReportState` 표).
 * `report-pdf` 그룹은 PDF 작업 진행 방식과 **파일 공유 포트**(`share-*`)를 정한다 (`MockReportPdfApi` · `MockFileSharePort`).
 */
import type { ScenarioGroupDefinition } from '../scenarios';

export const REPORT_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
  'report-eligible',
  'report-not-eligible',
  'report-deferred',
  'report-deferred-first',
  'report-delayed',
  'report-published-unviewed',
  'report-persona-unchanged',
  'report-no-previous',
] as const;

export type ReportScenarioKey = (typeof REPORT_SCENARIO_KEYS)[number];

export const reportScenarioGroup: ScenarioGroupDefinition<ReportScenarioKey> = {
  group: 'reports',
  keys: REPORT_SCENARIO_KEYS,
  defaultKey: 'success',
};

export const REPORT_PDF_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
  'pdf-generating',
  'pdf-failed',
  'pdf-timeout',
  'share-cancelled',
  'share-unsupported',
] as const;

export type ReportPdfScenarioKey = (typeof REPORT_PDF_SCENARIO_KEYS)[number];

export const reportPdfScenarioGroup: ScenarioGroupDefinition<ReportPdfScenarioKey> = {
  group: 'report-pdf',
  keys: REPORT_PDF_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 `loading` "1.5–3s". 실제 대기는 주입 timer 가 정한다. */
export const REPORT_LOADING_DELAY_MS = 1_500;

/** `pdf-generating` — GET `generating` 횟수 (그 다음 GET 이 `ready`). */
export const MOCK_PDF_GENERATING_READS = 3;
