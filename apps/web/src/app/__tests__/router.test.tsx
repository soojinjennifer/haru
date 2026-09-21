import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { appCopy } from '../../shared/copy/app-copy';
import { AppRoutes } from '../router';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe('AppRoutes (Plan §5.4)', () => {
  it('`/` 는 임시 placeholder 화면을 렌더한다', () => {
    renderAt('/');

    expect(
      screen.getByRole('heading', { level: 1, name: appCopy.placeholder.title }),
    ).toBeDefined();
    expect(screen.getByText(appCopy.placeholder.description)).toBeDefined();
  });

  it('알 수 없는 경로는 NotFound 화면을 렌더한다', () => {
    renderAt('/does-not-exist');

    expect(screen.getByRole('heading', { level: 1, name: appCopy.notFound.title })).toBeDefined();
    expect(screen.getByRole('button', { name: appCopy.notFound.actionLabel })).toBeDefined();
  });

  it('두 route 모두 main 랜드마크를 가진 Layout 안에서 렌더된다', () => {
    renderAt('/');

    expect(screen.getByRole('main', { name: appCopy.landmarks.mainContent })).toBeDefined();
  });
});
