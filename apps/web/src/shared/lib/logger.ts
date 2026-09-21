/**
 * PII 금지 logger — Plan §5.6 · `.claude/rules/architecture.md` §9.
 *
 * ┌ 불변 규칙 ───────────────────────────────────────────────────────────────┐
 * │ `apps/web` 에서 `console` 에 직접 접근하는 곳은 **이 파일 하나** 뿐이다. │
 * │ `no-console` 은 `warn`/`error` 를 포함해 전부 `error` 이고, 예외는 루트  │
 * │ eslint.config.js 의 `haru/console-allowlist` 경로 2개뿐이다 (QA-1-001).  │
 * │ 나머지 하나는 `packages/ui/src/lib/devWarn.ts` — packages/ui 는 경계     │
 * │ 규칙상 이 logger 를 import 할 수 없어 같은 원칙을 따로 구현한다.         │
 * │ (빌드 스크립트 디렉토리와 설정 파일은 제품 코드가 아니라 별개 예외다.)   │
 * │ 이 규칙은 packages/config 의 no-console-invariant 테스트가 저장소        │
 * │ 스캔 + 실제 eslint 실행으로 자동 검증한다.                               │
 * │                                                                          │
 * │ 기록 금지: 아이 이름 · 양육자 이름 · 이메일 · transcript 원문 · 오디오   │
 * │            경로 · 토큰 · 서버 에러 메시지 원문 · 자유 입력 텍스트.       │
 * │ 아래 `ALLOWED_CONTEXT_KEYS` **화이트리스트 밖의 키는 런타임에서 버린다.**│
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * 출력은 dev 에서만 한다. Production 에서는 no-op 이며, 원격 전송 transport 를
 * 추가하지 않는다 (광고·제3자 분석 SDK 금지 — Plan §5.6).
 */
import { env, type AppEnv } from './env';

/** 로그 context 로 허용되는 키. 값은 primitive 만 허용한다. */
export const ALLOWED_CONTEXT_KEYS = [
  'route',
  'component',
  'boundary',
  'errorName',
  'errorCode',
  'requestId',
  'status',
  'durationMs',
  'count',
  'scenario',
  'mode',
] as const;

export type LogContextKey = (typeof ALLOWED_CONTEXT_KEYS)[number];

export type LogContextValue = string | number | boolean;

export type LogContext = Partial<Record<LogContextKey, LogContextValue>>;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const ALLOWED_KEY_SET: ReadonlySet<string> = new Set<string>(ALLOWED_CONTEXT_KEYS);

/** 화이트리스트 밖의 키와 primitive 가 아닌 값을 제거한다 (PII 유출 방지). */
export function sanitizeContext(context: Readonly<Record<string, unknown>>): LogContext {
  const safe: Record<string, LogContextValue> = {};

  for (const [key, value] of Object.entries(context)) {
    if (!ALLOWED_KEY_SET.has(key)) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      safe[key] = value;
    }
  }

  return safe as LogContext;
}

/** 이벤트 이름 자체에도 자유 입력이 섞이지 않도록 snake_case 토큰만 허용한다. */
const EVENT_NAME = /^[a-z][a-z0-9_]*$/;

function formatEvent(event: string): string {
  return EVENT_NAME.test(event) ? event : 'invalid_event_name';
}

function write(level: LogLevel, event: string, context: Readonly<Record<string, unknown>>): void {
  const safeEvent = formatEvent(event);
  const safeContext = sanitizeContext(context);

  switch (level) {
    case 'warn':
      console.warn(`[haru] ${safeEvent}`, safeContext);
      return;
    case 'error':
      console.error(`[haru] ${safeEvent}`, safeContext);
      return;
    default:
      console.log(`[haru:${level}] ${safeEvent}`, safeContext);
  }
}

export interface Logger {
  debug: (event: string, context?: LogContext) => void;
  info: (event: string, context?: LogContext) => void;
  warn: (event: string, context?: LogContext) => void;
  error: (event: string, context?: LogContext) => void;
}

/** 테스트와 Stage 2 이후의 주입을 위해 환경을 인자로 받는다. */
export function createLogger(current: AppEnv = env): Logger {
  const log =
    (level: LogLevel) =>
    (event: string, context: LogContext = {}): void => {
      if (!current.dev) return;
      write(level, event, context);
    };

  return { debug: log('debug'), info: log('info'), warn: log('warn'), error: log('error') };
}

export const logger: Logger = createLogger();

/**
 * 던져진 값에서 **이름만** 꺼낸다. 메시지·stack 은 PII 를 포함할 수 있으므로 기록하지 않는다.
 */
export function errorName(error: unknown): string {
  if (!(error instanceof Error)) return 'UnknownError';
  const name = error.name.replace(/[^\w.-]/g, '_').slice(0, 64);
  return name.length > 0 ? name : 'Error';
}
