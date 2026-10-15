/**
 * Stage 4 Http Adapter 골격 — `S4-C`. 실제 Backend 연동은 `BACKEND_INTEGRATION_PENDING` 이며,
 * 여기서는 **경로 · method · Idempotency-Key · schema parse** 규약만 고정한다 (Mock ↔ Http 교체 가능성).
 */
import { HaruApiError } from '@haru/contracts';
import { describe, expect, it, vi } from 'vitest';

import { createReadySessionFixture } from '../../../mocks/fixtures/sessions';
import { createSeededIdFactory } from '../../lib/idFactory';
import { createHttpApiClients, createHttpClient, createTusUploadTransport } from '../http';
import { createHttpNotificationApi } from '../http/HttpNotificationApi';
import { createHttpRecordingApi } from '../http/HttpRecordingApi';
import { createHttpSessionApi } from '../http/HttpSessionApi';
import { isUploadOffsetConflictError } from '../upload-transport';

const BASE_URL = 'https://api.example.invalid/v1';
const SESSION_ID = '77777777-7777-4777-8777-000000000009';
const RECORDING_ID = '88888888-8888-4888-8888-000000000009';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function client(fetchImpl: typeof fetch) {
  return createHttpClient({
    baseUrl: BASE_URL,
    fetchImpl,
    idFactory: createSeededIdFactory('http-stage4'),
  });
}

function call(fetchImpl: ReturnType<typeof vi.fn>, index = 0): [string, RequestInit] {
  return fetchImpl.mock.calls[index] as unknown as [string, RequestInit];
}

const SESSION = createReadySessionFixture({
  id: SESSION_ID,
  mode: 'recorded',
  book: null,
  readingContext: null,
  readyAt: '2026-01-01T00:00:00.000Z',
});

describe('createHttpApiClients — Stage 4 도메인 포함', () => {
  it('sessions · recordings · uploadTransport · notifications 를 만든다', () => {
    const clients = createHttpApiClients({
      baseUrl: BASE_URL,
      fetchImpl: vi.fn() as unknown as typeof fetch,
    });
    expect(typeof clients.sessions.transition).toBe('function');
    expect(typeof clients.recordings.complete).toBe('function');
    expect(typeof clients.uploadTransport.resume).toBe('function');
    expect(typeof clients.notifications.deletePushDevice).toBe('function');
  });
});

describe('HttpSessionApi — 경로 · IK · parse', () => {
  it('transition = POST /sessions/:id/transitions + Idempotency-Key', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse({ session: SESSION })));
    const api = createHttpSessionApi(client(fetchImpl as unknown as typeof fetch));

    await api.transition(
      {
        sessionId: SESSION_ID,
        body: { to: 'abandoned', occurredAt: '2026-01-01T00:01:00.000Z' },
      },
      { idempotencyKey: 'ik-1' },
    );

    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/sessions/${SESSION_ID}/transitions`);
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Idempotency-Key')).toBe('ik-1');
    expect(JSON.parse(String(init.body))).toStrictEqual({
      to: 'abandoned',
      occurredAt: '2026-01-01T00:01:00.000Z',
    });
  });

  it('list = GET /children/:childId/sessions?limit&status', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse({ items: [], nextCursor: null })));
    const api = createHttpSessionApi(client(fetchImpl as unknown as typeof fetch));
    await api.list({ childId: 'c-1', query: { status: 'analyzed' } });
    expect(call(fetchImpl)[0]).toBe(`${BASE_URL}/children/c-1/sessions?limit=20&status=analyzed`);
  });

  it('응답이 contract 를 어기면 VALIDATION_FAILED', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse({ session: { id: 'x' } })));
    const api = createHttpSessionApi(client(fetchImpl as unknown as typeof fetch));
    await expect(api.getDetail({ sessionId: SESSION_ID })).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
    });
  });
});

describe('HttpRecordingApi — 경로', () => {
  it('init · upload-tokens · complete · status', async () => {
    const fetchImpl = vi.fn(() => Promise.reject(new Error('stop')));
    const api = createHttpRecordingApi(client(fetchImpl as unknown as typeof fetch));
    const parts = [{ partNo: 1, mimeType: 'audio/mp4', container: 'mp4' as const, bytes: 10 }];

    await api
      .init(
        { sessionId: SESSION_ID, body: { parts, totalDurationSeconds: 10 } },
        { idempotencyKey: 'a' },
      )
      .catch(() => undefined);
    await api
      .refreshTokens({ recordingId: RECORDING_ID, body: { partNos: [1] } }, { idempotencyKey: 'b' })
      .catch(() => undefined);
    await api
      .complete(
        {
          recordingId: RECORDING_ID,
          body: { parts: [{ partNo: 1, bytes: 10, sha256: 'a'.repeat(64), durationSeconds: 10 }] },
        },
        { idempotencyKey: 'c' },
      )
      .catch(() => undefined);
    await api.status({ recordingId: RECORDING_ID }).catch(() => undefined);

    expect(
      fetchImpl.mock.calls.map((_, index) => [
        call(fetchImpl, index)[1].method,
        call(fetchImpl, index)[0],
      ]),
    ).toStrictEqual([
      ['POST', `${BASE_URL}/sessions/${SESSION_ID}/recordings`],
      ['POST', `${BASE_URL}/recordings/${RECORDING_ID}/upload-tokens`],
      ['POST', `${BASE_URL}/recordings/${RECORDING_ID}/complete`],
      ['GET', `${BASE_URL}/recordings/${RECORDING_ID}`],
    ]);
  });
});

describe('HttpNotificationApi — 204 응답', () => {
  it('DELETE /push-devices/:id 는 body 없이 끝난다', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
    const api = createHttpNotificationApi(client(fetchImpl as unknown as typeof fetch));
    await expect(api.deletePushDevice({ deviceId: 'd-1' })).resolves.toBeUndefined();
    expect(call(fetchImpl)[0]).toBe(`${BASE_URL}/push-devices/d-1`);
    expect(call(fetchImpl)[1].method).toBe('DELETE');
  });

  it('PUT 설정에는 Idempotency-Key 를 붙이지 않는다', async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(
        jsonResponse({
          cardRefreshTime: '07:00',
          reminderDays: [],
          reminderTime: null,
          pushEnabled: true,
        }),
      ),
    );
    const api = createHttpNotificationApi(client(fetchImpl as unknown as typeof fetch));
    await api.updatePreferences({ body: { pushEnabled: true } });
    expect(new Headers(call(fetchImpl)[1].headers).get('Idempotency-Key')).toBeNull();
  });
});

describe('TusUploadTransport 골격 — TUS core 규약', () => {
  const target = {
    partNo: 1,
    endpoint: 'https://uploads.example.invalid/tus/obj-1',
    uploadToken: 'tok',
    objectKey: 'obj-1',
    expiresAt: '2026-01-01T02:00:00.000Z',
  };
  const data = new Blob([new Uint8Array(10)]);

  it('uploadPart = PATCH offset 0 + Tus-Resumable + Bearer 토큰', async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 204, headers: { 'Upload-Offset': '10' } })),
    );
    const transport = createTusUploadTransport({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const result = await transport.uploadPart({ target, data });

    const [url, init] = call(fetchImpl);
    const headers = new Headers(init.headers);
    expect(url).toBe(target.endpoint);
    expect(init.method).toBe('PATCH');
    expect(headers.get('Upload-Offset')).toBe('0');
    expect(headers.get('Tus-Resumable')).toBe('1.0.0');
    expect(headers.get('Authorization')).toBe('Bearer tok');
    expect(result).toStrictEqual({ partNo: 1, bytesUploaded: 10, bytesTotal: 10, bytesSent: 10 });
  });

  it('409 → HEAD 로 서버 offset 을 읽어 UploadOffsetConflictError', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 409 }))
      .mockResolvedValueOnce(
        new Response(null, { status: 200, headers: { 'Upload-Offset': '4' } }),
      );
    const transport = createTusUploadTransport({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const error = await transport.uploadPart({ target, data }).catch((caught: unknown) => caught);
    expect(isUploadOffsetConflictError(error)).toBe(true);
    expect((error as { serverOffset: number }).serverOffset).toBe(4);
  });

  it('resume = HEAD 후 남은 바이트만 PATCH, 끝난 part 는 0 바이트', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 200, headers: { 'Upload-Offset': '6' } }))
      .mockResolvedValueOnce(
        new Response(null, { status: 204, headers: { 'Upload-Offset': '10' } }),
      );
    const transport = createTusUploadTransport({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const result = await transport.resume({ target, data });
    expect(call(fetchImpl, 1)[1].method).toBe('PATCH');
    expect(new Headers(call(fetchImpl, 1)[1].headers).get('Upload-Offset')).toBe('6');
    expect((call(fetchImpl, 1)[1].body as Blob).size).toBe(4);
    expect(result.bytesSent).toBe(4);

    const done = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 200, headers: { 'Upload-Offset': '10' } })),
    );
    const finished = createTusUploadTransport({ fetchImpl: done as unknown as typeof fetch });
    expect((await finished.resume({ target, data })).bytesSent).toBe(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('401 → UPLOAD_TOKEN_EXPIRED, 410 → RECORDING_DELETED, https 아닌 endpoint 거부', async () => {
    const expired = createTusUploadTransport({
      fetchImpl: (() => Promise.resolve(new Response(null, { status: 401 }))) as typeof fetch,
    });
    await expect(expired.uploadPart({ target, data })).rejects.toMatchObject({
      code: 'UPLOAD_TOKEN_EXPIRED',
    });
    const gone = createTusUploadTransport({
      fetchImpl: (() => Promise.resolve(new Response(null, { status: 410 }))) as typeof fetch,
    });
    await expect(gone.uploadPart({ target, data })).rejects.toBeInstanceOf(HaruApiError);
    await expect(
      gone.uploadPart({ target: { ...target, endpoint: 'http://plain.invalid/x' }, data }),
    ).rejects.toThrow(/https/);
  });
});
