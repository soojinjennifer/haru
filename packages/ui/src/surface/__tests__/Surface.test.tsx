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

describe('Surface material="bubble" (Stage 6)', () => {
  it('material="bubble" 은 `--shadow-bubble` 클래스를 붙인다 (Stage 6 Spec §3.4 `T6-9`)', () => {
    const { container } = render(
      <Surface material="bubble" fill="strong" radius="surface" padding="4">
        Card
      </Surface>,
    );

    const surface = container.firstElementChild;
    expect(surface?.classList.contains('haru-surface--material-bubble')).toBe(true);
    expect(surface?.classList.contains('haru-surface--material-rest')).toBe(false);
  });

  it('Surface.css 의 bubble 단계는 `--shadow-bubble` 토큰만 쓴다 (새 값 0)', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const css = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'Surface.css'),
      'utf8',
    );
    const rule = /\.haru-surface--material-bubble\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(rule).toMatch(/box-shadow:\s*var\(--shadow-bubble\)/);
  });

  /* Stage 7 `T7-3` — `163:2551` · `110:835` white 82% + blur 12 (Spec §0.3). */
  it('fill="card" 는 --color-surface-card + blur 이고 glass · strong 과 같은 fallback 을 탄다', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const { container } = render(
      <Surface fill="card" material="rest">
        x
      </Surface>,
    );
    expect(container.firstElementChild?.classList.contains('haru-surface--fill-card')).toBe(true);

    const css = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../Surface.css'),
      'utf8',
    );
    const rule = /\.haru-surface--fill-card\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(rule).toMatch(/background-color:\s*var\(--color-surface-card\)/);
    expect(rule).toMatch(/backdrop-filter:\s*blur\(var\(--material-blur-md\)\)/);
    expect(css).toMatch(/@supports not[^{]*\{[^}]*\.haru-surface--fill-card/);
    expect(css).toMatch(/prefers-reduced-transparency[^{]*\{[^}]*\.haru-surface--fill-card/);
  });
});
