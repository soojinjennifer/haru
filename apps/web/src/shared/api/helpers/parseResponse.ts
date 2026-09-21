/**
 * Adapter 경계의 contracts 검증 — `.claude/rules/architecture.md` §4,
 * Plan §7.3 "Mock/Http **양쪽** Adapter 가 요청·응답을 parse 한다.
 * parse 실패는 `VALIDATION_FAILED` Error Envelope 으로 변환한다".
 */
import { HaruApiError } from '@haru/contracts';
import type { ZodType } from 'zod';

export interface ParseOptions {
  /** 어느 호출에서 났는지 (예: `GET /v1/health`). 자유 입력·PII 를 넣지 않는다. */
  operation: string;
  /** `request` 는 클라이언트가 보낸 값, `response` 는 서버(Mock)가 준 값 */
  direction: 'request' | 'response';
  requestId?: string | undefined;
}

/** Zod issue 를 PII 없는 형태(경로 + 코드)로만 남긴다. 입력값 자체는 절대 담지 않는다. */
function summarizeIssues(issues: readonly { path: PropertyKey[]; code: string }[]): string[] {
  return issues.slice(0, 10).map((issue) => {
    const path = issue.path.map((segment) => String(segment)).join('.');
    return path.length > 0 ? `${path}: ${issue.code}` : issue.code;
  });
}

/**
 * schema 로 값을 검증한다. 실패하면 `VALIDATION_FAILED` `HaruApiError` 를 던진다.
 * `details.issues` 에는 경로와 issue code 만 담는다 (값·원문 금지 — rules/architecture §9).
 */
export function parseResponse<T>(schema: ZodType<T>, value: unknown, options: ParseOptions): T {
  const result = schema.safeParse(value);

  if (result.success) return result.data;

  throw new HaruApiError(
    'VALIDATION_FAILED',
    `Contract validation failed for ${options.direction} of ${options.operation}.`,
    {
      requestId: options.requestId,
      details: {
        operation: options.operation,
        direction: options.direction,
        issues: summarizeIssues(result.error.issues),
      },
      cause: result.error,
    },
  );
}

/** 요청 payload 검증 (의미를 드러내기 위한 얇은 별칭). */
export function parseRequest<T>(
  schema: ZodType<T>,
  value: unknown,
  options: Omit<ParseOptions, 'direction'>,
): T {
  return parseResponse(schema, value, { ...options, direction: 'request' });
}
