import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appCopy } from '../../../shared/copy/app-copy';
import { AppErrorBoundary } from '../AppErrorBoundary';
import { RouteErrorBoundary } from '../RouteErrorBoundary';

function Boom(): never {
  throw new Error('render failed');
}

/** 첫 렌더에서만 던지고, 리셋 후에는 정상 렌더되는 컴포넌트. */
function BoomOnce({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('render failed');
  return <p>recovered</p>;
}

describe('Error Boundary 2단 (Plan §5.4)', () => {
  beforeEach(() => {
    // React 가 boundary 로 잡힌 오류를 console.error 로 다시 출력한다. 테스트 출력만 조용히 한다.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('AppErrorBoundary 는 오류를 ErrorState 로 렌더한다', () => {
    render(
      <AppErrorBoundary>
        <Boom />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('heading', { level: 1, name: appCopy.appError.title })).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('AppErrorBoundary 의 복구 버튼은 주입된 reload 를 호출한다', () => {
    const onReload = vi.fn();

    render(
      <AppErrorBoundary onReload={onReload}>
        <Boom />
      </AppErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: appCopy.appError.retryLabel }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('AppErrorBoundary 는 정상 렌더를 방해하지 않는다', () => {
    render(
      <AppErrorBoundary>
        <p>fine</p>
      </AppErrorBoundary>,
    );

    expect(screen.getByText('fine')).toBeDefined();
  });

  it('RouteErrorBoundary 는 화면 내용만 ErrorState 로 바꾸고 재시도로 복구한다', () => {
    function Harness() {
      const [shouldThrow, setShouldThrow] = useState(true);
      return (
        <MemoryRouter>
          <button type="button" onClick={() => setShouldThrow(false)}>
            fix
          </button>
          <RouteErrorBoundary>
            <BoomOnce shouldThrow={shouldThrow} />
          </RouteErrorBoundary>
        </MemoryRouter>
      );
    }

    render(<Harness />);

    expect(screen.getByRole('heading', { name: appCopy.routeError.title })).toBeDefined();

    // 원인을 제거한 뒤 재시도하면 같은 route 에서 복구된다.
    fireEvent.click(screen.getByRole('button', { name: 'fix' }));
    fireEvent.click(screen.getByRole('button', { name: appCopy.routeError.retryLabel }));

    expect(screen.getByText('recovered')).toBeDefined();
    expect(screen.queryByRole('heading', { name: appCopy.routeError.title })).toBeNull();
  });
});
