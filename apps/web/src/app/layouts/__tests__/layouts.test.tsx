import { ToastProvider, useScrollContainerRef, useToast } from '@haru/ui';
import { render, screen } from '@testing-library/react';
import { useEffect, type RefObject } from 'react';
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

  it('FullscreenLayout 은 콘텐츠와 하단 영역을 렌더하고 스크롤은 뷰포트가 맡는다 (D4-82)', () => {
    const { container } = renderInRouter(
      <FullscreenLayout footer={<p>controls</p>}>
        <p>content</p>
      </FullscreenLayout>,
    );

    // 스크롤 지점은 main 이 아니라 앱 컬럼 바깥의 AppShell 뷰포트다 (그림자 클리핑 방지).
    const viewport = container.querySelector('[data-app-shell-viewport]');
    expect(viewport?.className).toContain('overflow-y-auto');
    expect(viewport?.className).toContain('overscroll-contain');
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
 * Toast **상단** 보정이 실제로 적용되는지 (사용자 결정 2026-10-10).
 *
 * Toast 는 하단 → 상단으로 옮겨졌다. 하단 시절의 결함(`QA-3-004` — 아무도 수식어를 붙이지
 * 않아 Toast 가 탭 3개를 덮었다)이 **반대 방향으로** 재현되지 않게, 보정 등록 지점이 실제로
 * 호출되는지를 여기에서 고정한다.
 *
 * 이 결함을 놓친 가드는 `stage3-css-guards.test.ts` 였다 — 규칙 **안에 토큰이 있는지만** 보고
 * 그 클래스가 붙는지는 보지 않았다. CSS 문자열 검사는 "선언이 존재한다" 만 증명한다
 * (approvals §26.3).
 *
 * jsdom 에는 레이아웃이 없으므로 **클래스 적용**과 (rect 를 고정했을 때의) **실측값 전달**이
 * 여기에서 셀 수 있는 신호다. 실제 좌표·hit-test 는 `e2e/toast.spec.ts` 가 393px 에서 잰다.
 */
describe('Toast 상단 보정 배선 (2026-10-10)', () => {
  const MODIFIER = 'haru-toast-viewport--below-top-bar';

  function Trigger() {
    const toast = useToast();
    useEffect(() => {
      toast.show({ message: 'probe' });
    }, [toast]);
    return null;
  }

  function viewport(): HTMLElement {
    const node = document.querySelector('.haru-toast-viewport');
    if (node === null) throw new Error('Toast viewport 가 렌더되지 않았다');
    return node as HTMLElement;
  }

  function renderWithToast(node: React.ReactNode) {
    return render(
      <MemoryRouter>
        <ToastProvider>{node}</ToastProvider>
      </MemoryRouter>,
    );
  }

  it('TabLayout + topBar → 상단 보정 수식어가 붙는다', () => {
    renderWithToast(
      <TabLayout topBar={<p>top</p>} tabBar={<nav aria-label="tabs">tabs</nav>}>
        <Trigger />
      </TabLayout>,
    );

    expect(viewport().className).toContain(MODIFIER);
  });

  /* TopBar 가 없으면 보정도 없다 — 하드코딩 `true` 로 때우면 이 단정이 깨진다. */
  it('TabLayout 이지만 topBar 가 없으면 보정하지 않는다', () => {
    renderWithToast(
      <TabLayout tabBar={<nav aria-label="tabs">tabs</nav>}>
        <Trigger />
      </TabLayout>,
    );

    expect(viewport().className).not.toContain(MODIFIER);
  });

  /*
    **하단 시절과 달리 스택·풀스크린 화면도 보정 대상이다.** TopBar 는 탭 화면 전용이 아니다
    (`/settings` · `/auth/*` · `/library/add` 모두 StackLayout + TopBar).
  */
  it.each([
    [
      'StackLayout',
      <StackLayout key="stack" topBar={<p>top</p>}>
        <Trigger />
      </StackLayout>,
    ],
    [
      'FullscreenLayout',
      <FullscreenLayout key="full" topBar={<p>top</p>}>
        <Trigger />
      </FullscreenLayout>,
    ],
  ])('%s + topBar 도 보정한다', (_name, node) => {
    renderWithToast(node);

    expect(viewport().className).toContain(MODIFIER);
  });

  it.each([
    [
      'StackLayout',
      <StackLayout key="stack">
        <Trigger />
      </StackLayout>,
    ],
    [
      'FullscreenLayout',
      <FullscreenLayout key="full">
        <Trigger />
      </FullscreenLayout>,
    ],
  ])('%s 에 topBar 가 없으면 보정하지 않는다 (온보딩 회귀 방지)', (_name, node) => {
    renderWithToast(node);

    expect(viewport().className).not.toContain(MODIFIER);
  });

  /* TopBar 있는 화면 → 없는 화면 이동에서 보정이 **풀린다**. */
  it('TopBar 없는 화면으로 바뀌면 보정이 해제된다', () => {
    const { rerender } = render(
      <MemoryRouter>
        <ToastProvider>
          <TabLayout topBar={<p>top</p>} tabBar={<nav aria-label="tabs">tabs</nav>}>
            <Trigger />
          </TabLayout>
        </ToastProvider>
      </MemoryRouter>,
    );

    expect(viewport().className).toContain(MODIFIER);

    rerender(
      <MemoryRouter>
        <ToastProvider>
          <StackLayout>
            <Trigger />
          </StackLayout>
        </ToastProvider>
      </MemoryRouter>,
    );

    expect(viewport().className).not.toContain(MODIFIER);
  });

  /*
    **실측값이 실제로 넘어간다.** 수식어만 보면 "보정하기로 했다" 까지만 증명된다 — 보정량이
    0 이면 TopBar 는 여전히 가려진다. jsdom 은 모든 rect 가 0 이므로 rect 를 고정해서
    등록 → 측정 → CSS 변수 경로가 끊기지 않았는지 본다.
  */
  it('등록된 TopBar 슬롯 높이를 CSS 변수로 넘긴다', () => {
    const original = HTMLDivElement.prototype.getBoundingClientRect;
    HTMLDivElement.prototype.getBoundingClientRect = function rect(this: HTMLDivElement) {
      const height = this.classList.contains('haru-app-shell__bar-top') ? 48 : 0;
      return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: height, width: 0, height } as DOMRect;
    };

    try {
      renderWithToast(
        <TabLayout topBar={<p>top</p>} tabBar={<nav aria-label="tabs">tabs</nav>}>
          <Trigger />
        </TabLayout>,
      );

      expect(viewport().style.getPropertyValue('--toast-top-bar-block-size')).toBe('48px');
    } finally {
      HTMLDivElement.prototype.getBoundingClientRect = original;
    }
  });

  /* 측정이 0 이면 변수를 넘기지 않는다 — CSS 의 `--topbar-height` fallback 이 살아야 한다. */
  it('측정값이 0 이면 CSS 변수를 넘기지 않는다 (fallback 유지)', () => {
    renderWithToast(
      <TabLayout topBar={<p>top</p>}>
        <Trigger />
      </TabLayout>,
    );

    expect(viewport().style.getPropertyValue('--toast-top-bar-block-size')).toBe('');
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
      expectedOverflow: 'overflow-y-auto',
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

  /**
   * 결정 `D-13` — 스크롤 주체는 window 가 아니라 AppShell 뷰포트다.
   * `packages/ui` 의 `useScrolledPast`(TopBar) 가 그 요소를 구독할 수 있어야 한다.
   */
  it('AppShell 이 스크롤 컨테이너 ref 를 context 로 내려준다 (D-13)', () => {
    const captured: { ref: RefObject<HTMLElement | null> | null } = { ref: null };

    function Probe() {
      const containerRef = useScrollContainerRef();
      useEffect(() => {
        captured.ref = containerRef;
      }, [containerRef]);
      return <p>probe</p>;
    }

    const { container } = renderInRouter(
      <StackLayout>
        <Probe />
      </StackLayout>,
    );

    const viewport = container.querySelector('[data-app-shell-viewport]');
    expect(viewport).not.toBeNull();
    // ref 는 window 가 아니라 앱 컬럼 바깥의 스크롤 뷰포트를 가리킨다.
    expect(captured.ref?.current).toBe(viewport);
  });

  /**
   * 회귀 방지 — 배경이 콘텐츠를 덮는 문제.
   *
   * `AppBackground` 는 `position: fixed` + `z-index: 0` 이라 **위치 지정 요소 단계**에서
   * 그려진다. 그 단계는 일반 흐름 콘텐츠보다 뒤이므로, 스크롤 뷰포트가 위치 지정 요소가
   * 아니면 그 안의 평범한 텍스트·이미지가 배경에 덮여 **보이지 않는다**
   * (DOM 순서와 무관하다). Stage 1 화면은 모든 콘텐츠가 `backdrop-filter` 를 쓰는 Surface
   * 안에 있어 증상이 드러나지 않았고, Stage 2 Welcome 화면에서 처음 관찰되었다.
   */
  it.each([
    [
      'StackLayout',
      <StackLayout key="stack">
        <p>content</p>
      </StackLayout>,
    ],
    [
      'TabLayout',
      <TabLayout key="tab">
        <p>content</p>
      </TabLayout>,
    ],
    [
      'FullscreenLayout',
      <FullscreenLayout key="full">
        <p>content</p>
      </FullscreenLayout>,
    ],
  ])('%s — 스크롤 뷰포트가 위치 지정 요소다 (배경이 콘텐츠를 덮지 않도록)', (_name, node) => {
    const { container } = renderInRouter(node);
    const viewport = container.querySelector('[data-app-shell-viewport]');

    expect(viewport?.className).toContain('relative');
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
