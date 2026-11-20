/**
 * 클립 플레이어 상태 머신 (순수 reducer) — Stage 7 `S7-E` (Plan §5.4 · Spec §2.5, AC-7-49 · 50 · 51 · 52).
 * 오디오 요소 · 네트워크와 묶인 흐름은 `apps/web/__tests__/highlight-clip-player.test.tsx` 가 덮는다.
 */
import { describe, expect, it } from 'vitest';

import { isClipRetentionExpired } from '../../../entities/highlight-clip';
import {
  clipPlayerReducer,
  clipRowOf,
  createClipPlayerState,
  formatClipTime,
  type ClipPlayerEvent,
  type ClipPlayerState,
} from '../model/clipPlayerState';

const A = 'clip-a';
const B = 'clip-b';
const NOW = Date.parse('2026-06-01T00:00:00.000Z');

function initial(): ClipPlayerState {
  return createClipPlayerState(
    [
      { id: A, expiresAt: null },
      { id: B, expiresAt: '2026-12-31T00:00:00.000Z' },
    ],
    (clip) => isClipRetentionExpired(clip, NOW),
  );
}

function apply(state: ClipPlayerState, ...events: ClipPlayerEvent[]): ClipPlayerState {
  return events.reduce(clipPlayerReducer, state);
}

describe('createClipPlayerState — 초기 상태 (N7-17)', () => {
  it('보관 기간 안 · null = idle, 지난 expiresAt = 조회 전에도 unavailable', () => {
    const state = createClipPlayerState(
      [
        { id: A, expiresAt: null },
        { id: B, expiresAt: '2026-05-31T23:59:59.000Z' },
        { id: 'edge', expiresAt: '2026-06-01T00:00:00.000Z' },
        { id: 'later', expiresAt: '2026-06-01T00:00:01.000Z' },
      ],
      (clip) => isClipRetentionExpired(clip, NOW),
    );
    expect(clipRowOf(state, A).status).toBe('idle');
    expect(clipRowOf(state, B).status).toBe('unavailable');
    expect(clipRowOf(state, 'edge').status).toBe('unavailable');
    expect(clipRowOf(state, 'later').status).toBe('idle');
    expect(state.activeClipId).toBeNull();
  });
});

describe('clipPlayerReducer — 6 상태 전이', () => {
  it('idle → loading → playing → paused → loading(재개) → playing → idle(ended, 위치 0)', () => {
    let state = apply(initial(), { type: 'requested', clipId: A });
    expect(clipRowOf(state, A).status).toBe('loading');
    expect(state.activeClipId).toBe(A);

    state = apply(
      state,
      { type: 'started', clipId: A },
      { type: 'progressed', clipId: A, positionSeconds: 4 },
    );
    expect(clipRowOf(state, A)).toStrictEqual({
      status: 'playing',
      positionSeconds: 4,
      errorKind: null,
    });

    state = apply(state, { type: 'paused', clipId: A, positionSeconds: 5 });
    expect(clipRowOf(state, A)).toMatchObject({ status: 'paused', positionSeconds: 5 });

    state = apply(state, { type: 'requested', clipId: A }, { type: 'started', clipId: A });
    expect(clipRowOf(state, A)).toMatchObject({ status: 'playing', positionSeconds: 5 });

    state = apply(state, { type: 'ended', clipId: A });
    expect(clipRowOf(state, A)).toStrictEqual({
      status: 'idle',
      positionSeconds: 0,
      errorKind: null,
    });
  });

  it('버퍼링 = loading 으로 · playing 이벤트로 복귀 (Spec §2.5 loading = URL 조회·버퍼링)', () => {
    const state = apply(
      initial(),
      { type: 'requested', clipId: A },
      { type: 'started', clipId: A },
      { type: 'buffering', clipId: A },
    );
    expect(clipRowOf(state, A).status).toBe('loading');
    expect(clipRowOf(apply(state, { type: 'started', clipId: A }), A).status).toBe('playing');
  });

  it('동시 재생 1개 — 다른 클립 requested 시 이전 playing 행은 paused (위치 유지) (AC-7-50)', () => {
    const state = apply(
      initial(),
      { type: 'requested', clipId: A },
      { type: 'started', clipId: A },
      { type: 'progressed', clipId: A, positionSeconds: 3 },
      { type: 'requested', clipId: B },
    );
    expect(clipRowOf(state, A)).toMatchObject({ status: 'paused', positionSeconds: 3 });
    expect(clipRowOf(state, B).status).toBe('loading');
    expect(state.activeClipId).toBe(B);
  });

  it('로딩 중 다른 클립 → 이전 로딩 행도 paused · 늦게 온 started 는 무시', () => {
    const state = apply(
      initial(),
      { type: 'requested', clipId: A },
      { type: 'requested', clipId: B },
      { type: 'started', clipId: A },
    );
    expect(clipRowOf(state, A).status).toBe('paused');
    expect(clipRowOf(state, B).status).toBe('loading');
  });

  it('failed → error(generic | offline) · 활성 해제 · 다시 requested 가능 (재시도)', () => {
    let state = apply(
      initial(),
      { type: 'requested', clipId: A },
      { type: 'failed', clipId: A, kind: 'offline' },
    );
    expect(clipRowOf(state, A)).toMatchObject({ status: 'error', errorKind: 'offline' });
    expect(state.activeClipId).toBeNull();

    state = apply(state, { type: 'requested', clipId: A });
    expect(clipRowOf(state, A)).toMatchObject({ status: 'loading', errorKind: null });
    state = apply(state, { type: 'failed', clipId: A, kind: 'generic' });
    expect(clipRowOf(state, A).errorKind).toBe('generic');
  });

  it('deleted → unavailable 은 종착 — 어떤 이벤트도 되돌리지 않는다 (재시도 0, AC-7-52)', () => {
    let state = apply(initial(), { type: 'requested', clipId: A }, { type: 'deleted', clipId: A });
    expect(clipRowOf(state, A).status).toBe('unavailable');
    for (const event of [
      { type: 'requested', clipId: A },
      { type: 'started', clipId: A },
      { type: 'ended', clipId: A },
      { type: 'failed', clipId: A, kind: 'generic' },
    ] as const) {
      state = apply(state, event);
      expect(clipRowOf(state, A).status).toBe('unavailable');
    }
  });

  it('released — 활성 행(playing | loading)만 paused · 활성 해제 · 다른 행 불변', () => {
    const playing = apply(
      initial(),
      { type: 'requested', clipId: A },
      { type: 'started', clipId: A },
      { type: 'released' },
    );
    expect(clipRowOf(playing, A).status).toBe('paused');
    expect(playing.activeClipId).toBeNull();

    const loading = apply(initial(), { type: 'requested', clipId: A }, { type: 'released' });
    expect(clipRowOf(loading, A).status).toBe('paused');

    const idle = initial();
    expect(apply(idle, { type: 'released' })).toBe(idle);
  });

  it('목록 밖 id · 비활성 행의 progressed/started 는 무시', () => {
    const state = initial();
    expect(apply(state, { type: 'requested', clipId: 'unknown' })).toBe(state);
    expect(apply(state, { type: 'progressed', clipId: A, positionSeconds: 9 })).toBe(state);
    expect(apply(state, { type: 'started', clipId: A })).toBe(state);
  });
});

describe('formatClipTime — m:ss', () => {
  it.each([
    [0, '0:00'],
    [4.9, '0:04'],
    [12, '0:12'],
    [65, '1:05'],
    [-1, '0:00'],
    [Number.NaN, '0:00'],
  ])('%s → %s', (seconds, text) => {
    expect(formatClipTime(seconds)).toBe(text);
  });
});
