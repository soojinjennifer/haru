/**
 * `useDataDeletionCleanup` — 전체 데이터 삭제 **완료 후** 이 기기의 아동 데이터 정리 (Stage 8 `N8-10` ⓐ · Plan §5.5 · AC-8-31).
 *
 * ```
 * DataManagement (status = completed) → useDataDeletionCleanup → performSessionCleanup (shared/lib — 재사용, Plan §5.1)
 *                                         ├ signOut       = 없음 (계정은 유지 — N8-02 ⓐ)
 *                                         ├ draft         = OnboardingDraftStore.clear
 *                                         ├ 카드 캐시      = ActivityCardCache.clear
 *                                         ├ 로컬 녹음      = 조립 지점 녹음 런타임 정리 | Web 저장소 삭제
 *                                         └ Query 캐시     = 전부 제거 → `me` 만 다시 조회
 * ```
 *
 * **화면 이동을 하지 않는다.** `me` 를 다시 조회하면 서버에 아동 데이터가 없으므로(온보딩 전) Route Guard 가 온보딩으로 보낸다
 * (`N8-10` ⓐ — 로그아웃과 같은 "이동은 Guard" 규칙).
 *
 * Query 캐시: `QueryClient.clear()` 는 마운트된 observer(= Guard 의 `useMe`)를 다시 조회시키지 않는다 — 그래서 모든 query 를
 * **제거**한 뒤 `me` 만 **reset**(초기 상태 + 활성 observer 재조회)한다. 결과: 아동 데이터가 담긴 캐시 0 · `me` = 삭제 후 서버 상태.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { meKeys } from '../../../entities/me';
import { useOptionalSessionRecorderEnvironment } from '../../../entities/session';
import {
  createActivityCardCache,
  type ActivityCardCache,
} from '../../../shared/lib/activity-card-cache';
import { createSystemClock, type Clock } from '../../../shared/lib/clock';
import {
  createOnboardingDraftStore,
  type OnboardingDraftStore,
} from '../../../shared/lib/onboarding-draft';
import { performSessionCleanup } from '../../../shared/lib/session-cleanup';
import { wipeWebRecordingStorage } from '../../../shared/platform/recording-storage';

export interface UseDataDeletionCleanupOptions {
  /** 테스트 주입 지점. 주지 않으면 `localStorage` + 시스템 시계. */
  draftStore?: OnboardingDraftStore | undefined;
  activityCardCache?: ActivityCardCache | undefined;
  clock?: Clock | undefined;
  /** 로컬 녹음 정리. 주지 않으면 조립 지점의 녹음 런타임 정리, 조립이 없으면 Web 녹음 저장소 삭제 (`useSignOut` 과 같다). */
  clearLocalRecordings?: (() => Promise<void>) | undefined;
}

export function useDataDeletionCleanup(
  options: UseDataDeletionCleanupOptions = {},
): () => Promise<void> {
  const queryClient = useQueryClient();
  const recorderEnvironment = useOptionalSessionRecorderEnvironment();

  const [clock] = useState<Clock>(() => options.clock ?? createSystemClock());
  const [draftStore] = useState<OnboardingDraftStore>(
    () => options.draftStore ?? createOnboardingDraftStore({ clock }),
  );
  const [activityCardCache] = useState<ActivityCardCache>(
    () => options.activityCardCache ?? createActivityCardCache({ clock }),
  );

  return () =>
    performSessionCleanup({
      // 계정은 유지된다 (`N8-02` ⓐ) — 세션을 끝내지 않는다.
      signOut: () => Promise.resolve(),
      clearOnboardingDraft: () => {
        draftStore.clear();
      },
      clearActivityCardCache: () => {
        activityCardCache.clear();
      },
      // 표시는 지우지 않는다 — 감시자(`DataDeletionWatcher`)가 정리 **성공 후** 지운다 (실패면 남겨 재시도, `N8-31` ⓐ).
      clearDataDeletionMarker: () => undefined,
      clearLocalRecordings:
        options.clearLocalRecordings ??
        (recorderEnvironment === null
          ? wipeWebRecordingStorage
          : () => recorderEnvironment.clearLocalRecordings()),
      clearQueryCache: () => {
        queryClient.removeQueries({
          predicate: (query) => query.queryKey[0] !== meKeys.all[0],
        });
        void queryClient.resetQueries({ queryKey: meKeys.all });
      },
    });
}
