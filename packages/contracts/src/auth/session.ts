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
 * 인증 세션 — `AuthGateway` 가 보유하는 토큰 묶음이다. **HTTP 응답 schema 가 아니다.**
 *
 * - `accessToken` 은 이후 HTTP Adapter 가 `Authorization: Bearer` 로 전달한다.
 * - `refreshToken` 은 provider 에 따라 없을 수 있다.
 * - Frontend 는 이 값을 로그·에러 리포트에 남기지 않는다 (`.claude/rules/architecture.md` §9).
 */
export const AuthSessionSchema = z.object({
  userId: IdSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  expiresAt: IsoDateTimeSchema,
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
