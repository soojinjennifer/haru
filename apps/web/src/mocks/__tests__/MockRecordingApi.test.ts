/**
 * `MockRecordingApi` + `MockUploadTransport` — Stage 4 `S4-C` (AC-4-21 · 26~33 · 37 + 폐기 상태 규칙).
 *
 * 로컬 파일 수(AC-4-27 의 "로컬 파일이 남아 있다")는 `LocalRecordingStore`(`S4-E`) 의 측정이다.
 * 이 파일은 **그 측정이 기대는 서버(Mock) 동작** — 확정 응답이 오지 않는다는 사실 — 을 고정한다.
 */
import {
  HaruApiError,
  RecordingStatusSchema,
  RecordingUploadCompleteResponseSchema,
  RecordingUploadInitResponseSchema,
  type RecordingUploadTarget,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { isNetworkError } from '../../shared/api/helpers';
import { isUploadOffsetConflictError } from '../../shared/api/upload-transport';
import { RECORDING_SCENARIO_KEYS, recordingScenarioGroup } from '../recordings/recordingScenarios';

import {
  bundle,
  completeBody,
  completedSession,
  ik,
  initBody,
  PART_BYTES,
  partData,
  sessionBody,
  to,
} from './stage4-support';

async function codeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HaruApiError) return error.code;
    if (isNetworkError(error)) return 'NETWORK';
    if (isUploadOffsetConflictError(error)) return 'CONFLICT';
    throw error;
  }
  return 'OK';
}

function firstTarget(parts: readonly RecordingUploadTarget[]): RecordingUploadTarget {
  const [target] = parts;
  if (target === undefined) throw new Error('no target');
  return target;
}

/** 요청 로그에서 TUS PATCH 가 받은 바이트 합 (part 별). */
function bytesReceived(entries: readonly { operation: string; payload: unknown }[]): number {
  return entries
    .filter((entry) => entry.operation === 'TUS PATCH')
    .reduce((sum, entry) => sum + (entry.payload as { bytes: number }).bytes, 0);
}

describe('recordings 그룹 — Catalogue key (§5.4)', () => {
  it('Catalogue 의 machine key 만 쓴다', () => {
    expect(recordingScenarioGroup.group).toBe('recordings');
    expect(RECORDING_SCENARIO_KEYS).toStrictEqual([
      'success',
      'loading',
      'error',
      'retry',
      'offline',
      'consent-missing',
      'recording-upload-success',
      'recording-upload-failure',
      'upload-retry',
      'upload-token-expired',
      'recording-incomplete',
      'offline-queued',
      'upload-stalled-48h',
      'recording-deleted',
      'recording-discarded',
    ]);
  });
});

describe('recording-upload-success — init → 전송 → complete → uploaded + 세션 analyzing (AC-4-26 · 21)', () => {
  for (const scenario of ['', 'recordings:recording-upload-success']) {
    it(`scenario="${scenario || 'success'}"`, async () => {
      const { b, sessionId } = await completedSession(scenario);
      const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('init'));
      expect(RecordingUploadInitResponseSchema.safeParse(init).success).toBe(true);
      expect(init.uploadStatus).toBe('pending');
      expect(init.transport).toBe('tus');

      const target = firstTarget(init.parts);
      const sent = await b.clients.uploadTransport.uploadPart({ target, data: partData() });
      expect(sent).toStrictEqual({
        partNo: 1,
        bytesUploaded: PART_BYTES,
        bytesTotal: PART_BYTES,
        bytesSent: PART_BYTES,
      });

      const done = await b.clients.recordings.complete(
        { recordingId: init.recordingId, body: completeBody() },
        ik('complete'),
      );
      expect(RecordingUploadCompleteResponseSchema.safeParse(done).success).toBe(true);
      expect(done.uploadStatus).toBe('uploaded');
      expect(done.sessionStatus).toBe('analyzing');
      expect(done.expiresAt).toBe('2026-04-01T00:00:00.000Z'); // MOCK_EPOCH + 90일

      const status = await b.clients.recordings.status({ recordingId: init.recordingId });
      expect(RecordingStatusSchema.safeParse(status).success).toBe(true);
      expect(status.uploadStatus).toBe('uploaded');

      const detail = await b.clients.sessions.getDetail({ sessionId });
      expect(detail.status).toBe('analyzing');
      expect(detail.recording?.uploadStatus).toBe('uploaded');
    });
  }

  it('업로드 확정이 세션 완료보다 먼저 오면, 완료 전이가 곧바로 analyzing 으로 이어진다', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    await b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r'));
    const init = await b.clients.recordings.init(
      { sessionId: session.id, body: initBody() },
      ik('i'),
    );
    await b.clients.uploadTransport.uploadPart({
      target: firstTarget(init.parts),
      data: partData(),
    });
    const done = await b.clients.recordings.complete(
      { recordingId: init.recordingId, body: completeBody() },
      ik('k'),
    );
    expect(done.sessionStatus).toBe('recording');

    const completed = await b.clients.sessions.transition(
      { sessionId: session.id, body: to('completed') },
      ik('d'),
    );
    expect(completed.session.status).toBe('analyzing');
  });
});

describe('recording-upload-failure — 지속 실패, 확정 응답이 오지 않는다 (AC-4-27)', () => {
  it('전송은 매번 NetworkError(바이트 0), complete 는 매번 INTERNAL_ERROR', async () => {
    const { b, sessionId } = await completedSession('recordings:recording-upload-failure');
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    const request = { target: firstTarget(init.parts), data: partData() };

    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(await codeOf(b.clients.uploadTransport.uploadPart(request))).toBe('NETWORK');
    }
    expect(bytesReceived(b.requestLog.entries())).toBe(0);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(
        await codeOf(
          b.clients.recordings.complete(
            { recordingId: init.recordingId, body: completeBody() },
            ik(`k${String(attempt)}`),
          ),
        ),
      ).toBe('INTERNAL_ERROR');
    }
    expect(
      (await b.clients.recordings.status({ recordingId: init.recordingId })).uploadStatus,
    ).toBe('pending');
  });

  it('upload-stalled-48h 도 같은 지속 실패다 — 48h 판정은 클라이언트 큐의 주입 clock (AC-4-32)', async () => {
    const { b, sessionId } = await completedSession('recordings:upload-stalled-48h');
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    expect(
      await codeOf(
        b.clients.uploadTransport.uploadPart({ target: firstTarget(init.parts), data: partData() }),
      ),
    ).toBe('NETWORK');
  });
});

describe('upload-retry — 중간 실패 후 재개, 재전송이 중복 업로드를 만들지 않는다 (AC-4-28)', () => {
  it('1회차 절반 수신 → 같은 요청의 uploadPart 는 CONFLICT(바이트 0) → resume 이 나머지만 보낸다', async () => {
    const { b, sessionId } = await completedSession('recordings:upload-retry');
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    const request = { target: firstTarget(init.parts), data: partData() };

    expect(await codeOf(b.clients.uploadTransport.uploadPart(request))).toBe('NETWORK');
    expect(await codeOf(b.clients.uploadTransport.uploadPart(request))).toBe('CONFLICT');
    const resumed = await b.clients.uploadTransport.resume(request);
    expect(resumed).toStrictEqual({
      partNo: 1,
      bytesUploaded: PART_BYTES,
      bytesTotal: PART_BYTES,
      bytesSent: PART_BYTES / 2,
    });
    // 이미 끝난 part 를 다시 resume 해도 0 바이트
    expect((await b.clients.uploadTransport.resume(request)).bytesSent).toBe(0);

    // 증거: 서버가 받은 바이트 합 = part 크기 (중복 0)
    expect(bytesReceived(b.requestLog.entries())).toBe(PART_BYTES);
    const done = await b.clients.recordings.complete(
      { recordingId: init.recordingId, body: completeBody() },
      ik('k'),
    );
    expect(done.uploadStatus).toBe('uploaded');
  });
});

describe('upload-token-expired — 만료 → refreshTokens → 성공, 호출 순서 로그 (AC-4-29)', () => {
  it('PATCH(거절) → upload-tokens → PATCH(성공) → complete', async () => {
    const { b, sessionId } = await completedSession('recordings:upload-token-expired');
    b.requestLog.clear();
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    const data = partData();

    expect(
      await codeOf(b.clients.uploadTransport.uploadPart({ target: firstTarget(init.parts), data })),
    ).toBe('UPLOAD_TOKEN_EXPIRED');

    const refreshed = await b.clients.recordings.refreshTokens(
      { recordingId: init.recordingId, body: { partNos: [1] } },
      ik('t'),
    );
    expect(refreshed.recordingId).toBe(init.recordingId);
    await b.clients.uploadTransport.uploadPart({ target: firstTarget(refreshed.parts), data });
    await b.clients.recordings.complete(
      { recordingId: init.recordingId, body: completeBody() },
      ik('k'),
    );

    expect(b.requestLog.entries().map((entry) => entry.operation)).toStrictEqual([
      'POST /v1/sessions/:sessionId/recordings',
      'TUS PATCH',
      'POST /v1/recordings/:recordingId/upload-tokens',
      'TUS PATCH',
      'POST /v1/recordings/:recordingId/complete',
    ]);
  });

  it('요청 로그에 업로드 토큰이 남지 않는다', async () => {
    const { b, sessionId } = await completedSession();
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    await b.clients.uploadTransport.uploadPart({
      target: firstTarget(init.parts),
      data: partData(),
    });
    const serialized = JSON.stringify(b.requestLog.entries());
    expect(serialized).not.toContain(firstTarget(init.parts).uploadToken);
    expect(serialized).not.toContain('mock-upload-token');
  });
});

describe('recording-incomplete — complete 가 RECORDING_INCOMPLETE (AC-4-30)', () => {
  it('scenario 는 바이트가 다 올라와도 지속 거절한다 (details.partNos)', async () => {
    const { b, sessionId } = await completedSession('recordings:recording-incomplete');
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    await b.clients.uploadTransport.uploadPart({
      target: firstTarget(init.parts),
      data: partData(),
    });
    try {
      await b.clients.recordings.complete(
        { recordingId: init.recordingId, body: completeBody() },
        ik('k'),
      );
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(HaruApiError);
      expect((error as HaruApiError).code).toBe('RECORDING_INCOMPLETE');
      expect((error as HaruApiError).details).toStrictEqual({ partNos: [1] });
    }
  });

  it('상태 규칙 — 올라오지 않은 part 가 있으면 success 에서도 RECORDING_INCOMPLETE', async () => {
    const { b, sessionId } = await completedSession();
    const init = await b.clients.recordings.init({ sessionId, body: initBody([1, 2]) }, ik('i'));
    await b.clients.uploadTransport.uploadPart({
      target: firstTarget(init.parts),
      data: partData(),
    });
    try {
      await b.clients.recordings.complete(
        { recordingId: init.recordingId, body: completeBody([1, 2]) },
        ik('k'),
      );
      expect.unreachable();
    } catch (error) {
      expect((error as HaruApiError).details).toStrictEqual({ partNos: [2] });
    }
  });
});

describe('offline-queued — 연결 복구 전 NetworkError, 복구 후 자동 재개 가능 (AC-4-31)', () => {
  it('goOnline() 이전에는 끊기고 이후에는 같은 요청이 성공한다', async () => {
    const { b, sessionId } = await completedSession('recordings:offline-queued');
    expect(await codeOf(b.clients.recordings.init({ sessionId, body: initBody() }, ik('i')))).toBe(
      'NETWORK',
    );
    expect(b.connectivity.isOnline()).toBe(false);

    b.connectivity.goOnline();
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    await b.clients.uploadTransport.uploadPart({
      target: firstTarget(init.parts),
      data: partData(),
    });
    const done = await b.clients.recordings.complete(
      { recordingId: init.recordingId, body: completeBody() },
      ik('k'),
    );
    expect(done.uploadStatus).toBe('uploaded');
  });
});

describe('recording-deleted — refreshTokens 가 RECORDING_DELETED (AC-4-33)', () => {
  it('만료 토큰 → refreshTokens → RECORDING_DELETED', async () => {
    const { b, sessionId } = await completedSession('recordings:recording-deleted');
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    expect(
      await codeOf(
        b.clients.uploadTransport.uploadPart({ target: firstTarget(init.parts), data: partData() }),
      ),
    ).toBe('UPLOAD_TOKEN_EXPIRED');
    expect(
      await codeOf(
        b.clients.recordings.refreshTokens(
          { recordingId: init.recordingId, body: { partNos: [1] } },
          ik('t'),
        ),
      ),
    ).toBe('RECORDING_DELETED');
  });
});

describe('recording-discarded — Discard(to=abandoned) 확정 후 서버가 녹음을 지운다 (`D4-13`, §3.9)', () => {
  it('폐기 → status=deleted, 이후 전송·토큰 재발급·확정은 RECORDING_DELETED', async () => {
    const b = bundle('sessions:recording-discarded,recordings:recording-discarded');
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    await b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r'));
    const init = await b.clients.recordings.init(
      { sessionId: session.id, body: initBody() },
      ik('i'),
    );
    const request = { target: firstTarget(init.parts), data: partData() };

    const discarded = await b.clients.sessions.transition(
      { sessionId: session.id, body: to('abandoned') },
      ik('discard'),
    );
    expect(discarded.session.status).toBe('abandoned');
    expect(discarded.stickerAward).toBeUndefined();

    const status = await b.clients.recordings.status({ recordingId: init.recordingId });
    expect(status.uploadStatus).toBe('deleted');
    expect(status.deletedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(status.expiresAt).toBeNull();

    expect(await codeOf(b.clients.uploadTransport.uploadPart(request))).toBe('RECORDING_DELETED');
    expect(
      await codeOf(
        b.clients.recordings.refreshTokens(
          { recordingId: init.recordingId, body: { partNos: [1] } },
          ik('t'),
        ),
      ),
    ).toBe('RECORDING_DELETED');
    expect(
      await codeOf(
        b.clients.recordings.complete(
          { recordingId: init.recordingId, body: completeBody() },
          ik('k'),
        ),
      ),
    ).toBe('RECORDING_DELETED');
  });
});

describe('서버 규칙 · consent-missing · 공통', () => {
  it('대화 전용 세션의 init → RECORDING_NOT_ALLOWED_FOR_MODE', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create(
      { body: sessionBody({ mode: 'conversation_only', bookId: null }) },
      ik('c'),
    );
    expect(
      await codeOf(b.clients.recordings.init({ sessionId: session.id, body: initBody() }, ik('i'))),
    ).toBe('RECORDING_NOT_ALLOWED_FOR_MODE');
  });

  it('ready 세션의 init → SESSION_INVALID_TRANSITION', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    expect(
      await codeOf(b.clients.recordings.init({ sessionId: session.id, body: initBody() }, ik('i'))),
    ).toBe('SESSION_INVALID_TRANSITION');
  });

  it('consent-missing — init · refreshTokens · complete 가 CONSENT_REQUIRED (CG)', async () => {
    const { b, sessionId } = await completedSession('recordings:consent-missing');
    const recordingId = '88888888-8888-4888-8888-000000000001';
    const codes = await Promise.all([
      codeOf(b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'))),
      codeOf(b.clients.recordings.refreshTokens({ recordingId, body: { partNos: [1] } }, ik('t'))),
      codeOf(b.clients.recordings.complete({ recordingId, body: completeBody() }, ik('k'))),
    ]);
    expect(codes).toStrictEqual(Array(3).fill('CONSENT_REQUIRED'));
  });

  it('error · retry · offline 은 API 와 전송 양쪽에 걸린다', async () => {
    const { b, sessionId } = await completedSession('recordings:retry');
    expect(await codeOf(b.clients.recordings.init({ sessionId, body: initBody() }, ik('i')))).toBe(
      'INTERNAL_ERROR',
    );
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    const request = { target: firstTarget(init.parts), data: partData() };
    expect(await codeOf(b.clients.uploadTransport.uploadPart(request))).toBe('INTERNAL_ERROR');
    expect((await b.clients.uploadTransport.uploadPart(request)).bytesSent).toBe(PART_BYTES);

    const offline = await completedSession('recordings:offline');
    expect(
      await codeOf(
        offline.b.clients.recordings.init(
          { sessionId: offline.sessionId, body: initBody() },
          ik('i'),
        ),
      ),
    ).toBe('NETWORK');
  });

  it('선언과 다른 크기의 바이트 → VALIDATION_FAILED', async () => {
    const { b, sessionId } = await completedSession();
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    expect(
      await codeOf(
        b.clients.uploadTransport.uploadPart({
          target: firstTarget(init.parts),
          data: partData(10),
        }),
      ),
    ).toBe('VALIDATION_FAILED');
  });

  it('abort — loading 중인 전송을 끊는다 (서버 바이트 0)', async () => {
    const { sessionId, b } = await completedSession('recordings.uploadpart:loading', {
      timer: {
        sleep: (_ms, signal) =>
          new Promise<void>((_resolve, reject) => {
            signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      },
    });
    const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    const target = firstTarget(init.parts);
    const pending = b.clients.uploadTransport.uploadPart({ target, data: partData() });
    await b.clients.uploadTransport.abort({ target });
    await expect(pending).rejects.toThrow('Aborted');
    expect(b.sessionState.recordings.get(init.recordingId)?.parts.get(1)?.offset).toBe(0);
  });
});

describe('Idempotency-Key — init · refreshTokens · complete 보관·재생 (AC-4-37)', () => {
  it('같은 키 + 같은 body → 같은 응답 (새 recordingId·토큰 없음), 다른 body → IDEMPOTENCY_KEY_REUSED', async () => {
    const { b, sessionId } = await completedSession();
    const first = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    const again = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('i'));
    expect(again).toStrictEqual(first);
    expect(
      await codeOf(b.clients.recordings.init({ sessionId, body: initBody([1, 2]) }, ik('i'))),
    ).toBe('IDEMPOTENCY_KEY_REUSED');

    await b.clients.uploadTransport.uploadPart({
      target: firstTarget(first.parts),
      data: partData(),
    });
    const done = await b.clients.recordings.complete(
      { recordingId: first.recordingId, body: completeBody() },
      ik('k'),
    );
    expect(
      await b.clients.recordings.complete(
        { recordingId: first.recordingId, body: completeBody() },
        ik('k'),
      ),
    ).toStrictEqual(done);
  });
});

describe('브라우저 조립 — `online` 이벤트가 offline-queued 연결을 복구한다 (AC-4-31 e2e 경로)', () => {
  it('window online 이벤트 → connectivity.goOnline()', async () => {
    const { createBrowserMockApiClients } = await import('../index');
    const browser = createBrowserMockApiClients(undefined);
    expect(browser.connectivity.isOnline()).toBe(false);
    globalThis.dispatchEvent(new Event('online'));
    expect(browser.connectivity.isOnline()).toBe(true);
  });
});
