/**
 * Http Adapter 공통 클라이언트 — **골격만** (Plan §16 D-7).
 *
 * 실제 Backend 는 이 프로젝트에서 구현하지 않는다 (`.claude/rules/backend.md` §1).
 * 따라서 이 파일은 `docs/API_CONTRACTS.md` 의 규약(base path · 헤더 · Error Envelope)을
 * 코드로 고정할 뿐이고, 실제 연동 검증은 `BACKEND_INTEGRATION_PENDING` 이다.
 *
 * 고정하는 규약
 * - base URL 은 `/v1` 를 포함한 절대 URL 이며 **`https:` 만 허용**한다 (평문 전송 차단).
 * - 모든 요청에 `X-Request-Id`(uuid) 를 붙이고, 응답이 echo 하면 그 값을 오류에 싣는다.
 * - `Authorization: Bearer <token>` 은 주입된 훅에서만 가져온다. 토큰을 이 파일에 저장하지 않는다.
 * - 응답 body 는 contracts schema 로 parse 한다 (실패 → `VALIDATION_FAILED`).
 * - 실패 응답 body 는 Error Envelope 으로 해석한다 (§1.1).
 * - 타임아웃 · 전송 실패는 `NetworkError`.
 */
import type { ZodType } from 'zod';

import { createRandomIdFactory, type IdFactory } from '../../lib/idFactory';
import { parseResponse } from '../helpers/parseResponse';
import { createRequestId, readRequestId, REQUEST_ID_HEADER } from '../helpers/requestId';
import { NetworkError, toHaruApiError } from '../helpers/toErrorEnvelope';

export const DEFAULT_HTTP_TIMEOUT_MS = 15_000;

/** 토큰 주입 훅. Stage 2 에서 `AuthGateway` 가 이 자리에 연결된다. */
export type AuthTokenProvider = () => string | null | Promise<string | null>;

export interface HttpClientOptions {
  /** 예: `https://api.example.com/v1` — `https:` 가 아니면 생성 시점에 거부한다. */
  baseUrl: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  getAuthToken?: AuthTokenProvider;
  idFactory?: IdFactory;
}

export interface HttpRequestConfig<T> {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** base URL 뒤에 붙는 경로 (`/health`). */
  path: string;
  /** 응답 body 검증 schema (`packages/contracts`). */
  schema: ZodType<T>;
  body?: unknown;
  /** 공개 endpoint 는 `false`. 기본은 인증 필요. */
  auth?: boolean;
  /** 부작용이 있는 요청에만 붙인다 (API_CONTRACTS §1 Idempotency). */
  idempotencyKey?: string;
  signal?: AbortSignal | undefined;
  /**
   * 페이지가 내려가는 중(`pagehide`)에도 전송을 이어 가게 한다 — `fetch` `keepalive`.
   * best-effort 전용이다(본문 64KB 상한 · 응답을 기다릴 수 없을 수 있다). 기본 `false`.
   */
  keepalive?: boolean;
}

export interface HttpClient {
  request<T>(config: HttpRequestConfig<T>): Promise<T>;
  /**
   * 응답 body 가 없는 요청 (`204 No Content` — 예: `DELETE /v1/push-devices/:id`).
   * 실패 응답은 `request` 와 똑같이 Error Envelope 으로 해석한다.
   */
  send(config: Omit<HttpRequestConfig<never>, 'schema'>): Promise<void>;
}

/** `https:` 전용 검사 + 뒤 슬래시 정리. */
export function normalizeBaseUrl(rawBaseUrl: string): string {
  let url: URL;

  try {
    url = new URL(rawBaseUrl);
  } catch (cause) {
    throw new Error(`VITE_API_BASE_URL is not a valid absolute URL.`, { cause });
  }

  if (url.protocol !== 'https:') {
    throw new Error(
      `VITE_API_BASE_URL must use https: (received "${url.protocol}"). Plain HTTP is not allowed.`,
    );
  }

  return url.href.replace(/\/+$/, '');
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl}/${path.replace(/^\/+/, '')}`;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_HTTP_TIMEOUT_MS;
  const idFactory = options.idFactory ?? createRandomIdFactory();
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  /** 전송 + 오류 해석까지. 성공 응답의 body 해석은 호출자가 고른다. */
  async function exchange(
    config: Omit<HttpRequestConfig<unknown>, 'schema'>,
  ): Promise<{ body: unknown; requestId: string; operation: string }> {
    const operation = `${config.method} ${config.path}`;
    const requestId = createRequestId(idFactory);

    const headers = new Headers({ Accept: 'application/json' });
    headers.set(REQUEST_ID_HEADER, requestId);
    if (config.body !== undefined) headers.set('Content-Type', 'application/json');
    if (config.idempotencyKey !== undefined) {
      headers.set('Idempotency-Key', config.idempotencyKey);
    }

    if (config.auth !== false && options.getAuthToken !== undefined) {
      const token = await options.getAuthToken();
      if (token !== null && token.length > 0) headers.set('Authorization', `Bearer ${token}`);
    }

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort();
    }, timeoutMs);

    const signal =
      config.signal === undefined
        ? timeoutController.signal
        : AbortSignal.any([config.signal, timeoutController.signal]);

    let response: Response;

    try {
      response = await fetchImpl(joinUrl(baseUrl, config.path), {
        method: config.method,
        headers,
        ...(config.body === undefined ? {} : { body: JSON.stringify(config.body) }),
        ...(config.keepalive === true ? { keepalive: true } : {}),
        signal,
      });
    } catch (cause) {
      const timedOut = timeoutController.signal.aborted;
      throw new NetworkError(
        timedOut ? `Request timed out: ${operation}` : `Request failed to reach the server.`,
        { timedOut, cause },
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const echoedRequestId = readRequestId(response.headers, requestId);
    const body = await readBody(response);

    if (!response.ok) {
      throw toHaruApiError(body, { requestId: echoedRequestId });
    }

    return { body, requestId: echoedRequestId, operation };
  }

  return {
    async request<T>(config: HttpRequestConfig<T>): Promise<T> {
      const { body, requestId, operation } = await exchange(config);

      return parseResponse(config.schema, body, {
        operation,
        direction: 'response',
        requestId,
      });
    },

    async send(config: Omit<HttpRequestConfig<never>, 'schema'>): Promise<void> {
      await exchange(config);
    },
  };
}
