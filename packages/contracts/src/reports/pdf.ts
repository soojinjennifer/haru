import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';

/**
 * 리포트 PDF 상태 — Stage 7 Plan §7 **C7-6** · **C7-6a** (`N7-24`), PRD FR-17.
 *
 * | 호출 | endpoint | 비고 |
 * |---|---|---|
 * | 요청 | `POST /v1/reports/:reportId/pdf` (**Idempotency-Key 필수**) | 같은 리포트 재요청 = 같은 작업(서버 멱등, `P7-BIP-09`) |
 * | 조회 | `GET /v1/reports/:reportId/pdf` | 생성 중 = **200 `generating`** — error code 가 아니다 |
 *
 * - `PDF_NOT_READY` 는 **다운로드 URL 을 직접 요청**했는데 아직 준비 전일 때만 쓴다 (이 두 endpoint 는 쓰지 않는다).
 * - `ready` 이면 `downloadUrl`·`expiresAt`·`fileName` **모두 필수** (refine). 그 밖의 상태는 `null` 허용.
 * - `downloadUrl` = 만료가 있는 private signed URL · `fileName` 은 아이 이름을 포함할 수 있다 → 둘 다 로그 금지 (Plan §5.6).
 */
export const REPORT_PDF_STATUSES = ['queued', 'generating', 'ready', 'failed'] as const;

export const ReportPdfStatusValueSchema = z.enum(REPORT_PDF_STATUSES);

export type ReportPdfStatusValue = z.infer<typeof ReportPdfStatusValueSchema>;

export const ReportPdfStatusSchema = z
  .object({
    status: ReportPdfStatusValueSchema,
    downloadUrl: z.url().nullable(),
    expiresAt: IsoDateTimeSchema.nullable(),
    fileName: z.string().min(1).nullable(),
  })
  .refine(
    (value) =>
      value.status !== 'ready' ||
      (value.downloadUrl !== null && value.expiresAt !== null && value.fileName !== null),
    { message: 'A ready PDF needs downloadUrl, expiresAt and fileName.', path: ['status'] },
  );

export type ReportPdfStatus = z.infer<typeof ReportPdfStatusSchema>;

/** PDF 상태 폴링 간격 (ms) — C7-6a. Backend 생성 시간 요구(`P7-BIP-09` ≤ 60초)와 짝. */
export const REPORT_PDF_POLL_INTERVAL_MS = 2_000;

/** PDF 상태 폴링 상한 (ms) — 넘으면 화면은 지연 안내로 폴링을 멈춘다 (`pdf-timeout`). */
export const REPORT_PDF_POLL_TIMEOUT_MS = 60_000;
