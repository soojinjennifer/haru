/**
 * `useSubmitSurveyUpdate` — `POST /v1/children/:childId/survey-update/submit` Mutation hook
 * (Stage 6 Plan §5.2 · §7 C-6, AC-6-27 · AC-6-28).
 *
 * - **`Idempotency-Key` 필수**. 키는 **body 단위**다 — 같은 답의 재시도 = 같은 키, 답을 바꾸면 새 키
 *   (같은 키 + 다른 body 는 `IDEMPOTENCY_KEY_REUSED`, Stage 5 `R5-04` 와 같은 규칙).
 * - 진행 중 중복 호출은 무시한다 — 요청 1건. **성공한 뒤의 호출도 무시한다** (Stage 6 `S6-C`): 성공 콜백이 화면을 옮기기
 *   전에 도착한 두 번째 탭(더블 탭)이 POST 를 한 번 더 보냈다(e2e 실측 — 같은 키라 서버는 재생하지만 요청은 2건).
 *   재시도는 **실패 뒤에만** 열린다.
 * - 성공: draft 캐시를 **제거**하고, 프로필을 **무효화**한다 — 응답 `ProfileResult` 에는 강점·growing edge 가 없어
 *   프로필 화면은 `GET /profile` 이 정본이다 (`D6-5`). Home 집계·오늘 카드도 무효화한다 (`P6-BIP-04`).
 * - 답은 메모리에만 있다 (`N6-07`). 화면 이동·Toast 는 호출한 feature 가 한다 (`onSubmitted`).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type { ErrorCode, ProfileResult, SubmitSurveyUpdateRequest } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { createIdempotencyKey } from '../../shared/lib/idempotency';
import { activityCardKeys } from '../activity-card';
import { homeKeys } from '../home';

import { childProfileKeys, surveyUpdateKeys } from './childProfileKeys';
import { readMutationFailure } from './mutationState';

export interface SubmitSurveyUpdateMutation {
  submit: (body: SubmitSurveyUpdateRequest) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  result: ProfileResult | undefined;
  reset: () => void;
}

interface PendingIntent {
  readonly fingerprint: string;
  readonly idempotencyKey: string;
}

export function useSubmitSurveyUpdate(
  childId: string,
  callbacks: { onSubmitted?: (result: ProfileResult) => void } = {},
): SubmitSurveyUpdateMutation {
  const { children } = useApiClients();
  const queryClient = useQueryClient();
  /** 마지막 제출 의도 — 성공하면 비운다. 메모리에만 있다. */
  const pending = useRef<PendingIntent | null>(null);
  const inFlight = useRef(false);

  const mutation = useMutation({
    mutationKey: surveyUpdateKeys.submit(childId),
    mutationFn: (body: SubmitSurveyUpdateRequest) => {
      const fingerprint = JSON.stringify(body);
      if (pending.current?.fingerprint !== fingerprint) {
        pending.current = { fingerprint, idempotencyKey: createIdempotencyKey() };
      }
      return children.submitSurveyUpdate(
        { childId, body },
        { idempotencyKey: pending.current.idempotencyKey },
      );
    },
    onSuccess: (result: ProfileResult) => {
      pending.current = null;
      queryClient.removeQueries({ queryKey: surveyUpdateKeys.state(childId) });
      void queryClient.invalidateQueries({ queryKey: childProfileKeys.detail(childId) });
      void queryClient.invalidateQueries({ queryKey: homeKeys.all });
      void queryClient.invalidateQueries({ queryKey: activityCardKeys.all });
      callbacks.onSubmitted?.(result);
    },
    onError: () => {
      // 실패 뒤에만 다시 보낼 수 있다 — 성공하면 이 흐름의 제출은 끝났다.
      inFlight.current = false;
    },
  });

  const failure = readMutationFailure(mutation.error);

  return {
    submit: (body) => {
      if (inFlight.current) return;
      inFlight.current = true;
      mutation.mutate(body);
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    errorCode: failure.errorCode,
    isOffline: failure.isOffline,
    result: mutation.data,
    reset: () => {
      mutation.reset();
    },
  };
}
