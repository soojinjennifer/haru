/**
 * `useSignOut` — 로그아웃 Mutation hook (Plan §5.4, **AC-2-29** · **AC-2-41**).
 *
 * ```
 * SettingsMenu → useSignOut → performSessionCleanup(shared/lib)
 *                              ├ AuthGateway.signOut()   (주입 — app/providers 가 선택)
 *                              ├ OnboardingDraftStore.clear()   (결정 D-3 삭제 시점 ②)
 *                              ├ ActivityCardCache.clear()      (결정 D-11 삭제 시점 ④ — Stage 4 AC-4-83)
 *                              ├ 로컬 녹음 정리                 (Stage 4 AC-4-72 — 주입, 기본 = Web 저장소 삭제)
 *                              └ QueryClient.clear()
 * ```
 *
 * **화면 이동을 하지 않는다.** 세션이 사라지면 `useMe` 가 `null` 이 되고 Route Guard 가
 * `/auth/welcome` 으로 보낸다 (auth handoff ③ "이동은 Guard 에 맡긴다"). 로그아웃만 다른
 * 규칙을 쓰면 판정 지점이 둘이 된다.
 */
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';

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
import { performSessionCleanup } from '../../../shared/lib/session-cleanup';
import { wipeWebRecordingStorage } from '../../../shared/platform/recording-storage';

export type SignOutMutation = UseMutationResult<void, unknown, void>;

export interface UseSignOutOptions {
  /** 테스트 주입 지점. 주지 않으면 `localStorage` + 시스템 시계를 쓴다. */
  draftStore?: OnboardingDraftStore | undefined;
  /** 테스트 주입 지점. 주지 않으면 `localStorage` 의 Activity Card 캐시를 지운다 (`D-11`). */
  activityCardCache?: ActivityCardCache | undefined;
  clock?: Clock | undefined;
  /**
   * 로컬 녹음 정리 (AC-4-72). 주지 않으면 이 기기의 Web 녹음 저장소(IndexedDB + OPFS)를 지운다.
   * 녹음 런타임이 조립되면(`S4-F`) 조립 지점이 `RecordingRuntime.clearAll` 을 넘긴다 — 메모리 상태까지 비운다.
   */
  clearLocalRecordings?: (() => Promise<void>) | undefined;
}

export function useSignOut(options: UseSignOutOptions = {}): SignOutMutation {
  const { gateway } = useAuth();
  const queryClient = useQueryClient();

  // 저장소는 마운트 동안 변하지 않는 싱글턴이다 (렌더 중 ref 를 읽지 않기 위해 lazy state).
  const [clock] = useState<Clock>(() => options.clock ?? createSystemClock());
  const [draftStore] = useState<OnboardingDraftStore>(
    () => options.draftStore ?? createOnboardingDraftStore({ clock }),
  );
  const [activityCardCache] = useState<ActivityCardCache>(
    () => options.activityCardCache ?? createActivityCardCache({ clock }),
  );

  return useMutation({
    mutationFn: () =>
      performSessionCleanup({
        signOut: () => gateway.signOut(),
        clearOnboardingDraft: () => {
          draftStore.clear();
        },
        clearActivityCardCache: () => {
          activityCardCache.clear();
        },
        clearLocalRecordings: options.clearLocalRecordings ?? wipeWebRecordingStorage,
        clearQueryCache: () => {
          queryClient.clear();
        },
      }),
  });
}
