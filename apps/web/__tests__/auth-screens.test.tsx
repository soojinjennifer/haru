/**
 * Auth 화면 동작 · 접근성 · Privacy 테스트.
 * AC-2-04 · AC-2-05 · AC-2-08 · AC-2-09 · AC-2-13 · AC-2-60 · AC-2-64.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { findChildDataKeys } from '../src/mocks/request-log';
import { LEGAL_LINKS, isPlaceholderLegalUrl } from '../src/shared/config/legal-links';
import { createHarness, type Harness } from '../src/test/harness';
import { authCopy } from '../src/features/auth/copy';

function renderAt(path: string, scenarios: readonly string[] = []): Harness {
  const harness = createHarness({ initialEntries: [path], scenarios });
  const Wrapper = harness.wrapper;

  render(
    <Wrapper>
      <AppRoutes />
    </Wrapper>,
  );

  return harness;
}

describe('/auth/welcome — Figma `179:1701` (AC-2-04)', () => {
  it('Google · Apple · Email 세 경로가 모두 있다 (C-13)', async () => {
    renderAt('/auth/welcome');

    expect(await screen.findByRole('button', { name: authCopy.welcome.google })).toBeDefined();
    expect(screen.getByRole('button', { name: authCopy.welcome.apple })).toBeDefined();
    expect(screen.getByRole('button', { name: authCopy.welcome.email })).toBeDefined();
  });

  it('약관·개인정보방침은 새 탭 외부 링크다 (결정 D-4)', async () => {
    renderAt('/auth/welcome');

    const terms = await screen.findByRole('link', {
      name: new RegExp(authCopy.welcome.legalTerms),
    });

    expect(terms.getAttribute('href')).toBe(LEGAL_LINKS.termsOfService);
    expect(terms.getAttribute('target')).toBe('_blank');
    expect(terms.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('문서 URL 이 아직 실제 문서가 아님이 드러난다 (출시 전 차단 항목 §4.1)', () => {
    expect(isPlaceholderLegalUrl(LEGAL_LINKS.termsOfService)).toBe(true);
    expect(isPlaceholderLegalUrl(LEGAL_LINKS.privacyPolicy)).toBe(true);
  });

  it('Email 버튼이 가입 화면으로 이동시킨다', async () => {
    renderAt('/auth/welcome');

    fireEvent.click(await screen.findByRole('button', { name: authCopy.welcome.email }));

    expect(
      await screen.findByRole('heading', { level: 1, name: authCopy.signUp.title }),
    ).toBeDefined();
  });
});

describe('소셜 로그인 취소 (AC-2-08)', () => {
  it('오류 화면이 아니라 같은 화면 + 안내다', async () => {
    renderAt('/auth/welcome', ['auth:provider-cancelled']);

    fireEvent.click(await screen.findByRole('button', { name: authCopy.welcome.google }));

    expect(await screen.findByText(authCopy.providerCancelled.title)).toBeDefined();
    // 화면이 그대로다.
    expect(screen.getByRole('heading', { level: 1, name: authCopy.welcome.title })).toBeDefined();
  });
});

describe('/auth/sign-up — 보호자 영역만 (AD-S2-1 · AC-2-05)', () => {
  it('아이 관련 입력이 없다', async () => {
    renderAt('/auth/sign-up');

    await screen.findByRole('heading', { level: 1, name: authCopy.signUp.title });

    for (const label of [/child/i, /birth/i, /gender/i]) {
      expect(screen.queryByLabelText(label)).toBeNull();
    }
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('보호자 3필드가 label 로 연결되고 autocomplete 가 붙는다 (AC-2-60)', async () => {
    renderAt('/auth/sign-up');

    const name = await screen.findByLabelText(authCopy.signUp.nameLabel);
    const email = screen.getByLabelText(authCopy.signUp.emailLabel);
    const password = screen.getByLabelText(authCopy.signUp.passwordLabel);

    expect(name.getAttribute('autocomplete')).toBe('name');
    expect(email.getAttribute('autocomplete')).toBe('email');
    expect(password.getAttribute('autocomplete')).toBe('new-password');
    expect(password.getAttribute('type')).toBe('password');
  });

  it('검증 실패 시 aria-invalid 와 설명이 연결된다', async () => {
    renderAt('/auth/sign-up');

    fireEvent.click(await screen.findByRole('button', { name: authCopy.signUp.submit }));

    const email = screen.getByLabelText(authCopy.signUp.emailLabel);

    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(email.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText(authCopy.validation.emailRequired)).toBeDefined();
  });

  it('8자 미만 비밀번호를 서버 왕복 없이 막는다', async () => {
    const harness = renderAt('/auth/sign-up');

    fireEvent.change(await screen.findByLabelText(authCopy.signUp.nameLabel), {
      target: { value: 'Sam Rivera' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.signUp.emailLabel), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.signUp.passwordLabel), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: authCopy.signUp.submit }));

    expect(screen.getByText(authCopy.validation.passwordMinLength)).toBeDefined();
    expect(harness.bundle.requestLog.entries()).toHaveLength(0);
  });

  it('비밀번호 토글이 aria-pressed 와 접근성 이름을 갖는다 (D-14 보완 ②)', async () => {
    renderAt('/auth/sign-up');

    const toggle = await screen.findByRole('button', { name: authCopy.password.show });

    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByLabelText(authCopy.signUp.passwordLabel).getAttribute('type')).toBe(
      'password',
    );

    fireEvent.click(toggle);

    const pressed = screen.getByRole('button', { name: authCopy.password.hide });
    expect(pressed.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText(authCopy.signUp.passwordLabel).getAttribute('type')).toBe('text');
  });
});

describe('Privacy — 동의 기록 이전 구간 요청에 아동 데이터 0건 (AC-2-13)', () => {
  it('가입 요청 payload 에 아이 필드가 없다', async () => {
    const harness = renderAt('/auth/sign-up');

    fireEvent.change(await screen.findByLabelText(authCopy.signUp.nameLabel), {
      target: { value: 'Sam Rivera' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.signUp.emailLabel), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.signUp.passwordLabel), {
      target: { value: 'sunny-evening-8' },
    });
    fireEvent.click(screen.getByRole('button', { name: authCopy.signUp.submit }));

    await waitFor(() => {
      expect(
        harness.bundle.requestLog
          .entries()
          .some((entry) => entry.operation === 'AuthGateway.signUpWithEmail'),
      ).toBe(true);
    });

    expect(findChildDataKeys(harness.bundle.requestLog.entries())).toStrictEqual([]);
  });

  it('요청 로그에 비밀번호 원문이 남지 않는다 (AC-2-63 · AC-2-64)', async () => {
    const harness = renderAt('/auth/log-in');

    fireEvent.change(await screen.findByLabelText(authCopy.logIn.emailLabel), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.logIn.passwordLabel), {
      target: { value: 'sunny-evening-8' },
    });
    fireEvent.click(screen.getByRole('button', { name: authCopy.logIn.submit }));

    await waitFor(() => {
      expect(harness.bundle.requestLog.entries().length).toBeGreaterThan(0);
    });

    expect(JSON.stringify(harness.bundle.requestLog.entries())).not.toContain('sunny-evening-8');
  });

  it('Welcome · 로그인 화면을 그냥 열기만 하면 서버 요청이 0건이다', async () => {
    const harness = renderAt('/auth/welcome');

    await screen.findByRole('heading', { level: 1, name: authCopy.welcome.title });

    expect(harness.bundle.requestLog.entries()).toHaveLength(0);
  });
});

describe('/auth/log-in (AC-2-04)', () => {
  it('잘못된 자격 증명 문구가 계정 존재 여부를 알려주지 않는다', async () => {
    renderAt('/auth/log-in', ['auth:error']);

    fireEvent.change(await screen.findByLabelText(authCopy.logIn.emailLabel), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.logIn.passwordLabel), {
      target: { value: 'sunny-evening-8' },
    });
    fireEvent.click(screen.getByRole('button', { name: authCopy.logIn.submit }));

    expect(await screen.findByText(authCopy.credentialsMismatch.title)).toBeDefined();
    expect(screen.queryByText(/no account|not found|does not exist/i)).toBeNull();
  });

  it('실패 후에도 입력값이 보존된다 (retry UX)', async () => {
    renderAt('/auth/log-in', ['auth:retry']);

    const email = await screen.findByLabelText(authCopy.logIn.emailLabel);
    fireEvent.change(email, { target: { value: 'sam@example.com' } });
    fireEvent.change(screen.getByLabelText(authCopy.logIn.passwordLabel), {
      target: { value: 'sunny-evening-8' },
    });
    fireEvent.click(screen.getByRole('button', { name: authCopy.logIn.submit }));

    await screen.findByText(authCopy.credentialsMismatch.title);
    expect((email as HTMLInputElement).value).toBe('sam@example.com');
  });

  it('"Forgot password?" 가 재설정 화면으로 이동시킨다', async () => {
    renderAt('/auth/log-in');

    fireEvent.click(await screen.findByRole('button', { name: authCopy.logIn.forgotPassword }));

    expect(
      await screen.findByRole('heading', { level: 1, name: authCopy.forgotPassword.title }),
    ).toBeDefined();
  });
});

describe('/auth/forgot-password (AC-2-09)', () => {
  it('성공하면 같은 route 안에서 안내 뷰로 바뀐다', async () => {
    renderAt('/auth/forgot-password');

    fireEvent.change(await screen.findByLabelText(authCopy.forgotPassword.emailLabel), {
      target: { value: 'sam@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: authCopy.forgotPassword.submit }));

    expect(await screen.findByText(authCopy.forgotPassword.sentTitle)).toBeDefined();
    expect(screen.getByText(authCopy.forgotPassword.sentDescription)).toBeDefined();
  });

  it('안내 문구가 계정 존재 여부를 확인해 주지 않는다', () => {
    expect(authCopy.forgotPassword.sentDescription).toMatch(/if that email is registered/i);
    expect(authCopy.forgotPassword.sentDescription).not.toMatch(/we (found|could not find)/i);
  });
});

describe('/auth/reset-password (AC-2-09)', () => {
  it('토큰이 없으면 링크 만료 상태를 보여준다', async () => {
    renderAt('/auth/reset-password');

    expect(await screen.findByText(authCopy.resetPassword.expiredTitle)).toBeDefined();
    expect(
      screen.getByRole('button', { name: authCopy.resetPassword.expiredAction }),
    ).toBeDefined();
  });

  it('두 입력이 다르면 확인 필드에 오류를 표시한다', async () => {
    renderAt('/auth/reset-password?token=mock-reset-token');

    fireEvent.change(await screen.findByLabelText(authCopy.resetPassword.passwordLabel), {
      target: { value: 'sunny-evening-8' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.resetPassword.confirmLabel), {
      target: { value: 'sunny-evening-9' },
    });
    fireEvent.click(screen.getByRole('button', { name: authCopy.resetPassword.submit }));

    expect(await screen.findByText(authCopy.validation.confirmMismatch)).toBeDefined();
  });

  it('링크가 만료된 응답이면 만료 화면으로 교체된다', async () => {
    renderAt('/auth/reset-password?token=mock-reset-token', ['auth:error']);

    fireEvent.change(await screen.findByLabelText(authCopy.resetPassword.passwordLabel), {
      target: { value: 'sunny-evening-8' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.resetPassword.confirmLabel), {
      target: { value: 'sunny-evening-8' },
    });
    fireEvent.click(screen.getByRole('button', { name: authCopy.resetPassword.submit }));

    expect(await screen.findByText(authCopy.resetPassword.expiredTitle)).toBeDefined();
  });

  it('성공하면 로그인 화면으로 이동한다', async () => {
    renderAt('/auth/reset-password?token=mock-reset-token');

    fireEvent.change(await screen.findByLabelText(authCopy.resetPassword.passwordLabel), {
      target: { value: 'sunny-evening-8' },
    });
    fireEvent.change(screen.getByLabelText(authCopy.resetPassword.confirmLabel), {
      target: { value: 'sunny-evening-8' },
    });
    fireEvent.click(screen.getByRole('button', { name: authCopy.resetPassword.submit }));

    expect(
      await screen.findByRole('heading', { level: 1, name: authCopy.logIn.title }),
    ).toBeDefined();
  });
});

describe('copy 규칙 (AC-2-38 · AC-2-65)', () => {
  const flat = JSON.stringify(authCopy).toLowerCase();

  it('진단·판정 표현을 쓰지 않는다', () => {
    for (const banned of ['invalid', 'failed', 'wrong', 'behind', 'low score']) {
      expect(flat).not.toContain(banned);
    }
  });

  it('아이 성(lastName)을 화면 문구에 쓰지 않는다', () => {
    expect(flat).not.toContain('last name');
  });
});
