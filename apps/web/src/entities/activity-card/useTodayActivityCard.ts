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
 *
 * ── 오프라인 캐시 (`D-11`, 이월 `QA-3-002`, Stage 4 AC-4-82 · AC-4-83) ──
 * - 성공 응답을 받을 때마다 `shared/lib/activity-card-cache` 에 **카드만** 저장한다.
 * - 네트워크 오류인데 보여 줄 카드가 있으면 카드를 그대로 돌려주고 `isCached` 를 켠다. 보여 줄 카드는
 *   ① 이번 화면에서 이미 받은 응답(Query 가 유지) ② 없으면 **로컬 캐시**(폐기 규칙 통과분) 순서다.
 *   화면은 카드 + Offline Banner 를 **함께** 보여 준다 (Stage 3 Design Spec §8 `offline-cached-card`).
 * - 네트워크 오류가 아닌 실패(서버 오류 등)에는 캐시를 쓰지 않는다 — 오류를 감추지 않는다.
 * - 로그아웃 시 삭제는 `features/settings` 의 `useSignOut` 이 한다 (`D-11` ④).
 */
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import type { ActivityCard, ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import {
  createActivityCardCache,
  type ActivityCardCache,
} from '../../shared/lib/activity-card-cache';
import { createSystemClock } from '../../shared/lib/clock';
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
  /**
   * 오프라인인데 카드가 있다 — 카드는 **최근에 받은 것**이다 (이번 화면의 이전 응답 또는 로컬 캐시).
   * 화면은 카드와 Offline Banner 를 함께 보여 준다 (AC-4-82).
   */
  isCached: boolean;
  refetch: () => void;
}

export interface UseTodayActivityCardOptions {
  /** 테스트 주입 지점. 주지 않으면 `localStorage` + 시스템 시계를 쓴다. */
  cache?: ActivityCardCache | undefined;
}

export function useTodayActivityCard(
  options: UseTodayActivityCardOptions = {},
): UseTodayActivityCardResult {
  const { activities } = useApiClients();
  const childId = useCurrentChildId();
  // 저장소는 마운트 동안 변하지 않는다 (렌더 중 ref 를 읽지 않기 위해 lazy state — `useSignOut` 과 같다).
  const [cache] = useState<ActivityCardCache>(
    () => options.cache ?? createActivityCardCache({ clock: createSystemClock() }),
  );

  const result = useQuery({
    queryKey: activityCardKeys.today(childId ?? ''),
    enabled: childId !== undefined,
    queryFn: ({ signal }) => activities.getTodayCard({ childId: childId ?? '' }, { signal }),
  });

  const error: unknown = result.error;
  const errorCode = isHaruApiError(error) ? error.code : undefined;
  const isEmpty = errorCode === EMPTY_CODE;
  const isOffline = isNetworkError(error);
  const fresh = result.data;

  // 성공 응답 = 최근 카드. 같은 카드를 다시 받아도 저장 결과가 같다 (멱등).
  useEffect(() => {
    if (childId === undefined || fresh === undefined) return;
    cache.write(childId, fresh);
  }, [cache, childId, fresh]);

  // 오프라인이고 이번 화면에 받은 카드가 없을 때만 로컬 캐시를 읽는다 (동기 저장소 — 폐기 규칙은 읽기가 적용한다).
  const needsCache = isOffline && fresh === undefined && childId !== undefined;
  // 오프라인 진입 시점에 한 번 읽는다 (`needsCache` 가 켜질 때). 그 사이 저장소를 쓰는 곳은 이 hook 뿐이다.
  const cachedCard = useMemo(
    () => (needsCache ? (cache.read(childId ?? '').card ?? undefined) : undefined),
    [needsCache, cache, childId],
  );
  const card = fresh ?? cachedCard;

  return {
    card,
    isPending: childId === undefined || result.isPending,
    isEmpty,
    isError: result.isError && !isEmpty,
    errorCode,
    isOffline,
    isCached: isOffline && card !== undefined,
    refetch: () => {
      void result.refetch();
    },
  };
}
