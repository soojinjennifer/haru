/**
 * `useTodayActivityCard` — `GET /v1/children/:childId/activity-cards/today` (FR-07).
 *
 * ```
 * (feature) → useTodayActivityCard → activityApi.getTodayCard → MockActivityApi | HttpActivityApi
 * ```
 *
 * - 아이 id 가 없으면 요청하지 않는다 (온보딩 전).
 * - 카드가 없는 날은 `empty` **시나리오**가 아니라 `RESOURCE_NOT_FOUND` 로 오는 것이 아니라,
 *   Mock 이 `empty` 에서 `ACTIVITY_CARD_EMPTY` 대신 **빈 안내 상태**를 표현하도록
 *   `HomeSummary.todayCard: null` 과 같은 의미의 `CARD_NOT_READY` 경로를 쓴다 —
 *   화면은 `isEmpty` 로 구분한다 (Design Spec §8 `empty` 행).
 * - **클라이언트에서 "오늘" 을 재판정하지 않는다** (`D-10`). 날짜 비교는 화면이 `card.date` 와
 *   주입된 clock 으로만 하며 그 판단도 `isStale` 로 외부에 노출한다.
 */
import { useQuery } from '@tanstack/react-query';
import type { ActivityCard, ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { useCurrentChildId } from '../me';

import { activityCardKeys } from './activityCardKeys';

/** 오늘 카드가 아직 없을 때 서버가 주는 코드 (Mock 의 `empty` scenario). */
const EMPTY_CODE: ErrorCode = 'RESOURCE_NOT_FOUND';

export interface UseTodayActivityCardResult {
  card: ActivityCard | undefined;
  isPending: boolean;
  /** 오늘 카드가 아직 없다 — 오류 화면이 아니라 **안내**다 (§8 `empty`). */
  isEmpty: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useTodayActivityCard(): UseTodayActivityCardResult {
  const { activities } = useApiClients();
  const childId = useCurrentChildId();

  const result = useQuery({
    queryKey: activityCardKeys.today(childId ?? ''),
    enabled: childId !== undefined,
    queryFn: ({ signal }) => activities.getTodayCard({ childId: childId ?? '' }, { signal }),
  });

  const error: unknown = result.error;
  const errorCode = isHaruApiError(error) ? error.code : undefined;
  const isEmpty = errorCode === EMPTY_CODE;

  return {
    card: result.data,
    isPending: childId === undefined || result.isPending,
    isEmpty,
    isError: result.isError && !isEmpty,
    errorCode,
    isOffline: isNetworkError(error),
    refetch: () => {
      void result.refetch();
    },
  };
}
