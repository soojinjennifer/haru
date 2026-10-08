import { LibraryEntryActions, LibraryShelves } from '../../features/library';

/**
 * `/library` — Library Design Spec §2.2 (Figma `30:74` L-1 · `145:1141` L-2 합성) + §7.1.
 *
 * ```
 * LibraryShelves          4섹션 (+ 시트 2종의 열림 상태를 소유한다)
 * ↓ 16  (--space-4 — 다른 섹션 간격과 같다)
 * LibraryEntryActions     /library/add · /library/gift-requests 진입점
 * ```
 *
 * Page 는 **Composition 만** 한다 (`rules/frontend.md` §3) — API 호출·상태 전이·Mock 데이터가
 * 없다. 제목 행은 `LibraryTopBar` 가 router 의 TopBar 슬롯에서 담당한다.
 *
 * ── 진입점을 `LibraryShelves` **밖**에 둔 이유 ──
 * 서재 조회가 실패하거나 로딩 중일 때도 `/library/add` · `/library/gift-requests` 로 갈 수
 * 있어야 한다. `LibraryShelves` 안에 넣으면 Loading·Error 분기에서 함께 사라진다.
 * 섹션 간격 16 은 이 래퍼의 `gap` 이 만든다 — Figma 의 Frame 15 gap 과 같은 값이다.
 *
 * 하단에 탭바 관련 padding 을 넣지 않는다 (§2.1 이중 계상 금지 — `.haru-app-shell__bar-bottom`
 * 의 중앙 버튼 overhang 이 "마지막 블록 → 탭바 32" 를 이미 확보한다).
 */
export function LibraryPage() {
  return (
    <div className="flex flex-col gap-4">
      <LibraryShelves />
      <LibraryEntryActions />
    </div>
  );
}
