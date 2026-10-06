/**
 * `haru:flip-to-back` — Figma `I163:2649;85:588`(앞면) · `I86:482;86:200`(뒷면) 의 24×24 아이콘.
 * Figma 에셋명이 **`flip_to_back`** 이며 `Prompt Card/Home` 의 `flip` variant 를 조작한다.
 *
 * `lucide-react` 에 같은 글리프가 없어 HARU 전용 SVG 로 export 했다 (Stage 0 #21).
 * Figma 원본은 `fill="#B0CFC0"` 로 색을 구워 두었으나 export 시 **`currentColor`** 로 바꾸고
 * 색은 사용 지점이 토큰(`--activity-card-flip-color` → `--color-icon-flip`)으로 주입한다.
 *
 * `icon/haru/flip-to-back.svg` 의 코드 대응본이며 `__tests__/haru-icons.test.tsx` 가
 * viewBox 와 path 데이터를 비교한다.
 */
export function FlipToBack() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        d="M8.5 7H6.5V9H8.5V7ZM8.5 11H6.5V13H8.5V11ZM8.5 3C7.39 3 6.5 3.9 6.5 5H8.5V3ZM12.5 15H10.5V17H12.5V15ZM18.5 3V5H20.5C20.5 3.9 19.6 3 18.5 3ZM12.5 3H10.5V5H12.5V3ZM8.5 17V15H6.5C6.5 16.1 7.39 17 8.5 17ZM18.5 13H20.5V11H18.5V13ZM18.5 9H20.5V7H18.5V9ZM18.5 17C19.6 17 20.5 16.1 20.5 15H18.5V17ZM4.5 7H2.5V19C2.5 20.1 3.39 21 4.5 21H16.5V19H4.5V7ZM14.5 5H16.5V3H14.5V5ZM14.5 17H16.5V15H14.5V17Z"
        fill="currentColor"
      />
    </svg>
  );
}
