/**
 * `useGiftRequests` — `GET /v1/children/:childId/gift-requests` (FR-22).
 * `/library/gift-requests` **상태 확인 전용** 화면이 쓴다 (Library Design Spec §7.3).
 *
 * ```
 * (feature) → useGiftRequests → libraryApi.getGiftRequests → MockLibraryApi | HttpLibraryApi
 * ```
 *
 * 신청 CTA 는 이 화면에 없다 — 신청은 `BookDetailSheet` 에서 한다 (`stage-3-design-spec.md`
 * §2.11 유지). 그래서 이 hook 은 읽기 전용이다.
 *
 * ⚠ 목록이 **0건인 상태가 가장 흔하다** (아직 신청하지 않은 보호자). 그 상태는 오류가 아니라
 * 정상 화면이며 화면이 `EmptyState` 로 다룬다.
 *
 * 커서 pagination 은 contract 에 있으나(`GiftRequestListResponse`) 이 화면은 **더 보기를
 * 만들지 않는다** — 증정 신청은 MVP 에서 소수 건이고 Figma·명세에 더 보기가 없다. 서버가
 * `nextCursor` 를 주면 `hasMore` 로 노출만 해 두고 화면은 쓰지 않는다 (Handoff 기록).
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, GiftRequest } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { useCurrentChildId } from '../me';

import { libraryKeys } from './libraryKeys';

export interface UseGiftRequestsResult {
  requests: readonly GiftRequest[] | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  /** 서버가 다음 커서를 줬다 — 화면은 현재 쓰지 않는다 (위 주석). */
  hasMore: boolean;
  refetch: () => void;
}

export function useGiftRequests(): UseGiftRequestsResult {
  const { library } = useApiClients();
  const childId = useCurrentChildId();

  const result = useQuery({
    queryKey: libraryKeys.giftRequests(childId ?? ''),
    enabled: childId !== undefined,
    queryFn: ({ signal }) => library.getGiftRequests({ childId: childId ?? '' }, { signal }),
  });

  const error: unknown = result.error;

  return {
    requests: result.data?.items,
    isPending: childId === undefined || result.isPending,
    isError: result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    hasMore: (result.data?.nextCursor ?? null) !== null,
    refetch: () => {
      void result.refetch();
    },
  };
}
