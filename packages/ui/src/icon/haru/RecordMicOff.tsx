/**
 * `haru:record-mic-off` — Record Control `PermissionDenied` 변형의 40×40 마이크 끔 (Figma `298:1254`,
 * 변형 `298:1245` 안, 노드 이름 `icon/mic-off`).
 *
 * path 는 Lucide `mic-off` 를 40 박스로 옮긴 것과 같지만 **선 굵기가 다르다**: Figma 원본 stroke
 * `3.33333`(24 기준 2) ↔ HARU 규격 `LUCIDE_STROKE_WIDTH` 1.5(40 박스에서 2.5px). Visual Gap
 * `VG-F2-01`(피복 −25%) — `get_design_context(298:1254)` 에셋 원문(2026-10-29)을 그대로 export 했다.
 * 같은 컨트롤의 `haru:record-mic` 받침 stroke 와 같은 값이다. Figma 원본의 `white` 를
 * **`currentColor`** 로 바꾸고 색은 사용 지점(`RecordControl`)이 토큰으로 준다.
 */
export function RecordMicOff() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        d="M3.33333 3.33333L36.6667 36.6667"
        stroke="currentColor"
        strokeWidth={3.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31.4833 22.05C31.6037 21.3733 31.665 20.6874 31.6667 20V16.6667"
        stroke="currentColor"
        strokeWidth={3.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.33333 16.6667V20C8.29942 22.3319 8.9652 24.6205 10.2447 26.5704C11.5242 28.5202 13.3588 30.0419 15.5116 30.9389C17.6644 31.8359 20.0366 32.0671 22.3221 31.6026C24.6076 31.1382 26.7014 29.9994 28.3333 28.3333"
        stroke="currentColor"
        strokeWidth={3.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 15.5667V8.33333C24.9932 7.21062 24.6088 6.12285 23.9086 5.2452C23.2084 4.36756 22.2332 3.75111 21.14 3.49514C20.0469 3.23917 18.8994 3.35857 17.8823 3.83411C16.8652 4.30966 16.0378 5.11367 15.5333 6.11667"
        stroke="currentColor"
        strokeWidth={3.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 15V20C15.0009 20.9883 15.2946 21.9541 15.8441 22.7756C16.3935 23.597 17.1741 24.2372 18.0872 24.6152C19.0003 24.9933 20.0049 25.0923 20.9742 24.8998C21.9436 24.7072 22.8341 24.2317 23.5333 23.5333"
        stroke="currentColor"
        strokeWidth={3.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 31.6667V36.6667"
        stroke="currentColor"
        strokeWidth={3.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
