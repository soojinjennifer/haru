/**
 * 로그아웃 로컬 정리 — Plan §5.4, **AC-2-29** · **AC-2-41**.
 *
 * 순수 오케스트레이션이라 React 없이 순서·실패 경로를 전부 고정할 수 있다.
 */
import { describe, expect, it, vi } from 'vitest';

import { performSessionCleanup } from '../session-cleanup';

function makeDeps(
  signOut: () => Promise<void> = () => Promise.resolve(),
  clearLocalRecordings: () => Promise<void> = () => Promise.resolve(),
) {
  const calls: string[] = [];

  return {
    calls,
    deps: {
      signOut: vi.fn(async () => {
        calls.push('signOut');
        await signOut();
      }),
      clearOnboardingDraft: vi.fn(() => {
        calls.push('clearOnboardingDraft');
      }),
      clearActivityCardCache: vi.fn(() => {
        calls.push('clearActivityCardCache');
      }),
      clearDataDeletionMarker: vi.fn(() => {
        calls.push('clearDataDeletionMarker');
      }),
      clearLocalRecordings: vi.fn(async () => {
        calls.push('clearLocalRecordings');
        await clearLocalRecordings();
      }),
      clearQueryCache: vi.fn(() => {
        calls.push('clearQueryCache');
      }),
    },
  };
}

describe('performSessionCleanup', () => {
  it('세션 · 로컬 draft · 카드 캐시(AC-4-83) · 전체 삭제 기기 표시(AC-8-97) · 로컬 녹음(AC-4-72) · Query 캐시를 이 순서로 정리한다', async () => {
    const { calls, deps } = makeDeps();

    await performSessionCleanup(deps);

    expect(calls).toStrictEqual([
      'signOut',
      'clearOnboardingDraft',
      'clearActivityCardCache',
      'clearDataDeletionMarker',
      'clearLocalRecordings',
      'clearQueryCache',
    ]);
  });

  it('로컬 녹음 정리가 실패해도 Query 캐시는 지우고, 실패는 숨기지 않는다', async () => {
    const { calls, deps } = makeDeps(undefined, () => Promise.reject(new Error('storage')));

    await expect(performSessionCleanup(deps)).rejects.toThrow('storage');

    expect(deps.clearQueryCache).toHaveBeenCalledTimes(1);
    expect(calls).toStrictEqual([
      'signOut',
      'clearOnboardingDraft',
      'clearActivityCardCache',
      'clearDataDeletionMarker',
      'clearLocalRecordings',
      'clearQueryCache',
    ]);
  });

  it('`signOut()` 이 실패해도 이 기기의 아동 데이터(draft)와 캐시는 지운다', async () => {
    const { calls, deps } = makeDeps(() => Promise.reject(new Error('network')));

    await expect(performSessionCleanup(deps)).rejects.toThrow('network');

    // 실패를 숨기지 않으면서도 로컬에는 아무것도 남기지 않는다.
    expect(deps.clearOnboardingDraft).toHaveBeenCalledTimes(1);
    expect(deps.clearActivityCardCache).toHaveBeenCalledTimes(1);
    expect(deps.clearLocalRecordings).toHaveBeenCalledTimes(1);
    expect(deps.clearQueryCache).toHaveBeenCalledTimes(1);
    expect(calls).toStrictEqual([
      'signOut',
      'clearOnboardingDraft',
      'clearActivityCardCache',
      'clearDataDeletionMarker',
      'clearLocalRecordings',
      'clearQueryCache',
    ]);
  });
});
