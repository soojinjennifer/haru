/**
 * `useSaveOnboardingStep` — `PUT /v1/onboarding/steps/:step` Mutation hook.
 *
 * **단계 이동 시 1회**만 호출된다 (결정 D-11). 키 입력마다 아동 데이터를 전송하지 않는다.
 * 로컬 draft 는 400ms debounce 로 따로 저장한다 (`features/onboarding-survey`).
 *
 * 저장 중 표시를 만들지 않는다 (Design Spec §2.9 "조용한 저장"). 실패는 호출자가
 * `InlineAlert` 로 알리고, 응답은 로컬 draft 에 남아 있으므로 유실되지 않는다.
 */
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { OnboardingState, SaveOnboardingStepRequest } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';

import { onboardingKeys } from './onboardingKeys';

export type SaveOnboardingStepMutation = UseMutationResult<
  OnboardingState,
  unknown,
  SaveOnboardingStepRequest
>;

export function useSaveOnboardingStep(): SaveOnboardingStepMutation {
  const { onboarding } = useApiClients();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SaveOnboardingStepRequest) => onboarding.saveStep(request),
    onSuccess: (state) => {
      queryClient.setQueryData(onboardingKeys.state(), state);
    },
  });
}
