import { z } from 'zod';

import { createCustomTimeRefine } from '../activity/selection.js';
import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { TimeOfDaySchema } from '../common/time-of-day.js';
import { ReadingContextSchema } from '../enums/reading-context.js';
import { SessionModeSchema } from '../enums/session-mode.js';

import { SessionSummarySchema } from './session.js';

/**
 * 세션 생성 — `POST /v1/sessions` (IK). 근거: `docs/API_CONTRACTS.md` §3.2, §4 Stage 4.
 * Errors: `ONBOARDING_INCOMPLETE` · `SESSION_ALREADY_ACTIVE`.
 */

/** 오프라인 생성 멱등 키 길이 (§3.2 스케치). */
export const CLIENT_SESSION_KEY_MIN_LENGTH = 16;
export const CLIENT_SESSION_KEY_MAX_LENGTH = 64;

/**
 * - `readingContext` 는 **nullable** 이다 — 서재 경로는 Reading Context 없이 시작한다
 *   (**CONFIRMED 2026-10-14, `D4-25`**, `N4-04` 해소). Activity Card 경로의 필수 규칙(`D-9`)은
 *   선택 확정(`SelectActivityOptionRequest`)이 소유한다.
 * - `custom_time` 이면 `customTime` 필수 — `createCustomTimeRefine()` **재사용** (AC-4-10).
 * - 녹음 세션은 경로와 무관하게 책이 필요하다 — `bookId` 또는 `childBookId` (AC-4-09, `D4-25`).
 */
export const CreateSessionRequestSchema = z
  .object({
    childId: IdSchema,
    mode: SessionModeSchema,
    activityCardOptionId: IdSchema.nullable(),
    bookId: IdSchema.nullable(),
    childBookId: IdSchema.nullable(),
    readingContext: ReadingContextSchema.nullable(),
    customTime: TimeOfDaySchema.optional(),
    clientSessionKey: z
      .string()
      .min(CLIENT_SESSION_KEY_MIN_LENGTH)
      .max(CLIENT_SESSION_KEY_MAX_LENGTH),
    /** 클라이언트에서 세션이 준비된 시각 (`occurredAt` 규약과 같은 의미). */
    readyAt: IsoDateTimeSchema,
  })
  .superRefine(createCustomTimeRefine())
  .refine(
    (value) =>
      value.mode === 'conversation_only' || value.bookId !== null || value.childBookId !== null,
    { message: 'recorded session requires a book', path: ['bookId'] },
  );

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const CreateSessionResponseSchema = z.object({
  session: SessionSummarySchema,
});

export type CreateSessionResponse = z.infer<typeof CreateSessionResponseSchema>;
