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

/*
 * `D4-39` (AC-4-123 ③⑥) — 선택 prop `titleId`. 다른 요소가 배너 문구를 `aria-describedby` 로
 * 가리킬 수 있게 제목에 id 를 준다. 주지 않으면 DOM 이 바뀌지 않는다 (기존 baseline 불변).
 */
describe('InlineAlert titleId (D4-39)', () => {
  it('puts the id on the title element so another control can be described by it', () => {
    render(
      <>
        <InlineAlert
          tone="offline"
          placement="banner"
          title="Go online to start a session"
          titleId="t-1"
        />
        <button type="button" aria-describedby="t-1">
          Start Session
        </button>
      </>,
    );
    const title = document.getElementById('t-1');
    expect(title?.textContent).toBe('Go online to start a session');
    expect(title?.closest('.haru-alert')).not.toBeNull();
  });

  it('renders no id attribute at all when titleId is omitted (DOM unchanged)', () => {
    const { container } = render(<InlineAlert tone="offline" title="Offline." />);
    expect(container.querySelectorAll('[id]')).toHaveLength(0);
  });
});
