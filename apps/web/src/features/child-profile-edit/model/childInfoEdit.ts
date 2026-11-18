/**
 * 아이 정보 수정 — 순수 함수 (Stage 6 Spec §2.5, AC-6-18 · 19 · 20).
 *
 * - 초기값 = 서버 `ChildProfile.child` (`GET /profile`, `D6-5`). `relationship` 은 다루지 않는다 (`N6-39`).
 * - 요청 body = **바뀐 필드만** (AC-6-19). 바뀐 것이 없으면 `null` → 저장 비활성.
 * - 문자열은 trim 해서 비교·전송한다. 성(`lastName`)을 지우면 `''` 을 보낸다 (contracts — 성 지우기).
 * - 언어는 **순서와 무관한 집합**으로 비교한다 (Chip 토글 순서가 바뀌어도 같은 선택이면 변경 아님).
 */
import type { Child, UpdateChildRequest } from '@haru/contracts';

import { childCopy } from '../../../shared/copy/child-copy';
import {
  birthYearMonthOf,
  childInfoFormFrom,
  type ChildInfoFormState,
} from '../../../shared/lib/child-info';
import type { ChildInfoFieldsErrors } from '../../../entities/child';
import { childInfoEditCopy } from '../copy';

/** 서버 아이 정보 → 폼 상태 (언어 빈 배열도 그대로 — 키가 항상 있다). */
export function childInfoFormFromChild(child: Child): ChildInfoFormState {
  return childInfoFormFrom(
    {
      firstName: child.firstName,
      ...(child.lastName === undefined ? {} : { lastName: child.lastName }),
      birthYearMonth: child.birthYearMonth,
      gender: child.gender,
      languageEnvironment: [...child.languageEnvironment],
      ...(child.readingRoutine === undefined ? {} : { readingRoutine: child.readingRoutine }),
    },
    undefined,
  );
}

function sameLanguages(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((value) => set.has(value));
}

/** 바뀐 필드만 담은 요청 body. 바뀐 것이 없으면 `null`. */
export function buildUpdateChildBody(
  initial: ChildInfoFormState,
  form: ChildInfoFormState,
): UpdateChildRequest | null {
  const body: UpdateChildRequest = {};

  const firstName = form.firstName.trim();
  if (firstName !== initial.firstName.trim()) body.firstName = firstName;

  const lastName = form.lastName.trim();
  if (lastName !== initial.lastName.trim()) body.lastName = lastName;

  const birthYearMonth = birthYearMonthOf(form);
  if (birthYearMonth !== null && birthYearMonth !== birthYearMonthOf(initial)) {
    body.birthYearMonth = birthYearMonth;
  }

  if (form.gender !== initial.gender) body.gender = form.gender;

  if (!sameLanguages(form.languageEnvironment, initial.languageEnvironment)) {
    body.languageEnvironment = [...form.languageEnvironment];
  }

  if (form.readingRoutine !== null && form.readingRoutine !== initial.readingRoutine) {
    body.readingRoutine = form.readingRoutine;
  }

  return Object.keys(body).length === 0 ? null : body;
}

/** `ChildInfoFields` 가 오류 슬롯을 가진 필드. 언어(Chip 묶음)는 슬롯이 없다. */
const SLOT_FIELDS = [
  'firstName',
  'lastName',
  'birthYearMonth',
  'gender',
  'readingRoutine',
] as const;

export interface ServerFieldErrors {
  errors: ChildInfoFieldsErrors;
  /** 슬롯이 없는 필드(언어 등)가 거부됐다 — 저장 실패 안내로 대신 알린다. */
  unplaced: boolean;
}

/** 서버 `VALIDATION_FAILED` 의 `details.fields` → 필드별 문구 (AC-6-20). 값은 다루지 않는다. */
export function serverFieldErrors(fields: readonly string[]): ServerFieldErrors {
  const errors: ChildInfoFieldsErrors = {};
  let unplaced = false;

  for (const field of fields) {
    const slot = SLOT_FIELDS.find((name) => name === field);
    if (slot === undefined) {
      unplaced = true;
      continue;
    }
    errors[slot] =
      slot === 'birthYearMonth' ? childCopy.ageOutOfRange : childInfoEditCopy.fieldInvalid;
  }

  return { errors, unplaced };
}
