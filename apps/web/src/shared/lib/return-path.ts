/**
 * 로그인 후 복귀 경로 — Stage 7 **AC-7-46** (`D7-6` ⑨, 2026-11-20).
 *
 * 미인증 사용자가 보호된 deep link(예 `/progress/reports/:reportId` — `report_published` 알림)를 열면 Route Guard 가
 * `/auth/welcome` 으로 보낸다. 그때 **가려던 앱 안 경로**를 여기에 기억해 두고, 로그인 성공 흐름이 Home 대신 그 경로로 보낸다.
 *
 * - **같은 출처의 앱 안 경로만** 받는다 (open redirect 방지). `/` 로 시작하고 `//` · `/\` 로 시작하지 않으며, 같은 출처로
 *   해석되고, scheme · 제어 문자가 없어야 한다. `/auth/*` 는 복귀 대상이 아니다(로그인 화면으로 돌아가는 고리 방지).
 * - **메모리에만** 둔다 — `localStorage` · `sessionStorage` · URL 에 쓰지 않는다 (탭을 닫으면 사라진다).
 *   실제 OAuth 처럼 전체 페이지를 떠나는 로그인은 이 값을 잃는다 → Backend/Auth 연동 시 재검토(H7-7 PENDING 메모).
 * - **로그 0** — 경로를 콘솔 · 에러 리포트에 남기지 않는다 (리포트 id 등 — `rules/architecture.md` §9).
 * - 복귀가 끝나면(인증 사용자가 앱 안 화면에 도달) 지운다 — 호출부 `useGuardDecision`.
 */

const AUTH_PREFIX = '/auth/';
/** 판정용 가상 출처 — 실제 출처와 무관하게 "같은 출처로 해석되는가"만 본다. */
const PROBE_ORIGIN = 'https://haru.invalid';

/**
 * 제어 문자 · 공백(탭 · 개행 — URL 파서가 지워 `//` 를 만들 수 있다) · 역슬래시(일부 파서가 `/` 로 읽는다).
 */
function hasUnsafeCharacter(value: string): boolean {
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code <= 0x20 || code === 0x7f || char === '\\') return true;
  }
  return false;
}

/**
 * 앱 안 복귀 경로로 쓸 수 있으면 정규화된 `pathname + search + hash` 를, 아니면 `null` 을 돌려준다.
 *
 * 거절: 절대 URL(`https://…`) · protocol-relative(`//evil.example`) · 역슬래시(`/\evil`) · `javascript:` 류 ·
 * 제어 문자 · `/auth/*` · 빈 값.
 */
export function toSafeReturnPath(candidate: unknown): string | null {
  if (typeof candidate !== 'string' || candidate.length === 0) return null;
  if (!candidate.startsWith('/')) return null;
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return null;
  if (hasUnsafeCharacter(candidate)) return null;

  let parsed: URL;
  try {
    parsed = new URL(candidate, PROBE_ORIGIN);
  } catch {
    return null;
  }
  if (parsed.origin !== PROBE_ORIGIN) return null;

  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  if (parsed.pathname === '/auth' || parsed.pathname.startsWith(AUTH_PREFIX)) return null;
  return path;
}

export interface ReturnPathStore {
  /** 가려던 경로를 기억한다. 안전하지 않으면 무시하고 이전 값도 지운다. */
  remember: (path: string) => void;
  /** 기억한 경로 (지우지 않는다). */
  peek: () => string | null;
  clear: () => void;
}

export function createReturnPathStore(): ReturnPathStore {
  let stored: string | null = null;
  return {
    remember(path) {
      stored = toSafeReturnPath(path);
    },
    peek() {
      return stored;
    },
    clear() {
      stored = null;
    },
  };
}

/** 앱 전역 1개 (탭 메모리). Guard 와 로그인 화면이 공유한다. */
export const returnPathStore: ReturnPathStore = createReturnPathStore();
