import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('announces a whole-screen failure and offers retry inside the card (§5.3)', () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="We couldn't load this right now."
        description="Check your connection and try again."
        onRetry={onRetry}
        retryLabel="Try again"
      />,
    );

    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('uses role=status for a partial failure', () => {
    render(<ErrorState title="Part of this list is missing." announce="status" />);

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps the retry button focusable while retrying (loading, not disabled)', () => {
    render(
      <ErrorState title="Still loading." onRetry={() => {}} retryLabel="Try again" retrying />,
    );

    const button = screen.getByRole('button', { name: 'Try again' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('renders no retry button without a label + handler pair', () => {
    render(<ErrorState title="No retry here." />);

    expect(screen.queryByRole('button')).toBeNull();
  });
});

/*
 * `D5-10` (`VG5C-2`) — `announce="none"` 은 자체 live role 을 끈다. 기본값은 그대로 `alert`.
 */
describe('ErrorState announce (D5-10)', () => {
  it('defaults to role=alert exactly as before', () => {
    const { container } = render(<ErrorState title="Oops." />);
    expect(container.querySelector('.haru-state')?.getAttribute('role')).toBe('alert');
  });

  it('announce="none" renders no role and no aria-live, content intact', () => {
    const onRetry = vi.fn();
    const { container } = render(
      <ErrorState
        title="Quiet failure."
        description="Body."
        onRetry={onRetry}
        retryLabel="Try again"
        announce="none"
      />,
    );
    const root = container.querySelector('.haru-state');
    expect(root?.hasAttribute('role')).toBe(false);
    expect(container.querySelector('[role="alert"], [role="status"], [aria-live]')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Quiet failure.' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('only the role attribute differs from the default render', () => {
    const a = render(<ErrorState title="Same." description="Body." tone="offline" />);
    const withRole = a.container.innerHTML;
    a.unmount();
    const b = render(
      <ErrorState title="Same." description="Body." tone="offline" announce="none" />,
    );
    expect(b.container.innerHTML).toBe(withRole.replace(' role="alert"', ''));
  });
});

describe('EmptyState', () => {
  it('is ordinary content — no alert role — with a heading (§4.10)', () => {
    render(<EmptyState title="Nothing here yet." description="Add your first book." />);

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Nothing here yet.' })).toBeTruthy();
  });

  it('renders the optional action', () => {
    const onPress = vi.fn();
    render(<EmptyState title="Nothing here yet." action={{ label: 'Add a book', onPress }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add a book' }));
    expect(onPress).toHaveBeenCalledOnce();
  });
});
