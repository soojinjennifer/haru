/**
 * `useRecordingSessions` — 세션별 녹음 목록 infinite Query hook (Stage 8 `C8-2`, Plan §5.2 · FR-21).
 *
 * ```
 * (feature) → useRecordingSessions → dataManagementApi.listRecordingSessions → Mock | Http
 *             (GET /v1/children/:childId/sessions?hasRecording=true&cursor=)
 * ```
 *
 * - key = `sessionKeys.list(childId, { hasRecording: true })` — 세션 목록과 같은 endpoint 다 (Plan §5.2).
 * - 서버 순서 그대로 (최신 먼저). `deleted` · `expired` 행도 온다 (`Q8-07` ⓐ — 화면이 상태 문구로 보여 준다).
 * - *Show more* = `fetchNextPage`. 다음 페이지 실패는 `isFetchNextPageError` 로 따로 알린다 — 이미 받은 행은 유지 (Spec §2.9).
 * - 아이 id 가 없으면(온보딩 전) 요청하지 않는다.
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import type { ErrorCode, SessionListItem } from '@haru/contracts';

import { useCurrentChildId } from '../me';
import { sessionKeys } from '../session';
import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

/** 녹음 목록 query key — 행 삭제 후 캐시를 고칠 때 feature 가 같은 key 를 쓴다. */
export function recordingSessionsKey(childId: string) {
  return sessionKeys.list(childId, { hasRecording: true });
}

export interface UseRecordingSessionsResult {
  items: readonly SessionListItem[];
  isPending: boolean;
  /** 첫 페이지 실패 (화면 전체 오류). */
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  isRefetching: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  /** *Show more* 실패 — 이미 받은 행은 유지된다. */
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export function useRecordingSessions(): UseRecordingSessionsResult {
  const { dataManagement } = useApiClients();
  const childId = useCurrentChildId();

  const result = useInfiniteQuery({
    queryKey: recordingSessionsKey(childId ?? ''),
    enabled: childId !== undefined,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      dataManagement.listRecordingSessions(
        {
          childId: childId ?? '',
          ...(pageParam === undefined ? {} : { query: { cursor: pageParam } }),
        },
        { signal },
      ),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });

  const error: unknown = result.error;
  const firstPageFailed = result.isError && !result.isFetchNextPageError;

  return {
    items: result.data?.pages.flatMap((page) => page.items) ?? [],
    isPending: childId === undefined || result.isPending,
    isError: firstPageFailed,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    isRefetching: result.isRefetching && !result.isFetchingNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    isFetchNextPageError: result.isFetchNextPageError,
    fetchNextPage: () => {
      void result.fetchNextPage();
    },
    refetch: () => {
      void result.refetch();
    },
  };
}
