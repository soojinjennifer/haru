import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Chip } from '../Chip';

describe('Chip', () => {
  it('renders a toggle button that exposes its pressed state', () => {
    render(<Chip label="Bedtime" selected={false} onToggle={() => {}} />);

    const chip = screen.getByRole('button', { name: 'Bedtime', pressed: false });
    expect(chip.getAttribute('type')).toBe('button');
  });

  it('reports the next selected state on toggle', () => {
    const onToggle = vi.fn();
    const { rerender } = render(<Chip label="Bedtime" selected={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole('button', { name: 'Bedtime' }));
    expect(onToggle).toHaveBeenLastCalledWith(true);

    rerender(<Chip label="Bedtime" selected onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Bedtime', pressed: true }));
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });

  it('shows a check mark next to the label when selected (not colour alone)', () => {
    const { container, rerender } = render(
      <Chip label="Bedtime" selected={false} onToggle={() => {}} />,
    );
    expect(container.querySelector('.haru-chip__check')).toBeNull();

    rerender(<Chip label="Bedtime" selected onToggle={() => {}} />);
    const check = container.querySelector('.haru-chip__check');
    expect(check).not.toBeNull();
    expect(check?.getAttribute('aria-hidden')).toBe('true');
  });

  it('does not toggle while disabled', () => {
    const onToggle = vi.fn();
    render(<Chip label="Bedtime" selected={false} onToggle={onToggle} disabled />);

    const chip = screen.getByRole('button', { name: 'Bedtime' });
    expect(chip).toHaveProperty('disabled', true);

    fireEvent.click(chip);
    expect(onToggle).not.toHaveBeenCalled();
  });
  describe('select 변형 (Stage 5 Spec §3.2 · N5-26 · N5-27)', () => {
    it('선택해도 check 아이콘이 없다 — Figma `90:625` (기존 변형은 그대로 check 를 그린다)', () => {
      const { container } = render(
        <Chip label="Engaged" variant="select" selected onToggle={() => {}} />,
      );
      expect(container.querySelector('.haru-chip__check')).toBeNull();
      const chip = screen.getByRole('button', { name: 'Engaged', pressed: true });
      expect(chip.classList.contains('haru-chip--select')).toBe(true);
      expect(chip.classList.contains('haru-chip--selected')).toBe(true);
    });

    it('readOnly — aria-disabled 이고 누름을 무시하지만 native disabled 가 아니다 (포커스 유지)', () => {
      const onToggle = vi.fn();
      render(
        <Chip label="Engaged" variant="select" selected={false} onToggle={onToggle} readOnly />,
      );
      const chip = screen.getByRole('button', { name: 'Engaged' });
      expect(chip.getAttribute('aria-disabled')).toBe('true');
      expect((chip as HTMLButtonElement).disabled).toBe(false);
      fireEvent.click(chip);
      expect(onToggle).not.toHaveBeenCalled();
      expect(chip.classList.contains('haru-chip--readonly')).toBe(true);
    });
  });
});
