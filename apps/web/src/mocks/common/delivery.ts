/**
 * Stage 4 Mock 공통 전달 helper — `docs/API_CONTRACTS.md` §5.2 "중복 방지"
 * (도메인 Mock 은 지연 · 오류 envelope · 시도 판정을 공통 helper 로 쓰고 도메인 로직만 가진다).
 *
 * 공통 5종 중 **응답 모양이 아니라 전달 방식**인 4개(`loading` · `error` · `retry` · `offline`)를
 * 한 곳에서 분기한다. `empty`·`success` 와 HARU 특화 key 는 도메인 Mock 이 처리한다.
 *
 * ── `error` 의 code 지정 (Plan §8.1 "error — code 지정", AC-4-24) ──
 * 기본은 `INTERNAL_ERROR` 다. 단일 error code 재현은 **새 key 가 아니라** `error` + code 지정이다
 * (Catalogue §5.4 "Key 로 만들지 않는 것"). 지정은 번들 옵션 `errorCodes` 로 하며 키는
 * `group` 또는 `group.method`(소문자) 다 — 메서드 지정이 그룹 지정을 이긴다.
 */
import { HaruApiError, type ErrorCode, type ErrorDetails } from '@haru/contracts';

import { buildErrorEnvelope, NetworkError, withDelay, type Timer } from '../../shared/api/helpers';
import type { IdFactory } from '../../shared/lib/idFactory';
import { methodScope } from '../scenarios';

/** `error`/`retry` 가 쓸 code. 키 = `group` 또는 `group.method`. */
export type MockErrorCodes = Readonly<Partial<Record<string, ErrorCode>>>;

export interface MockFailure {
  /** contracts Error Envelope 을 거친 `HaruApiError` 를 던진다. */
  fail(code: ErrorCode, message: string, details?: ErrorDetails): never;
}

export function createMockFailure(idFactory: IdFactory): MockFailure {
  return {
    fail(code, message, details) {
      throw HaruApiError.fromEnvelope(
        buildErrorEnvelope(code, message, {
          requestId: idFactory.next(),
          ...(details === undefined ? {} : { details }),
        }),
      );
    },
  };
}

/** `errorCodes` 에서 이 호출의 code 를 고른다 — 메서드 지정 > 그룹 지정 > `INTERNAL_ERROR`. */
export function resolveErrorCode(
  errorCodes: MockErrorCodes | undefined,
  group: string,
  method: string,
): ErrorCode {
  return errorCodes?.[methodScope(group, method)] ?? errorCodes?.[group] ?? 'INTERNAL_ERROR';
}

export interface DeliverOptions<T> {
  scenario: string;
  attempt: number;
  delayMs: number;
  run: () => T | Promise<T>;
  /** PII 없는 고정 문구. */
  message: string;
  errorCode: ErrorCode;
  signal: AbortSignal | undefined;
  timer: Timer;
  failure: MockFailure;
}

/**
 * 공통 4종 분기. 그 밖의 key 는 `run()` 을 그대로 실행한다.
 * `retry` 는 **1회차만** 실패한다 — 같은 순서의 호출은 항상 같은 결과다 (결정성).
 */
export async function deliver<T>(options: DeliverOptions<T>): Promise<T> {
  switch (options.scenario) {
    case 'loading':
      return withDelay(options.timer, options.delayMs, options.run, options.signal);
    case 'error':
      return options.failure.fail(options.errorCode, options.message);
    case 'retry':
      if (options.attempt === 1) return options.failure.fail(options.errorCode, options.message);
      return options.run();
    case 'offline':
      throw new NetworkError('Mock adapter is offline.');
    default:
      return options.run();
  }
}
