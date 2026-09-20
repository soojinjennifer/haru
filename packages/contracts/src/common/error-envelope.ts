import { z } from 'zod';

import { ErrorCodeSchema, httpStatusForErrorCode, type ErrorCode } from './error-codes.js';

/**
 * 공통 Error Envelope — `docs/API_CONTRACTS.md` §1.1.
 *
 * ```json
 * { "error": { "code": "SESSION_INVALID_TRANSITION", "message": "…", "requestId": "…", "details": { … } } }
 * ```
 *
 * - `message` 는 **개발자용**이며 PII 를 포함하지 않는다. 사용자 노출 문구는
 *   Frontend copy 모듈이 `code` 로 매핑한다 (rules/frontend.md §8).
 * - `requestId` 규약값은 uuid(`X-Request-Id`) 지만, 오류 처리 경로가 형식 불일치로
 *   다시 실패하지 않도록 schema 는 비어 있지 않은 opaque 문자열로 받는다.
 * - `details` 는 코드별 추가 정보다 (예: `SESSION_INVALID_TRANSITION` → `{ from, to }`).
 */
export const ErrorDetailsSchema = z.record(z.string(), z.unknown());

export type ErrorDetails = z.infer<typeof ErrorDetailsSchema>;

export const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    requestId: z.string().min(1).optional(),
    details: ErrorDetailsSchema.optional(),
  }),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

/** 임의의 값이 Error Envelope 형태인지 판별한다 (Adapter 응답 분기용). */
export function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  return ErrorEnvelopeSchema.safeParse(value).success;
}

export interface HaruApiErrorOptions {
  requestId?: string | undefined;
  details?: ErrorDetails | undefined;
  cause?: unknown;
}

/**
 * Error Envelope 를 던질 수 있는 형태로 감싼 오류.
 * Mock Adapter · Http Adapter 가 동일하게 이 오류를 던지고, Query/Mutation 계층이 `code` 로 분기한다.
 */
export class HaruApiError extends Error {
  override readonly name = 'HaruApiError';

  readonly code: ErrorCode;
  readonly httpStatus: number;
  readonly requestId: string | undefined;
  readonly details: ErrorDetails | undefined;

  constructor(code: ErrorCode, message: string, options: HaruApiErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.code = code;
    this.httpStatus = httpStatusForErrorCode(code);
    this.requestId = options.requestId;
    this.details = options.details;
  }

  /** 검증된 Error Envelope 로부터 오류 객체를 만든다. */
  static fromEnvelope(envelope: ErrorEnvelope, cause?: unknown): HaruApiError {
    return new HaruApiError(envelope.error.code, envelope.error.message, {
      requestId: envelope.error.requestId,
      details: envelope.error.details,
      cause,
    });
  }

  /** 오류 객체를 wire 형식(Error Envelope)으로 되돌린다. Mock Adapter 응답 생성에 쓴다. */
  toEnvelope(): ErrorEnvelope {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.requestId === undefined ? {} : { requestId: this.requestId }),
        ...(this.details === undefined ? {} : { details: this.details }),
      },
    };
  }
}
