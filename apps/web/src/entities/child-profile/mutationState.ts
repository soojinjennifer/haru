/**
 * Stage 6 mutation hook 이 공통으로 돌려주는 실패 표시 정보 — 화면 문구를 고르는 데 필요한 값만 담는다.
 * 값(아이 이름·응답)은 담지 않는다 (Privacy — AC-6-43).
 */
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import type { ErrorCode } from '@haru/contracts';

export interface MutationFailure {
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  /** `VALIDATION_FAILED` 의 `details.fields` — 필드 이름만 (AC-6-20). 없으면 빈 배열. */
  invalidFields: readonly string[];
}

export function readMutationFailure(error: unknown): MutationFailure {
  if (!isHaruApiError(error)) {
    return { errorCode: undefined, isOffline: isNetworkError(error), invalidFields: [] };
  }
  const fields = error.details?.['fields'];
  return {
    errorCode: error.code,
    isOffline: false,
    invalidFields: Array.isArray(fields)
      ? fields.filter((field): field is string => typeof field === 'string')
      : [],
  };
}
