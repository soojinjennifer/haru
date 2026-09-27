/**
 * 폼 입력 검증 — **규칙은 `packages/contracts` schema 가 소유한다** (rules/architecture §5).
 *
 * 여기에서 길이·형식을 다시 정의하지 않는다. schema 로 parse 해 보고, 실패한 필드에
 * copy 모듈의 문구를 붙일 뿐이다. 그래서 contracts 가 바뀌면 화면 검증도 함께 움직인다.
 *
 * 비밀번호는 form state 로만 존재한다 — draft · Query 캐시 · 로그에 남기지 않는다 (AC-2-64).
 */
import {
  PASSWORD_MIN_LENGTH,
  RequestPasswordResetInputSchema,
  SignInWithEmailInputSchema,
  SignUpWithEmailInputSchema,
  UpdatePasswordInputSchema,
} from '@haru/contracts';

import { authCopy } from '../copy';

export interface SignUpFieldErrors {
  caregiverName?: string;
  email?: string;
  password?: string;
}

export interface SignInFieldErrors {
  email?: string;
  password?: string;
}

export interface ResetPasswordFieldErrors {
  password?: string;
  confirmPassword?: string;
}

function emailError(email: string): string | undefined {
  if (email.trim().length === 0) return authCopy.validation.emailRequired;

  return RequestPasswordResetInputSchema.safeParse({ email }).success
    ? undefined
    : authCopy.validation.emailFormat;
}

export function validateSignUp(values: {
  caregiverName: string;
  email: string;
  password: string;
}): SignUpFieldErrors {
  const errors: SignUpFieldErrors = {};

  if (values.caregiverName.trim().length === 0) {
    errors.caregiverName = authCopy.validation.nameRequired;
  }

  const email = emailError(values.email);
  if (email !== undefined) errors.email = email;

  if (values.password.length === 0) {
    errors.password = authCopy.validation.passwordRequired;
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = authCopy.validation.passwordMinLength;
  }

  // 마지막으로 contracts schema 전체를 통과시킨다 — 위 규칙과 schema 가 어긋나면 여기에서 걸린다.
  if (Object.keys(errors).length === 0) {
    const parsed = SignUpWithEmailInputSchema.safeParse({
      caregiverName: values.caregiverName.trim(),
      email: values.email.trim(),
      password: values.password,
    });

    if (!parsed.success) errors.email = authCopy.validation.emailFormat;
  }

  return errors;
}

export function validateSignIn(values: { email: string; password: string }): SignInFieldErrors {
  const errors: SignInFieldErrors = {};

  const email = emailError(values.email);
  if (email !== undefined) errors.email = email;

  if (values.password.length === 0) errors.password = authCopy.validation.passwordRequired;

  if (Object.keys(errors).length === 0) {
    const parsed = SignInWithEmailInputSchema.safeParse({
      email: values.email.trim(),
      password: values.password,
    });

    if (!parsed.success) errors.email = authCopy.validation.emailFormat;
  }

  return errors;
}

export function validateEmailOnly(email: string): { email?: string } {
  const error = emailError(email);

  return error === undefined ? {} : { email: error };
}

export function validateNewPassword(values: {
  password: string;
  confirmPassword: string;
}): ResetPasswordFieldErrors {
  const errors: ResetPasswordFieldErrors = {};

  if (values.password.length === 0) {
    errors.password = authCopy.validation.passwordRequired;
  } else if (!UpdatePasswordInputSchema.safeParse({ password: values.password }).success) {
    errors.password = authCopy.validation.passwordMinLength;
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = authCopy.validation.confirmMismatch;
  }

  return errors;
}

export function hasFieldErrors<T extends object>(errors: T): boolean {
  return Object.values(errors).some((value) => value !== undefined);
}
