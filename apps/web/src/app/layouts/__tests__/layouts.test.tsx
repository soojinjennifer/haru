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

    // 잘라내는 지점은 main 이 아니라 앱 컬럼 바깥의 AppShell 뷰포트다 (그림자 클리핑 방지).
    const viewport = container.querySelector('[data-app-shell-viewport]');
    expect(viewport?.className).toContain('overflow-hidden');
    expect(container.querySelector('main')?.className).not.toContain('overflow');
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

/**
 * 그림자 클리핑 회귀 방지 — 구조 불변식.
 *
 * `overflow-y: auto | hidden` 인 요소는 `overflow-x` 가 `visible` 로 남을 수 없어 **가로
 * 클리핑 박스**가 된다. 그 박스가 앱 컬럼 안쪽(= 콘텐츠 폭)에 있으면 카드 그림자가 카드
 * 좌우에서 직사각형으로 잘린다. 따라서 클리핑 박스는 앱 컬럼 **바깥**에 딱 하나만 있어야 한다.
 *
 * 실제 렌더 픽셀 확인은 `e2e/shadow.spec.ts` 가 4개 폭에서 수행한다.
 */
describe('클리핑 박스는 앱 컬럼 바깥에만 있다 (카드 그림자 잘림 회귀 방지)', () => {
  const CASES = [
    {
      name: 'StackLayout',
      node: (
        <StackLayout topBar={<p>top</p>} footer={<p>cta</p>}>
          <p>content</p>
        </StackLayout>
      ),
      expectedOverflow: 'overflow-y-auto',
    },
    {
      name: 'TabLayout',
      node: (
        <TabLayout topBar={<p>top</p>} tabBar={<nav aria-label="tabs">tabs</nav>}>
          <p>content</p>
        </TabLayout>
      ),
      expectedOverflow: 'overflow-y-auto',
    },
    {
      name: 'FullscreenLayout',
      node: (
        <FullscreenLayout topBar={<p>top</p>} footer={<p>controls</p>}>
          <p>content</p>
        </FullscreenLayout>
      ),
      expectedOverflow: 'overflow-hidden',
    },
  ] as const;

  for (const layout of CASES) {
    it(`${layout.name} — 스크롤/클리핑 컨테이너가 앱 컬럼을 감싼다`, () => {
      const { container } = renderInRouter(layout.node);

      const viewport = container.querySelector('[data-app-shell-viewport]');
      const column = container.querySelector('.haru-app-column');

      expect(viewport).not.toBeNull();
      expect(column).not.toBeNull();
      expect(viewport?.className).toContain(layout.expectedOverflow);
      // 순서가 뒤집히면(컬럼이 바깥, 스크롤이 안쪽) 여기서 실패한다.
      expect(viewport?.contains(column as Node)).toBe(true);
      expect(column?.contains(viewport as Node)).toBe(false);
    });

    it(`${layout.name} — 앱 컬럼 안쪽에는 overflow 컨테이너가 없다`, () => {
      const { container } = renderInRouter(layout.node);

      const column = container.querySelector('.haru-app-column');
      const offenders = [...(column?.querySelectorAll('[class]') ?? [])]
        .filter((element) => /(^|\s)overflow-/.test(element.getAttribute('class') ?? ''))
        .map(
          (element) => `${element.tagName.toLowerCase()}.${element.getAttribute('class') ?? ''}`,
        );

      expect(offenders).toStrictEqual([]);
    });
  }

  it('TabLayout 의 BottomTabBar 는 스크롤 콘텐츠(main) 밖의 sticky 행이다', () => {
    const { container } = renderInRouter(
      <TabLayout tabBar={<nav aria-label="tabs">tabs</nav>}>
        <p>content</p>
      </TabLayout>,
    );

    const main = container.querySelector('main');
    const tabs = screen.getByRole('navigation', { name: 'tabs' });
    const wrapper = tabs.parentElement;

    expect(main?.contains(tabs)).toBe(false);
    expect(wrapper?.className).toContain('haru-app-shell__bar-bottom');
    // main 다음 형제여야 콘텐츠 아래에 붙는다.
    expect(main?.nextElementSibling).toBe(wrapper);
  });

  it('TopBar 영역은 sticky 로 고정된다 (스크롤해도 사라지지 않는다)', () => {
    const { container } = renderInRouter(
      <StackLayout topBar={<p>top</p>}>
        <p>content</p>
      </StackLayout>,
    );

    const wrapper = screen.getByText('top').parentElement;
    expect(wrapper?.className).toContain('haru-app-shell__bar-top');
    expect(container.querySelector('main')?.previousElementSibling).toBe(wrapper);
  });
});
