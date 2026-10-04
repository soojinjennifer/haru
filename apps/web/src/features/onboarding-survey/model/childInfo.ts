/**
 * `About your child` 폼 모델 — 구현은 `shared/lib/child-info` 에 있다.
 *
 * `R-01` 로 같은 필드를 `/auth/sign-up` 과 `/onboarding/child-info` 가 함께 쓰게 되어
 * 순수 함수를 `shared` 로 옮겼다 (feature 간 직접 import 금지 — `rules/architecture.md` §3).
 * 이 파일은 feature 안에서의 import 경로를 유지하기 위한 재공개 지점이다.
 */
export {
  ageAccessibleLabel,
  ageTagLabel,
  BIRTH_MONTH_VALUES,
  birthYearMonthOf,
  birthYearOptions,
  childInfoFormFrom,
  EMPTY_CHILD_INFO_FORM,
  partialChildInfoAnswers,
  validateChildDraftFields,
  validateChildInfo,
  type ChildInfoFieldErrors,
  type ChildInfoFormState,
  type ChildInfoValidation,
} from '../../../shared/lib/child-info';
