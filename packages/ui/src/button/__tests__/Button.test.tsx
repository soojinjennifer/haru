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
