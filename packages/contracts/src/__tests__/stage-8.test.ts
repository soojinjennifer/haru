/**
 * Stage 8 `S8-A` — contracts (Plan rev 2 §7 `C8-1`~`C8-5` · `C8-9` · `C8-10`, `API_CONTRACTS.md` Rev 12).
 * AC-8-04 · 05 · 06 · 07 · 93.
 */
import { describe, expect, it } from 'vitest';

import * as dataManagement from '../data-management/index.js';
import {
  CaregiverSchema,
  CreateDeletionRequestSchema,
  DataManagementSummarySchema,
  DeleteAccountRequestSchema,
  DeletionRequestSchema,
  DeletionScopeSchema,
  ERROR_CODES,
  ErrorCodeSchema,
  httpStatusForErrorCode,
  isDeletionInProgress,
  ListSessionsRequestSchema,
  ListSessionsResponseSchema,
  SessionListItemSchema,
  UpdateCaregiverRequestSchema,
} from '../index.js';

const ID = '9b2f6a52-6f0e-4f7b-9d5c-1b2c3d4e5f60';
const SESSION_ID = '9b2f6a52-6f0e-4f7b-9d5c-1b2c3d4e5f61';
const T0 = '2026-01-01T00:00:00.000Z';
const T1 = '2026-01-01T00:05:00.000Z';

const SUMMARY = {
  id: SESSION_ID,
  status: 'analyzed',
  mode: 'recorded',
  book: null,
  readingContext: null,
  readyAt: T0,
  startedAt: T0,
  completedAt: T1,
  completedReason: 'user_done',
  recordedSeconds: 600,
  analysisOutcome: 'full',
  prompts: [],
  bubble: null,
  reminderBubble: null,
};

const RECORDING = {
  recordingId: ID,
  uploadStatus: 'uploaded',
  partCount: 1,
  expiresAt: T1,
  deletedAt: null,
};

function request(overrides: Record<string, unknown> = {}) {
  return {
    id: ID,
    scope: 'all_data',
    sessionId: null,
    status: 'received',
    requestedAt: T0,
    completedAt: null,
    ...overrides,
  };
}

describe('C8-10 — Caregiver.email (AC-8-93)', () => {
  const caregiver = {
    id: ID,
    displayName: 'Sam Rivera',
    timezone: 'America/Los_Angeles',
    email: 'sam@example.com',
  };

  it('필수다 — 없으면 parse 실패', () => {
    expect(CaregiverSchema.safeParse(caregiver).success).toBe(true);
    const { email: _omitted, ...withoutEmail } = caregiver;
    expect(CaregiverSchema.safeParse(withoutEmail).success).toBe(false);
  });

  it('이메일 형식만 통과한다', () => {
    for (const bad of ['', 'sam', 'sam@', '@example.com', 'sam example.com']) {
      expect(CaregiverSchema.safeParse({ ...caregiver, email: bad }).success).toBe(false);
    }
    // Apple 비공개 릴레이 주소도 형식상 이메일이다 (P8-BIP-09)
    expect(
      CaregiverSchema.safeParse({ ...caregiver, email: 'x7k2@privaterelay.appleid.com' }).success,
    ).toBe(true);
  });

  it('읽기 전용 — `PATCH /v1/me` 요청 schema 에는 없다', () => {
    expect(Object.keys(UpdateCaregiverRequestSchema.shape)).not.toContain('email');
    // 섞여 와도 요청 parse 결과에 남지 않는다 (서버로 보내지 않는다)
    const parsed = UpdateCaregiverRequestSchema.parse({
      displayName: 'Sam',
      email: 'x@example.com',
    });
    expect(parsed).toStrictEqual({ displayName: 'Sam' });
  });
});

describe('C8-4 · C8-5 — enum · error code (AC-8-07)', () => {
  it('`DeletionScope` 는 3값이다 (`account` 추가)', () => {
    expect(DeletionScopeSchema.options).toStrictEqual(['session_recording', 'all_data', 'account']);
  });

  it('`ACCOUNT_DELETION_PENDING` = 409 · 30종 · `DELETION_ALREADY_REQUESTED` 바로 뒤', () => {
    expect(ERROR_CODES).toHaveLength(30);
    expect(ErrorCodeSchema.safeParse('ACCOUNT_DELETION_PENDING').success).toBe(true);
    expect(httpStatusForErrorCode('ACCOUNT_DELETION_PENDING')).toBe(409);
    const index = ERROR_CODES.indexOf('ACCOUNT_DELETION_PENDING');
    expect(ERROR_CODES[index - 1]).toBe('DELETION_ALREADY_REQUESTED');
  });
});

describe('C8-2 — SessionListItem · hasRecording (AC-8-05)', () => {
  it('기존(Stage 4) 목록 항목 = `SessionSummary` 만 — 그대로 통과하고 `recording` 은 `null` 로 채워진다', () => {
    const page = ListSessionsResponseSchema.parse({ items: [SUMMARY], nextCursor: null });
    expect(page.items[0]?.recording).toBeNull();
  });

  it('`recording` 은 §3.9 `RecordingStatus` 또는 `null` 이다', () => {
    expect(SessionListItemSchema.parse({ ...SUMMARY, recording: RECORDING }).recording).toEqual(
      RECORDING,
    );
    expect(SessionListItemSchema.parse({ ...SUMMARY, recording: null }).recording).toBeNull();
    expect(
      SessionListItemSchema.safeParse({
        ...SUMMARY,
        recording: { ...RECORDING, uploadStatus: 'gone' },
      }).success,
    ).toBe(false);
  });

  it('요청의 `hasRecording` 은 선택 boolean — 기존 요청은 그대로 통과한다', () => {
    expect(ListSessionsRequestSchema.parse({}).hasRecording).toBeUndefined();
    expect(ListSessionsRequestSchema.parse({ hasRecording: true }).hasRecording).toBe(true);
    expect(ListSessionsRequestSchema.safeParse({ hasRecording: 'true' }).success).toBe(false);
  });
});

describe('C8-3 — DeletionRequest', () => {
  it('범위별 `sessionId` 규칙 — `session_recording` 만 값을 갖는다', () => {
    expect(DeletionRequestSchema.safeParse(request()).success).toBe(true);
    expect(DeletionRequestSchema.safeParse(request({ scope: 'account' })).success).toBe(true);
    expect(
      DeletionRequestSchema.safeParse(
        request({ scope: 'session_recording', sessionId: SESSION_ID }),
      ).success,
    ).toBe(true);
    expect(DeletionRequestSchema.safeParse(request({ scope: 'session_recording' })).success).toBe(
      false,
    );
    expect(DeletionRequestSchema.safeParse(request({ sessionId: SESSION_ID })).success).toBe(false);
  });

  it('`completedAt` — `completed` 면 필수, 진행 중이면 `null`, `failed` 는 둘 다 허용', () => {
    expect(DeletionRequestSchema.safeParse(request({ status: 'completed' })).success).toBe(false);
    expect(
      DeletionRequestSchema.safeParse(request({ status: 'completed', completedAt: T1 })).success,
    ).toBe(true);
    expect(
      DeletionRequestSchema.safeParse(request({ status: 'processing', completedAt: T1 })).success,
    ).toBe(false);
    expect(DeletionRequestSchema.safeParse(request({ status: 'failed' })).success).toBe(true);
    expect(
      DeletionRequestSchema.safeParse(request({ status: 'failed', completedAt: T1 })).success,
    ).toBe(true);
  });

  it('`isDeletionInProgress` = `received` · `processing`', () => {
    expect(isDeletionInProgress({ status: 'received' })).toBe(true);
    expect(isDeletionInProgress({ status: 'processing' })).toBe(true);
    expect(isDeletionInProgress({ status: 'completed' })).toBe(false);
    expect(isDeletionInProgress({ status: 'failed' })).toBe(false);
  });
});

describe('C8-3 · C8-4 — 요청 schema: `confirmation` literal `true` (AC-8-06)', () => {
  it('전체 삭제 요청은 `{ scope: all_data, confirmation: true }` 만 통과한다', () => {
    expect(
      CreateDeletionRequestSchema.safeParse({ scope: 'all_data', confirmation: true }).success,
    ).toBe(true);
    for (const bad of [
      { scope: 'all_data', confirmation: false },
      { scope: 'all_data', confirmation: 'true' },
      { scope: 'all_data' },
      { scope: 'account', confirmation: true },
      { scope: 'session_recording', confirmation: true },
    ]) {
      expect(CreateDeletionRequestSchema.safeParse(bad).success).toBe(false);
    }
  });

  it('탈퇴 요청은 `{ confirmation: true }` 만 통과한다', () => {
    expect(DeleteAccountRequestSchema.safeParse({ confirmation: true }).success).toBe(true);
    expect(DeleteAccountRequestSchema.safeParse({ confirmation: false }).success).toBe(false);
    expect(DeleteAccountRequestSchema.safeParse({}).success).toBe(false);
  });

  it('`.strict()` — PII 등 다른 필드가 섞이면 parse 실패 (Plan §5.5)', () => {
    expect(
      CreateDeletionRequestSchema.safeParse({
        scope: 'all_data',
        confirmation: true,
        childName: 'Emma',
      }).success,
    ).toBe(false);
    expect(
      DeleteAccountRequestSchema.safeParse({ confirmation: true, email: 'sam@example.com' })
        .success,
    ).toBe(false);
  });
});

describe('C8-1 — DataManagementSummary', () => {
  const base = { retentionPolicy: { rawAudioDays: 90 }, recordingsCount: 0 };

  it('진행 중 요청 없음 · 진행 중 `all_data` · `account` 를 표현한다', () => {
    expect(
      DataManagementSummarySchema.safeParse({ ...base, activeDeletionRequest: null }).success,
    ).toBe(true);
    expect(
      DataManagementSummarySchema.safeParse({ ...base, activeDeletionRequest: request() }).success,
    ).toBe(true);
    expect(
      DataManagementSummarySchema.safeParse({
        ...base,
        activeDeletionRequest: request({ scope: 'account', status: 'processing' }),
      }).success,
    ).toBe(true);
  });

  it('`activeDeletionRequest` 는 진행 중 `all_data` · `account` 만', () => {
    expect(
      DataManagementSummarySchema.safeParse({
        ...base,
        activeDeletionRequest: request({ status: 'completed', completedAt: T1 }),
      }).success,
    ).toBe(false);
    expect(
      DataManagementSummarySchema.safeParse({
        ...base,
        activeDeletionRequest: request({ scope: 'session_recording', sessionId: SESSION_ID }),
      }).success,
    ).toBe(false);
  });

  it('보관 일수는 양의 정수 · 녹음 수는 0 이상 정수', () => {
    for (const rawAudioDays of [0, -1, 1.5]) {
      expect(
        DataManagementSummarySchema.safeParse({
          ...base,
          retentionPolicy: { rawAudioDays },
          activeDeletionRequest: null,
        }).success,
      ).toBe(false);
    }
    expect(
      DataManagementSummarySchema.safeParse({
        ...base,
        recordingsCount: -1,
        activeDeletionRequest: null,
      }).success,
    ).toBe(false);
  });
});

describe('진입점 (AC-8-04)', () => {
  it('data-management/index.ts 의 export 목록이 기대와 정확히 같다 — `ConsentHistory` 없음 (`N8-06` ⓑ)', () => {
    expect(Object.keys(dataManagement).sort()).toStrictEqual(
      [
        'CreateDeletionRequestSchema',
        'DataManagementSummarySchema',
        'DeleteAccountRequestSchema',
        'DeletionRequestSchema',
        'IN_PROGRESS_DELETION_STATUSES',
        'RetentionPolicySchema',
        'isDeletionInProgress',
      ].sort(),
    );
  });
});
