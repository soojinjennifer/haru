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
 *
 * ⭐ `S4-H4` — 시작을 막는 두 응답 (`D4-145` CP-15 ⓐ · NB-16, Spec §21.1 · §21.2):
 * - **`SESSION_ALREADY_ACTIVE`** → `details.sessionId` 로 Detail **1건** 조회. `ready` 면 그 세션을 성공처럼 넘겨
 *   일반 시작과 **같은 push** 로 그 ready 화면에 간다(`D4-146`, 새 생성 요청 0). `recording`/`paused` 면 원래 오류를
 *   그대로 실패로 넘긴다(시트 안 `SESSION_ALREADY_ACTIVE` 문구 · 이동 0 — 그 녹음은 시작한 탭·기기에 있다,
 *   정리는 서버 요구 `P4B-BIP-07`). Detail 조회가 실패하면 그 오류로 실패한다 → 화면은 일반 실패 문구(`D4-146` Q4).
 * - **`ONBOARDING_INCOMPLETE`** → `me` 를 **이전 값을 유지한 채** 무효화·재조회 1건(`invalidateQueries` —
 *   `reset`/`remove` 는 `me` 가 비어 Guard 가 전체 화면 Spinner 를 그리므로 금지, T5). 받은 `me` 가 미완료면
 *   **아무것도 하지 않는다** — 기존 Route Guard 가 온보딩 구간으로 보낸다(이동 규칙은 한 곳, T6). 여전히
 *   `completed` 면 원래 오류로 실패한다(문구만 · 이동 0 · 자동 재조회 반복 0).
 * - 두 경우 모두 이 과정은 **mutation 안**에서 일어나므로 `isPending` 이 끊기지 않는다 (T1). 이동하는 경우
 *   실패 콜백을 부르지 않아 오류가 한 프레임도 그려지지 않는다 (T2).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import {
  IdSchema,
  type CreateSessionRequest,
  type ErrorCode,
  type MeResponse,
  type ReadingContext,
  type SessionSummary,
} from '@haru/contracts';

import { meKeys, useCurrentChildId } from '../me';
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

/**
 * 시작 결과. `redirecting` = 서버가 온보딩 미완료라 했고 다시 받은 `me` 도 그렇다 — Route Guard 가 이동한다.
 */
type StartOutcome =
  { readonly kind: 'session'; readonly session: SessionSummary } | { readonly kind: 'redirecting' };

export function useCreateSession(
  onSuccess: (session: SessionSummary) => void,
  /** 실패 시 — 인자는 화면 문구를 고를 오류 코드(전송 실패면 `undefined`). */
  onFailed?: (errorCode: ErrorCode | undefined) => void,
): CreateSessionMutation {
  const { sessions } = useApiClients();
  const queryClient = useQueryClient();
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
      try {
        const response = await sessions.create({ body }, { idempotencyKey: intent.idempotencyKey });
        return { kind: 'session', session: response.session } satisfies StartOutcome;
      } catch (error) {
        if (!isHaruApiError(error)) throw error;

        if (error.code === 'SESSION_ALREADY_ACTIVE') {
          const sessionId = IdSchema.safeParse(error.details?.['sessionId']);
          if (!sessionId.success) throw error;
          // 조회 실패는 그 오류로 실패한다 — 화면은 일반 실패 문구 (`D4-146` Q4)
          const active = await sessions.getDetail({ sessionId: sessionId.data });
          if (active.status === 'ready') {
            return { kind: 'session', session: active } satisfies StartOutcome;
          }
          throw error;
        }

        if (error.code === 'ONBOARDING_INCOMPLETE') {
          // 이전 값을 유지한 채 다시 받는다 (T5) — 활성 `me` 구독이 있으면 그 재조회 1건을 기다린다
          await queryClient.invalidateQueries({ queryKey: meKeys.detail(), exact: true });
          const me = queryClient.getQueryData<MeResponse>(meKeys.detail());
          if (me !== undefined && me.onboardingStatus !== 'completed') {
            return { kind: 'redirecting' } satisfies StartOutcome;
          }
          throw error;
        }

        throw error;
      }
    },
    onSuccess: (outcome: StartOutcome) => {
      pending.current = null;
      // 온보딩 이동은 Route Guard 가 한다 (T6) — 여기서는 이동도 실패 표시도 하지 않는다
      if (outcome.kind === 'session') onSuccess(outcome.session);
    },
    onError: (error: unknown) => {
      onFailed?.(isHaruApiError(error) ? error.code : undefined);
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
