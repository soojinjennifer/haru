/**
 * Home 덱이 쓰는 책 fixture + `★ Save` 조회 helper.
 *
 * ── 왜 `fixtures/books.ts` 의 `MOCK_BOOKS` 를 그대로 쓰지 않는가 ──
 * `MOCK_BOOKS` 는 **온보딩 Step 3 검색 카탈로그**(`D-17` 최소 범위)이고 표지를 갖지 않는다.
 * Home 덱은 사용자 지시(2026-10-05, approvals §12.12)에 따라 **Figma 에 실제로 그려진 책과
 * 그 표지 이미지**를 보여 줘야 한다. 그래서 덱 전용 목록을 따로 둔다 —
 * 검색 카탈로그를 건드리지 않으므로 Stage 2 동작이 그대로 유지된다.
 *
 * 책과 표지는 **전부 Figma 노드에서 왔다** (`163:2649` Activity card · `30:74` Library).
 * 표지는 **Mock 전용 임시 에셋**이며 Backend 연동 시 `coverUrl` 로 교체된다
 * (`shared/assets/book-covers/index.ts`).
 */
import type { BookSummary, SaveBookTarget } from '@haru/contracts';

import { BOOK_COVER_ASSETS } from '../../shared/assets/book-covers';

/**
 * 번들러가 주는 표지 경로는 `/assets/x.png` 같은 **상대 경로**인데 `BookSummary.coverUrl` 은
 * 절대 URL 이다 (서버는 signed URL 을 내려준다). Mock 에서만 origin 을 붙여 contract 를 지킨다.
 */
function toAbsolute(assetUrl: string): string {
  const origin = globalThis.location?.origin ?? 'https://mock.haru.local';
  return new URL(assetUrl, origin).href;
}

/** 고정 uuid — scenario 간에도 같은 id 를 써야 비교가 쉽다. */
export const DECK_BOOKS: readonly BookSummary[] = [
  {
    id: '22222222-2222-4222-8222-000000000004',
    title: 'Where the Wild Things Are',
    author: 'Maurice Sendak',
    coverUrl: toAbsolute(BOOK_COVER_ASSETS['where-the-wild-things-are']),
  },
  {
    id: '22222222-2222-4222-8222-000000000009',
    title: 'The Most Magnificent Idea',
    author: 'Ashley Spires',
    coverUrl: toAbsolute(BOOK_COVER_ASSETS['the-most-magnificent-idea']),
  },
  {
    id: '22222222-2222-4222-8222-000000000010',
    title: 'Grumpy Monkey: Play All Day',
    author: 'Suzanne Lang',
    coverUrl: toAbsolute(BOOK_COVER_ASSETS['grumpy-monkey-play-all-day']),
  },
];

export function findDeckBook(bookId: string): BookSummary | undefined {
  return DECK_BOOKS.find((book) => book.id === bookId);
}

/**
 * 저장 요청의 대상 책 id 를 고른다.
 *
 * `title` 만 온 경우(카탈로그에 없는 책)는 제목으로 fixture 를 찾는다 — Mock 은 새 책을
 * 만들지 않는다. 실제 Backend 는 이때 `child_books` 행을 생성한다 (`P3-BIP-15`).
 */
export function resolveSaveTarget(target: SaveBookTarget): string | undefined {
  if ('bookId' in target) return findDeckBook(target.bookId)?.id;

  const needle = target.title.trim().toLowerCase();
  return DECK_BOOKS.find((book) => book.title.toLowerCase() === needle)?.id;
}
