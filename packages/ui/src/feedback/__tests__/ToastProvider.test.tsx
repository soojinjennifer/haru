import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ToastProvider, useToast, useToastPresent } from '../ToastProvider';

function Trigger({ message, tone }: { message: string; tone?: 'neutral' | 'error' }) {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        toast.show(tone === undefined ? { message } : { message, tone });
      }}
    >
      show {message}
    </button>
  );
}

function PresenceProbe() {
  return <output data-testid="present">{String(useToastPresent())}</output>;
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows one toast at a time and replaces it instead of queueing (§4.12)', () => {
    render(
      <ToastProvider>
        <Trigger message="Saved" />
        <Trigger message="Copied" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'show Saved' }));
    expect(screen.getByText('Saved')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'show Copied' }));
    expect(screen.queryByText('Saved')).toBeNull();
    expect(screen.getAllByText('Copied')).toHaveLength(1);
  });

  it('reports presence until the exit animation has finished (`D4-100`)', () => {
    render(
      <ToastProvider>
        <Trigger message="Saved" />
        <PresenceProbe />
      </ToastProvider>,
    );
    const present = () => screen.getByTestId('present').textContent;

    expect(present()).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'show Saved' }));
    expect(present()).toBe('true');
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(present()).toBe('true');
    act(() => {
      vi.advanceTimersByTime(180);
    });
    expect(present()).toBe('false');
  });

  it('announces politely and does not move focus', () => {
    render(
      <ToastProvider>
        <Trigger message="Saved" />
      </ToastProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'show Saved' });
    trigger.focus();
    fireEvent.click(trigger);

    const toast = screen.getByRole('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
    expect(toast.getAttribute('aria-atomic')).toBe('true');
    expect(document.activeElement).toBe(trigger);
  });

  it('announces error toasts assertively', () => {
    render(
      <ToastProvider>
        <Trigger message="Upload paused" tone="error" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'show Upload paused' }));
    expect(screen.getByRole('status').getAttribute('aria-live')).toBe('assertive');
  });

  it('auto-dismisses after the default 4000ms and unmounts after the exit motion', () => {
    render(
      <ToastProvider>
        <Trigger message="Saved" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'show Saved' }));
    expect(screen.getByText('Saved')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    // 퇴장 애니메이션 동안에는 아직 남아 있다.
    expect(screen.getByText('Saved')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(180);
    });
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('throws when useToast is used outside the provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger message="Saved" />)).toThrow(/ToastProvider/);
    error.mockRestore();
  });
});
