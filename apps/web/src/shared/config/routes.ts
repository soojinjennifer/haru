/**
 * Route 경로 상수 — Plan §5.4.
 *
 * Stage 1 route 는 `/`(임시 placeholder) 와 `*`(NotFound) 뿐이다.
 * 실제 화면 route 는 Stage 2 이후에 추가한다.
 *
 * dev UI gallery(`/__dev/ui/*`)의 경로는 **여기에 두지 않는다.** 이 객체는 Production 번들에
 * 그대로 남으므로, 경로 문자열도 dev 에서만 존재하도록 `app/router.tsx` 의 가드 안에 인라인한다
 * (AC-1-42 — 산출물에 dev 흔적 0건).
 */
export const ROUTES = {
  home: '/',
  notFound: '*',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
