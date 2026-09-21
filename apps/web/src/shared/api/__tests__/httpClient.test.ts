import type { HaruApiError } from '@haru/contracts';
import { describe, expect, it, vi } from 'vitest';

import { createSeededIdFactory } from '../../lib/idFactory';
import { isHaruApiError, isNetworkError, REQUEST_ID_HEADER } from '../helpers';
import { createHttpApiClients, createHttpClient, normalizeBaseUrl } from '../http';
import { createHttpHealthApi, HEALTH_PATH } from '../http/HttpHealthApi';

const BASE_URL = 'https://api.example.invalid/v1';

const HEALTH_BODY = {
  status: 'ok',
  version: '1.0.0',
  serverTime: '2026-01-01T00:00:00.000Z',
};

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function client(fetchImpl: typeof fetch) {
  return createHttpClient({
    baseUrl: BASE_URL,
    fetchImpl,
    idFactory: createSeededIdFactory('http-test'),
  });
}

describe('normalizeBaseUrl — https 전용 (Plan §16 D-7)', () => {
  it('https URL 을 받아들이고 뒤 슬래시를 정리한다', () => {
    expect(normalizeBaseUrl('https://api.example.invalid/v1/')).toBe(
      'https://api.example.invalid/v1',
    );
  });

  it('비-HTTPS URL 을 거부한다', () => {
    expect(() => normalizeBaseUrl('http://api.example.invalid/v1')).toThrow(/https:/);
    expect(() => normalizeBaseUrl('http://localhost:3000/v1')).toThrow(/https:/);
  });

  it('절대 URL 이 아니면 거부한다', () => {
    expect(() => normalizeBaseUrl('/v1')).toThrow(/valid absolute URL/);
    expect(() => normalizeBaseUrl('')).toThrow(/valid absolute URL/);
  });
});

describe('httpClient — 요청 규약 (API_CONTRACTS §1)', () => {
  it('X-Request-Id(uuid) 를 붙이고 base path 뒤에 경로를 잇는다', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(HEALTH_BODY)));

    await createHttpHealthApi(client(fetchImpl as unknown as typeof fetch)).get();

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}${HEALTH_PATH}`);

    const headers = new Headers(init.headers);
    expect(headers.get(REQUEST_ID_HEADER)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('공개 endpoint(health)에는 Authorization 을 붙이지 않는다', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(HEALTH_BODY)));
    const withAuth = createHttpClient({
      baseUrl: BASE_URL,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      getAuthToken: () => 'token-abc',
      idFactory: createSeededIdFactory('http-test'),
    });

    await createHttpHealthApi(withAuth).get();

    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(new Headers(init.headers).has('Authorization')).toBe(false);
  });

  it('인증이 필요한 요청에는 주입 훅의 토큰을 Bearer 로 붙인다', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(HEALTH_BODY)));
    const withAuth = createHttpClient({
      baseUrl: BASE_URL,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      getAuthToken: () => Promise.resolve('token-abc'),
      idFactory: createSeededIdFactory('http-test'),
    });

    await withAuth.request({
      method: 'GET',
      path: '/me',
      schema: (await import('@haru/contracts')).HealthResponseSchema,
    });

    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer token-abc');
  });
});

describe('httpClient — 응답 처리', () => {
  it('성공 응답을 contracts schema 로 parse 한다', async () => {
    const api = createHttpHealthApi(
      client(vi.fn(() => Promise.resolve(jsonResponse(HEALTH_BODY))) as unknown as typeof fetch),
    );

    await expect(api.get()).resolves.toStrictEqual(HEALTH_BODY);
  });

  it('계약과 다른 성공 응답은 VALIDATION_FAILED 로 막힌다', async () => {
    const api = createHttpHealthApi(
      client(
        vi.fn(() => Promise.resolve(jsonResponse({ status: 'down' }))) as unknown as typeof fetch,
      ),
    );

    await expect(api.get()).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });

  it('실패 응답 body 를 Error Envelope 으로 해석한다', async () => {
    const api = createHttpHealthApi(
      client(
        vi.fn(() =>
          Promise.resolve(
            jsonResponse(
              { error: { code: 'RATE_LIMITED', message: 'slow down' } },
              { status: 429, headers: { [REQUEST_ID_HEADER]: 'server-echo' } },
            ),
          ),
        ) as unknown as typeof fetch,
      ),
    );

    const error = await api.get().catch((value: unknown) => value);

    expect(isHaruApiError(error)).toBe(true);
    expect((error as HaruApiError).code).toBe('RATE_LIMITED');
    expect((error as HaruApiError).requestId).toBe('server-echo');
  });

  it('전송 실패는 NetworkError 다 (Error Envelope 없음)', async () => {
    const api = createHttpHealthApi(
      client(vi.fn(() => Promise.reject(new TypeError('failed'))) as unknown as typeof fetch),
    );

    const error = await api.get().catch((value: unknown) => value);

    expect(isNetworkError(error)).toBe(true);
  });

  it('타임아웃은 NetworkError(timedOut) 다', async () => {
    vi.useFakeTimers();

    try {
      const hangingFetch = vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      );

      const api = createHttpHealthApi(
        createHttpClient({
          baseUrl: BASE_URL,
          fetchImpl: hangingFetch as unknown as typeof fetch,
          timeoutMs: 100,
          idFactory: createSeededIdFactory('http-test'),
        }),
      );

      const promise = api.get().catch((value: unknown) => value);
      await vi.advanceTimersByTimeAsync(200);
      const error = await promise;

      expect(isNetworkError(error)).toBe(true);
      expect((error as { timedOut: boolean }).timedOut).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('createHttpApiClients — Adapter 집합', () => {
  it('ApiClients 형태를 만족한다', () => {
    const clients = createHttpApiClients({
      baseUrl: BASE_URL,
      fetchImpl: vi.fn() as unknown as typeof fetch,
    });

    expect(typeof clients.health.get).toBe('function');
  });
});
