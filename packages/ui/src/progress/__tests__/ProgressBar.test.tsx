import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('exposes value semantics with an accessible name', () => {
    render(<ProgressBar value={3} max={10} label="Survey progress" />);

    const bar = screen.getByRole('progressbar', { name: 'Survey progress' });
    expect(bar.getAttribute('aria-valuenow')).toBe('3');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('10');
  });

  it('clamps values outside the range', () => {
    const { rerender } = render(<ProgressBar value={12} max={10} label="Survey progress" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('10');

    rerender(<ProgressBar value={-4} max={10} label="Survey progress" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<ProgressBar value={null} label="Loading" />);

    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('can repeat the value as text so it is not carried by colour alone', () => {
    render(<ProgressBar value={3} max={10} label="Survey progress" showValue />);

    expect(screen.getByText('3 / 10')).toBeTruthy();
  });

  it('drives the fill width from a custom property instead of a hard-coded size', () => {
    const { container } = render(<ProgressBar value={5} max={10} label="Survey progress" />);

    const fill = container.querySelector('.haru-progress__fill');
    expect(fill?.getAttribute('style')).toContain('--haru-progress-fill-size: 50%');
  });
});
