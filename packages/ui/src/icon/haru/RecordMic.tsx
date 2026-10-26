/**
 * `haru:record-mic` — Record Control `Record` 변형의 40×40 마이크 (Figma `139:2838`).
 *
 * Lucide `mic` 로 대체할 수 없다: Lucide 는 **외곽선** 캡슐이고 Figma 는 캡슐 몸통이 **채움**이다
 * (`get_design_context(300:1309)` 에셋 원문 — 몸통 `fill`, 받침 2획 `stroke 3.333`). Stage 0 #21 에 따라
 * HARU 전용 SVG 로 export 했다. Figma 원본의 `white` 를 **`currentColor`** 로 바꾸고 색은 사용 지점
 * (`RecordControl`)이 토큰으로 준다.
 */
export function RecordMic() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        d="M25 10C25 7.23858 22.7614 5 20 5C17.2386 5 15 7.23858 15 10V18.3333C15 21.0948 17.2386 23.3333 20 23.3333C22.7614 23.3333 25 21.0948 25 18.3333V10Z"
        fill="currentColor"
      />
      <path
        d="M10 18.3333C10 20.9855 11.0536 23.529 12.9289 25.4044C14.8043 27.2798 17.3478 28.3333 20 28.3333C22.6522 28.3333 25.1957 27.2798 27.0711 25.4044C28.9464 23.529 30 20.9855 30 18.3333"
        stroke="currentColor"
        strokeWidth={3.33333}
        strokeLinecap="round"
      />
      <path
        d="M20 28.3333V34.1667"
        stroke="currentColor"
        strokeWidth={3.33333}
        strokeLinecap="round"
      />
    </svg>
  );
}
