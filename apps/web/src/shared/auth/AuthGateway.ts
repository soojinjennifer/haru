/**
 * `AuthGateway` — 인증 Provider 경계 (`docs/ARCHITECTURE.md` §7.2, Plan §5.2).
 *
 * **HTTP API 가 아니다.** 그래서 `shared/api` 의 `ApiClients` 와 분리된 별도 provider 로
 * 주입한다. 다만 "선택 지점은 `app/providers` 한 곳" 규칙은 동일하게 적용된다
 * (`.claude/rules/architecture.md` §2.3 · §4).
 *
 * ```
 * UI/Feature → useSignUp / useSignIn / useSignOut (features/auth)
 *            → AuthGateway (이 interface)
 *            → MockAuthGateway (mocks/auth)                     ← Stage 2
 *              ( SupabaseWebAuthGateway — 미구현, Backend 연동 시점 · #27 )
 * ```
 *
 * 규약
 * - 실패는 `HaruApiError`(contracts Error Envelope) 또는 `NetworkError` 로 던진다.
 * - 입력은 `packages/contracts` schema 로 검증한다. 특히 `signUpWithEmail` 입력은
 *   `.strict()` 라서 아이 필드가 섞이면 parse 단계에서 차단된다 (AC-2-05).
 * - 토큰·비밀번호를 로그·에러 리포트에 남기지 않는다 (`.claude/rules/architecture.md` §9).
 * - 세션 갱신은 Gateway 책임이다. API 호출이 `AUTH_TOKEN_EXPIRED` 를 받으면
 *   `refreshSession()` 을 **1회** 시도한 뒤 재시도한다 (`withAuthRefresh`, AC-2-07).
 */
import type {
  AuthProvider,
  AuthResult,
  AuthSession,
  RequestPasswordResetInput,
  SignInWithEmailInput,
  SignUpWithEmailInput,
  UpdatePasswordInput,
} from '@haru/contracts';

/** `onChange` 구독 해제 함수. */
export type Unsubscribe = () => void;

/** ARCHITECTURE §7.2 의 9 메서드. */
export interface AuthGateway {
  /** 현재 세션. 없으면 `null`. */
  getSession(): Promise<AuthSession | null>;
  /** 세션 변화 구독. 구독 즉시 현재 값을 1회 통지한다. */
  onChange(listener: (session: AuthSession | null) => void): Unsubscribe;
  signUpWithEmail(input: SignUpWithEmailInput): Promise<AuthResult>;
  signInWithEmail(input: SignInWithEmailInput): Promise<AuthResult>;
  /** 소셜 로그인. 사용자가 취소하면 `session: null` 로 **성공 반환**한다 (오류가 아니다 — AC-2-08). */
  signInWithProvider(provider: AuthProvider): Promise<AuthResult>;
  /** 재설정 메일 요청. **계정 존재 여부를 결과로 구분하지 않는다** (AC-2-09, enumeration 방지). */
  requestPasswordReset(input: RequestPasswordResetInput): Promise<void>;
  updatePassword(input: UpdatePasswordInput): Promise<void>;
  /** 만료 토큰 갱신. 갱신할 수 없으면 `null` 을 돌려준다 (예외를 던지지 않는다). */
  refreshSession(): Promise<AuthSession | null>;
  signOut(): Promise<void>;
}

/** `AuthGateway` 메서드 이름 목록 — 구현체가 9 메서드를 모두 갖는지 검사하는 데 쓴다 (AC-2-06). */
export const AUTH_GATEWAY_METHODS = [
  'getSession',
  'onChange',
  'signUpWithEmail',
  'signInWithEmail',
  'signInWithProvider',
  'requestPasswordReset',
  'updatePassword',
  'refreshSession',
  'signOut',
] as const;

export type AuthGatewayMethod = (typeof AUTH_GATEWAY_METHODS)[number];
