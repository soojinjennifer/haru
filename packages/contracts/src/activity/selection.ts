import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { TimeOfDaySchema } from '../common/time-of-day.js';
import { ReadingContextSchema } from '../enums/reading-context.js';
import { PromptSetSchema } from '../prompts/prompt.js';

import { ActivityCardOptionSchema } from './option.js';

/**
 * 선택지 확정 — `POST /v1/activity-cards/:cardId/selection`
 * (근거: `docs/API_CONTRACTS.md` §4 Stage 3 · FR-07 · FR-08).
 *
 * `readingContext` 는 **Activity Card 경로에서 필수**다 (`D-9`). 서재 경로
 * (`CreateSession.readingContext`)는 nullable 로 남으며 그쪽은 Stage 4 다.
 */

/**
 * `custom_time` 일 때만 `customTime` 이 필수라는 규칙.
 *
 * 규칙을 schema 안에 `.superRefine` 리터럴로 묻지 않고 **팩토리로 분리**한다 — 같은 규칙을
 * 쓰는 경로(서재 경로의 세션 생성 등)가 나중에 생겨도 조건문이 복제되지 않는다
 * (Stage 2 `D-10` 의 "규칙은 팩토리" 원칙).
 *
 * `readingContext` 가 `null` 인 입력도 받는다 — Stage 4 서재 경로의 `CreateSessionRequest` 는
 * Reading Context 없이 시작할 수 있다 (`D4-25`). `null` 은 `custom_time` 이 아니므로 규칙은 통과한다.
 * 판정 로직은 바뀌지 않았다 (입력 타입만 넓혔다).
 */
export function createCustomTimeRefine() {
  return (
    value: {
      readingContext: z.infer<typeof ReadingContextSchema> | null;
      customTime?: string | undefined;
    },
    ctx: z.RefinementCtx,
  ): void => {
    if (value.readingContext !== 'custom_time') return;
    if (value.customTime !== undefined) return;

    ctx.addIssue({
      code: 'custom',
      path: ['customTime'],
      message: 'customTime is required when readingContext is custom_time.',
    });
  };
}

export const SelectActivityOptionRequestSchema = z
  .object({
    optionId: IdSchema,
    readingContext: ReadingContextSchema,
    customTime: TimeOfDaySchema.optional(),
  })
  .superRefine(createCustomTimeRefine());

export type SelectActivityOptionRequest = z.infer<typeof SelectActivityOptionRequestSchema>;

export const ActivityCardSelectionSchema = z.object({
  option: ActivityCardOptionSchema,
  promptSet: PromptSetSchema,
});

export type ActivityCardSelection = z.infer<typeof ActivityCardSelectionSchema>;
