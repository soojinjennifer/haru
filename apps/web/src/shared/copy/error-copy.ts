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
  BOOK_ALREADY_OWNED: {
    title: 'Already in your library',
    description: 'This book is already on your shelf.',
  },
  DELETION_ALREADY_REQUESTED: {
    title: 'Deletion already requested',
    description: 'Your earlier request is still being processed.',
  },
  // Stage 8 `C8-5` — 제목 = `VG8-A-03` 확정 (design-agent) · 설명 = Spec §10.4 "쓰기 차단" 원문.
  ACCOUNT_DELETION_PENDING: {
    title: 'Changes are paused',
    description: 'Your data is being deleted, so changes are paused.',
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

/**
 * 세션 시작을 막은 응답 중 **고유 안내가 있는 것** (`S4-H4`, `D4-145` NB-18 — 기존 문구 그대로 재사용).
 *
 * - `SESSION_ALREADY_ACTIVE` — 열린 세션이 `recording`/`paused` 일 때 (이 탭에서 이어 갈 수 없다)
 * - `ONBOARDING_INCOMPLETE` — 서버는 미완료라 했는데 다시 받은 `me` 가 `completed` 일 때 (어긋남, 이동 0)
 *
 * 그 밖의 실패(Detail 조회 실패 포함 — `D4-146` Q4)는 `null` → 화면은 기존 일반 실패 문구를 쓴다.
 */
export function sessionStartBlockedCopy(code: ErrorCode | undefined): ErrorMessage | null {
  return code === 'SESSION_ALREADY_ACTIVE' ||
    code === 'ONBOARDING_INCOMPLETE' ||
    code === 'ACCOUNT_DELETION_PENDING'
    ? ERROR_COPY[code]
    : null;
}

/**
 * 삭제 진행 중 쓰기 차단 (`ACCOUNT_DELETION_PENDING`, Stage 8 `C8-5` · AC-8-32) — 화면 고유 실패 문구 대신 쓸 문구.
 * 다른 code 면 `null` (화면은 원래 문구를 쓴다). 표면은 **각 화면의 기존 실패 표면** 그대로다 — 새 UI · Toast 0
 * (Spec §2.9 · `VG8-A-03`: 2줄 표면 = 제목 + 설명).
 */
export function deletionPendingCopy(code: ErrorCode | undefined): ErrorMessage | null {
  return code === 'ACCOUNT_DELETION_PENDING' ? ERROR_COPY.ACCOUNT_DELETION_PENDING : null;
}

/**
 * Toast(1줄 표면)의 쓰기 차단 문구 — `ACCOUNT_DELETION_PENDING` 이면 **설명만** (Spec §2.9 `VG8-C-08`: 제목 + 설명을 이어 붙이면
 * "paused" 가 반복된다). 다른 code 면 `null` (호출부는 원래 문구를 쓴다).
 */
export function deletionPendingToastMessage(code: ErrorCode | undefined): string | null {
  return code === 'ACCOUNT_DELETION_PENDING'
    ? ERROR_COPY.ACCOUNT_DELETION_PENDING.description
    : null;
}

/**
 * 글 한 칸(Toast `message`)에 제목과 설명을 함께 담는다 — `제목. 설명` (`D4-146` Q1 ⓐ). 단어는 바꾸지 않는다.
 * 쓰기 차단(`ACCOUNT_DELETION_PENDING`)은 이 함수가 아니라 `deletionPendingToastMessage` 를 쓴다 (`VG8-C-08`).
 */
export function joinErrorMessage(message: ErrorMessage): string {
  return `${message.title}. ${message.description}`;
}
