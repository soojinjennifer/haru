import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { PromptCarousel, type PromptCarouselPage } from '../PromptCarousel';

const PAGES: PromptCarouselPage[] = [
  { key: 'a', label: 'Alpha', detail: <p>alpha note</p> },
  { key: 'b', label: 'Beta' },
  { key: 'c', label: 'Gamma', detail: <p>gamma note</p> },
];

function Harness({
  pages = PAGES,
  initial = 0,
}: {
  pages?: PromptCarouselPage[];
  initial?: number;
}) {
  const [index, setIndex] = useState(initial);
  return (
    <PromptCarousel
      pages={pages}
      index={index}
      onIndexChange={setIndex}
      label="Prompts"
      previousLabel="Previous"
      nextLabel="Next"
      positionLabel={(i, n) => `${String(i + 1)} of ${String(n)}`}
    />
  );
}

function visible(part: 'bar' | 'detail'): string {
  const scope =
    part === 'bar'
      ? '.haru-prompt-carousel__bar .haru-prompt-carousel__slide'
      : '.haru-prompt-carousel__track--detail .haru-prompt-carousel__slide';
  const slide = [...document.querySelectorAll(scope)].find(
    (node) => !node.hasAttribute('aria-hidden'),
  );
  return slide?.textContent ?? '';
}

describe('PromptCarousel (Stage 4 Spec §3.2 · §4 #2, `88:960`)', () => {
  it('그룹 = carousel · 화살표는 bar 안 · 숨은 페이지는 inert + aria-hidden · dots = 페이지 수', () => {
    render(<Harness />);
    const group = screen.getByRole('group', { name: 'Prompts' });
    expect(group.getAttribute('aria-roledescription')).toBe('carousel');
    expect(group.getAttribute('tabindex')).toBe('-1');
    const bar = group.querySelector('.haru-prompt-carousel__bar');
    expect(bar?.querySelectorAll('button')).toHaveLength(2);
    const slides = bar?.querySelectorAll('.haru-prompt-carousel__slide') ?? [];
    expect(slides).toHaveLength(3);
    expect(slides[1]?.hasAttribute('inert')).toBe(true);
    expect(slides[1]?.getAttribute('aria-hidden')).toBe('true');
    expect(slides[0]?.hasAttribute('inert')).toBe(false);
    expect(group.querySelectorAll('.haru-page-indicator__dot')).toHaveLength(3);
    expect(screen.getByText('1 of 3')).toBeTruthy();
    expect(visible('bar')).toBe('Alpha');
    expect(visible('detail')).toBe('alpha note');
  });

  it('화살표 — 첫/끝에서 aria-disabled(native disabled 아님) · 누르면 무시', () => {
    render(<Harness />);
    const previous = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });
    expect(previous.getAttribute('aria-disabled')).toBe('true');
    expect((previous as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(previous);
    expect(visible('bar')).toBe('Alpha');
    fireEvent.click(next);
    expect(visible('bar')).toBe('Beta');
    expect(visible('detail')).toBe(''); // 상세 없는 페이지 — placeholder 0
    fireEvent.click(next);
    expect(visible('bar')).toBe('Gamma');
    expect(next.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(next);
    expect(visible('bar')).toBe('Gamma');
    expect(screen.getByText('3 of 3')).toBeTruthy();
  });

  it('ArrowLeft / ArrowRight 로 이동한다', () => {
    render(<Harness />);
    const group = screen.getByRole('group', { name: 'Prompts' });
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(visible('bar')).toBe('Beta');
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(visible('bar')).toBe('Alpha');
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(visible('bar')).toBe('Alpha');
  });

  it('가로 스와이프(≥ 40 · 가로 우세)만 이동 — 짧은 이동 · 세로 이동은 무시', () => {
    render(<Harness />);
    const group = screen.getByRole('group', { name: 'Prompts' });
    const swipe = (dx: number, dy: number) => {
      fireEvent.pointerDown(group, {
        pointerId: 1,
        pointerType: 'touch',
        clientX: 200,
        clientY: 100,
      });
      fireEvent.pointerUp(group, {
        pointerId: 1,
        pointerType: 'touch',
        clientX: 200 + dx,
        clientY: 100 + dy,
      });
    };
    swipe(-20, 0);
    expect(visible('bar')).toBe('Alpha');
    swipe(-60, 80);
    expect(visible('bar')).toBe('Alpha');
    swipe(-60, 5);
    expect(visible('bar')).toBe('Beta');
    swipe(60, 0);
    expect(visible('bar')).toBe('Alpha');
  });

  it('상세가 하나도 없으면 상세 트랙을 렌더하지 않는다', () => {
    render(<Harness pages={[{ key: 'a', label: 'Alpha' }]} />);
    expect(document.querySelector('.haru-prompt-carousel__track--detail')).toBeNull();
    expect(screen.getByRole('button', { name: 'Next' }).getAttribute('aria-disabled')).toBe('true');
  });
});
