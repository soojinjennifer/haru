/**
 * `useSelectActivityOption` — `POST /v1/activity-cards/:cardId/selection` (FR-07 · FR-08).
 *
 * ```
 * (feature) → useSelectActivityOption → activityApi.selectOption → Mock | Http
 * ```
 *
 * **세션을 만들지 않는다.** 이 호출은 선택지와 읽기 상황을 확정하고 Prompt 세트를 돌려받을
 * 뿐이며, `POST /v1/sessions` 는 Stage 4 다 (`CONFIRMED (D-3)` · AC-3-15).
 *
 * `Idempotency-Key` 대상이 아니다 (Plan §7.2 IK 열 `—`).
 */
import { useMutation } from '@tanstack/react-query';
import type {
  ActivityCardSelection,
  ErrorCode,
  SelectActivityOptionRequest,
} from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

export interface SelectActivityOptionVariables {
  cardId: string;
  selection: SelectActivityOptionRequest;
}

export interface SelectActivityOptionMutation {
  select: (variables: SelectActivityOptionVariables) => void;
  selection: ActivityCardSelection | undefined;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  reset: () => void;
}

export function useSelectActivityOption(
  onSuccess?: (selection: ActivityCardSelection) => void,
): SelectActivityOptionMutation {
  const { activities } = useApiClients();

  const mutation = useMutation({
    mutationFn: (variables: SelectActivityOptionVariables) =>
      activities.selectOption({ cardId: variables.cardId, selection: variables.selection }),
    ...(onSuccess === undefined ? {} : { onSuccess }),
  });

  const error: unknown = mutation.error;

  return {
    select: (variables) => {
      mutation.mutate(variables);
    },
    selection: mutation.data,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    reset: () => {
      mutation.reset();
    },
  };
}
