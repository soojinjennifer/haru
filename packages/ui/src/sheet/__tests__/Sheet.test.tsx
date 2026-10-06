import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from '../../button/Button';
import { Sheet } from '../Sheet';

describe('Sheet', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing while closed', () => {
    render(
      <Sheet open={false} onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is a modal dialog labelled by its title (§4.21)', () => {
    render(
      <Sheet open onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Prompts' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('moves focus inside on open and returns it to the trigger on close', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();

    const { rerender } = render(
      <Sheet open onClose={() => {}} title="Prompts">
        <Button onPress={() => {}}>Close</Button>
      </Sheet>,
    );

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));

    rerender(
      <Sheet open={false} onClose={() => {}} title="Prompts">
        <Button onPress={() => {}}>Close</Button>
      </Sheet>,
    );
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('closes on Escape when dismissible, and stays open otherwise', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Sheet open onClose={onClose} title="Prompts">
        <p>body</p>
      </Sheet>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();

    rerender(
      <Sheet open onClose={onClose} title="Prompts" dismissible={false}>
        <p>body</p>
      </Sheet>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps Tab focus inside the sheet', () => {
    render(
      <Sheet open onClose={() => {}} title="Prompts">
        <Button onPress={() => {}}>First</Button>
        <Button onPress={() => {}}>Last</Button>
      </Sheet>,
    );

    const last = screen.getByRole('button', { name: 'Last' });
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First' }));
  });

  it('locks background scrolling while open and restores it after the exit motion', () => {
    const { rerender } = render(
      <Sheet open onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Sheet open={false} onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );
    act(() => {
      vi.advanceTimersByTime(240);
    });
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});

/**
 * Library 1라운드 — `variant="inset-card"` (`L-OPEN-04` · `L-NEW-03`) +
 * `contentShadowInset` (`R-SHADOW-1`, Library Design Spec §8.1 ①).
 *
 * **기존 사용처(`bottom`·`full`)의 외형을 바꾸지 않는 것**이 조건이므로, 기본값에서 새 class 가
 * 붙지 않는 것도 함께 고정한다.
 */
describe('Sheet — inset-card 변형 (Library §3.7–§3.9)', () => {
  it('변형 class 가 붙고 grabber 가 없다 (Figma 145:1085 · 163:2347 실측)', () => {
    const { container } = render(
      <Sheet open onClose={() => {}} title="Our curated shelf" variant="inset-card">
        <p>body</p>
      </Sheet>,
    );

    expect(container.ownerDocument.querySelector('.haru-sheet--inset-card')).not.toBeNull();
    expect(container.ownerDocument.querySelector('.haru-sheet__grabber')).toBeNull();
  });

  it('기본 변형은 그대로 grabber 를 갖는다 (기존 외형 불변)', () => {
    const { container } = render(
      <Sheet open onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );

    expect(container.ownerDocument.querySelector('.haru-sheet--bottom')).not.toBeNull();
    expect(container.ownerDocument.querySelector('.haru-sheet__grabber')).not.toBeNull();
  });

  it('dialog 의 접근성 계약은 변형과 무관하게 유지된다', () => {
    render(
      <Sheet open onClose={() => {}} title="Our curated shelf" variant="inset-card">
        <p>body</p>
      </Sheet>,
    );

    expect(screen.getByRole('dialog', { name: 'Our curated shelf' })).toBeTruthy();
  });

  it('contentShadowInset 은 명시해야 켜진다 (기본은 꺼짐)', () => {
    const { unmount } = render(
      <Sheet open onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );
    expect(document.querySelector('.haru-sheet__content--shadow-inset')).toBeNull();
    unmount();

    render(
      <Sheet
        open
        onClose={() => {}}
        title="Our curated shelf"
        variant="inset-card"
        contentShadowInset
      >
        <p>body</p>
      </Sheet>,
    );
    expect(document.querySelector('.haru-sheet__content--shadow-inset')).not.toBeNull();
  });
});
