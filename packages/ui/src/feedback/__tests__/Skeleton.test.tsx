import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('is hidden from screen readers — the container announces loading once (§4.9)', () => {
    const { container } = render(<Skeleton shape="card" />);

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the requested number of text lines and shortens the last one', () => {
    const { container } = render(<Skeleton shape="text" lines={3} />);
    const lines = container.querySelectorAll('.haru-skeleton__line');

    expect(lines).toHaveLength(3);
    expect(lines[2]?.className).toContain('haru-skeleton__line--last');
    expect(lines[0]?.className).not.toContain('haru-skeleton__line--last');
  });
});
