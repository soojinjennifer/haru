/**
 * Mock 책 표지 URL — **책 id 하나에 표지 URL 하나** (Stage 8 `D8-7`).
 *
 * 같은 책이 여러 fixture(덱 `saved-books.ts` · 검색 카탈로그 `books.ts`)에 나와도 표지는 여기서만
 * 정한다. 실제 서버도 같은 책에는 같은 `coverUrl` 을 내려준다 — 같은 id 가 한 화면에서 표지/placeholder
 * 로 갈리던 문제(`stage-8-visual-gap.md` D8-7 §3-4)를 데이터 쪽에서 막는다.
 *
 * Figma 에 표지가 없는 책은 여기에 없다 → `coverUrl` 없음 → `BookCover` placeholder.
 */
import { BOOK_COVER_ASSETS, type BookCoverAssetName } from '../../shared/assets/book-covers';

/**
 * 번들러가 주는 표지 경로는 `/assets/x.png` 같은 **상대 경로**인데 `BookSummary.coverUrl` 은
 * 절대 URL 이다 (서버는 signed URL 을 내려준다). Mock 에서만 origin 을 붙여 contract 를 지킨다.
 */
function toAbsolute(assetUrl: string): string {
  const origin = globalThis.location?.origin ?? 'https://mock.haru.local';
  return new URL(assetUrl, origin).href;
}

/** 책 id → 표지 에셋. id 는 `DECK_BOOKS` · `MOCK_BOOKS` 의 고정 uuid 와 같다. */
const COVER_BY_BOOK_ID: Readonly<Record<string, BookCoverAssetName>> = {
  '22222222-2222-4222-8222-000000000004': 'where-the-wild-things-are',
  '22222222-2222-4222-8222-000000000009': 'the-most-magnificent-idea',
  '22222222-2222-4222-8222-000000000010': 'grumpy-monkey-play-all-day',
};

/** 표지가 있으면 `{ coverUrl }`, 없으면 `{}` — fixture 객체에 펼쳐 쓴다 (`exactOptionalPropertyTypes`). */
export function mockCoverFor(bookId: string): { coverUrl?: string } {
  const asset = COVER_BY_BOOK_ID[bookId];
  return asset === undefined ? {} : { coverUrl: toAbsolute(BOOK_COVER_ASSETS[asset]) };
}
