import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SpeechBubble } from '../SpeechBubble';

describe('SpeechBubble', () => {
  it('is a plain container — no role, no live region of its own (§4.20)', () => {
    const { container } = render(<SpeechBubble>Ready when you are.</SpeechBubble>);
    const bubble = container.firstElementChild;

    expect(screen.getByText('Ready when you are.')).toBeTruthy();
    expect(bubble?.hasAttribute('role')).toBe(false);
    expect(bubble?.hasAttribute('aria-live')).toBe(false);
  });

  it('renders the tail as decoration only when asked', () => {
    const { container: none } = render(<SpeechBubble>Hi</SpeechBubble>);
    const { container: tailed } = render(<SpeechBubble tail="top-center">Hi</SpeechBubble>);

    expect(none.querySelector('.haru-bubble__tail')).toBeNull();
    expect(tailed.querySelector('.haru-bubble__tail')?.getAttribute('aria-hidden')).toBe('true');
  });
});
