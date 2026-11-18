import type { z } from 'zod';

import { ChildInfoAnswersSchema, createBirthYearMonthSchema } from '../onboarding/child-info.js';

/**
 * `PATCH /v1/children/:childId` 요청 — PRD §7.8 · Stage 6 Plan §7 C-4 (`N6-04` → `D6-3`, 정정 `N6-39` → `D6-8`).
 * 응답은 갱신된 `ChildProfile` 이다. 오류: `VALIDATION_FAILED` (`details.fields`) · `CHILD_NOT_FOUND`.
 *
 * **편집 가능 필드 = 온보딩 Step 1 의 아이 필드 전부** — `firstName` · `lastName` · `birthYearMonth` ·
 * `gender` · `languageEnvironment` · `readingRoutine`. 필드 규칙은 `ChildInfoAnswersSchema` 를 **그대로** 쓴다
 * (같은 화면 어휘 · 같은 검증 — 이름 trim · 40자, 언어 최대 5개).
 *
 * ⛔ **`relationship` 은 없다** (`N6-39`) — 보호자 소유 데이터이며 `PATCH /v1/me`(`UpdateCaregiverRequest`)로
 * 보낸다 (D-16). 아동 payload 에 보호자 데이터를 섞지 않는다.
 *
 * - **PATCH 의미**: 보낸 필드만 바꾼다. 바뀐 필드만 보내는 것은 호출자(feature) 책임이다 (AC-6-19).
 * - **빈 요청 거부** — 바꿀 필드가 하나도 없으면 `VALIDATION_FAILED` (AC-6-05).
 * - **미허용 필드 거부** (`strict`) — `relationship` · `topicTags` · `id` 등 알 수 없는 키가 있으면 거부한다.
 * - `lastName: ''`(trim 후 빈 문자열) = **성 지우기**. 성은 선택 항목이다 (D-1).
 * - `gender: null` = 미응답 (C-7).
 * - 생년월 **나이 범위(3~9세)** 는 clock 주입 팩토리 `createUpdateChildRequestSchema(now)` 로 검증한다
 *   (D-10 — schema 안에서 `new Date()` 를 부르지 않는다). 형식만 보는 `UpdateChildRequestSchema` 는
 *   Http Adapter 경계·타입 파생용이다. 서버 재검증과 연령대 변경 영향은 `P6-BIP-08`.
 */

/** `UpdateChildRequest` 가 받을 수 있는 필드 — 온보딩 Step 1 의 아이 필드와 같다 (`N6-39`). */
export const UPDATE_CHILD_FIELDS = [
  'firstName',
  'lastName',
  'birthYearMonth',
  'gender',
  'languageEnvironment',
  'readingRoutine',
] as const;

export type UpdateChildField = (typeof UPDATE_CHILD_FIELDS)[number];

const EMPTY_UPDATE_MESSAGE = 'UpdateChildRequest needs at least one field to change';

/** 값이 있는(=`undefined` 가 아닌) 필드가 하나 이상인지. `gender: null` 은 값이다. */
function hasAnyField(value: Readonly<Record<string, unknown>>): boolean {
  return Object.values(value).some((field) => field !== undefined);
}

/** 형식 검증만 하는 요청 schema (나이 범위 없음). */
export const UpdateChildRequestSchema = ChildInfoAnswersSchema.partial()
  .strict()
  .refine(hasAnyField, { message: EMPTY_UPDATE_MESSAGE });

export type UpdateChildRequest = z.infer<typeof UpdateChildRequestSchema>;

/** 나이 범위(3.0세 이상 10.0세 미만)까지 검증하는 요청 schema. clock 주입 팩토리다 (D-10). */
export function createUpdateChildRequestSchema(now: Date) {
  return ChildInfoAnswersSchema.extend({ birthYearMonth: createBirthYearMonthSchema(now) })
    .partial()
    .strict()
    .refine(hasAnyField, { message: EMPTY_UPDATE_MESSAGE });
}
