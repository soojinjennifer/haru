import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { UploadStatusSchema } from '../enums/upload-status.js';

/**
 * `recordingApi.status` 응답 — `docs/API_CONTRACTS.md` §3.9 (Rev 8), Stage 4 Plan §7.2.
 *
 * **서버가 본 사실만** 담는다. 클라이언트 업로드 큐의 내부 상태는 넣지 않는다.
 * 폐기(`Discard`, `D4-13`)된 녹음은 `uploadStatus = 'deleted'` 이며 사유는 담기지 않는다 (`N4-30`).
 *
 * §3.9 의 검토 후보 2건(`sessionStatus` · 업로드 진행률)은 `S4-B` 에서 넣지 않았다 —
 * 필요 여부는 `S4-C`/`S4-E` 가 판정한다.
 *
 * Errors: `RESOURCE_NOT_FOUND` · `RECORDING_DELETED` · `FORBIDDEN`.
 */
export const RecordingStatusSchema = z.object({
  recordingId: IdSchema,
  uploadStatus: UploadStatusSchema,
  partCount: z.int().min(0),
  /** 원본 90일 만료 시각. `deleted`/`expired` 면 `null`. */
  expiresAt: IsoDateTimeSchema.nullable(),
  deletedAt: IsoDateTimeSchema.nullable().optional(),
});

export type RecordingStatus = z.infer<typeof RecordingStatusSchema>;
