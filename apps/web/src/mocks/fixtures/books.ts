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
