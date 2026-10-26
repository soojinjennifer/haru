import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';

describe('Button', () => {
  it('renders an accessible button with its label', () => {
    render(<Button>Start Session</Button>);

    const button = screen.getByRole('button', { name: 'Start Session' });
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('calls onPress when clicked', () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Save</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress and exposes disabled semantics when disabled', () => {
    const onPress = vi.fn();
    render(
      <Button onPress={onPress} disabled>
        Save
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveProperty('disabled', true);
    expect(button.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('stays focusable, marks aria-busy and ignores presses while loading', () => {
    const onPress = vi.fn();
    render(
      <Button onPress={onPress} loading>
        Save
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button).toHaveProperty('disabled', false);

    button.focus();
    expect(document.activeElement).toBe(button);

    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('hides decorative icons from the accessibility tree', () => {
    render(<Button leadingIcon={<svg data-testid="leading" />}>Continue</Button>);

    const icon = screen.getByTestId('leading').parentElement;
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy();
  });
});

describe('ButtonGroup', () => {
  it('renders secondary before primary (Figma 86:372 order)', () => {
    render(
      <ButtonGroup
        primary={<Button>Start Session</Button>}
        secondary={<Button variant="glass">Save</Button>}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual(['Save', 'Start Session']);
  });

  it('renders only the primary action when no secondary action is given', () => {
    render(<ButtonGroup primary={<Button>Start Session</Button>} layout="stacked" />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});

describe('Button / IconButton loading indicator (S1-D1-3)', () => {
  it('uses the shared Spinner, and the Spinner stays silent under aria-busy (§4.9)', () => {
    const { container } = render(
      <Button loading onPress={() => {}}>
        Save
      </Button>,
    );

    const spinner = container.querySelector('.haru-spinner');
    expect(spinner).toBeTruthy();
    expect(spinner?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('aria-busy')).toBe('true');
  });

  it('keeps the label rendered so the button width does not jump', () => {
    render(
      <Button loading onPress={() => {}}>
        Save
      </Button>,
    );

    expect(screen.getByText('Save')).toBeTruthy();
  });
});

/*
 * Stage 4 Design Spec §2.3.4 — `neutral` = Figma `Accent/Secondary` (`285:1228`, 세션 `Discard`).
 * 면 `--color-action-neutral-bg`(gray-2) · 라벨 `--color-action-neutral-fg`(white). disabled 는
 * variant 와 무관한 공통 `opacity` 선언을 그대로 받는다 (`D4-18`).
 */
describe('Button neutral variant (D4-16 · D4-18)', () => {
  it('renders the neutral class and keeps aria-disabled focusable', () => {
    const onPress = vi.fn();
    render(
      <Button variant="neutral" aria-disabled onPress={onPress}>
        Discard
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Discard' });
    expect(button.className).toContain('haru-button--neutral');
    expect(button.hasAttribute('disabled')).toBe(false);
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('neutral CSS uses the neutral action tokens only (no extra disabled rule)', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const css = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'Button.css'),
      'utf8',
    );
    const block = /\.haru-button--neutral \{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(block).toContain('background-color: var(--color-action-neutral-bg);');
    expect(block).toContain('color: var(--color-action-neutral-fg);');
    expect(css).not.toMatch(/\.haru-button--neutral[^{]*(disabled|aria-disabled)/);
  });
});
