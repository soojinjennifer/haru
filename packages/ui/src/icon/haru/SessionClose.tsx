/**
 * `haru:session-close` — Figma **`29:77`** = **`300:1319`** (SVG 원문 바이트 동일) 세션 닫기 X 글리프.
 * 4b Design Spec §16.4 · Visual Gap `VG-F1-01`.
 *
 * Lucide `x` 로 대체할 수 없다: Lucide 는 박스 24 기준 선 폭 12 → 20 박스에서 렌더 12×12 · stroke 1.25
 * 인데, Figma 는 **15×15** viewBox · 선 폭 8.75(렌더 10×10) · `stroke-width` **1.375** · round cap 이다.
 *
 * Figma 원본은 `stroke="#5E7370"` 을 구워 두었으나 export 시 `currentColor` 로 바꿨다 — 색은
 * IconButton glass 의 `--icon-button-fg` 가 준다 (`D4-62`).
 *
 * ⚠ 박스 15 는 Icon 의 16/20/24 밖이다 — 사용 지점이 `--icon-button-icon-size-close`(T-30)로 지정한다.
 */
export function SessionClose() {
  return (
    <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        d="M3.125 3.125L7.5 7.5M7.5 7.5L11.875 11.875M7.5 7.5L11.875 3.125M7.5 7.5L3.125 11.875"
        stroke="currentColor"
        strokeWidth={1.375}
        strokeLinecap="round"
      />
    </svg>
  );
}
