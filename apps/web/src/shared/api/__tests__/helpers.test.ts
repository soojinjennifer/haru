import { ErrorEnvelopeSchema, HaruApiError, HealthResponseSchema } from '@haru/contracts';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createSeededIdFactory } from '../../lib/idFactory';
import { parseRequest, parseResponse } from '../helpers/parseResponse';
import { createRequestId, readRequestId, REQUEST_ID_HEADER } from '../helpers/requestId';
import {
  buildErrorEnvelope,
  isHaruApiError,
  isNetworkError,
  NetworkError,
  toErrorEnvelope,
  toHaruApiError,
} from '../helpers/toErrorEnvelope';
import { createImmediateTimer, createRealTimer, withDelay } from '../helpers/withDelay';

describe('parseResponse — Adapter 경계 contracts 검증 (Plan §7.3)', () => {
  const valid = { status: 'ok', version: '1.0.0', serverTime: '2026-01-01T00:00:00.000Z' };

  it('schema 를 통과한 값을 그대로 돌려준다', () => {
    expect(
      parseResponse(HealthResponseSchema, valid, {
        operation: 'GET /v1/health',
        direction: 'response',
      }),
    ).toStrictEqual(valid);
  });

  it('parse 실패는 VALIDATION_FAILED 로 바뀐다', () => {
    expect.assertions(3);

    try {
      parseResponse(
        HealthResponseSchema,
        { status: 'down' },
        { operation: 'GET /v1/health', direction: 'response' },
      );
    } catch (error) {
      expect(isHaruApiError(error)).toBe(true);
      expect((error as HaruApiError).code).toBe('VALIDATION_FAILED');
      expect((error as HaruApiError).httpStatus).toBe(400);
    }
  });

  it('details.issues 에 입력값 원문(PII 가능)을 담지 않는다', () => {
    expect.assertions(2);

    try {
      parseRequest(
        z.object({ childName: z.string().min(50) }),
        { childName: 'Mina' },
        {
          operation: 'POST /v1/children',
        },
      );
    } catch (error) {
      const serialized = JSON.stringify((error as HaruApiError).details);
      expect(serialized).not.toContain('Mina');
      expect(serialized).toContain('childName');
    }
  });
});

describe('toErrorEnvelope — 오류 정규화', () => {
  it('buildErrorEnvelope 결과는 contracts Error Envelope 을 통과한다', () => {
    const envelope = buildErrorEnvelope('INTERNAL_ERROR', 'boom', { requestId: 'req-1' });

    expect(ErrorEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expect(envelope.error.requestId).toBe('req-1');
  });

  it('Error Envelope 형태의 body 를 HaruApiError 로 바꾼다', () => {
    const error = toHaruApiError({
      error: { code: 'RATE_LIMITED', message: 'slow down' },
    });

    expect(error.code).toBe('RATE_LIMITED');
    expect(error.httpStatus).toBe(429);
  });

  it('Envelope 규약을 어긴 body 는 INTERNAL_ERROR 로 떨어진다', () => {
    expect(toHaruApiError({ oops: true }).code).toBe('INTERNAL_ERROR');
    expect(toHaruApiError(undefined).code).toBe('INTERNAL_ERROR');
  });

  it('서버가 requestId 를 주지 않으면 클라이언트가 만든 값을 유지한다', () => {
    const error = toHaruApiError(
      { error: { code: 'INTERNAL_ERROR', message: 'x' } },
      { requestId: 'client-req' },
    );

    expect(error.requestId).toBe('client-req');
  });

  it('NetworkError 는 Error Envelope 이 없는 실패로 구분된다', () => {
    const error = new NetworkError('offline', { timedOut: true });

    expect(isNetworkError(error)).toBe(true);
    expect(isHaruApiError(error)).toBe(false);
    expect(error.timedOut).toBe(true);
    expect(toErrorEnvelope(error).error.code).toBe('PROVIDER_UNAVAILABLE');
  });

  it('HaruApiError 는 wire 형식으로 되돌아간다', () => {
    const error = new HaruApiError('CONSENT_REQUIRED', 'need consent', { requestId: 'r' });

    expect(toErrorEnvelope(error)).toStrictEqual({
      error: { code: 'CONSENT_REQUIRED', message: 'need consent', requestId: 'r' },
    });
  });
});

describe('withDelay — 주입 timer (Plan §8.3 "테스트에서 0ms")', () => {
  it('immediate timer 는 즉시 해소된다', async () => {
    const start = performance.now();
    const value = await withDelay(createImmediateTimer(), 5_000, () => 'done');

    expect(value).toBe('done');
    expect(performance.now() - start).toBeLessThan(1_000);
  });

  it('real timer 는 주어진 시간만큼 기다린다', async () => {
    vi.useFakeTimers();

    try {
      const promise = withDelay(createRealTimer(), 1_500, () => 'done');
      await vi.advanceTimersByTimeAsync(1_500);
      await expect(promise).resolves.toBe('done');
    } finally {
      vi.useRealTimers();
    }
  });

  it('real timer 는 abort 신호에 반응한다', async () => {
    const controller = new AbortController();
    const promise = withDelay(createRealTimer(), 5_000, () => 'done', controller.signal);

    controller.abort();

    await expect(promise).rejects.toThrow();
  });
});

describe('requestId — X-Request-Id 규약 (API_CONTRACTS §1)', () => {
  it('주입된 생성기로 결정적인 uuid 를 만든다', () => {
    expect(createRequestId(createSeededIdFactory('seed'))).toBe(
      createRequestId(createSeededIdFactory('seed')),
    );
  });

  it('서버가 echo 한 헤더 값을 우선한다', () => {
    const headers = new Headers({ [REQUEST_ID_HEADER]: 'server-echo' });

    expect(readRequestId(headers, 'client')).toBe('server-echo');
    expect(readRequestId(new Headers(), 'client')).toBe('client');
  });
});
