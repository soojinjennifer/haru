/**
 * 전체 삭제 상태 표면 판정 — Stage 8 Plan §5.3 상태 머신의 **표시 부분** · Spec §2.5 (`C13-S8-5`). 순수 함수.
 *
 * ```
 * idle → confirming → submitting → requested(received | processing) → completed
 *                               ↘ (POST 실패 · 오프라인 — 요청 버튼 위 InlineAlert, 이 함수 밖)
 *                                 requested → failed (서버 status = failed)
 * ```
 *
 * | 입력 | 표면 |
 * |---|---|
 * | 추적 중인 요청 없음 · POST 가 `DELETION_ALREADY_REQUESTED` | `progress` (진행 중으로 표시 — 오류 아님, AC-8-29) |
 * | 추적 중인 요청 없음 | `none` |
 * | `received` · `processing` | `progress` |
 * | `failed` | `failed` (*Try again* = ConfirmDialog ② 재진입) |
 * | `completed` | `completed` (이 화면에 머물지 않는다 — 로컬 정리 → Guard, `N8-10` ⓐ) |
 *
 * 추적 대상 = 이 화면에서 만든 요청 > 요약의 진행 중 요청 (Spec §2.5 "다시 들어오면 summary 의 `activeDeletionRequest`").
 * 상태 값 = 폴링 응답 > 생성 응답 · 요약 값.
 */
import type { DeletionRequest } from '@haru/contracts';

export type DeletionSurface = 'none' | 'progress' | 'failed' | 'completed';

export function trackedDeletionRequest(
  created: DeletionRequest | null,
  active: DeletionRequest | null,
  polled: DeletionRequest | undefined,
): DeletionRequest | null {
  const base = created ?? active;
  if (base === null) return null;
  return polled !== undefined && polled.id === base.id ? polled : base;
}

export function resolveDeletionSurface(
  tracked: DeletionRequest | null,
  alreadyRequested: boolean,
): DeletionSurface {
  if (tracked === null) return alreadyRequested ? 'progress' : 'none';
  switch (tracked.status) {
    case 'received':
    case 'processing':
      return 'progress';
    case 'failed':
      return 'failed';
    case 'completed':
      return 'completed';
  }
}
