import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from '../../button/Button';
import { Sheet } from '../Sheet';

describe('Sheet', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing while closed', () => {
    render(
      <Sheet open={false} onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is a modal dialog labelled by its title (§4.21)', () => {
    render(
      <Sheet open onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Prompts' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('moves focus inside on open and returns it to the trigger on close', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();

    const { rerender } = render(
      <Sheet open onClose={() => {}} title="Prompts">
        <Button onPress={() => {}}>Close</Button>
      </Sheet>,
    );

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));

    rerender(
      <Sheet open={false} onClose={() => {}} title="Prompts">
        <Button onPress={() => {}}>Close</Button>
      </Sheet>,
    );
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('closes on Escape when dismissible, and stays open otherwise', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Sheet open onClose={onClose} title="Prompts">
        <p>body</p>
      </Sheet>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();

    rerender(
      <Sheet open onClose={onClose} title="Prompts" dismissible={false}>
        <p>body</p>
      </Sheet>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps Tab focus inside the sheet', () => {
    render(
      <Sheet open onClose={() => {}} title="Prompts">
        <Button onPress={() => {}}>First</Button>
        <Button onPress={() => {}}>Last</Button>
      </Sheet>,
    );

    const last = screen.getByRole('button', { name: 'Last' });
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First' }));
  });

  it('locks background scrolling while open and restores it after the exit motion', () => {
    const { rerender } = render(
      <Sheet open onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Sheet open={false} onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );
    act(() => {
      vi.advanceTimersByTime(240);
    });
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
