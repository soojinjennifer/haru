/**
 * `dataManagementApi` — 데이터 관리 · 삭제 (Stage 8 Rev 12 `C8-1` · `C8-2` · `C8-3` · `C8-9`, `docs/API_CONTRACTS.md` §3.13 · §4 Stage 8).
 *
 * | 호출 | endpoint | IK | 주요 오류 |
 * |---|---|---|---|
 * | `summary` | `GET /v1/data-management` | — | `AUTH_REQUIRED` |
 * | `listRecordingSessions` | `GET /v1/children/:childId/sessions?hasRecording=true&limit=&cursor=` | — | `CHILD_NOT_FOUND` · `VALIDATION_FAILED`(`cursor`) |
 * | `deleteSessionRecording` | `DELETE /v1/sessions/:sessionId/recording` | **필수** | `RECORDING_DELETED`(`details.reason`) · `RESOURCE_NOT_FOUND` · `ACCOUNT_DELETION_PENDING` |
 * | `createDeletionRequest` | `POST /v1/data-deletion-requests` | **필수** | `DELETION_ALREADY_REQUESTED` |
 * | `getDeletionRequest` | `GET /v1/data-deletion-requests/:id` | — | `RESOURCE_NOT_FOUND` |
 *
 * 호출 경로: `Component → entities/data-management · features/* hook → dataManagementApi.* → MockDataManagementApi | HttpDataManagementApi`.
 *
 * - 세션 녹음 삭제는 **서버 확정 응답 후** 로컬 청크 삭제 + UploadQueue 취소다 (rules/architecture §7) — 그 처리는 feature 가 한다
 * - 삭제 요청은 SessionOutbox 대상이 아니다 — 오프라인이면 보내지 않고 안내한다 (Plan §5.3)
 * - 동의 이력(`GET /v1/consents`)은 없다 (`N8-06` ⓑ)
 */
import type {
  CreateDeletionRequest,
  CursorPageRequestInput,
  DataManagementSummary,
  DeletionRequest,
  ListSessionsResponse,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';
import type { ApiMutationOptions } from './options';

export interface DataManagementApi {
  summary(options?: ApiRequestOptions): Promise<DataManagementSummary>;
  /** 녹음이 있는 세션만 (`hasRecording=true` 고정) — `deleted` · `expired` 행 포함 (`Q8-07` ⓐ). */
  listRecordingSessions(
    request: { childId: string; query?: CursorPageRequestInput },
    options?: ApiRequestOptions,
  ): Promise<ListSessionsResponse>;
  /** `Idempotency-Key` **필수**. 응답 = `DeletionRequest`(`scope='session_recording'`, 즉시 `completed`). */
  deleteSessionRecording(
    request: { sessionId: string },
    options: ApiMutationOptions,
  ): Promise<DeletionRequest>;
  /** 전체 데이터 삭제 (`scope='all_data'`). `Idempotency-Key` **필수**. */
  createDeletionRequest(
    request: { body: CreateDeletionRequest },
    options: ApiMutationOptions,
  ): Promise<DeletionRequest>;
  /** 진행 상태 폴링 (`received` · `processing` 동안). */
  getDeletionRequest(
    request: { requestId: string },
    options?: ApiRequestOptions,
  ): Promise<DeletionRequest>;
}
