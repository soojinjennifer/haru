import { LibraryShelves } from '../../features/library';

/**
 * `/library` — Library Design Spec §2.2 (Figma `30:74` L-1 · `145:1141` L-2 합성).
 *
 * Stage 3 1차의 skeleton(`EmptyState` 1개)을 **대체**한다.
 *
 * Page 는 **Composition 만** 한다 (`rules/frontend.md` §3) — API 호출·상태 전이·Mock 데이터가
 * 없다. 제목 행은 `LibraryTopBar` 가 router 의 TopBar 슬롯에서 담당한다.
 *
 * 하단에 탭바 관련 padding 을 넣지 않는다 (§2.1 이중 계상 금지 — `.haru-app-shell__bar-bottom`
 * 의 중앙 버튼 overhang 이 "마지막 블록 → 탭바 32" 를 이미 확보한다).
 *
 * `LibraryShelfSheet` · `BookDetailSheet` · 진입점(`/library/add` · `/library/gift-requests`) 은
 * **다음 작업**이다 — 그래서 `onSeeAll` 을 넘기지 않는다.
 */
export function LibraryPage() {
  return <LibraryShelves />;
}
