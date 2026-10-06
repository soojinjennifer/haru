import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { SectionHeader } from '../SectionHeader';

/**
 * SectionHeader — Library Design Spec §3.1 · §9.2 · §9.4.
 *
 * 핵심은 **두 모드**다: `action`(`<button>`) / `meta`(비대화형 `<span>`).
 * `3 of 5 nights` 가 버튼이 되면 안 된다 (`L-OPEN-17`).
 */
describe('SectionHeader — action 모드', () => {
  it('제목은 heading 이고 액션은 button 이다', () => {
    render(
      <SectionHeader title="Favorites" action={{ label: 'See all', onPress: () => undefined }} />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Favorites' })).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
  });

  /*
   * §9.4 — "See all" 3개가 같은 이름이면 스크린리더에서 구분되지 않는다.
   * 문자열을 조립하지 않고 `aria-labelledby`(자신 + 제목)로 만든다.
   */
  it('액션 접근성 이름이 `{label} {섹션 제목}` 이다', () => {
    render(
      <SectionHeader title="Favorites" action={{ label: 'See all', onPress: () => undefined }} />,
    );

    expect(screen.getByRole('button', { name: 'See all Favorites' })).toBeTruthy();
  });

  it('섹션이 둘이면 두 액션의 이름이 서로 다르다', () => {
    render(
      <>
        <SectionHeader title="Favorites" action={{ label: 'See all', onPress: () => undefined }} />
        <SectionHeader
          title="Finished together"
          action={{ label: 'See all', onPress: () => undefined }}
        />
      </>,
    );

    expect(screen.getByRole('button', { name: 'See all Favorites' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'See all Finished together' })).toBeTruthy();
  });

  it('누르면 onPress 가 불린다', () => {
    const onPress = vi.fn();
    render(<SectionHeader title="Favorites" action={{ label: 'See all', onPress }} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  /*
   * `Favorites` 0건이면 "See all" 을 비활성한다 (Design Spec §7.4). 요소를 없애지 않고
   * `aria-disabled` 로 두는 이유는 섹션 구조가 상태마다 달라지지 않게 하기 위해서다.
   */
  it('disabled 면 aria-disabled 이고 눌려도 onPress 가 불리지 않는다', () => {
    const onPress = vi.fn();
    render(
      <SectionHeader title="Favorites" action={{ label: 'See all', onPress, disabled: true }} />,
    );

    const action = screen.getByRole('button', { name: 'See all Favorites' });
    expect(action.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(action);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('native disabled 를 쓰지 않는다 (포커스를 유지한다)', () => {
    render(
      <SectionHeader
        title="Favorites"
        action={{ label: 'See all', onPress: () => undefined, disabled: true }}
      />,
    );

    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(false);
  });
});

describe('SectionHeader — meta 모드 (L-OPEN-17)', () => {
  it('meta 는 **비대화형**이다 — 버튼이 되지 않는다', () => {
    const { container } = render(<SectionHeader title="Reading now" meta="3 of 5 nights" />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('.haru-section-header__meta')?.textContent).toBe(
      '3 of 5 nights',
    );
  });

  it('meta 가 없으면 우측 슬롯을 렌더하지 않는다 (plannedNights === null 경로)', () => {
    const { container } = render(<SectionHeader title="Reading now" />);

    expect(container.querySelector('.haru-section-header__meta')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    // 헤더 자체는 남는다 — 높이 20 이 유지된다.
    expect(container.querySelector('.haru-section-header')).not.toBeNull();
  });

  it('action 과 meta 를 함께 주면 action 이 이긴다 (두 슬롯을 동시에 그리지 않는다)', () => {
    const { container } = render(
      <SectionHeader
        title="Favorites"
        action={{ label: 'See all', onPress: () => undefined }}
        meta="3 of 5 nights"
      />,
    );

    expect(screen.getByRole('button', { name: 'See all Favorites' })).toBeTruthy();
    expect(container.querySelector('.haru-section-header__meta')).toBeNull();
  });
});

describe('SectionHeader — heading 레벨 (§9.4)', () => {
  it('기본은 h2 이고 h3 로 바꿀 수 있다 (페이지 h1 은 TopBar 가 갖는다)', () => {
    const { rerender } = render(<SectionHeader title="Favorites" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeTruthy();

    rerender(<SectionHeader title="Favorites" as="h3" />);
    expect(screen.getByRole('heading', { level: 3 })).toBeTruthy();
  });
});
