/**
 * `useAccountDeletionCleanup` — 탈퇴 요청 **성공 직후** 이 기기 정리 + 세션 종료 (Stage 8 `N8-10` 탈퇴 ⓐ · Plan §5.2 · §5.5 · AC-8-35 · 62).
 *
 * ```
 * AccountSettings (deleteAccount 성공) → useAccountDeletionCleanup → performSessionCleanup (shared/lib — 재사용, Plan §5.1)
 *                                         ├ signOut       = AuthGateway.signOut()   (세션 종료 — 계정이 없어진다)
 *                                         ├ draft         = OnboardingDraftStore.clear
 *                                         ├ 카드 캐시      = ActivityCardCache.clear
 *                                         ├ 로컬 녹음      = 조립 지점 녹음 런타임 정리 | Web 저장소 삭제
 *                                         └ Query 캐시     = QueryClient.clear
 *                                       + 복귀 경로 메모리 = returnPathStore.clear (Plan §5.5)
 * ```
 *
 * 로그아웃(`features/settings` `useSignOut`)과 같은 정리 단계다 — feature 간 import 금지(`rules/architecture.md` §3)라
 * 같은 공용 함수(`performSessionCleanup`)를 이 feature 가 직접 조립한다. 정리 단계를 다시 구현하지 않는다.
 * **화면 이동은 하지 않는다** — 호출자가 `/auth/welcome` 으로 replace 한다 (Spec §2.6).
 */
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useOptionalSessionRecorderEnvironment } from '../../../entities/session';
import { useAuth } from '../../../shared/auth';
import {
  createActivityCardCache,
  type ActivityCardCache,
} from '../../../shared/lib/activity-card-cache';
import { createSystemClock, type Clock } from '../../../shared/lib/clock';
import {
  createOnboardingDraftStore,
  type OnboardingDraftStore,
} from '../../../shared/lib/onboarding-draft';
import { returnPathStore } from '../../../shared/lib/return-path';
import { dataDeletionMarkerStore } from '../../../shared/lib/data-deletion-marker';
import { performSessionCleanup } from '../../../shared/lib/session-cleanup';
import { wipeWebRecordingStorage } from '../../../shared/platform/recording-storage';

export interface UseAccountDeletionCleanupOptions {
  /** 테스트 주입 지점. 주지 않으면 `localStorage` + 시스템 시계. */
  draftStore?: OnboardingDraftStore | undefined;
  activityCardCache?: ActivityCardCache | undefined;
  clock?: Clock | undefined;
  /** 로컬 녹음 정리. 주지 않으면 조립 지점의 녹음 런타임 정리, 조립이 없으면 Web 녹음 저장소 삭제 (`useSignOut` 과 같다). */
  clearLocalRecordings?: (() => Promise<void>) | undefined;
}

export function useAccountDeletionCleanup(
  options: UseAccountDeletionCleanupOptions = {},
): () => Promise<void> {
  const { gateway } = useAuth();
  const queryClient = useQueryClient();
  const recorderEnvironment = useOptionalSessionRecorderEnvironment();

  const [clock] = useState<Clock>(() => options.clock ?? createSystemClock());
  const [draftStore] = useState<OnboardingDraftStore>(
    () => options.draftStore ?? createOnboardingDraftStore({ clock }),
  );
  const [activityCardCache] = useState<ActivityCardCache>(
    () => options.activityCardCache ?? createActivityCardCache({ clock }),
  );

  return async () => {
    try {
      await performSessionCleanup({
        signOut: () => gateway.signOut(),
        clearOnboardingDraft: () => {
          draftStore.clear();
        },
        clearActivityCardCache: () => {
          activityCardCache.clear();
        },
        // 전체 삭제 요청 기기 표시 — 이 기기를 떠나면 감시도 끝난다 (`N8-31` ⓐ, AC-8-97)
        clearDataDeletionMarker: () => {
          dataDeletionMarkerStore.clear();
        },
        clearLocalRecordings:
          options.clearLocalRecordings ??
          (recorderEnvironment === null
            ? wipeWebRecordingStorage
            : () => recorderEnvironment.clearLocalRecordings()),
        clearQueryCache: () => {
          queryClient.clear();
        },
      });
    } finally {
      returnPathStore.clear();
    }
  };
}
