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

  describe('announce (Stage 5 D5-12)', () => {
    it('기본값은 이전과 같다 — announce 생략 = "auto" = role=status + aria-live=polite', () => {
      const omitted = render(<Spinner label="Loading" />).container.innerHTML;
      const auto = render(<Spinner label="Loading" announce="auto" />).container.innerHTML;

      expect(auto).toBe(omitted);
      expect(omitted).toContain('role="status"');
      expect(omitted).toContain('aria-live="polite"');
    });

    it('"none" — role · aria-live 0, 라벨 텍스트는 접근성 트리에 남는다 (aria-hidden 0)', () => {
      const { container } = render(<Spinner label="Loading" announce="none" />);
      const root = container.firstElementChild;

      expect(screen.queryByRole('status')).toBeNull();
      expect(root?.hasAttribute('role')).toBe(false);
      expect(root?.hasAttribute('aria-live')).toBe(false);
      expect(root?.hasAttribute('aria-hidden')).toBe(false);
      expect(screen.getByText('Loading')).toBeTruthy();
      // 기본과 다른 점은 두 속성뿐이다.
      const base = render(<Spinner label="Loading" />).container.innerHTML;
      expect(container.innerHTML).toBe(
        base.replace(' role="status"', '').replace(' aria-live="polite"', ''),
      );
    });

    it('decorative 가 우선한다', () => {
      const { container } = render(<Spinner decorative announce="none" />);
      expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
