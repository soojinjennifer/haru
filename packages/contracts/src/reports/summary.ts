import { z } from 'zod';

import { CalendarDateSchema, IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { CursorPageRequestSchema, paginated } from '../common/pagination.js';

/**
 * 발행된 4주 리포트 요약 — Stage 7 Plan §7 **C7-3** (`N7-11`).
 * `GET /v1/children/:childId/reports?limit&cursor` → `Paginated<ReportSummary>` (**최신 먼저**).
 *
 * - 발행된 리포트만 목록에 나온다 (생성 중·이월·지연 주기는 `ReportOverview.currentCycle` 이 표현한다).
 * - `summaryLine` = 서버 문장. Frontend 생성·가공 0 (`architecture.md` §8).
 * - `viewed` = `POST …/viewed` 가 한 번이라도 기록되었는지 (`P7-BIP-11`). 화면에 배지를 그리지 않는다.
 */
export const ReportSummarySchema = z.object({
  id: IdSchema,
  cycleNo: z.int().min(1),
  periodStart: CalendarDateSchema,
  periodEnd: CalendarDateSchema,
  publishedAt: IsoDateTimeSchema,
  summaryLine: z.string().min(1),
  viewed: z.boolean(),
});

export type ReportSummary = z.infer<typeof ReportSummarySchema>;

export const ReportSummaryPageSchema = paginated(ReportSummarySchema);

export type ReportSummaryPage = z.infer<typeof ReportSummaryPageSchema>;

/** 목록 요청 query — 공통 cursor 규약 그대로. */
export const ReportListQuerySchema = CursorPageRequestSchema;

export type ReportListQuery = z.infer<typeof ReportListQuerySchema>;
export type ReportListQueryInput = z.input<typeof ReportListQuerySchema>;
