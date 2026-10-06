/**
 * `haru:save-star` — Figma `I86:373;117:973` (`Button/White` = `★ Save`) 의 **14×13** 별.
 *
 * `lucide star` 로 대체할 수 없다: lucide 는 24×24 **stroke** 글리프라 채우면 꼭짓점이 둥글고
 * 비율도 다르다. Figma 는 비정사각 viewBox(14×13)의 **채움 단일 path** 다 (audit §16.1).
 *
 * Figma 원본은 `fill="#D0CCA1"`(= palette yellow) 를 구워 두었으나 export 시 `currentColor`
 * 로 바꾸고 색은 사용 지점이 `--activity-card-save-star-color` → `--color-icon-save-star`
 * 로 주입한다.
 *
 * ⚠ viewBox 가 정사각형이 아니므로 `Icon` 의 16/20/24 박스에 넣으면 letterbox 가 생긴다.
 * 사용 지점(`entities/activity-card`)이 14×13 박스를 토큰으로 지정한다.
 */
export function SaveStar() {
  return (
    <svg viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        d="M7 0L9.13684 4.42857L14 5L10.3895 8.28571L11.3474 13L7 10.7143L2.65263 13L3.61053 8.28571L0 5L4.86316 4.42857L7 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
