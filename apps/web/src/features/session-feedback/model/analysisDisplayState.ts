/**
 * 분석 응답 → 화면 표시 상태 (Stage 5 Spec §2.3 표 · ARCHITECTURE §10.2 매핑 · Plan §8). 순수 함수 — 시계·요청 없음.
 *
 * | 입력 | 표시 상태 |
 * |---|---|
 * | 아직 응답 없음 | `loading` |
 * | `analyzing` | `pending` |
 * | `completed` + 녹음 `deleted` · `expired` | `not-available` (`no-recording`, `N5-12` ⓐ — enum 변경 0) |
 * | `completed` + 그 밖 (업로드 대기) | `pending` (녹음 상태를 아직 모르면 `loading`) |
 * | `analyzed` + `excluded_low_quality` | `low-quality` (`text` 는 있을 때만) |
 * | `analyzed` + 그 밖 | `analyzed` (`text: null` 이면 아무것도 그리지 않는다 — AC-5-37) |
 * | `failed` | `failed` (worker 재시도 중 — 사용자 재시도 없음, `N5-15` ⓐ) |
 * | `ANALYSIS_NOT_AVAILABLE` · 응답 `mode=conversation_only` | `not-available` (`conversation`) |
 * | `RESOURCE_NOT_FOUND` · `FORBIDDEN` | `not-found` (Go home) |
 * | 네트워크 실패 | `offline` (Try again) |
 * | 그 밖의 오류 | `error` (Try again) |
 *
 * 이미 받은 응답이 있으면 **폴링 중 일시 오류는 표시를 바꾸지 않는다** — 마지막 응답을 계속 보여 준다 (다음 폴링이 다시
 * 묻는다, `selectAnalysisRefetchInterval`). 오류 화면은 받은 응답이 없을 때만이다.
 *
 * `text` 는 응답 값 그대로 넘긴다 — 가공 · 대체 문구 0. 빈 문자열은 그릴 문구가 없는 것으로 본다.
 */
import type { ErrorCode, SessionAnalysisStatus, UploadStatus } from '@haru/contracts';

export type AnalysisDisplayState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'pending' }
  | { readonly kind: 'analyzed'; readonly text: string | null }
  | { readonly kind: 'low-quality'; readonly text: string | null }
  | { readonly kind: 'failed' }
  | { readonly kind: 'not-available'; readonly reason: 'conversation' | 'no-recording' }
  | { readonly kind: 'not-found'; readonly code: ErrorCode }
  | { readonly kind: 'offline' }
  | { readonly kind: 'error'; readonly code: ErrorCode | undefined };

export type AnalysisDisplayKind = AnalysisDisplayState['kind'];

/** 분석할 녹음이 서버에 없다 (`OAQ-17` — 14일 로컬 삭제 · 보관 만료). */
const MISSING_RECORDING: ReadonlySet<UploadStatus> = new Set(['deleted', 'expired']);

const NOT_FOUND_CODES: ReadonlySet<ErrorCode> = new Set(['RESOURCE_NOT_FOUND', 'FORBIDDEN']);

export interface AnalysisDisplayInput {
  readonly analysis: SessionAnalysisStatus | undefined;
  /** 분석 조회가 실패했을 때만 — `null` = 실패 없음. */
  readonly analysisError: {
    readonly code: ErrorCode | undefined;
    readonly offline: boolean;
  } | null;
  /**
   * 세션 상세의 녹음 업로드 상태 — 분석 응답이 `completed` 일 때만 의미가 있다.
   * `undefined` = 아직 모른다(조회 중) · `null` = 녹음 행 없음 또는 상세 조회 실패(판별 불가 → 대기로 본다).
   */
  readonly recordingUploadStatus: UploadStatus | null | undefined;
}

/** `completed` 응답에서 녹음이 없다고 판별됐는가 — 폴링을 멈추는 조건이기도 하다. */
export function isRecordingMissing(
  analysis: SessionAnalysisStatus | undefined,
  recordingUploadStatus: UploadStatus | null | undefined,
): boolean {
  return (
    analysis?.sessionStatus === 'completed' &&
    recordingUploadStatus !== null &&
    recordingUploadStatus !== undefined &&
    MISSING_RECORDING.has(recordingUploadStatus)
  );
}

function feedbackText(analysis: SessionAnalysisStatus): string | null {
  const text = analysis.shortFeedback?.text ?? null;
  return text === null || text === '' ? null : text;
}

export function selectAnalysisDisplayState(input: AnalysisDisplayInput): AnalysisDisplayState {
  const { analysis, analysisError, recordingUploadStatus } = input;

  if (analysis === undefined) {
    if (analysisError === null) return { kind: 'loading' };
    if (analysisError.offline) return { kind: 'offline' };
    if (analysisError.code === 'ANALYSIS_NOT_AVAILABLE') {
      return { kind: 'not-available', reason: 'conversation' };
    }
    if (analysisError.code !== undefined && NOT_FOUND_CODES.has(analysisError.code)) {
      return { kind: 'not-found', code: analysisError.code };
    }
    return { kind: 'error', code: analysisError.code };
  }

  if (analysis.mode === 'conversation_only') {
    return { kind: 'not-available', reason: 'conversation' };
  }

  switch (analysis.sessionStatus) {
    case 'analyzing':
      return { kind: 'pending' };
    case 'failed':
      return { kind: 'failed' };
    case 'analyzed':
      return analysis.outcome === 'excluded_low_quality'
        ? { kind: 'low-quality', text: feedbackText(analysis) }
        : { kind: 'analyzed', text: feedbackText(analysis) };
    case 'completed':
      if (isRecordingMissing(analysis, recordingUploadStatus)) {
        return { kind: 'not-available', reason: 'no-recording' };
      }
      return recordingUploadStatus === undefined ? { kind: 'loading' } : { kind: 'pending' };
  }
}
