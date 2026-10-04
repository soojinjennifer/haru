/**
 * `useBookSearch` — `GET /v1/books/search` Query hook (결정 **D-17** 최소 범위).
 *
 * ```
 * (소비자 화면) → useBookSearch → booksApi.search → MockBooksApi | HttpBooksApi
 * ```
 *
 * ── **현재 사용처 0건** (`QA-2R-007` ②) ──
 * 온보딩의 책 검색은 `§11.13` 으로 제거되었다 (Figma `30:74`·`179:1770` 에 검색이 0건이고,
 * 검색이 하던 `bookId` 매칭은 Q5 `ownedBooks` 가 수행한다). contract·Mock Adapter·이 hook 은
 * **Stage 3 Library 소관**이라 지우지 않는다 — 소비자가 Stage 3 에서 생긴다.
 *
 * - 검색어가 비어 있으면 호출하지 않는다 (`enabled: false`) — 빈 요청을 만들지 않는다.
 * - 결과 없음(`items: []`)은 **오류가 아니다.** 소비자 화면이 빈 상태를 정한다.
 * - 표지 이미지(`coverUrl`)는 Stage 3 에서 쓴다.
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
