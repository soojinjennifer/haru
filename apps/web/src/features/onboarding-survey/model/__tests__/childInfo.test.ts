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
  it('이름 · 생년월만 필수다', () => {
    expect(validateChildInfo(form({ firstName: '   ' }), NOW).errors.firstName).toBeDefined();
    expect(validateChildInfo(form({ birthYear: '' }), NOW).errors.birthYearMonth).toBeDefined();
  });

  /** 사용자 결정 2026-10-04 — 언어는 선택이고 미선택의 기본값은 영어다. */
  it('언어를 전부 해제해도 검증이 막지 않는다 (선택 항목)', () => {
    const result = validateChildInfo(form({ languageEnvironment: [] }), NOW);

    expect(Object.keys(result.errors)).toStrictEqual([]);
    expect(result.answers).not.toBeNull();
    expect(result.answers?.languageEnvironment).toStrictEqual([]);
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
  });

  /**
   * `QA-2R-009` 회귀 — 빈 언어 배열은 **키 자체가 없어야** 한다. 키가 있으면 언어 입력이 없는
   * 가입 화면의 저장이 병합에서 Trial 의 선택을 지운다 (`saveChildDraft`).
   */
  it('언어를 고르지 않았으면 `languageEnvironment` 키를 넣지 않는다 (`QA-2R-009`)', () => {
    const partial = partialChildInfoAnswers(form({ languageEnvironment: [] }));

    expect('languageEnvironment' in partial).toBe(false);
  });

  it('언어를 골랐으면 그대로 담는다', () => {
    const partial = partialChildInfoAnswers(form({ languageEnvironment: ['english', 'korean'] }));

    expect(partial.languageEnvironment).toStrictEqual(['english', 'korean']);
  });

  /**
   * `gender` 는 언어와 **다르게** 둔다: `null` 은 빈 값이 아니라 "미응답" 이라는 선택이고
   * (C-7) 제출 판정도 `gender === undefined` 만 누락으로 본다. 성별을 다루는 화면은 저장값을
   * 폼으로 되살리므로 병합에서 사라지지 않는다.
   */
  it('성별 미응답은 키를 유지한다 (`null` 이 의미 있는 값 — C-7)', () => {
    const partial = partialChildInfoAnswers(form({ gender: null }));

    expect('gender' in partial).toBe(true);
    expect(partial.gender).toBeNull();
  });

  /**
   * 사용자 결정 2026-10-04 — 아직 고른 적이 없으면(키 없음) 영어를 **미리 선택해 보여준다**.
   * 사용자가 직접 해제한 상태(빈 배열)는 그대로 둔다.
   */
  it('언어 키가 없으면 영어가 기본 선택이고, 빈 배열은 해제 상태로 유지된다', () => {
    expect(childInfoFormFrom({ firstName: 'Nova' }, undefined).languageEnvironment).toStrictEqual([
      'english',
    ]);
    expect(
      childInfoFormFrom({ firstName: 'Nova', languageEnvironment: [] }, undefined)
        .languageEnvironment,
    ).toStrictEqual([]);
    expect(childInfoFormFrom(undefined, undefined).languageEnvironment).toStrictEqual(['english']);
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
