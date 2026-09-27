import { describe, expect, it } from 'vitest';

import {
  AuthProviderSchema,
  AuthSessionSchema,
  PASSWORD_MIN_LENGTH,
  RequestPasswordResetInputSchema,
  SignInWithEmailInputSchema,
  SignUpWithEmailInputSchema,
  UpdatePasswordInputSchema,
} from '../index.js';

/**
 * Auth contracts — `docs/API_CONTRACTS.md` §3.4 · §4 Stage 2.
 * 가입 입력에 아이 필드가 없다는 것(C-5)이 Privacy 불변식(AC-2-13)의 첫 방어선이다.
 */
describe('SignUpWithEmailInput — C-5', () => {
  const valid = {
    caregiverName: 'Jamie Park',
    email: 'jamie@example.com',
    password: 'correct horse battery',
  };

  it('보호자 이름 · 이메일 · 비밀번호만 받는다', () => {
    expect(SignUpWithEmailInputSchema.parse(valid)).toEqual(valid);
  });

  it('아이 필드가 섞이면 parse 가 실패한다 (.strict() — AC-2-05)', () => {
    for (const extra of [
      { childFirstName: 'Emma' },
      { birthYearMonth: '2021-04' },
      { child: { firstName: 'Emma' } },
    ]) {
      expect(SignUpWithEmailInputSchema.safeParse({ ...valid, ...extra }).success).toBe(false);
    }
  });

  it('비밀번호는 최소 길이를 요구한다', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(
      SignUpWithEmailInputSchema.safeParse({ ...valid, password: 'a'.repeat(PASSWORD_MIN_LENGTH) })
        .success,
    ).toBe(true);
    expect(
      SignUpWithEmailInputSchema.safeParse({
        ...valid,
        password: 'a'.repeat(PASSWORD_MIN_LENGTH - 1),
      }).success,
    ).toBe(false);
  });

  it('보호자 이름은 공백만으로 채울 수 없다', () => {
    expect(SignUpWithEmailInputSchema.safeParse({ ...valid, caregiverName: '   ' }).success).toBe(
      false,
    );
  });
});

describe('SignIn · 비밀번호 재설정 입력', () => {
  it('로그인은 기존 비밀번호를 그대로 받는다 (최소 길이 규칙을 소급 적용하지 않는다)', () => {
    expect(
      SignInWithEmailInputSchema.safeParse({ email: 'a@example.com', password: 'short' }).success,
    ).toBe(true);
    expect(SignInWithEmailInputSchema.safeParse({ email: 'nope', password: 'short' }).success).toBe(
      false,
    );
  });

  it('재설정 요청은 이메일만 받는다', () => {
    expect(RequestPasswordResetInputSchema.parse({ email: 'a@example.com' })).toEqual({
      email: 'a@example.com',
    });
  });

  it('새 비밀번호는 가입과 같은 최소 길이를 쓴다', () => {
    expect(UpdatePasswordInputSchema.safeParse({ password: 'a'.repeat(7) }).success).toBe(false);
    expect(UpdatePasswordInputSchema.safeParse({ password: 'a'.repeat(8) }).success).toBe(true);
  });
});

describe('AuthSession · AuthProvider', () => {
  it('Provider 는 google · apple 두 값이다', () => {
    expect(AuthProviderSchema.options).toEqual(['google', 'apple']);
  });

  it('refreshToken 은 없을 수 있다', () => {
    const session = {
      userId: '0f2c4a4e-6c3f-4c0f-9f7a-3b1d2c9f5a11',
      accessToken: 'token',
      expiresAt: '2026-09-25T00:00:00Z',
    };
    expect(AuthSessionSchema.parse(session)).toEqual(session);
  });
});
