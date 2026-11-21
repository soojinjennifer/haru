import { useEffect, useRef } from 'react';

/**
 * 고르면 닫히는 radio 목록(선택 시트)의 **키보드 선택** — WCAG 2.1.1 (Stage 8 `S8-G` 감사, AC-8-47).
 *
 * native radio 는 화살표로 focus 를 옮기면서 **그 자리에서 선택(change)** 한다. 포인터 탭과 같은
 * `onChange` 로 곧장 닫으면 키보드 사용자는 처음 칸의 이웃(한 칸)밖에 고를 수 없다 — 실측: 연도 시트에서
 * ArrowDown 1회에 시트가 닫혔다. 그래서:
 *
 * - 화살표 이동 = 선택만 바꾸고 목록에 머문다 (`onChange` 안에서 `consumeKeyboardMove()` 가 `true`)
 * - Enter · (이미 선택된 칸의) Space = 확정 → `onCommit(value)`
 * - 포인터 동작은 그대로다
 *
 * `name` 은 그 목록 radio 묶음의 `name` 이다. 다른 입력에는 반응하지 않는다.
 */
export function useRadioListKeyboard(options: {
  active: boolean;
  name: string;
  onCommit: (value: string) => void;
}): { consumeKeyboardMove: () => boolean } {
  const { active, name, onCommit } = options;
  const moved = useRef(false);
  const commitRef = useRef(onCommit);

  useEffect(() => {
    commitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== 'radio' || target.name !== name)
        return;
      if (MOVE_KEYS.has(event.key)) {
        moved.current = true;
        return;
      }
      if (event.key === 'Enter' || (event.key === ' ' && target.checked)) {
        event.preventDefault();
        commitRef.current(target.value);
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      moved.current = false;
    };
  }, [active, name]);

  return {
    consumeKeyboardMove: () => {
      const wasMove = moved.current;
      moved.current = false;
      return wasMove;
    },
  };
}

/** native radio 묶음에서 focus 와 선택을 함께 옮기는 키 (Home · End 는 native radio 가 처리하지 않는다). */
const MOVE_KEYS: ReadonlySet<string> = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
