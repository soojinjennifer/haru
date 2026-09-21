/**
 * Error Code → 사용자 노출 문구 매핑 (`.claude/rules/frontend.md` §8, Plan §9.5).
 *
 * - 서버(Mock)의 `message` 는 **개발자용**이다. 화면에는 절대 그대로 띄우지 않는다
 *   (API_CONTRACTS §1.1). 사용자에게는 이 표의 문구만 보여준다.
 * - 사용자 노출 언어는 영어다. 진단·판정·비교 표현을 쓰지 않는다.
 * - `Record<ErrorCode, …>` 이므로 contracts 에 코드가 추가되면 여기가 **컴파일 에러**로
 *   빠짐을 알려준다 (문구 누락 방지).
 */
import { type ErrorCode } from '@haru/contracts';

export interface ErrorMessage {
  title: string;
  description: string;
}

/** 전송 실패(offline · timeout). Error Code 가 없는 경우다. */
export const networkErrorCopy: ErrorMessage = {
  title: 'You are offline',
  description: 'HARU will try again once the connection is back.',
};

/** 어디에도 해당하지 않는 경우. */
export const unknownErrorCopy: ErrorMessage = {
  title: 'Something went wrong',
  description: 'Please try again in a moment.',
};

export const retryLabel = 'Try again';

export const ERROR_COPY: Readonly<Record<ErrorCode, ErrorMessage>> = {
  VALIDATION_FAILED: {
    title: 'That could not be saved',
    description: 'Some details need a quick check before we can continue.',
  },
  AUTH_REQUIRED: {
    title: 'Please sign in',
    description: 'Sign in again to continue where you left off.',
  },
  AUTH_TOKEN_EXPIRED: {
    title: 'Your session ended',
    description: 'Sign in again to continue where you left off.',
  },
  FORBIDDEN: {
    title: 'Not available',
    description: 'This content is not available with the current account.',
  },
  CONSENT_REQUIRED: {
    title: 'Consent needed first',
    description: 'Review and give consent to continue with this step.',
  },
  CONSENT_VERSION_OUTDATED: {
    title: 'Consent has been updated',
    description: 'Please review the updated consent to continue.',
  },
  ONBOARDING_INCOMPLETE: {
    title: 'A few setup steps are left',
    description: 'Finish setting up the profile to continue.',
  },
  CHILD_NOT_FOUND: {
    title: 'Profile not found',
    description: 'This profile is no longer available.',
  },
  CHILD_LIMIT_REACHED: {
    title: 'One profile for now',
    description: 'HARU supports one child profile at the moment.',
  },
  RESOURCE_NOT_FOUND: {
    title: 'Not found',
    description: 'This content is no longer available.',
  },
  SESSION_INVALID_TRANSITION: {
    title: 'Storytime is out of sync',
    description: 'HARU refreshed this storytime. You can pick up from here.',
  },
  SESSION_ALREADY_ACTIVE: {
    title: 'A storytime is already open',
    description: 'Continue the open storytime, or finish it before starting a new one.',
  },
  SESSION_MAX_DURATION_EXCEEDED: {
    title: 'That was a long storytime',
    description: 'HARU keeps up to 30 minutes of recording per storytime.',
  },
  RECORDING_NOT_ALLOWED_FOR_MODE: {
    title: 'This storytime is talk-only',
    description: 'Recording is off for this storytime, so there is nothing to upload.',
  },
  UPLOAD_TOKEN_EXPIRED: {
    title: 'Upload paused',
    description: 'HARU will refresh the upload and continue. Your recording is safe.',
  },
  RECORDING_INCOMPLETE: {
    title: 'Upload is not finished',
    description: 'Part of the recording has not arrived yet. HARU will try again.',
  },
  RECORDING_DELETED: {
    title: 'Recording removed',
    description: 'This recording is no longer stored.',
  },
  ANALYSIS_NOT_AVAILABLE: {
    title: 'No notes for this storytime',
    description: 'Observations are only prepared for recorded storytimes.',
  },
  REFLECTION_ALREADY_SUBMITTED: {
    title: 'Already noted',
    description: 'Your reflection for this storytime is saved.',
  },
  REPORT_NOT_ELIGIBLE: {
    title: 'Report is not ready yet',
    description: 'A few more recorded storytimes will complete this cycle.',
  },
  REPORT_NOT_READY: {
    title: 'Report is still being prepared',
    description: 'This usually takes a little while. We will let you know.',
  },
  PDF_NOT_READY: {
    title: 'PDF is still being prepared',
    description: 'Give it a moment and try again.',
  },
  GIFT_REQUEST_DUPLICATE: {
    title: 'Request already in progress',
    description: 'There is already an open request for this book.',
  },
  DELETION_ALREADY_REQUESTED: {
    title: 'Deletion already requested',
    description: 'Your earlier request is still being processed.',
  },
  IDEMPOTENCY_KEY_REUSED: {
    title: 'That request changed',
    description: 'Please start the action again.',
  },
  RATE_LIMITED: {
    title: 'Too many requests',
    description: 'Please wait a moment and try again.',
  },
  PROVIDER_UNAVAILABLE: {
    title: 'This is taking longer than usual',
    description: 'A service HARU relies on is busy. We will keep trying.',
  },
  INTERNAL_ERROR: {
    title: 'Something went wrong',
    description: 'Please try again in a moment.',
  },
};

export function errorCopyForCode(code: ErrorCode | undefined): ErrorMessage {
  return code === undefined ? unknownErrorCopy : (ERROR_COPY[code] ?? unknownErrorCopy);
}
