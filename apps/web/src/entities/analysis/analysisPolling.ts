/**
 * 분석 상태 폴링 간격 — Stage 5 Plan §5.3 (`N5-14`, `D5-4`). 순수 함수 — 시계·타이머 없음.
 *
 * | 마지막 결과 | 다음 조회 |
 * |---|---|
 * | `analyzed` (종착) | 정지 (`false`) |
 * | `ANALYSIS_NOT_AVAILABLE` · `RESOURCE_NOT_FOUND` · `FORBIDDEN` (종착) | 정지 |
 * | `failed` (worker 재시도 대상) | 60초 |
 * | `analyzing` · `completed` · 아직 결과 없음 · 일시 오류(네트워크 · 5xx) | 15초 |
 *
 * 24h 는 클라이언트가 세지 않는다 — 문구로만 안내한다 (서버 SLA, `P5-BIP-11`).
 * 화면이 보이는 동안만 폴링하는 것은 query 옵션(`refetchIntervalInBackground: false`)과 호출자(`enabled`)가 정한다.
 */
import type { ErrorCode, SessionAnalysisStatus } from '@haru/contracts';

export const ANALYSIS_POLL_INTERVAL_MS = 15_000;
export const ANALYSIS_FAILED_POLL_INTERVAL_MS = 60_000;

/** 다시 물어도 답이 바뀌지 않는 오류. */
const TERMINAL_ERROR_CODES: ReadonlySet<ErrorCode> = new Set([
  'ANALYSIS_NOT_AVAILABLE',
  'RESOURCE_NOT_FOUND',
  'FORBIDDEN',
]);

export function selectAnalysisRefetchInterval(
  data: SessionAnalysisStatus | undefined,
  errorCode: ErrorCode | undefined,
): number | false {
  if (errorCode !== undefined && TERMINAL_ERROR_CODES.has(errorCode)) return false;
  if (data?.sessionStatus === 'analyzed') return false;
  if (data?.sessionStatus === 'failed') return ANALYSIS_FAILED_POLL_INTERVAL_MS;
  return ANALYSIS_POLL_INTERVAL_MS;
}
