/**
 * Stage 4b `S4-F2` — recording · paused 표시 단위 (4b Spec §2.2 · §2.3 · §4 #6 · #7).
 *
 * - `formatSessionClock` — `mm:ss` 고정 (AC-4-127)
 * - `selectRecordControlState` — 상태 → RecordControl 변형 **순수 함수** (AC-4-138)
 * - `SessionStatusBlock` — pill 텍스트 + dot 형태 + 시간 role/live (AC-4-127 · 128)
 * - `SessionBookChip` — `book.title` 그대로 · 표지/그라디언트 · null 미렌더 (AC-4-126)
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { BookSummary, SessionStatus } from '@haru/contracts';

import { formatSessionClock } from '../sessionClock';
import { selectRecordControlState } from '../recordControlState';
import { SessionBookChip } from '../SessionBookChip';
import { SessionStatusBlock } from '../SessionStatusBlock';

describe('formatSessionClock — `mm:ss` 고정 (AC-4-127, 시안 `03:24`)', () => {
  it.each([
    [0, '00:00'],
    [9, '00:09'],
    [59, '00:59'],
    [60, '01:00'],
    [204, '03:24'],
    [1799, '29:59'],
    [1800, '30:00'],
  ])('%i s → %s', (seconds, text) => {
    expect(formatSessionClock(seconds)).toBe(text);
  });

  it('소수·음수·NaN 은 내림·0 으로 — 표시가 깨지지 않는다', () => {
    expect(formatSessionClock(61.9)).toBe('01:01');
    expect(formatSessionClock(-3)).toBe('00:00');
    expect(formatSessionClock(Number.NaN)).toBe('00:00');
  });
});

describe('selectRecordControlState — 순수 함수 (AC-4-138 · N4B-13)', () => {
  const statuses: readonly SessionStatus[] = [
    'ready',
    'recording',
    'paused',
    'completed',
    'analyzing',
    'analyzed',
    'failed',
    'abandoned',
  ];

  it('상태만 주면 recording → recording · paused → paused · 나머지 → idle', () => {
    expect(statuses.map((status) => selectRecordControlState({ status }))).toStrictEqual([
      'idle',
      'recording',
      'paused',
      'idle',
      'idle',
      'idle',
      'idle',
      'idle',
    ]);
  });

  it('동의 없음 · 전이 처리 중 → disabled (어느 상태든)', () => {
    for (const status of statuses) {
      expect(selectRecordControlState({ status, consentBlocked: true })).toBe('disabled');
      expect(selectRecordControlState({ status, transitionPending: true })).toBe('disabled');
    }
  });

  it('마이크 거부 · 대화 전용 → permission-denied 가 disabled 보다 앞선다', () => {
    expect(
      selectRecordControlState({ status: 'ready', micUnavailable: true, consentBlocked: true }),
    ).toBe('permission-denied');
    expect(selectRecordControlState({ status: 'ready', conversationOnly: true })).toBe(
      'permission-denied',
    );
  });

  it('같은 입력이면 같은 출력 — 입력을 바꾸지 않는다', () => {
    const input = Object.freeze({ status: 'paused' as const, transitionPending: false });
    expect(selectRecordControlState(input)).toBe(selectRecordControlState(input));
  });
});

describe('SessionStatusBlock (`298:1320` / `298:1398`)', () => {
  it('recording: `Recording` · 채운 dot · `03:24` · 보조 줄 — 시간은 timer + aria-live off', () => {
    const { container } = render(
      <SessionStatusBlock
        state="recording"
        recordedSeconds={204}
        label="Recording"
        hint="Up to 30:00"
      />,
    );
    const timer = screen.getByRole('timer');
    expect(timer.textContent).toBe('03:24');
    expect(timer.getAttribute('aria-live')).toBe('off');
    expect(screen.getByText('Recording')).toBeTruthy();
    expect(screen.getByText('Up to 30:00')).toBeTruthy();
    expect(container.querySelector('.haru-session-status--recording')).not.toBeNull();
    expect(container.querySelector('.haru-session-status__dot')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('paused: 텍스트 `Paused` + 변형 클래스(빈 dot · secondary 시간) — 같은 노드에서 바뀐다 (AC-4-128)', () => {
    const { container, rerender } = render(
      <SessionStatusBlock state="recording" recordedSeconds={10} label="Recording" hint="a" />,
    );
    const root = container.firstElementChild;
    rerender(
      <SessionStatusBlock
        state="paused"
        recordedSeconds={10}
        label="Paused"
        hint="Tap the button to keep recording"
      />,
    );
    expect(container.firstElementChild).toBe(root);
    expect(root?.classList.contains('haru-session-status--paused')).toBe(true);
    expect(screen.getByText('Paused')).toBeTruthy();
    expect(screen.getByRole('timer').textContent).toBe('00:10');
  });
});

describe('SessionBookChip (`296:1203`, AC-4-126)', () => {
  const withCover: BookSummary = {
    id: '0b0c5e55-0000-4000-8000-0000000000a1',
    title: 'The Most Magnificent Thing',
    author: 'Ashley Spires',
    coverUrl: 'https://example.com/cover.png',
  };

  it('제목 = `book.title` 그대로 · 표지 이미지 alt="" (장식)', () => {
    const { container } = render(<SessionBookChip book={withCover} />);
    expect(container.querySelector('.haru-session-book-chip__title')?.textContent).toBe(
      'The Most Magnificent Thing',
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://example.com/cover.png');
    expect(img?.getAttribute('alt')).toBe('');
  });

  it('coverUrl 없음 → `T-5` 그라디언트 자리 (이미지 0)', () => {
    const { coverUrl: _omit, ...noCover } = withCover;
    const { container } = render(<SessionBookChip book={noCover} />);
    expect(container.querySelector('img')).toBeNull();
    expect(
      container
        .querySelector('.haru-session-book-chip__cover--placeholder')
        ?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('긴 제목도 글자를 자르지 않는다 — 말줄임은 CSS 만 (Spec §9.1)', () => {
    const title = 'The Very Long Adventure of the Little Cloud Who Wanted to See the Sea';
    const { container } = render(<SessionBookChip book={{ ...withCover, title }} />);
    expect(container.querySelector('.haru-session-book-chip__title')?.textContent).toBe(title);
  });

  it('book: null → 렌더 0', () => {
    const { container } = render(<SessionBookChip book={null} />);
    expect(container.innerHTML).toBe('');
  });
});
