import { BRAND_MARKS, type BrandMarkName } from './registry';

export interface BrandMarkProps {
  name: BrandMarkName;
}

/**
 * 브랜드 마크 렌더러 — 결정 `D-15`.
 *
 * **장식 요소다.** 접근성 이름은 버튼 라벨("Continue with Apple" · "Continue with Google")이
 * 갖는다. 그래서 `label` prop 이 없고 내부 `<svg>` 는 `aria-hidden` 이다.
 * 색·크기·비율을 prop 으로 열지 않는다 — 브랜드 규격을 코드에서 흔들 수 없게 하기 위함이다.
 */
export function BrandMark({ name }: BrandMarkProps) {
  const Mark = BRAND_MARKS[name];
  return <Mark />;
}
