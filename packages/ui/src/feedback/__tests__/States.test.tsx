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
