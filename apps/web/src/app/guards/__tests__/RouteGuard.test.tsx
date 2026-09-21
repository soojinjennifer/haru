import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { RouteGuard, useGuardDecision, type GuardDecision } from '../RouteGuard';

describe('RouteGuard (Plan §5.4 — shell)', () => {
  it('Stage 1 기본 판정은 항상 allow 다', () => {
    const { result } = renderHookDecision();
    expect(result).toStrictEqual({ status: 'allow' });
  });

  it('allow 면 children 을 그대로 렌더한다', () => {
    render(
      <MemoryRouter>
        <RouteGuard>
          <p>guarded</p>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText('guarded')).toBeDefined();
  });

  it('pending 이면 children 대신 로딩 표시를 렌더한다', () => {
    render(
      <MemoryRouter>
        <RouteGuard useDecision={() => ({ status: 'pending' })}>
          <p>guarded</p>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.queryByText('guarded')).toBeNull();
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('redirect 면 지정한 경로로 이동한다', () => {
    render(
      <MemoryRouter initialEntries={['/guarded']}>
        <Routes>
          <Route
            path="/guarded"
            element={
              <RouteGuard useDecision={() => ({ status: 'redirect', to: '/elsewhere' })}>
                <p>guarded</p>
              </RouteGuard>
            }
          />
          <Route path="/elsewhere" element={<p>elsewhere</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('guarded')).toBeNull();
    expect(screen.getByText('elsewhere')).toBeDefined();
  });
});

/** hook 을 직접 호출하기 위한 최소 렌더 헬퍼. */
function renderHookDecision(): { result: GuardDecision } {
  const captured: { result: GuardDecision } = { result: { status: 'pending' } };

  function Probe() {
    captured.result = useGuardDecision();
    return null;
  }

  render(<Probe />);
  return captured;
}
