/**
 * 피드백 화면의 표시 상태 + 폴링 수명 (Stage 5 Plan §5.3 · Spec §2.3, AC-5-35).
 *
 * ```
 * AnalysisStatusView → useAnalysisDisplay → useSessionAnalysis (폴링) ─┐
 *                                         → useSessionDetail (completed 일 때만) ─┴→ selectAnalysisDisplayState
 * ```
 *
 * - 폴링 = `useSessionAnalysis` (15초 · `failed` 60초 · 종착 정지 · 화면이 가려지면 정지). 이 화면이 언마운트되면 정지.
 * - 분석 응답이 `completed` 일 때만 세션 상세를 **한 번** 조회해 녹음 삭제·만료를 판별한다 (`N5-12` ⓐ). 녹음이 없다고
 *   판별되면 그 세션은 다시 물어도 바뀌지 않으므로 폴링을 끈다 (`H5-1.6` ⑤).
 * - 사용자 재시도는 오류 화면(응답이 없을 때)의 `Try again` 뿐이다 — `failed` 에는 버튼이 없다 (`N5-15` ⓐ).
 */
import { useSessionAnalysis } from '../../../entities/analysis';
import { useSessionDetail } from '../../../entities/session';

import {
  isRecordingMissing,
  selectAnalysisDisplayState,
  type AnalysisDisplayState,
} from './analysisDisplayState';

export interface UseAnalysisDisplayResult {
  display: AnalysisDisplayState;
  retry: () => void;
}

export function useAnalysisDisplay(sessionId: string): UseAnalysisDisplayResult {
  // 폴링 정지 조건(녹음 없음)은 직전 렌더의 응답으로 정한다 — 두 query 를 같은 렌더에서 읽는다.
  const probe = useSessionAnalysis(sessionId, { enabled: false });
  const needsRecording = probe.analysis?.sessionStatus === 'completed';
  const detail = useSessionDetail(sessionId, { enabled: needsRecording });
  const recordingUploadStatus = !needsRecording
    ? undefined
    : detail.isPending
      ? undefined
      : (detail.session?.recording?.uploadStatus ?? null);

  const analysis = useSessionAnalysis(sessionId, {
    enabled: !isRecordingMissing(probe.analysis, recordingUploadStatus),
  });

  const display = selectAnalysisDisplayState({
    analysis: analysis.analysis,
    analysisError: analysis.isError
      ? { code: analysis.errorCode, offline: analysis.isOffline }
      : null,
    recordingUploadStatus,
  });

  return { display, retry: analysis.refetch };
}
