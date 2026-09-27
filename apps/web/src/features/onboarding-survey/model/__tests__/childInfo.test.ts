/**
 * Step 1 검증 — 결정 **D-1**(`lastName` 선택) · **D-10**(년·월 2단 + clock 주입) ·
 * **D-16**(보호자 데이터 분리) · **D-C**(필수 항목) · C-7 · C-10.
 * AC-2-21 · AC-2-22.
 */
import { describe, expect, it } from 'vitest';

import {
  ageTagLabel,
  birthYearMonthOf,
  birthYearOptions,
  childInfoFormFrom,
  partialChildInfoAnswers,
  validateChildInfo,
  BIRTH_MONTH_VALUES,
  EMPTY_CHILD_INFO_FORM,
  type ChildInfoFormState,
} from '../childInfo';

/** 주입 clock — 2026-09-26 기준 (경계값을 고정하기 위해 실제 시간을 쓰지 않는다). */
const NOW = new Date('2026-09-26T12:00:00Z');

function form(overrides: Partial<ChildInfoFormState> = {}): ChildInfoFormState {
  return {
    ...EMPTY_CHILD_INFO_FORM,
    firstName: 'Nova',
    birthYear: '2021',
    birthMonth: '04',
    languageEnvironment: ['english'],
    ...overrides,
  };
}

describe('생년월 입력 (D-10)', () => {
  it('월 선택지는 01~12 이다', () => {
    expect(BIRTH_MONTH_VALUES).toHaveLength(12);
    expect(BIRTH_MONTH_VALUES[0]).toBe('01');
    expect(BIRTH_MONTH_VALUES[11]).toBe('12');
  });

  it('연도 선택지는 3세~9세가 될 수 있는 범위만 노출한다 (C-10)', () => {
    const years = birthYearOptions(NOW);

    expect(years[0]).toBe('2023');
    expect(years[years.length - 1]).toBe('2016');
  });

  it('년·월 중 하나라도 미선택이면 `YYYY-MM` 을 만들지 않는다', () => {
    expect(birthYearMonthOf(form({ birthMonth: '' }))).toBeNull();
    expect(birthYearMonthOf(form())).toBe('2021-04');
  });
});

describe('나이 Tag 는 입력에서 파생된다 (서버 값이 아니다)', () => {
  it('년·월 차이를 "Nyr Nmo" 로 표시한다', () => {
    expect(ageTagLabel(form({ birthYear: '2021', birthMonth: '04' }), NOW)).toBe('5yr 5mo');
    expect(ageTagLabel(form({ birthYear: '2023', birthMonth: '09' }), NOW)).toBe('3yr 0mo');
  });

  it('미선택이면 Tag 를 그리지 않는다', () => {
    expect(ageTagLabel(form({ birthYear: '' }), NOW)).toBeNull();
  });
});

describe('나이 범위 경계 (AC-2-22 · C-10)', () => {
  it('3세 0개월은 통과한다', () => {
    expect(
      validateChildInfo(form({ birthYear: '2023', birthMonth: '09' }), NOW).answers,
    ).not.toBeNull();
  });

  it('9세 11개월은 통과한다', () => {
    expect(
      validateChildInfo(form({ birthYear: '2016', birthMonth: '10' }), NOW).answers,
    ).not.toBeNull();
  });

  it('2세 11개월은 필드 에러다', () => {
    const result = validateChildInfo(form({ birthYear: '2023', birthMonth: '10' }), NOW);

    expect(result.answers).toBeNull();
    expect(result.errors.birthYearMonth).toContain('ages 3 to 9');
  });

  it('10세 0개월은 필드 에러다', () => {
    const result = validateChildInfo(form({ birthYear: '2016', birthMonth: '09' }), NOW);

    expect(result.answers).toBeNull();
    expect(result.errors.birthYearMonth).toContain('ages 3 to 9');
  });
});

describe('필수 · 선택 (결정 D-C · D-1 · C-7)', () => {
  it('이름 · 생년월 · 언어 환경만 필수다', () => {
    expect(validateChildInfo(form({ firstName: '   ' }), NOW).errors.firstName).toBeDefined();
    expect(validateChildInfo(form({ birthYear: '' }), NOW).errors.birthYearMonth).toBeDefined();
    expect(
      validateChildInfo(form({ languageEnvironment: [] }), NOW).errors.languageEnvironment,
    ).toBeDefined();
  });

  it('`lastName` 은 비어 있어도 통과하고, 빈 값은 payload 에 키로도 남지 않는다 (D-1)', () => {
    const answers = validateChildInfo(form({ lastName: '  ' }), NOW).answers;

    expect(answers).not.toBeNull();
    expect(answers === null ? true : 'lastName' in answers).toBe(false);
  });

  it('성별 미선택은 `gender: null` 로 전송된다 (C-7)', () => {
    const answers = validateChildInfo(form(), NOW).answers;

    expect(answers?.gender).toBeNull();
  });

  it('독서 루틴은 선택이다', () => {
    expect(validateChildInfo(form(), NOW).answers?.readingRoutine).toBeUndefined();
    expect(validateChildInfo(form({ readingRoutine: 'daily' }), NOW).answers?.readingRoutine).toBe(
      'daily',
    );
  });
});

describe('보호자 데이터 분리 (D-16)', () => {
  it('관계는 아동 payload 에 들어가지 않고 별도 payload 로 나온다', () => {
    const result = validateChildInfo(form({ relationship: 'grandparent' }), NOW);

    expect(result.caregiver).toStrictEqual({ relationship: 'grandparent' });
    expect(JSON.stringify(result.answers)).not.toContain('grandparent');
  });

  it('관계 미선택이면 보호자 payload 를 만들지 않는다 (빈 PATCH 를 보내지 않는다)', () => {
    expect(validateChildInfo(form(), NOW).caregiver).toBeNull();
  });
});

describe('중도 저장 payload (FR-03)', () => {
  it('검증을 통과하지 못해도 입력한 만큼은 보존한다', () => {
    const partial = partialChildInfoAnswers(
      form({ firstName: 'No', birthYear: '', birthMonth: '', languageEnvironment: [] }),
    );

    expect(partial.firstName).toBe('No');
    expect('birthYearMonth' in partial).toBe(false);
    expect(partial.languageEnvironment).toStrictEqual([]);
  });

  it('저장된 응답에서 폼 초기값을 되만든다', () => {
    const restored = childInfoFormFrom(
      {
        firstName: 'Nova',
        birthYearMonth: '2021-04',
        gender: 'girl',
        languageEnvironment: ['korean'],
      },
      'mother',
    );

    expect(restored.birthYear).toBe('2021');
    expect(restored.birthMonth).toBe('04');
    expect(restored.gender).toBe('girl');
    expect(restored.relationship).toBe('mother');
  });
});
