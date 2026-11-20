import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Icon } from '../Icon';
import { LUCIDE_ICONS, LUCIDE_STROKE_WIDTH } from '../registry';

describe('Icon', () => {
  it('exposes a meaningful icon with its accessible name (§4.2)', () => {
    render(<Icon name="wifi-off" label="Offline" />);

    expect(screen.getByRole('img', { name: 'Offline' })).toBeTruthy();
  });

  it('hides a decorative icon from the accessibility tree', () => {
    const { container } = render(<Icon name="check" decorative />);

    expect(screen.queryByRole('img')).toBeNull();
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws Lucide glyphs with the HARU stroke width (1.5), not the Lucide default', () => {
    const { container } = render(<Icon name="chevron-left" decorative />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('stroke-width')).toBe(String(LUCIDE_STROKE_WIDTH));
    expect(svg?.getAttribute('focusable')).toBe('false');
  });

  it('renders HARU-only glyphs from the haru: namespace (§8.2)', () => {
    const { container } = render(<Icon name="haru:tab-center-home" decorative />);

    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 64 64');
  });

  it('warns at runtime when neither label nor decorative is given (JS consumers)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // 타입 단계에서 막히는 조합이므로 JS 소비자 경로만 확인한다.
    const props = { name: 'check' } as unknown as { name: 'check'; label: string };
    render(<Icon {...props} />);

    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

/* Stage 7 `S7-B` — Icon registry 추가 (Stage 7 Spec §3.9). `clock` 은 Stage 2 부터 있다. */
describe('Icon — Stage 7 Lucide 등록', () => {
  it.each(['file-down', 'arrow-down-to-line', 'share', 'play', 'pause', 'clock'] as const)(
    '%s 를 svg 로 렌더한다',
    (name) => {
      const { container } = render(<Icon name={name} size="md" decorative />);
      expect(container.querySelector('svg')).not.toBeNull();
      expect(LUCIDE_ICONS[name]).toBeDefined();
    },
  );
});
