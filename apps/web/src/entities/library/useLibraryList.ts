/**
 * `useLibraryList` — `GET /v1/children/:childId/library?filter=&limit=&cursor=` (FR-20).
 * `LibraryShelfSheet`("See all") 가 쓰는 **커서 목록**이다 (`L-OPEN-21`).
 *
 * ```
 * (feature) → useLibraryList → libraryApi.getList → MockLibraryApi | HttpLibraryApi
 * ```
 *
 * ── 섹션 안에 "Show more" 를 만들지 않는다 (`L-OPEN-21`) ──
 * 본 화면의 섹션은 Figma 기하(3-up × dots · 4행)를 지키고, 전체 목록과 더 보기는 **시트에서만**
 * 다룬다. 그래서 이 hook 의 소비자는 시트 하나다.
 *
 * ── 표시 축 → 쿼리 축 (`L-OPEN-14`) ──
 * 섹션 key(`favorites`)와 filter(`saved`)는 **1:1 이 아니다**. 변환표를 이 자리에 두는 이유는
 * contracts 가 두 축의 관계를 갖지 않기 때문이다(각각 독립 enum). `Record` 로 두어 섹션이
 * 늘어나면 컴파일 에러로 누락을 알린다.
 *
 * ── `enabled` ──
 * 시트가 닫혀 있을 때는 조회하지 않는다. 아이 id 가 없으면(온보딩 전) 역시 조회하지 않는다 —
 * `useLibraryOverview` 와 같은 규칙이다.
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import type {
  ErrorCode,
  LibraryBook,
  LibraryFilter,
  LibraryListResponse,
  LibrarySectionKey,
} from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { useCurrentChildId } from '../me';

import { libraryKeys } from './libraryKeys';

/** 섹션(표시 축) → filter(쿼리 축). `L-OPEN-14` — 두 축이 1:1 이 아니다. */
export const LIBRARY_SECTION_FILTER: Readonly<Record<LibrarySectionKey, LibraryFilter>> = {
  curated: 'curated',
  favorites: 'saved',
  finished: 'history',
};

export interface UseLibraryListResult {
  /** 받은 페이지를 이어 붙인 목록. 아직 없으면 `undefined` 다. */
  items: readonly LibraryBook[] | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  /** 다음 커서가 있다 (`nextCursor !== null`). */
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function useLibraryList(
  section: LibrarySectionKey | undefined,
  options: { enabled?: boolean } = {},
): UseLibraryListResult {
  const { library } = useApiClients();
  const childId = useCurrentChildId();
  const filter = section === undefined ? undefined : LIBRARY_SECTION_FILTER[section];
  const enabled = (options.enabled ?? true) && childId !== undefined && filter !== undefined;

  const result = useInfiniteQuery({
    queryKey: libraryKeys.list(childId ?? '', filter ?? 'curated'),
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      library.getList(
        {
          childId: childId ?? '',
          query: {
            filter: filter ?? 'curated',
            ...(pageParam === undefined ? {} : { cursor: pageParam }),
          },
        },
        { signal },
      ),
    /** 커서는 **불투명 문자열**이다 — 내용을 해석하지 않고 그대로 되돌려 보낸다. */
    getNextPageParam: (last: LibraryListResponse) => last.nextCursor ?? undefined,
  });

  const error: unknown = result.error;
  const items = result.data?.pages.flatMap((page) => page.items);

  return {
    items,
    isPending: enabled && result.isPending,
    isError: result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    hasMore: result.hasNextPage,
    isLoadingMore: result.isFetchingNextPage,
    loadMore: () => {
      if (!result.hasNextPage || result.isFetchingNextPage) return;
      void result.fetchNextPage();
    },
    refetch: () => {
      void result.refetch();
    },
  };
}
