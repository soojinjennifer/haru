import { describe, expect, it } from 'vitest';

import {
  ChildInfoAnswersSchema,
  MAX_CHILD_AGE_YEARS_EXCLUSIVE,
  MIN_CHILD_AGE_YEARS,
  childAgeInMonths,
  createBirthYearMonthSchema,
  createChildInfoAnswersSchema,
} from '../index.js';

/**
 * Step 1 — `docs/API_CONTRACTS.md` §3.4, 결정 D-1 (`lastName` 선택) · D-10 (clock 주입 팩토리).
 * 기준 시각을 **주입**하므로 이 테스트는 실행 시점과 무관하게 결정적이다.
 */
const NOW = new Date('2026-09-25T12:00:00Z');

const base = {
  firstName: 'Emma',
  birthYearMonth: '2021-04',
  gender: null,
  languageEnvironment: ['english'],
};

describe('ChildInfoAnswers — D-1 lastName 선택', () => {
  it('lastName 없이 통과한다', () => {
    const parsed = ChildInfoAnswersSchema.parse(base);
    expect(parsed.lastName).toBeUndefined();
    expect(parsed.firstName).toBe('Emma');
  });

  it('lastName 을 보내면 보존된다', () => {
    expect(ChildInfoAnswersSchema.parse({ ...base, lastName: 'Kim' }).lastName).toBe('Kim');
  });

  it('firstName 은 필수다', () => {
    const { firstName: _firstName, ...withoutFirstName } = base;
    expect(ChildInfoAnswersSchema.safeParse(withoutFirstName).success).toBe(false);
    expect(ChildInfoAnswersSchema.safeParse({ ...base, firstName: '  ' }).success).toBe(false);
  });

  it('gender 미응답은 null 이다 (C-7)', () => {
    expect(ChildInfoAnswersSchema.parse(base).gender).toBeNull();
    expect(ChildInfoAnswersSchema.safeParse({ ...base, gender: 'unknown' }).success).toBe(false);
  });

  it('readingRoutine 은 선택이고 정해진 코드만 받는다', () => {
    expect(ChildInfoAnswersSchema.parse({ ...base, readingRoutine: 'daily' }).readingRoutine).toBe(
      'daily',
    );
    expect(ChildInfoAnswersSchema.safeParse({ ...base, readingRoutine: 'never' }).success).toBe(
      false,
    );
  });

  it('보호자 관계 · 타임존을 받지 않는다 (D-16 — UpdateCaregiver 경로)', () => {
    const parsed = ChildInfoAnswersSchema.parse({
      ...base,
      relationship: 'mother',
      timezone: 'America/Los_Angeles',
    }) as Record<string, unknown>;
    expect(parsed['relationship']).toBeUndefined();
    expect(parsed['timezone']).toBeUndefined();
  });
});

describe('childAgeInMonths — 순수 함수', () => {
  it('기준 시각을 인자로 받아 만 나이(개월)를 계산한다', () => {
    expect(childAgeInMonths('2021-04', NOW)).toBe(65);
    expect(childAgeInMonths('2026-09', NOW)).toBe(0);
  });

  it('형식이 맞지 않으면 null 을 돌려준다 (예외를 던지지 않는다)', () => {
    expect(childAgeInMonths('2021-4', NOW)).toBeNull();
    expect(childAgeInMonths('2021-13', NOW)).toBeNull();
    expect(childAgeInMonths('', NOW)).toBeNull();
  });
});

describe('createBirthYearMonthSchema(now) — D-10 · C-10', () => {
  const schema = createBirthYearMonthSchema(NOW);

  it('형식 YYYY-MM 만 받는다', () => {
    for (const invalid of ['2021/04', '2021-4', '21-04', '2021-00', '2021-13', 'March. 2023']) {
      expect(schema.safeParse(invalid).success).toBe(false);
    }
  });

  it('하한 경계 — 정확히 3.0세는 통과, 1개월 어리면 거부', () => {
    expect(MIN_CHILD_AGE_YEARS).toBe(3);
    expect(schema.safeParse('2023-09').success).toBe(true); // 36개월
    expect(schema.safeParse('2023-10').success).toBe(false); // 35개월
  });

  it('상한 경계 — 9.99세(119개월)는 통과, 10.0세(120개월)는 거부', () => {
    expect(MAX_CHILD_AGE_YEARS_EXCLUSIVE).toBe(10);
    expect(schema.safeParse('2016-10').success).toBe(true); // 119개월
    expect(schema.safeParse('2016-09').success).toBe(false); // 120개월
  });

  it('같은 입력이라도 주입한 clock 이 다르면 판정이 달라진다 (Date.now() 미사용)', () => {
    const later = createBirthYearMonthSchema(new Date('2033-09-25T12:00:00Z'));
    expect(schema.safeParse('2023-09').success).toBe(true);
    expect(later.safeParse('2023-09').success).toBe(false);
  });
});

describe('createChildInfoAnswersSchema(now)', () => {
  it('나이 범위까지 검증한다', () => {
    const schema = createChildInfoAnswersSchema(NOW);
    expect(schema.safeParse(base).success).toBe(true);
    expect(schema.safeParse({ ...base, birthYearMonth: '2025-01' }).success).toBe(false);
  });

  it('범위 검증이 없는 기본 schema 는 형식만 본다', () => {
    expect(ChildInfoAnswersSchema.safeParse({ ...base, birthYearMonth: '2025-01' }).success).toBe(
      true,
    );
  });
});
