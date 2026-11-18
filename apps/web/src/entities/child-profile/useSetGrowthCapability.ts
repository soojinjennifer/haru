/**
 * `useSetGrowthCapability` — `PUT /v1/children/:childId/growth-capability` Mutation hook
 * (Stage 6 Plan §5.2 · §7 C-5, PRD FR-06 · §7.3).
 *
 * - 온보딩 발전 역량 화면과 설정 발전 역량 화면이 **같이** 쓴다 (`D6-6` — 같은 컴포넌트 2모드).
 * - 진행 중 중복 호출은 무시한다 — 요청 1건. 성공 뒤의 호출도 무시한다 — 두 모드 모두 성공하면 화면을 떠난다
 *   (`S6-D` e2e 더블 탭: 첫 응답 직후·이동 전에 두 번째 탭이 들어와 PUT 2건 + `navigate(-1)` 2회 → Home 까지
 *   밀려났다. `useSubmitSurveyUpdate` 와 같은 규칙 — H6-5.6 ①). 실패 뒤에만 다시 보낼 수 있다.
 * - 성공: 응답 `ChildProfile` 로 프로필 캐시를 채우고, Home 집계·오늘 카드를 무효화한다 — 서버가 다음 카드를
 *   다시 계산할 수 있다 (반영 시점은 `P6-BIP-04`·`10`).
 * - 실패: 캐시를 건드리지 않는다 — 이전 값이 유지된다 (AC-6-31, 낙관적 갱신 없음).
 * - `score: null` 역량도 보낼 수 있다 (`N6-11` ⓐ).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type { Capability, ChildProfile, ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { activityCardKeys } from '../activity-card';
import { homeKeys } from '../home';

import { childProfileKeys } from './childProfileKeys';
import { readMutationFailure } from './mutationState';

export interface SetGrowthCapabilityMutation {
  select: (capability: Capability) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  profile: ChildProfile | undefined;
  reset: () => void;
}

export function useSetGrowthCapability(
  childId: string,
  callbacks: { onSaved?: (profile: ChildProfile) => void } = {},
): SetGrowthCapabilityMutation {
  const { children } = useApiClients();
  const queryClient = useQueryClient();
  const inFlight = useRef(false);

  const mutation = useMutation({
    mutationKey: childProfileKeys.growthCapability(childId),
    mutationFn: (capability: Capability) =>
      children.setGrowthCapability({ childId, body: { capability } }),
    onSuccess: (profile: ChildProfile) => {
      queryClient.setQueryData(childProfileKeys.detail(childId), profile);
      void queryClient.invalidateQueries({ queryKey: homeKeys.all });
      void queryClient.invalidateQueries({ queryKey: activityCardKeys.all });
      callbacks.onSaved?.(profile);
    },
    onError: () => {
      // 실패 뒤에만 다시 보낼 수 있다 — 성공하면 이 화면의 저장은 끝났다.
      inFlight.current = false;
    },
  });

  const failure = readMutationFailure(mutation.error);

  return {
    select: (capability) => {
      if (inFlight.current) return;
      inFlight.current = true;
      mutation.mutate(capability);
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    errorCode: failure.errorCode,
    isOffline: failure.isOffline,
    profile: mutation.data,
    reset: () => {
      mutation.reset();
    },
  };
}
