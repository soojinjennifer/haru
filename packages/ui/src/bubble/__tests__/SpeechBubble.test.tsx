import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

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

  /*
   * `hint` 슬롯 — Figma `50:176` `type=Type2` 의 보조 한 줄 (`I261:1293;50:173`).
   * Stage 3 Home 재대조에서 추가되었다. 값이 없으면 **빈 줄을 만들지 않는다**.
   */
  describe('hint slot (Figma `50:176` Type2)', () => {
    it('renders the hint under the main line and keeps both readable', () => {
      render(
        <SpeechBubble tail="bottom-right" hint={<span>Pick a book to begin.</span>}>
          Ready when you are.
        </SpeechBubble>,
      );

      expect(screen.getByText('Ready when you are.')).toBeTruthy();
      const hint = screen.getByText('Pick a book to begin.');
      expect(hint.closest('.haru-bubble__hint')).not.toBeNull();
      // 보조 문구는 숨기지 않는다 — 스크린리더가 읽어야 하는 안내다.
      expect(hint.closest('[aria-hidden="true"]')).toBeNull();
    });

    it('renders no hint element when the slot is empty', () => {
      const { container } = render(<SpeechBubble tail="bottom-right">Hi</SpeechBubble>);
      expect(container.querySelector('.haru-bubble__hint')).toBeNull();
    });
  });

  /*
   * 닫기 버튼 — **Figma 에 없는 요소**다 (사용자 지시 2026-10-05, 허용 차이).
   * API 는 `InlineAlert` 와 같다: `onDismiss` + `dismissLabel` 이 **둘 다** 있을 때만 렌더한다.
   */
  describe('dismiss button', () => {
    it('renders only when both onDismiss and dismissLabel are given', () => {
      const { container: none } = render(<SpeechBubble>Hi</SpeechBubble>);
      expect(none.querySelector('.haru-bubble__dismiss')).toBeNull();

      const { container: half } = render(
        <SpeechBubble onDismiss={() => undefined}>Hi</SpeechBubble>,
      );
      // 접근 가능한 이름 없는 버튼을 만들지 않는다.
      expect(half.querySelector('.haru-bubble__dismiss')).toBeNull();
    });

    it('is a named button that calls back, and widens the end padding', () => {
      let dismissed = 0;
      const { container } = render(
        <SpeechBubble
          tail="bottom-right"
          dismissLabel="Dismiss"
          onDismiss={() => {
            dismissed += 1;
          }}
        >
          Hi
        </SpeechBubble>,
      );

      const button = screen.getByRole('button', { name: 'Dismiss' });
      fireEvent.click(button);
      expect(dismissed).toBe(1);

      // 본체 기하를 바꾸지 않도록 절대 배치 + padding 확장 조합이다.
      expect(container.querySelector('.haru-bubble--dismissible')).not.toBeNull();
      // tail 은 그대로 남는다 (기하 불변).
      expect(container.querySelector('.haru-bubble__tail')).not.toBeNull();
    });

    it('is reachable by keyboard', () => {
      render(
        <SpeechBubble dismissLabel="Dismiss" onDismiss={() => undefined}>
          Hi
        </SpeechBubble>,
      );

      const button = screen.getByRole('button', { name: 'Dismiss' });
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  /*
   * `W-5` (approvals §13.3). 줄 수 자체는 레이아웃이라 jsdom 에서 셀 수 없다 —
   * 실제 4줄 상한은 `e2e/home.spec.ts` 가 픽셀로 단정한다. 여기서는 **옵트인 여부**만 고정한다:
   * 상한 근거가 Home 캐릭터 얼굴 실측이라 기본값이 켜져 있으면 안 된다.
   */
  describe('clampContent', () => {
    it('기본값은 꺼짐이다 — 다른 화면 버블을 말줄임하지 않는다', () => {
      const { container } = render(<SpeechBubble>Hi</SpeechBubble>);
      expect(container.querySelector('.haru-bubble--clamp')).toBeNull();
    });

    it('켜면 content 상자에 클램프 class 가 붙고 기하 class 는 그대로다', () => {
      const { container } = render(
        <SpeechBubble clampContent tail="bottom-right" hint="later">
          Hi
        </SpeechBubble>,
      );

      expect(container.querySelector('.haru-bubble--clamp')).not.toBeNull();
      // 본체 기하·tail·보조 한 줄은 영향을 받지 않는다.
      expect(container.querySelector('.haru-bubble--tail-bottom-right')).not.toBeNull();
      expect(container.querySelector('.haru-bubble__tail')).not.toBeNull();
      expect(container.querySelector('.haru-bubble__hint')?.textContent).toBe('later');
    });
  });
});
