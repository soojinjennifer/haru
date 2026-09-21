/**
 * `haru:tab-center-home` — Design Spec §8.2 (Figma `140:2971` = `140:2935` 원 + `140:2950` home 글리프).
 *
 * `icon/haru/tab-center-home.svg` 의 **코드 대응본**이다. 두 파일이 어긋나지 않도록
 * `__tests__/haru-icons.test.tsx` 가 viewBox 와 path 데이터를 비교한다.
 * (`.svg` 를 React 컴포넌트로 바꾸는 번들러 플러그인을 도입하지 않기 위한 구조 —
 *  `packages/ui` 는 소스 그대로 소비된다.)
 *
 * §8.3 규격: 합성 아이콘이므로 viewBox `0 0 64 64` 유지, 루트 width/height 제거,
 * 색은 Figma 원본과 **같은 값**의 semantic 토큰을 참조한다 (원 = `--color-action-primary-bg`
 * ← `--haru-palette-teal`, 글리프 = `--color-fg-on-accent` ← `--haru-white`. 2026-09-20 대조 확인).
 * Figma 의 drop shadow 는 아이콘이 아니라 CSS(`--shadow-rest`)가 담당한다.
 */
export function TabCenterHome() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <circle cx="32" cy="32" r="32" fill="var(--color-action-primary-bg)" />
      <g
        transform="translate(20 20)"
        stroke="var(--color-fg-on-accent)"
        strokeWidth="1.58333"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 11.5L12 4L21 11.5" />
        <path d="M5.5 10V19C5.5 19.3978 5.65803 19.7794 5.93934 20.0607C6.22064 20.342 6.60217 20.5 7 20.5H17C17.3978 20.5 17.7794 20.342 18.0607 20.0607C18.342 19.7794 18.5 19.3978 18.5 19V10" />
      </g>
    </svg>
  );
}
