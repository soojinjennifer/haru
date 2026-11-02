/**
 * `SessionReadyBubble` — AC-4-122 ④ 조합 표 (제목 있음/없음 × n = 0 · 1 · 3 · 5 · 7) 의 **DOM 구조** 단정.
 * 높이 식(`h = 21 + 22 + 6 + 6n + Σpill` / `21 + 6n + Σpill`)은 레이아웃이 필요해 e2e 가 잰다.
 */
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionSummarySchema } from '@haru/contracts';

import {
  createSessionPromptsFixture,
  MOCK_READY_BUBBLE,
  MOCK_READY_REMINDER_BUBBLE,
} from '../../../mocks/fixtures/sessions';
import { SESSION_BUBBLE_PROMPT_CUTOFF, SessionReadyBubble } from '../SessionReadyBubble';

const COUNTS = [0, 1, 3, 5, 7] as const;
const GREETINGS = [
  ['있음', MOCK_READY_BUBBLE],
  ['없음(null)', null],
] as const;

describe('SessionReadyBubble — 제목 2 × n 5 = 10 케이스 (AC-4-122)', () => {
  for (const [label, bubble] of GREETINGS) {
    for (const count of COUNTS) {
      it(`제목 ${label} · n=${String(count)}`, () => {
        const prompts = createSessionPromptsFixture(count);
        const { container } = render(
          <SessionReadyBubble
            bubble={bubble}
            reminderBubble={MOCK_READY_REMINDER_BUBBLE}
            reminderActive={false}
            prompts={prompts}
          />,
        );

        if (count === 0) {
          // 빈 버블을 만들지 않는다 (Spec §2.2.3-② n=0) — 제목이 있어도 마찬가지다.
          expect(container.querySelector('.haru-bubble')).toBeNull();
          return;
        }
        const titles = container.querySelectorAll('.haru-bubble__content > .haru-text');
        expect(titles).toHaveLength(bubble === null ? 0 : 1);
        const pills = container.querySelectorAll('.haru-prompt-pill');
        expect(pills).toHaveLength(Math.min(count, SESSION_BUBBLE_PROMPT_CUTOFF));
        // pill 은 포커스·탭 대상이 아니다
        expect(container.querySelectorAll('button, [tabindex]')).toHaveLength(0);
      });
    }
  }

  it('n = 0 · bubble null 은 contracts 가 받아들인다 (`prompts` 에 .min 없음 — 화면이 다룬다)', () => {
    const base = {
      id: '99999999-9999-4999-8999-000000000001',
      status: 'ready',
      mode: 'recorded',
      book: null,
      readingContext: null,
      readyAt: '2026-01-01T00:00:00.000Z',
      startedAt: null,
      completedAt: null,
      completedReason: null,
      recordedSeconds: 0,
      analysisOutcome: null,
    };
    expect(
      SessionSummarySchema.safeParse({ ...base, prompts: [], bubble: null, reminderBubble: null })
        .success,
    ).toBe(true);
  });

  it('`Try this prompt !` 리터럴을 렌더하지 않는다 — Figma placeholder (`D4-22`)', () => {
    const { container } = render(
      <SessionReadyBubble
        bubble={null}
        reminderBubble={null}
        reminderActive={false}
        prompts={createSessionPromptsFixture(5)}
      />,
    );
    expect(container.textContent).not.toMatch(/Try this prompt/);
  });
});

describe('SessionReadyBubble — 짧은 세로 목록 (`D4-78`)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderBubble(bubble: typeof MOCK_READY_BUBBLE) {
    const { container } = render(
      <SessionReadyBubble
        bubble={bubble}
        reminderBubble={null}
        reminderActive={false}
        prompts={createSessionPromptsFixture(5)}
      />,
    );
    return container;
  }

  it('넘치지 않으면 Tab 정지점이 아니다', () => {
    const list = renderBubble(MOCK_READY_BUBBLE).querySelector('ul');
    expect(list?.hasAttribute('tabindex')).toBe(false);
    expect(list?.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('넘치면 Tab 정지점 + 제목으로 이름 · 제목이 없으면 이름 참조도 없다', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(222);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(120);
    const withTitle = renderBubble(MOCK_READY_BUBBLE);
    const list = withTitle.querySelector('ul');
    expect(list?.getAttribute('tabindex')).toBe('0');
    expect(list?.getAttribute('aria-labelledby')).toBe(
      withTitle.querySelector('.haru-bubble__content > .haru-text')?.id,
    );

    const untitled = renderBubble(null).querySelector('ul');
    expect(untitled?.getAttribute('tabindex')).toBe('0');
    expect(untitled?.hasAttribute('aria-labelledby')).toBe(false);
  });
});

describe('SessionReadyBubble — 5분 리마인드 (AC-4-46 화면, `D4-59`)', () => {
  const prompts = createSessionPromptsFixture(5);

  function titleOf(container: HTMLElement): Element | null {
    return container.querySelector('.haru-bubble__content > .haru-text');
  }

  it('reminderActive 가 켜지면 제목 줄 글자만 리마인드 문구로 바뀐다 — 같은 노드 · clamp · pill 불변', () => {
    const { container, rerender } = render(
      <SessionReadyBubble
        bubble={MOCK_READY_BUBBLE}
        reminderBubble={MOCK_READY_REMINDER_BUBBLE}
        reminderActive={false}
        prompts={prompts}
      />,
    );
    const before = titleOf(container);
    const pillsBefore = container.querySelector('.haru-session-bubble__prompts')?.outerHTML;
    expect(before?.textContent).toBe(MOCK_READY_BUBBLE?.text);

    rerender(
      <SessionReadyBubble
        bubble={MOCK_READY_BUBBLE}
        reminderBubble={MOCK_READY_REMINDER_BUBBLE}
        reminderActive
        prompts={prompts}
      />,
    );
    const after = titleOf(container);
    expect(after).toBe(before);
    expect(after?.textContent).toBe(MOCK_READY_REMINDER_BUBBLE?.text);
    expect(after?.className).toContain('haru-text--truncate-1');
    expect(container.querySelector('.haru-session-bubble__prompts')?.outerHTML).toBe(pillsBefore);
  });

  it.each([
    ['null', null],
    ['text null', { text: null }],
    ["text ''", { text: '' }],
  ] as const)(
    '리마인드가 %s 이면 아무것도 바꾸지 않는다 (인사 있음 · 없음)',
    (_label, reminder) => {
      for (const bubble of [MOCK_READY_BUBBLE, null]) {
        const props = { bubble, reminderBubble: reminder, prompts } as const;
        const { container, rerender, unmount } = render(
          <SessionReadyBubble {...props} reminderActive={false} />,
        );
        const before = container.innerHTML;
        rerender(<SessionReadyBubble {...props} reminderActive />);
        expect(container.innerHTML).toBe(before);
        unmount();
      }
    },
  );

  it('인사가 없어도 리마인드가 있으면 제목 줄이 생긴다 (리마인드 = 서버 값 그대로)', () => {
    const { container } = render(
      <SessionReadyBubble
        bubble={null}
        reminderBubble={MOCK_READY_REMINDER_BUBBLE}
        reminderActive
        prompts={prompts}
      />,
    );
    expect(titleOf(container)?.textContent).toBe(MOCK_READY_REMINDER_BUBBLE?.text);
  });
});
