/**
 * `useDeleteSessionRecording` — 세션 녹음 삭제 Mutation (Stage 8 FR-21 · Plan §5.2 · §5.3, AC-8-21~25).
 *
 * ```
 * RecordingList → useDeleteSessionRecording → dataManagementApi.deleteSessionRecording (IK) → Mock | Http
 *                                            └ (서버 확정 후) SessionRecorderEnvironment.deleteLocalRecording
 *                                                              = UploadQueue 취소 + 로컬 청크 삭제
 * ```
 *
 * ── 순서 (rules/architecture §7 · Plan §5.3 — Stage 4 `Discard` 와 같은 규칙) ──
 * 1. **오프라인이면 보내지 않는다** — `NetworkError` 로 끝낸다 (요청 0 · 로컬 보존). 삭제는 SessionOutbox 대상이 아니다
 *    (되돌릴 수 없는 행위를 백그라운드에서 지연 실행하지 않는다).
 * 2. 서버 요청 (`Idempotency-Key` = 세션별로 보관 — 실패 후 다시 누르면 **같은 키**를 쓰고, 확정되면 비운다)
 * 3. **확정 응답 뒤에만** 로컬 삭제. `RECORDING_DELETED`(이미 삭제 · 만료)도 서버에는 오디오가 없다는 확정이므로
 *    오류가 아니라 같은 결과로 다룬다 (AC-8-24) — 로컬 사본도 지운다(올려도 서버가 거부한다).
 *    실패 · 오프라인이면 로컬을 건드리지 않는다.
 * 4. 캐시: 목록의 그 행만 `deleted`(만료면 `expired`) 로 바꾸고(위치 이동 0 — Spec §2.3.1) 요약 · 세션 상세 · 목록을 무효화한다
 *    (`recordingsCount` 가 줄어든다 — `VG8-A-04`).
 *
 * 로컬 삭제가 실패해도 서버 삭제는 끝났다 — 화면은 성공으로 보이고 오류는 로그에만 남긴다(세션 id · 제목 0 — Plan §5.5).
 */
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import {
  RecordingDeletedDetailsSchema,
  type ErrorCode,
  type ListSessionsResponse,
  type UploadStatus,
} from '@haru/contracts';
import { useRef } from 'react';

import { dataManagementKeys, recordingSessionsKey } from '../../../entities/data-management';
import { useCurrentChildId } from '../../../entities/me';
import { sessionKeys, useOptionalSessionRecorderEnvironment } from '../../../entities/session';
import { useApiClients } from '../../../shared/api/context';
import { isHaruApiError, isNetworkError, NetworkError } from '../../../shared/api/helpers';
import { createIdempotencyKey } from '../../../shared/lib/idempotency';
import { errorName, logger } from '../../../shared/lib/logger';

/** 서버가 확정한 결과 — 행이 이 상태로 바뀐다. */
export interface RecordingDeletionResult {
  readonly sessionId: string;
  readonly uploadStatus: Extract<UploadStatus, 'deleted' | 'expired'>;
  readonly deletedAt: string | null;
}

export interface UseDeleteSessionRecordingOptions {
  /** 테스트 주입 지점. 주지 않으면 조립 지점의 녹음 환경(`deleteLocalRecording`)을 쓴다. 조립이 없으면 로컬 정리 0. */
  deleteLocalRecording?: ((sessionId: string) => Promise<void>) | undefined;
  /** 테스트 주입 지점 — 연결 상태. 주지 않으면 `navigator.onLine`. */
  isOnline?: (() => boolean) | undefined;
}

export interface DeleteSessionRecordingMutation {
  remove: (
    sessionId: string,
    callbacks: {
      onSuccess: (result: RecordingDeletionResult) => void;
      onError: (failure: { offline: boolean; code: ErrorCode | undefined }) => void;
    },
  ) => void;
  isPending: boolean;
}

function browserOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

export function useDeleteSessionRecording(
  options: UseDeleteSessionRecordingOptions = {},
): DeleteSessionRecordingMutation {
  const { dataManagement } = useApiClients();
  const childId = useCurrentChildId();
  const queryClient = useQueryClient();
  const recorderEnvironment = useOptionalSessionRecorderEnvironment();
  // 세션별 IK — 같은 세션 재시도는 같은 키 (서버가 최초 응답을 재생한다).
  const keys = useRef(new Map<string, string>());

  const deleteLocal =
    options.deleteLocalRecording ??
    (recorderEnvironment === null
      ? null
      : (sessionId: string) => recorderEnvironment.deleteLocalRecording(sessionId));
  const isOnline = options.isOnline ?? browserOnline;

  const mutation = useMutation({
    // TanStack 기본(`online`)은 오프라인이면 mutation 을 **보류**했다가 연결되면 보낸다 — 되돌릴 수 없는 삭제를
    // 지연 실행하게 된다 (Plan §5.3 금지). `always` 로 두고 아래에서 직접 오프라인을 판정해 보내지 않는다.
    networkMode: 'always',
    mutationFn: async (sessionId: string): Promise<RecordingDeletionResult> => {
      if (!isOnline()) throw new NetworkError('Device is offline — deletion was not sent.');

      let key = keys.current.get(sessionId);
      if (key === undefined) {
        key = createIdempotencyKey();
        keys.current.set(sessionId, key);
      }

      let result: RecordingDeletionResult;
      try {
        const response = await dataManagement.deleteSessionRecording(
          { sessionId },
          { idempotencyKey: key },
        );
        result = {
          sessionId,
          uploadStatus: 'deleted',
          deletedAt: response.completedAt ?? response.requestedAt,
        };
      } catch (error: unknown) {
        if (!isHaruApiError(error) || error.code !== 'RECORDING_DELETED') throw error;
        const details = RecordingDeletedDetailsSchema.safeParse(error.details ?? {});
        const expired = details.success && details.data.reason === 'expired';
        result = { sessionId, uploadStatus: expired ? 'expired' : 'deleted', deletedAt: null };
      }

      // 서버 확정 뒤에만 — 로컬 청크 삭제 + 업로드 큐 취소 (AC-8-23).
      keys.current.delete(sessionId);
      if (deleteLocal !== null) {
        try {
          await deleteLocal(sessionId);
        } catch (error: unknown) {
          logger.error('recording_local_delete_failed', { errorName: errorName(error) });
        }
      }
      return result;
    },
    onSuccess: (result) => {
      if (childId !== undefined) {
        queryClient.setQueryData<InfiniteData<ListSessionsResponse>>(
          recordingSessionsKey(childId),
          (data) =>
            data === undefined
              ? data
              : {
                  ...data,
                  pages: data.pages.map((page) => ({
                    ...page,
                    items: page.items.map((item) =>
                      item.id !== result.sessionId || item.recording === null
                        ? item
                        : {
                            ...item,
                            recording: {
                              ...item.recording,
                              uploadStatus: result.uploadStatus,
                              expiresAt: null,
                              deletedAt: result.deletedAt,
                            },
                          },
                    ),
                  })),
                },
        );
      }
      void queryClient.invalidateQueries({ queryKey: dataManagementKeys.summary() });
      void queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: sessionKeys.detail(result.sessionId) });
      void queryClient.invalidateQueries({
        queryKey: sessionKeys.completionDetail(result.sessionId),
      });
    },
  });

  return {
    remove: (sessionId, callbacks) => {
      if (mutation.isPending) return; // 연타 · 이중 요청 0 (AC-8-22)
      mutation.mutate(sessionId, {
        onSuccess: callbacks.onSuccess,
        onError: (error: unknown) => {
          callbacks.onError({
            offline: isNetworkError(error),
            code: isHaruApiError(error) ? error.code : undefined,
          });
        },
      });
    },
    isPending: mutation.isPending,
  };
}
