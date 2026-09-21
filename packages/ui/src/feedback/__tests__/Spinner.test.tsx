import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('announces progress politely with a visually hidden label (§4.9)', () => {
    render(<Spinner label="Loading" />);

    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toBe('Loading');
  });

  it('is silent inside a container that already reports aria-busy', () => {
    const { container } = render(<Spinner decorative />);

    expect(screen.queryByRole('status')).toBeNull();
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the stroke width constant across sizes (§4.9 stroke 2px)', () => {
    const { container } = render(<Spinner size="lg" decorative />);
    const circle = container.querySelector('circle');

    expect(circle?.getAttribute('stroke-width')).toBe('2');
    expect(circle?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
  });
});
