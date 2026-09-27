/**
 * `useUpdateCaregiver` — `PATCH /v1/me` Mutation hook (결정 **D-16**).
 *
 * 온보딩 Step 1 은 **화면 1개 / 요청 2개**다. 보호자 소유 데이터(관계·타임존)는 이 hook 으로,
 * 아이 정보는 `useSaveOnboardingStep` 으로 간다. 섞지 않아야 "동의 기록 전 아동 데이터 0건"
 * (AC-2-13)을 요청 단위로 검증할 수 있다.
 */
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { MeResponse, UpdateCaregiverRequest } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';

import { meKeys } from './meKeys';

export type UpdateCaregiverMutation = UseMutationResult<
  MeResponse,
  unknown,
  UpdateCaregiverRequest
>;

export function useUpdateCaregiver(): UpdateCaregiverMutation {
  const { me } = useApiClients();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateCaregiverRequest) => me.update(request),
    onSuccess: (response) => {
      queryClient.setQueryData(meKeys.detail(), response);
    },
  });
}
