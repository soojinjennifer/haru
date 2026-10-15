import { describe, expect, it } from 'vitest';

import {
  RECORDING_CONTAINER_BASE_MIME_TYPE,
  RECORDING_PART_NO_MAX,
  RecordingMimeTypeSchema,
  RecordingPartSchema,
  RecordingStatusSchema,
  RecordingUploadCompleteRequestSchema,
  RecordingUploadCompleteResponseSchema,
  RecordingUploadInitRequestSchema,
  RecordingUploadInitResponseSchema,
  RefreshUploadTokensRequestSchema,
  UploadStatusSchema,
  recordingContainerForMimeType,
  recordingMimeBaseType,
} from '../index.js';

/**
 * Stage 4 `S4-B` — Recording Upload Contract (AC-4-15 ~ 17, `D4-23` · `D4-24`).
 *
 * mimeType 실측값의 출처: `docs/qa/stage-4a-spike-report.md` §5.2 (2026-10-14) —
 * Playwright Chromium / WebKit 의 실제 `BlobEvent.data.type`.
 */

const RECORDING_ID = '66666666-6666-4666-8666-000000000001';
const SHA = 'a'.repeat(64);

/** spike §5.2 에서 실제로 관측된 Blob type 전부. */
const OBSERVED_BLOB_TYPES = [
  ['audio/webm;codecs=opus', 'webm'], // Chromium 기본
  ['audio/mp4;codecs=opus', 'mp4'], // Chromium, audio/mp4 요청
  ['audio/mp4;codecs=mp4a.40.2', 'mp4'], // Chromium, mp4a 요청
  ['audio/mp4; codecs=mp4a.40.2', 'mp4'], // WebKit 기본 (세미콜론 뒤 공백)
  ['audio/webm; codecs=opus', 'webm'], // WebKit, webm 요청
] as const;

const part = (overrides: Record<string, unknown> = {}) => ({
  partNo: 1,
  mimeType: 'audio/webm;codecs=opus',
  container: 'webm',
  bytes: 1024,
  ...overrides,
});

describe('RecordingPart.mimeType — 원문 문자열 + base type 검증 (D4-23, AC-4-15)', () => {
  it.each(OBSERVED_BLOB_TYPES)(
    '실측 Blob type "%s" 를 원문 그대로 받는다 (container=%s)',
    (mimeType, container) => {
      const parsed = RecordingPartSchema.parse(part({ mimeType, container }));
      // 정규화하지 않는다 — 공백·코덱 파라미터가 그대로 남는다
      expect(parsed.mimeType).toBe(mimeType);
      expect(recordingContainerForMimeType(mimeType)).toBe(container);
    },
  );

  it('파라미터 없는 base type 도 받는다', () => {
    expect(RecordingMimeTypeSchema.safeParse('audio/webm').success).toBe(true);
    expect(RecordingMimeTypeSchema.safeParse('audio/mp4').success).toBe(true);
  });

  it('audio/aac · audio/m4a 는 거부한다 (D4-23 — 두 엔진 모두 생성자가 던지는 죽은 값)', () => {
    for (const mimeType of ['audio/aac', 'audio/m4a', 'audio/x-m4a']) {
      expect(RecordingMimeTypeSchema.safeParse(mimeType).success).toBe(false);
    }
  });

  it('허용 집합 밖의 base type 은 거부한다', () => {
    for (const mimeType of ['audio/ogg;codecs=opus', 'audio/mpeg', 'audio/wav', 'video/webm', '']) {
      expect(RecordingMimeTypeSchema.safeParse(mimeType).success).toBe(false);
    }
  });

  it('base type 은 ; 앞을 잘라 trim 한 값이다', () => {
    expect(recordingMimeBaseType('audio/mp4; codecs=mp4a.40.2')).toBe('audio/mp4');
    expect(recordingMimeBaseType('  audio/webm ;codecs=opus')).toBe('audio/webm');
    expect(recordingMimeBaseType('audio/webm')).toBe('audio/webm');
  });

  it('container 와 mimeType 의 base type 이 어긋나면 거부한다', () => {
    const result = RecordingPartSchema.safeParse(
      part({ mimeType: 'audio/mp4; codecs=mp4a.40.2', container: 'webm' }),
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('container');
  });

  it('container 는 webm · mp4 두 값이고 base type 표와 1:1 이다', () => {
    expect(RECORDING_CONTAINER_BASE_MIME_TYPE).toEqual({ webm: 'audio/webm', mp4: 'audio/mp4' });
    expect(RecordingPartSchema.safeParse(part({ container: 'aac' })).success).toBe(false);
  });
});

describe('RecordingPart.partNo — 상한 20 (D4-24, AC-4-15)', () => {
  it('상한은 20 이다', () => {
    expect(RECORDING_PART_NO_MAX).toBe(20);
  });

  it('1 · 20 통과 / 0 · 21 실패', () => {
    expect(RecordingPartSchema.safeParse(part({ partNo: 1 })).success).toBe(true);
    expect(RecordingPartSchema.safeParse(part({ partNo: 20 })).success).toBe(true);
    expect(RecordingPartSchema.safeParse(part({ partNo: 0 })).success).toBe(false);
    expect(RecordingPartSchema.safeParse(part({ partNo: 21 })).success).toBe(false);
  });

  it('part 는 timeslice 청크가 아니다 — 30분 청크 수(≈1766)를 part 로 보내면 막힌다 (D4-24)', () => {
    expect(RecordingPartSchema.safeParse(part({ partNo: 1766 })).success).toBe(false);
  });
});

describe('RecordingUploadInitRequest — bytes · 개수 · 중복 (AC-4-15)', () => {
  it('정상 1-part 요청이 parse 된다', () => {
    const result = RecordingUploadInitRequestSchema.safeParse({
      parts: [part()],
      totalDurationSeconds: 900,
    });
    expect(result.success).toBe(true);
  });

  it('bytes 는 1 ~ 100 MiB 다', () => {
    const at = (bytes: number) => RecordingPartSchema.safeParse(part({ bytes })).success;
    expect(at(1)).toBe(true);
    expect(at(100 * 1024 * 1024)).toBe(true);
    expect(at(100 * 1024 * 1024 + 1)).toBe(false);
    expect(at(0)).toBe(false);
  });

  it('parts 는 최소 1개이고 partNo 가 겹치지 않는다', () => {
    expect(
      RecordingUploadInitRequestSchema.safeParse({ parts: [], totalDurationSeconds: 10 }).success,
    ).toBe(false);
    expect(
      RecordingUploadInitRequestSchema.safeParse({
        parts: [part(), part()],
        totalDurationSeconds: 10,
      }).success,
    ).toBe(false);
    expect(
      RecordingUploadInitRequestSchema.safeParse({
        parts: [part(), part({ partNo: 2, mimeType: 'audio/webm;codecs=opus' })],
        totalDurationSeconds: 10,
      }).success,
    ).toBe(true);
  });

  it('totalDurationSeconds 는 1860(1800 + 60) 까지다', () => {
    const at = (totalDurationSeconds: number) =>
      RecordingUploadInitRequestSchema.safeParse({ parts: [part()], totalDurationSeconds }).success;
    expect(at(1860)).toBe(true);
    expect(at(1861)).toBe(false);
    expect(at(0)).toBe(false);
  });
});

describe('RecordingUploadInitResponse · RefreshUploadTokens', () => {
  const response = {
    recordingId: RECORDING_ID,
    uploadStatus: 'pending',
    transport: 'tus',
    parts: [
      {
        partNo: 1,
        endpoint: 'https://storage.example.test/upload/resumable',
        uploadToken: 'opaque-token',
        objectKey: 'opaque/object/key',
        expiresAt: '2026-10-14T10:00:00Z',
      },
    ],
  };

  it('init 응답이 parse 된다', () => {
    expect(RecordingUploadInitResponseSchema.safeParse(response).success).toBe(true);
  });

  it('transport 는 tus 뿐이다', () => {
    expect(
      RecordingUploadInitResponseSchema.safeParse({ ...response, transport: 'multipart' }).success,
    ).toBe(false);
  });

  it('토큰 재발급 요청은 partNo 목록이고 상한·중복 규칙을 따른다', () => {
    expect(RefreshUploadTokensRequestSchema.safeParse({ partNos: [1, 2] }).success).toBe(true);
    expect(RefreshUploadTokensRequestSchema.safeParse({ partNos: [] }).success).toBe(false);
    expect(RefreshUploadTokensRequestSchema.safeParse({ partNos: [21] }).success).toBe(false);
    expect(RefreshUploadTokensRequestSchema.safeParse({ partNos: [1, 1] }).success).toBe(false);
  });
});

describe('RecordingUploadComplete (AC-4-16 · 17)', () => {
  const completePart = (overrides: Record<string, unknown> = {}) => ({
    partNo: 1,
    bytes: 1024,
    sha256: SHA,
    durationSeconds: 899.5,
    ...overrides,
  });

  it('sha256 은 소문자 hex 64자다 (AC-4-16)', () => {
    const at = (sha256: string) =>
      RecordingUploadCompleteRequestSchema.safeParse({ parts: [completePart({ sha256 })] }).success;
    expect(at(SHA)).toBe(true);
    expect(at('0123456789abcdef'.repeat(4))).toBe(true);
    expect(at('A'.repeat(64))).toBe(false);
    expect(at('a'.repeat(63))).toBe(false);
    expect(at('a'.repeat(65))).toBe(false);
    expect(at(`${'a'.repeat(63)}g`)).toBe(false);
  });

  it('완료 요청의 partNo 도 상한 20 · 중복 금지를 따른다', () => {
    expect(
      RecordingUploadCompleteRequestSchema.safeParse({ parts: [completePart({ partNo: 21 })] })
        .success,
    ).toBe(false);
    expect(
      RecordingUploadCompleteRequestSchema.safeParse({ parts: [completePart(), completePart()] })
        .success,
    ).toBe(false);
  });

  const completeResponse = {
    recordingId: RECORDING_ID,
    uploadStatus: 'uploaded',
    sessionStatus: 'analyzing',
    expiresAt: '2027-01-12T09:20:00Z',
  };

  it("응답은 uploadStatus='uploaded' 와 expiresAt 을 반드시 포함한다 (AC-4-17)", () => {
    expect(RecordingUploadCompleteResponseSchema.safeParse(completeResponse).success).toBe(true);

    const { expiresAt: _expiresAt, ...withoutExpiry } = completeResponse;
    expect(RecordingUploadCompleteResponseSchema.safeParse(withoutExpiry).success).toBe(false);

    const { uploadStatus: _status, ...withoutStatus } = completeResponse;
    expect(RecordingUploadCompleteResponseSchema.safeParse(withoutStatus).success).toBe(false);

    for (const uploadStatus of ['pending', 'failed', 'deleted', 'expired']) {
      expect(
        RecordingUploadCompleteResponseSchema.safeParse({ ...completeResponse, uploadStatus })
          .success,
      ).toBe(false);
    }
  });
});

describe('RecordingStatus (§3.9)', () => {
  it('서버 상태 5값과 deleted 녹음(만료 null)을 표현한다', () => {
    expect(
      RecordingStatusSchema.safeParse({
        recordingId: RECORDING_ID,
        uploadStatus: 'deleted',
        partCount: 1,
        expiresAt: null,
        deletedAt: '2026-10-14T09:30:00Z',
      }).success,
    ).toBe(true);
  });

  it('클라이언트 큐 상태 값은 받지 않는다 (AC-4-20)', () => {
    for (const uploadStatus of [
      'local_only',
      'queued',
      'uploading',
      'failed_retrying',
      'stalled_48h',
    ]) {
      expect(UploadStatusSchema.safeParse(uploadStatus).success).toBe(false);
      expect(
        RecordingStatusSchema.safeParse({
          recordingId: RECORDING_ID,
          uploadStatus,
          partCount: 0,
          expiresAt: null,
        }).success,
      ).toBe(false);
    }
  });
});
