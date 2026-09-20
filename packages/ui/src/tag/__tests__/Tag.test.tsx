import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Tag } from '../Tag';

describe('Tag', () => {
  it('renders its label as text, not colour alone', () => {
    render(<Tag label="Emotion Regulation" tone="emotion" />);

    expect(screen.getByText('Emotion Regulation')).toBeTruthy();
  });

  it('is not interactive — no button role and not focusable', () => {
    const { container } = render(<Tag label="Session" tone="agency" />);

    expect(screen.queryByRole('button')).toBeNull();

    const tag = container.firstElementChild;
    expect(tag?.tagName).toBe('SPAN');
    expect(tag?.hasAttribute('tabindex')).toBe(false);
    expect(tag?.hasAttribute('onclick')).toBe(false);
  });

  it('hides decorative icons from the accessibility tree', () => {
    render(<Tag label="Session" leadingIcon={<svg data-testid="glyph" />} />);

    expect(screen.getByTestId('glyph').parentElement?.getAttribute('aria-hidden')).toBe('true');
  });
});
