/**
 * `useCloseReadySession` — ready 화면 닫기 (`D4-57`, AC-4-136, Figma `300:1318`).
 *
 * ```
 * (feature) → useCloseReadySession → sessionApi.transition({ to: 'abandoned' }) → Mock | Http
 * ```
 *
 * 녹음 전이라 **확인 없이** `ready → abandoned`(caregiver, 기존 전이표 행) 1건을 보낸다.
 * ⚠ `RecordingController.discard()` 를 쓰지 않는 이유: 컨트롤러는 **전송 실패에도 로컬 상태를
 * `abandoned` 로 먼저 닫는다**(오프라인 Discard 를 outbox 에 적재하는 설계 — `D4-13`). ready 닫기는
 * 반대로 **실패하면 화면에 머물러야** 한다(AC-4-136 ④) — 그래서 서버 확정 응답을 받은 뒤에만
 * 이동하는 단일 요청으로 둔다. 컨트롤러의 ready 타이머는 화면 이탈 시 `dispose()` 가 정리한다.
 * 같은 의도의 재시도는 같은 `Idempotency-Key` 를 쓴다.
 */
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import type { ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { createSystemClock } from '../../shared/lib/clock';
import { createIdempotencyKey } from '../../shared/lib/idempotency';

export interface CloseReadySessionMutation {
  close: () => void;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
}

const clock = createSystemClock();

export function useCloseReadySession(
  sessionId: string,
  callbacks: { onClosed: () => void; onFailed: () => void },
): CloseReadySessionMutation {
  const { sessions } = useApiClients();
  const pendingKey = useRef<string | null>(null);
  const occurredAt = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      pendingKey.current ??= createIdempotencyKey();
      occurredAt.current ??= clock.nowIso();
      return sessions.transition(
        { sessionId, body: { to: 'abandoned', occurredAt: occurredAt.current } },
        { idempotencyKey: pendingKey.current },
      );
    },
    onSuccess: () => {
      pendingKey.current = null;
      occurredAt.current = null;
      callbacks.onClosed();
    },
    onError: () => {
      callbacks.onFailed();
    },
  });

  const error: unknown = mutation.error;

  return {
    close: () => {
      if (mutation.isPending) return;
      mutation.mutate();
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
  };
}
