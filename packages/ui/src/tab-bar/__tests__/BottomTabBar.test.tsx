import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { BottomTabBar, type TabBarItem } from '../BottomTabBar';

const items: TabBarItem[] = [
  { key: 'library', label: 'Library', icon: 'book' },
  { key: 'home', label: 'Home', icon: 'haru:tab-center-home', emphasis: 'center' },
  { key: 'progress', label: 'Progress', icon: 'chart-no-axes-column-increasing' },
];

describe('BottomTabBar', () => {
  it('has a named navigation landmark (§6.2)', () => {
    render(<BottomTabBar items={items} activeKey="home" onSelect={() => {}} />);

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy();
  });

  it('shows Library / Home / Progress and no session tab (AC-1-25, #15)', () => {
    render(<BottomTabBar items={items} activeKey="home" onSelect={() => {}} />);

    const labels = screen.getAllByRole('button').map((item) => item.textContent);
    expect(labels).toEqual(['Library', 'Home', 'Progress']);
  });

  it('renders the emphasis=center item in the middle regardless of array order', () => {
    const reordered: TabBarItem[] = [
      { key: 'home', label: 'Home', icon: 'haru:tab-center-home', emphasis: 'center' },
      { key: 'library', label: 'Library', icon: 'book' },
      { key: 'progress', label: 'Progress', icon: 'chart-no-axes-column-increasing' },
    ];
    render(<BottomTabBar items={reordered} activeKey="library" onSelect={() => {}} />);

    expect(screen.getAllByRole('button').map((item) => item.textContent)).toEqual([
      'Library',
      'Home',
      'Progress',
    ]);
  });

  it('marks the active tab with aria-current and reports selection by key', () => {
    const onSelect = vi.fn();
    render(<BottomTabBar items={items} activeKey="library" onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: 'Library' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.getByRole('button', { name: 'Home' }).hasAttribute('aria-current')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Progress' }));
    expect(onSelect).toHaveBeenCalledWith('progress');
  });

  it('renders links when the app injects href (router integration)', () => {
    const withHref = items.map((item) => ({ ...item, href: `/${item.key}` }));
    render(<BottomTabBar items={withHref} activeKey="home" onSelect={() => {}} />);

    expect(screen.getByRole('link', { name: 'Library' }).getAttribute('href')).toBe('/library');
  });

  /*
    `X-1` (2026-10-06) — `<a>` 의 기본 이동을 막지 않으면 SPA 이동과 겹쳐 전체 리로드가 난다.
    ⚠ 이 단위 테스트는 `defaultPrevented` 와 `onSelect` 호출만 본다. jsdom 은 기본 이동을
    **수행하지 않으므로** 리로드 자체는 재현되지 않는다 — 회귀 방어선은 `e2e/tabs.spec.ts` 다.
  */
  it('prevents the browser default on a plain left click so the router owns navigation (X-1)', () => {
    const onSelect = vi.fn();
    const withHref = items.map((item) => ({ ...item, href: `/${item.key}` }));
    render(<BottomTabBar items={withHref} activeKey="home" onSelect={onSelect} />);

    // `fireEvent` 는 preventDefault 되면 false 를 돌려준다.
    const notCancelled = fireEvent.click(screen.getByRole('link', { name: 'Library' }));

    expect(notCancelled).toBe(false);
    expect(onSelect).toHaveBeenCalledWith('library');
  });

  it.each([
    ['metaKey', { metaKey: true }],
    ['ctrlKey', { ctrlKey: true }],
    ['shiftKey', { shiftKey: true }],
    ['altKey', { altKey: true }],
    ['middle button', { button: 1 }],
  ])('leaves link semantics intact for %s clicks (§6.2)', (_label, init) => {
    const onSelect = vi.fn();
    const withHref = items.map((item) => ({ ...item, href: `/${item.key}` }));
    render(<BottomTabBar items={withHref} activeKey="home" onSelect={onSelect} />);

    const notCancelled = fireEvent.click(screen.getByRole('link', { name: 'Library' }), init);

    // 기본 동작을 브라우저에 넘기고, 현재 탭은 이동시키지 않는다.
    expect(notCancelled).toBe(true);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('still selects on a plain click when no href is injected (button branch)', () => {
    const onSelect = vi.fn();
    render(<BottomTabBar items={items} activeKey="home" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Library' }));

    expect(onSelect).toHaveBeenCalledWith('library');
  });

  it('always shows the label next to the icon (PRD §11 텍스트 의존 최소화)', () => {
    const { container } = render(
      <BottomTabBar items={items} activeKey="home" onSelect={() => {}} />,
    );

    expect(container.querySelectorAll('.haru-tab-bar__icon')).toHaveLength(3);
    expect(screen.getByText('Home')).toBeTruthy();
  });
});
