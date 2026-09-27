import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { GenderFieldSchema } from '../enums/gender.js';
import { BirthYearMonthFormatSchema, CHILD_NAME_MAX_LENGTH } from '../onboarding/child-info.js';
import {
  GrowthGoalSchema,
  LanguageEnvironmentSchema,
  ReadingRoutineSchema,
  TopicTagSchema,
} from '../onboarding/options.js';

/**
 * 아이 1명 — `docs/DATA_MODEL.md` §5 `children` 의 Frontend 표현.
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2 (`ProfileResult.child` · `ChildProfile.child`).
 *
 * MVP 는 보호자당 아이 1명이다 (`caregiver_id` UNIQUE). 초과 생성 시도는
 * `CHILD_LIMIT_REACHED` 로 거부된다 (PRD §1.6).
 *
 * **호칭은 `firstName` 만 쓴다** (C-6). `lastName` 은 선택이며 화면·알림·AI 입력에 쓰지 않는다 (D-1).
 */
export const ChildSchema = z.object({
  id: IdSchema,
  firstName: z.string().min(1).max(CHILD_NAME_MAX_LENGTH),
  lastName: z.string().max(CHILD_NAME_MAX_LENGTH).optional(),
  birthYearMonth: BirthYearMonthFormatSchema,
  gender: GenderFieldSchema,
  languageEnvironment: z.array(LanguageEnvironmentSchema),
  readingRoutine: ReadingRoutineSchema.optional(),
  topicTags: z.array(TopicTagSchema),
  growthGoals: z.array(GrowthGoalSchema),
  createdAt: IsoDateTimeSchema,
});

export type Child = z.infer<typeof ChildSchema>;
