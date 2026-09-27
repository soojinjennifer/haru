import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { authCopy } from '../../features/auth';
import { appCopy } from '../../shared/copy/app-copy';
import { createHarness } from '../../test/harness';
import { AppRoutes } from '../router';

/** 실제 provider 순서 그대로 route 를 띄운다 (Guard 가 `useMe()` 를 쓴다). */
function renderAt(path: string, scenarios: readonly string[] = []) {
  const { wrapper: Wrapper } = createHarness({ initialEntries: [path], scenarios });

  return render(<Wrapper>{<AppRoutes />}</Wrapper>);
}

describe('AppRoutes — Stage 2-AUTH route 표', () => {
  it('`/auth/welcome` 이 Welcome 화면을 렌더한다', async () => {
    renderAt('/auth/welcome');

    expect(
      await screen.findByRole('heading', { level: 1, name: authCopy.welcome.title }),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: authCopy.welcome.google })).toBeDefined();
  });

  it('`/auth/sign-up` 이 가입 화면을 렌더한다', async () => {
    renderAt('/auth/sign-up');

    expect(
      await screen.findByRole('heading', { level: 1, name: authCopy.signUp.title }),
    ).toBeDefined();
  });

  it('`/auth/log-in` 이 로그인 화면을 렌더한다', async () => {
    renderAt('/auth/log-in');

    expect(
      await screen.findByRole('heading', { level: 1, name: authCopy.logIn.title }),
    ).toBeDefined();
  });

  it('`/auth/forgot-password` 가 재설정 요청 화면을 렌더한다', async () => {
    renderAt('/auth/forgot-password');

    expect(
      await screen.findByRole('heading', { level: 1, name: authCopy.forgotPassword.title }),
    ).toBeDefined();
  });

  it('`/auth/reset-password` 가 새 비밀번호 화면을 렌더한다', async () => {
    renderAt('/auth/reset-password?token=mock-reset-token');

    expect(
      await screen.findByRole('heading', { level: 1, name: authCopy.resetPassword.title }),
    ).toBeDefined();
  });

  it('`/` 와 `/settings` 는 route 표에 등록되어 있다 (화면 동작은 `__tests__/home-settings`)', async () => {
    // 미인증이라 Guard 가 막지만, route 자체가 없으면 NotFound 가 뜬다 — 등록 여부를 그걸로 가른다.
    renderAt('/settings');

    expect(
      await screen.findByRole('heading', { level: 1, name: authCopy.welcome.title }),
    ).toBeDefined();
    expect(screen.queryByText(appCopy.notFound.title)).toBeNull();
  });

  it('미인증 상태에서 `/` 는 Guard 가 Welcome 으로 보낸다', async () => {
    renderAt('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: authCopy.welcome.title }),
    ).toBeDefined();
  });

  it('알 수 없는 경로는 NotFound 화면을 렌더한다', async () => {
    renderAt('/does-not-exist');

    expect(
      await screen.findByRole('heading', { level: 1, name: appCopy.notFound.title }),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: appCopy.notFound.actionLabel })).toBeDefined();
  });

  it('route 는 main 랜드마크를 가진 Layout 안에서 렌더된다', async () => {
    renderAt('/auth/welcome');

    expect(await screen.findByRole('main', { name: appCopy.landmarks.mainContent })).toBeDefined();
  });
});
