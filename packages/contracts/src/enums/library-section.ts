import { z } from 'zod';

/**
 * 서재 화면의 **표시 축** — Figma 섹션 제목 3개 `[실측 30:74 · 145:1141]`.
 * 근거: Library Plan §7.3, Library Design Spec §3 · `L-OPEN-01`(섹션 순서).
 *
 * | 값 | Figma 제목 |
 * |---|---|
 * | `curated` | `Our curated shelf` |
 * | `favorites` | `Favorites` |
 * | `finished` | `Finished together` |
 *
 * `reading_now` 는 **여기에 넣지 않는다** — `LibraryOverview.sections[]` 가 아니라
 * `readingNow` 단일 필드이고, 없을 때 블록 전체를 렌더하지 않는 유일한 예외다
 * (Design Spec §7.4).
 *
 * ⚠ 이 축은 쿼리 축(`LibraryFilter`)과 **1:1 이 아니다** (`L-OPEN-14`).
 */
export const LibrarySectionKeySchema = z.enum(['curated', 'favorites', 'finished']);

export type LibrarySectionKey = z.infer<typeof LibrarySectionKeySchema>;
