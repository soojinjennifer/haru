import { z } from 'zod';

/**
 * Error Code Catalogue — `docs/API_CONTRACTS.md` §1.2 표 전체.
 *
 * - 총 **29 종**. 순서는 문서의 표 순서를 그대로 따른다.
 *   Library 1라운드에서 `BOOK_ALREADY_OWNED` 1종이 추가됐다 (Library Plan §7.4 — 신규는
 *   **최대 2건**이고 `GIFT_REQUEST_DUPLICATE` 는 이미 등재되어 있었으므로 실제 추가는 1건).
 * - `TRIAL_ACCOUNT_RESTRICTED` 는 익명 Trial 계정 미채택(C-12)으로 **제거**되었다. 추가하지 않는다.
 * - 새 코드 추가는 `docs/API_CONTRACTS.md` §1.2 갱신과 함께한다 (rules/architecture.md §5).
 */
export const ERROR_CODES = [
  'VALIDATION_FAILED',
  'AUTH_REQUIRED',
  'AUTH_TOKEN_EXPIRED',
  'FORBIDDEN',
  'CONSENT_REQUIRED',
  'CONSENT_VERSION_OUTDATED',
  'ONBOARDING_INCOMPLETE',
  'CHILD_NOT_FOUND',
  'CHILD_LIMIT_REACHED',
  'RESOURCE_NOT_FOUND',
  'SESSION_INVALID_TRANSITION',
  'SESSION_ALREADY_ACTIVE',
  'SESSION_MAX_DURATION_EXCEEDED',
  'RECORDING_NOT_ALLOWED_FOR_MODE',
  'UPLOAD_TOKEN_EXPIRED',
  'RECORDING_INCOMPLETE',
  'RECORDING_DELETED',
  'ANALYSIS_NOT_AVAILABLE',
  'REFLECTION_ALREADY_SUBMITTED',
  'REPORT_NOT_ELIGIBLE',
  'REPORT_NOT_READY',
  'PDF_NOT_READY',
  'GIFT_REQUEST_DUPLICATE',
  'BOOK_ALREADY_OWNED',
  'DELETION_ALREADY_REQUESTED',
  'IDEMPOTENCY_KEY_REUSED',
  'RATE_LIMITED',
  'PROVIDER_UNAVAILABLE',
  'INTERNAL_ERROR',
] as const;

export const ErrorCodeSchema = z.enum(ERROR_CODES);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

/**
 * Error Code → HTTP status 매핑 (`docs/API_CONTRACTS.md` §1.2 "HTTP" 열).
 *
 * Frontend 는 이 값을 **응답 해석에 사용하지 않는다** (서버가 보낸 status 를 그대로 신뢰한다).
 * 용도는 두 가지다.
 * 1. Mock Adapter 가 실제 서버와 같은 status 를 재현한다 (rules/frontend.md §5).
 * 2. 향후 Backend 가 같은 매핑을 재사용한다 (rules/backend.md §4 — Handoff 요구사항).
 */
export const ERROR_CODE_HTTP_STATUS: Readonly<Record<ErrorCode, number>> = {
  VALIDATION_FAILED: 400,
  AUTH_REQUIRED: 401,
  AUTH_TOKEN_EXPIRED: 401,
  FORBIDDEN: 403,
  CONSENT_REQUIRED: 403,
  CONSENT_VERSION_OUTDATED: 403,
  ONBOARDING_INCOMPLETE: 409,
  CHILD_NOT_FOUND: 404,
  CHILD_LIMIT_REACHED: 409,
  RESOURCE_NOT_FOUND: 404,
  SESSION_INVALID_TRANSITION: 409,
  SESSION_ALREADY_ACTIVE: 409,
  SESSION_MAX_DURATION_EXCEEDED: 422,
  RECORDING_NOT_ALLOWED_FOR_MODE: 409,
  UPLOAD_TOKEN_EXPIRED: 410,
  RECORDING_INCOMPLETE: 422,
  RECORDING_DELETED: 410,
  ANALYSIS_NOT_AVAILABLE: 404,
  REFLECTION_ALREADY_SUBMITTED: 409,
  REPORT_NOT_ELIGIBLE: 409,
  REPORT_NOT_READY: 409,
  PDF_NOT_READY: 409,
  GIFT_REQUEST_DUPLICATE: 409,
  BOOK_ALREADY_OWNED: 409,
  DELETION_ALREADY_REQUESTED: 409,
  IDEMPOTENCY_KEY_REUSED: 422,
  RATE_LIMITED: 429,
  PROVIDER_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

/** Error Code 에 대응하는 HTTP status 를 돌려준다. */
export function httpStatusForErrorCode(code: ErrorCode): number {
  return ERROR_CODE_HTTP_STATUS[code];
}
