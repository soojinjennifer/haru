/**
 * `useLibraryOverview` — `GET /v1/children/:childId/library/overview` Query hook
 * (FR-20, Library Design Spec §7.4, `P3-BIP-18`).
 *
 * ```
 * (feature) → useLibraryOverview → libraryApi.getOverview → MockLibraryApi | HttpLibraryApi
 * ```
 *
 * ── 왜 섹션마다 쿼리를 두지 않는가 ──
 * 서재 4섹션은 한 화면에 **동시에** 뜬다. 섹션별 쿼리면 4-way 로딩이 되어 체감 지연이 나빠지고
 * (`P3-BIP-10`), Skeleton 이 섹션마다 따로 사라져 화면이 네 번 들썩인다. 그래서 응답 하나를
 * 받아 feature 가 섹션으로 나눈다.
 *
 * 아이 id 가 아직 없으면(온보딩 전) **요청하지 않는다** — `useHomeSummary` 와 같은 규칙이다.
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, LibraryOverview } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { useCurrentChildId } from '../me';

import { libraryKeys } from './libraryKeys';

export interface UseLibraryOverviewResult {
  overview: LibraryOverview | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useLibraryOverview(): UseLibraryOverviewResult {
  const { library } = useApiClients();
  const childId = useCurrentChildId();

  const result = useQuery({
    queryKey: libraryKeys.overview(childId ?? ''),
    enabled: childId !== undefined,
    queryFn: ({ signal }) => library.getOverview({ childId: childId ?? '' }, { signal }),
  });

  const error: unknown = result.error;

  return {
    overview: result.data,
    isPending: childId === undefined || result.isPending,
    isError: result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void result.refetch();
    },
  };
}
