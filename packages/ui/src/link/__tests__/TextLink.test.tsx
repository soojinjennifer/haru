import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { TextLink } from '../TextLink';

describe('TextLink (Stage 2 Design Spec §4.6)', () => {
  it('href 가 있으면 링크로 렌더된다', () => {
    render(<TextLink href="/auth/log-in">Log in</TextLink>);

    expect(screen.getByRole('link', { name: 'Log in' }).getAttribute('href')).toBe('/auth/log-in');
  });

  it('href 가 없으면 동작 버튼으로 렌더된다', () => {
    const onPress = vi.fn();
    render(<TextLink onPress={onPress}>Resend email</TextLink>);

    fireEvent.click(screen.getByRole('button', { name: 'Resend email' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('외부 링크는 새 탭 + noopener 이고 새 탭임을 알린다 (D-4)', () => {
    render(
      <TextLink href="https://example.com/terms" external externalHint="Opens in a new tab">
        Terms
      </TextLink>,
    );

    const link = screen.getByRole('link', { name: /Terms/ });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    // 새 탭으로 열린다는 사실을 시각 숨김 텍스트로 알린다.
    expect(link.textContent).toContain('Opens in a new tab');
  });

  it('external 인데 안내 문구가 없으면 개발자 경고를 남긴다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <TextLink href="https://example.com/terms" external>
        Terms
      </TextLink>,
    );

    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('밑줄은 색 단독 구분을 피하기 위한 것이므로 CSS 에 남아 있어야 한다', () => {
    const css = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'TextLink.css'),
      'utf8',
    );

    expect(css).toContain('text-decoration: underline;');
  });
});
