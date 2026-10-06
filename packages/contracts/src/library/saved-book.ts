import { z } from 'zod';

import { BookSummarySchema } from '../books/search.js';
import { IdSchema } from '../common/id.js';
import { IsoDateTimeSchema } from '../common/datetime.js';
import { BOOK_TITLE_MAX_LENGTH } from '../onboarding/books-and-interests.js';

/**
 * `★ Save` — 보호자가 추천된 책을 서재에 저장/해제한다.
 * 근거: `docs/API_CONTRACTS.md` §3.7, `docs/decisions/stage-3-approvals.md` §12.8 `A-9` · §12.10.
 * Figma: `I86:373;117:973` (`Button/White` 87×45 `★ Save`), 결과 표면 `145:1157` "My Saved".
 *
 * | 호출 | endpoint | 멱등 |
 * |---|---|---|
 * | 저장 | `PUT /v1/children/:childId/saved-books` | **자원 상태 설정 → 멱등.** `Idempotency-Key` 를 요구하지 않는다 |
 * | 해제 | `DELETE /v1/children/:childId/saved-books/:bookId` | 멱등 |
 *
 * 규칙
 * - **온보딩 `favoriteBooks` 와 다른 데이터다** (§3.7.1). 설문 스냅샷을 사후 수정하지 않는다.
 * - **상한이 없다** — Figma `Save` 버튼에 카운터·상한 표시·상한 안내가 없다.
 * - **신규 Error Code 0건** — 없는 `bookId` 는 `RESOURCE_NOT_FOUND`, 잘못된 입력은
 *   `VALIDATION_FAILED`. 중복 저장은 오류가 아니라 **같은 응답**이다.
 *
 * ⚠ 응답 타입에 대해: `API_CONTRACTS.md` §3.7.3 은 **`LibraryBook` 을 돌려준다**고 적는다.
 * `LibraryBook` 은 서재 화면(Library 라운드)과 함께 정의되므로, 지금은 저장 상태만 담은
 * `SavedBook` 을 쓰고 Library 라운드에서 `LibraryBook` 에 **흡수**한다 (`saved`·`savedAt` 축).
 */

/**
 * 저장 대상 = **선택된 옵션의 책** (§3.7.2). 카드가 아니다 — 카드는 하루 단위로 사라지는
 * 자원이라 저장 항목이 만료된다.
 *
 * 카탈로그 책은 `bookId`, 카탈로그에 없는 책은 `title`(+`author?`) 로 보낸다
 * (`AddOwnBookRequest` 와 같은 판별 구조이며 Library 라운드에서 공용화 대상이다).
 */
export const SaveBookTargetSchema = z.union([
  z.object({ bookId: IdSchema }),
  z.object({
    title: z.string().trim().min(1).max(BOOK_TITLE_MAX_LENGTH),
    author: z.string().trim().min(1).max(120).optional(),
  }),
]);

export type SaveBookTarget = z.infer<typeof SaveBookTargetSchema>;

export const SaveBookRequestSchema = z.object({ target: SaveBookTargetSchema });

export type SaveBookRequest = z.infer<typeof SaveBookRequestSchema>;

/**
 * 저장/해제 응답. 생성과 갱신이 **같은 표현**을 돌려준다 (`PUT` = 상태 설정).
 * 해제도 같은 모양이며 `saved: false` · `savedAt: null` 이다.
 */
export const SavedBookSchema = z.object({
  book: BookSummarySchema,
  saved: z.boolean(),
  savedAt: IsoDateTimeSchema.nullable(),
});

export type SavedBook = z.infer<typeof SavedBookSchema>;
