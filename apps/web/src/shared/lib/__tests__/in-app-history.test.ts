/** `hasInAppHistory` — Stage 7 `N7-23` (deep link 진입 시 Back = `/progress`). */
import { describe, expect, it } from 'vitest';

import { AUTH_RETURN_STATE, hasInAppHistory } from '../in-app-history';

describe('hasInAppHistory — React Router history.state.idx', () => {
  it('idx > 0 이면 앱 안 이전 기록이 있다', () => {
    expect(hasInAppHistory({ idx: 1, key: 'a', usr: null })).toBe(true);
    expect(hasInAppHistory({ idx: 4 })).toBe(true);
  });

  it('첫 진입(idx 0) · 값 없음 · 형식 아님 = 없음', () => {
    expect(hasInAppHistory({ idx: 0 })).toBe(false);
    expect(hasInAppHistory(null)).toBe(false);
    expect(hasInAppHistory(undefined)).toBe(false);
    expect(hasInAppHistory({})).toBe(false);
    expect(hasInAppHistory({ idx: '2' })).toBe(false);
  });

  it('로그인 복귀 표식(usr.viaAuthReturn) = idx 와 무관하게 없음 — 앞 기록은 인증 관문이다 (D7-7)', () => {
    expect(hasInAppHistory({ idx: 1, key: 'a', usr: AUTH_RETURN_STATE })).toBe(false);
    expect(hasInAppHistory({ idx: 3, usr: { viaAuthReturn: true } })).toBe(false);
  });

  it('표식이 아닌 router state 는 판정에 영향이 없다 (일반 앱 안 이동 불변)', () => {
    expect(hasInAppHistory({ idx: 1, usr: { viaAuthReturn: false } })).toBe(true);
    expect(hasInAppHistory({ idx: 1, usr: { viaAuthReturn: 'true' } })).toBe(true);
    expect(hasInAppHistory({ idx: 2, usr: { from: 'progress' } })).toBe(true);
    expect(hasInAppHistory({ idx: 0, usr: null })).toBe(false);
  });
});
