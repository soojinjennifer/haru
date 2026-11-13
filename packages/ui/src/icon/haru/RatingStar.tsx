/**
 * `haru:rating-star` — 회고 카드 별 `91:694`~`91:702` (Stage 5 Spec §3.1 · M-1). 30×30 frame + 자체 vector.
 *
 * ⚠ `Icon shape=star`(`117:879`, 25×24) 와 **다른 글리프**다 — Spec M-1 이 COMPONENT_MAP 의 근거를 정정했다.
 * Figma 원문은 채움 `#D0CCA1` · 빈 `#D6DEDC` 두 벌(path 동일)이고, export 시 `currentColor` 로 바꿨다 —
 * 색은 `StarRating` 이 `--color-rating-filled` / `--color-rating-empty` 로 주입한다.
 */
export function RatingStar() {
  return (
    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        d="M15 2.5L18.625 10.25L26.875 11.25L20.75 17L22.375 25.25L15 21.25L7.625 25.25L9.25 17L3.125 11.25L11.375 10.25L15 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
