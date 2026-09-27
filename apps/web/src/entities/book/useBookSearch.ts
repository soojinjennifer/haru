/**
 * `useBookSearch` — `GET /v1/books/search` Query hook (결정 **D-17** 최소 범위).
 *
 * ```
 * BooksStep → useBookSearch → booksApi.search → MockBooksApi | HttpBooksApi
 * ```
 *
 * - 검색어가 비어 있으면 호출하지 않는다 (`enabled: false`) — 빈 요청을 만들지 않는다.
 * - 결과 없음(`items: []`)은 **오류가 아니다.** 화면은 그 자리에서 **제목 직접 입력** 경로를
 *   연다 (PRD §7.2, AC-2-23).
 * - 표지 이미지는 Stage 3 이라 Stage 2 화면은 `coverUrl` 을 쓰지 않는다.
 */
import { useQuery } from '@tanstack/react-query';
import type { BookSummary, ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { bookKeys } from './bookKeys';

export interface UseBookSearchResult {
  books: readonly BookSummary[] | undefined;
  /** 검색어가 있고 결과가 아직 없는 상태. */
  isPending: boolean;
  /** 검색은 끝났고 결과가 0건인 상태 (오류 아님). */
  isEmpty: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useBookSearch(query: string): UseBookSearchResult {
  const { books } = useApiClients();
  const trimmed = query.trim();
  const enabled = trimmed.length > 0;

  const result = useQuery({
    queryKey: bookKeys.search(trimmed),
    enabled,
    queryFn: ({ signal }) => books.search({ q: trimmed }, { signal }),
  });

  const error: unknown = result.error;
  const items = enabled ? result.data?.items : undefined;

  return {
    books: items,
    isPending: enabled && result.isPending,
    isEmpty: items !== undefined && items.length === 0,
    isError: enabled && result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void result.refetch();
    },
  };
}
