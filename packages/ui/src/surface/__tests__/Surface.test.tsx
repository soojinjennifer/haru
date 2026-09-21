import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { AppBackground } from '../AppBackground';
import { Surface } from '../Surface';

describe('Surface', () => {
  it('renders a plain container by default', () => {
    const { container } = render(<Surface>Card</Surface>);

    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders a real button when it is clickable (§4.3 접근성)', () => {
    const onPress = vi.fn();
    render(
      <Surface as="button" interactive onPress={onPress} label="Open book">
        Book
      </Surface>,
    );

    const button = screen.getByRole('button', { name: 'Open book' });
    expect(button.getAttribute('type')).toBe('button');

    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('renders a link when as="a"', () => {
    render(
      <Surface as="a" href="/library" label="Library">
        Library
      </Surface>,
    );

    expect(screen.getByRole('link', { name: 'Library' }).getAttribute('href')).toBe('/library');
  });
});

describe('AppBackground', () => {
  it('is decorative only (§4.3)', () => {
    const { container } = render(<AppBackground />);
    const background = container.firstElementChild;

    expect(background?.getAttribute('aria-hidden')).toBe('true');
    expect(background?.textContent).toBe('');
  });
});
