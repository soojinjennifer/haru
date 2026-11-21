/**
 * 데이터 관리 fixture — Stage 8 Plan §8 `data-management` · Spec §7 Mock 요청 (`M8-4`) · `API_CONTRACTS.md` §3.13.
 *
 * **가상 데이터만** 담는다 (실제 아동 데이터 · 실제 녹음 없음). 시각은 주입 clock 의 상대 오프셋으로만 만든다 (결정성).
 *
 * ── 세션별 녹음 목록 (`data-management:success`) ──
 * 지난 세션 fixture 2행(`MOCK_HISTORY_SESSION_IDS` — `uploaded` 2)에 아래 6행을 더해 **8행 · cursor 2페이지**다.
 *
 * | 행 | 세션 | 녹음 `uploadStatus` | 비고 |
 * |---|---|---|---|
 * | `pending` | `completed` | `pending` | *Uploading* |
 * | `failed` | `completed` | `failed` | *Not uploaded yet* |
 * | `untitled` | `analyzed` | `uploaded` | **`book = null`** → 화면 *Storytime* |
 * | `longTitle` | `analyzed` | `uploaded` | **40자 책 제목** (줄바꿈 검증) |
 * | `deleted` | `analyzed` | `deleted` | *Deleted* · `deletedAt` |
 * | `expired` | `analyzed` | `expired` | *Removed after {n} days* — 90일 넘은 세션 |
 *
 * 최신 준비 시각 순(목록 정렬)으로 1페이지(5행) = 지난 세션 2 · `pending` · `failed` · `untitled`,
 * 2페이지(3행) = `longTitle` · `deleted` · `expired`.
 */
import {
  BookSummarySchema,
  SessionSummarySchema,
  type BookSummary,
  type SessionSummary,
  type UploadStatus,
} from '@haru/contracts';

import { shiftedIso, type Clock } from '../../shared/lib/clock';

import { DECK_BOOKS } from './saved-books';
import {
  createSessionPromptsFixture,
  MOCK_RAW_AUDIO_RETENTION_MS,
  MOCK_READY_BUBBLE,
  MOCK_READY_REMINDER_BUBBLE,
} from './sessions';

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** 서버 정책 보관 일수 — `DataManagementSummary.retentionPolicy.rawAudioDays` (PRD §7.8). 화면은 응답 값만 쓴다. */
export const MOCK_RAW_AUDIO_DAYS = MOCK_RAW_AUDIO_RETENTION_MS / DAY_MS;

/** 세션별 녹음 목록 1페이지 크기 (Mock 서버 상한 — 요청 `limit` 이 더 작으면 그것을 따른다). */
export const MOCK_RECORDING_PAGE_SIZE = 5;

/** 녹음 목록 행 세션 — 고정 uuid (scenario 간에도 같다). */
export const MOCK_RECORDING_SESSION_IDS = {
  pending: 'd8d8d8d8-0000-4000-8000-000000000001',
  failed: 'd8d8d8d8-0000-4000-8000-000000000002',
  untitled: 'd8d8d8d8-0000-4000-8000-000000000003',
  longTitle: 'd8d8d8d8-0000-4000-8000-000000000004',
  deleted: 'd8d8d8d8-0000-4000-8000-000000000005',
  expired: 'd8d8d8d8-0000-4000-8000-000000000006',
} as const;

export type MockRecordingRowName = keyof typeof MOCK_RECORDING_SESSION_IDS;

/** 녹음 목록 행 녹음 — 고정 uuid. */
export const MOCK_RECORDING_ROW_RECORDING_IDS: Readonly<Record<MockRecordingRowName, string>> = {
  pending: 'd8d8d8d8-1111-4111-8111-000000000001',
  failed: 'd8d8d8d8-1111-4111-8111-000000000002',
  untitled: 'd8d8d8d8-1111-4111-8111-000000000003',
  longTitle: 'd8d8d8d8-1111-4111-8111-000000000004',
  deleted: 'd8d8d8d8-1111-4111-8111-000000000005',
  expired: 'd8d8d8d8-1111-4111-8111-000000000006',
};

/** 40자 책 제목 — 320 · 393 폭에서 줄바꿈(truncate 0)을 검증한다 (AC-8-94). */
export const MOCK_LONG_BOOK_TITLE = 'The Little Owl Who Counted All the Stars';

/** 40자 제목 책 — 가상 책이다. */
export const MOCK_LONG_TITLE_BOOK: BookSummary = BookSummarySchema.parse({
  id: 'd8d8d8d8-3333-4333-8333-000000000001',
  title: MOCK_LONG_BOOK_TITLE,
  author: 'Avery Lin',
});

/** 진행 중 삭제 요청(seed)의 고정 id — `deletion-processing` · `deletion-already-requested` · `deletion-pending-write-blocked`. */
export const MOCK_SEEDED_DELETION_REQUEST_ID = 'd8d8d8d8-2222-4222-8222-000000000001';

/** 녹음 목록 행 1개 — 세션 요약 + 서버 녹음 레코드 값. */
export interface MockRecordingRowFixture {
  readonly name: MockRecordingRowName;
  readonly summary: SessionSummary;
  readonly recordingId: string;
  readonly uploadStatus: UploadStatus;
  readonly expiresAt: string | null;
  readonly deletedAt: string | null;
}

interface RowSpec {
  readonly name: MockRecordingRowName;
  readonly book: BookSummary | null;
  readonly daysAgo: number;
  readonly minutes: number;
  readonly sessionStatus: 'completed' | 'analyzed';
  readonly uploadStatus: UploadStatus;
}

function rowSpecs(): readonly RowSpec[] {
  const [first, second, third] = DECK_BOOKS;
  return [
    {
      name: 'pending',
      book: third ?? null,
      daysAgo: 2,
      minutes: 9,
      sessionStatus: 'completed',
      uploadStatus: 'pending',
    },
    {
      name: 'failed',
      book: first ?? null,
      daysAgo: 4,
      minutes: 12,
      sessionStatus: 'completed',
      uploadStatus: 'failed',
    },
    {
      name: 'untitled',
      book: null,
      daysAgo: 5,
      minutes: 7,
      sessionStatus: 'analyzed',
      uploadStatus: 'uploaded',
    },
    {
      name: 'longTitle',
      book: MOCK_LONG_TITLE_BOOK,
      daysAgo: 6,
      minutes: 15,
      sessionStatus: 'analyzed',
      uploadStatus: 'uploaded',
    },
    {
      name: 'deleted',
      book: second ?? null,
      daysAgo: 8,
      minutes: 10,
      sessionStatus: 'analyzed',
      uploadStatus: 'deleted',
    },
    {
      name: 'expired',
      book: third ?? null,
      daysAgo: 100,
      minutes: 13,
      sessionStatus: 'analyzed',
      uploadStatus: 'expired',
    },
  ];
}

/** `data-management:success` 녹음 목록의 추가 6행 (지난 세션 2행은 `ensureSessionHistory` 가 넣는다). */
export function createRecordingRowFixtures(clock: Clock): MockRecordingRowFixture[] {
  return rowSpecs().map((spec) => {
    const readyOffset = -spec.daysAgo * DAY_MS;
    const analyzed = spec.sessionStatus === 'analyzed';
    const summary = SessionSummarySchema.parse({
      id: MOCK_RECORDING_SESSION_IDS[spec.name],
      status: spec.sessionStatus,
      mode: 'recorded',
      book: spec.book,
      readingContext: spec.book === null ? null : 'bedtime',
      readyAt: shiftedIso(clock, readyOffset),
      startedAt: shiftedIso(clock, readyOffset + MINUTE_MS),
      completedAt: shiftedIso(clock, readyOffset + (spec.minutes + 2) * MINUTE_MS),
      completedReason: 'user_done',
      recordedSeconds: spec.minutes * 60,
      analysisOutcome: analyzed ? 'full' : null,
      prompts: createSessionPromptsFixture(),
      bubble: MOCK_READY_BUBBLE,
      reminderBubble: MOCK_READY_REMINDER_BUBBLE,
    });

    return {
      name: spec.name,
      summary,
      recordingId: MOCK_RECORDING_ROW_RECORDING_IDS[spec.name],
      uploadStatus: spec.uploadStatus,
      // 원본 90일 만료 시각은 업로드된 녹음만 갖는다 — `deleted` · `expired` 는 `null` (§3.9), 미업로드도 `null`.
      expiresAt:
        spec.uploadStatus === 'uploaded'
          ? shiftedIso(clock, readyOffset + MOCK_RAW_AUDIO_RETENTION_MS)
          : null,
      deletedAt: spec.uploadStatus === 'deleted' ? shiftedIso(clock, readyOffset + DAY_MS) : null,
    };
  });
}
