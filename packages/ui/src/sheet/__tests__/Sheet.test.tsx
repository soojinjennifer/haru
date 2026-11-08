import { act, useState } from 'react';
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

/**
 * 2라운드-4 — `surface` 와 `contentShadowInset="cover"` (사용자 결정 2026-10-09 ① · ③).
 *
 * 둘 다 **opt-in** 이다. 주지 않은 시트에는 class 가 붙지 않아 기존 외형이 그대로다 —
 * 그 사실을 여기서 고정한다 (Stage 2 시트 baseline 보호).
 */
describe('Sheet — 면 색(`surface`) · 표지 그림자 자리(`contentShadowInset="cover"`)', () => {
  it('`surface` 를 주지 않으면 면 class 가 **붙지 않는다**', () => {
    render(
      <Sheet open onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );

    const sheet = document.querySelector('.haru-sheet') as HTMLElement;
    expect([...sheet.classList].some((name) => name.startsWith('haru-sheet--surface'))).toBe(false);
  });

  it('`surface="spring"` 이면 면 class 가 붙는다 (Figma `86:482` 뒷면 면)', () => {
    render(
      <Sheet open onClose={() => {}} title="Prompts" variant="inset-card" surface="spring">
        <p>body</p>
      </Sheet>,
    );

    expect(document.querySelector('.haru-sheet--surface-spring')).not.toBeNull();
    /* 변형·상태 class 는 그대로다 — 면 색은 덧붙는 축이다. */
    expect(document.querySelector('.haru-sheet--inset-card')).not.toBeNull();
  });

  it('`variant="floating"` + `surface="drawer"` — Prompt Drawer `88:960` (Stage 4b `S4-G2`): 핸들 있음 · 두 class', () => {
    render(
      <Sheet open onClose={() => {}} title="Prompts" variant="floating" surface="drawer">
        <p>body</p>
      </Sheet>,
    );

    const sheet = screen.getByRole('dialog', { name: 'Prompts' });
    expect(sheet.classList.contains('haru-sheet--floating')).toBe(true);
    expect(sheet.classList.contains('haru-sheet--surface-drawer')).toBe(true);
    /* `inset-card` 와 달리 핸들이 있다 (`88:669`) */
    expect(sheet.querySelector('.haru-sheet__grabber')).not.toBeNull();
    expect(sheet.getAttribute('aria-modal')).toBe('true');
  });

  it('`contentShadowInset="cover"` 는 **표지 전용** class 만 붙인다 (버블용과 섞이지 않는다)', () => {
    const { unmount } = render(
      <Sheet
        open
        onClose={() => {}}
        title="Prompts"
        variant="inset-card"
        contentShadowInset="cover"
      >
        <p>body</p>
      </Sheet>,
    );

    expect(document.querySelector('.haru-sheet__content--shadow-inset-cover')).not.toBeNull();
    /* 번짐이 다르므로 두 자리를 함께 켜지 않는다 (좌우 14 vs 4 · 아래 10). */
    expect(document.querySelector('.haru-sheet__content--shadow-inset')).toBeNull();
    unmount();

    render(
      <Sheet open onClose={() => {}} title="Prompts" variant="inset-card" contentShadowInset>
        <p>body</p>
      </Sheet>,
    );
    expect(document.querySelector('.haru-sheet__content--shadow-inset-cover')).toBeNull();
  });

  it('renders a leading header slot before the title only when given (D4-64)', () => {
    const { unmount } = render(
      <Sheet open onClose={() => {}} title="Time" leading={<button type="button">Back</button>}>
        <p>body</p>
      </Sheet>,
    );
    const header = document.querySelector('.haru-sheet__header');
    const children = [...(header?.children ?? [])];
    expect(children[0]?.className).toBe('haru-sheet__leading');
    expect(children[0]?.textContent).toBe('Back');
    expect(children[1]?.tagName).toBe('H2');
    unmount();

    render(
      <Sheet open onClose={() => {}} title="Prompts">
        <p>body</p>
      </Sheet>,
    );
    expect(document.querySelector('.haru-sheet__leading')).toBeNull();
  });
});

/**
 * Stage 4b `S4-G2M` — 닫힘 중(240ms) 처리 (Spec §20.4 · `D4-138` Q1 — **공유 `Sheet`**, 모든 variant).
 *
 * 닫힘 중 시트는 `inert` · `aria-modal` 없음, scrim 은 탭을 흡수하되 `onClose` 를 다시 부르지 않는다.
 * 시각 변화는 0 이다 — 기하·모션은 e2e(`session-prompts.spec.ts` `S4-G2M`) 가 본다.
 */
describe('Sheet — 닫힘 중 (`S4-G2M` · Spec §20.4)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const VARIANTS = ['bottom', 'full', 'inset-card', 'floating'] as const;

  for (const variant of VARIANTS) {
    it(`${variant}: 열림 = 모달 · inert 없음 → 닫힘 중 = inert · aria-modal 없음 → 240ms 뒤 언마운트`, () => {
      const { rerender } = render(
        <Sheet open onClose={() => {}} title="Prompts" variant={variant}>
          <Button onPress={() => {}}>Inside</Button>
        </Sheet>,
      );
      const sheet = screen.getByRole('dialog', { name: 'Prompts' });
      expect(sheet.getAttribute('aria-modal')).toBe('true');
      expect(sheet.hasAttribute('inert')).toBe(false);

      rerender(
        <Sheet open={false} onClose={() => {}} title="Prompts" variant={variant}>
          <Button onPress={() => {}}>Inside</Button>
        </Sheet>,
      );
      const closing = document.querySelector('.haru-sheet--closing');
      expect(closing).not.toBeNull();
      expect(closing?.hasAttribute('inert')).toBe(true);
      expect(closing?.hasAttribute('aria-modal')).toBe(false);
      expect(document.querySelector('[aria-modal="true"]')).toBeNull();

      act(() => {
        vi.advanceTimersByTime(240);
      });
      expect(document.querySelector('.haru-sheet')).toBeNull();
    });

    it(`${variant}: scrim 연속 탭 → onClose 1회 (닫힘 중 탭은 흡수만)`, () => {
      const onClose = vi.fn();
      function Harness() {
        const [open, setOpen] = useState(true);
        return (
          <Sheet
            open={open}
            onClose={() => {
              onClose();
              setOpen(false);
            }}
            title="Prompts"
            variant={variant}
          >
            <p>body</p>
          </Sheet>
        );
      }
      render(<Harness />);

      fireEvent.click(document.querySelector('.haru-scrim') as HTMLElement);
      expect(onClose).toHaveBeenCalledOnce();
      const scrim = document.querySelector('.haru-scrim--closing');
      expect(scrim).not.toBeNull();
      fireEvent.click(scrim as HTMLElement);
      fireEvent.click(scrim as HTMLElement);
      expect(onClose).toHaveBeenCalledOnce();
      /* 닫힘 중에는 Escape 도 다시 부르지 않는다 (trap 이 꺼져 있다) */
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledOnce();
    });
  }
});
