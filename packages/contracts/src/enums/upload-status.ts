import { z } from 'zod';

/**
 * 서버가 보고하는 녹음 업로드 상태 — **CONFIRMED (#16)**.
 * 근거: `docs/API_CONTRACTS.md` §2.2.
 *
 * 클라이언트 UploadQueue 의 내부 상태(`local_only` … `stalled_48h`)는 contracts 가 아니라
 * `apps/web/src/features/recording` 소관이다 (Stage 4).
 */
export const UploadStatusSchema = z.enum(['pending', 'uploaded', 'failed', 'deleted', 'expired']);

export type UploadStatus = z.infer<typeof UploadStatusSchema>;
