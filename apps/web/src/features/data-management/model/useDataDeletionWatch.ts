/**
 * `useDataDeletionWatch` — 전체 데이터 삭제 **완료 감지 · 로컬 정리의 단일 소유자** (Stage 8 `N8-31` ⓐ — `D8-2` ①,
 * Plan rev 2.2 §5.7 · Spec §2.5 · §6.1 · AC-8-97 · AC-8-98).
 *
 * ```
 * app/providers DataDeletionWatcher → useDataDeletionWatch
 *   ├ 기기 표시(요청 id — `shared/lib/data-deletion-marker`) 구독
 *   ├ useDeletionRequest(id, poll)         같은 key(`dataManagementKeys.request(id)`)를 화면은 observe 만 → 요청 중복 0
 *   ├ completed → useDataDeletionCleanup → 표시 삭제 → Toast success *Your data was deleted.* 1회
 *   │              (정리 실패 → 표시 유지 · Toast 0 · 다음 앱 시작 때 재시도)
 *   ├ failed · RESOURCE_NOT_FOUND · FORBIDDEN → 표시 삭제 (실패 표면은 화면 몫)
 *   └ 화면 복귀(`visibilitychange` visible) → 1회 조회 (폴링 상한 `P-42` 후에도)
 * ```
 *
 * - **화면 안 · 화면 밖(이탈 · 폴링 상한 · 앱 재시작) 완료가 같은 경로**다. `/settings/data` 는 상태만 표시한다.
 * - **화면 이동을 하지 않는다.** 정리가 `me` 를 다시 읽게 하고(`useDataDeletionCleanup`), Route Guard 가 온보딩으로 보낸다
 *   (`N8-10` ⓐ — 이동은 Guard).
 * - `holdGuard` — 표시가 있고 ① (앱 시작 때 있던 표시의) 첫 조회 응답 전 ② `completed` 를 받아 정리가 끝나기 전에는 Guard 가 **기존 pending 표현**으로
 *   기다린다. 정리 전에 온보딩(draft resume) 화면이 그려지지 않게 한다 (새 UI 0). 첫 조회가 실패(오프라인 등)하거나 정리가
 *   실패하면 풀어 준다 — 앱이 Spinner 에 갇히지 않는다.
 * - 인증 세션이 없으면 조회하지 않는다 (로그아웃은 표시를 지운다 — 남아 있으면 세션 만료 등).
 * - 로그 0: 요청 id · 경로를 남기지 않는다 (실패 이름만).
 */
import { useToast } from '@haru/ui';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useDeletionRequest } from '../../../entities/data-management';
import { useAuthSession } from '../../../shared/auth';
import {
  dataDeletionMarkerStore,
  type DataDeletionMarkerStore,
} from '../../../shared/lib/data-deletion-marker';
import { errorName, logger } from '../../../shared/lib/logger';
import { dataManagementCopy as copy } from '../copy';

import {
  useDataDeletionCleanup,
  type UseDataDeletionCleanupOptions,
} from './useDataDeletionCleanup';

export interface UseDataDeletionWatchOptions {
  /** 테스트 주입 지점 — 기기 표시 저장소. 기본 = 앱 공용 인스턴스. */
  markerStore?: DataDeletionMarkerStore | undefined;
  /** 테스트 주입 지점 — 로컬 정리 저장소. */
  cleanup?: UseDataDeletionCleanupOptions | undefined;
}

export interface DataDeletionWatchState {
  /** Route Guard 가 판정을 미루고 기존 pending 표현으로 기다려야 하는가. */
  holdGuard: boolean;
}

export function useDataDeletionWatch(
  options: UseDataDeletionWatchOptions = {},
): DataDeletionWatchState {
  const markerStore = options.markerStore ?? dataDeletionMarkerStore;
  const toast = useToast();
  const session = useAuthSession();
  const runCleanup = useDataDeletionCleanup(options.cleanup);

  const markedId = useSyncExternalStore(
    markerStore.subscribe,
    () => markerStore.read()?.requestId ?? null,
    () => null,
  );
  /**
   * 앱 시작 때 이미 표시돼 있던 요청 id — 첫 조회 전 Guard 대기는 **이 요청에만** 건다. 화면에서 방금 만든 요청(앱 사용 중 표시)은
   * 첫 조회를 기다릴 이유가 없다(정리할 완료가 아직 없다) — 기다리면 화면이 pending 으로 바뀌어 포커스 · 알림을 잃는다.
   */
  const [startupId] = useState<string | null>(() => markerStore.read()?.requestId ?? null);
  const authenticated = session !== null && session !== undefined;
  const watchingId = authenticated ? markedId : null;

  const polled = useDeletionRequest(watchingId);
  const status = polled.request?.id === watchingId ? polled.request?.status : undefined;
  const { errorCode } = polled;

  /** 정리를 시작한 요청 id — 같은 요청을 두 번 정리하지 않는다(StrictMode 재실행 · 재조회 포함). */
  const cleanupStarted = useRef<string | null>(null);
  /** 정리가 실패한 요청 id — Guard 대기를 푼다(표시는 남겨 다음 시작 때 재시도). */
  const [cleanupFailedFor, setCleanupFailedFor] = useState<string | null>(null);

  useEffect(() => {
    if (watchingId === null) return;
    if (errorCode === 'RESOURCE_NOT_FOUND' || errorCode === 'FORBIDDEN' || status === 'failed') {
      // 다시 물어도 답이 같다 · 서버가 실패를 확정했다 — 감시 종료 (실패 표면은 `/settings/data` 몫)
      markerStore.clear();
      return;
    }
    if (status !== 'completed' || cleanupStarted.current === watchingId) return;

    const requestId = watchingId;
    cleanupStarted.current = requestId;
    runCleanup().then(
      () => {
        markerStore.clear();
        toast.show({ tone: 'success', message: copy.completedToast });
      },
      (error: unknown) => {
        logger.error('data_deletion_local_cleanup_failed', { errorName: errorName(error) });
        setCleanupFailedFor(requestId);
      },
    );
  }, [watchingId, status, errorCode, markerStore, runCleanup, toast]);

  // 화면 복귀 시 1회 조회 — `refetchOnWindowFocus` 는 앱 전체에서 꺼져 있다 (결정성, QueryProvider).
  const refetchLatest = useRef(polled.refetch);
  useEffect(() => {
    refetchLatest.current = polled.refetch;
  });
  useEffect(() => {
    if (watchingId === null || typeof document === 'undefined') return undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refetchLatest.current();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [watchingId]);

  const holdGuard =
    watchingId !== null &&
    cleanupFailedFor !== watchingId &&
    ((watchingId === startupId && !polled.isSettled) || status === 'completed');

  return { holdGuard };
}
