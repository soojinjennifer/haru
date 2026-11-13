/**
 * Stage 5 Http Adapter 골격 — `S5-A`. 실제 Backend 연동은 `BACKEND_INTEGRATION_PENDING` 이며,
 * 여기서는 **경로 · method · Idempotency-Key · schema parse** 규약만 고정한다 (Mock ↔ Http 교체 가능성, AC-5-50).
 */
import { HaruApiError } from '@haru/contracts';
import { describe, expect, it, vi } from 'vitest';

import { createSeededIdFactory } from '../../lib/idFactory';
import { createHttpApiClients, createHttpClient } from '../http';
import { createHttpAnalysisApi } from '../http/HttpAnalysisApi';
import { createHttpReflectionApi } from '../http/HttpReflectionApi';

const BASE_URL = 'https://api.example.invalid/v1';
const SESSION_ID = '77777777-7777-4777-8777-000000000009';

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
    idFactory: createSeededIdFactory('http-stage5'),
  });
}

function call(fetchImpl: ReturnType<typeof vi.fn>, index = 0): [string, RequestInit] {
  return fetchImpl.mock.calls[index] as unknown as [string, RequestInit];
}

const REFLECTION = {
  id: '99999999-9999-4999-8999-000000000001',
  sessionId: SESSION_ID,
  rating: 4,
  checks: ['engaged'],
  note: 'Moon',
  submittedAt: '2026-01-01T00:20:00.000Z',
};

describe('createHttpApiClients — Stage 5 도메인 포함', () => {
  it('reflections · analysis 를 만든다 (클립 메서드 없음 — `N5-22`)', () => {
    const clients = createHttpApiClients({
      baseUrl: BASE_URL,
      fetchImpl: vi.fn() as unknown as typeof fetch,
    });
    expect(Object.keys(clients.reflections)).toStrictEqual(['submit']);
    expect(Object.keys(clients.analysis)).toStrictEqual(['getStatus']);
  });
});

describe('HttpReflectionApi', () => {
  it('submit = POST /sessions/:id/reflection + Idempotency-Key + body parse', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(REFLECTION)));
    const api = createHttpReflectionApi(client(fetchImpl as unknown as typeof fetch));

    const result = await api.submit(
      { sessionId: SESSION_ID, body: { rating: 4, checks: ['engaged'], note: '  Moon ' } },
      { idempotencyKey: 'ik-r' },
    );

    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/sessions/${SESSION_ID}/reflection`);
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Idempotency-Key')).toBe('ik-r');
    expect(JSON.parse(String(init.body))).toStrictEqual({
      rating: 4,
      checks: ['engaged'],
      note: 'Moon',
    });
    expect(result).toStrictEqual(REFLECTION);
  });

  it('빈 회고는 보내기 전에 거부된다 (요청 0)', async () => {
    const fetchImpl = vi.fn();
    const api = createHttpReflectionApi(client(fetchImpl as unknown as typeof fetch));
    await expect(async () =>
      api.submit(
        { sessionId: SESSION_ID, body: { rating: null, checks: [], note: null } },
        {
          idempotencyKey: 'ik',
        },
      ),
    ).rejects.toBeDefined();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('HttpAnalysisApi', () => {
  it('getStatus = GET /sessions/:id/analysis + 응답 parse', async () => {
    const body = {
      sessionId: SESSION_ID,
      sessionStatus: 'analyzed',
      mode: 'recorded',
      outcome: 'full',
      shortFeedback: { text: 'Lovely.' },
    };
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(body)));
    const api = createHttpAnalysisApi(client(fetchImpl as unknown as typeof fetch));

    expect(await api.getStatus({ sessionId: SESSION_ID })).toStrictEqual(body);
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/sessions/${SESSION_ID}/analysis`);
    expect(init.method).toBe('GET');
  });

  it('contract 위반 응답(`outcome` + `analyzing`) → VALIDATION_FAILED', async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(
        jsonResponse({
          sessionId: SESSION_ID,
          sessionStatus: 'analyzing',
          mode: 'recorded',
          outcome: 'full',
          shortFeedback: null,
        }),
      ),
    );
    const api = createHttpAnalysisApi(client(fetchImpl as unknown as typeof fetch));
    const error: unknown = await api.getStatus({ sessionId: SESSION_ID }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HaruApiError);
    expect((error as HaruApiError).code).toBe('VALIDATION_FAILED');
  });
});
