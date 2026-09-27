/**
 * `useSignOut` — 로그아웃 Mutation hook (Plan §5.4, **AC-2-29** · **AC-2-41**).
 *
 * ```
 * SettingsMenu → useSignOut → performSessionCleanup(shared/lib)
 *                              ├ AuthGateway.signOut()   (주입 — app/providers 가 선택)
 *                              ├ OnboardingDraftStore.clear()   (결정 D-3 삭제 시점 ②)
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
import { createSystemClock, type Clock } from '../../../shared/lib/clock';
import {
  createOnboardingDraftStore,
  type OnboardingDraftStore,
} from '../../../shared/lib/onboarding-draft';
import { performSessionCleanup } from '../../../shared/lib/session-cleanup';

export type SignOutMutation = UseMutationResult<void, unknown, void>;

export interface UseSignOutOptions {
  /** 테스트 주입 지점. 주지 않으면 `localStorage` + 시스템 시계를 쓴다. */
  draftStore?: OnboardingDraftStore | undefined;
  clock?: Clock | undefined;
}

export function useSignOut(options: UseSignOutOptions = {}): SignOutMutation {
  const { gateway } = useAuth();
  const queryClient = useQueryClient();

  // 저장소는 마운트 동안 변하지 않는 싱글턴이다 (렌더 중 ref 를 읽지 않기 위해 lazy state).
  const [clock] = useState<Clock>(() => options.clock ?? createSystemClock());
  const [draftStore] = useState<OnboardingDraftStore>(
    () => options.draftStore ?? createOnboardingDraftStore({ clock }),
  );

  return useMutation({
    mutationFn: () =>
      performSessionCleanup({
        signOut: () => gateway.signOut(),
        clearOnboardingDraft: () => {
          draftStore.clear();
        },
        clearQueryCache: () => {
          queryClient.clear();
        },
      }),
  });
}
