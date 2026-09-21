import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PageIndicator } from '../PageIndicator';

describe('PageIndicator', () => {
  it('is decorative and reports position as text (§4.19)', () => {
    const { container } = render(<PageIndicator count={3} index={1} label="2 of 3" />);

    expect(container.querySelector('.haru-page-indicator__dots')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(screen.getByText('2 of 3')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('marks the active dot', () => {
    const { container } = render(<PageIndicator count={3} index={2} />);
    const dots = container.querySelectorAll('.haru-page-indicator__dot');

    expect(dots).toHaveLength(3);
    expect(dots[2]?.className).toContain('haru-page-indicator__dot--active');
  });

  it('renders no interactive control — display only (S1-G-1)', () => {
    const { container } = render(<PageIndicator count={4} index={0} label="1 of 4" />);

    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(0);
  });
});
