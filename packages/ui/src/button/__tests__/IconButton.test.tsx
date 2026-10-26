import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { IconButton } from '../IconButton';

describe('IconButton', () => {
  it('uses the required label as its accessible name', () => {
    render(<IconButton icon={<svg />} label="Go back" />);

    expect(screen.getByRole('button', { name: 'Go back' })).toBeTruthy();
  });

  it('hides the icon itself from the accessibility tree', () => {
    render(<IconButton icon={<svg data-testid="glyph" />} label="Settings" />);

    expect(screen.getByTestId('glyph').parentElement?.getAttribute('aria-hidden')).toBe('true');
  });

  it('calls onPress when clicked and not when disabled', () => {
    const onPress = vi.fn();
    const { rerender } = render(<IconButton icon={<svg />} label="Settings" onPress={onPress} />);

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onPress).toHaveBeenCalledTimes(1);

    rerender(<IconButton icon={<svg />} label="Settings" onPress={onPress} disabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('IconButton size (S1-D1-2)', () => {
  it('has a single approved size value (md = 38 시각 / 44 hit area)', () => {
    const { container } = render(
      <IconButton icon={<svg />} label="Settings" size="md" onPress={() => {}} />,
    );

    expect(container.firstElementChild?.className).toContain('haru-icon-button--md');
  });

  it('shows the shared Spinner while loading, hidden from screen readers', () => {
    const { container } = render(<IconButton icon={<svg />} label="Settings" loading />);

    expect(container.querySelector('.haru-spinner')?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('button', { name: 'Settings' }).getAttribute('aria-busy')).toBe('true');
  });
});

/*
 * `D4-11` (Stage 4 Design Spec §12.2 옵션 A · AC-4-110 ①) — glass 그림자 = `--shadow-bubble` 1겹.
 * Figma `78:157`·`29:76`·`300:1318` 인스턴스는 drop 1겹만 렌더한다 (`R-FIGMA-1` ②).
 */
describe('IconButton glass shadow (D4-11)', () => {
  it('declares --shadow-bubble and no longer references --shadow-rest', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const css = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'IconButton.css'),
      'utf8',
    );
    const body = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(body).toMatch(/\.haru-icon-button--glass \{[^}]*box-shadow: var\(--shadow-bubble\);/);
    expect(body).not.toContain('--shadow-rest');
  });
});

/**
 * `D4-62` (4b Spec §16.5 · T-29) — glass 글리프 색 = `--icon-button-fg` (Figma `#5E7370`).
 * plain 은 범위 밖 — 기본 규칙의 `--color-fg-primary` 를 그대로 쓴다.
 */
describe('IconButton glyph color (D4-62)', () => {
  it('glass uses --icon-button-fg; base (plain) keeps --color-fg-primary', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const css = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'IconButton.css'),
      'utf8',
    );
    const body = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(body).toMatch(/\.haru-icon-button--glass \{[^}]*color: var\(--icon-button-fg\);/);
    expect(body).toMatch(/\.haru-icon-button \{[^}]*color: var\(--color-fg-primary\);/);
    expect(body).not.toMatch(/\.haru-icon-button--plain \{[^}]*[^-]color:/);
  });
});
