/**
 * `withAuthRefresh` — AC-2-07 (`AUTH_TOKEN_EXPIRED` 1회 refresh 후 재시도).
 */
import { HaruApiError, type AuthSession } from '@haru/contracts';
import { describe, expect, it, vi } from 'vitest';

import { withAuthRefresh } from '../withAuthRefresh';

const SESSION: AuthSession = {
  userId: '11111111-1111-4111-8111-111111111111',
  accessToken: 'mock-access-token-2',
  expiresAt: '2026-01-01T01:00:00.000Z',
};

function expired(): HaruApiError {
  return new HaruApiError('AUTH_TOKEN_EXPIRED', 'expired');
}

describe('성공 경로', () => {
  it('성공하면 refresh 하지 않는다', async () => {
    const refresh = vi.fn(() => Promise.resolve(SESSION));
    const signOut = vi.fn(() => Promise.resolve());

    await expect(withAuthRefresh(() => Promise.resolve('ok'), { refresh, signOut })).resolves.toBe(
      'ok',
    );
    expect(refresh).not.toHaveBeenCalled();
  });
});

describe('AUTH_TOKEN_EXPIRED', () => {
  it('refresh 1회 후 재시도해서 성공한다', async () => {
    const refresh = vi.fn(() => Promise.resolve(SESSION));
    const signOut = vi.fn(() => Promise.resolve());
    let attempt = 0;

    const result = await withAuthRefresh(
      () => {
        attempt += 1;
        return attempt === 1 ? Promise.reject(expired()) : Promise.resolve('ok');
      },
      { refresh, signOut },
    );

    expect(result).toBe('ok');
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(signOut).not.toHaveBeenCalled();
    expect(attempt).toBe(2);
  });

  it('refresh 가 불가능하면 signOut + onSessionLost 후 오류를 그대로 던진다', async () => {
    const refresh = vi.fn(() => Promise.resolve(null));
    const signOut = vi.fn(() => Promise.resolve());
    const onSessionLost = vi.fn();

    await expect(
      withAuthRefresh(() => Promise.reject(expired()), { refresh, signOut, onSessionLost }),
    ).rejects.toBeInstanceOf(HaruApiError);

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(onSessionLost).toHaveBeenCalledTimes(1);
  });

  it('재시도도 만료면 signOut + onSessionLost 한다 (2회 실패)', async () => {
    const refresh = vi.fn(() => Promise.resolve(SESSION));
    const signOut = vi.fn(() => Promise.resolve());
    const onSessionLost = vi.fn();
    const run = vi.fn(() => Promise.reject(expired()));

    await expect(withAuthRefresh(run, { refresh, signOut, onSessionLost })).rejects.toBeInstanceOf(
      HaruApiError,
    );

    expect(run).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(onSessionLost).toHaveBeenCalledTimes(1);
  });
});

describe('다른 오류', () => {
  it('만료가 아닌 오류는 재시도하지 않고 그대로 던진다', async () => {
    const refresh = vi.fn(() => Promise.resolve(SESSION));
    const signOut = vi.fn(() => Promise.resolve());
    const run = vi.fn(() => Promise.reject(new HaruApiError('INTERNAL_ERROR', 'boom')));

    await expect(withAuthRefresh(run, { refresh, signOut })).rejects.toBeInstanceOf(HaruApiError);

    expect(run).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });
});
