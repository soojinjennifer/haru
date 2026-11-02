import { ToastProvider, useToast } from '@haru/ui';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SUBMIT_ENTRY, useStickerEntrance } from '../useStickerEntrance';

const TOAST_MS = 4000;
const EXIT_MS = 180;

function Probe() {
  return <output data-testid="entrance">{useStickerEntrance()}</output>;
}

/** `Submit` 순서를 재현한다 — Toast 를 띄운 뒤 완료 화면을 마운트한다. */
function Host({ showToast = true }: { showToast?: boolean }) {
  const toast = useToast();
  const [entered, setEntered] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (showToast) toast.show({ message: 'Submitted' });
          setEntered(true);
        }}
      >
        enter
      </button>
      <button
        type="button"
        onClick={() => {
          toast.dismiss();
        }}
      >
        dismiss
      </button>
      <button
        type="button"
        onClick={() => {
          toast.show({ message: 'Other' });
        }}
      >
        replace
      </button>
      <button
        type="button"
        onClick={() => {
          setEntered(false);
        }}
      >
        leave
      </button>
      {entered ? <Probe /> : null}
    </>
  );
}

function setup(state: unknown, showToast?: boolean) {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/session/1/complete', state }]}>
      <ToastProvider>
        <Host {...(showToast === undefined ? {} : { showToast })} />
      </ToastProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'enter' }));
}

const entrance = () => screen.getByTestId('entrance').textContent;
const press = (name: string) => {
  fireEvent.click(screen.getByRole('button', { name }));
};
const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe('useStickerEntrance (`D4-100`)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('holds while the toast is on screen and plays only after its exit has finished', () => {
    setup(SUBMIT_ENTRY);
    expect(entrance()).toBe('held');
    advance(TOAST_MS);
    expect(entrance()).toBe('held'); // 퇴장 애니메이션 중
    advance(EXIT_MS);
    expect(entrance()).toBe('play');
  });

  it('keeps the same timing under reduced motion — only the CSS animation differs (`D4-106`)', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
    }));
    setup(SUBMIT_ENTRY);
    expect(entrance()).toBe('held');
    advance(TOAST_MS);
    advance(EXIT_MS);
    expect(entrance()).toBe('play');
  });

  it('plays when the toast is dismissed early', () => {
    setup(SUBMIT_ENTRY);
    press('dismiss');
    advance(EXIT_MS);
    expect(entrance()).toBe('play');
  });

  it('keeps holding through a replacement and still plays when that toast leaves', () => {
    setup(SUBMIT_ENTRY);
    advance(TOAST_MS - 1000);
    press('replace');
    advance(TOAST_MS - 1);
    expect(entrance()).toBe('held');
    advance(1);
    advance(EXIT_MS);
    expect(entrance()).toBe('play');
  });

  it('never returns to held once played', () => {
    setup(SUBMIT_ENTRY);
    advance(TOAST_MS);
    advance(EXIT_MS);
    press('replace');
    expect(entrance()).toBe('play');
  });

  it('shows at once on the Submit route when no toast is up', () => {
    setup(SUBMIT_ENTRY, false);
    expect(entrance()).toBe('static');
  });

  it('shows at once on re-entry even with an unrelated toast up', () => {
    setup(null);
    expect(entrance()).toBe('static');
  });

  it('survives unmounting while held — nothing pending fires', () => {
    setup(SUBMIT_ENTRY);
    press('leave');
    advance(TOAST_MS);
    advance(EXIT_MS);
    expect(screen.queryByTestId('entrance')).toBeNull();
  });
});
