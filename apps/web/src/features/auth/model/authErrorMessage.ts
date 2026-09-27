/**
 * 인증 실패 → 화면 문구.
 *
 * 서버(Mock)의 `message` 는 개발자용이라 화면에 띄우지 않는다 (API_CONTRACTS §1.1).
 * 로그인 경로의 `AUTH_REQUIRED` 만 공용 문구 대신 "자격 증명 불일치" 문구를 쓴다 —
 * **계정 존재 여부는 여전히 말하지 않는다**.
 */
import { isHaruApiError, isNetworkError } from '../../../shared/api/helpers';
import {
  errorCopyForCode,
  networkErrorCopy,
  type ErrorMessage,
} from '../../../shared/copy/error-copy';
import { authCopy } from '../copy';

export type AuthErrorContext = 'sign-in' | 'sign-up' | 'password-reset';

export function authErrorMessage(error: unknown, context: AuthErrorContext): ErrorMessage {
  if (error === null || error === undefined) return errorCopyForCode(undefined);
  if (isNetworkError(error)) return networkErrorCopy;

  if (isHaruApiError(error)) {
    if (context === 'sign-in' && error.code === 'AUTH_REQUIRED') {
      return authCopy.credentialsMismatch;
    }

    return errorCopyForCode(error.code);
  }

  return errorCopyForCode(undefined);
}

/** 재설정 링크가 만료된 실패인가 (Design Spec §2.5). */
export function isExpiredResetLink(error: unknown): boolean {
  return isHaruApiError(error) && error.code === 'AUTH_TOKEN_EXPIRED';
}
