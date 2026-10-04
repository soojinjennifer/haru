import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { TopicTagSchema } from './options.js';

/**
 * 온보딩 `books_and_interests` 단계 — 책·관심 (Q3 · Q5 · 좋아하는 책).
 * 근거: PRD §7.2 Step 3, 질문지 v1.1 **Q5**, 결정 D-17,
 * 재구성 결정 `docs/decisions/stage-3-approvals.md` §11.9 · §11.11 · §11.13.
 *
 * ── 세 항목의 출처가 다르다 (`§11.9`) ──
 * | 항목 | 출처 | 필드 |
 * |---|---|---|
 * | 좋아하는 책 (제목 직접 입력, 최대 5) | PRD §7.2 Step 3 | `favoriteBooks` |
 * | 이미 잘 아는 책 8권 체크 (Q5) | 질문지 v1.1 | `ownedBooks` |
 * | 책에서 끌리는 것 (Q3, 최대 2) | 질문지 v1.1 | `topicTags` |
 *
 * ── **책 검색을 두지 않는다** (`§11.13`) ──
 * Figma `30:74`(Library) · `179:1770`(설문 카드) 어디에도 검색 입력·아이콘이 없다.
 * 검색이 하던 유일한 일(`bookId` 매칭)은 **Q5 의 `ownedBooks`** 가 수행한다.
 * 그래서 좋아하는 책은 **제목 직접 입력**만 받는다 (PRD ↔ Figma 충돌 → Figma 우선 + 사용자 승인).
 * `GET /v1/books/search` contract 자체는 Stage 3 Library 소관이므로 지우지 않는다.
 *
 * ── `homeBooks` 삭제 (`§11.9`) ──
 * PRD §7.2 Step 3 의 "집에 있는 책 목록"은 Q5 가 그 자리를 대신하므로 제거되었다.
 */

/** 책 제목 최대 길이 (RECOMMENDED). */
export const BOOK_TITLE_MAX_LENGTH = 200;

/** 좋아하는 책 최대 권수 — PRD §7.2 Step 3 "최대 5권" (`§11.13` 으로 유지 확정). */
export const FAVORITE_BOOKS_MAX = 5;

/**
 * Q5 선택 가능 권수 상한 (RECOMMENDED — 인벤토리 크기에 대한 안전 상한).
 * 문항 자체는 **무제한 복수 선택**이다 (`§11.11`) — 화면은 instrument 의 `maxSelections`
 * 가 없다는 사실만 읽고, 이 상수는 저장 형태의 sanity bound 다.
 */
export const OWNED_BOOKS_MAX = 10;

/** 주제 태그 선택 최대 개수 — 질문지 Q3 "Multi-select, up to 2" (결정 D-A). */
export const TOPIC_TAGS_MAX = 2;

/**
 * 좋아하는 책 1권.
 *
 * 온보딩에서는 `title` 만 채워진다 (검색이 없다 — `§11.13`). `bookId` 는 **선택 필드로
 * 유지**한다: Stage 3 서재에서 인벤토리 책을 favorites 로 넣는 경로가 생길 수 있고,
 * contract 를 좁히면 그때 다시 넓혀야 한다.
 */
export const FavoriteBookSchema = z
  .object({
    bookId: IdSchema.optional(),
    title: z.string().trim().min(1).max(BOOK_TITLE_MAX_LENGTH).optional(),
  })
  .refine((value) => value.bookId !== undefined || value.title !== undefined, {
    message: 'favorite book requires either bookId or title',
  });

export type FavoriteBook = z.infer<typeof FavoriteBookSchema>;

export const BooksAndInterestsAnswersSchema = z.object({
  favoriteBooks: z.array(FavoriteBookSchema).max(FAVORITE_BOOKS_MAX),
  /** Q5 — 이미 잘 아는 책의 `book_id` 목록 (질문지 `child.owned_books`). */
  ownedBooks: z.array(IdSchema).max(OWNED_BOOKS_MAX),
  topicTags: z.array(TopicTagSchema).max(TOPIC_TAGS_MAX),
});

export type BooksAndInterestsAnswers = z.infer<typeof BooksAndInterestsAnswersSchema>;
