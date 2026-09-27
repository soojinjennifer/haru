import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { act, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { MOTION_DURATION_MS } from '../../lib/motion';
import { SwipeDeck } from '../SwipeDeck';

const ITEMS = ['Question 1', 'Question 2', 'Question 3', 'Question 4'] as const;

/** reduced-motion 을 켜면 진행이 즉시 확정된다 (§9.2 — 즉시 교체). */
function stubReducedMotion(matches: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

function Controlled({ initial = 0, controls }: { initial?: number; controls?: 'inline' | 'none' }) {
  const [index, setIndex] = useState(initial);
  return (
    <SwipeDeck
      items={ITEMS}
      index={index}
      onIndexChange={setIndex}
      renderItem={(item) => <p>{item}</p>}
      label="Baseline survey"
      prevLabel="Previous question"
      nextLabel="Next question"
      statusLabel={`Question ${String(index + 1)} of ${String(ITEMS.length)}`}
      {...(controls === undefined ? {} : { controls })}
    />
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SwipeDeck (Stage 2 Design Spec §4.2 · 결정 D-9)', () => {
  it('덱은 role=group + card deck 이고 현재 카드만 접근성 트리에 있다', () => {
    stubReducedMotion(true);
    render(<Controlled />);

    const deck = screen.getByRole('group', { name: 'Baseline survey' });
    expect(deck.getAttribute('aria-roledescription')).toBe('card deck');
    expect(within(deck).getByText('Question 1')).toBeTruthy();
    // 뒤 카드는 내용을 복제하지 않는다 (radio name 중복·접근성 중복 방지).
    expect(screen.queryByText('Question 2')).toBeNull();
    expect(deck.querySelectorAll('.haru-swipe-deck__card--behind')).toHaveLength(2);
  });

  it('현재 카드 위치를 aria-live 로 알린다', () => {
    stubReducedMotion(true);
    render(<Controlled />);

    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe('Question 1 of 4');
  });

  it('버튼만으로 모든 카드에 도달한다 (제스처 없이 — WCAG 2.5.1)', () => {
    stubReducedMotion(true);
    render(<Controlled />);

    const next = screen.getByRole('button', { name: 'Next question' });
    const prev = screen.getByRole('button', { name: 'Previous question' });

    expect(prev).toHaveProperty('disabled', true);
    for (const expected of ['Question 2', 'Question 3', 'Question 4']) {
      fireEvent.click(next);
      expect(screen.getByText(expected)).toBeTruthy();
    }
    expect(next).toHaveProperty('disabled', true);

    for (const expected of ['Question 3', 'Question 2', 'Question 1']) {
      fireEvent.click(prev);
      expect(screen.getByText(expected)).toBeTruthy();
    }
    expect(prev).toHaveProperty('disabled', true);
  });

  it('첫·마지막에서 버튼이 사라지지 않고 disabled 로 남는다', () => {
    stubReducedMotion(true);
    render(<Controlled initial={ITEMS.length - 1} />);

    expect(screen.getByRole('button', { name: 'Next question' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Previous question' })).toHaveProperty(
      'disabled',
      false,
    );
  });

  it('키보드 ArrowRight / ArrowLeft 만으로 모든 카드에 도달한다 (버튼 없이)', () => {
    stubReducedMotion(true);
    render(<Controlled controls="none" />);

    // 화살표는 덱 안에 포커스가 있을 때 동작한다 (APG carousel — 버튼이 기본 경로).
    const deck = screen.getByRole('group', { name: 'Baseline survey' });

    for (const expected of ['Question 2', 'Question 3', 'Question 4']) {
      fireEvent.keyDown(deck, { key: 'ArrowRight' });
      expect(screen.getByText(expected)).toBeTruthy();
    }
    // 마지막에서 더 눌러도 넘어가지 않는다.
    fireEvent.keyDown(deck, { key: 'ArrowRight' });
    expect(screen.getByText('Question 4')).toBeTruthy();

    for (const expected of ['Question 3', 'Question 2', 'Question 1']) {
      fireEvent.keyDown(deck, { key: 'ArrowLeft' });
      expect(screen.getByText(expected)).toBeTruthy();
    }
  });

  it('화살표를 자체 처리하는 컨트롤(radio) 위에서는 덱이 키를 가로채지 않는다', () => {
    stubReducedMotion(true);
    const onIndexChange = vi.fn();
    render(
      <SwipeDeck
        items={ITEMS}
        index={0}
        onIndexChange={onIndexChange}
        renderItem={() => <input type="radio" name="answer" aria-label="Often" />}
        label="Baseline survey"
        prevLabel="Previous question"
        nextLabel="Next question"
      />,
    );

    fireEvent.keyDown(screen.getByRole('radio', { name: 'Often' }), { key: 'ArrowRight' });

    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it('모션이 켜져 있으면 진행 애니메이션이 끝난 뒤 index 가 확정된다', () => {
    stubReducedMotion(false);
    vi.useFakeTimers();
    try {
      render(<Controlled />);
      const card = document.querySelector('.haru-swipe-deck__card--front');
      fireEvent.click(screen.getByRole('button', { name: 'Next question' }));

      // 애니메이션 동안에는 아직 1번 카드이며 조작을 막는다.
      expect(screen.getByText('Question 1')).toBeTruthy();
      expect(card?.className).toContain('haru-swipe-deck__card--exit-next');
      expect(screen.getByRole('button', { name: 'Next question' })).toHaveProperty(
        'disabled',
        true,
      );

      act(() => {
        vi.advanceTimersByTime(MOTION_DURATION_MS.base);
      });

      expect(screen.getByText('Question 2')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  /**
   * `QA-2-001` 회귀 방지 — **끌지 않은 포인터는 캡처하지 않는다.**
   *
   * `pointerdown` 에서 `setPointerCapture` 를 걸면 브라우저가 후속 `mouseup`·`click` 의
   * target 을 캡처 요소(카드 컨테이너)로 바꾼다. 그러면 카드 안의 radio·IconButton 이
   * **마우스로는 눌리지 않는다**(키보드·터치는 멀쩡해서 드러나지 않았다).
   * jsdom 은 리타깃을 재현하지 않으므로 여기서는 **캡처 호출 자체**를 검사하고,
   * 실제 리타깃 동작은 `e2e/onboarding.spec.ts` 의 마우스 경로 테스트가 덮는다.
   */
  describe('포인터 캡처 시점 (QA-2-001)', () => {
    function installPointerCaptureStubs(): { set: ReturnType<typeof vi.fn> } {
      const set = vi.fn();
      // jsdom 에는 Pointer Capture API 가 없다 — 검사용으로 심고 테스트 뒤에 지운다.
      Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
        value: set,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
        value: () => true,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });
      return { set };
    }

    afterEach(() => {
      for (const name of ['setPointerCapture', 'hasPointerCapture', 'releasePointerCapture']) {
        Reflect.deleteProperty(HTMLElement.prototype, name);
      }
    });

    it('누르기만 하면 캡처하지 않고 카드 안 컨트롤이 클릭을 받는다', () => {
      stubReducedMotion(true);
      const { set } = installPointerCaptureStubs();
      const onIndexChange = vi.fn();
      render(
        <SwipeDeck
          items={ITEMS}
          index={0}
          onIndexChange={onIndexChange}
          renderItem={() => <input type="radio" name="answer" aria-label="Often" />}
          label="Baseline survey"
          prevLabel="Previous question"
          nextLabel="Next question"
        />,
      );

      const card = document.querySelector('.haru-swipe-deck__card--front') as HTMLElement;
      const radio = screen.getByRole('radio', { name: 'Often' });

      fireEvent.pointerDown(radio, { pointerId: 1, clientX: 200, button: 0 });
      fireEvent.pointerUp(radio, { pointerId: 1, clientX: 200 });
      fireEvent.click(radio);

      expect(set).not.toHaveBeenCalled();
      expect(radio).toHaveProperty('checked', true);
      expect(card.className).not.toContain('haru-swipe-deck__card--dragging');
      expect(onIndexChange).not.toHaveBeenCalled();
    });

    it('임계(8px) 이상 움직인 뒤에야 캡처한다', () => {
      stubReducedMotion(true);
      const { set } = installPointerCaptureStubs();
      render(<Controlled />);

      const card = document.querySelector('.haru-swipe-deck__card--front') as HTMLElement;

      fireEvent.pointerDown(card, { pointerId: 1, clientX: 300, button: 0 });
      fireEvent.pointerMove(card, { pointerId: 1, clientX: 295, buttons: 1 });
      expect(set).not.toHaveBeenCalled();

      fireEvent.pointerMove(card, { pointerId: 1, clientX: 280, buttons: 1 });
      expect(set).toHaveBeenCalledWith(1);

      fireEvent.pointerUp(card, { pointerId: 1, clientX: 280 });
    });

    it('버튼을 뗀 채로 카드 위를 지나가도 끌기가 시작되지 않는다', () => {
      stubReducedMotion(true);
      const { set } = installPointerCaptureStubs();
      render(<Controlled />);

      const card = document.querySelector('.haru-swipe-deck__card--front') as HTMLElement;

      // 누른 뒤 카드 밖에서 놓아 pointerup 을 놓친 상황.
      fireEvent.pointerDown(card, { pointerId: 1, pointerType: 'mouse', clientX: 300, button: 0 });
      fireEvent.pointerMove(card, {
        pointerId: 1,
        pointerType: 'mouse',
        clientX: 100,
        buttons: 0,
      });

      expect(set).not.toHaveBeenCalled();
      expect(screen.getByText('Question 1')).toBeTruthy();
    });
  });

  it('제스처(Pointer Events)는 부가 경로다 — 임계 이상 끌면 다음 카드로 간다', () => {
    stubReducedMotion(true);
    const rect = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 320,
      height: 400,
      top: 0,
      left: 0,
      right: 320,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    try {
      render(<Controlled />);
      const card = document.querySelector('.haru-swipe-deck__card--front') as HTMLElement;

      fireEvent.pointerDown(card, { pointerId: 1, clientX: 300, button: 0 });
      fireEvent.pointerMove(card, { pointerId: 1, clientX: 100 });
      fireEvent.pointerUp(card, { pointerId: 1, clientX: 100 });

      expect(screen.getByText('Question 2')).toBeTruthy();
    } finally {
      rect.mockRestore();
    }
  });

  it('임계 미만으로 끌면 제자리로 돌아온다 (returning)', () => {
    stubReducedMotion(true);
    const rect = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 320,
      height: 400,
      top: 0,
      left: 0,
      right: 320,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    try {
      render(<Controlled />);
      const card = document.querySelector('.haru-swipe-deck__card--front') as HTMLElement;

      fireEvent.pointerDown(card, { pointerId: 1, clientX: 300, button: 0 });
      fireEvent.pointerMove(card, { pointerId: 1, clientX: 280 });
      fireEvent.pointerUp(card, { pointerId: 1, clientX: 280 });

      expect(screen.getByText('Question 1')).toBeTruthy();
      expect(
        (
          document.querySelector('.haru-swipe-deck__card--front') as HTMLElement
        ).style.getPropertyValue('--deck-drag-x'),
      ).toBe('');
    } finally {
      rect.mockRestore();
    }
  });

  it('덱 끝에서는 뒤 카드 수가 남은 카드 수만큼 줄어든다', () => {
    stubReducedMotion(true);
    render(<Controlled initial={ITEMS.length - 1} />);

    expect(document.querySelectorAll('.haru-swipe-deck__card--behind')).toHaveLength(0);
  });

  it('items 가 비어 있어도 렌더되고 두 버튼 모두 비활성이다 (0개 상태)', () => {
    stubReducedMotion(true);
    render(
      <SwipeDeck
        items={[]}
        index={0}
        onIndexChange={vi.fn()}
        renderItem={() => <p>never</p>}
        label="Empty deck"
        prevLabel="Previous question"
        nextLabel="Next question"
      />,
    );

    expect(screen.getByRole('group', { name: 'Empty deck' })).toBeTruthy();
    expect(document.querySelectorAll('.haru-swipe-deck__card')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Next question' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Previous question' })).toHaveProperty(
      'disabled',
      true,
    );
  });
});

/**
 * 결정 `D-9` 회귀 방지 — `AppColumn` 안에 클리핑 박스를 만들지 않는다.
 * `scroll-snap` / `overflow` 를 쓰면 카드 그림자가 잘린다 (Stage 1 §2.2 · `QA-1-L1`).
 */
describe('SwipeDeck CSS 는 overflow · scroll-snap 을 쓰지 않는다 (D-9)', () => {
  const source = readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'SwipeDeck.css'),
    'utf8',
  );
  /** 주석에는 두 이름이 근거로 등장하므로 선언부만 본다. */
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');

  it('overflow 선언이 없다', () => {
    expect(css).not.toMatch(/^\s*overflow[-:]/m);
  });

  it('scroll-snap 을 쓰지 않는다', () => {
    expect(css).not.toContain('scroll-snap');
  });

  it('카드 이동은 transform 이다', () => {
    expect(css).toContain('transform: translate3d(var(--deck-drag-x, 0px), 0, 0)');
  });
});
