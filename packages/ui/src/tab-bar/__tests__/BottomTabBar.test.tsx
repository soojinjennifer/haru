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

  it('always shows the label next to the icon (PRD §11 텍스트 의존 최소화)', () => {
    const { container } = render(
      <BottomTabBar items={items} activeKey="home" onSelect={() => {}} />,
    );

    expect(container.querySelectorAll('.haru-tab-bar__icon')).toHaveLength(3);
    expect(screen.getByText('Home')).toBeTruthy();
  });
});
