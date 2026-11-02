/**
 * 완료 화면 데이터 (Figma `29:62`, AC-4-58 · 59 · 60 · 139 · 140).
 *
 * ```
 * Submit → useRememberSessionCompletion(전이 응답을 캐시에 둔다) → 이동
 * (feature) → useSessionCompletion → 전이 응답 | sessionApi.getDetail(재진입)
 * ```
 *
 * - 완료 버블 우선순위 = 전이 응답 → `SessionDetail.completionBubble` (`D4-88`, `API_CONTRACTS.md` §3.2.3).
 *   `text` 가 없으면 `subtext` 가 있어도 버블이 없다 (`D4-95`). fallback 문구 0건 — `rules/architecture.md` §8.
 * - 스티커는 재진입하면 `SessionDetail.sticker` 로 같은 지급을 읽는다 — 다시 만들지 않는다 (FR-19).
 * - 전이 응답이 있으면 조회하지 않는다. 오프라인 제출(`result: null`)도 같다 — 지급을 아직 모르므로
 *   칩·버블이 없다 (`D4-88` 현행 수용).
 * - `leave` — 조회해 보니 끝난 적 없는 세션이면(`ready` · `abandoned`) 완료 화면을 그리지 않는다 (`D4-91`).
 *   전이 응답이 기억된 경로는 판정하지 않는다. `recording` · `paused` 는 `S4-H2` 에서 판정한다 (AC-4-140 ⑤).
 */
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  SessionBubbleCopy,
  SessionStatus,
  SessionTransitionResult,
  StickerAward,
} from '@haru/contracts';
import { useCallback } from 'react';

import { useApiClients } from '../../shared/api/context';

import { sessionKeys } from './sessionKeys';

type CompletionResult = Pick<SessionTransitionResult, 'completionBubble' | 'stickerAward'>;

/** `/complete` 에 머물 수 없는 상태 (`D4-91`). */
const NOT_COMPLETED: ReadonlySet<SessionStatus> = new Set(['ready', 'abandoned']);

export function useRememberSessionCompletion() {
  const queryClient = useQueryClient();
  return useCallback(
    (sessionId: string, result: SessionTransitionResult | null | undefined) => {
      const remembered: CompletionResult = {
        completionBubble: result?.completionBubble ?? null,
        stickerAward: result?.stickerAward ?? null,
      };
      queryClient.setQueryData(sessionKeys.completionResult(sessionId), remembered);
    },
    [queryClient],
  );
}

export interface SessionCompletionBubble {
  text: string;
  subtext: string | null;
}

/** 표시 판정 — 주 문구가 없으면 버블이 없고(`D4-95`), 빈 보조 줄은 줄이 없다 (`D4-87`). 가공은 하지 않는다. */
export function selectCompletionBubble(
  copy: SessionBubbleCopy | undefined,
): SessionCompletionBubble | null {
  const text = copy?.text ?? null;
  if (text === null || text.length === 0) return null;
  const subtext = copy?.subtext ?? null;
  return { text, subtext: subtext === null || subtext.length === 0 ? null : subtext };
}

export interface UseSessionCompletionResult {
  sticker: StickerAward | null;
  bubble: SessionCompletionBubble | null;
  /** 끝난 적 없는 세션의 직접 진입 — 화면은 홈으로 돌려보낸다 (`D4-91`). */
  leave: boolean;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useSessionCompletion(sessionId: string): UseSessionCompletionResult {
  const { sessions } = useApiClients();

  const remembered = useQuery<CompletionResult>({
    queryKey: sessionKeys.completionResult(sessionId),
    queryFn: skipToken,
  }).data;

  const detail = useQuery({
    queryKey: sessionKeys.completionDetail(sessionId),
    queryFn: ({ signal }) => sessions.getDetail({ sessionId }, { signal }),
    enabled: remembered === undefined,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const fromTransition = remembered !== undefined;

  return {
    sticker: fromTransition ? (remembered.stickerAward ?? null) : (detail.data?.sticker ?? null),
    bubble: selectCompletionBubble(
      fromTransition ? remembered.completionBubble : detail.data?.completionBubble,
    ),
    leave: !fromTransition && detail.data !== undefined && NOT_COMPLETED.has(detail.data.status),
    isPending: !fromTransition && detail.isPending,
    isError: !fromTransition && detail.isError,
    refetch: () => {
      void detail.refetch();
    },
  };
}
