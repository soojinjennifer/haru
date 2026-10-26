/**
 * `haru:record-pause` — Record Control `Pause` 변형의 40×40 일시정지 (Figma `140:2866`).
 *
 * Lucide `pause` 로 대체할 수 없다: Lucide 막대는 **둥근 모서리 외곽선**이고 Figma 는 **radius 0**
 * 채움 막대 2개(폭 6.67 · 높이 23.33 · 간격 6.67)다 (Stage 4 Design Spec §2.6.1 · §2.6.3 —
 * "글리프 대조 후 다르면 HARU SVG"). 색은 `currentColor` — 사용 지점이 토큰으로 준다.
 */
export function RecordPause() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        d="M10 31.6667H16.6667V8.33333H10V31.6667ZM23.3333 8.33333V31.6667H30V8.33333H23.3333Z"
        fill="currentColor"
      />
    </svg>
  );
}
