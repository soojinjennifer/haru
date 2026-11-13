import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';

import { StarRating } from '../StarRating';

const label = (star: number) => (star === 1 ? '1 star' : `${String(star)} stars`);

function Controlled({
  initial = 0,
  onChange,
}: {
  initial?: number;
  onChange?: (v: number) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <StarRating
      value={value}
      getStarLabel={label}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe('StarRating (Stage 5 Spec §3.1)', () => {
  it('radiogroup + radio 5개 · 이름 = copy · 초기 0 이면 선택 0 · 첫 별만 tab stop', () => {
    render(<StarRating value={0} getStarLabel={label} onChange={() => {}} />);
    expect(screen.getByRole('radiogroup')).toBeTruthy();
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.getAttribute('aria-label'))).toEqual([
      '1 star',
      '2 stars',
      '3 stars',
      '4 stars',
      '5 stars',
    ]);
    expect(radios.filter((r) => r.getAttribute('aria-checked') === 'true')).toHaveLength(0);
    expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1, -1, -1]);
    expect(radios.filter((r) => r.getAttribute('data-filled') === 'true')).toHaveLength(0);
  });

  it('탭으로 1~5 설정 · 변경 가능 · 채움 = 1..n · 같은 별 재탭은 변화 없음 (N5-18 ⓐ)', () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    expect(onChange).toHaveBeenLastCalledWith(4);
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.getAttribute('data-filled'))).toEqual([
      'true',
      'true',
      'true',
      'true',
      'false',
    ]);
    expect(screen.getByRole('radio', { name: '4 stars' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(screen.getByRole('radio', { name: '4 stars' }).tabIndex).toBe(0);

    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('radio', { name: '2 stars' }));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('키보드 — →/↑ 늘림 · ←/↓ 줄임(최소 1) · Home/End · 포커스가 따라간다', () => {
    render(<Controlled />);
    const first = screen.getByRole('radio', { name: '1 star' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: '1 star' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowUp' });
    expect(screen.getByRole('radio', { name: '2 stars' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '2 stars' }));
    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    expect(screen.getByRole('radio', { name: '5 stars' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: '5 stars' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowLeft' });
    expect(screen.getByRole('radio', { name: '4 stars' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(screen.getByRole('radio', { name: '1 star' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    expect(screen.getByRole('radio', { name: '1 star' }).getAttribute('aria-checked')).toBe('true');
  });

  it('readOnly — aria-readonly · 탭·키보드로 값이 바뀌지 않는다 · 포커스는 가능', () => {
    const onChange = vi.fn();
    render(<StarRating value={4} getStarLabel={label} onChange={onChange} readOnly />);
    expect(screen.getByRole('radiogroup').getAttribute('aria-readonly')).toBe('true');
    fireEvent.click(screen.getByRole('radio', { name: '2 stars' }));
    const checked = screen.getByRole('radio', { name: '4 stars' });
    checked.focus();
    fireEvent.keyDown(checked, { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '5 stars' }));
    expect(screen.getAllByRole('radio').every((r) => !(r as HTMLButtonElement).disabled)).toBe(
      true,
    );
  });

  it('disabled — aria-disabled · 값 변경 0', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} getStarLabel={label} onChange={onChange} disabled />);
    expect(screen.getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(screen.getByRole('radio', { name: '5 stars' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('글리프 = HARU 전용 `rating-star` (viewBox 30) · 장식', () => {
    const { container } = render(<StarRating value={1} getStarLabel={label} />);
    const glyphs = container.querySelectorAll('.haru-star-rating__glyph');
    expect(glyphs).toHaveLength(5);
    expect(glyphs[0]?.getAttribute('aria-hidden')).toBe('true');
    expect(glyphs[0]?.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 30 30');
  });
});
