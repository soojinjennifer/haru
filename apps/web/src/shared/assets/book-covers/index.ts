/**
 * 책 표지 — **Mock 전용 중립 대체 표지** (Stage 8 `S8-I`, 결정 `N8-13` ⓐ · `D8-1`).
 *
 * Stage 3 에서는 Figma 노드의 **상용 그림책 표지** 이미지를 Mock 임시 에셋으로 썼다
 * (사용자 지시 2026-10-05, `stage-3-approvals.md` §12.12). 그 표지가 Mock 데모 웹 프리뷰(C-18)에
 * 노출되지 않도록(`P3-BIP-19` · `R8-04`) **무늬·글자 없는 단색 표지**로 바꿨다.
 *
 * - 마스터 PNG 는 `pnpm assets:optimize` 가 **생성**한다 (`scripts/assets-optimize.mjs` `COVER_SPECS`).
 *   손으로 그리거나 편집하지 않는다. 검사 = `pnpm assets:optimize --check`.
 * - 색 = design-tokens palette 원시값 (`--haru-palette-teal` · `-orange` · `-indigo`).
 * - 216 × 309 (`--book-cover-aspect` 7/10 · `D-4` 상한 216 — 서재 캐러셀 약 107px 의 2배).
 *
 * ⚠ **Backend 연동 시 전부 교체된다.** 실제 표지는 서버가 `BookSummary.coverUrl` 로 내려주며
 * (`P3-BIP-15`·`P3-BIP-02`), 그때 이 디렉토리와 `mocks/fixtures/saved-books.ts` 의 매핑을
 * 지운다. 화면 코드는 `coverUrl` 만 보므로 교체 범위가 Mock 레이어 안에 갇혀 있다.
 */
import neutralCoverIndigo from './neutral-cover-indigo.png';
import neutralCoverOrange from './neutral-cover-orange.png';
import neutralCoverTeal from './neutral-cover-teal.png';

export const BOOK_COVER_ASSETS = {
  'neutral-cover-teal': neutralCoverTeal,
  'neutral-cover-orange': neutralCoverOrange,
  'neutral-cover-indigo': neutralCoverIndigo,
} as const;

export type BookCoverAssetName = keyof typeof BOOK_COVER_ASSETS;
