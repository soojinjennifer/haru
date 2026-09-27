/**
 * `me` query key factory — `.claude/rules/frontend.md` §4 "Query key 는 entity 별 factory".
 *
 * key 문자열을 화면·테스트에 흩어 쓰지 않는다. 무효화 범위도 여기에서 정한다.
 */
export const meKeys = {
  all: ['me'] as const,
  detail: () => [...meKeys.all, 'detail'] as const,
} as const;

export type MeQueryKey = ReturnType<typeof meKeys.detail>;
