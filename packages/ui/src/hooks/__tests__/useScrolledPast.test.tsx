import { useRef, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { ScrollContainerProvider } from '../../layout/ScrollContainerContext';
import { useScrolledPast } from '../useScrolledPast';

function Probe({ threshold = 8, enabled = true }: { threshold?: number; enabled?: boolean }) {
  const scrolled = useScrolledPast(threshold, enabled);
  return <output>{scrolled ? 'scrolled' : 'top'}</output>;
}

/** AppShell 과 같은 구조: 스크롤 컨테이너 ref 를 context 로 내려준다 (결정 D-13). */
function WithContainer({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={viewportRef} data-testid="viewport">
      <ScrollContainerProvider value={viewportRef}>{children}</ScrollContainerProvider>
    </div>
  );
}

describe('useScrolledPast (결정 D-13)', () => {
  it('Provider 가 없으면 window 스크롤을 구독한다 (폴백)', () => {
    render(<Probe />);
    expect(screen.getByRole('status').textContent).toBe('top');

    act(() => {
      window.scrollY = 40;
      fireEvent.scroll(window);
    });
    expect(screen.getByRole('status').textContent).toBe('scrolled');

    act(() => {
      window.scrollY = 0;
      fireEvent.scroll(window);
    });
    expect(screen.getByRole('status').textContent).toBe('top');
  });

  it('Provider 가 있으면 window 가 아니라 그 컨테이너의 scrollTop 을 본다', () => {
    render(
      <WithContainer>
        <Probe />
      </WithContainer>,
    );
    const viewport = screen.getByTestId('viewport');

    // window 가 스크롤되어도 컨테이너가 최상단이면 바뀌지 않는다.
    act(() => {
      window.scrollY = 400;
      fireEvent.scroll(window);
    });
    expect(screen.getByRole('status').textContent).toBe('top');

    act(() => {
      viewport.scrollTop = 40;
      fireEvent.scroll(viewport);
    });
    expect(screen.getByRole('status').textContent).toBe('scrolled');

    window.scrollY = 0;
  });

  it('enabled 가 false 면 언제나 false 다 (transparent TopBar)', () => {
    render(
      <WithContainer>
        <Probe enabled={false} />
      </WithContainer>,
    );

    act(() => {
      screen.getByTestId('viewport').scrollTop = 400;
      fireEvent.scroll(screen.getByTestId('viewport'));
    });
    expect(screen.getByRole('status').textContent).toBe('top');
  });
});
