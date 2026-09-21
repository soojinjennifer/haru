/**
 * `health` query key factory — `.claude/rules/frontend.md` §4
 * "Query key 는 entity 별 factory".
 *
 * key 문자열을 화면·테스트에 흩어 쓰지 않는다. 무효화(invalidate) 범위도 여기에서 정한다.
 */
export const healthKeys = {
  all: ['health'] as const,
  status: () => [...healthKeys.all, 'status'] as const,
} as const;

export type HealthQueryKey = ReturnType<typeof healthKeys.status>;
