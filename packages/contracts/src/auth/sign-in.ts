import { z } from 'zod';

import { PASSWORD_MIN_LENGTH } from './password.js';

/**
 * 이메일 로그인 입력 — `AuthGateway.signInWithEmail` (HTTP 아님).
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2, PRD FR-01.
 *
 * 로그인은 기존 비밀번호를 그대로 받으므로 최소 길이를 강제하지 않는다
 * (규칙 변경 전에 만들어진 계정이 로그인하지 못하게 되는 것을 피한다).
 */
export const SignInWithEmailInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type SignInWithEmailInput = z.infer<typeof SignInWithEmailInputSchema>;

/** 비밀번호 재설정 메일 요청 — `AuthGateway.requestPasswordReset`. */
export const RequestPasswordResetInputSchema = z.object({
  email: z.email(),
});

export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetInputSchema>;

/** 새 비밀번호 설정 — `AuthGateway.updatePassword`. 재설정 링크로 복귀한 세션에서 호출한다. */
export const UpdatePasswordInputSchema = z.object({
  password: z.string().min(PASSWORD_MIN_LENGTH),
});

export type UpdatePasswordInput = z.infer<typeof UpdatePasswordInputSchema>;
