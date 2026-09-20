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
