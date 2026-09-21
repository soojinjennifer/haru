import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { InlineAlert } from '../InlineAlert';

describe('InlineAlert', () => {
  it('uses role=alert for error and warning, role=status otherwise (§4.11)', () => {
    const { unmount } = render(<InlineAlert tone="error" title="Something went wrong." />);
    expect(screen.getByRole('alert')).toBeTruthy();
    unmount();

    render(<InlineAlert tone="info" title="Heads up." />);
    expect(screen.getByRole('status').getAttribute('aria-live')).toBe('polite');
  });

  it('never relies on colour alone — icon and text are always rendered', () => {
    const { container } = render(
      <InlineAlert
        tone="offline"
        title="You're offline."
        description="We'll reconnect automatically."
      />,
    );

    expect(container.querySelector('.haru-alert__icon svg')).toBeTruthy();
    expect(screen.getByText("You're offline.")).toBeTruthy();
    expect(screen.getByText("We'll reconnect automatically.")).toBeTruthy();
  });

  it('renders a dismiss control only when both handler and label are given', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<InlineAlert tone="info" title="Saved." onDismiss={onDismiss} />);
    expect(screen.queryByRole('button')).toBeNull();

    rerender(
      <InlineAlert tone="info" title="Saved." onDismiss={onDismiss} dismissLabel="Dismiss" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('runs the inline action', () => {
    const onPress = vi.fn();
    render(
      <InlineAlert
        tone="error"
        title="Part of this list is missing."
        action={{ label: 'Try again', onPress }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onPress).toHaveBeenCalledOnce();
  });
});
