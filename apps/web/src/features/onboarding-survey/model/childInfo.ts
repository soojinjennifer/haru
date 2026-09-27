/**
 * Step 1 폼 상태와 검증 — **순수 함수**만 둔다 (React 의존 없음 → 단위 테스트가 쉽다).
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

import { onboardingCopy } from '../copy';

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

/** 저장된 응답(부분)과 보호자 정보로 폼 초기값을 만든다. */
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
    languageEnvironment: answers?.languageEnvironment ?? [],
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

  return onboardingCopy.childInfo.ageTagLabel(
    Math.floor(months / MONTHS_PER_YEAR),
    months % MONTHS_PER_YEAR,
  );
}

export type ChildInfoFieldErrors = Partial<
  Record<'firstName' | 'birthYearMonth' | 'languageEnvironment', string>
>;

export interface ChildInfoValidation {
  errors: ChildInfoFieldErrors;
  /** 검증을 통과했을 때의 아동 데이터 payload. */
  answers: ChildInfoAnswers | null;
  /** 보호자 데이터 payload — 아동 데이터와 **다른 요청**으로 나간다 (D-16). */
  caregiver: UpdateCaregiverRequest | null;
}

/**
 * 필수 항목 — **결정 D-C**: 이름 · 생년월 · 언어 환경. 성별은 미응답(`null`)으로 진행할 수 있다.
 * Step 2~4 는 전부 선택이므로 여기에만 필수가 있다.
 */
export function validateChildInfo(form: ChildInfoFormState, now: Date): ChildInfoValidation {
  const copy = onboardingCopy.childInfo;
  const errors: ChildInfoFieldErrors = {};

  const firstName = form.firstName.trim();
  if (firstName.length === 0) errors.firstName = copy.firstNameRequired;

  const birthYearMonth = birthYearMonthOf(form);
  if (birthYearMonth === null) errors.birthYearMonth = copy.birthRequired;

  if (form.languageEnvironment.length === 0) {
    errors.languageEnvironment = copy.languagesRequired;
  }

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
    languageEnvironment: [...form.languageEnvironment],
    ...(form.readingRoutine === null ? {} : { readingRoutine: form.readingRoutine }),
  };
}
