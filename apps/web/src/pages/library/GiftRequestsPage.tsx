import { GiftRequestList } from '../../features/library';

/**
 * `/library/gift-requests` — 증정 요청 **상태 확인 전용** (FR-22 · PRD §13).
 * Library Design Spec §7.3 — **Figma 없음**, `C-13` ②(`L-OPEN-13`) 승인 명세다.
 *
 * 신청 CTA 는 이 화면에 없다 — 신청은 `BookDetailSheet` 에서 한다
 * (`stage-3-design-spec.md` §2.11 유지).
 */
export function GiftRequestsPage() {
  return <GiftRequestList />;
}
