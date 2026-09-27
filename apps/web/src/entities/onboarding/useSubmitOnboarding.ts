/**
 * `useSubmitOnboarding` — `POST /v1/onboarding/submit` Mutation hook.
 *
 * ```
 * CapabilityItemsStep → useSubmitOnboarding → onboardingApi.submit
 *                     → MockOnboardingApi | HttpOnboardingApi
 * ```
 *
 * - **Idempotency-Key 는 "제출 의도" 단위로 하나다** — 성공할 때까지 재시도에서 그대로
 *   재사용하고, 성공하면 버린다 (AC-2-16 · `useRecordConsents` 와 같은 규칙).
 * - Trial 로컬 draft 도 **같은 요청 1회**로 전송된다 (C-12). 5단계 전체가 한 번에 도착한다.
 * - 성공하면 `me` 를 무효화한다 — Route Guard 가 온보딩 완료를 다시 읽어야 한다.
 *
 * 응답(`ProfileResult`)의 **화면 표시는 Stage 2-B** 다. Stage 2 는 parse 검증까지만 한다.
 */
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useRef } from 'react';
import type { ProfileResult, SubmitOnboardingRequest } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { createIdempotencyKey } from '../../shared/lib/idempotency';
import { meKeys } from '../me';

import { onboardingKeys } from './onboardingKeys';

export type SubmitOnboardingMutation = UseMutationResult<
  ProfileResult,
  unknown,
  SubmitOnboardingRequest
>;

export function useSubmitOnboarding(): SubmitOnboardingMutation {
  const { onboarding } = useApiClients();
  const queryClient = useQueryClient();
  const pendingKey = useRef<string | null>(null);

  return useMutation({
    mutationFn: (request: SubmitOnboardingRequest) => {
      pendingKey.current ??= createIdempotencyKey();

      return onboarding.submit(request, { idempotencyKey: pendingKey.current });
    },
    onSuccess: () => {
      pendingKey.current = null;
      void queryClient.invalidateQueries({ queryKey: meKeys.all });
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.all });
    },
  });
}
