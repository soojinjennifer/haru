import { z } from 'zod';

/**
 * 삭제 요청 범위 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-21 · §7.8.
 *
 * - `session_recording` — 세션 1건의 원본 오디오 + 하이라이트 클립 (전사·지표·관찰은 유지, `N8-03` ⓐ)
 * - `all_data` — 아동 데이터 전체 삭제, 계정 유지
 * - `account` — 탈퇴 = 계정 + 전체 데이터 삭제 (Rev 12 `C8-4`, `N8-02` ⓐ — `D8-1`)
 */
export const DeletionScopeSchema = z.enum(['session_recording', 'all_data', 'account']);

export type DeletionScope = z.infer<typeof DeletionScopeSchema>;

/**
 * 삭제 요청 처리 상태 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-21.
 */
export const DeletionRequestStatusSchema = z.enum([
  'received',
  'processing',
  'completed',
  'failed',
]);

export type DeletionRequestStatus = z.infer<typeof DeletionRequestStatusSchema>;
