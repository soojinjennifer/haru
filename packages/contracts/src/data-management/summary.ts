import { z } from 'zod';

import { DeletionRequestSchema, isDeletionInProgress } from './deletion-request.js';

/**
 * `GET /v1/data-management` 응답 — 데이터 관리 요약 (Stage 8 Rev 12 `C8-1`, `docs/API_CONTRACTS.md` §3.13).
 *
 * - `retentionPolicy.rawAudioDays` — **서버 정책 값**이다. 화면은 이 값으로만 보관 문장을 만든다
 *   (`90` 리터럴 금지 — AC-8-15, `P8-BIP-04`)
 * - `recordingsCount` — **삭제 가능한 녹음 수** = `hasRecording=true` 목록 행 중 `recording.uploadStatus` 가
 *   `uploaded` · `pending` · `failed` 인 행 수 (*Delete* 버튼이 있는 행). `deleted` · `expired` 행은 목록에는 남지만
 *   (`Q8-07` ⓐ) **세지 않는다** (`VG8-A-04` — Spec §2.2). 0 이면 화면은 *No recordings* 이며, 그때도 목록에는
 *   `deleted` · `expired` 행이 있을 수 있다 (빈 상태는 행 0 일 때만)
 * - `activeDeletionRequest` — 진행 중(`received` · `processing`)인 `all_data` · `account` 요청 1건 또는 `null`.
 *   설계 초안의 `pendingDeletionRequests[]` 를 단일 nullable 로 줄였다 — 진행 중 요청은 caregiver 당 1건이다
 *   (`DELETION_ALREADY_REQUESTED`). 세션 녹음 삭제(`session_recording`)는 즉시 처리라 여기에 오지 않는다
 */
export const RetentionPolicySchema = z.object({
  rawAudioDays: z.int().positive(),
});

export type RetentionPolicy = z.infer<typeof RetentionPolicySchema>;

export const DataManagementSummarySchema = z
  .object({
    retentionPolicy: RetentionPolicySchema,
    recordingsCount: z.int().min(0),
    activeDeletionRequest: DeletionRequestSchema.nullable(),
  })
  .superRefine((value, ctx) => {
    const active = value.activeDeletionRequest;
    if (active === null) return;
    if (active.scope === 'session_recording') {
      ctx.addIssue({
        code: 'custom',
        path: ['activeDeletionRequest', 'scope'],
        message: 'Only all_data or account requests can be active.',
      });
    }
    if (!isDeletionInProgress(active)) {
      ctx.addIssue({
        code: 'custom',
        path: ['activeDeletionRequest', 'status'],
        message: 'An active deletion request must be received or processing.',
      });
    }
  });

export type DataManagementSummary = z.infer<typeof DataManagementSummarySchema>;
