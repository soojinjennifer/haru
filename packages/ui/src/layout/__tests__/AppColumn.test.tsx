import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AppColumn } from '../AppColumn';

describe('AppColumn', () => {
  it('renders the requested landmark element', () => {
    render(
      <AppColumn as="main">
        <p>Content</p>
      </AppColumn>,
    );

    expect(screen.getByRole('main')).toBeTruthy();
  });

  it('applies the gutter by default and drops it for edge-to-edge content (§2.4)', () => {
    const { container: padded } = render(<AppColumn>a</AppColumn>);
    const { container: edge } = render(<AppColumn edgeToEdge>b</AppColumn>);

    expect(padded.firstElementChild?.className).toContain('haru-app-column--padded');
    expect(edge.firstElementChild?.className).toContain('haru-app-column--edge-to-edge');
    expect(edge.firstElementChild?.className).not.toContain('haru-app-column--padded');
  });
});
