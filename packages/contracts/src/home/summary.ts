import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { SessionStatusSchema } from '../enums/session-status.js';

import { ActivityCardSchema } from '../activity/card.js';

/**
 * Home 집계 — `GET /v1/children/:childId/home`
 * (근거: `docs/API_CONTRACTS.md` §4 Stage 3, Stage 3 Plan §7.1).
 *
 * - **`streakDays` 가 없다** (`D-6` · `stage-3-approvals.md` §8.5 ④). 연속 일수는 달성률
 *   언어에 가깝다 (`rules/frontend.md` §8). 집계는 **이번 주 세션 수 1개만** 표시한다.
 * - `characterLine` 은 Home 캐릭터 버블 문구다. **서버 값만 표시**하며 값이 없으면 버블
 *   자체를 렌더하지 않는다 (§8.5 ①).
 *   ⚠ 길이: 서버는 **약 120자 이내**로 보내야 한다 (`W-5` · approvals §13.3 · `API_CONTRACTS.md`
 *   §3.8 · `P3-BIP-16`). **`.max()` 를 걸지 않는다** — 응답 필드에 길이 제약을 걸면 Backend 가
 *   한 번만 넘겨도 parse 가 던져 **Home 전체가 빈 화면**이 된다. UI 가 4줄 말줄임으로 흡수한다.
 * - `lastHighlightLine` 도 같은 규칙이다 — 없으면 미렌더, 접두어를 붙이지 않는다.
 * - `activeSession` 은 **표시용**이다. Stage 3 은 세션을 만들지도 열지도 않는다 (`D-3`).
 */
export const HomeSummarySchema = z.object({
  todayCard: ActivityCardSchema.nullable(),
  sessionsThisWeek: z.number().int().min(0),
  characterLine: z.string().nullable(),
  lastHighlightLine: z.string().nullable().optional(),
  activeSession: z
    .object({
      sessionId: IdSchema,
      status: SessionStatusSchema,
    })
    .nullable()
    .optional(),
});

export type HomeSummary = z.infer<typeof HomeSummarySchema>;
