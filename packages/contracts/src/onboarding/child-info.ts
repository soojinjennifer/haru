import { z } from 'zod';

import { GenderFieldSchema } from '../enums/gender.js';
import {
  LanguageEnvironmentSchema,
  ReadingRoutineSchema,
  type LanguageEnvironment,
} from './options.js';

/**
 * 온보딩 Step 1 — 아이 기본 정보.
 * 근거: `docs/API_CONTRACTS.md` §3.4, `docs/plans/stage-2-plan.md` §7.1, PRD §7.2 Step 1.
 *
 * **CONFIRMED**: C-5(가입 화면에 아이 필드 없음 → 아이 정보는 여기서만) · C-6(호칭은 first name) ·
 * C-7(성별 nullable) · C-10(3~9세) · D-03(이름 두 칸) · D-1(`lastName` 선택).
 * 필드명·길이 제한은 RECOMMENDED.
 *
 * **보호자 소유 데이터는 여기에 넣지 않는다** (D-16): `relationship` · `timezone` 은
 * `UpdateCaregiverRequest`(`PATCH /v1/me`)로 따로 보낸다. 한 payload 에 보호자·아동 데이터를
 * 섞으면 "동의 전 아동 데이터 0건"(AC-2-13) 을 요청 단위로 검증할 수 없다.
 */

/** 이름 최대 길이 (RECOMMENDED — `docs/API_CONTRACTS.md` §3.4). */
export const CHILD_NAME_MAX_LENGTH = 40;

/** 집에서 쓰는 언어 선택 최대 개수 (RECOMMENDED). */
export const LANGUAGE_ENVIRONMENT_MAX = 5;

/**
 * 언어 환경 **기본값** — 사용자 결정 2026-10-04: 언어 선택은 **선택 항목**이고, 고르지 않으면
 * 영어로 본다 (1차 시장 기준).
 *
 * 값은 여기 한 곳에서만 정의하고 **적용 지점은 제출 경계 하나**다
 * (`apps/web/src/features/onboarding-survey/model/submitRequest.ts`).
 *
 * schema `.default()` 로 넣지 **않는** 이유: `.default()` 는 parse 가 입력을 조용히 바꾼다.
 * 그러면 ① 사용자가 **일부러 비운** 선택(빈 배열)을 표현할 수 없고, ② 같은 enum 배열을 쓰는
 * 읽기 모델(`ChildSchema.languageEnvironment`)과 Mock 응답까지 "비어 있으면 영어" 가 되어
 * 저장값과 응답값이 달라진다. 기본값은 **보내는 쪽이 눈에 보이게** 채운다.
 */
export const DEFAULT_LANGUAGE_ENVIRONMENT: readonly LanguageEnvironment[] = ['english'];

/** `YYYY-MM` 형식 (일 = 1 로 저장된다 — `docs/DATA_MODEL.md` §5 `children.birth_year_month`). */
export const BIRTH_YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * 형식만 검증하는 생년월 schema. **나이 범위는 검증하지 않는다.**
 * 범위까지 필요하면 `createBirthYearMonthSchema(now)` 를 쓴다.
 */
export const BirthYearMonthFormatSchema = z.string().regex(BIRTH_YEAR_MONTH_PATTERN);

export type BirthYearMonth = z.infer<typeof BirthYearMonthFormatSchema>;

/** 가입 가능한 최소 나이 (년) — **CONFIRMED (C-10)**. */
export const MIN_CHILD_AGE_YEARS = 3;

/** 가입 가능한 나이 상한 (년, **미만**) — **CONFIRMED (C-10)**. 9.99세까지 허용한다. */
export const MAX_CHILD_AGE_YEARS_EXCLUSIVE = 10;

const MONTHS_PER_YEAR = 12;

/** 나이 하한 (개월). */
export const MIN_CHILD_AGE_MONTHS = MIN_CHILD_AGE_YEARS * MONTHS_PER_YEAR;

/** 나이 상한 (개월, **미만**). */
export const MAX_CHILD_AGE_MONTHS_EXCLUSIVE = MAX_CHILD_AGE_YEARS_EXCLUSIVE * MONTHS_PER_YEAR;

/**
 * `YYYY-MM` 과 기준 시각으로 **만 나이(개월)** 를 계산한다. 부수효과 없는 순수 함수다.
 *
 * - 생일은 해당 월 1일로 본다 (`docs/DATA_MODEL.md` §5).
 * - 기준 시각은 **UTC 달력**으로 읽는다. 로컬 타임존에 따라 결과가 달라지면
 *   Mock · 테스트 · 향후 Backend 가 서로 다른 판정을 하게 되기 때문이다.
 * - 형식이 맞지 않으면 `null` 을 돌려준다 (예외를 던지지 않는다 — refine 안에서 쓰인다).
 *
 * 화면의 나이 Tag("3yr 4mo")도 이 값에서 파생한다 (서버 값이 아니다 — D-10).
 */
export function childAgeInMonths(birthYearMonth: string, now: Date): number | null {
  if (!BIRTH_YEAR_MONTH_PATTERN.test(birthYearMonth)) return null;

  const year = Number(birthYearMonth.slice(0, 4));
  const month = Number(birthYearMonth.slice(5, 7));

  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth() + 1;

  return (nowYear - year) * MONTHS_PER_YEAR + (nowMonth - month);
}

/**
 * 생년월 schema **팩토리** — 형식(`YYYY-MM`) + 3.0세 이상 10.0세 미만 범위를 검증한다.
 *
 * `new Date()` 를 schema 안에서 직접 부르지 않는다 (D-10):
 * `packages/contracts` 는 `zod` 외 런타임 의존이 없는 순수 패키지여야 하고,
 * 시간에 의존하는 검증이 테스트에서 비결정적이 되면 경계값을 고정할 수 없다.
 * 호출부(Feature · Mock Adapter)가 clock 을 주입한다.
 *
 * 범위를 벗어나면 `VALIDATION_FAILED` 필드 에러가 된다.
 */
export function createBirthYearMonthSchema(now: Date) {
  return BirthYearMonthFormatSchema.refine(
    (value) => {
      const months = childAgeInMonths(value, now);
      return (
        months !== null && months >= MIN_CHILD_AGE_MONTHS && months < MAX_CHILD_AGE_MONTHS_EXCLUSIVE
      );
    },
    {
      // 개발자용 메시지다. 사용자 노출 문구는 copy 모듈이 소유한다 (rules/frontend §8).
      message: `birthYearMonth must place the child between ${String(MIN_CHILD_AGE_YEARS)} and ${String(MAX_CHILD_AGE_YEARS_EXCLUSIVE)} years old`,
    },
  );
}

/**
 * Step 1 응답 — **형식 검증만** 한다 (나이 범위는 `createChildInfoAnswersSchema(now)`).
 *
 * - `lastName` 은 **선택**이다 (D-1). 화면은 두 칸을 유지하되 빈 값으로 진행할 수 있다.
 *   법무 L-07 이 "수집 불가" 로 결론나도 되돌릴 데이터가 없다.
 * - `gender` 는 미응답이 `null` 이다 (C-7). 키 자체는 항상 보낸다.
 */
export const ChildInfoAnswersSchema = z.object({
  firstName: z.string().trim().min(1).max(CHILD_NAME_MAX_LENGTH),
  lastName: z.string().trim().max(CHILD_NAME_MAX_LENGTH).optional(),
  birthYearMonth: BirthYearMonthFormatSchema,
  gender: GenderFieldSchema,
  /**
   * **선택 항목**이다 (사용자 결정 2026-10-04). 빈 배열이 정상 값이며, 보내는 쪽이
   * `DEFAULT_LANGUAGE_ENVIRONMENT` 로 채운다 — `.min(1)` 도 `.default()` 도 두지 않는다.
   */
  languageEnvironment: z.array(LanguageEnvironmentSchema).max(LANGUAGE_ENVIRONMENT_MAX),
  readingRoutine: ReadingRoutineSchema.optional(),
});

export type ChildInfoAnswers = z.infer<typeof ChildInfoAnswersSchema>;

/** 나이 범위까지 검증하는 Step 1 schema. clock 주입 팩토리다 (D-10). */
export function createChildInfoAnswersSchema(now: Date) {
  return ChildInfoAnswersSchema.extend({
    birthYearMonth: createBirthYearMonthSchema(now),
  });
}
