/**
 * `analysisApi` — 세션 분석 상태 · 짧은 피드백 조회 (`docs/API_CONTRACTS.md` §3.11 · §4 Stage 5, FR-13 · FR-14).
 *
 * | 호출 | endpoint | Idempotency-Key | 주요 오류 |
 * |---|---|---|---|
 * | `getStatus` | `GET /v1/sessions/:sessionId/analysis` | — | `ANALYSIS_NOT_AVAILABLE`(대화 전용 · 완료 전) · `RESOURCE_NOT_FOUND` · `FORBIDDEN` |
 *
 * 호출 경로: `Component → useSessionAnalysis → analysisApi.getStatus → MockAnalysisApi | HttpAnalysisApi`.
 * 분석 재시도는 worker 행위다 — 클라이언트 재시도 요청 메서드는 없다 (`N5-15` ⓐ).
 * 하이라이트 클립 메서드는 Stage 7 이 추가한다 (`N5-22`).
 */
import type { SessionAnalysisStatus } from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface AnalysisApi {
  getStatus(
    request: { sessionId: string },
    options?: ApiRequestOptions,
  ): Promise<SessionAnalysisStatus>;
}
