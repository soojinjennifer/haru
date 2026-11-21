/**
 * 전체 삭제 진행 상태 폴링 간격 · 상한 — Stage 8 Plan §5.2 (`useDeletionRequest` — 간격 RECOMMENDED 5s · 화면 이탈 시 중지) ·
 * AC-8-27 "폴링 상한 · 종료" · Spec §6.1 (화면에 보이는 동안만). 순수 함수 — 시계 · 타이머 없음.
 *
 * | 마지막 결과 | 다음 조회 |
 * |---|---|
 * | `completed` · `failed` (종착) | 정지 (`false`) |
 * | `RESOURCE_NOT_FOUND` · `FORBIDDEN` (다시 물어도 답이 같다) | 정지 |
 * | 조회 횟수 ≥ `DELETION_POLL_MAX_READS` | 정지 — 알림은 진행 중 그대로. 화면에 다시 들어오면 요약의 진행 요청으로 다시 시작한다 (Spec §2.5) |
 * | `received` · `processing` · 아직 결과 없음 · 일시 오류(네트워크 · 5xx) | `DELETION_POLL_INTERVAL_MS` |
 *
 * 상한 값 = 5초 × 60회 = 5분 — **가값 `P-42`** (provisional, Plan rev 2.2 `VG8-C-10` · `D8-2` ④ 가값 유지). 서버 SLA 는 클라이언트가 세지 않는다
 * (문구에 기한 수치 0 — `N8-04` ⓐ).
 */
import type { DeletionRequest, ErrorCode } from '@haru/contracts';
import { isDeletionInProgress } from '@haru/contracts';

/** provisional `P-42` */
export const DELETION_POLL_INTERVAL_MS = 5_000;
/** provisional `P-42` — 상한 후 완료는 감시자가 앱 시작 · 화면 복귀 때 1회 조회로 잡는다 (`N8-31` ⓐ). */
export const DELETION_POLL_MAX_READS = 60;

const TERMINAL_ERROR_CODES: ReadonlySet<ErrorCode> = new Set(['RESOURCE_NOT_FOUND', 'FORBIDDEN']);

export function selectDeletionRefetchInterval(
  data: Pick<DeletionRequest, 'status'> | undefined,
  errorCode: ErrorCode | undefined,
  reads: number,
): number | false {
  if (errorCode !== undefined && TERMINAL_ERROR_CODES.has(errorCode)) return false;
  if (data !== undefined && !isDeletionInProgress(data)) return false;
  if (reads >= DELETION_POLL_MAX_READS) return false;
  return DELETION_POLL_INTERVAL_MS;
}
