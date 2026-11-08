/**
 * `D4-128` — 세션 화면 문구 전용 Toast = 3000ms, 버튼 있는 Toast = 6000ms 유지, 세션 밖 기본 = 4000ms 유지.
 * 시간은 가짜 타이머로 정확히 넘긴다 (`S4-H3F`).
 */
import { ToastProvider, useToast } from '@haru/ui';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SESSION_TOAST_DURATION_MS, useSessionToast } from '../useSessionToast';

/** 퇴장 모션 (`MOTION_DURATION_MS.fast`) 보다 넉넉한 여유. */
const EXIT_MARGIN_MS = 400;

function Host() {
  const sessionToast = useSessionToast();
  const appToast = useToast();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          sessionToast.show({ message: 'session text' });
        }}
      >
        session-text
      </button>
      <button
        type="button"
        onClick={() => {
          sessionToast.show({
            message: 'session action',
            dismissLabel: 'Dismiss',
            action: { label: 'Try again', onPress: () => undefined },
          });
        }}
      >
        session-action
      </button>
      <button
        type="button"
        onClick={() => {
          appToast.show({ message: 'app text' });
        }}
      >
        app-text
      </button>
    </>
  );
}

function renderHost(): void {
  render(
    <ToastProvider>
      <Host />
    </ToastProvider>,
  );
}

function open(name: string): void {
  act(() => {
    fireEvent.click(screen.getByRole('button', { name }));
  });
}

function pass(ms: number): void {
  for (let passed = 0; passed < ms; passed += 100) {
    act(() => {
      vi.advanceTimersByTime(Math.min(100, ms - passed));
    });
  }
}

function shown(message: string): boolean {
  return [...document.querySelectorAll('.haru-toast')].some((node) =>
    (node.textContent ?? '').includes(message),
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('`D4-128` — 세션 화면 Toast 표시 시간', () => {
  it('상수 = 3000', () => {
    expect(SESSION_TOAST_DURATION_MS).toBe(3000);
  });

  it('문구 전용 → 2999ms 까지 보이고 3000ms 에 닫힌다', () => {
    vi.useFakeTimers();
    renderHost();
    open('session-text');
    pass(2_999);
    expect(shown('session text')).toBe(true);
    pass(1 + EXIT_MARGIN_MS);
    expect(shown('session text')).toBe(false);
  });

  it('버튼 있는 Toast → 3000ms 를 넘겨도 남고 6000ms 에 닫힌다', () => {
    vi.useFakeTimers();
    renderHost();
    open('session-action');
    pass(5_999);
    expect(shown('session action')).toBe(true);
    pass(1 + EXIT_MARGIN_MS);
    expect(shown('session action')).toBe(false);
  });

  it('세션 밖(기본 `useToast`) 문구 전용 → 4000ms 그대로', () => {
    vi.useFakeTimers();
    renderHost();
    open('app-text');
    pass(3_999);
    expect(shown('app text')).toBe(true);
    pass(1 + EXIT_MARGIN_MS);
    expect(shown('app text')).toBe(false);
  });
});
