/**
 * Mock 요청 로그 — **Privacy 불변식(AC-2-13) 의 증거 수집기**.
 *
 * Plan §12 "Mock 요청 로그 수집기" · §5.5. 모든 Mock Adapter 와 `MockAuthGateway` 는
 * 서버로 나갈 요청을 이곳에 기록한다. 테스트는 "동의 기록 성공 이전 구간의 요청에
 * **아동 데이터가 0건**" 임을 이 로그로 증명한다.
 *
 * - 값은 기록하되 **비밀번호·토큰은 기록하지 않는다** (§5.5 로그 PII 금지).
 *   그래서 Adapter 는 `redactSecrets()` 를 통과한 payload 만 넘긴다.
 * - 로그는 테스트·dev 진단용이다. Production 빌드에는 `mocks/**` 자체가 없다 (AC-2-55).
 */

/** 아동 데이터 판별에 쓰는 금칙 키 (Plan §12 "Privacy 회귀 테스트" 행). */
export const CHILD_DATA_KEYS = [
  'firstName',
  'lastName',
  'birthYearMonth',
  'gender',
  'answers',
  'draftAnswers',
  'childId',
  'child',
  'reading_together',
  'books_and_interests',
  'growing_together',
  'capabilityItems',
] as const;

/** 로그에 남겨서는 안 되는 키 — 값 대신 표식으로 바꾼다. */
const SECRET_KEYS = ['password', 'newPassword', 'accessToken', 'refreshToken', 'token'];

export const REDACTED = '[redacted]';

export interface RequestLogEntry {
  /** 예: `POST /v1/consents` · `AuthGateway.signUpWithEmail` */
  readonly operation: string;
  /** 비밀번호·토큰이 제거된 요청 payload. 없으면 `undefined`. */
  readonly payload: unknown;
}

export interface RequestLog {
  record(operation: string, payload?: unknown): void;
  entries(): readonly RequestLogEntry[];
  clear(): void;
}

/** 비밀번호·토큰 값을 재귀적으로 표식으로 바꾼다. 키 이름 자체는 남는다. */
export function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSecrets);

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        SECRET_KEYS.includes(key) ? REDACTED : redactSecrets(item),
      ]),
    );
  }

  return value;
}

export function createRequestLog(): RequestLog {
  const entries: RequestLogEntry[] = [];

  return {
    record(operation, payload) {
      entries.push({ operation, payload: redactSecrets(payload) });
    },
    entries() {
      return entries;
    },
    clear() {
      entries.length = 0;
    },
  };
}

/** 로그 항목에서 아동 데이터로 볼 수 있는 키를 모두 찾는다 (중첩 포함). */
export function findChildDataKeys(entries: readonly RequestLogEntry[]): string[] {
  const found = new Set<string>();

  function walk(value: unknown): void {
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }

    if (value !== null && typeof value === 'object') {
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        if ((CHILD_DATA_KEYS as readonly string[]).includes(key)) found.add(key);
        walk(item);
      }
    }
  }

  for (const entry of entries) walk(entry.payload);

  return [...found].sort();
}
