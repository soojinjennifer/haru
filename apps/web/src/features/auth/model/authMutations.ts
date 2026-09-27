/**
 * 인증 Mutation hook — Plan §5.2.
 *
 * ```
 * Form → useSignUpWithEmail … → AuthGateway → MockAuthGateway | (실제 Adapter 미구현 #27)
 * ```
 *
 * Component 는 `MockAuthGateway` 를 직접 import 하지 않는다 (AC-2-06). Gateway 는
 * `useAuth()` 로 **주입받고**, 주입 지점은 `app/providers` 한 곳이다.
 *
 * 세션이 생기면 `AuthProvider` 가 Query 캐시를 비우고 `useMe` 가 다시 조회한다 —
 * 이후 이동 경로는 **Route Guard 가 판정한다** (C-2: 동의 미기록이면 `/auth/consent`).
 * 그래서 이 hook 들은 화면 이동을 하지 않는다.
 */
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type {
  AuthProvider,
  AuthResult,
  RequestPasswordResetInput,
  SignInWithEmailInput,
  SignUpWithEmailInput,
  UpdatePasswordInput,
} from '@haru/contracts';

import { useAuth } from '../../../shared/auth';

export type AuthMutation<TInput, TOutput = AuthResult> = UseMutationResult<
  TOutput,
  unknown,
  TInput
>;

export function useSignUpWithEmail(): AuthMutation<SignUpWithEmailInput> {
  const { gateway } = useAuth();

  return useMutation({
    mutationFn: (input: SignUpWithEmailInput) => gateway.signUpWithEmail(input),
  });
}

export function useSignInWithEmail(): AuthMutation<SignInWithEmailInput> {
  const { gateway } = useAuth();

  return useMutation({
    mutationFn: (input: SignInWithEmailInput) => gateway.signInWithEmail(input),
  });
}

export function useSignInWithProvider(): AuthMutation<AuthProvider> {
  const { gateway } = useAuth();

  return useMutation({
    mutationFn: (provider: AuthProvider) => gateway.signInWithProvider(provider),
  });
}

export function useRequestPasswordReset(): AuthMutation<RequestPasswordResetInput, void> {
  const { gateway } = useAuth();

  return useMutation({
    mutationFn: (input: RequestPasswordResetInput) => gateway.requestPasswordReset(input),
  });
}

export function useUpdatePassword(): AuthMutation<UpdatePasswordInput, void> {
  const { gateway } = useAuth();

  return useMutation({
    mutationFn: (input: UpdatePasswordInput) => gateway.updatePassword(input),
  });
}
