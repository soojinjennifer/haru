import type { z } from 'zod';

import { CursorPageRequestSchema, paginated } from '../common/pagination.js';
import { LibraryFilterSchema } from '../enums/library-filter.js';

import { LibraryBookSchema } from './library-book.js';

/**
 * 서재 목록 — `GET /v1/children/:childId/library?filter=&limit=&cursor=`.
 * "See all" 시트와 더 보기가 쓴다 (Library Plan §7.2 · §7.5, FR-20 · `L-OPEN-21`).
 *
 * Pagination 규약은 `CursorPageRequestSchema` / `paginated()` **재사용**이다 — 같은 모양을
 * 다시 선언하지 않는다.
 */
export const LibraryListRequestSchema = CursorPageRequestSchema.extend({
  filter: LibraryFilterSchema,
});

/** parse **입력** 타입 — `limit`·`cursor` 는 생략 가능하다. */
export type LibraryListRequestInput = z.input<typeof LibraryListRequestSchema>;
export type LibraryListRequest = z.infer<typeof LibraryListRequestSchema>;

export const LibraryListResponseSchema = paginated(LibraryBookSchema);

export type LibraryListResponse = z.infer<typeof LibraryListResponseSchema>;
