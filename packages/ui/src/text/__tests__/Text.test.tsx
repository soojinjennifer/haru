import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Text } from '../Text';

describe('Text', () => {
  it('renders the given semantic element, not a fixed one (§4.1)', () => {
    const { container } = render(
      <Text as="h2" variant="large-title">
        Library
      </Text>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Library' })).toBeTruthy();
    // 시각 크기(variant)와 heading 레벨이 분리되어 있다.
    expect(container.querySelector('h2')?.className).toContain('haru-text--large-title');
  });

  it('defaults to a paragraph', () => {
    const { container } = render(<Text>Hello</Text>);

    expect(container.querySelector('p')?.textContent).toBe('Hello');
  });

  it('connects a label to its control with htmlFor', () => {
    render(
      <>
        <Text as="label" htmlFor="child-name">
          Child name
        </Text>
        <input id="child-name" />
      </>,
    );

    expect(screen.getByLabelText('Child name')).toBeTruthy();
  });

  it('does not forward htmlFor to non-label elements', () => {
    const { container } = render(<Text htmlFor="ignored">Body</Text>);

    expect(container.querySelector('p')?.hasAttribute('for')).toBe(false);
  });
});
