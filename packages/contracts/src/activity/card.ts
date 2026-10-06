import { z } from 'zod';

import { CalendarDateSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';

import { ActivityCardOptionSchema } from './option.js';

/**
 * 오늘의 Activity Card — 근거: `docs/API_CONTRACTS.md` §4 Stage 3 (`GET …/activity-cards/today`),
 * PRD §7.9 "카드 덱 3장".
 *
 * - `options` 는 **정확히 3장**이다 (PRD §7.9).
 * - **`targetCapability` 가 없다** (`D-22`, `stage-3-approvals.md` §9). 역량은
 *   `options[].capability` 단위이므로 카드 단위 대표 역량의 사용처가 없다.
 * - `date` 의 기준 시간대는 서버가 소유한다 (`D-10`). Frontend 는 이 값을 그대로 신뢰하고
 *   클라이언트에서 "오늘" 을 재판정하지 않는다. 기기 기준 오늘과 다르면 **화면이 그 날짜를
 *   밝힌다** (AC-3-11).
 */
export const ActivityCardSchema = z.object({
  id: IdSchema,
  date: CalendarDateSchema,
  options: z.tuple([ActivityCardOptionSchema, ActivityCardOptionSchema, ActivityCardOptionSchema]),
});

export type ActivityCard = z.infer<typeof ActivityCardSchema>;
