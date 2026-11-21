/**
 * `ReadingContextSheet` 시간 목록 — Stage 8 `S8-G`.
 *
 * - AC-8-43 (`S4B-F1-OPEN` ④): 목록을 열면 focus = 시트 안 첫 요소(`Back`), 돌아오면 = 목록을 연 트리거.
 *   두 뷰는 같은 `Sheet` 의 내용만 바꾸므로 시트 focus trap 이 다시 돌지 않아 focus 가 body 로 떨어졌다.
 * - AC-8-47 (WCAG 2.1.1): 화살표 이동은 고르기만 하고 목록에 머문다 · Enter 가 확정 (포인터는 그대로 즉시 복귀).
 *
 * jsdom 은 화살표로 radio 를 옮기지 않으므로 브라우저 순서(keydown → change)를 흉내 낸다. 실제 브라우저 경로는
 * `e2e/a11y-keyboard.spec.ts` 가 본다.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ReadingContextSheet } from '../src/features/activity-card-deck/ui/ReadingContextSheet';

function renderSheet() {
  render(
    <ReadingContextSheet
      open
      onClose={vi.fn()}
      onConfirm={vi.fn()}
      submitting={false}
      failure={null}
    />,
  );
  fireEvent.click(screen.getByRole('radio', { name: 'Pick a time…' }));
  return screen.getByRole('button', { name: /^Time/ });
}

describe('ReadingContextSheet 시간 목록 focus (AC-8-43)', () => {
  it('목록을 열면 Back 으로, Back 을 누르면 트리거로 focus 가 간다', () => {
    const trigger = renderSheet();
    trigger.focus();
    fireEvent.click(trigger);

    const back = screen.getByRole('button', { name: 'Back' });
    expect(document.activeElement).toBe(back);

    fireEvent.click(back);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /^Time/ }));
  });

  it('포인터로 시간을 고르면 바로 돌아오고 focus = 트리거', () => {
    fireEvent.click(renderSheet());
    fireEvent.click(screen.getByRole('radio', { name: '19:30' }));

    const trigger = screen.getByRole('button', { name: /^Time/ });
    expect(trigger.textContent).toContain('19:30');
    expect(document.activeElement).toBe(trigger);
  });
});

describe('ReadingContextSheet 시간 목록 키보드 (AC-8-47)', () => {
  it('화살표 이동은 목록에 머물고 Enter 가 확정한다', () => {
    fireEvent.click(renderSheet());

    const first = screen.getByRole('radio', { name: '00:00' });
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    fireEvent.click(screen.getByRole('radio', { name: '00:30' })); // 화살표 뒤 change
    expect(screen.getByRole('dialog', { name: 'Time' })).toBeTruthy();

    fireEvent.keyDown(screen.getByRole('radio', { name: '00:30' }), { key: 'Enter' });
    const trigger = screen.getByRole('button', { name: /^Time/ });
    expect(trigger.textContent).toContain('00:30');
    expect(document.activeElement).toBe(trigger);
  });
});
