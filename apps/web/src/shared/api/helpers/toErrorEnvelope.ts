/**
 * 오류 정규화 helper — Mock Adapter 와 Http Adapter 가 **같은 오류 형태**를 던지게 한다.
 *
 * - 서버(또는 Mock)가 만든 실패는 contracts `ErrorEnvelope` → `HaruApiError`.
 * - 전송 자체가 실패한 경우(offline · DNS · timeout)는 Error Code 가 없다.
 *   contracts 에 네트워크 오류 코드가 없으므로(`docs/API_CONTRACTS.md` §1.2) 별도
 *   `NetworkError` 로 구분한다. UI 는 이 구분으로 Offline Banner 를 띄운다.
 */
import {
  ErrorEnvelopeSchema,
  HaruApiError,
  type ErrorCode,
  type ErrorDetails,
  type ErrorEnvelope,
} from '@haru/contracts';

/** 요청이 서버에 닿지 못했거나 응답을 받지 못한 경우. Error Envelope 이 존재하지 않는다. */
export class NetworkError extends Error {
  override readonly name = 'NetworkError';

  /** 타임아웃으로 중단된 요청인지 (UI 문구 분기가 아니라 로깅·재시도 판단용) */
  readonly timedOut: boolean;

  constructor(message: string, options: { timedOut?: boolean; cause?: unknown } = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.timedOut = options.timedOut ?? false;
  }
}

export function isNetworkError(value: unknown): value is NetworkError {
  return value instanceof NetworkError;
}

export function isHaruApiError(value: unknown): value is HaruApiError {
  return value instanceof HaruApiError;
}

export interface BuildErrorOptions {
  requestId?: string | undefined;
  details?: ErrorDetails | undefined;
  cause?: unknown;
}

/**
 * Error Code 로부터 contracts Error Envelope 을 만든다.
 * Mock Adapter 가 오류 응답을 만들 때 쓰며, 반환값은 schema parse 를 통과한 값이다.
 */
export function buildErrorEnvelope(
  code: ErrorCode,
  message: string,
  options: BuildErrorOptions = {},
): ErrorEnvelope {
  const envelope: ErrorEnvelope = {
    error: {
      code,
      message,
      ...(options.requestId === undefined ? {} : { requestId: options.requestId }),
      ...(options.details === undefined ? {} : { details: options.details }),
    },
  };

  // fixture drift 방지 — Mock 이 만든 오류 응답도 contracts 를 통과해야 한다.
  return ErrorEnvelopeSchema.parse(envelope);
}

/** Error Envelope 형태의 응답 body 를 던질 수 있는 오류로 바꾼다. */
export function toHaruApiError(body: unknown, options: BuildErrorOptions = {}): HaruApiError {
  const parsed = ErrorEnvelopeSchema.safeParse(body);

  if (parsed.success) {
    const error = HaruApiError.fromEnvelope(parsed.data, options.cause);
    if (error.requestId !== undefined || options.requestId === undefined) return error;

    return new HaruApiError(error.code, error.message, {
      requestId: options.requestId,
      details: error.details,
      cause: options.cause,
    });
  }

  // Error Envelope 규약을 지키지 않은 응답은 계약 위반이다 (§1.1).
  return new HaruApiError(
    'INTERNAL_ERROR',
    'Response did not follow the error envelope contract.',
    {
      requestId: options.requestId,
      details: options.details,
      cause: options.cause,
    },
  );
}

/**
 * 임의의 던져진 값을 wire 형식(Error Envelope)으로 되돌린다.
 * 로깅·테스트·Mock 응답 직렬화에 쓴다. `NetworkError` 는 Envelope 이 없으므로
 * 가장 가까운 코드(`PROVIDER_UNAVAILABLE`)로 표현하되, 던질 때는 그대로 `NetworkError` 를 쓴다.
 */
export function toErrorEnvelope(value: unknown, options: BuildErrorOptions = {}): ErrorEnvelope {
  if (isHaruApiError(value)) return value.toEnvelope();

  if (isNetworkError(value)) {
    return buildErrorEnvelope('PROVIDER_UNAVAILABLE', value.message, options);
  }

  return buildErrorEnvelope('INTERNAL_ERROR', 'Unexpected error.', options);
}
