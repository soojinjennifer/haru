import { describe, expect, it } from 'vitest';

import {
  ERROR_CODES,
  ERROR_CODE_HTTP_STATUS,
  ErrorCodeSchema,
  ErrorEnvelopeSchema,
  HaruApiError,
  httpStatusForErrorCode,
  isErrorEnvelope,
} from '../common/index.js';

describe('Error Code Catalogue (API_CONTRACTS §1.2)', () => {
  it('코드는 30 종이고 중복이 없다 (Stage 8 `C8-5` +1)', () => {
    expect(ERROR_CODES).toHaveLength(30);
    expect(new Set(ERROR_CODES).size).toBe(30);
  });

  /*
   * 30 종 전수 스냅샷. Stage 4 AC-4-08(신규 0건) 이후 유일한 추가는 Stage 8 `C8-5` `ACCOUNT_DELETION_PENDING`
   * (`DELETION_ALREADY_REQUESTED` 바로 뒤 — 문서 §1.2 표 순서). 값·순서가 바뀌면 문서 §1.2 와 함께 고친다.
   */
  it('코드 30 종의 값과 순서가 문서 §1.2 표와 같다 (AC-4-08 · AC-8-07)', () => {
    expect(ERROR_CODES).toEqual([
      'VALIDATION_FAILED',
      'AUTH_REQUIRED',
      'AUTH_TOKEN_EXPIRED',
      'FORBIDDEN',
      'CONSENT_REQUIRED',
      'CONSENT_VERSION_OUTDATED',
      'ONBOARDING_INCOMPLETE',
      'CHILD_NOT_FOUND',
      'CHILD_LIMIT_REACHED',
      'RESOURCE_NOT_FOUND',
      'SESSION_INVALID_TRANSITION',
      'SESSION_ALREADY_ACTIVE',
      'SESSION_MAX_DURATION_EXCEEDED',
      'RECORDING_NOT_ALLOWED_FOR_MODE',
      'UPLOAD_TOKEN_EXPIRED',
      'RECORDING_INCOMPLETE',
      'RECORDING_DELETED',
      'ANALYSIS_NOT_AVAILABLE',
      'REFLECTION_ALREADY_SUBMITTED',
      'REPORT_NOT_ELIGIBLE',
      'REPORT_NOT_READY',
      'PDF_NOT_READY',
      'GIFT_REQUEST_DUPLICATE',
      'BOOK_ALREADY_OWNED',
      'DELETION_ALREADY_REQUESTED',
      'ACCOUNT_DELETION_PENDING',
      'IDEMPOTENCY_KEY_REUSED',
      'RATE_LIMITED',
      'PROVIDER_UNAVAILABLE',
      'INTERNAL_ERROR',
    ]);
  });

  it('TRIAL_ACCOUNT_RESTRICTED 가 없다 (C-12 — 익명 Trial 계정 미채택)', () => {
    expect(ERROR_CODES).not.toContain('TRIAL_ACCOUNT_RESTRICTED');
    expect(ErrorCodeSchema.safeParse('TRIAL_ACCOUNT_RESTRICTED').success).toBe(false);
  });

  it('모든 코드에 HTTP status 매핑이 있고 4xx/5xx 범위다', () => {
    for (const code of ERROR_CODES) {
      const status = httpStatusForErrorCode(code);
      expect(status).toBe(ERROR_CODE_HTTP_STATUS[code]);
      expect(status).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThan(600);
    }
    expect(Object.keys(ERROR_CODE_HTTP_STATUS)).toHaveLength(30);
  });

  it('대표 코드의 status 가 문서 표와 일치한다', () => {
    expect(httpStatusForErrorCode('VALIDATION_FAILED')).toBe(400);
    expect(httpStatusForErrorCode('AUTH_REQUIRED')).toBe(401);
    expect(httpStatusForErrorCode('CONSENT_REQUIRED')).toBe(403);
    expect(httpStatusForErrorCode('SESSION_INVALID_TRANSITION')).toBe(409);
    expect(httpStatusForErrorCode('UPLOAD_TOKEN_EXPIRED')).toBe(410);
    expect(httpStatusForErrorCode('SESSION_MAX_DURATION_EXCEEDED')).toBe(422);
    expect(httpStatusForErrorCode('RATE_LIMITED')).toBe(429);
    expect(httpStatusForErrorCode('INTERNAL_ERROR')).toBe(500);
    expect(httpStatusForErrorCode('PROVIDER_UNAVAILABLE')).toBe(503);
  });
});

describe('ErrorEnvelopeSchema (API_CONTRACTS §1.1)', () => {
  it('최소 형태(code + message)를 parse 한다', () => {
    const parsed = ErrorEnvelopeSchema.parse({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
    });
    expect(parsed.error.code).toBe('INTERNAL_ERROR');
    expect(parsed.error.requestId).toBeUndefined();
    expect(parsed.error.details).toBeUndefined();
  });

  it('requestId · details 를 포함한 전체 형태를 parse 한다', () => {
    const parsed = ErrorEnvelopeSchema.parse({
      error: {
        code: 'SESSION_INVALID_TRANSITION',
        message: 'Human-readable, no PII',
        requestId: '2f3b0f2c-2b3f-4a8e-9f0a-6d0b6a2a9d11',
        details: { from: 'completed', to: 'recording' },
      },
    });
    expect(parsed.error.details).toEqual({ from: 'completed', to: 'recording' });
  });

  it('알 수 없는 코드 · 누락 필드 · 잘못된 구조를 reject 한다', () => {
    expect(ErrorEnvelopeSchema.safeParse({ error: { code: 'NOPE', message: 'x' } }).success).toBe(
      false,
    );
    expect(ErrorEnvelopeSchema.safeParse({ error: { code: 'INTERNAL_ERROR' } }).success).toBe(
      false,
    );
    expect(ErrorEnvelopeSchema.safeParse({ code: 'INTERNAL_ERROR', message: 'x' }).success).toBe(
      false,
    );
    expect(
      ErrorEnvelopeSchema.safeParse({ error: { code: 'INTERNAL_ERROR', message: 1 } }).success,
    ).toBe(false);
    expect(ErrorEnvelopeSchema.safeParse(null).success).toBe(false);
  });

  it('isErrorEnvelope 가 성공 응답과 오류 응답을 구분한다', () => {
    expect(isErrorEnvelope({ error: { code: 'RATE_LIMITED', message: 'slow down' } })).toBe(true);
    expect(isErrorEnvelope({ status: 'ok', version: '1.0.0' })).toBe(false);
    expect(isErrorEnvelope(undefined)).toBe(false);
  });
});

describe('HaruApiError', () => {
  it('code 로부터 httpStatus 를 채운다', () => {
    const error = new HaruApiError('CONSENT_REQUIRED', 'consent missing');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('HaruApiError');
    expect(error.code).toBe('CONSENT_REQUIRED');
    expect(error.httpStatus).toBe(403);
  });

  it('envelope ↔ error 왕복 변환이 값을 보존한다', () => {
    const envelope = ErrorEnvelopeSchema.parse({
      error: {
        code: 'SESSION_INVALID_TRANSITION',
        message: 'invalid transition',
        requestId: 'req-1',
        details: { from: 'completed', to: 'recording' },
      },
    });
    const error = HaruApiError.fromEnvelope(envelope);
    expect(error.requestId).toBe('req-1');
    expect(error.details).toEqual({ from: 'completed', to: 'recording' });
    expect(error.toEnvelope()).toEqual(envelope);
  });

  it('선택 필드가 없으면 envelope 에도 키를 만들지 않는다', () => {
    const envelope = new HaruApiError('INTERNAL_ERROR', 'boom').toEnvelope();
    expect(envelope).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'boom' } });
    expect(Object.keys(envelope.error)).toEqual(['code', 'message']);
    expect(ErrorEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });
});
