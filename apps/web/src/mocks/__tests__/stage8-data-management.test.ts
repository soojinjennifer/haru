/**
 * Stage 8 `S8-A` — Mock 2그룹(`data-management` · `account`) + 쓰기 차단 guard + 교차 일관성 + `Me.caregiver.email`.
 * Plan rev 2 §8 · AC-8-08 · 09 · 10 · 93 · 94(fixture 부분).
 */
import {
  DataManagementSummarySchema,
  DeletionRequestSchema,
  HaruApiError,
  ListSessionsResponseSchema,
  MeResponseSchema,
  SessionDetailSchema,
  type ListSessionsResponse,
  type SessionListItem,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { isNetworkError } from '../../shared/api/helpers';
import { DELETION_PENDING_WRITE_METHODS } from '../common/writeGuard';
import {
  ACCOUNT_SCENARIO_KEYS,
  DATA_MANAGEMENT_SCENARIO_KEYS,
  MOCK_DELETION_FINAL_READ,
} from '../data-management/dataManagementScenarios';
import {
  MOCK_LONG_BOOK_TITLE,
  MOCK_RAW_AUDIO_DAYS,
  MOCK_RECORDING_PAGE_SIZE,
  MOCK_RECORDING_SESSION_IDS,
  MOCK_SEEDED_DELETION_REQUEST_ID,
} from '../fixtures/data-management';
import { MOCK_HIGHLIGHT_CLIP_IDS } from '../fixtures/highlight-clips';
import { MOCK_CAREGIVER_EMAIL, MOCK_CHILD_ID } from '../fixtures/me';
import { MOCK_HISTORY_SESSION_IDS } from '../fixtures/sessions';
import { ME_SCENARIO_KEYS } from '../me/MockMeApi';

import { bundle, ik, sessionBody } from './stage4-support';

const CHILD = { childId: MOCK_CHILD_ID };
const ALL_DATA = { body: { scope: 'all_data' as const, confirmation: true as const } };

async function errorOf(promise: Promise<unknown>): Promise<HaruApiError | 'NETWORK'> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HaruApiError) return error;
    if (isNetworkError(error)) return 'NETWORK';
    throw error;
  }
  throw new Error('expected a failure');
}

async function codeOf(promise: Promise<unknown>): Promise<string> {
  const error = await errorOf(promise);
  return error === 'NETWORK' ? 'NETWORK' : error.code;
}

async function allRows(b: ReturnType<typeof bundle>): Promise<SessionListItem[]> {
  const rows: SessionListItem[] = [];
  let cursor: string | undefined;
  for (;;) {
    const page: ListSessionsResponse = await b.clients.dataManagement.listRecordingSessions({
      ...CHILD,
      ...(cursor === undefined ? {} : { query: { cursor } }),
    });
    rows.push(...page.items);
    if (page.nextCursor === null) return rows;
    cursor = page.nextCursor;
  }
}

/** 한 key 의 관찰 가능한 응답 전부 (요약 · 목록 2페이지 · 첫 행 삭제 · 전체 삭제 요청 · 폴링 3회 · 탈퇴). */
async function observe(scenario: string): Promise<unknown[]> {
  const b = bundle(scenario);
  const out: unknown[] = [];
  const settle = async (promise: Promise<unknown>) => {
    try {
      out.push(await promise);
    } catch (error) {
      out.push(error instanceof HaruApiError ? error.toEnvelope() : String(error));
    }
  };
  await settle(b.clients.dataManagement.summary());
  await settle(b.clients.dataManagement.listRecordingSessions(CHILD));
  await settle(
    b.clients.dataManagement.listRecordingSessions({
      ...CHILD,
      query: { cursor: `mock-recordings:${String(MOCK_RECORDING_PAGE_SIZE)}` },
    }),
  );
  await settle(
    b.clients.dataManagement.deleteSessionRecording(
      { sessionId: MOCK_HISTORY_SESSION_IDS[0] },
      ik('del'),
    ),
  );
  const created = b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('all'));
  await settle(created);
  const id = await created.then(
    (request) => request.id,
    () => MOCK_SEEDED_DELETION_REQUEST_ID,
  );
  for (let read = 0; read < MOCK_DELETION_FINAL_READ; read += 1) {
    await settle(b.clients.dataManagement.getDeletionRequest({ requestId: id }));
  }
  await settle(b.clients.account.deleteAccount({ body: { confirmation: true } }, ik('acct')));
  return out;
}

describe('data-management:success — fixture (`M8-4` · AC-8-94 fixture 부분)', () => {
  it('요약: 진행 요청 없음 · 보관 일수 = 서버 정책 값 · `recordingsCount` = 삭제 가능 행 수 6 (`VG8-A-04`)', async () => {
    const b = bundle();
    const summary = await b.clients.dataManagement.summary();
    expect(DataManagementSummarySchema.safeParse(summary).success).toBe(true);
    expect(summary.activeDeletionRequest).toBeNull();
    expect(summary.retentionPolicy.rawAudioDays).toBe(MOCK_RAW_AUDIO_DAYS);
    const rows = await allRows(b);
    expect(rows).toHaveLength(8);
    expect(summary.recordingsCount).toBe(6);
    expect(summary.recordingsCount).toBe(
      rows.filter((row) =>
        ['uploaded', 'pending', 'failed'].includes(row.recording?.uploadStatus ?? ''),
      ).length,
    );
  });

  it('목록 = cursor 2페이지 (5 + 3) · 녹음 있는 세션만 · 최신 순', async () => {
    const b = bundle();
    const first = await b.clients.dataManagement.listRecordingSessions(CHILD);
    expect(ListSessionsResponseSchema.safeParse(first).success).toBe(true);
    expect(first.items).toHaveLength(MOCK_RECORDING_PAGE_SIZE);
    expect(first.nextCursor).not.toBeNull();

    const second = await b.clients.dataManagement.listRecordingSessions({
      ...CHILD,
      query: { cursor: first.nextCursor ?? '' },
    });
    expect(second.items).toHaveLength(3);
    expect(second.nextCursor).toBeNull();

    const rows = [...first.items, ...second.items];
    expect(rows.every((row) => row.recording !== null)).toBe(true);
    const readyAt = rows.map((row) => row.readyAt);
    expect(readyAt).toStrictEqual([...readyAt].sort().reverse());
  });

  it('행 상태 5종 각 1행 이상 (`uploaded` 2 이상) · `book = null` 1행 · 40자 제목 1행', async () => {
    const rows = await allRows(bundle());
    const count = (status: string) =>
      rows.filter((row) => row.recording?.uploadStatus === status).length;
    expect(count('uploaded')).toBeGreaterThanOrEqual(2);
    for (const status of ['pending', 'failed', 'expired', 'deleted']) {
      expect(count(status)).toBeGreaterThanOrEqual(1);
    }
    expect(rows.filter((row) => row.book === null)).toHaveLength(1);
    const long = rows.filter((row) => row.book?.title === MOCK_LONG_BOOK_TITLE);
    expect(long).toHaveLength(1);
    expect(MOCK_LONG_BOOK_TITLE).toHaveLength(40);
  });

  it('`deleted` 행은 `deletedAt` · `expiresAt null`, `expired` 행은 `expiresAt null`', async () => {
    const rows = await allRows(bundle());
    const deleted = rows.find((row) => row.id === MOCK_RECORDING_SESSION_IDS.deleted);
    const expired = rows.find((row) => row.id === MOCK_RECORDING_SESSION_IDS.expired);
    expect(deleted?.recording?.deletedAt).not.toBeNull();
    expect(deleted?.recording?.expiresAt).toBeNull();
    expect(expired?.recording?.expiresAt).toBeNull();
  });

  it('`limit` 이 더 작으면 그것을 따른다 · 잘못된 cursor → VALIDATION_FAILED · 다른 아이 → CHILD_NOT_FOUND', async () => {
    const b = bundle();
    const page = await b.clients.dataManagement.listRecordingSessions({
      ...CHILD,
      query: { limit: 2 },
    });
    expect(page.items).toHaveLength(2);
    expect(
      await codeOf(
        b.clients.dataManagement.listRecordingSessions({ ...CHILD, query: { cursor: 'bogus' } }),
      ),
    ).toBe('VALIDATION_FAILED');
    expect(
      await codeOf(
        b.clients.dataManagement.listRecordingSessions({
          childId: '00000000-0000-4000-8000-00000000ffff',
        }),
      ),
    ).toBe('CHILD_NOT_FOUND');
  });

  it('기존 `sessions.list` 결과는 그대로다 — 목록 seed 를 하지 않는다 (지난 세션 2행)', async () => {
    const b = bundle();
    const list = await b.clients.sessions.list({ ...CHILD, query: {} });
    expect(list.items).toHaveLength(MOCK_HISTORY_SESSION_IDS.length);
    expect(list.items.every((item) => item.recording?.uploadStatus === 'uploaded')).toBe(true);
    const none = await b.clients.sessions.list({ ...CHILD, query: { hasRecording: false } });
    expect(none.items).toHaveLength(0);
  });
});

describe('세션 녹음 삭제 + 교차 일관성 (AC-8-10)', () => {
  it('삭제 → `DeletionRequest(session_recording, completed)` · 행 `deleted` · 세션 상세 `deleted` · 클립 `RECORDING_DELETED`', async () => {
    const b = bundle();
    const sessionId = MOCK_HISTORY_SESSION_IDS[0];

    // 클립은 처음엔 재생된다 (같은 세션의 클립)
    await b.clients.highlightClips.getPlaybackUrl({ clipId: MOCK_HIGHLIGHT_CLIP_IDS[0] });

    const result = await b.clients.dataManagement.deleteSessionRecording({ sessionId }, ik('d1'));
    expect(DeletionRequestSchema.safeParse(result).success).toBe(true);
    expect(result).toMatchObject({
      scope: 'session_recording',
      sessionId,
      status: 'completed',
    });

    const row = (await allRows(b)).find((item) => item.id === sessionId);
    expect(row?.recording?.uploadStatus).toBe('deleted');
    expect(row?.recording?.deletedAt).not.toBeNull();

    const detail = await b.clients.sessions.getDetail({ sessionId });
    expect(SessionDetailSchema.safeParse(detail).success).toBe(true);
    expect(detail.recording?.uploadStatus).toBe('deleted');

    const clip = await errorOf(
      b.clients.highlightClips.getPlaybackUrl({ clipId: MOCK_HIGHLIGHT_CLIP_IDS[0] }),
    );
    expect(clip).not.toBe('NETWORK');
    if (clip !== 'NETWORK') {
      expect(clip.code).toBe('RECORDING_DELETED');
      expect(clip.details).toStrictEqual({ reason: 'deleted' });
    }

    // 행은 목록에 남지만(`Q8-07` ⓐ) 요약 수는 하나 줄어든다 — 삭제 가능한 녹음만 센다 (`VG8-A-04`)
    expect(await allRows(b)).toHaveLength(8);
    expect((await b.clients.dataManagement.summary()).recordingsCount).toBe(5);
  });

  it('같은 IK 재요청 = 같은 응답 · 다시 삭제(새 IK) = `RECORDING_DELETED`(`deleted`)', async () => {
    const b = bundle();
    const sessionId = MOCK_RECORDING_SESSION_IDS.pending;
    const first = await b.clients.dataManagement.deleteSessionRecording({ sessionId }, ik('a'));
    const replay = await b.clients.dataManagement.deleteSessionRecording({ sessionId }, ik('a'));
    expect(replay).toStrictEqual(first);
    const again = await errorOf(
      b.clients.dataManagement.deleteSessionRecording({ sessionId }, ik('b')),
    );
    expect(again !== 'NETWORK' && again.details).toStrictEqual({ reason: 'deleted' });
  });

  it('`expired` 행 삭제 → `RECORDING_DELETED`(`expired`) · 모르는 세션 → `RESOURCE_NOT_FOUND`', async () => {
    const b = bundle();
    const expired = await errorOf(
      b.clients.dataManagement.deleteSessionRecording(
        { sessionId: MOCK_RECORDING_SESSION_IDS.expired },
        ik('e'),
      ),
    );
    expect(expired !== 'NETWORK' && expired.code).toBe('RECORDING_DELETED');
    expect(expired !== 'NETWORK' && expired.details).toStrictEqual({ reason: 'expired' });
    expect(
      await codeOf(
        b.clients.dataManagement.deleteSessionRecording(
          { sessionId: '00000000-0000-4000-8000-00000000ffff' },
          ik('x'),
        ),
      ),
    ).toBe('RESOURCE_NOT_FOUND');
  });

  it('`recording-deleted` → `RECORDING_DELETED` 이지만 서버 상태는 삭제됨 — 재조회 시 행이 *Deleted*', async () => {
    const b = bundle('data-management:recording-deleted');
    const sessionId = MOCK_RECORDING_SESSION_IDS.failed;
    expect(
      await codeOf(b.clients.dataManagement.deleteSessionRecording({ sessionId }, ik('r'))),
    ).toBe('RECORDING_DELETED');
    const row = (await allRows(b)).find((item) => item.id === sessionId);
    expect(row?.recording?.uploadStatus).toBe('deleted');
  });

  it('`recording-delete-local-pending` — 서버 동작은 성공과 같다 (`pending` 행 삭제 확정)', async () => {
    const b = bundle('data-management:recording-delete-local-pending');
    const sessionId = MOCK_RECORDING_SESSION_IDS.pending;
    const result = await b.clients.dataManagement.deleteSessionRecording({ sessionId }, ik('l'));
    expect(result.status).toBe('completed');
    // 업로드 경로도 막힌다 — 확정 후 남은 업로드 시도는 `RECORDING_DELETED` (`P8-BIP-01`)
    expect(
      b.sessionState.recordings.get(b.sessionState.sessions.get(sessionId)?.recordingId ?? '')
        ?.uploadStatus,
    ).toBe('deleted');
  });
});

describe('전체 데이터 삭제 요청 · 진행 · 완료 효과', () => {
  it('success — `received` → 폴링 `received` · `processing` · `completed` (3회) → 아동 데이터 삭제 · Me 온보딩 전', async () => {
    const b = bundle();
    const created = await b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('all'));
    expect(created).toMatchObject({ scope: 'all_data', status: 'received', completedAt: null });
    expect((await b.clients.dataManagement.summary()).activeDeletionRequest?.id).toBe(created.id);

    const statuses: string[] = [];
    for (let read = 0; read < MOCK_DELETION_FINAL_READ; read += 1) {
      const next = await b.clients.dataManagement.getDeletionRequest({ requestId: created.id });
      expect(DeletionRequestSchema.safeParse(next).success).toBe(true);
      statuses.push(next.status);
    }
    expect(statuses).toStrictEqual(['received', 'processing', 'completed']);

    const summary = await b.clients.dataManagement.summary();
    expect(summary.activeDeletionRequest).toBeNull();
    expect(summary.recordingsCount).toBe(0);

    const me = await b.clients.me.get();
    expect(me.onboardingStatus).toBe('not_started');
    expect(me.child).toBeUndefined();
    // 계정은 유지된다 — 보호자 이메일 · 동의는 그대로
    expect(me.caregiver.email).toBe(MOCK_CAREGIVER_EMAIL);
    expect(me.consentStatus.missing).toStrictEqual([]);
  });

  it('진행 중 다시 요청 → `DELETION_ALREADY_REQUESTED` · 같은 IK 재요청 = 같은 응답', async () => {
    const b = bundle();
    const created = await b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('all'));
    expect(await b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('all'))).toStrictEqual(
      created,
    );
    expect(
      await codeOf(b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('all-2'))),
    ).toBe('DELETION_ALREADY_REQUESTED');
  });

  it('`deletion-processing` — 요약에 진행 중 요청이 이미 있고 폴링 3회로 `completed`', async () => {
    const b = bundle('data-management:deletion-processing');
    const summary = await b.clients.dataManagement.summary();
    expect(summary.activeDeletionRequest).toMatchObject({
      id: MOCK_SEEDED_DELETION_REQUEST_ID,
      scope: 'all_data',
      status: 'received',
    });
    const statuses: string[] = [];
    for (let read = 0; read < MOCK_DELETION_FINAL_READ; read += 1) {
      statuses.push(
        (
          await b.clients.dataManagement.getDeletionRequest({
            requestId: MOCK_SEEDED_DELETION_REQUEST_ID,
          })
        ).status,
      );
    }
    expect(statuses).toStrictEqual(['received', 'processing', 'completed']);
  });

  it('`deletion-failed` — `received → processing → failed` · 아동 데이터는 남는다', async () => {
    const b = bundle('data-management:deletion-failed');
    const created = await b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('f'));
    const statuses: string[] = [];
    for (let read = 0; read < MOCK_DELETION_FINAL_READ; read += 1) {
      statuses.push(
        (await b.clients.dataManagement.getDeletionRequest({ requestId: created.id })).status,
      );
    }
    expect(statuses).toStrictEqual(['received', 'processing', 'failed']);
    expect((await b.clients.dataManagement.summary()).activeDeletionRequest).toBeNull();
    expect((await b.clients.me.get()).child).toBeDefined();
  });

  it('`deletion-retry` (RETRY, `H8-1-N4`) — 첫 요청 `failed` → 다시 요청 `completed` · 3회 반복해도 같다 (결정적)', async () => {
    for (let run = 0; run < 3; run += 1) {
      const b = bundle('data-management:deletion-retry');
      const poll = async (requestId: string): Promise<string[]> => {
        const statuses: string[] = [];
        for (let read = 0; read < MOCK_DELETION_FINAL_READ; read += 1) {
          statuses.push((await b.clients.dataManagement.getDeletionRequest({ requestId })).status);
        }
        return statuses;
      };
      const first = await b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('r1'));
      expect(await poll(first.id)).toStrictEqual(['received', 'processing', 'failed']);
      expect((await b.clients.me.get()).child).toBeDefined();

      const second = await b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('r2'));
      expect(second.id).not.toBe(first.id);
      expect(await poll(second.id)).toStrictEqual(['received', 'processing', 'completed']);
      expect((await b.clients.me.get()).child).toBeUndefined();
    }
  });

  it('완료 효과 — 리포트 · 주기 진행 · 주간 Progress 도 지운다 (`H8-1-N5`)', async () => {
    const b = bundle();
    const before = await b.clients.reports.getOverview(CHILD);
    expect(before.reportCount).toBeGreaterThan(0);
    expect((await b.clients.progress.getWeekly(CHILD)).sessionsCount).toBeGreaterThan(0);

    const created = await b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('n5'));
    for (let read = 0; read < MOCK_DELETION_FINAL_READ; read += 1) {
      await b.clients.dataManagement.getDeletionRequest({ requestId: created.id });
    }

    const after = await b.clients.reports.getOverview(CHILD);
    expect(after.reportCount).toBe(0);
    expect(after.latestReport).toBeNull();
    expect(after.currentCycle).toMatchObject({
      cycleNo: 1,
      status: 'in_progress',
      progressRatio: 0,
    });
    expect((await b.clients.reports.list(CHILD)).items).toStrictEqual([]);
    const weekly = await b.clients.progress.getWeekly(CHILD);
    expect(weekly.sessionsCount).toBe(0);
    expect(weekly.momentOfWeek).toBeNull();
  });

  it('`deletion-already-requested` — 요약에 진행 요청(`processing`) · `POST` → `DELETION_ALREADY_REQUESTED` · 폴링해도 그대로', async () => {
    const b = bundle('data-management:deletion-already-requested');
    expect((await b.clients.dataManagement.summary()).activeDeletionRequest?.status).toBe(
      'processing',
    );
    expect(await codeOf(b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('x')))).toBe(
      'DELETION_ALREADY_REQUESTED',
    );
    const polled = await b.clients.dataManagement.getDeletionRequest({
      requestId: MOCK_SEEDED_DELETION_REQUEST_ID,
    });
    expect(polled.status).toBe('processing');
  });

  it('모르는 요청 id → `RESOURCE_NOT_FOUND`', async () => {
    expect(
      await codeOf(
        bundle().clients.dataManagement.getDeletionRequest({
          requestId: '00000000-0000-4000-8000-00000000ffff',
        }),
      ),
    ).toBe('RESOURCE_NOT_FOUND');
  });

  it('`empty` — 녹음 0 · 목록 0', async () => {
    const b = bundle('data-management:empty');
    expect((await b.clients.dataManagement.summary()).recordingsCount).toBe(0);
    expect(await b.clients.dataManagement.listRecordingSessions(CHILD)).toStrictEqual({
      items: [],
      nextCursor: null,
    });
  });

  it('공통 `error` · `retry` · `offline`', async () => {
    expect(await codeOf(bundle('data-management:error').clients.dataManagement.summary())).toBe(
      'INTERNAL_ERROR',
    );
    const retry = bundle('data-management:retry');
    expect(await codeOf(retry.clients.dataManagement.summary())).toBe('INTERNAL_ERROR');
    expect(
      DataManagementSummarySchema.safeParse(await retry.clients.dataManagement.summary()).success,
    ).toBe(true);
    expect(await codeOf(bundle('data-management:offline').clients.dataManagement.summary())).toBe(
      'NETWORK',
    );
    expect(
      await codeOf(
        bundle('data-management:offline').clients.dataManagement.createDeletionRequest(
          ALL_DATA,
          ik('o'),
        ),
      ),
    ).toBe('NETWORK');
  });
});

describe('삭제 진행 중 쓰기 차단 — `ACCOUNT_DELETION_PENDING` (`C8-5`)', () => {
  it('`account:deletion-pending-write-blocked` — 쓰기는 409 · 읽기는 동작 · 탈퇴는 `DELETION_ALREADY_REQUESTED`', async () => {
    const b = bundle('account:deletion-pending-write-blocked');
    const blocked = await errorOf(b.clients.me.update({ displayName: 'Sam' }));
    expect(blocked !== 'NETWORK' && blocked.code).toBe('ACCOUNT_DELETION_PENDING');
    expect(blocked !== 'NETWORK' && blocked.httpStatus).toBe(409);
    expect(
      await codeOf(
        b.clients.dataManagement.deleteSessionRecording(
          { sessionId: MOCK_HISTORY_SESSION_IDS[0] },
          ik('w'),
        ),
      ),
    ).toBe('ACCOUNT_DELETION_PENDING');
    expect(await codeOf(b.clients.sessions.create({ body: sessionBody() }, ik('s')))).toBe(
      'ACCOUNT_DELETION_PENDING',
    );

    // 읽기는 계속 된다 — 요약에 진행 중 요청이 보인다
    expect((await b.clients.dataManagement.summary()).activeDeletionRequest?.status).toBe(
      'processing',
    );
    expect(MeResponseSchema.safeParse(await b.clients.me.get()).success).toBe(true);
    expect(
      await codeOf(b.clients.account.deleteAccount({ body: { confirmation: true } }, ik('a'))),
    ).toBe('DELETION_ALREADY_REQUESTED');
  });

  it('전체 삭제 요청 직후부터 쓰기 차단 → 완료되면 다시 열린다', async () => {
    const b = bundle();
    const created = await b.clients.dataManagement.createDeletionRequest(ALL_DATA, ik('all'));
    expect(await codeOf(b.clients.me.update({ displayName: 'Sam' }))).toBe(
      'ACCOUNT_DELETION_PENDING',
    );
    for (let read = 0; read < MOCK_DELETION_FINAL_READ; read += 1) {
      await b.clients.dataManagement.getDeletionRequest({ requestId: created.id });
    }
    expect(
      MeResponseSchema.safeParse(await b.clients.me.update({ displayName: 'Sam' })).success,
    ).toBe(true);
  });

  it('쓰기 메서드 목록은 전부 실제 Client 메서드다 (오타 방지)', () => {
    const { clients } = bundle();
    for (const [domain, methods] of Object.entries(DELETION_PENDING_WRITE_METHODS)) {
      const api: unknown = Reflect.get(clients, domain);
      for (const method of methods) {
        expect(typeof Reflect.get(api as object, method)).toBe('function');
      }
    }
    // 삭제 · 탈퇴 endpoint 자신과 읽기는 감싸지 않는다
    expect(DELETION_PENDING_WRITE_METHODS.dataManagement).not.toContain('createDeletionRequest');
    expect(Object.keys(DELETION_PENDING_WRITE_METHODS)).not.toContain('account');
  });
});

describe('account (탈퇴)', () => {
  it('success → `DeletionRequest(account, received)` · 이후 쓰기 차단 · 폴링으로 완료 → Me 온보딩 전 · 동의 초기화', async () => {
    const b = bundle();
    const result = await b.clients.account.deleteAccount(
      { body: { confirmation: true } },
      ik('acct'),
    );
    expect(DeletionRequestSchema.safeParse(result).success).toBe(true);
    expect(result).toMatchObject({ scope: 'account', sessionId: null, status: 'received' });
    expect(await codeOf(b.clients.me.update({ displayName: 'Sam' }))).toBe(
      'ACCOUNT_DELETION_PENDING',
    );
    for (let read = 0; read < MOCK_DELETION_FINAL_READ; read += 1) {
      await b.clients.dataManagement.getDeletionRequest({ requestId: result.id });
    }
    expect(b.deletionState.accountDeleted).toBe(true);
    expect(b.consentState.granted()).toStrictEqual([]);
  });

  it('`error` · `retry` · `offline`', async () => {
    const body = { body: { confirmation: true as const } };
    expect(await codeOf(bundle('account:error').clients.account.deleteAccount(body, ik('e')))).toBe(
      'INTERNAL_ERROR',
    );
    const retry = bundle('account:retry');
    expect(await codeOf(retry.clients.account.deleteAccount(body, ik('r')))).toBe('INTERNAL_ERROR');
    expect((await retry.clients.account.deleteAccount(body, ik('r'))).scope).toBe('account');
    expect(
      await codeOf(bundle('account:offline').clients.account.deleteAccount(body, ik('o'))),
    ).toBe('NETWORK');
  });
});

describe('Me fixture — `caregiver.email` (`C8-10` · AC-8-93)', () => {
  it.each(ME_SCENARIO_KEYS.filter((key) => !['error', 'offline'].includes(key)))(
    '`me:%s` 응답이 가상 이메일을 담고 parse 를 통과한다',
    async (key) => {
      const b = bundle(`me:${key}`);
      const me = await b.clients.me.get().catch(() => b.clients.me.get());
      expect(MeResponseSchema.safeParse(me).success).toBe(true);
      expect(me.caregiver.email).toBe(MOCK_CAREGIVER_EMAIL);
      expect(MOCK_CAREGIVER_EMAIL.endsWith('@example.com')).toBe(true);
    },
  );

  it('`PATCH /v1/me` 는 이메일을 바꾸지 않고, 요청 로그에 이메일 원문이 없다', async () => {
    const b = bundle();
    const me = await b.clients.me.update({ displayName: 'Sam' });
    expect(me.caregiver.email).toBe(MOCK_CAREGIVER_EMAIL);
    await b.clients.me.get();
    await b.clients.dataManagement.summary();
    await b.clients.account.deleteAccount({ body: { confirmation: true } }, ik('acct'));
    expect(JSON.stringify(b.requestLog.entries())).not.toContain(MOCK_CAREGIVER_EMAIL);
  });
});

describe('결정성 — 같은 key 같은 결과 3회 (AC-8-09)', () => {
  it.each([
    ...DATA_MANAGEMENT_SCENARIO_KEYS.map((key) => `data-management:${key}`),
    ...ACCOUNT_SCENARIO_KEYS.map((key) => `account:${key}`),
  ])('%s', async (scenario) => {
    const runs = [await observe(scenario), await observe(scenario), await observe(scenario)];
    expect(runs[1]).toStrictEqual(runs[0]);
    expect(runs[2]).toStrictEqual(runs[0]);
  });
});
