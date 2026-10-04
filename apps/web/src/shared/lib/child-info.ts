/**
 * 아이 기본 정보 폼 상태와 검증 — **순수 함수**만 둔다 (React 의존 없음 → 단위 테스트가 쉽다).
 *
 * `R-01`(`stage-3-approvals.md` §11.5)로 **두 화면이 같은 필드를 다룬다**: `/auth/sign-up` 에서
 * 이름·생년월·성별을 받고 `/onboarding/child-info` 에서 표시·편집한다. feature 간 직접 import 가
 * 금지되어 있으므로 이 순수 함수들은 `shared/lib` 에 둔다 (`rules/architecture.md` §3).
 *
 * - 생년월은 년·월 2단 선택이다 (결정 **D-10**). 자유 텍스트를 쓰지 않는다.
 * - 범위 검증(3.0세 이상 10.0세 미만)은 contracts 팩토리 `createChildInfoAnswersSchema(now)`
 *   가 한다 — Mock · 테스트 · 향후 Backend 가 같은 규칙을 공유한다 (C-10).
 * - 나이 표시("3yr 4mo")는 **입력에서 파생**한다. 서버 값이 아니다.
 * - `lastName` 은 선택이다 (결정 **D-1**). 두 칸 UI 는 유지한다.
 * - `relationship` 은 아이 데이터가 아니라 **보호자 데이터**다 (결정 **D-16**) — 폼에는 같이
 *   있지만 `PATCH /v1/me` 로 따로 나간다. 여기에서도 payload 를 분리해 돌려준다.
 */
import {
  DEFAULT_LANGUAGE_ENVIRONMENT,
  MAX_CHILD_AGE_YEARS_EXCLUSIVE,
  MIN_CHILD_AGE_YEARS,
  childAgeInMonths,
  createChildInfoAnswersSchema,
  type CaregiverRelationship,
  type ChildInfoAnswers,
  type Gender,
  type OnboardingDraftAnswers,
  type LanguageEnvironment,
  type ReadingRoutine,
  type UpdateCaregiverRequest,
} from '@haru/contracts';

import { childCopy } from '../copy/child-copy';

const MONTHS_PER_YEAR = 12;

export interface ChildInfoFormState {
  firstName: string;
  lastName: string;
  /** `''` = 미선택. `SelectTrigger` 가 문자열만 다루기 때문에 문자열로 둔다. */
  birthYear: string;
  birthMonth: string;
  gender: Gender | null;
  relationship: CaregiverRelationship | null;
  languageEnvironment: readonly LanguageEnvironment[];
  readingRoutine: ReadingRoutine | null;
}

export const EMPTY_CHILD_INFO_FORM: ChildInfoFormState = {
  firstName: '',
  lastName: '',
  birthYear: '',
  birthMonth: '',
  gender: null,
  relationship: null,
  languageEnvironment: [],
  readingRoutine: null,
};

/**
 * 저장된 응답(부분)과 보호자 정보로 폼 초기값을 만든다.
 *
 * 언어는 **키의 유무로 두 상태를 구분한다** (사용자 결정 2026-10-04):
 * - 키 없음 = 아직 고른 적 없음 → `DEFAULT_LANGUAGE_ENVIRONMENT`(영어)를 **미리 선택해 보여준다**.
 *   "조용히 영어로 전송" 하지 않고 화면에 보이게 두어 사용자가 바꿀 수 있게 한다.
 * - 빈 배열 = 사용자가 **직접 해제** → 그대로 둔다. 기본값이 되살아나면 해제가 불가능해진다.
 */
export function childInfoFormFrom(
  answers: OnboardingDraftAnswers['child_info'],
  relationship: CaregiverRelationship | undefined,
): ChildInfoFormState {
  const [year = '', month = ''] = (answers?.birthYearMonth ?? '').split('-');

  return {
    firstName: answers?.firstName ?? '',
    lastName: answers?.lastName ?? '',
    birthYear: year,
    birthMonth: month,
    gender: answers?.gender ?? null,
    relationship: relationship ?? null,
    languageEnvironment: answers?.languageEnvironment ?? [...DEFAULT_LANGUAGE_ENVIRONMENT],
    readingRoutine: answers?.readingRoutine ?? null,
  };
}

/** `YYYY-MM` 또는 `null`(둘 중 하나라도 미선택). */
export function birthYearMonthOf(form: ChildInfoFormState): string | null {
  if (form.birthYear === '' || form.birthMonth === '') return null;
  return `${form.birthYear}-${form.birthMonth}`;
}

/** 선택 가능한 출생 연도 — 3.0세~9.99세가 될 수 있는 연도만 노출한다 (C-10). */
export function birthYearOptions(now: Date): readonly string[] {
  const nowYear = now.getUTCFullYear();
  const oldest = nowYear - MAX_CHILD_AGE_YEARS_EXCLUSIVE;
  const newest = nowYear - MIN_CHILD_AGE_YEARS;

  return Array.from({ length: newest - oldest + 1 }, (_unused, index) => String(newest - index));
}

/** `01` ~ `12`. 표시 문구는 로캘 이름이 아니라 숫자다 — 번역 비용 없이 오해가 없다. */
export const BIRTH_MONTH_VALUES: readonly string[] = Array.from(
  { length: MONTHS_PER_YEAR },
  (_u, i) => String(i + 1).padStart(2, '0'),
);

/** 화면에 띄우는 나이 Tag. 범위를 벗어나거나 미선택이면 `null`. */
export function ageTagLabel(form: ChildInfoFormState, now: Date): string | null {
  const birthYearMonth = birthYearMonthOf(form);
  if (birthYearMonth === null) return null;

  const months = childAgeInMonths(birthYearMonth, now);
  if (months === null || months < 0) return null;

  return childCopy.ageTagLabel(Math.floor(months / MONTHS_PER_YEAR), months % MONTHS_PER_YEAR);
}

/** 나이 tag 의 접근성 이름 (`3 years 4 months`). 범위를 벗어나거나 미선택이면 `null`. */
export function ageAccessibleLabel(form: ChildInfoFormState, now: Date): string | null {
  const birthYearMonth = birthYearMonthOf(form);
  if (birthYearMonth === null) return null;

  const months = childAgeInMonths(birthYearMonth, now);
  if (months === null || months < 0) return null;

  return childCopy.ageAccessibleLabel(
    Math.floor(months / MONTHS_PER_YEAR),
    months % MONTHS_PER_YEAR,
  );
}

/**
 * 가입 화면에서 받는 아이 필드만 검증한다 (`R-01` · `AC-2R-07`).
 *
 * **비어 있는 것은 오류가 아니다** — 아직 하지 않은 일이기 때문이다. 입력된 생년월이
 * 3~9세 범위를 벗어난 경우만 막는다 (`About your child` 에서 인라인 편집으로도 고칠 수 있으므로
 * 제출 데드락이 생기지 않는다 — `R-08`).
 */
export function validateChildDraftFields(
  form: ChildInfoFormState,
  now: Date,
): Pick<ChildInfoFieldErrors, 'birthYearMonth'> {
  const birthYearMonth = birthYearMonthOf(form);
  if (birthYearMonth === null) return {};

  const months = childAgeInMonths(birthYearMonth, now);
  const valid =
    months !== null &&
    months >= MIN_CHILD_AGE_YEARS * MONTHS_PER_YEAR &&
    months < MAX_CHILD_AGE_YEARS_EXCLUSIVE * MONTHS_PER_YEAR;

  return valid ? {} : { birthYearMonth: childCopy.ageOutOfRange };
}

export type ChildInfoFieldErrors = Partial<Record<'firstName' | 'birthYearMonth', string>>;

export interface ChildInfoValidation {
  errors: ChildInfoFieldErrors;
  /** 검증을 통과했을 때의 아동 데이터 payload. */
  answers: ChildInfoAnswers | null;
  /** 보호자 데이터 payload — 아동 데이터와 **다른 요청**으로 나간다 (D-16). */
  caregiver: UpdateCaregiverRequest | null;
}

/**
 * 필수 항목 — **이름 · 생년월** 둘뿐이다. 성별은 미응답(`null`)으로 진행할 수 있고,
 * **언어 환경은 선택 항목**이다 (사용자 결정 2026-10-04 — 결정 **D-C** 의 "언어 필수" 부분을
 * 대체한다). 고르지 않으면 제출 경계에서 `DEFAULT_LANGUAGE_ENVIRONMENT` 로 채운다.
 * Step 2~4 는 전부 선택이므로 여기에만 필수가 있다.
 */
export function validateChildInfo(form: ChildInfoFormState, now: Date): ChildInfoValidation {
  const copy = childCopy;
  const errors: ChildInfoFieldErrors = {};

  const firstName = form.firstName.trim();
  if (firstName.length === 0) errors.firstName = copy.firstNameRequired;

  const birthYearMonth = birthYearMonthOf(form);
  if (birthYearMonth === null) errors.birthYearMonth = copy.birthRequired;

  const caregiver: UpdateCaregiverRequest | null =
    form.relationship === null ? null : { relationship: form.relationship };

  if (Object.keys(errors).length > 0 || birthYearMonth === null) {
    return { errors, answers: null, caregiver };
  }

  const lastName = form.lastName.trim();
  const parsed = createChildInfoAnswersSchema(now).safeParse({
    firstName,
    ...(lastName.length > 0 ? { lastName } : {}),
    birthYearMonth,
    gender: form.gender,
    languageEnvironment: [...form.languageEnvironment],
    ...(form.readingRoutine === null ? {} : { readingRoutine: form.readingRoutine }),
  });

  if (!parsed.success) {
    // 남는 실패 원인은 나이 범위뿐이다 (형식은 SelectTrigger 가 보장한다).
    return { errors: { birthYearMonth: copy.ageOutOfRange }, answers: null, caregiver };
  }

  return { errors, answers: parsed.data, caregiver };
}

/**
 * 중도 저장용 부분 payload — 검증을 통과하지 못해도 입력한 만큼은 보존한다 (FR-03).
 * 빈 값은 키 자체를 넣지 않는다 (서버에 "지워 달라" 는 뜻이 되지 않게).
 *
 * `languageEnvironment` 가 **빈 배열이면 키를 빼는** 이유 (`QA-2R-009`): 이 payload 는
 * `saveChildDraft` 에서 `{ ...기존, ...이 값 }` 으로 합쳐진다. 빈 배열을 담아 보내면 가입
 * 화면(언어 입력이 없는 화면)의 저장이 Trial 에서 고른 언어를 **조용히 지운다**. 동의 직후
 * Guard 가 저장된 단계로 되돌리므로(`§11.19` 7-2) 사용자는 `About your child` 를 다시 지나지
 * 않고, 알아챌 방법도 없다. 키가 없으면 병합이 기존 값을 그대로 남긴다. 끝까지 고르지 않은
 * 경우에도 되돌리지 않는다 — 언어 환경은 선택이고(`§11.22`, 2026-10-04), 제출 경계에서
 * `buildSubmitRequest` 가 `DEFAULT_LANGUAGE_ENVIRONMENT`(`['english']`)로 채운다.
 *
 * `gender` 는 **다르다** — 키를 항상 보낸다. `null` 은 빈 값이 아니라 "미응답" 이라는 의미 있는
 * 선택이고(C-7, contracts `ChildInfoAnswers.gender`), 제출 판정도 `gender === undefined` 만
 * 누락으로 본다. 성별을 다루는 두 화면(`/auth/sign-up` · `child_info`)은 저장된 값을 폼으로
 * 되살리므로(`childInfoFormFrom`) 병합에서 값이 사라지지 않는다.
 */
export function partialChildInfoAnswers(
  form: ChildInfoFormState,
): NonNullable<OnboardingDraftAnswers['child_info']> {
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const birthYearMonth = birthYearMonthOf(form);

  return {
    ...(firstName.length > 0 ? { firstName } : {}),
    ...(lastName.length > 0 ? { lastName } : {}),
    ...(birthYearMonth === null ? {} : { birthYearMonth }),
    gender: form.gender,
    ...(form.languageEnvironment.length === 0
      ? {}
      : { languageEnvironment: [...form.languageEnvironment] }),
    ...(form.readingRoutine === null ? {} : { readingRoutine: form.readingRoutine }),
  };
}
