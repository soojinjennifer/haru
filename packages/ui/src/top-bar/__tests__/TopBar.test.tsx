import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { IconButton } from '../../button/IconButton';
import { Icon } from '../../icon/Icon';
import { TopBar } from '../TopBar';

describe('TopBar', () => {
  it('renders the screen title as the single h1 (§6.1)', () => {
    render(<TopBar variant="centered" title="Survey" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Survey' })).toBeTruthy();
    expect(screen.getByRole('banner')).toBeTruthy();
  });

  it('keeps leading and trailing slots keyboard reachable in order', () => {
    render(
      <TopBar
        variant="centered"
        title="Survey"
        leading={<IconButton icon={<Icon name="chevron-left" decorative />} label="Back" />}
        trailing={<IconButton icon={<Icon name="settings" decorative />} label="Settings" />}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Back',
      'Settings',
    ]);
  });

  it('renders the pill variant title inside the pill container', () => {
    const { container } = render(<TopBar variant="pill" title="The Rainy Day" />);

    expect(container.querySelector('.haru-top-bar__pill')?.textContent).toBe('The Rainy Day');
  });

  it('renders no heading when no title is given', () => {
    render(<TopBar variant="large" />);

    expect(screen.queryByRole('heading')).toBeNull();
  });
});
