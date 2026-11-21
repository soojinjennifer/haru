import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { DeletionRequestStatusSchema, DeletionScopeSchema } from '../enums/deletion.js';

/**
 * 삭제 요청 — Stage 8 Rev 12 `C8-3` · `C8-4` (`docs/API_CONTRACTS.md` §3.13, Plan §7).
 *
 * 응답으로 쓰는 endpoint:
 * - `DELETE /v1/sessions/:sessionId/recording` (IK) → `scope='session_recording'` · `sessionId` = 대상 세션
 * - `POST /v1/data-deletion-requests` (IK) → `scope='all_data'`
 * - `GET /v1/data-deletion-requests/:id` → 진행 상태 조회 (폴링)
 * - `DELETE /v1/me` (IK) → `scope='account'` (탈퇴, `N8-02` ⓐ)
 *
 * 상태 전이(서버 소유): `received → processing → completed | failed` (`P8-BIP-02`).
 *
 * 불변식 (parse 로 강제한다 — Backend 가 같은 규칙을 지킨다):
 * - `sessionId` 는 `session_recording` 일 때만 값이 있고 그 밖의 범위에서는 `null` 이다
 * - `completedAt` 은 `completed` 면 값이 있고, 진행 중(`received` · `processing`)이면 `null` 이다.
 *   `failed` 는 둘 다 허용한다 (실패 시각 기록 여부는 Backend 재량)
 *
 * PII 없음 — 아이 이름 · 메모 · 경로를 담지 않는다 (Plan §5.5).
 */
export const DeletionRequestSchema = z
  .object({
    id: IdSchema,
    scope: DeletionScopeSchema,
    sessionId: IdSchema.nullable(),
    status: DeletionRequestStatusSchema,
    requestedAt: IsoDateTimeSchema,
    completedAt: IsoDateTimeSchema.nullable(),
  })
  .superRefine((value, ctx) => {
    if ((value.scope === 'session_recording') !== (value.sessionId !== null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['sessionId'],
        message: 'sessionId is required for session_recording and must be null otherwise.',
      });
    }
    if (value.status === 'completed' && value.completedAt === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['completedAt'],
        message: 'completedAt is required when status is completed.',
      });
    }
    if (
      (value.status === 'received' || value.status === 'processing') &&
      value.completedAt !== null
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['completedAt'],
        message: 'completedAt must be null while the request is in progress.',
      });
    }
  });

export type DeletionRequest = z.infer<typeof DeletionRequestSchema>;

/** 진행 중 상태 — 폴링 대상이며 이 동안 계정 쓰기가 막힌다 (`ACCOUNT_DELETION_PENDING`, `C8-5`). */
export const IN_PROGRESS_DELETION_STATUSES = ['received', 'processing'] as const;

/** 진행 중(`received` · `processing`) 인지. */
export function isDeletionInProgress(request: Pick<DeletionRequest, 'status'>): boolean {
  return (IN_PROGRESS_DELETION_STATUSES as readonly string[]).includes(request.status);
}

/**
 * `POST /v1/data-deletion-requests` 요청 — 전체 데이터 삭제 (아동 데이터 삭제 · 계정 유지, `N8-02` ⓐ).
 *
 * - `scope` 는 `all_data` 만 받는다. 세션 녹음 삭제는 `DELETE /v1/sessions/:sessionId/recording`,
 *   탈퇴는 `DELETE /v1/me` 이다
 * - `confirmation` 은 literal `true` — 확인은 ConfirmDialog 1회로 받고 문구 입력은 요구하지 않는다 (`N8-08` ⓐ)
 * - `.strict()` — 그 밖의 필드(아이 이름 · 메모 등)가 섞이면 parse 가 실패한다 (Plan §5.5 PII 0)
 */
export const CreateDeletionRequestSchema = z
  .object({
    scope: z.literal('all_data'),
    confirmation: z.literal(true),
  })
  .strict();

export type CreateDeletionRequest = z.infer<typeof CreateDeletionRequestSchema>;

/**
 * `DELETE /v1/me` 요청 — 탈퇴 (계정 + 전체 데이터 삭제, `N8-02` ⓐ). 응답은 `DeletionRequest`(`scope='account'`).
 * `confirmation` literal `true` · `.strict()` — 위와 같은 이유.
 */
export const DeleteAccountRequestSchema = z
  .object({
    confirmation: z.literal(true),
  })
  .strict();

export type DeleteAccountRequest = z.infer<typeof DeleteAccountRequestSchema>;
