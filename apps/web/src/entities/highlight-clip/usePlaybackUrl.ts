/**
 * `usePlaybackUrl` — 하이라이트 클립 재생 URL (Stage 7 C7-8 · `S7-E`, FR-18).
 *
 * ```
 * (features/highlight-clip-player) → usePlaybackUrl → highlightClipApi.getPlaybackUrl → Mock | Http
 * ```
 *
 * 자동 조회하는 `useQuery` 가 아니다 — **재생 탭 전에는 호출하지 않는다** (`preload="none"`, AC-7-49).
 * 그래서 query cache 를 저장소로만 쓰는 명령형 핸들 3개를 돌려준다.
 *
 * | 메서드 | 동작 |
 * |---|---|
 * | `peek(clipId)` | 캐시에 있고 만료 30초 이상 남은 URL — **동기** (탭 핸들러 안에서 바로 `play()` 하도록) |
 * | `fetch(clipId)` | 서버에서 새로 받는다 (stale 0). 첫 조회 · 재발급 모두 이것 |
 * | `discard(clipId)` | 만료·미디어 오류로 버린 URL 을 캐시에서 지운다 |
 *
 * - URL 은 로그·영속 저장 금지 — 메모리 query cache 에만 있고 로그아웃 `clear()` 가 지운다 (Plan §5.6).
 * - 자동 재시도 0 — 재발급 1회 규칙은 feature 상태 머신이 센다.
 */
import { useQueryClient } from '@tanstack/react-query';
import type { SignedMediaUrl } from '@haru/contracts';
import { useMemo } from 'react';

import { useApiClients } from '../../shared/api/context';

import { clipKeys } from './clipKeys';
import { isSignedUrlReusable } from './signedUrl';

export interface PlaybackUrlHandle {
  peek(clipId: string): SignedMediaUrl | undefined;
  fetch(clipId: string): Promise<SignedMediaUrl>;
  discard(clipId: string): void;
}

/** @param now 기준 시각 (epoch ms) — 호출부가 주입한다 (테스트 결정성). */
export function usePlaybackUrl(now: () => number): PlaybackUrlHandle {
  const queryClient = useQueryClient();
  const { highlightClips } = useApiClients();

  return useMemo<PlaybackUrlHandle>(
    () => ({
      peek(clipId) {
        const cached = queryClient.getQueryData<SignedMediaUrl>(clipKeys.playback(clipId));
        return cached !== undefined && isSignedUrlReusable(cached, now()) ? cached : undefined;
      },
      fetch(clipId) {
        return queryClient.fetchQuery({
          queryKey: clipKeys.playback(clipId),
          queryFn: ({ signal }) => highlightClips.getPlaybackUrl({ clipId }, { signal }),
          staleTime: 0,
          retry: false,
        });
      },
      discard(clipId) {
        queryClient.removeQueries({ queryKey: clipKeys.playback(clipId), exact: true });
      },
    }),
    [queryClient, highlightClips, now],
  );
}
