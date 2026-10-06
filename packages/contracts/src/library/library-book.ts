import { z } from 'zod';

import { BookSummarySchema } from '../books/search.js';
import { IdSchema } from '../common/id.js';
import { IsoDateTimeSchema } from '../common/datetime.js';
import { BookOwnershipSchema } from '../enums/book.js';
import { BookSourceSchema } from '../enums/book-source.js';
import { CapabilitySchema } from '../enums/capability.js';
import { GiftRequestStatusSchema } from '../enums/gift-request.js';

import { ReadingProgressSchema } from './reading-progress.js';

/**
 * 서재의 한 권 — `child_books` 한 행의 표현.
 * 근거: Library Plan §7.2, Library Design Spec §3.3 · §3.5, PRD FR-20 · FR-22 · FR-23.
 *
 * ── `book` 이 nullable 인 이유 ──
 * 카탈로그에 없는 책을 보호자가 **제목만** 입력해 등록할 수 있다 (PRD §7.2 · FR-23).
 * 그 경우 `book` 이 `null` 이고 `userEnteredTitle`(+`userEnteredAuthor`)이 채워진다.
 * 화면은 표지 자리에 `BookCover` placeholder 를 그리며 "No cover" 같은 **판정 문구를 넣지
 * 않는다** (Design Spec §7.4 `user-entered-book`).
 *
 * ── `averageRating` (`L-D3` · `LN-1`) ──
 * **모집단은 해당 Child 의 세션 평점으로 한정**된다 (`stage-3-approvals.md` §16.3 — "우리 아이
 * 평점만"). 다른 가정의 평점을 섞지 않으므로 비교·순위 언어가 생길 여지가 없다. 집계 산식은
 * Backend 요구사항(`P3-BIP-16`)이다. `null` 이면 행의 우측 메타를 **비우고** 좌측 메타의
 * 좌측 정렬을 유지한다 (`L-OPEN-22`, Design Spec §3.5).
 *
 * ── `ownership` 은 표시되지 않는다 (`L-OPEN-14`) ──
 * `owned` / `gifted` / `gift_pending` 를 구분하는 **표식을 만들지 않는다**는 결정이다
 * (`stage-3-approvals.md` §17.1). 데이터는 남기고 화면에만 드러내지 않는다.
 *
 * ── `capability` (`L-OPEN-15`) ──
 * 캐러셀 캡션 2행 `[실측 113:1975 등]` 의 데이터다. 화면은 **#14 표시 라벨**로 그리고,
 * `null` 이면 저자명을 대신 쓴다 (Design Spec §3.3). 라벨 문구는 contracts 가 갖지 않는다.
 *
 * ⚠ 길이 제약(`.max()`)을 응답 필드에 걸지 않는다 — 서버가 한 번만 넘겨도 parse 가 던져
 * 서재 화면이 통째로 비어 버린다 (`characterLine` 선례). 길이 요구는 Handoff 문서에 남긴다.
 */
export const LibraryBookSchema = z.object({
  /** `child_books` 행 id. 책 id 가 아니다 (같은 책이 다른 아이에게도 있을 수 있다). */
  id: IdSchema,
  book: BookSummarySchema.nullable(),
  /** `book === null` 일 때의 제목. 둘 중 하나는 반드시 있어야 한다 (아래 `superRefine`). */
  userEnteredTitle: z.string().min(1).nullable().optional(),
  userEnteredAuthor: z.string().min(1).nullable().optional(),
  ownership: BookOwnershipSchema,
  source: BookSourceSchema,
  capability: CapabilitySchema.nullable(),
  /** `★ Save` 상태. `Favorites` 섹션의 소속 기준이다 (`L-D1`). */
  saved: z.boolean(),
  savedAt: IsoDateTimeSchema.nullable(),
  firstReadAt: IsoDateTimeSchema.nullable().optional(),
  lastReadAt: IsoDateTimeSchema.nullable().optional(),
  /** 읽기 시작한 횟수. `Finished together` 행 메타가 쓴다. */
  readCount: z.number().int().min(0),
  sessionCount: z.number().int().min(0),
  /** 1–5. 해당 Child 의 세션 평점만 집계한다 (§16.3). */
  averageRating: z.number().min(1).max(5).nullable(),
  purchaseUrl: z.url().nullable().optional(),
  giftRequestStatus: GiftRequestStatusSchema.nullable().optional(),
  readingProgress: ReadingProgressSchema.nullable().optional(),
});

export type LibraryBook = z.infer<typeof LibraryBookSchema>;

/**
 * 표시할 제목이 **하나는 있어야 한다**. 이것은 길이 제약이 아니라 **화면이 성립하는 조건**이다 —
 * `book` 도 `userEnteredTitle` 도 없으면 행에 그릴 글자가 없다.
 *
 * 그래서 기본 schema 와 분리해 둔다: 화면은 `LibraryBookSchema` 로 parse 하고(관대하게),
 * contracts 테스트와 Mock 은 이 refine 으로 **fixture 가 그릴 수 있는 데이터인지** 검증한다.
 */
export const RenderableLibraryBookSchema = LibraryBookSchema.superRefine((value, ctx) => {
  const hasTitle =
    value.book !== null ||
    (value.userEnteredTitle !== undefined &&
      value.userEnteredTitle !== null &&
      value.userEnteredTitle.length > 0);
  if (hasTitle) return;

  ctx.addIssue({
    code: 'custom',
    path: ['userEnteredTitle'],
    message: 'userEnteredTitle is required when book is null.',
  });
});
