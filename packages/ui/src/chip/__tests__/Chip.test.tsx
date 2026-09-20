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
});
