import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import {
  RECORDING_CONTAINER_BASE_MIME_TYPE,
  type RecordingContainer,
  RecordingContainerSchema,
} from '../enums/recording-container.js';
import { SessionStatusSchema } from '../enums/session-status.js';
import { UploadStatusSchema } from '../enums/upload-status.js';
import { MAX_RECORDED_SECONDS } from '../rules/recording-limits.js';

/**
 * Recording Upload Contract — `docs/API_CONTRACTS.md` §3.3, §4 Stage 4.
 *
 * - `POST /v1/sessions/:sessionId/recordings` (IK, CG) → `RecordingUploadInit*`
 * - `POST /v1/recordings/:recordingId/upload-tokens` (IK, CG) → `RefreshUploadTokens*`
 * - `POST /v1/recordings/:recordingId/complete` (IK, CG) → `RecordingUploadComplete*`
 *
 * Errors: `CONSENT_REQUIRED` · `RECORDING_NOT_ALLOWED_FOR_MODE` · `UPLOAD_TOKEN_EXPIRED` ·
 * `RECORDING_INCOMPLETE` · `RECORDING_DELETED` · `SESSION_INVALID_TRANSITION` (전부 기존 코드).
 *
 * 업로드 진행 중인 클라이언트 큐의 내부 상태는 이 패키지에 두지 않는다 —
 * `apps/web/src/features/recording` 소관이다 (§2.2 `UploadStatus` 행).
 */

/**
 * `partNo` 상한 — **CONFIRMED (사용자 결정 2026-10-14, `D4-24`)**. 20 유지.
 *
 * ⚠️ **part 는 연속 녹음 구간(`MediaRecorder` 세션 1개)이며 timeslice 청크가 아니다.**
 * 30분 세션의 청크는 약 1766개(timeslice 1000ms)다. 청크를 part 로 보내면 즉시 이 상한에 막힌다.
 * 정상 녹음은 part 1개이고, 크래시·인터럽션으로 녹음을 다시 시작할 때마다 1개씩 늘어난다
 * (`docs/ARCHITECTURE.md` §10.5-3, `docs/qa/stage-4a-spike-report.md` §9).
 */
export const RECORDING_PART_NO_MAX = 20;

/** part 1개의 최대 바이트 (100 MiB) — §3.3 스케치. */
export const RECORDING_PART_BYTES_MAX = 100 * 1024 * 1024;

/** `totalDurationSeconds` 가 `MAX_RECORDED_SECONDS` 를 넘을 수 있는 여유 (자동 종료 지연). */
export const RECORDING_TOTAL_DURATION_GRACE_SECONDS = 60;

/** 업로드 무결성 해시 — 소문자 hex 64자 (AC-4-16). */
export const Sha256HexSchema = z.string().regex(/^[a-f0-9]{64}$/);

export const RecordingPartNoSchema = z.int().min(1).max(RECORDING_PART_NO_MAX);

/**
 * MIME type 문자열에서 base type 을 꺼낸다 — `;` 앞을 잘라 `trim()` 한다 (`D4-23`).
 * 대소문자는 바꾸지 않는다 (결정 범위 밖의 정규화를 하지 않는다).
 *
 * `'audio/mp4; codecs=mp4a.40.2'` → `'audio/mp4'`
 */
export function recordingMimeBaseType(mimeType: string): string {
  const [base = ''] = mimeType.split(';');
  return base.trim();
}

/** base type 이 허용 집합에 들어 있으면 그 컨테이너를, 아니면 `null` 을 돌려준다. */
export function recordingContainerForMimeType(mimeType: string): RecordingContainer | null {
  const base = recordingMimeBaseType(mimeType);
  const match = RecordingContainerSchema.options.find(
    (container) => RECORDING_CONTAINER_BASE_MIME_TYPE[container] === base,
  );
  return match ?? null;
}

/**
 * 브라우저 원문 MIME type — **정규화하지 않고 그대로 보관**한다 (`D4-23`).
 * 검증은 enum 이 아니라 base type 검사다: `audio/webm` | `audio/mp4`.
 * Backend 는 원문을 보관해 재생·분석 시 코덱 정보를 잃지 않는다.
 */
export const RecordingMimeTypeSchema = z
  .string()
  .min(1)
  .refine((value) => recordingContainerForMimeType(value) !== null, {
    message: 'mimeType base type must be audio/webm or audio/mp4.',
  });

/**
 * 업로드할 part 1개 — `RecordingPart` (`D4-23` · `D4-24`).
 * `container` 는 `mimeType` 의 base type 과 일치해야 한다 (`webm` ↔ `audio/webm`, `mp4` ↔ `audio/mp4`).
 */
export const RecordingPartSchema = z
  .object({
    partNo: RecordingPartNoSchema,
    mimeType: RecordingMimeTypeSchema,
    container: RecordingContainerSchema,
    bytes: z.int().positive().max(RECORDING_PART_BYTES_MAX),
  })
  .superRefine((part, ctx) => {
    const container = recordingContainerForMimeType(part.mimeType);
    if (container === null || container === part.container) return;
    ctx.addIssue({
      code: 'custom',
      path: ['container'],
      message: 'container must match the base type of mimeType.',
    });
  });

export type RecordingPart = z.infer<typeof RecordingPartSchema>;

/** 같은 요청 안에서 `partNo` 가 겹치지 않는다 (`recording_parts UNIQUE(recording_id, part_no)`). */
function uniquePartNos(parts: readonly { partNo: number }[], ctx: z.RefinementCtx): void {
  const seen = new Set<number>();
  parts.forEach((part, index) => {
    if (seen.has(part.partNo)) {
      ctx.addIssue({
        code: 'custom',
        path: [index, 'partNo'],
        message: 'partNo must be unique within a request.',
      });
    }
    seen.add(part.partNo);
  });
}

export const RecordingUploadInitRequestSchema = z.object({
  parts: z.array(RecordingPartSchema).min(1).superRefine(uniquePartNos),
  totalDurationSeconds: z
    .int()
    .positive()
    .max(MAX_RECORDED_SECONDS + RECORDING_TOTAL_DURATION_GRACE_SECONDS),
});

export type RecordingUploadInitRequest = z.infer<typeof RecordingUploadInitRequestSchema>;

/** 서버가 발급한 part 별 업로드 대상. `objectKey` 는 opaque — 이름·이메일을 담지 않는다. */
export const RecordingUploadTargetSchema = z.object({
  partNo: RecordingPartNoSchema,
  endpoint: z.url(),
  /** 서버 발급, 경로 고정, 짧은 만료. 로그에 남기지 않는다. */
  uploadToken: z.string().min(1),
  objectKey: z.string().min(1),
  expiresAt: IsoDateTimeSchema,
});

export type RecordingUploadTarget = z.infer<typeof RecordingUploadTargetSchema>;

/** `RecordingUploadInit` 응답 — 토큰 재발급(`upload-tokens`) 응답도 같은 모양이다 (§4 Stage 4). */
export const RecordingUploadInitResponseSchema = z.object({
  recordingId: IdSchema,
  /** 보통 `pending`. */
  uploadStatus: UploadStatusSchema,
  /** research §3 — Supabase resumable (TUS). */
  transport: z.literal('tus'),
  parts: z.array(RecordingUploadTargetSchema).min(1),
});

export type RecordingUploadInitResponse = z.infer<typeof RecordingUploadInitResponseSchema>;

/** 만료된 업로드 토큰 재발급 요청. 응답은 `RecordingUploadInitResponseSchema`. */
export const RefreshUploadTokensRequestSchema = z.object({
  partNos: z
    .array(RecordingPartNoSchema)
    .min(1)
    .refine((partNos) => new Set(partNos).size === partNos.length, {
      message: 'partNos must be unique.',
    }),
});

export type RefreshUploadTokensRequest = z.infer<typeof RefreshUploadTokensRequestSchema>;

export const RecordingUploadCompletePartSchema = z.object({
  partNo: RecordingPartNoSchema,
  bytes: z.int().positive().max(RECORDING_PART_BYTES_MAX),
  sha256: Sha256HexSchema,
  durationSeconds: z.number().positive(),
});

export type RecordingUploadCompletePart = z.infer<typeof RecordingUploadCompletePartSchema>;

export const RecordingUploadCompleteRequestSchema = z.object({
  parts: z.array(RecordingUploadCompletePartSchema).min(1).superRefine(uniquePartNos),
});

export type RecordingUploadCompleteRequest = z.infer<typeof RecordingUploadCompleteRequestSchema>;

/**
 * 업로드 확정 응답. `uploadStatus = 'uploaded'` 와 `expiresAt` 이 **반드시** 있다 (AC-4-17).
 * Frontend 는 이 응답을 받은 뒤에만 로컬 녹음을 지운다 (`.claude/rules/architecture.md` §7).
 */
export const RecordingUploadCompleteResponseSchema = z.object({
  recordingId: IdSchema,
  uploadStatus: z.literal('uploaded'),
  /** 보통 `analyzing`. */
  sessionStatus: SessionStatusSchema,
  /** 원본 90일 만료 시각 (PRD §7.8 보관 정책 안내). */
  expiresAt: IsoDateTimeSchema,
});

export type RecordingUploadCompleteResponse = z.infer<typeof RecordingUploadCompleteResponseSchema>;
