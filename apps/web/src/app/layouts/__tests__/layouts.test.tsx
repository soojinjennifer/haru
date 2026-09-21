import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { appCopy } from '../../../shared/copy/app-copy';
import { FullscreenLayout } from '../FullscreenLayout';
import { StackLayout } from '../StackLayout';
import { TabLayout } from '../TabLayout';

function renderInRouter(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

describe('Layout 3종 (Design Spec §2.3)', () => {
  it('StackLayout 은 TopBar · 콘텐츠 · 하단 CTA 슬롯을 렌더한다', () => {
    renderInRouter(
      <StackLayout topBar={<p>top</p>} footer={<p>cta</p>}>
        <p>content</p>
      </StackLayout>,
    );

    expect(screen.getByText('top')).toBeDefined();
    expect(screen.getByText('content')).toBeDefined();
    expect(screen.getByText('cta')).toBeDefined();
    expect(screen.getByRole('main', { name: appCopy.landmarks.mainContent })).toBeDefined();
  });

  it('StackLayout 은 슬롯을 주지 않으면 해당 영역을 렌더하지 않는다', () => {
    const { container } = renderInRouter(
      <StackLayout>
        <p>content</p>
      </StackLayout>,
    );

    // main 안의 콘텐츠 래퍼 하나만 남는다 (TopBar · footer 영역 없음).
    const main = container.querySelector('main');
    expect(main?.children.length).toBe(1);
  });

  it('TabLayout 은 tabBar 를 주지 않으면 탭 영역을 렌더하지 않는다 (Stage 1 `/` 기준)', () => {
    renderInRouter(
      <TabLayout>
        <p>content</p>
      </TabLayout>,
    );

    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('TabLayout 은 tabBar 를 주면 콘텐츠 아래에 렌더한다', () => {
    renderInRouter(
      <TabLayout tabBar={<nav aria-label="tabs">tabs</nav>}>
        <p>content</p>
      </TabLayout>,
    );

    expect(screen.getByRole('navigation', { name: 'tabs' })).toBeDefined();
  });

  it('FullscreenLayout 은 스크롤 없이 콘텐츠와 하단 영역을 렌더한다', () => {
    const { container } = renderInRouter(
      <FullscreenLayout footer={<p>controls</p>}>
        <p>content</p>
      </FullscreenLayout>,
    );

    const main = container.querySelector('main');
    expect(main?.className).toContain('overflow-hidden');
    expect(screen.getByText('controls')).toBeDefined();
  });

  it('모든 Layout 은 앱 컬럼(AppColumn)과 배경 레이어를 포함한다', () => {
    const { container } = renderInRouter(
      <StackLayout>
        <p>content</p>
      </StackLayout>,
    );

    expect(container.querySelector('.haru-app-column')).not.toBeNull();
    expect(container.querySelector('.haru-app-background')).not.toBeNull();
  });
});
