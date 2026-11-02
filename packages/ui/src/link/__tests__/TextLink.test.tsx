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

  it('`subtle` (4b Spec §4 #5): 보조 색 · 터치 44 는 `::before` 로 — 레이아웃 높이를 늘리지 않는다', () => {
    render(
      <TextLink tone="subtle" onPress={() => {}} hasPopup="dialog">
        See all prompts
      </TextLink>,
    );
    const button = screen.getByRole('button', { name: 'See all prompts' });
    expect(button.classList.contains('haru-text-link--subtle')).toBe(true);
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');

    const css = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'TextLink.css'),
      'utf8',
    );
    const subtle = /\.haru-text-link--subtle \{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(subtle).toContain('color: var(--color-fg-secondary);');
    expect(subtle).not.toMatch(/padding|min-block-size/);
    expect(css).toMatch(
      /\.haru-text-link--subtle::before \{[^}]*inset-block: calc\(\(100% - var\(--size-touch-min\)\) \/ 2\);/,
    );
  });

  it('hasPopup 이 없으면 aria-haspopup 을 달지 않는다', () => {
    render(<TextLink onPress={() => {}}>Plain</TextLink>);
    expect(screen.getByRole('button', { name: 'Plain' }).hasAttribute('aria-haspopup')).toBe(false);
  });
});
