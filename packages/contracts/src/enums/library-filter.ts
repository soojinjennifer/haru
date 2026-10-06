import { z } from 'zod';

/**
 * 서재 목록 조회의 **쿼리 축** — `GET /v1/children/:childId/library?filter=`.
 * 근거: `docs/API_CONTRACTS.md` §2.2(`owned`/`gifted`/`history`/`saved`), Library Plan §7.3.
 *
 * `curated` 는 "See all" 시트가 큐레이션 섹션의 전체 목록을 받기 위해 추가된다.
 *
 * ⚠ 표시 축(`LibrarySectionKey`)과 **1:1 이 아니다** (`L-OPEN-14`): `favorites` 섹션은
 * `saved` 로, `finished` 섹션은 `history` 로 조회한다. 보유·증정 구분(`owned`/`gifted`)은
 * **화면에 표식을 만들지 않는다** — 데이터만 존재한다.
 */
export const LibraryFilterSchema = z.enum(['owned', 'gifted', 'history', 'saved', 'curated']);

export type LibraryFilter = z.infer<typeof LibraryFilterSchema>;
