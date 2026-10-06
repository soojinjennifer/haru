import { z } from 'zod';

import { LibrarySectionKeySchema } from '../enums/library-section.js';

import { LibraryBookSchema } from './library-book.js';

/**
 * 서재 화면 **1회 조회** — `GET /v1/children/:childId/library/overview`.
 * 근거: Library Plan §7.2 · §7.5, Library Design Spec §7.4, `P3-BIP-18`.
 *
 * 섹션 4개가 **한 화면에 동시에** 뜬다 `[실측 145:928 / 145:1141]`. 섹션별로 따로 호출하면
 * 4-way 로딩이 되어 "카드 2초" 체감(`P3-BIP-10`)을 악화시키므로 한 번에 받는다.
 *
 * ── `readingNow` 가 `sections[]` 밖에 있는 이유 ──
 * `Reading now` 는 **없을 때 블록 전체를 렌더하지 않는** 유일한 섹션이다 (그 상태의 디자인이
 * Figma `30:74` = L-1 에 실재한다). 나머지 섹션은 0건이어도 헤더를 남기고 본문에 안내를 넣는다
 * (Design Spec §7.4 "섹션은 사라지지 않는다").
 *
 * `hasMore` 는 "See all" 시트에서 커서 페이지를 더 받을 수 있는지다 — 섹션 안에
 * "Show more" 를 만들지 않는다 (`L-OPEN-21`).
 */
export const LibraryOverviewSectionSchema = z.object({
  key: LibrarySectionKeySchema,
  items: z.array(LibraryBookSchema),
  hasMore: z.boolean(),
});

export type LibraryOverviewSection = z.infer<typeof LibraryOverviewSectionSchema>;

export const LibraryOverviewSchema = z.object({
  readingNow: LibraryBookSchema.nullable(),
  /** 순서는 **서버가 정한다** (`L-OPEN-01` 섹션 순서). 프론트가 재정렬하지 않는다. */
  sections: z.array(LibraryOverviewSectionSchema),
});

export type LibraryOverview = z.infer<typeof LibraryOverviewSchema>;
