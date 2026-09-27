/**
 * `useOnboardingState` — `GET /v1/onboarding` Query hook.
 *
 * ```
 * OnboardingWizard → useOnboardingState → onboardingApi.getState
 *                  → MockOnboardingApi | HttpOnboardingApi
 * ```
 *
 * **Trial(미인증) 구간에서는 호출하지 않는다** (`enabled: false`) — 가입 전에는 네트워크 요청이
 * 0건이어야 한다 (C-12 · AC-2-27). 그 구간의 문항은 기본 instrument 에서 온다.
 *
 * 응답의 `instrument` 가 문항의 출처다 (결정 D-A ③). 화면은 문항을 하드코딩하지 않는다.
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, OnboardingState } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { onboardingKeys } from './onboardingKeys';

export interface UseOnboardingStateOptions {
  /** 인증·동의가 끝난 뒤에만 켠다. 기본값은 `false` (Trial 보호). */
  enabled?: boolean;
}

export interface UseOnboardingStateResult {
  state: OnboardingState | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useOnboardingState(
  options: UseOnboardingStateOptions = {},
): UseOnboardingStateResult {
  const { onboarding } = useApiClients();
  const enabled = options.enabled ?? false;

  const query = useQuery({
    queryKey: onboardingKeys.state(),
    enabled,
    queryFn: ({ signal }) => onboarding.getState({ signal }),
  });

  const error: unknown = query.error;

  return {
    state: query.data,
    isPending: enabled && query.isPending,
    isError: query.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void query.refetch();
    },
  };
}
