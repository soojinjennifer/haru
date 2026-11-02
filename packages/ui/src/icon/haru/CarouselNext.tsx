/**
 * `haru:carousel-next` — Prompt Drawer 캐러셀 오른쪽 화살표 24×24 (Figma `86:286` `shape=right`,
 * `88:708` 안 — Stage 4b `S4-G2`). `haru:carousel-previous` 의 좌우 대칭 원문이다.
 *
 * 원본 fill(`#B0CFC0` / 비활성 `#F2F2F7`)을 **`currentColor`** 로 바꿨다 — 색은 `PromptCarousel` 이 준다.
 */
export function CarouselNext() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        d="M7.795 16.59L12.375 12L7.795 7.41L9.205 6L15.205 12L9.205 18L7.795 16.59Z"
        fill="currentColor"
      />
    </svg>
  );
}
