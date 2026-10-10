/**
 * `WeekSummaryChip` — **칩이 자기 외형을 소유한다** (사용자 지시 2026-10-10).
 *
 * 외형 값은 CSS 에 있고 jsdom 은 외부 CSS 를 적용하지 않으므로, 여기서는 **외형을 걸어 둘
 * 고리**(래퍼 클래스)가 DOM 에 있는지만 고정한다. 값 자체는
 * `apps/web/__tests__/stage3-css-guards.test.ts`(소스) 와 `e2e/week-summary-chip.spec.ts`
 * (실제 렌더 기하) 가 본다.
 *
 * 래퍼가 사라지면 Home·Library 둘 다 공유 `Tag` 기본값으로 되돌아간다 — 그래서 가드다.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WeekSummaryChip } from '../WeekSummaryChip';

describe('외형 소유 고리', () => {
  it('래퍼 클래스 `haru-week-summary-chip` 안에 공유 `Tag` 를 렌더한다', () => {
    const { container } = render(
      <WeekSummaryChip label="2 this week" accessibleLabel="2 storytimes this week" />,
    );

    const wrapper = container.querySelector('.haru-week-summary-chip');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelector('.haru-tag')).not.toBeNull();
  });

  it('아이콘은 Figma `50:161` 글리프다 — 장식이므로 접근성 트리에 이름을 더하지 않는다', () => {
    const { container } = render(
      <WeekSummaryChip label="2 this week" accessibleLabel="2 storytimes this week" />,
    );

    const icon = container.querySelector('.haru-week-summary-chip .haru-tag__icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.haru-icon')).not.toBeNull();
  });

  it('보이는 라벨은 축약형이고 읽히는 이름은 `accessibleLabel` 이다', () => {
    render(<WeekSummaryChip label="2 this week" accessibleLabel="2 storytimes this week" />);

    expect(screen.getByText('2 storytimes this week')).toBeDefined();
    expect(screen.getByText('2 this week').getAttribute('aria-hidden')).toBe('true');
  });

  it('0건 라벨도 같은 구조로 렌더한다 (기하는 CSS 가 같게 준다)', () => {
    const { container } = render(
      <WeekSummaryChip label="None yet this week" accessibleLabel="No storytimes yet this week" />,
    );

    expect(container.querySelector('.haru-week-summary-chip .haru-tag')).not.toBeNull();
  });
});
