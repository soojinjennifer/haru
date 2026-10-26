/**
 * `useCreateSession` — `POST /v1/sessions` Mutation hook (Stage 4 Plan §9.3, FR-09, `D-3` 해제).
 *
 * ```
 * (feature) → useCreateSession → sessionApi.create → MockSessionApi | HttpSessionApi
 * ```
 *
 * - **`Idempotency-Key` 필수** (`API_CONTRACTS` §3.2). 키는 "제출 의도" 단위다 — 같은 입력의 재시도는
 *   **같은 키 + 같은 `clientSessionKey`** 를 다시 보낸다(서버가 같은 세션을 돌려준다). 입력이 바뀌면
 *   (다른 책·다른 Reading Context) 새 키를 만든다 — 같은 키에 다른 body 는 `IDEMPOTENCY_KEY_REUSED` 다.
 * - `childId` 는 `useCurrentChildId` 가 준다. 없으면(온보딩 전) 요청하지 않는다.
 * - 화면 이동은 **호출한 feature 가** 한다 (`onSuccess` 의 세션 id).
 */
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import type {
  CreateSessionRequest,
  ErrorCode,
  ReadingContext,
  SessionSummary,
} from '@haru/contracts';

import { useCurrentChildId } from '../me';
import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { createSystemClock } from '../../shared/lib/clock';
import { createIdempotencyKey } from '../../shared/lib/idempotency';

/** 화면이 고르는 부분 — `childId` · 키 · 시각은 hook 이 채운다. */
export interface StartSessionInput {
  mode: CreateSessionRequest['mode'];
  activityCardOptionId: string | null;
  bookId: string | null;
  childBookId: string | null;
  readingContext: ReadingContext | null;
  customTime?: string | undefined;
}

export interface CreateSessionMutation {
  create: (input: StartSessionInput) => void;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  reset: () => void;
}

interface PendingIntent {
  readonly fingerprint: string;
  readonly idempotencyKey: string;
  readonly clientSessionKey: string;
  readonly readyAt: string;
}

const clock = createSystemClock();

export function useCreateSession(
  onSuccess: (session: SessionSummary) => void,
  onFailed?: () => void,
): CreateSessionMutation {
  const { sessions } = useApiClients();
  const childId = useCurrentChildId();
  /** 진행 중인 제출 의도. 성공하면 비운다. */
  const pending = useRef<PendingIntent | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: StartSessionInput) => {
      if (childId === undefined) throw new Error('child profile is not ready');
      const fingerprint = JSON.stringify(input);
      if (pending.current?.fingerprint !== fingerprint) {
        pending.current = {
          fingerprint,
          idempotencyKey: createIdempotencyKey(),
          clientSessionKey: createIdempotencyKey(),
          readyAt: clock.nowIso(),
        };
      }
      const intent = pending.current;
      const body: CreateSessionRequest = {
        childId,
        mode: input.mode,
        activityCardOptionId: input.activityCardOptionId,
        bookId: input.bookId,
        childBookId: input.childBookId,
        readingContext: input.readingContext,
        ...(input.customTime === undefined ? {} : { customTime: input.customTime }),
        clientSessionKey: intent.clientSessionKey,
        readyAt: intent.readyAt,
      };
      const response = await sessions.create({ body }, { idempotencyKey: intent.idempotencyKey });
      return response.session;
    },
    onSuccess: (session) => {
      pending.current = null;
      onSuccess(session);
    },
    onError: () => {
      onFailed?.();
    },
  });

  const error: unknown = mutation.error;

  return {
    create: (input) => {
      mutation.mutate(input);
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    reset: () => {
      mutation.reset();
    },
  };
}
