import { AddOwnBookForm } from '../../features/library';

/**
 * `/library/add` — 보유 책 직접 등록 (FR-23 · PRD §7.2).
 * Library Design Spec §7.2 — **Figma 없음**, `C-13` ②(`L-OPEN-13`)로 승인된 design-agent 명세다.
 *
 * Page 는 **Composition 만** 한다. TopBar 는 `AddOwnBookTopBar` 가 router 슬롯에서 담당한다.
 */
export function AddOwnBookPage() {
  return <AddOwnBookForm />;
}
