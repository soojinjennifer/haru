import { act, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { MOTION_DURATION_MS } from '../../lib/motion';
import { SelectTrigger } from '../SelectTrigger';

const OPTIONS = [
  { value: 'girl', label: 'Girl' },
  { value: 'boy', label: 'Boy' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

function Controlled({ initial = null }: { initial?: string | null }) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <SelectTrigger
      label="Gender"
      value={value}
      placeholder="Not selected"
      options={OPTIONS}
      onChange={setValue}
    />
  );
}

/** Sheet 는 퇴장 애니메이션 동안 마운트를 유지한다 (usePresence) — 시간을 진행시켜 닫는다. */
function flushSheetExit(): void {
  act(() => {
    vi.advanceTimersByTime(MOTION_DURATION_MS.base);
  });
}

describe('SelectTrigger (Stage 2 Design Spec §4.1)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('트리거는 label + 현재 값으로 이름이 만들어지고 dialog 를 연다고 알린다', () => {
    render(<Controlled />);

    const trigger = screen.getByRole('button', { name: /Gender/ });
    // native button 이므로 Enter / Space 가 그대로 동작한다 (§4.1 키보드).
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    // 미선택은 색이 아니라 placeholder 텍스트가 알린다.
    expect(trigger.textContent).toContain('Not selected');
  });

  it('선택된 값이 있으면 트리거에 그 라벨이 보인다 (filled)', () => {
    render(<Controlled initial="boy" />);

    expect(screen.getByRole('button', { name: /Gender/ }).textContent).toContain('Boy');
  });

  it('열면 Sheet(dialog) 안에 옵션이 radio 로 뜨고 aria-expanded 가 갱신된다', () => {
    render(<Controlled />);

    const trigger = screen.getByRole('button', { name: /Gender/ });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Gender' })).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    // 옵션 UI 는 신규 컴포넌트가 아니라 기존 Sheet + RadioGroup 이다 (D-8).
    expect(screen.getAllByRole('radio')).toHaveLength(OPTIONS.length);
  });

  it('옵션을 고르면 값이 반영되고 Sheet 가 닫힌다', () => {
    render(<Controlled />);

    fireEvent.click(screen.getByRole('button', { name: /Gender/ }));
    fireEvent.click(screen.getByRole('radio', { name: 'Prefer not to say' }));
    flushSheetExit();

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /Gender/ }).textContent).toContain(
      'Prefer not to say',
    );
  });

  /*
   * Stage 8 `S8-G` (AC-8-47 · WCAG 2.1.1) — native radio 는 화살표 이동 = 그 자리 선택(change) 이다.
   * 고르면 닫히는 시트가 화살표 1회에 닫혀 키보드로는 이웃 한 칸밖에 고를 수 없었다.
   * jsdom 은 화살표로 radio 를 옮기지 않으므로 브라우저 순서(keydown → change)를 그대로 흉내 낸다.
   */
  it('화살표 이동은 고르기만 하고 시트를 닫지 않는다 · Enter 가 확정이다', () => {
    render(<Controlled />);

    fireEvent.click(screen.getByRole('button', { name: /Gender/ }));
    const boy = screen.getByRole('radio', { name: 'Boy' });
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Girl' }), { key: 'ArrowDown' });
    fireEvent.click(boy); // 브라우저가 화살표 뒤에 내는 change
    flushSheetExit();

    expect(screen.getByRole('dialog', { name: 'Gender' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Gender/ }).textContent).toContain('Boy');

    fireEvent.keyDown(boy, { key: 'Enter' });
    flushSheetExit();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('이미 선택된 칸의 Space 도 확정이다 (change 가 나지 않는 경우)', () => {
    render(<Controlled initial="boy" />);

    fireEvent.click(screen.getByRole('button', { name: /Gender/ }));
    const boy = screen.getByRole('radio', { name: 'Boy' });
    expect(fireEvent.keyDown(boy, { key: ' ' })).toBe(false);
    flushSheetExit();

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('포인터 선택은 그대로 바로 닫힌다 (화살표 표시가 남지 않는다)', () => {
    render(<Controlled />);

    fireEvent.click(screen.getByRole('button', { name: /Gender/ }));
    // 화살표 없이 포인터로 고른다
    fireEvent.click(screen.getByRole('radio', { name: 'Girl' }));
    flushSheetExit();

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Esc 로 닫으면 포커스가 트리거로 돌아온다', () => {
    render(<Controlled />);

    const trigger = screen.getByRole('button', { name: /Gender/ });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    flushSheetExit();

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('error 는 메시지 + aria-describedby 로 알린다 (role=button 은 aria-invalid 미지원)', () => {
    render(
      <SelectTrigger
        label="Birth year"
        value={null}
        placeholder="Not selected"
        options={OPTIONS}
        onChange={vi.fn()}
        error="HARU is built for ages 3 to 9 right now."
      />,
    );

    const trigger = screen.getByRole('button', { name: /Birth year/ });
    const describedBy = trigger.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? '')?.textContent).toContain('ages 3 to 9');
  });

  it('disabled 면 눌러도 열리지 않는다', () => {
    render(
      <SelectTrigger
        label="Gender"
        value={null}
        placeholder="Not selected"
        options={OPTIONS}
        onChange={vi.fn()}
        disabled
      />,
    );

    const trigger = screen.getByRole('button', { name: /Gender/ });
    expect(trigger.hasAttribute('disabled')).toBe(true);
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
