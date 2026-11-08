/**
 * `useSelectActivityOption` — `POST /v1/activity-cards/:cardId/selection` (FR-07 · FR-08).
 *
 * ```
 * (feature) → useSelectActivityOption → activityApi.selectOption → Mock | Http
 * ```
 *
 * **세션을 만들지 않는다.** 이 호출은 선택지와 읽기 상황을 확정하고 Prompt 세트를 돌려받을
 * 뿐이다. 세션 생성(`POST /v1/sessions`)은 `entities/session` 의 `useCreateSession` 이며, Stage 4
 * `S4-F1` 의 덱이 **이 호출이 성공한 뒤에** 그것을 부른다 (`select(vars, onSelected)` — AC-3-24 · AC-4-38).
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
  /**
   * `onSelected` — 이 호출 하나에만 붙는 성공 콜백 (예: 이어서 세션을 만든다).
   * `onFailed` — 이 호출 하나에만 붙는 실패 콜백 (`S4-H3` `D4-125` — 호출한 쪽의 연속 `loading` 을 끝낸다).
   */
  select: (
    variables: SelectActivityOptionVariables,
    onSelected?: (selection: ActivityCardSelection) => void,
    onFailed?: () => void,
  ) => void;
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
    select: (variables, onSelected, onFailed) => {
      mutation.mutate(variables, {
        ...(onSelected === undefined ? {} : { onSuccess: onSelected }),
        ...(onFailed === undefined ? {} : { onError: onFailed }),
      });
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
