/**
 * Stage 8 Http Adapter 골격 — `S8-A` (Rev 12 `C8-1`~`C8-4` · `C8-9`). 실제 Backend 연동은 `BACKEND_INTEGRATION_PENDING`
 * (`P8-BIP-01`~`04` · `07`) 이며, 여기서는 **경로 · method · Idempotency-Key · schema parse** 규약만 고정한다 (AC-8-11).
 * 응답 본문은 Mock 이 만든 값을 그대로 쓴다 — 두 Adapter 가 같은 contract 를 공유한다는 증거.
 */
import { HaruApiError } from '@haru/contracts';
import { describe, expect, it, vi } from 'vitest';

import { createMockApiClientsBundle, MOCK_RECORDING_SESSION_IDS } from '../../../mocks';
import { createSeededIdFactory } from '../../lib/idFactory';
import { createImmediateTimer } from '../helpers';
import { createHttpApiClients, createHttpClient } from '../http';
import { createHttpAccountApi } from '../http/HttpAccountApi';
import { createHttpDataManagementApi } from '../http/HttpDataManagementApi';
import { childSessionsPath } from '../http/HttpSessionApi';

const BASE_URL = 'https://api.example.invalid/v1';
const CHILD_ID = '44444444-4444-4444-8444-444444444444';
const SESSION_ID = MOCK_RECORDING_SESSION_IDS.pending;
const REQUEST_ID = '9b2f6a52-6f0e-4f7b-9d5c-1b2c3d4e5f60';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function client(fetchImpl: ReturnType<typeof vi.fn>) {
  return createHttpClient({
    baseUrl: BASE_URL,
    fetchImpl: fetchImpl as unknown as typeof fetch,
    idFactory: createSeededIdFactory('http-stage8'),
  });
}

function call(fetchImpl: ReturnType<typeof vi.fn>, index = 0): [string, RequestInit] {
  return fetchImpl.mock.calls[index] as unknown as [string, RequestInit];
}

function header(init: RequestInit, name: string): string | null {
  return new Headers(init.headers).get(name);
}

async function mockBodies() {
  const { clients } = createMockApiClientsBundle({ timer: createImmediateTimer() });
  const summary = await clients.dataManagement.summary();
  const page = await clients.dataManagement.listRecordingSessions({ childId: CHILD_ID });
  const deleted = await clients.dataManagement.deleteSessionRecording(
    { sessionId: SESSION_ID },
    { idempotencyKey: 'ik-del' },
  );
  const created = await clients.dataManagement.createDeletionRequest(
    { body: { scope: 'all_data', confirmation: true } },
    { idempotencyKey: 'ik-all' },
  );
  const account = await createMockApiClientsBundle({
    timer: createImmediateTimer(),
  }).clients.account.deleteAccount({ body: { confirmation: true } }, { idempotencyKey: 'ik-a' });
  return { summary, page, deleted, created, account };
}

describe('createHttpApiClients — Stage 8 도메인 포함', () => {
  it('dataManagement · account 메서드 목록 (동의 이력 없음 — `N8-06` ⓑ)', () => {
    const clients = createHttpApiClients({
      baseUrl: BASE_URL,
      fetchImpl: vi.fn() as unknown as typeof fetch,
    });
    expect(Object.keys(clients.dataManagement).sort()).toStrictEqual([
      'createDeletionRequest',
      'deleteSessionRecording',
      'getDeletionRequest',
      'listRecordingSessions',
      'summary',
    ]);
    expect(Object.keys(clients.account)).toStrictEqual(['deleteAccount']);
    expect(Object.keys(clients.consents)).not.toContain('history');
  });

  it('`https:` 가 아닌 base URL 은 거부한다 (평문 전송 차단)', () => {
    expect(() =>
      createHttpApiClients({ baseUrl: 'http://api.example.invalid/v1', fetchImpl: vi.fn() }),
    ).toThrow(/https/);
  });
});

describe('HttpDataManagementApi', () => {
  it('summary → GET /data-management · contracts parse', async () => {
    const { summary } = await mockBodies();
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(summary));
    const api = createHttpDataManagementApi(client(fetchImpl));
    expect(await api.summary()).toStrictEqual(summary);
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/data-management`);
    expect(init.method).toBe('GET');
  });

  it('listRecordingSessions → 세션 목록 endpoint + `hasRecording=true` 고정 · cursor 전달', async () => {
    const { page } = await mockBodies();
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(page));
    const api = createHttpDataManagementApi(client(fetchImpl));
    expect(
      await api.listRecordingSessions({ childId: CHILD_ID, query: { limit: 5, cursor: 'c1' } }),
    ).toStrictEqual(page);
    expect(call(fetchImpl)[0]).toBe(
      `${BASE_URL}/children/${CHILD_ID}/sessions?limit=5&hasRecording=true&cursor=c1`,
    );
  });

  it('deleteSessionRecording → DELETE /sessions/:id/recording · IK 필수', async () => {
    const { deleted } = await mockBodies();
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(deleted));
    const api = createHttpDataManagementApi(client(fetchImpl));
    expect(
      await api.deleteSessionRecording({ sessionId: SESSION_ID }, { idempotencyKey: 'ik-1' }),
    ).toStrictEqual(deleted);
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/sessions/${SESSION_ID}/recording`);
    expect(init.method).toBe('DELETE');
    expect(header(init, 'Idempotency-Key')).toBe('ik-1');
  });

  it('createDeletionRequest → POST /data-deletion-requests · IK · body = scope + confirmation 만', async () => {
    const { created } = await mockBodies();
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(created));
    const api = createHttpDataManagementApi(client(fetchImpl));
    await api.createDeletionRequest(
      { body: { scope: 'all_data', confirmation: true } },
      { idempotencyKey: 'ik-2' },
    );
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/data-deletion-requests`);
    expect(init.method).toBe('POST');
    expect(header(init, 'Idempotency-Key')).toBe('ik-2');
    expect(JSON.parse(String(init.body))).toStrictEqual({ scope: 'all_data', confirmation: true });
  });

  it('createDeletionRequest — `confirmation` 이 `true` 가 아니면 보내지 않는다 (요청 0)', async () => {
    const fetchImpl = vi.fn();
    const api = createHttpDataManagementApi(client(fetchImpl));
    // 요청 parse 는 전송 전에 동기로 실패한다 (다른 Http Adapter 와 같은 규약)
    expect(() =>
      api.createDeletionRequest(
        { body: { scope: 'all_data', confirmation: false } as never },
        { idempotencyKey: 'ik-3' },
      ),
    ).toThrow();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('getDeletionRequest → GET /data-deletion-requests/:id · 응답 parse 실패는 VALIDATION_FAILED', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ id: REQUEST_ID, scope: 'all_data', status: 'gone' }));
    const api = createHttpDataManagementApi(client(fetchImpl));
    const error = await api.getDeletionRequest({ requestId: REQUEST_ID }).catch((e: unknown) => e);
    expect(error instanceof HaruApiError && error.code).toBe('VALIDATION_FAILED');
    expect(call(fetchImpl)[0]).toBe(`${BASE_URL}/data-deletion-requests/${REQUEST_ID}`);
  });

  it('`ACCOUNT_DELETION_PENDING`(409) Error Envelope 을 그대로 해석한다', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: 'ACCOUNT_DELETION_PENDING',
            message: 'Changes are paused.',
            requestId: 'r-1',
          },
        },
        409,
      ),
    );
    const api = createHttpDataManagementApi(client(fetchImpl));
    const error = await api
      .deleteSessionRecording({ sessionId: SESSION_ID }, { idempotencyKey: 'ik-4' })
      .catch((e: unknown) => e);
    expect(error instanceof HaruApiError && error.code).toBe('ACCOUNT_DELETION_PENDING');
  });
});

describe('HttpAccountApi', () => {
  it('deleteAccount → DELETE /me · IK · body = `{ confirmation: true }` · 응답 `DeletionRequest(account)`', async () => {
    const { account } = await mockBodies();
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(account));
    const api = createHttpAccountApi(client(fetchImpl));
    expect(
      await api.deleteAccount({ body: { confirmation: true } }, { idempotencyKey: 'ik-5' }),
    ).toStrictEqual(account);
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/me`);
    expect(init.method).toBe('DELETE');
    expect(header(init, 'Idempotency-Key')).toBe('ik-5');
    expect(JSON.parse(String(init.body))).toStrictEqual({ confirmation: true });
  });
});

describe('세션 목록 경로 — `hasRecording` 직렬화 (`C8-2`)', () => {
  it('생략하면 붙지 않고, 값이 있으면 `true` / `false` 문자열이다', () => {
    expect(childSessionsPath(CHILD_ID, {})).toBe(`/children/${CHILD_ID}/sessions?limit=20`);
    expect(childSessionsPath(CHILD_ID, { hasRecording: false })).toBe(
      `/children/${CHILD_ID}/sessions?limit=20&hasRecording=false`,
    );
  });
});
