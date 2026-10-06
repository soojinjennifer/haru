/**
 * `useCurrentChildId` — 현재 보호자의 아이 id. MVP 는 **Child Profile 1명**이다
 * (CLAUDE.md 전제 · `rules/architecture.md` §9).
 *
 * ```
 * (feature) → useCurrentChildId → useMe → meApi.get → MockMeApi | HttpMeApi
 * ```
 *
 * Stage 3 의 모든 아동 범위 endpoint 가 `:childId` 를 받으므로 그 값을 **한 곳에서** 읽는다.
 * 화면·feature 가 `me.child?.id` 를 각자 파헤치면 "온보딩 전에는 없다" 라는 사실이 흩어진다.
 *
 * 온보딩이 끝나기 전에는 `undefined` 다 — 그 상태에서 아동 범위 요청을 **보내지 않는다**
 * (Route Guard 가 이미 온보딩으로 되돌리지만, 요청을 막는 책임은 여기에도 둔다).
 */
import { useMe } from './useMe';

export function useCurrentChildId(): string | undefined {
  const { me } = useMe();
  return me?.child?.id;
}
