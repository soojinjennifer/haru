import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { TopicTagSchema } from './options.js';

/**
 * 온보딩 Step 3 — 책·선호도.
 * 근거: PRD §7.2 Step 3, `docs/plans/stage-2-plan.md` §7.1, D-17.
 *
 * PRD 규칙: **"자체 DB에 없으면 제목 텍스트로 저장"** — 그래서 좋아하는 책은
 * `bookId`(검색 결과 선택) 또는 `title`(직접 입력) 중 하나를 갖는다.
 * Stage 2 는 소유·증정 상태(`LibraryBook`)를 다루지 않는다 (Stage 3).
 */

/** 책 제목 최대 길이 (RECOMMENDED). */
export const BOOK_TITLE_MAX_LENGTH = 200;

/** 좋아하는 책 최대 권수 — PRD §7.2 Step 3 "최대 5권". */
export const FAVORITE_BOOKS_MAX = 5;

/** 집에 있는 책 목록 최대 권수 (RECOMMENDED — 입력 부담 상한). */
export const HOME_BOOKS_MAX = 50;

/** 주제 태그 선택 최대 개수 — 질문지 Q3 "Multi-select, up to 2" (결정 D-A). */
export const TOPIC_TAGS_MAX = 2;

/**
 * 좋아하는 책 1권. 검색으로 고르면 `bookId` 가 있고, 직접 입력하면 `title` 만 있다.
 * 둘 중 하나는 반드시 있어야 한다.
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

/** 집에 있는 책 1권 — 검색 없이 제목만 받는다. */
export const HomeBookSchema = z.object({
  title: z.string().trim().min(1).max(BOOK_TITLE_MAX_LENGTH),
});

export type HomeBook = z.infer<typeof HomeBookSchema>;

export const BooksAnswersSchema = z.object({
  favoriteBooks: z.array(FavoriteBookSchema).max(FAVORITE_BOOKS_MAX),
  homeBooks: z.array(HomeBookSchema).max(HOME_BOOKS_MAX),
  topicTags: z.array(TopicTagSchema).max(TOPIC_TAGS_MAX),
});

export type BooksAnswers = z.infer<typeof BooksAnswersSchema>;
