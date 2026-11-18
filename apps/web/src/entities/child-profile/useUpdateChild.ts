/**
 * `useUpdateChild` — `PATCH /v1/children/:childId` Mutation hook (Stage 6 Plan §5.2 · §7 C-4, PRD §7.8).
 *
 * ```
 * (feature child-profile-edit) → useUpdateChild → childrenApi.update → MockChildrenApi | HttpChildrenApi
 * ```
 *
 * - **바뀐 필드만** body 로 보내는 것은 호출한 feature 의 책임이다 (AC-6-19). 이 hook 은 받은 body 를 그대로 보낸다.
 * - 진행 중 중복 호출은 무시한다 — 요청 1건 (AC-6-19).
 * - 성공: 응답 `ChildProfile` 로 프로필 캐시를 채우고(`setQueryData`) `me` 를 무효화한다 — 회고 카드 제목·Home
 *   문구·세션 버블 슬롯이 `me.child.firstName` 의 새 이름을 쓴다 (AC-6-22, Plan §5.2).
 * - 입력은 **메모리에만** 있다 — 어떤 저장소에도 쓰지 않는다 (AC-6-21 · `N6-07`).
 * - 화면 이동·Toast 는 호출한 feature 가 한다 (`onUpdated`).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type { ChildProfile, ErrorCode, UpdateChildRequest } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { meKeys } from '../me';

import { childProfileKeys } from './childProfileKeys';
import { readMutationFailure } from './mutationState';

export interface UpdateChildMutation {
  update: (body: UpdateChildRequest) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  /** `VALIDATION_FAILED` 의 필드 이름 (AC-6-20). */
  invalidFields: readonly string[];
  profile: ChildProfile | undefined;
  reset: () => void;
}

export function useUpdateChild(
  childId: string,
  callbacks: { onUpdated?: (profile: ChildProfile) => void } = {},
): UpdateChildMutation {
  const { children } = useApiClients();
  const queryClient = useQueryClient();
  const inFlight = useRef(false);

  const mutation = useMutation({
    mutationKey: childProfileKeys.update(childId),
    mutationFn: (body: UpdateChildRequest) => children.update({ childId, body }),
    onSuccess: (profile: ChildProfile) => {
      queryClient.setQueryData(childProfileKeys.detail(childId), profile);
      void queryClient.invalidateQueries({ queryKey: meKeys.all });
      callbacks.onUpdated?.(profile);
    },
    onSettled: () => {
      inFlight.current = false;
    },
  });

  const failure = readMutationFailure(mutation.error);

  return {
    update: (body) => {
      if (inFlight.current) return;
      inFlight.current = true;
      mutation.mutate(body);
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    errorCode: failure.errorCode,
    isOffline: failure.isOffline,
    invalidFields: failure.invalidFields,
    profile: mutation.data,
    reset: () => {
      mutation.reset();
    },
  };
}
