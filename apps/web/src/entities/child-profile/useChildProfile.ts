/**
 * `useChildProfile` — `GET /v1/children/:childId/profile` Query hook (Stage 6 Plan §5.2, FR-04~06 · FR-15).
 *
 * ```
 * (feature) → useChildProfile → childrenApi.getProfile → MockChildrenApi | HttpChildrenApi
 * ```
 *
 * - 프로필 결과(온보딩 모드)·재방문 프로필·발전 역량 화면의 **유일한 데이터 출처**다 (`D6-5`).
 * - `childId` 가 없으면(온보딩 전) 요청하지 않는다 — `useCurrentChildId` 와 같은 규칙.
 * - 낙관적 갱신을 하지 않는다 — 프로필은 서버 산출값이다 (Plan §5.2).
 */
import { useQuery } from '@tanstack/react-query';
import type { ChildProfile, ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { childProfileKeys } from './childProfileKeys';

export interface UseChildProfileResult {
  profile: ChildProfile | undefined;
  isPending: boolean;
  isError: boolean;
  /** Error Envelope 이 있는 실패의 코드. 전송 실패(offline)면 `undefined`. */
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useChildProfile(childId: string | undefined): UseChildProfileResult {
  const { children } = useApiClients();
  const enabled = childId !== undefined;

  const query = useQuery({
    queryKey: childProfileKeys.detail(childId ?? ''),
    enabled,
    queryFn: ({ signal }) => children.getProfile({ childId: childId ?? '' }, { signal }),
  });

  const error: unknown = query.error;

  return {
    profile: query.data,
    isPending: enabled && query.isPending,
    isError: query.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void query.refetch();
    },
  };
}
