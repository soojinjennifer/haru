import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DividerWithLabel } from '../DividerWithLabel';

describe('DividerWithLabel (Stage 2 Design Spec §4.5)', () => {
  it('라벨은 텍스트로 읽히고 rule 은 장식이다', () => {
    const { container } = render(<DividerWithLabel label="or with email" />);

    expect(screen.getByText('or with email')).toBeTruthy();
    const rules = container.querySelectorAll('.haru-divider-with-label__rule');
    expect(rules).toHaveLength(2);
    for (const rule of rules) {
      expect(rule.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('role="separator" 를 쓰지 않는다 (폼 구조를 깨지 않는다)', () => {
    render(<DividerWithLabel label="or with email" />);

    expect(screen.queryByRole('separator')).toBeNull();
  });
});
