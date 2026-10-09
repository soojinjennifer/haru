/**
 * 책 검색 fixture — 결정 **D-17** 최소 범위 (`GET /v1/books/search`).
 *
 * 가상 목록이며 표지(`coverUrl`)를 넣지 않는다 — Stage 2 화면은 표지를 그리지 않는다 (Stage 3).
 * 검색은 대소문자 무시 부분 일치이고 결과 순서는 목록 순서 그대로다 (결정적).
 */
import {
  SearchBooksResponseSchema,
  type BookSummary,
  type SearchBooksResponse,
} from '@haru/contracts';

/** 고정 uuid — scenario 간에도 같은 id 를 써야 비교가 쉽다. */
export const MOCK_BOOKS: readonly BookSummary[] = [
  {
    id: '22222222-2222-4222-8222-000000000001',
    title: 'Goodnight Moon',
    author: 'Margaret Wise Brown',
  },
  {
    id: '22222222-2222-4222-8222-000000000002',
    title: 'The Very Hungry Caterpillar',
    author: 'Eric Carle',
  },
  {
    id: '22222222-2222-4222-8222-000000000003',
    title: 'Brown Bear, Brown Bear',
    author: 'Bill Martin Jr.',
  },
  {
    id: '22222222-2222-4222-8222-000000000004',
    title: 'Where the Wild Things Are',
    author: 'Maurice Sendak',
  },
  {
    id: '22222222-2222-4222-8222-000000000005',
    title: 'Guess How Much I Love You',
    author: 'Sam McBratney',
  },
  {
    id: '22222222-2222-4222-8222-000000000006',
    title: 'Llama Llama Red Pajama',
    author: 'Anna Dewdney',
  },
  { id: '22222222-2222-4222-8222-000000000007', title: 'Corduroy', author: 'Don Freeman' },
  { id: '22222222-2222-4222-8222-000000000008', title: 'The Snowy Day', author: 'Ezra Jack Keats' },
];

export function createBookSearchFixture(query: string, limit: number): SearchBooksResponse {
  const needle = query.trim().toLowerCase();
  const matches = MOCK_BOOKS.filter((book) => book.title.toLowerCase().includes(needle));

  return SearchBooksResponseSchema.parse({
    items: matches.slice(0, limit),
    nextCursor: null,
  });
}

export function createEmptyBookSearchFixture(): SearchBooksResponse {
  return SearchBooksResponseSchema.parse({ items: [], nextCursor: null });
}

/**
 * 추천 이유 fixture — `BookPromptsResponse.reason` (사용자 결정 2026-10-09).
 *
 * **서버가 만드는 문장**이므로 Mock 도 응답 값으로만 돌려준다. 화면은 이 문자열을 그대로
 * 그린다 (`rules/frontend.md` §8).
 *
 * 규칙
 *  - 진단·판정·비교 표현을 쓰지 않는다. 관찰과 다음 대화 방향만 말한다 (§10 금지어).
 *  - **결정적**이다 — 같은 `bookId` 는 항상 같은 문장을 받는다 (`capabilityFor` 와 같은 방식).
 *  - Home 활동 카드의 `reason` 과 **문장이 같을 필요는 없다**: 카드의 이유는 카드 종류
 *    (`book` / `reread_book`)와 그날의 추천 맥락에 달려 있어 **같은 책이라도 달라진다**
 *    (`fixtures/activity-cards.ts` 의 `REREAD_SEED` 가 `DECK_BOOKS[0]` 에 다른 문장을 쓴다).
 *    서재 시트의 이유는 "이 책을 왜 함께 읽는가" 이며 책 단위로 고정된다.
 */
const BOOK_REASONS: readonly string[] = [
  'A big feeling gets a shape your child can point at and name.',
  'The pages leave room for guessing, so your child can take the story somewhere of their own.',
  'Short scenes and a steady rhythm — easy to follow together when the day was long.',
  'Familiar enough to retell, which is where your child starts adding their own words.',
];

/** 책마다 결정적으로 고른다 — 같은 `bookId` 는 항상 같은 이유를 받는다. */
export function createBookReasonFixture(bookId: string): string {
  const sum = [...bookId].reduce((total, char) => total + (char.codePointAt(0) ?? 0), 0);
  return BOOK_REASONS[sum % BOOK_REASONS.length] ?? (BOOK_REASONS[0] as string);
}
