/**
 * 책 표지 — **Mock 전용 표지 에셋** (Stage 8 `D8-7`, 2026-11-21 — `N8-13` ⓐ 중립 대체를 번복).
 *
 * Figma(디자이너 화면)에 그려진 그림책 표지 image fill 원본이다 (웹 수집 0). 근거와 출처 노드는
 * `docs/design/stage-8-visual-gap.md` `## D8-7 표지 복원 목록`. Figma 에 표지가 없는 책은
 * `BookCover` placeholder 로 그린다.
 *
 * - 상용 표지이므로 **공개 배포 금지** — Mock 데모 웹 프리뷰(C-18)는 Cloudflare Access 로 초대된
 *   사람만 본다. 정식 출시 전 법무 확인 `P3-BIP-19`.
 * - 마스터 PNG 는 `pnpm assets:optimize` 가 상한 360 (`D-4`)으로 줄인다. 검사 = `pnpm assets:optimize --check`.
 *
 * ⚠ **Backend 연동 시 전부 교체된다.** 실제 표지는 서버가 `BookSummary.coverUrl` 로 내려주며
 * (`P3-BIP-15`·`P3-BIP-02`), 그때 이 디렉토리와 `mocks/fixtures/book-covers.ts` 의 매핑을
 * 지운다. 화면 코드는 `coverUrl` 만 보므로 교체 범위가 Mock 레이어 안에 갇혀 있다.
 */
import grumpyMonkeyPlayAllDay from './grumpy-monkey-play-all-day.png';
import theMostMagnificentIdea from './the-most-magnificent-idea.png';
import whereTheWildThingsAre from './where-the-wild-things-are.png';

export const BOOK_COVER_ASSETS = {
  'where-the-wild-things-are': whereTheWildThingsAre,
  'the-most-magnificent-idea': theMostMagnificentIdea,
  'grumpy-monkey-play-all-day': grumpyMonkeyPlayAllDay,
} as const;

export type BookCoverAssetName = keyof typeof BOOK_COVER_ASSETS;
