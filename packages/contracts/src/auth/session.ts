import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';

/**
 * OAuth Provider — `AuthGateway.signInWithProvider` 입력.
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2, `docs/ARCHITECTURE.md` §7.2, PRD FR-01.
 *
 * `RECOMMENDED` — Supabase JS Client 미사용(#27) 이므로 Stage 2–8 은 `MockAuthGateway` 가 구현한다.
 */
export const AuthProviderSchema = z.enum(['google', 'apple']);

export type AuthProvider = z.infer<typeof AuthProviderSchema>;

/**
 * 이 세션이 **어떤 자격 증명으로** 만들어졌는가 — `email` + OAuth provider.
 *
 * 왜 세션이 이 값을 갖는가: 동의 기록의 출처(`consent_events.source`)가 `signup_email` 과
 * `signup_oauth` 를 구분해야 하는데 (`S2-CONSENT-1`, approvals §9), 그 사실을 아는 곳은
 * 세션을 발급한 `AuthGateway` 뿐이다. 전역 상태를 새로 만들지 않고, 세션 갱신 후에도
 * 값이 유지되도록 세션 자체에 담는다. Supabase 로 교체될 때도 `identities`/`app_metadata`
 * 의 provider 를 그대로 옮기면 된다.
 */
export const SessionProviderSchema = z.enum(['email', ...AuthProviderSchema.options]);

export type SessionProvider = z.infer<typeof SessionProviderSchema>;

/**
 * 인증 세션 — `AuthGateway` 가 보유하는 토큰 묶음이다. **HTTP 응답 schema 가 아니다.**
 *
 * - `accessToken` 은 이후 HTTP Adapter 가 `Authorization: Bearer` 로 전달한다.
 * - `refreshToken` 은 provider 에 따라 없을 수 있다.
 * - `provider` 는 가입·로그인 경로다. 동의 기록 출처를 `signup_email` / `signup_oauth` 로
 *   나누는 데 쓴다 (`S2-CONSENT-1`). **필수 필드**인 이유: 값이 없을 때 조용히 이메일로
 *   간주하면 지금 고치려는 결함(OAuth 가입이 `signup_email` 로 남는 것)이 그대로 돌아온다.
 * - Frontend 는 이 값을 로그·에러 리포트에 남기지 않는다 (`.claude/rules/architecture.md` §9).
 */
export const AuthSessionSchema = z.object({
  userId: IdSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  expiresAt: IsoDateTimeSchema,
  provider: SessionProviderSchema,
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

/**
 * 인증 동작의 결과.
 *
 * `session: null` 은 "동작은 성공했으나 아직 세션이 없다"는 뜻이다
 * (예: 이메일 확인 대기). 실패는 `HaruApiError` 로 던진다.
 */
export const AuthResultSchema = z.object({
  session: AuthSessionSchema.nullable(),
});

export type AuthResult = z.infer<typeof AuthResultSchema>;
