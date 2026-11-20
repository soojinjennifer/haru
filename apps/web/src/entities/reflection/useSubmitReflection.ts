/**
 * `useSubmitReflection` — `POST /v1/sessions/:sessionId/reflection` Mutation hook (Stage 5 Plan §5.2, FR-12).
 *
 * ```
 * (feature) → useSubmitReflection → reflectionApi.submit → MockReflectionApi | HttpReflectionApi
 * ```
 *
 * - **`Idempotency-Key` 필수**. 키는 **body 단위**다 (Plan `R5-04`, AC-5-26): 같은 입력의 재시도 = 같은 키,
 *   입력을 바꾸면 새 키 — 같은 키에 다른 body 는 `IDEMPOTENCY_KEY_REUSED` 다.
 * - 진행 중 중복 호출은 무시한다 — 요청 1건 (AC-5-24).
 * - 입력(특히 `note`)은 **메모리에만** 있다 — 이 hook 은 어떤 저장소에도 쓰지 않는다 (`N5-17`, AC-5-22 · 27).
 * - 성공하면 캐시된 세션 상세(`sessionKeys.detail` · `completionDetail`)의 `reflection` 을 응답으로 채운다 —
 *   재진입 시 읽기 전용 표시(`N5-08` ⓐ)가 재조회 없이 맞는다.
 * - 화면 이동·Toast 는 **호출한 feature 가** 한다 (`onSubmitted`).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type {
  ErrorCode,
  Reflection,
  SessionDetail,
  SubmitReflectionRequest,
} from '@haru/contracts';

import { activityCardKeys } from '../activity-card';
import { sessionKeys } from '../session';
import { progressKeys } from '../weekly-progress';
import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { createIdempotencyKey } from '../../shared/lib/idempotency';

import { reflectionKeys } from './reflectionKeys';

export interface SubmitReflectionMutation {
  submit: (body: SubmitReflectionRequest) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  reflection: Reflection | undefined;
  reset: () => void;
}

interface PendingIntent {
  readonly fingerprint: string;
  readonly idempotencyKey: string;
}

export function useSubmitReflection(
  sessionId: string,
  callbacks: {
    onSubmitted?: (reflection: Reflection) => void;
    /** 인자 = 화면 문구를 고를 오류 코드 (envelope 없는 실패면 `undefined`) · 전송 실패(오프라인) 여부. */
    onFailed?: (errorCode: ErrorCode | undefined, offline: boolean) => void;
  } = {},
): SubmitReflectionMutation {
  const { reflections } = useApiClients();
  const queryClient = useQueryClient();
  /** 마지막 제출 의도 — 성공하면 비운다. 메모리에만 있다. */
  const pending = useRef<PendingIntent | null>(null);
  const inFlight = useRef(false);

  const mutation = useMutation({
    mutationKey: reflectionKeys.submit(sessionId),
    mutationFn: (body: SubmitReflectionRequest) => {
      const fingerprint = JSON.stringify(body);
      if (pending.current?.fingerprint !== fingerprint) {
        pending.current = { fingerprint, idempotencyKey: createIdempotencyKey() };
      }
      return reflections.submit(
        { sessionId, body },
        { idempotencyKey: pending.current.idempotencyKey },
      );
    },
    onSuccess: (reflection: Reflection) => {
      pending.current = null;
      for (const key of [sessionKeys.detail(sessionId), sessionKeys.completionDetail(sessionId)]) {
        queryClient.setQueryData<SessionDetail>(key, (current) =>
          current === undefined ? current : { ...current, reflection },
        );
      }
      // 회고는 다음 추천의 신호다(예: *Tricky today* → 난이도 하향, AC-6-40) — 오늘 카드를 즉시 무효화해 Home 이
      // 돌아오자마자 다시 받게 한다 (`S6-G` G-10, `D6-9` ④ · `QA-6-006`). 서버 반영 시점은 `P6-BIP-04`.
      void queryClient.invalidateQueries({ queryKey: activityCardKeys.all });
      // Stage 7 Plan §5.2 — 주간 Progress 는 회고 저장 연쇄 지점에서 무효화한다 (`S7-C`).
      void queryClient.invalidateQueries({ queryKey: progressKeys.all });
      callbacks.onSubmitted?.(reflection);
    },
    onError: (error: unknown) => {
      callbacks.onFailed?.(isHaruApiError(error) ? error.code : undefined, isNetworkError(error));
    },
    onSettled: () => {
      inFlight.current = false;
    },
  });

  const error: unknown = mutation.error;

  return {
    submit: (body) => {
      if (inFlight.current) return;
      inFlight.current = true;
      mutation.mutate(body);
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    reflection: mutation.data,
    reset: () => {
      mutation.reset();
    },
  };
}
