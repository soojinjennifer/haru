/**
 * Recording Upload fixture — `docs/API_CONTRACTS.md` §3.3 · §3.9.
 *
 * - 업로드 대상(`endpoint`)은 **존재하지 않는 Mock 호스트**다 (`.invalid` TLD) — 실제 네트워크를 쓰지 않는다.
 * - `objectKey` 는 opaque 이며 이름·이메일을 담지 않는다 (`RecordingUploadTargetSchema` 주석).
 * - 토큰은 주입 `idFactory` 로 만든다 — 같은 호출 순서면 같은 값이다 (결정성).
 */
import { RecordingUploadTargetSchema, type RecordingUploadTarget } from '@haru/contracts';

/** 업로드 토큰 유효 시간 (Mock). 실제 값은 Backend 결정 (`RECORDING_UPLOAD_SPEC.md`). */
export const MOCK_UPLOAD_TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

export const MOCK_UPLOAD_ORIGIN = 'https://uploads.mock.haru.invalid';

export function mockObjectKey(recordingId: string, partNo: number): string {
  return `recordings/${recordingId}/part-${String(partNo)}`;
}

export function createUploadTargetFixture(input: {
  recordingId: string;
  partNo: number;
  token: string;
  expiresAt: string;
}): RecordingUploadTarget {
  const objectKey = mockObjectKey(input.recordingId, input.partNo);

  return RecordingUploadTargetSchema.parse({
    partNo: input.partNo,
    endpoint: `${MOCK_UPLOAD_ORIGIN}/tus/${objectKey}`,
    uploadToken: `mock-upload-token-${input.token}`,
    objectKey,
    expiresAt: input.expiresAt,
  });
}
