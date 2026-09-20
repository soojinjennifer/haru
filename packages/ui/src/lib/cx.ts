/**
 * className 결합 헬퍼.
 *
 * `packages/ui` 는 외부에서 `className` 을 받지 않는다 (토큰 외 스타일 주입 차단 —
 * rules/frontend.md §6). 이 함수는 컴포넌트 내부의 조건부 modifier 조합에만 쓴다.
 */
export type ClassValue = string | false | null | undefined;

export function cx(...values: ClassValue[]): string {
  return values
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
}
