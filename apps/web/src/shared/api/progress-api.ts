/**
 * `progressApi` — 주간 Progress 조회 (`docs/API_CONTRACTS.md` §4 Stage 7 C7-1, Figma `31:102`, `D7-1`).
 *
 * | 호출 | endpoint | IK | 주요 오류 |
 * |---|---|---|---|
 * | `getWeekly` | `GET /v1/children/:childId/progress/weekly?weekStart=YYYY-MM-DD` | — | `VALIDATION_FAILED`(`weekStart`) · `CHILD_NOT_FOUND` |
 *
 * 호출 경로: `Component → entities/weekly-progress hook → progressApi.getWeekly → MockProgressApi | HttpProgressApi`.
 * 주 경계·집계는 서버가 계산한다 — Frontend 는 응답 날짜를 **포맷만** 한다 (Plan §5.1).
 */
import type { WeeklyProgress, WeeklyProgressQuery } from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface ProgressApi {
  /** `query.weekStart` 생략 = 이번 주 (서버 계산). */
  getWeekly(
    request: { childId: string; query?: WeeklyProgressQuery },
    options?: ApiRequestOptions,
  ): Promise<WeeklyProgress>;
}
