/**
 * `useClipPlayer` — 하이라이트 클립 재생 컨트롤러 (Stage 7 Plan §5.4 · Spec §2.5, `S7-E`, AC-7-49~54).
 *
 * 오디오 요소 **1개**를 목록 전체가 공유한다 → 동시 재생은 구조적으로 1개다 (AC-7-50). 상태는
 * `clipPlayerReducer` 가 갖고, 이 hook 은 부수 효과(URL 조회 · `src` · `play()` · 이벤트 구독)만 한다.
 *
 * 재생 순서 (탭 1회):
 * 1. 같은 클립이 이미 붙어 있으면 `play()` 만 — 탭 핸들러 안에서 **동기**로 부른다 (사용자 제스처 유지).
 * 2. 아니면 캐시의 유효 URL(`peek`, 만료 30초 전까지)로 바로 붙이고, 없으면 `fetch` 후 붙인다.
 *    조회가 필요한 탭은 **조회 전에** 탭 핸들러 안에서 공유 요소에 `play()` 를 한 번 동기 호출해 잠금을 푼다 —
 *    iOS Safari(·WKWebView)는 `await` 뒤(제스처 밖)의 첫 `play()` 를 `NotAllowedError` 로 거절할 수 있다
 *    (`VG7-E-10` ⓑ · `D7-6` ⑥). src 없는 호출이라 거절(NotSupportedError · AbortError)은 조용히 버린다.
 *    `preload="none"` 유지 · 탭 전 URL 조회 0 (AC-7-49). 실기기 확인은 NOT VERIFIED (AC-7-62 수동 묶음, H7-7).
 * 3. 받은 URL 이 이미 만료 · 미디어 오류(403 등 — `play()` 거절) → URL 을 버리고 **1회** 재발급 후 다시 (C7-8 · AC-7-51).
 *    재발급 뒤에도 실패 → `error` 상태.
 * 4. `RECORDING_DELETED` → `unavailable` (재시도 0) · 네트워크 실패 → `error/offline` · 그 밖 → `error/generic`.
 *
 * - 정지 + `src` 제거: 화면 이탈(unmount — 로그아웃 이동 포함) · 문서 숨김(`visibilitychange` — 탭 전환) (AC-7-53).
 *   위치는 기억해 두고 다시 탭하면 그 위치부터 (URL 은 캐시 또는 새로 받는다).
 * - 로그 0 — URL · 클립 id · 라벨을 콘솔 · 에러 리포트에 남기지 않는다 (Plan §5.6, AC-7-53 · 64).
 * - 이전 탭의 비동기 결과는 `attemptRef` 토큰으로 버린다 (빠른 연타 · 전환 중 응답 도착).
 */
import type { ReportHighlightClip, SignedMediaUrl } from '@haru/contracts';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import {
  isClipRetentionExpired,
  isSignedUrlExpired,
  usePlaybackUrl,
} from '../../../entities/highlight-clip';
import { isHaruApiError, isNetworkError } from '../../../shared/api/helpers';

import {
  clipPlayerReducer,
  clipRowOf,
  createClipPlayerState,
  type ClipPlayerState,
} from './clipPlayerState';

export interface UseClipPlayerOptions {
  /** 기준 시각 (epoch ms) — 클립 보관 만료 · URL 만료 판단. 테스트가 주입한다. */
  now: () => number;
}

export interface UseClipPlayerResult {
  state: ClipPlayerState;
  /** 공유 `<audio preload="none">` 에 붙인다. */
  audioRef: (element: HTMLAudioElement | null) => void;
  /** 행 버튼 탭 — 상태에 따라 재생 · 일시정지 · 재시도. 불가 · 로딩이면 무시. */
  toggle: (clip: Pick<ReportHighlightClip, 'id'>) => void;
}

type PlayOutcome = 'played' | 'media-error' | 'blocked' | 'aborted';

function outcomeOf(error: unknown): PlayOutcome {
  const name = error instanceof DOMException || error instanceof Error ? error.name : '';
  if (name === 'AbortError') return 'aborted';
  if (name === 'NotAllowedError') return 'blocked';
  return 'media-error';
}

/**
 * 사용자 제스처 안에서 공유 요소를 깨운다 (iOS 잠금 해제, `VG7-E-10` ⓑ). src 가 없으므로 재생되는 소리는 없다.
 * 결과(빈 src 거절 · 뒤이은 src 설정으로 인한 AbortError)는 **조용히** 버린다 — 오류 상태 · 로그 0.
 */
function unlockForGesture(audio: HTMLAudioElement): void {
  try {
    void Promise.resolve(audio.play()).catch(() => undefined);
  } catch {
    // 동기 예외도 무시 — 잠금 해제는 최선 시도이고, 실패해도 기존 경로(둘째 탭 재생)가 남는다
  }
}

function startPlayback(audio: HTMLAudioElement): Promise<PlayOutcome> {
  try {
    return audio.play().then(
      () => 'played' as const,
      (error: unknown) => outcomeOf(error),
    );
  } catch (error: unknown) {
    return Promise.resolve(outcomeOf(error));
  }
}

export function useClipPlayer(
  clips: readonly Pick<ReportHighlightClip, 'id' | 'expiresAt'>[],
  { now }: UseClipPlayerOptions,
): UseClipPlayerResult {
  const [state, dispatch] = useReducer(clipPlayerReducer, clips, (initial) =>
    createClipPlayerState(initial, (clip) => isClipRetentionExpired(clip, now())),
  );
  const playback = usePlaybackUrl(now);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const stateRef = useRef(state);
  /** 지금 오디오에 붙어 있는 클립 (`src` 설정됨). */
  const attachedRef = useRef<string | null>(null);
  /** 오디오 이벤트를 받을 클립 — 붙이는 중 포함. */
  const activeRef = useRef<string | null>(null);
  /** 탭마다 증가 — 늦게 도착한 비동기 결과를 버린다. */
  const attemptRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const detach = useCallback((audio: HTMLAudioElement | null) => {
    attachedRef.current = null;
    // 붙은 적 없는 요소는 건드리지 않는다 (StrictMode 마운트 정리 · 초기 상태)
    if (audio === null || !audio.hasAttribute('src')) return;
    audio.pause();
    // `src` 제거 + `load()` = 네트워크 · 디코더 해제 (HTML 표준 권고 방식). URL 이 요소에 남지 않는다.
    audio.removeAttribute('src');
    audio.load();
  }, []);

  /** 활성 클립 정지 + `src` 제거 (이탈 · 숨김). 위치는 상태에 남는다. */
  const release = useCallback(
    (audio: HTMLAudioElement | null) => {
      attemptRef.current += 1;
      const active = activeRef.current;
      if (active !== null && audio !== null && attachedRef.current === active) {
        dispatch({ type: 'paused', clipId: active, positionSeconds: audio.currentTime });
      }
      detach(audio);
      activeRef.current = null;
      dispatch({ type: 'released' });
    },
    [detach],
  );

  const failWith = useCallback(
    (clipId: string, error: unknown) => {
      detach(audioElementRef.current);
      if (activeRef.current === clipId) activeRef.current = null;
      if (isHaruApiError(error) && error.code === 'RECORDING_DELETED') {
        dispatch({ type: 'deleted', clipId });
        return;
      }
      dispatch({ type: 'failed', clipId, kind: isNetworkError(error) ? 'offline' : 'generic' });
    },
    [detach],
  );

  const run = useCallback(
    async (clipId: string, attempt: number) => {
      const audio = audioElementRef.current;
      if (audio === null) return;
      const stale = () => attemptRef.current !== attempt;
      let reissued = false;

      /** 같은 클립이 붙어 있으면 `play()` 만 — 그 외에는 캐시 URL(동기) 또는 조회. */
      let url: SignedMediaUrl | undefined =
        attachedRef.current === clipId ? undefined : playback.peek(clipId);

      for (;;) {
        if (attachedRef.current !== clipId) {
          if (url === undefined) {
            try {
              url = await playback.fetch(clipId);
            } catch (error: unknown) {
              if (!stale()) failWith(clipId, error);
              return;
            }
            if (stale()) return;
          }
          if (isSignedUrlExpired(url, now())) {
            playback.discard(clipId);
            if (reissued) {
              failWith(clipId, undefined);
              return;
            }
            reissued = true;
            url = undefined;
            continue;
          }
          audio.src = url.url;
          const resumeAt = clipRowOf(stateRef.current, clipId).positionSeconds;
          if (resumeAt > 0) audio.currentTime = resumeAt;
          attachedRef.current = clipId;
        }

        const outcome = await startPlayback(audio);
        if (stale()) return;
        if (outcome === 'played') {
          dispatch({ type: 'started', clipId });
          return;
        }
        if (outcome === 'aborted') return;
        if (outcome === 'media-error' && !reissued) {
          // 만료된 signed URL(403) 류 — 버리고 1회 재발급 (C7-8)
          playback.discard(clipId);
          attachedRef.current = null;
          reissued = true;
          url = undefined;
          continue;
        }
        // 재생에 실패한 URL 은 다시 쓰지 않는다 (다음 탭 = 새 조회). 자동재생 차단(`blocked`)은 URL 문제가 아니라 남긴다.
        if (outcome === 'media-error') playback.discard(clipId);
        failWith(clipId, undefined);
        return;
      }
    },
    [playback, failWith, now],
  );

  const toggle = useCallback(
    (clip: Pick<ReportHighlightClip, 'id'>) => {
      const audio = audioElementRef.current;
      const row = clipRowOf(stateRef.current, clip.id);
      if (audio === null || row.status === 'unavailable' || row.status === 'loading') return;

      if (row.status === 'playing') {
        attemptRef.current += 1;
        audio.pause();
        dispatch({ type: 'paused', clipId: clip.id, positionSeconds: audio.currentTime });
        return;
      }

      attemptRef.current += 1;
      const attempt = attemptRef.current;
      const previous = activeRef.current;
      if (previous !== null && previous !== clip.id && attachedRef.current === previous) {
        // 동시 재생 1개 — 이전 클립 위치를 남기고 떼어 낸다 (AC-7-50)
        dispatch({ type: 'paused', clipId: previous, positionSeconds: audio.currentTime });
        detach(audio);
      }
      // URL 조회가 필요한 탭 — 조회(await) 전에 이 동기 구간에서 잠금을 푼다 (iOS, `VG7-E-10` ⓑ).
      // 붙어 있거나 캐시 URL 이 있으면 `run` 이 동기로 `play()` 하므로 필요 없다.
      if (attachedRef.current !== clip.id && playback.peek(clip.id) === undefined) {
        unlockForGesture(audio);
      }
      activeRef.current = clip.id;
      dispatch({ type: 'requested', clipId: clip.id });
      void run(clip.id, attempt);
    },
    [detach, run, playback],
  );

  // 오디오 이벤트 → 상태. 요소는 effect 시점에 잡아 두고 cleanup 에서 같은 요소를 정리한다(unmount 시 ref 는 이미 null).
  useEffect(() => {
    const audio = audioElementRef.current;
    if (audio === null) return;
    const current = () => {
      const active = activeRef.current;
      return active !== null && attachedRef.current === active ? active : null;
    };
    const onTime = () => {
      const clipId = current();
      if (clipId !== null) {
        dispatch({ type: 'progressed', clipId, positionSeconds: audio.currentTime });
      }
    };
    const onEnded = () => {
      const clipId = current();
      if (clipId !== null) dispatch({ type: 'ended', clipId });
    };
    const onPause = () => {
      // 외부 일시정지(OS 미디어 제어 · 오디오 세션 중단). 우리가 부른 pause 는 이미 상태가 바뀌어 무시된다.
      // 새 클립을 붙이며 이미 `play()` 를 부른 뒤 늦게 도착한 이전 pause 이벤트는 `paused === false` 라 걸러진다.
      const clipId = current();
      if (clipId !== null && audio.paused && !audio.ended) {
        dispatch({ type: 'paused', clipId, positionSeconds: audio.currentTime });
      }
    };
    const onWaiting = () => {
      const clipId = current();
      if (clipId !== null) dispatch({ type: 'buffering', clipId });
    };
    const onPlaying = () => {
      const clipId = current();
      if (clipId !== null) dispatch({ type: 'started', clipId });
    };
    const onError = () => {
      // 재생 **도중** 미디어 오류(스트림 끊김 등) — 붙이는 중(loading)의 오류는 `run` 이 재발급으로 처리한다.
      const clipId = current();
      if (clipId !== null && clipRowOf(stateRef.current, clipId).status === 'playing') {
        playback.discard(clipId);
        failWith(clipId, undefined);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') release(audio);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
      document.removeEventListener('visibilitychange', onVisibility);
      // 화면 이탈(로그아웃 이동 포함) — 정지 + `src` 제거 (AC-7-53)
      release(audio);
    };
  }, [release, failWith, playback]);

  const audioRef = useCallback((element: HTMLAudioElement | null) => {
    audioElementRef.current = element;
  }, []);

  return useMemo(() => ({ state, audioRef, toggle }), [state, audioRef, toggle]);
}
