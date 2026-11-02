/**
 * `haru:carousel-previous` — Prompt Drawer 캐러셀 왼쪽 화살표 24×24 (Figma `I88:708;88:693`,
 * `86:324` `Prompt Card` 의 arrow 변형 — Stage 4b `S4-G2`).
 *
 * Material 계열 **채움** chevron 이라 Lucide `chevron-left`(외곽선 · round cap)와 도형이 다르다.
 * `get_design_context(88:960 · 88:684 · 88:700)` 에셋 원문(2026-10-29)의 path 를 그대로 export 했다.
 * 원본 fill 은 활성 `#B0CFC0` · 비활성 `#F2F2F7` 로 구워져 있으나 **`currentColor`** 로 바꾸고 색은 사용 지점
 * (`PromptCarousel`)이 `--color-carousel-arrow*` 토큰으로 준다.
 */
export function CarouselPrevious() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        d="M15.205 16.59L10.625 12L15.205 7.41L13.795 6L7.79504 12L13.795 18L15.205 16.59Z"
        fill="currentColor"
      />
    </svg>
  );
}
