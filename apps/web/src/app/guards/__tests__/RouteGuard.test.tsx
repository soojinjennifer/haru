import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { RouteGuard, type GuardDecision } from '../RouteGuard';

/** 판정은 주입한다 — 판정 규칙 자체는 `resolveGuardDecision.test.ts` 가 전수로 검증한다. */
function renderGuard(decision: GuardDecision) {
  return render(
    <MemoryRouter initialEntries={['/guarded']}>
      <Routes>
        <Route
          path="/guarded"
          element={
            <RouteGuard useDecision={() => decision}>
              <p>guarded</p>
            </RouteGuard>
          }
        />
        <Route path="/elsewhere" element={<p>elsewhere</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RouteGuard — 판정 결과 렌더', () => {
  it('allow 면 children 을 그대로 렌더한다', () => {
    renderGuard({ status: 'allow' });

    expect(screen.getByText('guarded')).toBeDefined();
  });

  it('pending 이면 children 대신 로딩 표시를 렌더한다 (AC-2-44)', () => {
    renderGuard({ status: 'pending' });

    expect(screen.queryByText('guarded')).toBeNull();
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('redirect 면 지정한 경로로 이동한다', () => {
    renderGuard({ status: 'redirect', to: '/elsewhere' });

    expect(screen.queryByText('guarded')).toBeNull();
    expect(screen.getByText('elsewhere')).toBeDefined();
  });

  it('fallback 을 주면 pending 동안 그것을 렌더한다', () => {
    render(
      <MemoryRouter>
        <RouteGuard useDecision={() => ({ status: 'pending' })} fallback={<p>waiting</p>}>
          <p>guarded</p>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText('waiting')).toBeDefined();
  });
});
